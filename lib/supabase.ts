import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Stricter check for Vercel/environment variables
const isValid = (val: any) => val && val !== 'undefined' && val !== 'null' && val !== ''

export const isSupabaseConfigured = isValid(supabaseUrl) && isValid(supabaseAnonKey)

if (typeof window !== 'undefined') {
  console.log('Supabase Config Status:', {
    isConfigured: isSupabaseConfigured,
    urlSet: isValid(supabaseUrl),
    keySet: isValid(supabaseAnonKey)
  })
}

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null as any
