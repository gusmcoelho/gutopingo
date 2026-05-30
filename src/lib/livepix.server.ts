import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

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

  const response = await fetch(LIVEPIX_AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: "account:read wallet:read webhooks payments:write"
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

export async function createLivePixPayment(amountInCents: number, metadata: { userId: string, priceId: string }) {
  const token = await getLivePixAccessToken();
  
  const baseUrl = process.env.LOVABLE_APP_URL || process.env.APP_URL || 'https://zdxxhjjnkyboegerdoxl.lovable.app';
  
  // Custom reference to identify the payment in the webhook
  const referenceId = `LPX_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`.toUpperCase();

  console.log(`DEBUG: Creating LivePix payment with reference: ${referenceId} for user: ${metadata.userId}`);

  // Create a record in our database first
  const { error: dbError } = await supabaseAdmin.from('payment_intents').insert({
    reference: referenceId,
    user_id: metadata.userId,
    price_id: metadata.priceId,
    provider: 'livepix',
    amount: amountInCents,
    status: 'pending'
  });

  if (dbError) {
    console.error("Error saving payment intent:", dbError);
    throw new Error("Failed to initialize payment tracking");
  }

  const response = await fetch(`${LIVEPIX_API_BASE}/v2/payments`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountInCents,
      currency: "BRL",
      reference: referenceId, // Documentation says this is the field for correlation
      redirectUrl: `${baseUrl}/?success=true`,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`LivePix Payment Error (${response.status}):`, error);
    // Cleanup the intent if LivePix fails
    await supabaseAdmin.from('payment_intents').delete().eq('reference', referenceId);
    throw new Error(`Failed to create LivePix payment: ${response.statusText}`);
  }

  const result = await response.json();
  
  return {
    checkoutUrl: result.data?.redirectUrl,
    reference: referenceId
  };
}
