// src/hooks/useLoadData.ts

import { useEffect, useRef, useState } from 'react'
import { logger } from '@/lib/logger'

interface UseLoadDataOptions {
  onError?: (error: any) => void
  deps?: any[]
  enabled?: boolean
}

/**
 * Custom hook per caricare dati da API/database
 * Previene loop infiniti e gestisce loading/error states
 * 
 * @param loadFn - Funzione asincrona che carica i dati
 * @param options - Opzioni: deps (dipendenze), enabled (abilita caricamento), onError (callback errore)
 * @returns { loading, error, reload }
 * 
 * @example
 * const { loading, error, reload } = useLoadData(
 *   async () => {
 *     const data = await fetchData()
 *     setData(data)
 *   },
 *   {
 *     deps: [userId],
 *     enabled: !!userId,
 *     onError: (err) => toast.error('Errore!')
 *   }
 * )
 */
export function useLoadData<T = any>(
  loadFn: () => Promise<T | void>,
  options: UseLoadDataOptions = {}
) {
  const { onError, deps = [], enabled = true } = options
  
  const loadingRef = useRef(false)
  const mountedRef = useRef(true)
  const loadFnRef = useRef(loadFn)
  const depsRef = useRef(deps)
  
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<Error | null>(null)

  // Aggiorna ref della funzione
  useEffect(() => {
    loadFnRef.current = loadFn
  })

  useEffect(() => {
    // Aggiorna deps
    depsRef.current = deps

    if (!enabled) {
      logger.log('🔒 useLoadData: Caricamento disabilitato')
      setLoading(false)
      return
    }

    mountedRef.current = true

    const load = async () => {
      if (loadingRef.current) {
        logger.log('⏸️ useLoadData: Load già in corso, skip')
        return
      }

      loadingRef.current = true
      
      if (mountedRef.current) {
        setLoading(true)
        setError(null)
      }

      try {
        logger.log('🔄 useLoadData: Caricamento dati...')
        await loadFnRef.current()
        logger.log('✅ useLoadData: Dati caricati con successo')
      } catch (err: any) {
        logger.error('❌ useLoadData: Errore durante il caricamento:', err)
        
        if (mountedRef.current) {
          setError(err)
          onError?.(err)
        }
      } finally {
        loadingRef.current = false
        
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      logger.log('🧹 useLoadData: Cleanup')
      mountedRef.current = false
      loadingRef.current = false
    }
  }, [...deps, enabled])

  const reload = () => {
    logger.log('🔃 useLoadData: Reload manuale')
    loadingRef.current = false
    depsRef.current = []
    setLoading(true)
  }

  return { loading, error, reload }
}