import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function DebugSupabase() {
  const [msg, setMsg] = useState('Testando conexão...')

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from('users').select('id').limit(1)
        if (error) throw error
        setMsg(`OK: conexão ativa. Tabela users acessível. Linhas: ${data?.length ?? 0}`)
      } catch (e: any) {
        setMsg(`ERRO: ${e.message}`)
      }
    })()
  }, [])

  return <pre className="p-4 text-sm">{msg}</pre>
}
