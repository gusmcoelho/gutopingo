import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ priceId: z.string() }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { priceId } = data;

    // Lovable Connector Gateway API
    const response = await fetch(`https://api.lovable.app/v1/projects/6fab1e5e-c23a-43d5-987d-a0340f9a0883/payments/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        priceId,
        userId,
        successUrl: `${process.env.APP_URL || 'https://gutopingo.lovable.app'}/?success=true`,
        cancelUrl: `${process.env.APP_URL || 'https://gutopingo.lovable.app'}/?canceled=true`,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erro ao criar checkout: ${error}`);
    }

    return response.json(); // Retorna { checkoutUrl: string }
  });
