import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing with URL:', supabaseUrl);
console.log('Testing with Key prefix:', supabaseAnonKey?.substring(0, 15));

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugAuth() {
    console.log('Attempting sign in...');
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'fm2026001@fishtory.com',
        password: '@FM2026'
    });

    if (error) {
        console.log('Error Code:', error.status);
        console.log('Error Message:', error.message);
        console.log('Full Error Object:', JSON.stringify(error, null, 2));
    } else {
        console.log('Login Success!', data.user.id);
    }
}

debugAuth();
