import { createClient } from '@supabase/supabase-js';

// These environment variables will be configured in the Supabase dashboard
// and added to the .env file later.
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Note: To connect the app to Supabase:
 * 1. Create a project at https://supabase.com
 * 2. Get the URL and Anon Key from Project Settings > API
 * 3. Add them to your environment variables
 * 4. Create the tables (customers, subscriptions, payments, etc.) in the Supabase SQL Editor
 */
