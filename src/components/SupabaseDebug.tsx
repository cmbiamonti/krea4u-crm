import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function SupabaseDebug() {
  const [status, setStatus] = useState<{
    connected: boolean
    user: any
    error: string | null
    tables: string[]
  }>({
    connected: false,
    user: null,
    error: null,
    tables: []
  })

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Test connessione
        const { error: healthError } = await supabase
          .from('profiles')
          .select('count')
          .limit(1)

        if (healthError) {
          setStatus(prev => ({
            ...prev,
            connected: false,
            error: healthError.message
          }))
          return
        }

        // Verifica utente
        const { data: { user } } = await supabase.auth.getUser()

        // Test tabelle
        const tables = []
        const testTables = ['profiles', 'artists', 'venues', 'projects']
        
        for (const table of testTables) {
          try {
            const { error } = await supabase
              .from(table as any)
              .select('id')
              .limit(1)
            
            if (!error) {
              tables.push(table)
            }
          } catch (e) {
            console.warn(`Tabella ${table} non accessibile`)
          }
        }

        setStatus({
          connected: true,
          user: user,
          error: null,
          tables
        })

      } catch (error: any) {
        setStatus(prev => ({
          ...prev,
          connected: false,
          error: error.message || 'Errore sconosciuto'
        }))
      }
    }

    checkConnection()
  }, [])

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-md border-2 border-gray-200 z-50">
      <h3 className="font-bold text-lg mb-2">🔌 Supabase Status</h3>
      
      <div className="mb-2">
        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${status.connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
        <span className="font-semibold">
          {status.connected ? '✅ Connesso' : '❌ Disconnesso'}
        </span>
      </div>

      {status.error && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          <strong>Errore:</strong> {status.error}
        </div>
      )}

      <div className="mb-2 text-sm">
        <strong>Utente:</strong> {status.user ? status.user.email : 'Non autenticato'}
      </div>

      {status.tables.length > 0 && (
        <div className="text-sm">
          <strong>Tabelle accessibili:</strong>
          <ul className="list-disc list-inside ml-2">
            {status.tables.map(table => (
              <li key={table} className="text-green-600">✓ {table}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-2 pt-2 border-t text-xs text-gray-500">
        <div>URL: {import.meta.env.VITE_SUPABASE_URL?.substring(0, 30)}...</div>
      </div>
    </div>
  )
}