import { useEffect, useState } from 'react'
import { testSupabaseConnection } from '@/lib/supabaseClient'

export default function DebugSupabase() {
  const [result, setResult] = useState<{
    success: boolean
    message: string
    error?: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const runTest = async () => {
      setIsLoading(true)
      try {
        const testResult = await testSupabaseConnection()
        setResult(testResult)
      } catch (error) {
        setResult({
          success: false,
          message: 'Erro inesperado',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        })
      } finally {
        setIsLoading(false)
      }
    }

    runTest()
  }, [])

  const handleRetry = () => {
    setResult(null)
    setIsLoading(true)
    // Re-run the test after a brief delay
    setTimeout(() => {
      const runTest = async () => {
        try {
          const testResult = await testSupabaseConnection()
          setResult(testResult)
        } catch (error) {
          setResult({
            success: false,
            message: 'Erro inesperado',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          })
        } finally {
          setIsLoading(false)
        }
      }
      runTest()
    }, 100)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔍 Debug Supabase</h1>
      
      <div className="bg-gray-100 rounded-lg p-4 mb-4">
        <h2 className="font-semibold mb-2">Status da Conexão</h2>
        
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span>Testando conexão...</span>
          </div>
        ) : result ? (
          <div className="space-y-2">
            <div className={`font-mono text-sm p-3 rounded ${
              result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {result.message}
            </div>
            
            {result.error && (
              <div className="font-mono text-sm p-3 rounded bg-orange-100 text-orange-800">
                <strong>Detalhes do erro:</strong> {result.error}
              </div>
            )}
            
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              🔄 Testar Novamente
            </button>
          </div>
        ) : null}
      </div>

      {!result?.success && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">💡 Precisa de Ajuda?</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Verifique se o arquivo <code>.env</code> existe na raiz do projeto</li>
            <li>• Confirme se <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> estão configurados</li>
            <li>• Consulte o guia <code>SUPABASE_SETUP.md</code> para instruções detalhadas</li>
            <li>• Verifique se as tabelas foram criadas no seu banco Supabase</li>
          </ul>
        </div>
      )}
    </div>
  )
}
