import { z } from "zod";

// Base URL confirmada pelo JSON enviado pelo usuário
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

  // Tentando o caminho padrão de OAuth2 que costuma ser omitido em documentações resumidas
  // ou o caminho que a documentação JSON indicar (se eu pudesse ver as chaves 'servers' ou 'paths')
  const response = await fetch(`${LIVEPIX_API_BASE}/oauth2/token`, {
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
    const error = await response.text();
    console.error(`LivePix Token Error (${response.status}):`, error);
    throw new Error(`Failed to get LivePix access token: ${response.statusText}`);
  }

  const data = (await response.json()) as LivePixTokenResponse;
  return data.access_token;
}

export async function createLivePixPayment(amountInCents: number, metadata: Record<string, any>) {
  const token = await getLivePixAccessToken();
  const amount = amountInCents / 100;

  const response = await fetch(`${LIVEPIX_API_BASE}/payments`, {
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
    console.error(`LivePix Payment Error (${response.status}):`, error);
    throw new Error(`Failed to create LivePix payment: ${response.statusText}`);
  }

  return await response.json();
}
