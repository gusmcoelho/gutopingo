import Stripe from 'stripe';

const connectionApiKey = process.env.STRIPE_LIVE_API_KEY;
const lovableApiKey = process.env.LOVABLE_API_KEY;
const GATEWAY_STRIPE_BASE = 'https://connector-gateway.lovable.dev/stripe';

const stripe = new Stripe(connectionApiKey!, {
  apiVersion: '2026-03-25.dahlia',
  httpClient: Stripe.createFetchHttpClient((input: string | Request | URL, init?: RequestInit) => {
    const urlString = input instanceof Request ? input.url : input.toString();
    const gatewayUrl = urlString.replace('https://api.stripe.com', GATEWAY_STRIPE_BASE);
    const headers = new Headers(init?.headers);
    headers.set('X-Connection-Api-Key', connectionApiKey!);
    headers.set('Lovable-API-Key', lovableApiKey!);
    return fetch(gatewayUrl, {
      method: init?.method || 'GET',
      headers: Object.fromEntries(headers.entries()),
      body: init?.body
    });
  }),
});

async function main() {
  try {
    const price = await stripe.prices.retrieve('price_1TbXLaDgmvJ4Q2O6idYoTXFJ');
    console.log('Price Info:', JSON.stringify(price, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
}
main();
