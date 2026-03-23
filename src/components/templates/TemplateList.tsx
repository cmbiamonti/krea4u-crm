// src/components/Templates/TemplateList.tsx
import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge }  from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  MoreVertical,
  Star,
  Edit,
  Copy,
  Trash2,
  FileText,
  Loader2,
  // ── Icone usate nel seed ──────────────────────────────────────────────────
  Calculator,
  Home,
  Shield,
  Archive,
  Megaphone,
  Lightbulb,
  FolderOpen,
  BookOpen,
  Briefcase,
  Camera,
  Music,
  Palette,
  Settings,
  Users,
  Mail,
  Globe,
  Heart,
  type LucideIcon,
} from 'lucide-react'
import { templateService } from '@/services/templateService'
import type { Template } from '@/types/template.types'

// ── Registro icone: nome stringa → componente Lucide ─────────────────────────
// Deve essere identico a quello in CategoryGrid.tsx
const ICON_MAP: Record<string, LucideIcon> = {
  FileText,
  Calculator,
  Home,
  Shield,
  Archive,
  Megaphone,
  Lightbulb,
  FolderOpen,
  BookOpen,
  Briefcase,
  Camera,
  Music,
  Palette,
  Star,
  Settings,
  Users,
  Mail,
  Globe,
  Heart,
}

// ── Helper: risolve icona da stringa → ReactNode ──────────────────────────────
function resolveIcon(
  iconValue: string | undefined,
  color     = '#6366f1',
  size      = 20,
): React.ReactNode {
  if (!iconValue) {
    return <FolderOpen size={size} color={color} />
  }

  // Emoji o carattere unicode
  if (/\p{Emoji}/u.test(iconValue) || iconValue.length <= 2) {
    return (
      <span style={{ fontSize: size, lineHeight: 1 }}>
        {iconValue}
      </span>
    )
  }

  // Nome componente Lucide
  const LucideComponent = ICON_MAP[iconValue]
  if (LucideComponent) {
    return <LucideComponent size={size} color={color} strokeWidth={1.5} />
  }

  // URL immagine
  if (iconValue.startsWith('http') || iconValue.startsWith('/')) {
    return (
      <img
        src={iconValue}
        alt=""
        style={{ width: size, height: size, objectFit: 'contain' }}
      />
    )
  }

  // Fallback: prima lettera
  return (
    <span style={{ fontSize: size * 0.8, fontWeight: 700, color }}>
      {iconValue.charAt(0).toUpperCase()}
    </span>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface TemplateListProps {
  templates:        Template[]
  loading:          boolean
  onEdit:           (template: Template) => void
  onCreateDocument: (template: Template) => void
  onRefresh:        () => void
}

// ── Componente ────────────────────────────────────────────────────────────────
const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  loading,
  onEdit,
  onCreateDocument,
  onRefresh,
}) => {
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleToggleFavorite = async (template: Template) => {
    try {
      setActionLoading(template.id)
      await templateService.toggleFavorite(template.id)
      onRefresh()
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDuplicate = async (template: Template) => {
    try {
      setActionLoading(template.id)
      await templateService.duplicateTemplate(template.id)
      onRefresh()
    } catch (error) {
      console.error('Error duplicating template:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (template: Template) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo template?')) return
    try {
      setActionLoading(template.id)
      await templateService.deleteTemplate(template.id)
      onRefresh()
    } catch (error) {
      console.error('Error deleting template:', error)
    } finally {
      setActionLoading(null)
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nessun template trovato</h3>
        <p className="text-muted-foreground">
          Crea il tuo primo template personalizzato
        </p>
      </div>
    )
  }

  // ── Grid ──────────────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => {
        const iconColor = template.category_color || '#6366f1'
        const iconNode  = resolveIcon(template.category_icon, iconColor, 20)

        return (
          <Card
            key={template.id}
            className="cursor-pointer transition-all hover:shadow-md"
            onClick={() => onCreateDocument(template)}
          >
            <CardHeader>
              {/* ── Top row: icona + stella + menu ─────────────────────── */}
              <div className="flex justify-between items-start mb-2">

                {/* Icona categoria + pulsante preferito */}
                <div className="flex items-center gap-2">
                  {/* ✅ Icona risolta tramite ICON_MAP */}
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg"
                    style={{ backgroundColor: `${iconColor}18` }}
                  >
                    {iconNode}
                  </div>

                  {/* Stella preferito */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleFavorite(template)
                    }}
                    disabled={actionLoading === template.id}
                  >
                    <Star
                      className={`h-4 w-4 ${
                        template.is_favorite
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </Button>
                </div>

                {/* Menu azioni */}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">

                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onCreateDocument(template)
                      }}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Crea Documento
                    </DropdownMenuItem>

                    {/* Modifica — solo per template non di sistema */}
                    {!template.is_system && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(template)
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Modifica
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDuplicate(template)
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Duplica
                    </DropdownMenuItem>

                    {/* Elimina — solo per template non di sistema */}
                    {!template.is_system && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(template)
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Elimina
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* ── Titolo e descrizione ──────────────────────────────── */}
              <CardTitle className="text-lg leading-tight">
                {template.name}
              </CardTitle>
              {template.description && (
                <CardDescription className="line-clamp-2 text-sm">
                  {template.description}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent>
              {/* ── Tag ────────────────────────────────────────────────── */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {template.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {template.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    +{template.tags.length - 3}
                  </Badge>
                )}
              </div>

              {/* ── Footer card ─────────────────────────────────────────── */}
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>{template.usage_count ?? 0} utilizzi</span>
                {template.is_system && (
                  <Badge variant="secondary" className="text-xs">
                    Sistema
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default TemplateList