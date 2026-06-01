import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";
import { createLivePixPayment } from "@/lib/livepix.server";

const ALLOWED_PRICE_IDS = new Set([
  "price_1TbXLaDgmvJ4Q2O6idYoTXFJ",
  "price_1TbXLZDgmvJ4Q2O6Mxs8Ia3v",
  "price_1TbXLZDgmvJ4Q2O66me1RzwB",
  "price_1TbXLYDgmvJ4Q2O6YrA9zxs3",
  "price_1TbXLYDgmvJ4Q2O61rlPDyRk",
]);

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        priceId: z
          .string()
          .refine((id) => ALLOWED_PRICE_IDS.has(id), { message: "Invalid price ID" }),
        method: z.enum(["stripe", "pix"]).default("stripe"),
        currency: z.enum(["brl", "usd", "try"]).default("brl"),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { priceId, method, currency } = data;
    
    try {
      console.log(`DEBUG: createCheckoutSession called for priceId: ${priceId}, method: ${method}, currency: ${currency}`);
      
      const priceMap: Record<string, Record<string, number>> = {
        "price_1TbXLaDgmvJ4Q2O6idYoTXFJ": { brl: 500, usd: 1000, try: 45850 },     // Teste
        "price_1TbXLZDgmvJ4Q2O6Mxs8Ia3v": { brl: 2000, usd: 4000, try: 183410 },   // 1 dia
        "price_1TbXLZDgmvJ4Q2O66me1RzwB": { brl: 4500, usd: 9000, try: 412670 },   // 1 semana
        "price_1TbXLYDgmvJ4Q2O6YrA9zxs3": { brl: 10000, usd: 20000, try: 917050 }, // 30 dias
        "price_1TbXLYDgmvJ4Q2O61rlPDyRk": { brl: 16999, usd: 34000, try: 1558910 },// Vitalício
      };

      const productNameMap: Record<string, string> = {
        "price_1TbXLaDgmvJ4Q2O6idYoTXFJ": "Guto Pingo - 5 Minutos",
        "price_1TbXLZDgmvJ4Q2O6Mxs8Ia3v": "Guto Pingo - 1 Dia",
        "price_1TbXLZDgmvJ4Q2O66me1RzwB": "Guto Pingo - 1 Semana",
        "price_1TbXLYDgmvJ4Q2O6YrA9zxs3": "Guto Pingo - 30 Dias",
        "price_1TbXLYDgmvJ4Q2O61rlPDyRk": "Guto Pingo - Vitalício",
      };

      if (method === "pix") {
        const amount = priceMap[priceId]?.[currency] || (currency === 'brl' ? 1000 : currency === 'usd' ? 200 : 9000);
        const payment = await createLivePixPayment(amount, {
          userId,
          priceId,
        });
        // LivePix returns a URL to the checkout/payment page
        return { checkoutUrl: payment.checkoutUrl };
      }

      const env = (process.env.STRIPE_ENV === 'live') ? 'live' : 'sandbox';
      const stripe = createStripeClient(env);
      const baseUrl = process.env.LOVABLE_APP_URL || process.env.APP_URL || 'https://zdxxhjjnkyboegerdoxl.lovable.app';
      const amount = priceMap[priceId]?.[currency] || 1000;
      const productName = productNameMap[priceId] || "Guto Pingo Key";

      // Se for BRL, tentamos usar o priceId original do Stripe para melhor integração (se ele existir no Stripe)
      // Caso contrário, ou se for outra moeda, usamos price_data para flexibilidade
      const lineItem = (currency === 'brl') 
        ? { price: priceId, quantity: 1 }
        : {
            price_data: {
              currency: currency,
              product_data: {
                name: productName,
              },
              unit_amount: amount,
            },
            quantity: 1,
          };

      const session = await stripe.checkout.sessions.create({
        line_items: [lineItem],
        mode: "payment",
        payment_method_types: ["card"],
        success_url: `${baseUrl}/?success=true&userId=${userId}&priceId=${priceId}`,
        cancel_url: `${baseUrl}/?canceled=true`,
        client_reference_id: userId,
        metadata: {
          userId,
          priceId
        }
      });

      if (!session.url) {
        throw new Error("Stripe session URL is missing");
      }

      return { checkoutUrl: session.url };
    } catch (error) {
      console.error("Payment Error:", error);
      return { error: error instanceof Error ? error.message : "Payment request failed" };
    }
  });
