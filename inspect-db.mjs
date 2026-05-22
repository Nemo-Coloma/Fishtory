import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function inspect() {
    const url = `${supabaseUrl}/rest/v1/`;
    console.log('Fetching OpenAPI schema from:', url);
    
    const response = await fetch(url, {
        headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
        }
    });
    
    if (!response.ok) {
        console.error('Failed to fetch schema:', response.status, response.statusText);
        return;
    }
    
    const schema = await response.json();
    console.log('API Title:', schema.info?.title);
    console.log('API Version:', schema.info?.version);
    
    console.log('\n--- Exists Tables ---');
    console.log(Object.keys(schema.definitions || {}));
    
    console.log('\n--- Exists Paths (RPCs etc) ---');
    console.log(Object.keys(schema.paths || {}));
}

inspect();
