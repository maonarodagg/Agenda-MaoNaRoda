import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

// Cliente único do Supabase. Só usa a anon key (pública); a segurança fica no RLS.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error('Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local')
}

export const supabase = createClient<Database>(url, anonKey)
