import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
const apiKey = process.env.NEXT_PUBLIC_SUPABASE_API_KEY!

if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For server-side operations (conditionally export)
let supabaseAdmin: any = null;
if (serviceRoleKey) {
    supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
}

export { supabaseAdmin }