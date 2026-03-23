// src/hooks/useDocuments.ts
import { useState, useEffect, useCallback } from 'react'
import { templateService } from '@/services/templateService'
import type { TemplateDocument, DocumentFilters } from '@/types/template.types'

// ✅ Estende DocumentFilters con limit (usato da TemplateManager)
interface UseDocumentsOptions extends DocumentFilters {
  limit?: number
}

export const useDocuments = (options?: UseDocumentsOptions) => {
  const [documents, setDocuments] = useState<TemplateDocument[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('📄 useDocuments loading — options:', options)

      // ✅ Passa il limit come parte dei filtri
      const data = await templateService.getDocuments(options)

      console.log(`✅ useDocuments loaded ${data.length} documenti`)
      setDocuments(data)
    } catch (err: any) {
      console.error('❌ useDocuments error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [
    // Dipendenze esplicite — evita JSON.stringify
    options?.status,
    options?.template_id,
    options?.search,
    options?.limit,
  ])

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  return { documents, loading, error, refresh: loadDocuments }
}