// src/components/Templates/TemplateManager.tsx
// @ts-nocheck
import React, { useState } from 'react'
import { Card }   from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'
import { Badge }  from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Plus, Star, StarOff, X } from 'lucide-react'
import { useTemplateCategories } from '@/hooks/useTemplateCategories'
import { useTemplates }          from '@/hooks/useTemplates'
import { useDocuments }          from '@/hooks/useDocuments'
import CategoryGrid  from './CategoryGrid'
import TemplateList  from './TemplateList'
import DocumentList  from './DocumentList'
import TemplateEditor from './TemplateEditor'
import DocumentEditor from './DocumentEditor'
import type {
  TemplateCategory,
  Template,
  TemplateDocument,
} from '@/types/template.types'

type ViewType   = 'categories' | 'templates' | 'documents'
type EditorMode = 'template'   | 'document'  | null

const TemplateManager: React.FC = () => {
  const [view,              setView]              = useState<ViewType>('categories')
  const [selectedCategory,  setSelectedCategory]  = useState<TemplateCategory | null>(null)
  const [searchQuery,       setSearchQuery]       = useState('')
  const [filterFavorites,   setFilterFavorites]   = useState(false)
  const [editorOpen,        setEditorOpen]        = useState(false)
  const [editorMode,        setEditorMode]        = useState<EditorMode>(null)
  const [selectedItem,      setSelectedItem]      = useState<Template | TemplateDocument | null>(null)
  const [filterCategoryId,  setFilterCategoryId]  = useState<string>('all')

  const { categories } = useTemplateCategories()

  // ── Categoria attiva ──────────────────────────────────────────────────────
  const activeCategoryId = (() => {
    if (view !== 'templates') return undefined
    if (selectedCategory) return selectedCategory.id
    if (filterCategoryId !== 'all') return filterCategoryId
    return undefined
  })()

  const {
    templates,
    loading: templatesLoading,
    refresh: refreshTemplates,
  } = useTemplates({
    category: activeCategoryId,
    search:   searchQuery   || undefined,
    favorite: filterFavorites || undefined,
  })

  const { documents, refresh: refreshDocuments } = useDocuments({ limit: 10 })

  // ── Navigation handlers ───────────────────────────────────────────────────
  const handleCategoryClick = (category: TemplateCategory) => {
    setSelectedCategory(category)
    setFilterCategoryId('all')
    setView('templates')
  }

  const handleViewChange = (v: string) => {
    if (v === 'templates') setSelectedCategory(null)
    setView(v as ViewType)
  }

  const handleFilterCategoryChange = (value: string) => {
    setFilterCategoryId(value)
    setSelectedCategory(null)
  }

  // ── Editor handlers ───────────────────────────────────────────────────────
  const handleCreateTemplate = () => {
    setSelectedItem(null)
    setEditorMode('template')
    setEditorOpen(true)
  }

  const handleEditTemplate = (template: Template) => {
    setSelectedItem(template)
    setEditorMode('template')
    setEditorOpen(true)
  }

  const handleCreateDocument = (template: Template) => {
    setSelectedItem(template)
    setEditorMode('document')
    setEditorOpen(true)
  }

  const handleEditDocument = (document: TemplateDocument) => {
    setSelectedItem(document)
    setEditorMode('document')
    setEditorOpen(true)
  }

  const handleEditorClose = () => {
    setEditorOpen(false)
    setSelectedItem(null)
    setEditorMode(null)
    if (view === 'templates') refreshTemplates()
    else refreshDocuments()
  }

  // ── Breadcrumb label ──────────────────────────────────────────────────────
  const activeCategoryLabel = (() => {
    if (selectedCategory) return selectedCategory
    if (filterCategoryId !== 'all')
      return categories.find(c => c.id === filterCategoryId) ?? null
    return null
  })()

  return (
    <div className="space-y-6">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Template Manager</h2>
          <p className="text-muted-foreground">
            Gestisci template per contratti, preventivi e documenti
          </p>
        </div>
        {view === 'templates' && (
          <Button onClick={handleCreateTemplate}>
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Template
          </Button>
        )}
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <Tabs value={view} onValueChange={handleViewChange} className="w-full">
        <TabsList>
          <TabsTrigger value="categories">Categorie</TabsTrigger>
          <TabsTrigger value="templates">Tutti i Template</TabsTrigger>
          <TabsTrigger value="documents">
            Documenti Recenti
            {documents.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {documents.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Barra ricerca + filtri ─────────────────────────────────────── */}
        {(view === 'templates' || view === 'documents') && (
          <div className="flex flex-wrap gap-2 mt-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca template o documenti..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {view === 'templates' && !selectedCategory && (
              <Select
                value={filterCategoryId}
                onValueChange={handleFilterCategoryChange}
              >
                <SelectTrigger className="w-52">
                  <SelectValue placeholder="Filtra per categoria..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le categorie</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        {cat.icon && <span>{cat.icon}</span>}
                        {cat.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {view === 'templates' && (
              <Button
                variant={filterFavorites ? 'default' : 'outline'}
                size="icon"
                title={filterFavorites ? 'Mostra tutti' : 'Solo preferiti'}
                onClick={() => setFilterFavorites(!filterFavorites)}
              >
                {filterFavorites
                  ? <Star    className="h-4 w-4" />
                  : <StarOff className="h-4 w-4" />
                }
              </Button>
            )}
          </div>
        )}

        {/* ── Breadcrumb ────────────────────────────────────────────────── */}
        {activeCategoryLabel && view === 'templates' && (
          <div className="mt-4 flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedCategory(null)
                setFilterCategoryId('all')
                if (selectedCategory) setView('categories')
              }}
            >
              ← {selectedCategory ? 'Torna alle categorie' : 'Rimuovi filtro'}
            </Button>
            <div className="flex items-center gap-2">
              {activeCategoryLabel.icon && (
                <span className="text-xl">{activeCategoryLabel.icon}</span>
              )}
              <span className="font-semibold text-lg">
                {activeCategoryLabel.name}
              </span>
              <Badge variant="secondary">{templates.length} template</Badge>
            </div>
            {!selectedCategory && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setFilterCategoryId('all')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* ── Contatore risultati ───────────────────────────────────────── */}
        {view === 'templates' && !templatesLoading && (
          <p className="text-sm text-muted-foreground mt-3">
            {templates.length === 0
              ? 'Nessun template trovato'
              : `${templates.length} template ${
                  activeCategoryLabel
                    ? `nella categoria "${activeCategoryLabel.name}"`
                    : 'in tutte le categorie'
                }${filterFavorites ? ' (solo preferiti)' : ''}${
                  searchQuery ? ` per "${searchQuery}"` : ''
                }`
            }
          </p>
        )}

        {/* ── Tab Content ───────────────────────────────────────────────── */}
        <TabsContent value="categories" className="mt-6">
          <CategoryGrid
            categories={categories}
            onCategoryClick={handleCategoryClick}
          />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <TemplateList
            templates={templates}
            loading={templatesLoading}
            onEdit={handleEditTemplate}
            onCreateDocument={handleCreateDocument}
            onRefresh={refreshTemplates}
          />
        </TabsContent>

        {/* ✅ DocumentList riceve onEdit e onRefresh — gestisce PDF+DOCX internamente */}
        <TabsContent value="documents" className="mt-6">
          <DocumentList
            documents={documents}
            onEdit={handleEditDocument}
            onRefresh={refreshDocuments}
          />
        </TabsContent>
      </Tabs>

      {/* ── Dialog Editor ─────────────────────────────────────────────────── */}
      <Dialog open={editorOpen} onOpenChange={handleEditorClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          {editorMode === 'template' && (
            // @ts-ignore
            <TemplateEditor
              template={selectedItem as Template}
              categoryId={
                selectedCategory?.id ??
                (filterCategoryId !== 'all' ? filterCategoryId : undefined)
              }
              onClose={handleEditorClose}
            />
          )}
          {editorMode === 'document' && (
            // @ts-ignore
            <DocumentEditor
              template={
                selectedItem && 'content' in selectedItem
                  ? selectedItem as Template
                  : undefined
              }
              document={
                selectedItem && 'data' in selectedItem
                  ? selectedItem as TemplateDocument
                  : undefined
              }
              onClose={handleEditorClose}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TemplateManager