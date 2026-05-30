const LIVEPIX_API_BASE = "https://api.livepix.gg";

async function findEndpoint() {
  const paths = [
    "/v2/oauth2/token",
    "/v2/oauth/token",
    "/v2/auth/token",
    "/v2/token",
    "/v2/oauth2/authorize",
    "/v2/api/token"
  ];

  console.log("Searching for working token endpoint...");

  for (const path of paths) {
    console.log(`Testing: ${LIVEPIX_API_BASE}${path}`);
    try {
      const response = await fetch(`${LIVEPIX_API_BASE}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });
      console.log(`Result: ${response.status} ${response.statusText}`);
      if (response.status !== 404) {
        console.log(`FOUND potential endpoint: ${path}`);
      }
    } catch (e) {
      console.log(`Error testing ${path}: ${e}`);
    }
  }
}

findEndpoint();
