// src/components/ProtectedRoute.tsx

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/lib/logger'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  logger.log('🛡️ ProtectedRoute: Checking access', {
    loading,
    hasUser: !!user,
    path: location.pathname,
  })

  // ─── Loader mentre AuthContext inizializza ───────────────────────────────
  if (loading) {
    logger.log('⏳ ProtectedRoute: Still loading...')
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    )
  }

  // ─── Non autenticato → Login ─────────────────────────────────────────────
  if (!user) {
    logger.log('❌ ProtectedRoute: No user, redirecting to login', {
      attemptedPath: location.pathname,
    })

    // Salva il percorso tentato: dopo il login l'utente
    // verrà rimandato esattamente dove voleva andare
    return (
      <Navigate
        to="/app/login"
        state={{ from: location }}   // ← letto da Login.tsx per il redirect
        replace                       // ← evita entry spuria nella history
      />
    )
  }

  // ─── Autenticato → renderizza i children (Layout + pagina) ───────────────
  logger.log('✅ ProtectedRoute: Access granted', {
    path: location.pathname,
  })

  return <>{children}</>
}