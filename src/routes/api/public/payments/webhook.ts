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

const DURATION_MAP: Record<string, string> = {
  'price_1TbXLaDgmvJ4Q2O6idYoTXFJ': '5min',
  'price_1TbXLZDgmvJ4Q2O6Mxs8Ia3v': '1d',
  'price_1TbXLZDgmvJ4Q2O66me1RzwB': '7d',
  'price_1TbXLYDgmvJ4Q2O6YrA9zxs3': '30d',
  'price_1TbXLYDgmvJ4Q2O61rlPDyRk': 'lifetime',
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

  const { error } = await getSupabase().from('license_keys').insert({
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
  console.log('LivePix Webhook Body:', JSON.stringify(body));

  // O webhook da LivePix envia um evento 'new' quando um pagamento é criado ou concluído
  // No caso de integração simples, idealmente monitoramos o status se for enviado
  // De acordo com a doc, recebemos userId, clientId, event, resource
  if (body.event === 'new' && body.resource?.type === 'payment') {
    // Para simplificar e garantir a entrega, o ideal é o LivePix enviar o status de pago.
    // Se for apenas notificação de criação, precisamos verificar o pagamento via API.
    // Por agora, assumiremos que se o evento é enviado e o usuário já caiu na success_url,
    // vamos processar (ou podemos implementar a verificação real se o LivePix tiver o ID do pagamento).
    
    // IMPORTANTE: Para LivePix, precisamos salvar os metadados (userId, priceId) em algum lugar
    // ou usar a 'reference' que enviamos na criação.
    const reference = body.resource?.id;
    // Precisamos de uma forma de recuperar userId e priceId a partir da referência ou metadados
    // A doc do webhook diz que envia 'resource' com 'id' (referência).
    
    // TODO: Implementar busca dos metadados salvos ou confiar nos dados do webhook se disponíveis.
    // Como ainda não salvamos a referência em uma tabela de 'pending_payments', vou precisar 
    // que o sistema de webhook seja mais robusto.
  }
}

export const Route = createFileRoute('/api/public/payments/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const source = url.searchParams.get('source');

        try {
          if (source === 'livepix') {
            await handleLivePixWebhook(request);
            return Response.json({ received: true });
          }

          // Fluxo padrão Stripe
          const rawEnv = url.searchParams.get('env');
          if (rawEnv !== 'live') {
            return new Response('Only live webhook events are accepted', { status: 400 });
          }
          const env: StripeEnv = rawEnv;
          
          const event = await verifyWebhook(request, env);
          if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.client_reference_id;
            const priceId = session.metadata?.priceId;

            if (userId && priceId) {
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
