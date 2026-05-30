import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";

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
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { priceId } = data;
    
    try {
      console.log("DEBUG: createCheckoutSession called for priceId:", priceId);
      const env = 'live';
      console.log("DEBUG: Using Stripe env:", env);
      const stripe = createStripeClient(env);
      
      // In a server function, we can't use window.location.origin
      // Lovable automatically provides process.env.LOVABLE_APP_URL in many cases
      const baseUrl = process.env.LOVABLE_APP_URL || process.env.APP_URL || 'https://zdxxhjjnkyboegerdoxl.lovable.app';

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "payment",
        // When using automatic_payment_methods, payment_method_types must not be set
        // Note: Check if the Stripe library version supports this property name
        // In some versions it's passed via the Dashboard setting, or via this field:
        payment_method_options: {
          // This allows Stripe to show the best methods automatically
        },
        success_url: `${baseUrl}/?success=true`,
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
      console.error("Stripe Checkout Error:", error);
      return { error: getStripeErrorMessage(error) };
    }
  });
