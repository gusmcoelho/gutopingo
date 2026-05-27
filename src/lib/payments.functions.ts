import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ priceId: z.string() }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { priceId } = data;
    
    try {
      // Determinamos o ambiente (usamos sandbox em preview/dev por padrão)
      const env = process.env.NODE_ENV === 'production' ? 'live' : 'sandbox';
      const stripe = createStripeClient(env);
      
      const baseUrl = process.env.APP_URL || 'https://gutopingo.lovable.app';

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "payment",
        success_url: `${baseUrl}/?success=true`,
        cancel_url: `${baseUrl}/?canceled=true`,
        client_reference_id: userId,
        metadata: {
          userId,
          priceId
        }
      });

      return { checkoutUrl: session.url };
    } catch (error) {
      console.error("Stripe Checkout Error:", error);
      return { error: getStripeErrorMessage(error) };
    }
  });
