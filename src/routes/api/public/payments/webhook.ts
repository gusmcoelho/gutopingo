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
  const licenseKey = `GUTO-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

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
  
  console.log(`License key successfully generated for user ${userId}`);
  return licenseKey;
}

async function handleLivePixWebhook(req: Request) {
  const body = await req.json();
  console.log('DEBUG: LivePix Webhook Received:', JSON.stringify(body));

  // O evento 'new' no recurso 'payment' indica que um pagamento foi recebido
  if (body.event === 'new' && body.resource?.type === 'payment') {
    const reference = body.resource?.reference;
    
    if (!reference) {
      console.warn('LivePix Webhook: Missing reference in payload');
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
          const rawEnv = url.searchParams.get('env');
          const env: StripeEnv = (rawEnv === 'live') ? 'live' : 'sandbox';
          
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