import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Obter variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Validar se as variáveis estão configuradas
function validateSupabaseConfig(): { url: string; key: string } {
  if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
    throw new Error(
      '❌ VITE_SUPABASE_URL não configurada ou usando valor placeholder. ' +
      'Verifique o arquivo .env e o guia SUPABASE_SETUP.md'
    )
  }

  if (!supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key') {
    throw new Error(
      '❌ VITE_SUPABASE_ANON_KEY não configurada ou usando valor placeholder. ' +
      'Verifique o arquivo .env e o guia SUPABASE_SETUP.md'
    )
  }

  // Validar formato básico da URL
  try {
    new URL(supabaseUrl)
  } catch {
    throw new Error(
      '❌ VITE_SUPABASE_URL tem formato inválido. ' +
      'Deve ser algo como: https://seu-projeto.supabase.co'
    )
  }

  // Validar formato básico da chave (JWT)
  if (!supabaseAnonKey.startsWith('eyJ')) {
    throw new Error(
      '❌ VITE_SUPABASE_ANON_KEY parece ter formato inválido. ' +
      'Deve começar com "eyJ" (formato JWT)'
    )
  }

  return { url: supabaseUrl, key: supabaseAnonKey }
}

// Criar cliente Supabase
let supabase: SupabaseClient

try {
  const config = validateSupabaseConfig()
  supabase = createClient(config.url, config.key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
  console.log('✅ Cliente Supabase inicializado com sucesso')
} catch (error) {
  console.error('Erro ao inicializar Supabase:', error)
  // Criar cliente "dummy" para evitar crashes
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key')
}

// Função auxiliar para testar a conexão
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    // Testar conexão básica
    const { data, error } = await supabase.from('users').select('id').limit(1)
    
    if (error) {
      return {
        success: false,
        message: 'Erro ao conectar com o Supabase',
        error: error.message
      }
    }

    return {
      success: true,
      message: `✅ Conexão ativa! Tabela 'users' acessível. ${data?.length || 0} registros encontrados.`
    }
  } catch (error) {
    return {
      success: false,
      message: 'Erro inesperado ao testar conexão',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

export { supabase }

