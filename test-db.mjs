import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testTables() {
    console.log('Attempting sign in...');
    // Credentials from debug-supabase.mjs
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'fm2026001@fishtory.com',
        password: '@FM2026'
    });

    if (authError) {
        console.log('Auth Error:', authError.message);
        return;
    }
    console.log('Login Success! User Type:', authData.user.app_metadata?.role || 'No role in metadata');
    
    // Check staff profile
    const { data: staffProfile, error: staffError } = await supabase
        .from('staff_profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();
    
    if (staffError) console.log('Staff Profile Error:', staffError.message);
    else console.log('Staff Role:', staffProfile.role);

    console.log('\n--- Testing fisherman_registration ---');
    const { data: d1, error: e1 } = await supabase.from('fisherman_registration').select('*').limit(1);
    console.log('fisherman_registration error:', e1 ? e1.message : 'null');
    console.log('fisherman_registration data:', d1 ? d1.length : 0);

    console.log('\n--- Testing fishermen_profiles ---');
    const { data: d2, error: e2 } = await supabase.from('fishermen_profiles').select('*').limit(1);
    console.log('fishermen_profiles error:', e2 ? e2.message : 'null');
    console.log('fishermen_profiles data:', d2 ? d2.length : 0);
}

testTables();
