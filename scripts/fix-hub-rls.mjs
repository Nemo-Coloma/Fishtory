/**
 * Fix Hub RLS Policies for Public Access
 * This script updates RLS policies to allow public SELECT access to hub tables
 * 
 * Run: node scripts/fix-hub-rls.mjs
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables:');
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
    console.error('\nPlease ensure these are set in your .env.local file.');
    process.exit(1);
}

// Extract the project ref from the URL
const projectRef = new URL(supabaseUrl).hostname.split('.')[0];

async function runSQL(sql) {
    const mgmtUrl = `https://${projectRef}.supabase.co/pg/query`;
    
    console.log('📡 Connecting to Supabase SQL endpoint...');
    
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
    
    console.error('❌ Failed to execute SQL');
    console.error('Status:', response.status, response.statusText);
    const text = await response.text();
    console.error('Response:', text.substring(0, 500));
    return null;
}

async function fixHubRLS() {
    console.log('🔧 Fixing Hub RLS Policies for Public Access\n');
    console.log('This script will update RLS policies to allow public SELECT access');
    console.log('to hub_programs, hub_announcements, and hub_market_prices tables.\n');
    
    const sql = readFileSync('HUB_PUBLIC_ACCESS_FIX.sql', 'utf-8');
    const result = await runSQL(sql);
    
    if (result !== null) {
        console.log('\n✅ Hub RLS policies updated successfully!');
        console.log('\n📝 Summary:');
        console.log('   - hub_programs: Public can now VIEW, authenticated users can WRITE');
        console.log('   - hub_announcements: Public can now VIEW, authenticated users can WRITE');
        console.log('   - hub_market_prices: Public can now VIEW, authenticated users can WRITE');
        console.log('\n🔄 The public hub page (/hub) should now display data correctly.');
        return true;
    }
    
    console.log('\n⚠️  Could not run SQL via API.');
    console.log('📋 Please run HUB_PUBLIC_ACCESS_FIX.sql manually in Supabase SQL Editor:');
    console.log(`   https://${projectRef}.supabase.co/project/${projectRef}/sql/new`);
    return false;
}

fixHubRLS().catch(console.error);