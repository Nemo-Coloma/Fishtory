/**
 * Create missing tables via Supabase REST API using the service role key.
 * This uses individual table creation commands via PostgREST-compatible calls.
 * 
 * Run: node scripts/create-tables.mjs
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// We'll use rpc to run SQL statements if an exec_sql function exists,
// otherwise we'll try to create tables using the Supabase SQL query API
async function tryExecSQL(sql) {
    // Method 1: Try via the /pg endpoint used by Supabase Studio
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ sql_text: sql }),
    });
    
    if (response.ok || response.status === 204) {
        return { success: true };
    }
    
    return { success: false, status: response.status, body: await response.text() };
}

async function main() {
    console.log('🔧 Attempting to create missing tables...\n');
    
    // Step 1: Create the exec_sql function first (needs superuser, may fail)
    console.log('Step 1: Creating exec_sql RPC function...');
    const createFnSQL = `
        CREATE OR REPLACE FUNCTION exec_sql(sql_text TEXT)
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
            EXECUTE sql_text;
        END;
        $$;
    `;
    
    // Try to call the function creation via the management API  
    const mgmtResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ sql_text: 'SELECT 1' }),
    });
    
    if (mgmtResponse.status === 404) {
        console.log('  ℹ️  exec_sql function does not exist yet.');
        console.log('  📋 You need to create it first in the Supabase SQL Editor.');
        console.log('  Run this SQL in your Supabase Dashboard → SQL Editor:\n');
        console.log('  ' + createFnSQL.trim().split('\n').join('\n  '));
        console.log('\n  Then run this script again, OR run COMPLETE_MIGRATION.sql directly.\n');
        
        // Alternative: try creating tables individually via fetch
        console.log('Attempting alternative: individual table creation via query API...\n');
        
        // Check which tables exist
        const schemaRes = await fetch(`${supabaseUrl}/rest/v1/`, {
            headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`
            }
        });
        const schema = await schemaRes.json();
        const existingTables = Object.keys(schema.definitions || {});
        console.log('Existing tables:', existingTables);
        
        const missingTables = [];
        const requiredTables = ['fishermen_profiles', 'hub_programs', 'hub_announcements', 'hub_stories', 'hub_extra_stats', 'hub_market_prices'];
        
        for (const table of requiredTables) {
            if (!existingTables.includes(table)) {
                missingTables.push(table);
            }
        }
        
        if (missingTables.length === 0) {
            console.log('\n✅ All required tables already exist!');
            console.log('You can now run: node scripts/setup-db.mjs');
            return;
        }
        
        console.log('Missing tables:', missingTables);
        console.log('\n' + '='.repeat(60));
        console.log('⚠️  MANUAL ACTION REQUIRED');
        console.log('='.repeat(60));
        console.log('\nPlease go to your Supabase Dashboard SQL Editor and run');
        console.log('the file: COMPLETE_MIGRATION.sql');
        console.log('\nDashboard URL:');
        console.log(`  https://supabase.com/dashboard/project/gxqhdqampmfxuahiiign/sql/new`);
        console.log('\nAfter running the migration, come back and run:');
        console.log('  node scripts/setup-db.mjs');
        console.log('='.repeat(60));
        return;
    }
    
    if (mgmtResponse.ok || mgmtResponse.status === 204) {
        console.log('  ✅ exec_sql function exists and works!');
        console.log('  Running full migration...\n');
        
        const { readFileSync } = await import('fs');
        const sql = readFileSync('COMPLETE_MIGRATION.sql', 'utf-8');
        
        // Split into individual statements
        const statements = sql
            .split(/;\s*\n/)
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const stmt of statements) {
            const result = await tryExecSQL(stmt + ';');
            if (result.success) {
                successCount++;
            } else {
                errorCount++;
                // Don't print errors for "already exists" type issues
                if (!result.body?.includes('already exists')) {
                    console.log(`  ⚠️  Statement failed:`, stmt.substring(0, 60) + '...');
                }
            }
        }
        
        console.log(`\n✅ Migration done: ${successCount} succeeded, ${errorCount} had issues (may be benign).`);
        console.log('Now run: node scripts/setup-db.mjs');
    }
}

main().catch(console.error);
