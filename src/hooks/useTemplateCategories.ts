// src/hooks/useTemplateCategories.ts
import { useState, useEffect } from 'react'
import { templateService } from '@/services/templateService'
import type { TemplateCategory } from '@/types/template.types'

export const useTemplateCategories = () => {
  const [categories, setCategories] = useState<TemplateCategory[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)

  const loadCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await templateService.getCategories()
      console.log('✅ useTemplateCategories:', data.length, 'categorie')
      setCategories(data)
    } catch (err: any) {
      console.error('❌ useTemplateCategories error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCategories() }, [])

  return { categories, loading, error, refresh: loadCategories }
}