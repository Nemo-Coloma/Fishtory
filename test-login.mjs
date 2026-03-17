import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin(id, password) {
    const emailId = id.toLowerCase().replace(/[^a-z0-9]/g, '');
    const loginEmail = id.includes("@") ? id : `${emailId}@fishtory.com`;
    console.log(`Testing ID: '${id}' -> mapped email: '${loginEmail}'`);

    const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password
    });

    if (error) {
        console.error("Login failed:", error.message);
    } else {
        console.log("Login success! User ID:", data.user?.id);
    }
}

async function run() {
    await testLogin('fm2026001@fishtory.com', '@FM2026'); // Admin seed script uses fm2026001 (3 digits)
    await testLogin('FM-2026-001', '@FM2026');
    await testLogin('FM-2026-0001', '@FM2026');
    console.log("Done.");
}

run();
