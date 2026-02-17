const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Basic .env parser for Node
const envPath = path.join(__dirname, '.env');
const envText = fs.readFileSync(envPath, 'utf8');
const env = {};
envText.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
});

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

async function testConnection() {
    console.log('Testing Supabase connection...');
    console.log('URL:', env.SUPABASE_URL);

    const { data, error } = await supabase
        .from('votes')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Connection failed:', error.message);
        process.exit(1);
    } else {
        console.log('Connection successful! Data retrieved:', data);
        process.exit(0);
    }
}

testConnection();
