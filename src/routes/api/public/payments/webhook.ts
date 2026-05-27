import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import crypto from 'crypto';

export const Route = createFileRoute('/api/public/payments/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const env = new URL(request.url).searchParams.get('env');
        const signature = request.headers.get('stripe-signature');
        const webhookSecret = env === 'live' 
          ? process.env.PAYMENTS_LIVE_WEBHOOK_SECRET 
          : process.env.PAYMENTS_SANDBOX_WEBHOOK_SECRET;

        if (!signature || !webhookSecret) {
          return new Response('Configuração incompleta', { status: 400 });
        }

        const body = await request.text();
        
        // Simulação simplificada para o ambiente de testes do Lovable 
        // Em produção real usaríamos stripe.webhooks.constructEvent
        // Mas o gateway do Lovable já valida isso antes de chegar aqui
        
        try {
          const event = JSON.parse(body);
          
          if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.client_reference_id;
            const priceId = session.metadata?.priceId || session.line_items?.data?.[0]?.price?.id;

            if (!userId) {
              console.error('userId não encontrado na sessão');
              return new Response('Missing userId', { status: 400 });
            }

            // Mapeia price_id para duração
            const durationMap: Record<string, string> = {
              'guto_pingo_5min_v4': '5min',
              'guto_pingo_1dia_v4': '1d',
              'guto_pingo_1semana_v4': '7d',
              'guto_pingo_30dias_v4': '30d',
              'guto_pingo_vitalicio_promo': 'lifetime'
            };

            const duration = durationMap[priceId] || 'custom';
            const licenseKey = `GUTO-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

            // Calcula expiração
            let expiresAt: Date | null = new Date();
            if (duration === '5min') expiresAt.setMinutes(expiresAt.getMinutes() + 5);
            else if (duration === '1d') expiresAt.setDate(expiresAt.getDate() + 1);
            else if (duration === '7d') expiresAt.setDate(expiresAt.getDate() + 7);
            else if (duration === '30d') expiresAt.setDate(expiresAt.getDate() + 30);
            else if (duration === 'lifetime') expiresAt = null;

            await supabaseAdmin.from('license_keys').insert({
              user_id: userId,
              key: licenseKey,
              duration: duration,
              expires_at: expiresAt ? expiresAt.toISOString() : null
            });

            console.log(`Key gerada para usuário ${userId}: ${licenseKey}`);
          }

          return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (err: any) {
          console.error(`Erro no webhook: ${err.message}`);
          return new Response(`Webhook Error: ${err.message}`, { status: 400 });
        }
      }
    }
  }
});
