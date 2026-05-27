import { createFileRoute } from '@tanstack/react-router';
import { createClient } from '@supabase/supabase-js';
import { type StripeEnv, verifyWebhook } from '@/lib/stripe.server';
import crypto from 'crypto';
import { Database } from '@/integrations/supabase/types';

let _supabase: ReturnType<typeof createClient<Database>> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
}

async function handleWebhook(req: Request, env: StripeEnv) {
  const event = await verifyWebhook(req, env);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id;
    const priceId = session.metadata?.priceId;

    if (!userId) {
      console.error('userId não encontrado na sessão');
      return;
    }

    const durationMap: Record<string, string> = {
      'price_test': '5min',
      'price_1day': '1d',
      'price_1week': '7d',
      'price_30days': '30d',
      'price_lifetime': 'lifetime',
      'guto_pingo_5min_v4': '5min',
      'guto_pingo_1dia_v4': '1d',
      'guto_pingo_1semana_v4': '7d',
      'guto_pingo_30dias_v4': '30d',
      'guto_pingo_vitalicio_promo': 'lifetime'
    };

    const duration = durationMap[priceId] || 'custom';
    const licenseKey = `GUTO-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    let expiresAt: Date | null = new Date();
    if (duration === '5min') expiresAt.setMinutes(expiresAt.getMinutes() + 5);
    else if (duration === '1d') expiresAt.setDate(expiresAt.getDate() + 1);
    else if (duration === '7d') expiresAt.setDate(expiresAt.getDate() + 7);
    else if (duration === '30d') expiresAt.setDate(expiresAt.getDate() + 30);
    else if (duration === 'lifetime') expiresAt = null;

    const { error } = await getSupabase().from('license_keys').insert({
      user_id: userId,
      key: licenseKey,
      duration: duration,
      expires_at: expiresAt ? expiresAt.toISOString() : null
    });

    if (error) {
      console.error('Erro ao inserir license_key:', error);
    } else {
      console.log(`License key successfully generated for user ${userId}`);
    }
  }
}

export const Route = createFileRoute('/api/public/payments/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get('env');
        if (rawEnv !== 'sandbox' && rawEnv !== 'live') {
          return new Response('Invalid env', { status: 400 });
        }
        const env: StripeEnv = rawEnv;

        try {
          await handleWebhook(request, env);
          return Response.json({ received: true });
        } catch (err: any) {
          console.error(`Webhook error: ${err.message}`);
          return new Response(`Webhook Error: ${err.message}`, { status: 400 });
        }
      }
    }
  }
});
