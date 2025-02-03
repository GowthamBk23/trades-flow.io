import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required Supabase environment variables');
}

// Create base Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Create authenticated client
export function createAuthenticatedClient(token: string | null) {
  if (!token) {
    console.warn('No token provided to createAuthenticatedClient');
    return supabase;
  }

  try {
    return createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
  } catch (error) {
    console.error('Error creating authenticated client:', error);
    return supabase;
  }
}

// Test the connection
supabase
  .from('tasks')
  .select('count')
  .limit(1)
  .then(({ error }) => {
    if (error) {
      console.error('Supabase connection test failed:', JSON.stringify(error, null, 2));
    } else {
      console.log('Supabase connection test successful');
    }
  })
  .catch(err => {
    console.error('Supabase connection error:', JSON.stringify(err, null, 2));
  }); 