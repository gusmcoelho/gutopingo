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
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { priceId, method } = data;
    
    try {
      console.log(`DEBUG: createCheckoutSession called for priceId: ${priceId}, method: ${method}`);
      
      const priceMap: Record<string, number> = {
        "price_1TbXLaDgmvJ4Q2O6idYoTXFJ": 500,   // R$ 5.00
        "price_1TbXLZDgmvJ4Q2O6Mxs8Ia3v": 2000,  // R$ 20.00
        "price_1TbXLZDgmvJ4Q2O66me1RzwB": 4500,  // R$ 45.00
        "price_1TbXLYDgmvJ4Q2O6YrA9zxs3": 10000, // R$ 100.00
        "price_1TbXLYDgmvJ4Q2O61rlPDyRk": 16999, // R$ 169.99
      };

      if (method === "pix") {
        const amount = priceMap[priceId] || 1000;
        const payment = await createLivePixPayment(amount, {
          userId,
          priceId,
        });
        // LivePix returns a URL to the checkout/payment page
        return { checkoutUrl: payment.checkoutUrl };
      }

      const env = 'live';
      const stripe = createStripeClient(env);
      const baseUrl = process.env.LOVABLE_APP_URL || process.env.APP_URL || 'https://zdxxhjjnkyboegerdoxl.lovable.app';

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: priceId, quantity: 1 }],
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
