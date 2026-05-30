const clientId = process.env.LIVEPIX_CLIENT_ID;
const clientSecret = process.env.LIVEPIX_CLIENT_SECRET;

async function testAuth() {
  const url = "https://oauth.livepix.gg/oauth2/token";
  console.log(`Testing auth at: ${url}`);
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId!,
      client_secret: clientSecret!,
      scope: "payments:write"
    }),
  });

  console.log(`Status: ${response.status}`);
  const text = await response.text();
  console.log(`Response: ${text}`);
}

testAuth();
