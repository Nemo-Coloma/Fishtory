import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function printSchema() {
    const url = `${supabaseUrl}/rest/v1/`;
    const response = await fetch(url, {
        headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
        }
    });
    
    if (!response.ok) {
        console.error('Failed:', response.status);
        return;
    }
    
    const schema = await response.json();
    for (const [tableName, definition] of Object.entries(schema.definitions)) {
        console.log(`\nTable: ${tableName}`);
        const properties = definition.properties || {};
        for (const [colName, colDef] of Object.entries(properties)) {
            console.log(`  - ${colName}: ${colDef.type} (${colDef.format || ''})`);
        }
    }
}

printSchema();
