// src/hooks/useTemplates.ts
import { useState, useEffect, useCallback } from 'react'
import { templateService } from '@/services/templateService'
import type { Template, TemplateFilters } from '@/types/template.types'

interface UseTemplatesOptions {
  category?:  string
  search?:    string
  favorite?:  boolean
}

export const useTemplates = (options?: UseTemplatesOptions) => {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Costruisce i filtri solo con valori definiti
      const filters: TemplateFilters = {}
      if (options?.category) filters.category_id = options.category
      if (options?.search)   filters.search       = options.search
      if (options?.favorite) filters.favorite     = options.favorite

      const hasFilters = Object.keys(filters).length > 0
      console.log('📋 useTemplates — filters:', hasFilters ? filters : 'none')

      const data = await templateService.getAllTemplates(
        hasFilters ? filters : undefined
      )

      console.log(`✅ useTemplates loaded ${data.length} templates`)
      setTemplates(data)
    } catch (err: any) {
      console.error('❌ useTemplates error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [options?.category, options?.search, options?.favorite])

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  return { templates, loading, error, refresh: loadTemplates }
}