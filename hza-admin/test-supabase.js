
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function test() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    console.log('Testing connection to:', process.env.NEXT_PUBLIC_SUPABASE_URL);

    const { data, error } = await supabase.from('orders').select('id').limit(1);
    if (error) {
        console.error('Error fetching orders:', error);
    } else {
        console.log('Successfully fetched orders:', data);
    }

    const { data: profiles, error: pError } = await supabase.from('profiles').select('id').limit(1);
    if (pError) {
        console.error('Error fetching profiles:', pError);
    } else {
        console.log('Successfully fetched profiles:', profiles);
    }
}

test();
