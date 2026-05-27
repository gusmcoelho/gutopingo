
const { createClient } = require('@supabase/supabase-js');

async function debugExternalSupabase() {
  const url = process.env.EXTERNAL_SUPABASE_URL;
  const key = process.env.EXTERNAL_SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("Missing EXTERNAL_SUPABASE_URL or EXTERNAL_SUPABASE_SERVICE_ROLE_KEY");
    return;
  }

  const supabase = createClient(url, key);

  console.log("--- Listing Tables in Public Schema ---");
  const { data: tables, error: tableError } = await supabase.rpc('get_tables'); 
  // If RPC doesn't exist, we try a direct query to pg_tables via a hack or just guess common names
  
  if (tableError) {
    console.log("Could not list tables via RPC, trying common table names...");
    const commonTables = ['keys', 'license_keys', 'pingo_keys', 'generated_keys', 'licenses'];
    for (const table of commonTables) {
      const { data, error, count } = await supabase.from(table).select('*', { count: 'exact', head: true }).limit(1);
      if (!error) {
        console.log(`Found table: ${table}`);
        const { data: columns } = await supabase.from(table).select('*').limit(1);
        console.log(`Structure of ${table}:`, columns ? Object.keys(columns[0] || {}) : "Empty table");
      }
    }
  } else {
    console.log("Tables:", tables);
  }
}

debugExternalSupabase();
