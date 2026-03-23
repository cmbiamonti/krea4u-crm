// src/services/templateService.ts
// @ts-nocheck
import { supabase } from '../lib/supabase'
import { mapTemplate, mapTemplates } from '../utils/typeMappers'
import type {
  Template,
  TemplateCategory,
  TemplateDocument,
  CreateTemplateDTO,
  UpdateTemplateDTO,
  CreateDocumentDTO,
  UpdateDocumentDTO,
  TemplateFilters,
  DocumentFilters,
} from '../types/template.types'

// ── Helper autenticazione ─────────────────────────────────────────────────────
async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')
  return user.id
}

export const templateService = {

  // ── Categorie ───────────────────────────────────────────────────────────────
  async getCategories(): Promise<TemplateCategory[]> {
    const { data, error } = await supabase
      .from('template_categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('❌ getCategories error:', error)
      throw error
    }
    console.log(`✅ getCategories → ${data?.length ?? 0} categorie`)
    return (data || []) as TemplateCategory[]
  },

  // ── Template per categoria ──────────────────────────────────────────────────
  async getTemplatesByCategory(
    categoryId: string,
    includePublic = true
  ): Promise<Template[]> {
    const userId = await getCurrentUserId()

    let query = supabase
      .from('templates')
      .select('*, category:template_categories(*)')
      .eq('category_id', categoryId)
      .eq('is_active', true)

    if (includePublic) {
      query = query.or(`is_public.eq.true,created_by.eq.${userId}`)
    } else {
      query = query.eq('created_by', userId)
    }

    const { data, error } = await query.order('name', { ascending: true })

    if (error) {
      console.error('❌ getTemplatesByCategory error:', error)
      throw error
    }
    console.log(`✅ getTemplatesByCategory [${categoryId}] → ${data?.length ?? 0}`)
    return mapTemplates(data || [])
  },

  // ── Tutti i template ────────────────────────────────────────────────────────
  async getAllTemplates(filters?: TemplateFilters): Promise<Template[]> {
    const userId = await getCurrentUserId()
    console.log('🔍 getAllTemplates — userId:', userId, '— filters:', filters)

    let query = supabase
      .from('templates')
      .select('*, category:template_categories(*)')
      .eq('is_active', true)
      .or(`is_public.eq.true,created_by.eq.${userId}`)

    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id)
    }
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      )
    }
    if (filters?.favorite === true) {
      query = query.eq('is_favorite', true)
    }

    const { data, error } = await query.order('name', { ascending: true })

    if (error) {
      console.error('❌ getAllTemplates error:', error)
      throw error
    }
    console.log(`✅ getAllTemplates → ${data?.length ?? 0} templates`)
    return mapTemplates(data || [])
  },

  // ── Preferiti ───────────────────────────────────────────────────────────────
  async getFavoriteTemplates(): Promise<Template[]> {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('templates')
      .select('*, category:template_categories(*)')
      .or(`is_public.eq.true,created_by.eq.${userId}`)
      .eq('is_favorite', true)
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) throw error
    return mapTemplates(data || [])
  },

  // ── Ricerca ─────────────────────────────────────────────────────────────────
  async searchTemplates(searchTerm: string, categoryId?: string): Promise<Template[]> {
    const userId = await getCurrentUserId()

    let query = supabase
      .from('templates')
      .select('*, category:template_categories(*)')
      .or(`is_public.eq.true,created_by.eq.${userId}`)
      .eq('is_active', true)
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)

    if (categoryId) query = query.eq('category_id', categoryId)

    const { data, error } = await query.order('name', { ascending: true })
    if (error) throw error
    return mapTemplates(data || [])
  },

  // ── Template singolo ────────────────────────────────────────────────────────
  async getTemplate(templateId: string): Promise<Template> {
    const { data, error } = await supabase
      .from('templates')
      .select('*, category:template_categories(*)')
      .eq('id', templateId)
      .single()

    if (error) throw error
    if (!data) throw new Error('Template not found')
    return mapTemplate(data)
  },

  // ── Crea template ───────────────────────────────────────────────────────────
  async createTemplate(dto: CreateTemplateDTO): Promise<Template> {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('templates')
      .insert({
        created_by:  userId,
        category_id: dto.category_id,
        name:        dto.name,
        description: dto.description || '',
        content:     dto.content,
        tags:        dto.tags || [],
        is_favorite: dto.is_favorite || false,
        is_public:   false,
        is_active:   true,
        version:     '1.0',
      })
      .select('*, category:template_categories(*)')
      .single()

    if (error) throw error
    if (!data) throw new Error('Failed to create template')
    return mapTemplate(data)
  },

  // ── Aggiorna template ───────────────────────────────────────────────────────
  async updateTemplate(templateId: string, templateData: UpdateTemplateDTO): Promise<Template> {
    const userId = await getCurrentUserId()

    const { data: current } = await supabase
      .from('templates')
      .select('version')
      .eq('id', templateId)
      .single()

    const currentVer = parseFloat(current?.version ?? '1.0')
    const nextVer    = (currentVer + 1).toFixed(1)

    const updateData: Record<string, any> = {
      version:    nextVer,
      updated_at: new Date().toISOString(),
    }
    if (templateData.name        !== undefined) updateData.name        = templateData.name
    if (templateData.description !== undefined) updateData.description = templateData.description
    if (templateData.content     !== undefined) updateData.content     = templateData.content
    if (templateData.tags        !== undefined) updateData.tags        = templateData.tags
    if (templateData.is_favorite !== undefined) updateData.is_favorite = templateData.is_favorite

    const { data, error } = await supabase
      .from('templates')
      .update(updateData)
      .eq('id', templateId)
      .eq('created_by', userId)
      .select('*, category:template_categories(*)')
      .single()

    if (error) throw error
    if (!data) throw new Error('Failed to update template')
    return mapTemplate(data)
  },

  // ── Elimina template ────────────────────────────────────────────────────────
  async deleteTemplate(templateId: string): Promise<void> {
    const userId = await getCurrentUserId()
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', templateId)
      .eq('created_by', userId)
    if (error) throw error
  },

  // ── Toggle preferito ────────────────────────────────────────────────────────
  async toggleFavorite(templateId: string): Promise<Template> {
    const userId = await getCurrentUserId()

    const { data: current } = await supabase
      .from('templates')
      .select('is_favorite')
      .eq('id', templateId)
      .single()

    const { data, error } = await supabase
      .from('templates')
      .update({
        is_favorite: !(current?.is_favorite ?? false),
        updated_at:  new Date().toISOString(),
      })
      .eq('id', templateId)
      .select('*, category:template_categories(*)')
      .single()

    if (error) throw error
    if (!data) throw new Error('Failed to toggle favorite')
    return mapTemplate(data)
  },

  // ── Duplica template ────────────────────────────────────────────────────────
  async duplicateTemplate(templateId: string): Promise<Template> {
    const userId   = await getCurrentUserId()
    const template = await this.getTemplate(templateId)

    const { data, error } = await supabase
      .from('templates')
      .insert({
        created_by:  userId,
        category_id: template.category_id,
        name:        `${template.name} (Copia)`,
        description: template.description || '',
        content:     template.content,
        tags:        template.tags || [],
        is_favorite: false,
        is_public:   false,
        is_active:   true,
        version:     '1.0',
      })
      .select('*, category:template_categories(*)')
      .single()

    if (error) throw error
    if (!data) throw new Error('Failed to duplicate template')
    return mapTemplate(data)
  },

  // ── Esporta template (JSON blob) ────────────────────────────────────────────
  async exportTemplate(templateId: string): Promise<Blob> {
    const template = await this.getTemplate(templateId)
    return new Blob(
      [JSON.stringify({
        name:        template.name,
        description: template.description,
        content:     template.content,
        tags:        template.tags,
        version:     template.version,
        exported_at: new Date().toISOString(),
      }, null, 2)],
      { type: 'application/json' }
    )
  },

  // ── Importa template da file JSON ───────────────────────────────────────────
  async importTemplate(categoryId: string, file: File): Promise<Template> {
    const userId = await getCurrentUserId()

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const importData = JSON.parse(e.target?.result as string)
          const { data, error } = await supabase
            .from('templates')
            .insert({
              created_by:  userId,
              category_id: categoryId,
              name:        importData.name || 'Template importato',
              description: importData.description || '',
              content:     importData.content,
              tags:        importData.tags || [],
              is_favorite: false,
              is_public:   false,
              is_active:   true,
              version:     '1.0',
            })
            .select('*, category:template_categories(*)')
            .single()

          if (error) throw error
          if (!data) throw new Error('Failed to import template')
          resolve(mapTemplate(data))
        } catch (err) { reject(err) }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  },

  // ===========================================================================
  // DOCUMENTI
  // ===========================================================================

  // ── Crea documento ──────────────────────────────────────────────────────────
  async createDocument(dto: CreateDocumentDTO): Promise<TemplateDocument> {
    const userId = await getCurrentUserId()

    let templateName    = dto.template_name    || ''
    let templateVersion = dto.template_version || '1.0'

    if ((!templateName || !templateVersion) && dto.template_id) {
      try {
        const tpl        = await this.getTemplate(dto.template_id)
        templateName    = templateName    || tpl.name
        templateVersion = templateVersion || tpl.version || '1.0'
      } catch (e) {
        console.warn('⚠️ createDocument: impossibile recuperare template', e)
        templateName = templateName || 'Template sconosciuto'
      }
    }

    console.log('📝 createDocument — payload:', {
      template_id:      dto.template_id,
      template_name:    templateName,
      template_version: templateVersion,
      name:             dto.name,
      status:           dto.status || 'draft',
      created_by:       userId,
    })

    const { data: newDoc, error } = await supabase
      .from('template_documents')
      .insert({
        template_id:        dto.template_id,
        template_name:      templateName,
        template_version:   templateVersion,
        name:               dto.name,
        description:        dto.description       || null,
        data:               dto.data,
        status:             dto.status            || 'draft',
        related_artist_id:  dto.related_artist_id  || null,
        related_venue_id:   dto.related_venue_id   || null,
        related_project_id: dto.related_project_id || null,
        created_by:         userId,
      })
      .select()
      .single()

    if (error) {
      console.error('❌ createDocument error:', error)
      throw error
    }
    if (!newDoc) throw new Error('Failed to create document')

    console.log('✅ createDocument — creato:', newDoc.id)

    // Salva prima versione
    const { error: versionError } = await supabase
      .from('document_versions')
      .insert({
        document_id:    newDoc.id,
        version_number: 1,
        data:           dto.data,
        changed_by:     userId,
        change_note:    'Versione iniziale',
      })

    if (versionError) {
      console.warn('⚠️ createDocument: errore versione:', versionError)
    }

    return newDoc as TemplateDocument
  },

  // ── Lista documenti (alias pubblico) ────────────────────────────────────────
  async getDocuments(filters?: DocumentFilters): Promise<TemplateDocument[]> {
    return this.getUserDocuments(filters)
  },

  // ── Lista documenti utente ──────────────────────────────────────────────────
  // ✅ MODIFICA APPLICATA QUI:
  //    1. select() esteso con category(name, icon, color)
  //    2. normalizzazione aggiunge category_name oltre a category_icon/color
  async getUserDocuments(filters?: DocumentFilters): Promise<TemplateDocument[]> {
    const userId = await getCurrentUserId()

    console.log('📄 getUserDocuments — userId:', userId, '— filters:', filters)

    // ── ✅ FIX: join esteso per recuperare name della categoria ────────────────
    let query = supabase
      .from('template_documents')
      .select(`
        *,
        template:templates(
          id,
          name,
          content,
          category:template_categories(
            name,
            icon,
            color
          )
        )
      `)
      .eq('created_by', userId)         // ✅ campo reale (non user_id)

    if (filters?.status)      query = query.eq('status', filters.status)
    if (filters?.template_id) query = query.eq('template_id', filters.template_id)
    if (filters?.search)      query = query.ilike('name', `%${filters.search}%`)

    // Supporto limit (usato da TemplateManager con { limit: 10 })
    if ((filters as any)?.limit) {
      query = query.limit((filters as any).limit)
    }

    const { data, error } = await query
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('❌ getUserDocuments error:', error)
      throw error
    }

    console.log(`✅ getUserDocuments → ${data?.length ?? 0} documenti`)

    // ── ✅ FIX: normalizzazione con category_name aggiunto ────────────────────
    return (data || []).map((doc: any) => ({
      ...doc,
      // Struttura template per export PDF
      template_content: doc.template?.content          ?? null,
      // ✅ category_icon: può essere "📄" (emoji) o "FileText" (nome Lucide)
      //    gestito da <CategoryIcon> in DocumentList
      category_icon:    doc.template?.category?.icon   ?? null,
      category_color:   doc.template?.category?.color  ?? null,
      // ✅ NUOVO: category_name per visualizzazione nella card
      category_name:    doc.template?.category?.name   ?? null,
    })) as TemplateDocument[]
  },

  // ── Documento singolo (con template_content) ────────────────────────────────
  async getDocument(documentId: string): Promise<TemplateDocument> {
    const { data, error } = await supabase
      .from('template_documents')
      .select(`
        *,
        template:templates(
          id,
          name,
          content,
          category:template_categories(
            name,
            icon,
            color
          )
        )
      `)
      .eq('id', documentId)
      .single()

    if (error) throw error
    if (!data) throw new Error('Document not found')

    return {
      ...data,
      template_content: (data as any).template?.content         ?? null,
      category_icon:    (data as any).template?.category?.icon  ?? null,
      category_color:   (data as any).template?.category?.color ?? null,
      category_name:    (data as any).template?.category?.name  ?? null,
    } as TemplateDocument
  },

  // ── Aggiorna documento ──────────────────────────────────────────────────────
  async updateDocument(documentId: string, updates: UpdateDocumentDTO): Promise<TemplateDocument> {
    const userId = await getCurrentUserId()

    const { data: versions } = await supabase
      .from('document_versions')
      .select('version_number')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false })
      .limit(1)

    const currentVersion = versions?.[0]?.version_number ?? 0

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }
    if (updates.name        !== undefined) updateData.name        = updates.name
    if (updates.data        !== undefined) updateData.data        = updates.data
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.status      !== undefined) {
      updateData.status = updates.status
      if (updates.status === 'completed') updateData.completed_at = new Date().toISOString()
      if (updates.status === 'signed')    updateData.signed_at    = new Date().toISOString()
      if (updates.status === 'archived')  updateData.archived_at  = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('template_documents')
      .update(updateData)
      .eq('id', documentId)
      .eq('created_by', userId)
      .select()
      .single()

    if (error) throw error
    if (!data) throw new Error('Failed to update document')

    if (updates.data) {
      const { error: versionError } = await supabase
        .from('document_versions')
        .insert({
          document_id:    documentId,
          version_number: currentVersion + 1,
          data:           updates.data,
          changed_by:     userId,
          change_note:    updates.change_note || 'Aggiornato',
        })

      if (versionError) {
        console.warn('⚠️ updateDocument: errore versione:', versionError)
      }
    }

    return data as TemplateDocument
  },

  // ── Elimina documento ───────────────────────────────────────────────────────
  async deleteDocument(documentId: string): Promise<void> {
    const userId = await getCurrentUserId()
    const { error } = await supabase
      .from('template_documents')
      .delete()
      .eq('id', documentId)
      .eq('created_by', userId)
    if (error) throw error
  },

  // ── Versioni documento ──────────────────────────────────────────────────────
  async getDocumentVersions(documentId: string) {
    const { data, error } = await supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false })

    if (error) throw error
    return data || []
  },

  // ── Ripristina versione ─────────────────────────────────────────────────────
  async restoreDocumentVersion(
    documentId: string,
    versionNumber: number
  ): Promise<TemplateDocument> {
    const { data: version } = await supabase
      .from('document_versions')
      .select('data')
      .eq('document_id', documentId)
      .eq('version_number', versionNumber)
      .single()

    if (!version) throw new Error('Version not found')

    return this.updateDocument(documentId, {
      data:        version.data as Record<string, any>,
      change_note: `Ripristinato alla versione ${versionNumber}`,
    })
  },
}