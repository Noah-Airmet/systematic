import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf-8');
const env: Record<string, string> = {};
for (const line of envContent.split('\n')) {
    const [key, ...vals] = line.split('=');
    if (key && vals.length > 0) {
        env[key.trim()] = vals.join('=').trim();
    }
}

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    const { data: systems } = await supabase.from('systems').select('id').limit(1);
    if (!systems || systems.length === 0) {
        console.log("No systems found to test with.");
        return;
    }
    const system_id = systems[0].id;

    const insertPayload = {
        system_id,
        tier_id: 'layer_1',
        title: 'Test Node',
        description: '',
        notes: '',
        x_position: 0,
        y_position: 0,
        grounds: '',
        warrant: '',
        backing: '',
        qualifier: null,
        rebuttal: '',
        epistemic_sources: []
    };

    const { data, error } = await supabase.from('nodes').insert(insertPayload).select('*').single();
    if (error) {
        console.error("Insert Error:", error);
    } else {
        console.log("Insert Success:", data.id);
    }
}

testInsert();
