import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Stricter check for Vercel/environment variables
const isValid = (val: any) => val && val !== 'undefined' && val !== 'null' && val !== ''

export const isSupabaseConfigured = isValid(supabaseUrl) && isValid(supabaseAnonKey)

if (typeof window !== 'undefined') {
  console.log('Fishtory: Supabase Config Check', {
    configured: isSupabaseConfigured,
    url: isValid(supabaseUrl) ? 'SET' : 'MISSING',
    key: isValid(supabaseAnonKey) ? 'SET' : 'MISSING'
  })
}

const createResilientClient = () => {
  if (isSupabaseConfigured) {
    return createClient(supabaseUrl!, supabaseAnonKey!)
  }
  
  // Return a proxy that throws a clear error if any property (like .auth) is accessed
  return new Proxy({} as any, {
    get: (_, prop) => {
      const msg = `Supabase Error: Cannot access ".${String(prop)}" because the client is not configured. ` +
                 `Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel settings.`
      console.error(msg)
      throw new Error(msg)
    }
  })
}

export const supabase = createResilientClient()
