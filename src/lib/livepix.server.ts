import { z } from "zod";

// URLs extraídas da documentação oficial enviada pelo usuário
const LIVEPIX_AUTH_URL = "https://oauth.livepix.gg/oauth2/token";
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

  // Requisição conforme documentação: POST https://oauth.livepix.gg/oauth2/token
  // Com parâmetros no corpo (x-www-form-urlencoded)
  const response = await fetch(LIVEPIX_AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: "account:read wallet:read webhooks payments:write" // Adicionado escopos baseados na doc
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`LivePix Auth Error (${response.status}):`, error);
    throw new Error(`Failed to get LivePix access token: ${response.statusText} (${response.status})`);
  }

  const data = (await response.json()) as LivePixTokenResponse;
  return data.access_token;
}

export async function createLivePixPayment(amountInCents: number, metadata: Record<string, any>) {
  const token = await getLivePixAccessToken();
  
  const baseUrl = process.env.LOVABLE_APP_URL || process.env.APP_URL || 'https://zdxxhjjnkyboegerdoxl.lovable.app';
  
  // Incluímos a referência personalizada para identificar o pagamento no webhook
  // O LivePix aceita 'reference' para bater depois
  const referenceId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const response = await fetch(`${LIVEPIX_API_BASE}/v2/payments`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountInCents,
      currency: "BRL",
      redirectUrl: `${baseUrl}/?success=true&userId=${metadata.userId}&priceId=${metadata.priceId}`,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`LivePix Payment Error (${response.status}):`, error);
    throw new Error(`Failed to create LivePix payment: ${response.statusText}`);
  }

  const result = await response.json();
  
  return {
    checkoutUrl: result.data?.redirectUrl,
    reference: result.data?.reference
  };
}
