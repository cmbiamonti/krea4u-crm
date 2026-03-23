// src/components/Sidebar.tsx

import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  Home,
  Users,
  Building2,
  FolderOpen,
  Settings,
  LogOut,
  X,
  UserPlus,
  Calculator,
  BookOpen,
  Headphones,
  Mail,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Logo from './Logo'

// ✅ MENU PRINCIPALE — tutti i path prefissati con /app/
const navigation = [
  {
    name: 'Dashboard',
    href: '/app',
    icon: Home,
    exact: true,
  },
  {
    name: 'Artisti',
    href: '/app/artists',
    icon: Users,
  },
  {
    name: 'Spazi',
    href: '/app/venues',
    icon: Building2,
  },
  {
    name: 'Progetti',
    href: '/app/projects',
    icon: FolderOpen,
  },
  {
    name: 'Collaboratori',
    href: '/app/collaborators',
    icon: UserPlus,
  },
  {
    name: 'Messaggi',
    href: '/app/messages',
    icon: Mail,
  },
  {
    name: 'Gestione Budget',
    href: '/app/budget',
    icon: Calculator,
  },
  {
    name: 'Impostazioni',
    href: '/app/settings',
    icon: Settings,
  },
]

// ✅ SEZIONE SUPPORTO
const supportNavigation = [
  {
    name: "Manuale d'Uso",
    href: 'https://jrfosqvvjkjvguxbnvhm.supabase.co/storage/v1/object/public/template-documents/manuale-utente-crm.pdf',
    icon: BookOpen,
    external: true,
  },
  {
    name: 'Supporto Tecnico',
    href: '/app/support',
    icon: Headphones,
    external: false,
  },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const { user, signOut } = useAuth()

  const getInitials = () => {
    if (!user?.email) return 'U'
    return user.email.substring(0, 2).toUpperCase()
  }

  const getUserName = () => {
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
    }
    return user?.email || 'Utente'
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-[380px] bg-white border-r border-neutral-200">
        <SidebarContent
          location={location}
          user={user}
          getInitials={getInitials}
          getUserName={getUserName}
          signOut={signOut}
        />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-neutral-200 transform transition-transform duration-300 ease-in-out lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* ✅ Header mobile — logo linkato alla HeroPage */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <Link
            to="/"
            onClick={onClose}
            title="Torna alla Home"
            className="hover:opacity-80 transition-opacity"
          >
            <Logo size="sm" showIcon={true} />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <SidebarContent
          location={location}
          user={user}
          getInitials={getInitials}
          getUserName={getUserName}
          signOut={signOut}
          onItemClick={onClose}
        />
      </aside>
    </>
  )
}

interface SidebarContentProps {
  location: ReturnType<typeof useLocation>
  user: any
  getInitials: () => string
  getUserName: () => string
  signOut: () => void
  onItemClick?: () => void
}

function SidebarContent({
  location,
  user,
  getInitials,
  getUserName,
  signOut,
  onItemClick,
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">

      {/* ✅ Logo desktop — linkato alla HeroPage (/) */}
      <div className="hidden lg:flex items-center gap-3 p-4 border-b border-neutral-200">
        <Link
          to="/"
          title="Torna alla Home"
          className="hover:opacity-80 transition-opacity duration-200"
        >
          <Logo size="sm" showIcon={true} />
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-8 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          // Gestisci eventuali query params (es. /app/settings?tab=team)
          const [basePath, queryString] = item.href.split('?')
          const searchParams = new URLSearchParams(queryString || '')
          const tabParam = searchParams.get('tab')

          const isActive = tabParam
            ? location.pathname === basePath &&
              location.search.includes(`tab=${tabParam}`)
            : item.exact
            ? // Dashboard: match esatto su /app e /app/
              location.pathname === '/app' || location.pathname === '/app/'
            : // Altre voci: match esatto O sotto-path
              location.pathname === item.href ||
              location.pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onItemClick}
              className={cn(
                'flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'text-neutral-700 hover:bg-neutral-100 hover:text-primary'
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={cn(
                    'h-5 w-5 transition-transform group-hover:scale-110',
                    isActive ? 'text-white' : 'text-neutral-600'
                  )}
                />
                <span>{item.name}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Supporto Section */}
      <div className="px-3 pb-3">
        <Separator className="mb-3" />

        <div className="space-y-1">
          <p className="px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
            Supporto
          </p>

          {supportNavigation.map((item) => {
            const isActive =
              !item.external && location.pathname === item.href

            // Link esterno — apre in nuova tab
            if (item.external) {
              return (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onItemClick}
                  className="flex items-center justify-between px-4 py-2.5 text-sm
                             font-medium rounded-lg transition-all duration-200 group
                             text-neutral-700 hover:bg-neutral-100 hover:text-primary"
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className="h-4 w-4 transition-transform group-hover:scale-110
                                 text-neutral-600"
                    />
                    <span>{item.name}</span>
                  </div>
                  <svg
                    className="h-3 w-3 text-neutral-400 group-hover:text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              )
            }

            // Link interno
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onItemClick}
                className={cn(
                  'flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group',
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-neutral-700 hover:bg-neutral-100 hover:text-primary'
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={cn(
                      'h-4 w-4 transition-transform group-hover:scale-110',
                      isActive ? 'text-white' : 'text-neutral-600'
                    )}
                  />
                  <span>{item.name}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <Separator />

      {/* User Profile */}
      <div className="p-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r
                        from-blue-50 to-purple-50 border border-neutral-200">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-primary text-white font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-neutral-900 truncate">
              {getUserName()}
            </p>
            <p className="text-xs text-neutral-600 truncate">{user?.email}</p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="flex-shrink-0 h-8 w-8 text-neutral-600 hover:text-error
                       hover:bg-error/10 transition-colors"
            title="Esci"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

    </div>
  )
}