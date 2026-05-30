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

  // O endpoint de token da LivePix NÃO usa /v2 no caminho do token, mas usa nos outros recursos.
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
    throw new Error(`Failed to get LivePix access token: ${response.statusText} (${response.status})`);
  }

  const data = (await response.json()) as LivePixTokenResponse;
  return data.access_token;
}

export async function createLivePixPayment(amountInCents: number, metadata: Record<string, any>) {
  const token = await getLivePixAccessToken();
  const amount = amountInCents / 100;

  // Recursos usam /v2, o token não.
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
