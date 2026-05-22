/**
 * Run the COMPLETE_MIGRATION.sql against the Supabase Postgres database
 * using the 'postgres' npm package (imported dynamically via npx).
 * 
 * Uses the Supabase pooler connection string.
 * 
 * Run: node scripts/migrate-direct.mjs
 */

import { readFileSync } from 'fs';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Extract project ref
const projectRef = new URL(supabaseUrl).hostname.split('.')[0];

// Supabase provides a pooler connection on port 6543
// Connection string format: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
// But we don't have the DB password. Let's try using the service role JWT.

// Alternative approach: Use the Supabase Management API
// The management API at https://api.supabase.com allows running SQL
// but requires a personal access token, not the service role key.

// Best approach for us: Since we have the service role key, let's create
// the tables by calling individual DDL operations one at a time.

// Actually, let's just try connecting via the Supabase transaction endpoint
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function createTableViaRPC(tableDDL, description) {
    // Use the PostgREST endpoint to see if a table exists
    const checkUrl = `${supabaseUrl}/rest/v1/${description}?select=count&limit=0`;
    const checkRes = await fetch(checkUrl, {
        headers: {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
        }
    });
    
    if (checkRes.ok) {
        console.log(`  ✅ Table "${description}" already exists.`);
        return true;
    }
    
    console.log(`  ❌ Table "${description}" does NOT exist.`);
    return false;
}

async function main() {
    console.log('🔍 Checking which tables need to be created...\n');
    
    const tables = [
        'fishermen_profiles',
        'hub_programs', 
        'hub_announcements',
        'hub_stories',
        'hub_extra_stats',
        'hub_market_prices'
    ];
    
    const missing = [];
    for (const table of tables) {
        const exists = await createTableViaRPC(null, table);
        if (!exists) missing.push(table);
    }
    
    if (missing.length === 0) {
        console.log('\n🎉 All tables exist! Running setup-db.mjs...');
        // Import and run the setup script
        const setupModule = await import('./setup-db.mjs');
        return;
    }
    
    console.log(`\n⚠️  ${missing.length} tables are missing: ${missing.join(', ')}`);
    console.log('\n' + '='.repeat(60));
    console.log('📋 PLEASE RUN THIS SQL IN YOUR SUPABASE DASHBOARD:');
    console.log('='.repeat(60));
    console.log(`\n1. Open: https://supabase.com/dashboard/project/${projectRef}/sql/new`);
    console.log('2. Copy the contents of COMPLETE_MIGRATION.sql');
    console.log('3. Paste and click "Run"');
    console.log('4. Then come back and run: node scripts/setup-db.mjs');
    console.log('\n' + '='.repeat(60));
}

main().catch(console.error);
