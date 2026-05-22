/**
 * Run SQL Migration via Supabase REST API
 * Uses the pg_net extension or direct REST SQL execution
 * 
 * Run: node scripts/run-migration.mjs
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing env vars');
    process.exit(1);
}

// Extract the project ref from the URL (e.g. gxqhdqampmfxuahiiign)
const projectRef = new URL(supabaseUrl).hostname.split('.')[0];

async function runSQL(sql) {
    // Use the Supabase SQL API endpoint for the project
    const url = `${supabaseUrl}/rest/v1/rpc/`;
    
    // Try using the pg_meta endpoint which allows running arbitrary SQL
    // via the Management API
    const mgmtUrl = `https://${projectRef}.supabase.co/pg/query`;
    
    console.log('Attempting SQL execution via pg query endpoint...');
    
    const response = await fetch(mgmtUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ query: sql }),
    });
    
    if (response.ok) {
        const result = await response.json();
        console.log('✅ SQL executed successfully');
        return result;
    }
    
    // Fallback: try the /rest/v1/rpc approach with a custom function
    console.log('Direct endpoint failed, trying alternative...');
    console.log('Status:', response.status, response.statusText);
    const text = await response.text();
    console.log('Response:', text.substring(0, 200));
    
    return null;
}

async function runMigrationInChunks() {
    console.log('🚀 Running COMPLETE_MIGRATION.sql...\n');
    
    const sql = readFileSync('COMPLETE_MIGRATION.sql', 'utf-8');
    
    // Split by sections (using the section markers)
    const sections = sql.split(/-- =+\n-- SECTION/).filter(Boolean);
    
    // Try running the full SQL first
    const result = await runSQL(sql);
    
    if (result !== null) {
        console.log('\n✅ Migration completed successfully!');
        return true;
    }
    
    console.log('\n⚠️  Could not run SQL via API.');
    console.log('📋 Please run COMPLETE_MIGRATION.sql manually in the Supabase SQL Editor:');
    console.log(`   ${supabaseUrl.replace('.co', '.co/project/' + projectRef + '/sql/new')}`);
    console.log('\n   After running the SQL, execute: node scripts/setup-db.mjs');
    return false;
}

runMigrationInChunks().catch(console.error);
