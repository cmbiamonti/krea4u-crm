// src/components/Templates/CategoryGrid.tsx
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// ── Mappa nomi stringa → componenti Lucide ────────────────────────────────────
import {
  FileText,
  Calculator,
  Home,
  Shield,
  Archive,
  Megaphone,
  Lightbulb,
  FolderOpen,
  File,
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
  ClipboardList,
  Award,
  Image,
  Tag,
  Layers,
  type LucideIcon,
} from 'lucide-react'

import type { TemplateCategory } from '@/types/template.types'

// ── Registro COMPLETO: nome stringa → componente LucideIcon ──────────────────
// Aggiungi qui qualsiasi icona usata nel seed SQL
const ICON_MAP: Record<string, LucideIcon> = {
  // ✅ Icone usate nel seed_templates.sql
  FileText,
  Calculator,
  Home,
  Shield,
  Archive,
  Megaphone,
  Lightbulb,
  // Icone extra comuni
  FolderOpen,
  File,
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
  ClipboardList,
  Award,
  Image,
  Tag,
  Layers,
}

// ── Colori fallback per indice ────────────────────────────────────────────────
const FALLBACK_COLORS = [
  '#1976D2', '#388E3C', '#7B1FA2', '#F57C00',
  '#0097A7', '#C62828', '#558B2F', '#AD1457',
]

interface CategoryGridProps {
  categories:       TemplateCategory[]
  onCategoryClick:  (category: TemplateCategory) => void
  templateCounts?:  Record<string, number>
}

// ── Risolve il valore icona in un nodo React renderizzabile ──────────────────
function resolveIcon(iconValue: string | undefined, color: string): React.ReactNode {

  // Nessun valore → icona generica
  if (!iconValue || iconValue.trim() === '') {
    return <FolderOpen size={28} color={color} strokeWidth={1.5} />
  }

  const trimmed = iconValue.trim()

  // Caso 1 — Nome componente Lucide (es: "FileText", "Archive")
  // Controlla PRIMA dei caratteri unicode perché è il caso più comune nel seed
  const LucideComponent = ICON_MAP[trimmed]
  if (LucideComponent) {
    return <LucideComponent size={28} color={color} strokeWidth={1.5} />
  }

  // Caso 2 — Emoji o carattere unicode (es: "📁", "🎨")
  if ([...trimmed].length <= 2) {
    return (
      <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>
        {trimmed}
      </span>
    )
  }

  // Caso 3 — URL immagine
  if (trimmed.startsWith('http') || trimmed.startsWith('/')) {
    return (
      <img
        src={trimmed}
        alt=""
        style={{ width: 28, height: 28, objectFit: 'contain' }}
      />
    )
  }

  // Fallback finale — iniziale del nome icona
  return (
    <span style={{ fontSize: '1.25rem', fontWeight: 700, color, lineHeight: 1 }}>
      {trimmed.charAt(0).toUpperCase()}
    </span>
  )
}

// ── Componente principale ─────────────────────────────────────────────────────
const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  onCategoryClick,
  templateCounts = {},
}) => {

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <FolderOpen size={48} className="mb-4 opacity-40" />
        <p className="text-lg font-medium">Nessuna categoria disponibile</p>
        <p className="text-sm mt-1">
          Le categorie appariranno qui una volta create
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((category, index) => {

        const color =
          category.color ||
          FALLBACK_COLORS[index % FALLBACK_COLORS.length]

        const count    = templateCounts[category.id] ?? 0
        const iconNode = resolveIcon(category.icon, color)

        return (
          <Card
            key={category.id}
            className="cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            style={{ borderTop: `3px solid ${color}` }}
            onClick={() => onCategoryClick(category)}
          >
            <CardContent className="p-5">

              {/* ── Icona ──────────────────────────────────────────────────── */}
              <div
                className="flex items-center justify-center w-12 h-12 rounded-xl mb-3"
                style={{ backgroundColor: `${color}18` }}
              >
                {iconNode}
              </div>

              {/* ── Nome ───────────────────────────────────────────────────── */}
              <h3 className="font-semibold text-sm leading-tight mb-1">
                {category.name}
              </h3>

              {/* ── Descrizione ────────────────────────────────────────────── */}
              {category.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {category.description}
                </p>
              )}

              {/* ── Badge contatore ─────────────────────────────────────────── */}
              {count > 0 && (
                <Badge
                  variant="secondary"
                  className="text-xs"
                  style={{
                    backgroundColor: `${color}20`,
                    color,
                    border: `1px solid ${color}40`,
                  }}
                >
                  {count} template
                </Badge>
              )}

            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default CategoryGrid