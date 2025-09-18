import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local')
} else {
  // Info mínima para depuração local (não expõe chave além do que já está no bundle)
  console.info('Supabase URL em uso:', supabaseUrl)
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')

