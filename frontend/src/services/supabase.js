/**
 * Supabase client — single instance used across the app.
 * Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnon) {
  console.warn(
    'Supabase env vars missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local'
  )
}

export const supabase = createClient(supabaseUrl || '', supabaseAnon || '')
