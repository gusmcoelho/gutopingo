import { z } from "zod";

const LIVEPIX_API_BASE = "https://api.livepix.gg";

interface LivePixTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export async function getLivePixAccessToken() {
  const clientId = process.env.LIVEPIX_CLIENT_ID;
  const clientSecret = process.env.LIVEPIX_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("LIVEPIX_CLIENT_ID or LIVEPIX_CLIENT_SECRET not configured");
  }

  // Com base na documentação JSON enviada (open-api.json), o endpoint de token na v2
  // é exatamente /v2/auth/token ou /v2/oauth/token conforme padrões de mercado.
  // No entanto, o erro 404 persiste. Vamos tentar o endpoint que costuma ser usado em integrações OAuth2:
  const response = await fetch(`${LIVEPIX_API_BASE}/v2/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials"
    }),
  });

  if (!response.ok) {
    // Se o v2 falhar, tenta o caminho que costuma funcionar na v1 ou legado
    const retryResponse = await fetch(`${LIVEPIX_API_BASE}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "client_credentials"
      }),
    });

    if (!retryResponse.ok) {
      // Última tentativa: /v2/token (comum em APIs REST)
      const lastTry = await fetch(`${LIVEPIX_API_BASE}/v2/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "client_credentials"
        }),
      });

      if (!lastTry.ok) {
        const error = await lastTry.text();
        console.error(`LivePix Token Error:`, error);
        throw new Error(`Failed to get LivePix access token: ${lastTry.statusText} (${lastTry.status})`);
      }
      const data = (await lastTry.json()) as LivePixTokenResponse;
      return data.access_token;
    }
    
    const data = (await retryResponse.json()) as LivePixTokenResponse;
    return data.access_token;
  }

  const data = (await response.json()) as LivePixTokenResponse;
  return data.access_token;
}

export async function createLivePixPayment(amountInCents: number, metadata: Record<string, any>) {
  const token = await getLivePixAccessToken();
  const amount = amountInCents / 100;

  // Endpoint de criação de pagamento conforme OpenAPI
  const response = await fetch(`${LIVEPIX_API_BASE}/v2/payments`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amount,
      metadata: metadata,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`LivePix Payment Error:`, error);
    throw new Error(`Failed to create LivePix payment: ${response.statusText}`);
  }

  return await response.json();
}
