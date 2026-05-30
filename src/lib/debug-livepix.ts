import { getLivePixAccessToken, createLivePixPayment } from "./livepix.server";

async function runDebug() {
  console.log("--- LIVEPIX DEBUG START ---");
  
  // 1. Check Env Vars
  console.log("Checking Environment Variables...");
  const clientId = process.env.LIVEPIX_CLIENT_ID;
  const clientSecret = process.env.LIVEPIX_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    console.error("FAIL: LIVEPIX_CLIENT_ID or LIVEPIX_CLIENT_SECRET is missing!");
    return;
  }
  console.log("SUCCESS: Environment variables found.");

  // 2. Test Access Token
  console.log("\nAttempting to get Access Token...");
  try {
    const token = await getLivePixAccessToken();
    console.log("SUCCESS: Access Token received.");
  } catch (error) {
    console.error("FAIL: Could not get access token.");
    console.error("Error details:", error instanceof Error ? error.message : error);
  }

  // 3. Test Payment Creation (Small amount)
  console.log("\nAttempting to create a test payment (R$ 1.00)...");
  try {
    const payment = await createLivePixPayment(100, {
      userId: "00000000-0000-0000-0000-000000000000", // Dummy UUID for testing
      priceId: "debug-test-price"
    });
    console.log("SUCCESS: Payment created!");
    console.log("Payment Object:", JSON.stringify(payment, null, 2));
  } catch (error) {
    console.error("FAIL: Could not create payment.");
    console.error("Error details:", error instanceof Error ? error.message : error);
  }

  console.log("\n--- LIVEPIX DEBUG END ---");
}

runDebug();
