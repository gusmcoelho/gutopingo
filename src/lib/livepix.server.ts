import { z } from "zod";

// Base URL confirmada
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

  // O endpoint correto de OAuth2 na V2 costuma ser sem o prefixo /v2 se for centralizado,
  // ou /v2/oauth/token. Vou tentar o mais provável baseado nos testes de 401 que deram /v2/...
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
    // Se falhar, tenta sem o /v2 como fallback imediato
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
      const error = await retryResponse.text();
      console.error(`LivePix Token Error:`, error);
      throw new Error(`Failed to get LivePix access token: ${retryResponse.statusText}`);
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
