import { createFileRoute } from '@tanstack/react-router';
import { type StripeEnv, verifyWebhook } from '@/lib/stripe.server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

const DURATION_MAP: Record<string, string> = {
  'price_1TbXLaDgmvJ4Q2O6idYoTXFJ': '5min',
  'price_1TbXLZDgmvJ4Q2O6Mxs8Ia3v': '1d',
  'price_1TbXLZDgmvJ4Q2O66me1RzwB': '7d',
  'price_1TbXLYDgmvJ4Q2O6YrA9zxs3': '30d',
  'price_1TbXLYDgmvJ4Q2O61rlPDyRk': 'lifetime',
};

const PRICE_AMOUNT_MAP: Record<string, number> = {
  'price_1TbXLaDgmvJ4Q2O6idYoTXFJ': 500,
  'price_1TbXLZDgmvJ4Q2O6Mxs8Ia3v': 2000,
  'price_1TbXLZDgmvJ4Q2O66me1RzwB': 4500,
  'price_1TbXLYDgmvJ4Q2O6YrA9zxs3': 10000,
  'price_1TbXLYDgmvJ4Q2O61rlPDyRk': 16999,
};

async function generateLicenseKey(userId: string, priceId: string) {
  const duration = DURATION_MAP[priceId] || 'custom';
  
  // Prefixos solicitados pelo usuário:
  // 1 dia: 1DAY-...
  // 1 semana: 1WEEK-...
  // 30 dias: 30DAYS-...
  // Vitalício: LIFETIME-...
  // Teste: 5MIN-...
  let prefix = 'GUTO';
  if (duration === '5min') prefix = '5MIN';
  else if (duration === '1d') prefix = '1DAY';
  else if (duration === '7d') prefix = '1WEEK';
  else if (duration === '30d') prefix = '30DAYS';
  else if (duration === 'lifetime') prefix = 'LIFETIME';

  const licenseKey = `${prefix}-${crypto.randomBytes(4).toString('hex').toUpperCase()}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  let expiresAt: Date | null = new Date();
  if (duration === '5min') expiresAt.setMinutes(expiresAt.getMinutes() + 5);
  else if (duration === '1d') expiresAt.setDate(expiresAt.getDate() + 1);
  else if (duration === '7d') expiresAt.setDate(expiresAt.getDate() + 7);
  else if (duration === '30d') expiresAt.setDate(expiresAt.getDate() + 30);
  else if (duration === 'lifetime') expiresAt = null;

  const { error } = await supabaseAdmin.from('license_keys').insert({
    user_id: userId,
    key: licenseKey,
    duration: duration,
    expires_at: expiresAt ? expiresAt.toISOString() : null
  });

  if (error) {
    console.error('Erro ao inserir license_key:', error);
    throw error;
  }

  const redactedKey = `${licenseKey.slice(0, 6)}****`;
  console.log(`License key successfully generated for user ${userId}: ${redactedKey}`);

  // 3. Sincronização com Supabase EXTERNO
  const extUrl = "https://ekrohxcvmteacivyadnd.supabase.co";
  const extKey = process.env.EXTERNAL_SUPABASE_SERVICE_ROLE_KEY;

  if (extUrl && extKey) {
    try {
      await fetch(`${extUrl}/rest/v1/licenses`, {
        method: 'POST',
        headers: {
          'apikey': extKey,
          'Authorization': `Bearer ${extKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          key: licenseKey,
          status: 'active',
          max_devices: 1,
          expires_at: expiresAt ? expiresAt.toISOString() : null
        })
      });
      console.log(`License key ${redactedKey} synced to external database.`);
    } catch (e) {
      console.error("Erro ao sincronizar key com banco externo no webhook:", e);
    }
  }

  return licenseKey;
}

async function handleLivePixWebhook(req: Request) {
  // Verify shared-secret token in the URL (configured in LivePix webhook URL)
  const url = new URL(req.url);
  const providedToken = url.searchParams.get('token');
  const expectedToken = process.env.LIVEPIX_WEBHOOK_TOKEN;

  if (!expectedToken) {
    console.error('LIVEPIX_WEBHOOK_TOKEN is not configured — rejecting webhook');
    throw new Error('Webhook secret not configured');
  }

  if (!providedToken || providedToken.length !== expectedToken.length) {
    throw new Error('Invalid webhook token');
  }

  // Timing-safe comparison
  const a = Buffer.from(providedToken);
  const b = Buffer.from(expectedToken);
  if (!crypto.timingSafeEqual(a, b)) {
    throw new Error('Invalid webhook token');
  }

  const body = await req.json();
  console.log('DEBUG: LivePix Webhook Received (verified)');


  // O evento 'new' no recurso 'payment' indica que um pagamento foi recebido
  if (body.event === 'new' && body.resource?.type === 'payment') {
    const reference = body.resource?.externalId || body.resource?.reference;
    
    if (!reference) {
      console.warn('LivePix Webhook: Missing reference in payload');
      return;
    }

    // Validate reference format (LivePix uses LPX_<timestamp>_<chars>)
    if (typeof reference !== 'string' || !/^LPX_\d+_[A-Z0-9]+$/.test(reference)) {
      console.warn('LivePix Webhook: Invalid reference format');
      return;
    }

    console.log(`DEBUG: Processing LivePix payment for reference: ${reference}`);

    // Busca o intent de pagamento correspondente
    const { data: intent, error: fetchError } = await supabaseAdmin
      .from('payment_intents')
      .select('*')
      .eq('reference', reference)
      .eq('status', 'pending')
      .maybeSingle();

    if (fetchError || !intent) {
      console.warn(`LivePix Webhook: No pending intent found for reference: ${reference}`);
      return;
    }

    // 1. Marca como concluído para evitar processamento duplo
    const { error: updateError } = await supabaseAdmin
      .from('payment_intents')
      .update({ status: 'completed' })
      .eq('id', intent.id);

    if (updateError) {
      console.error('LivePix Webhook: Failed to update intent status', updateError);
      throw updateError;
    }

    // 2. Gera a chave
    await generateLicenseKey(intent.user_id, intent.price_id);
    console.log(`LivePix Webhook: Successfully processed payment for user ${intent.user_id}`);
  }
}

export const Route = createFileRoute('/api/public/payments/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const source = url.searchParams.get('source');

        console.log(`DEBUG: Webhook endpoint called. Source: ${source}`);

        try {
          if (source === 'livepix') {
            await handleLivePixWebhook(request);
            return Response.json({ received: true });
          }

          // Fluxo padrão Stripe
          const env: StripeEnv = (process.env.STRIPE_ENV === 'live') ? 'live' : 'sandbox';
          
          const event = await verifyWebhook(request, env);
          console.log(`DEBUG: Stripe Event Verified: ${event.type}`);

          if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = (session as any).client_reference_id;
            const priceId = (session as any).metadata?.priceId;
            const sessionId = (session as any).id;

            if (userId && priceId) {
              // Record sale in payment_intents for unified admin reporting
              await supabaseAdmin.from('payment_intents').insert({
                reference: `STRIPE_${sessionId}`,
                user_id: userId,
                price_id: priceId,
                provider: 'stripe',
                amount: PRICE_AMOUNT_MAP[priceId] || 0,
                status: 'completed',
              });
              await generateLicenseKey(userId, priceId);
            }
          }
          
          return Response.json({ received: true });
        } catch (err: any) {
          console.error(`Webhook error: ${err.message}`);
          return new Response(`Webhook Error: ${err.message}`, { status: 400 });
        }
      }
    }
  }
});