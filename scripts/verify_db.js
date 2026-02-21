import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
    const [key, ...vals] = line.split('=');
    if (key && vals.length > 0) {
        env[key.trim()] = vals.join('=').trim();
    }
}

const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);

async function verify() {
    const { data: systems } = await supabase.from('systems').select('id').limit(1);
    if (!systems || systems.length === 0) {
        console.log("No systems found.");
        return;
    }

    const insertPayload = {
        system_id: systems[0].id,
        tier_id: 'layer_1',
        title: 'Verification Node',
        confidence: 'exploring', // The previously missing column
        tags: ['test'], // The previously missing column
        scripture_refs: [], // The previously missing column
        x_position: 10,
        y_position: 10,
    };

    const { data, error } = await supabase.from('nodes').insert(insertPayload).select('*').single();
    if (error) {
        console.error("Verification failed! Database might still be missing columns:");
        console.error(error);
    } else {
        console.log("Verification succeeded! Inserted node with legacy columns.");
        console.log(data);
        // Cleanup
        await supabase.from('nodes').delete().eq('id', data.id);
    }
}

verify();
