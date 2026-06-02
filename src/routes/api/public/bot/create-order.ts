import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import * as crypto from 'crypto';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { getLivePixAccessToken } from '@/lib/livepix.server';
import { createStripeClient, getStripeErrorMessage, type StripeEnv } from '@/lib/stripe.server';

// Mapa de planos (BRL, em centavos)
const PLAN_MAP: Record<string, { amount: number; name: string; duration: string }> = {
  '1day':    { amount: 2000,  name: 'Guto Pingo - 1 Dia',     duration: '1d' },
  '1week':   { amount: 4500,  name: 'Guto Pingo - 1 Semana',  duration: '7d' },
  '30days':  { amount: 10000, name: 'Guto Pingo - 30 Dias',   duration: '30d' },
  'lifetime':{ amount: 16999, name: 'Guto Pingo - Vitalício', duration: 'lifetime' },
};

const BodySchema = z.object({
  discord_id: z.string().min(1).max(64).regex(/^\d+$/),
  discord_username: z.string().min(1).max(64).optional(),
  plan_id: z.enum(['1day', '1week', '30days', 'lifetime']),
  method: z.enum(['pix', 'stripe']),
  bot_secret: z.string().min(8).max(512),
});

const LIVEPIX_API_BASE = 'https://api.livepix.gg';

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

export const Route = createFileRoute('/api/public/bot/create-order')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const expectedSecret = process.env.DISCORD_BOT_SECRET;
          if (!expectedSecret) {
            console.error('DISCORD_BOT_SECRET is not configured');
            return new Response('Server not configured', { status: 500 });
          }

          const raw = await request.json().catch(() => null);
          const parsed = BodySchema.safeParse(raw);
          if (!parsed.success) {
            return Response.json({ error: 'Invalid body', details: parsed.error.flatten() }, { status: 400 });
          }
          const { discord_id, discord_username, plan_id, method, bot_secret } = parsed.data;

          if (!safeEqual(bot_secret, expectedSecret)) {
            return new Response('Unauthorized', { status: 401 });
          }

          const plan = PLAN_MAP[plan_id];
          if (!plan) return Response.json({ error: 'Invalid plan' }, { status: 400 });

          // 1. Cria a row pending
          const { data: orderRow, error: insertErr } = await supabaseAdmin
            .from('bot_orders')
            .insert({
              discord_id,
              discord_username: discord_username || null,
              plan_id,
              method,
              amount_cents: plan.amount,
              currency: 'brl',
              status: 'pending',
            })
            .select()
            .single();

          if (insertErr || !orderRow) {
            console.error('bot_orders insert error:', insertErr);
            return Response.json({ error: 'Failed to create order' }, { status: 500 });
          }

          const orderId = orderRow.id as string;
          const baseUrl = process.env.LOVABLE_APP_URL || process.env.APP_URL || 'https://gutopingo.lovable.app';

          // 2. Cria pagamento
          if (method === 'pix') {
            const reference = `LPX_BOT_${Date.now()}_${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

            const token = await getLivePixAccessToken();
            const lpRes = await fetch(`${LIVEPIX_API_BASE}/v2/payments`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                amount: plan.amount,
                currency: 'BRL',
                externalId: reference,
                redirectUrl: `${baseUrl}/bot/paid?order=${orderId}`,
              }),
            });

            if (!lpRes.ok) {
              const txt = await lpRes.text();
              console.error('LivePix error:', lpRes.status, txt);
              await supabaseAdmin.from('bot_orders').update({ status: 'failed' }).eq('id', orderId);
              return Response.json({ error: 'LivePix payment failed' }, { status: 502 });
            }

            const lpJson: any = await lpRes.json();
            const checkoutUrl = lpJson?.data?.redirectUrl as string | undefined;

            await supabaseAdmin
              .from('bot_orders')
              .update({ payment_reference: reference, payment_url: checkoutUrl || null })
              .eq('id', orderId);

            return Response.json({
              order_id: orderId,
              method: 'pix',
              payment_url: checkoutUrl,
              amount_brl: plan.amount / 100,
              plan_name: plan.name,
            });
          }

          // method === 'stripe' (Cartão + PayPal)
          const env: StripeEnv = process.env.STRIPE_ENV === 'live' ? 'live' : 'sandbox';
          const stripe = createStripeClient(env);

          try {
            const session = await stripe.checkout.sessions.create({
              mode: 'payment',
              payment_method_types: ['card', 'paypal'],
              line_items: [{
                price_data: {
                  currency: 'brl',
                  product_data: { name: plan.name },
                  unit_amount: plan.amount,
                },
                quantity: 1,
              }],
              success_url: `${baseUrl}/bot/paid?order=${orderId}`,
              cancel_url: `${baseUrl}/bot/canceled?order=${orderId}`,
              client_reference_id: `BOT_${orderId}`,
              metadata: {
                bot_order_id: orderId,
                discord_id,
                plan_id,
              },
              payment_intent_data: {
                description: plan.name,
                metadata: {
                  bot_order_id: orderId,
                  discord_id,
                },
              },
            });

            if (!session.url) {
              throw new Error('Stripe session URL missing');
            }

            await supabaseAdmin
              .from('bot_orders')
              .update({
                payment_reference: `STRIPE_BOT_${session.id}`,
                payment_url: session.url,
              })
              .eq('id', orderId);

            return Response.json({
              order_id: orderId,
              method: 'stripe',
              payment_url: session.url,
              amount_brl: plan.amount / 100,
              plan_name: plan.name,
            });
          } catch (stripeErr) {
            console.error('Stripe error:', stripeErr);
            await supabaseAdmin.from('bot_orders').update({ status: 'failed' }).eq('id', orderId);
            return Response.json({ error: getStripeErrorMessage(stripeErr) }, { status: 502 });
          }
        } catch (err: any) {
          console.error('create-order fatal:', err);
          return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
        }
      },
    },
  },
});
