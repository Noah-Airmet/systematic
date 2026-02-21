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

async function getColumns(tableName) {
    // We can't query information_schema directly with the JS client easily,
    // but we can just do a select limit 1, or if it has no rows, we can't get columns.
    // Wait, the supabase postgres API DOES allow querying information_schema if not blocked by API exposure.
    // Actually, PostgREST doesn't expose information_schema by default.
    // We can use the REST API to trigger a schema error or something, 
    // OR we can just try to insert a dummy row and rollback, but that's messy.
    // Let's just try to fetch 1 row. If 0 rows, we might need a different approach.
    const { data, error } = await supabase.from(tableName).select('*').limit(1);
    if (error) {
        console.error(`Error fetching ${tableName}:`, error.message);
        return null;
    }
    if (data && data.length > 0) {
        return Object.keys(data[0]);
    }
    return []; // Empty if no rows
}

async function checkAll() {
    const tables = ['systems', 'nodes', 'edges', 'definitions', 'node_definitions'];
    const schema = {};
    for (const table of tables) {
        schema[table] = await getColumns(table);
    }
    console.log(JSON.stringify(schema, null, 2));
}

checkAll();
