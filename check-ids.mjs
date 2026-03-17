import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkIds() {
    const { data, error } = await supabase
        .from('fishermen_profiles')
        .select('fisherman_id')
        .order('fisherman_id', { ascending: false })
        .limit(10);
    
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Latest Profile IDs:", data);
    }

    const { data: fishermenData, error: fishermenError } = await supabase
        .from('fishermen')
        .select('fisherman_id')
        .order('fisherman_id', { ascending: false })
        .limit(10);
    
    if (fishermenError) {
        console.error("Error fetching from fishermen:", fishermenError);
    } else {
        console.log("Latest Fishermen Registry IDs:", fishermenData);
    }
}

checkIds().then(() => console.log("Done"));
