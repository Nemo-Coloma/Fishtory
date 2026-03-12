import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Stricter check for Vercel/environment variables
const isValid = (val: any) => val && val !== 'undefined' && val !== 'null' && val !== ''

export const isSupabaseConfigured = isValid(supabaseUrl) && isValid(supabaseAnonKey)

if (typeof window !== 'undefined') {
  console.log('--- FISHTORY DIAGNOSTICS ---')
  console.log('Timestamp:', new Date().toISOString())
  console.log('Supabase Config Check:', {
    isConfigured: isSupabaseConfigured,
    NEXT_PUBLIC_SUPABASE_URL: isValid(supabaseUrl) ? 'EXISTS' : 'MISSING',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: isValid(supabaseAnonKey) ? 'EXISTS' : 'MISSING'
  })
  
  // Log all public env vars keys
  const publicVars = Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_'))
  console.log('Detected Public Env Vars:', publicVars)
  console.log('---------------------------')
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
