import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function listAuthUsers() {
    console.log('Fetching auth users...');
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
        console.error('Error fetching auth users:', error);
    } else {
        console.log('Auth Users:');
        users.forEach(u => {
            console.log(`- Email: ${u.email}, ID: ${u.id}, Role: ${u.user_metadata?.role}, FullName: ${u.user_metadata?.full_name}, Metadata:`, u.user_metadata);
        });
    }
}

listAuthUsers();
