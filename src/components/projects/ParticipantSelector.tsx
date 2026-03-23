// src/components/projects/ParticipantSelector.tsx

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { ParticipantsService } from '@/services/participants.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Loader2, Search } from 'lucide-react'
import { toast } from 'sonner'

type ParticipantType = 'artist' | 'venue' | 'collaborator'

interface ParticipantSelectorProps {
  projectId: string
  onParticipantsAdded: () => void
}

interface Artist {
  id: string
  first_name: string
  last_name: string
  artist_name: string | null
  email: string | null
  phone: string | null
  instagram_handle?: string | null
  whatsapp_number?: string | null
  facebook_profile?: string | null
  website?: string | null
  bio?: string | null
  city?: string | null
  user_id?: string | null
  [key: string]: any
}

interface Venue {
  id: string
  venue_name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  city: string | null
  website?: string | null
  description?: string | null
  social_media?: any
  user_id?: string | null
  [key: string]: any
}

interface Collaborator {
  id: string
  full_name: string
  role: string | null
  email: string | null
  phone: string | null
  instagram_handle?: string | null
  whatsapp_number?: string | null
  facebook_profile?: string | null
  user_id?: string | null
  [key: string]: any
}

export function ParticipantSelector({
  projectId,
  onParticipantsAdded
}: ParticipantSelectorProps) {
  const [selectedType, setSelectedType]   = useState<ParticipantType>('artist')
  const [artists, setArtists]             = useState<Artist[]>([])
  const [venues, setVenues]               = useState<Venue[]>([])
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [selectedIds, setSelectedIds]     = useState<string[]>([])

  // ✅ Un loading per il caricamento iniziale (tutti e 3)
  const [loadingAll, setLoadingAll]       = useState(false)
  const [adding, setAdding]               = useState(false)
  const [searchQuery, setSearchQuery]     = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // ── Step 1: recupera userId al mount ───────────────────────────────────────
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
        logger.log('✅ ParticipantSelector: currentUserId =', user.id)
      } else {
        logger.warn('⚠️ ParticipantSelector: no authenticated user')
      }
    }
    fetchUser()
  }, [])

  // ── Step 2: quando userId è pronto, carica TUTTI e 3 i tipi in parallelo ───
  useEffect(() => {
    if (currentUserId) {
      loadAllData(currentUserId)
    }
  }, [currentUserId])

  // ── Reset selezione e ricerca quando cambia tab ────────────────────────────
  useEffect(() => {
    setSelectedIds([])
    setSearchQuery('')
  }, [selectedType])

  // ── Carica artisti, venue e collaboratori in parallelo ─────────────────────
  const loadAllData = async (userId: string) => {
    setLoadingAll(true)
    logger.log('📂 Loading ALL participant types for userId:', userId)

    try {
      const [artistsRes, venuesRes, collaboratorsRes] = await Promise.all([
        supabase
          .from('artists')
          .select('*')
          .eq('created_by', userId)
          .order('last_name'),

        supabase
          .from('venues')
          .select('*')
          .eq('created_by', userId)
          .order('venue_name'),

        supabase
          .from('collaborators')
          .select('*')
          .eq('created_by', userId)
          .order('full_name'),
      ])

      // ── Artisti ────────────────────────────────────────────────────────────
      if (artistsRes.error) {
        logger.error('❌ Error loading artists:', artistsRes.error)
        toast.error('Errore nel caricamento artisti')
      } else {
        logger.log('✅ Artists loaded:', artistsRes.data?.length ?? 0)
        setArtists((artistsRes.data || []) as unknown as Artist[])
      }

      // ── Venue ──────────────────────────────────────────────────────────────
      if (venuesRes.error) {
        logger.error('❌ Error loading venues:', venuesRes.error)
        toast.error('Errore nel caricamento venue')
      } else {
        logger.log('✅ Venues loaded:', venuesRes.data?.length ?? 0)
        setVenues((venuesRes.data || []) as unknown as Venue[])
      }

      // ── Collaboratori ──────────────────────────────────────────────────────
      if (collaboratorsRes.error) {
        logger.error('❌ Error loading collaborators:', collaboratorsRes.error)
        toast.error('Errore nel caricamento collaboratori')
      } else {
        logger.log('✅ Collaborators loaded:', collaboratorsRes.data?.length ?? 0)
        setCollaborators((collaboratorsRes.data || []) as unknown as Collaborator[])
      }

    } catch (error: any) {
      logger.error('❌ Unexpected error loading all data:', error)
      toast.error(`Errore nel caricamento: ${error.message}`)
    } finally {
      setLoadingAll(false)
    }
  }

  // ── Aggiunge i partecipanti selezionati al progetto ────────────────────────
  const handleAddParticipants = async () => {
    if (selectedIds.length === 0) {
      toast.warning('Seleziona almeno un membro')
      return
    }

    logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    logger.log('➕ ADDING PARTICIPANTS')
    logger.log('Project ID:', projectId)
    logger.log('Type:', selectedType)
    logger.log('Selected IDs:', selectedIds)

    setAdding(true)

    try {
      for (const id of selectedIds) {
        await ParticipantsService.addParticipant({
          project_id:       projectId,
          participant_type: selectedType,
          participant_id:   id,
          role_in_project:  null,
          notes:            null,
        })
      }

      logger.log('✅ All participants added successfully')
      toast.success(`${selectedIds.length} membri aggiunti al team!`)

      setSelectedIds([])
      onParticipantsAdded()

    } catch (error: any) {
      logger.error('❌ Error adding participants:', error)

      if (error.message?.includes('duplicate key') || error.code === '23505') {
        toast.error('Uno o più membri sono già nel team')
      } else {
        toast.error(`Errore: ${error.message}`)
      }
    } finally {
      setAdding(false)
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getCurrentList = (): any[] => {
    switch (selectedType) {
      case 'artist':       return artists
      case 'venue':        return venues
      case 'collaborator': return collaborators
      default:             return []
    }
  }

  const getDisplayName = (item: any): string => {
    if (selectedType === 'artist') {
      return item.artist_name || `${item.first_name} ${item.last_name}`
    }
    if (selectedType === 'venue')        return item.venue_name
    if (selectedType === 'collaborator') return item.full_name
    return 'Nome non disponibile'
  }

  const getPhotoUrl = (item: any): string | null =>
    item.profile_photo_url || item.photo_url || null

  const getVenueSocial = (venue: any, platform: string): string | null => {
    if (!venue.social_media) return null
    try {
      const social = typeof venue.social_media === 'string'
        ? JSON.parse(venue.social_media)
        : venue.social_media
      return social?.[platform] || null
    } catch {
      return null
    }
  }

  const getFilteredList = () => {
    const list = getCurrentList()
    if (!searchQuery.trim()) return list

    const query = searchQuery.toLowerCase().trim()

    return list.filter((item: any) => {
      const name  = getDisplayName(item).toLowerCase()
      const email = item.email?.toLowerCase() || ''
      const city  = item.city?.toLowerCase()  || ''
      const role  = item.role?.toLowerCase()  || ''

      return (
        name.includes(query)  ||
        email.includes(query) ||
        city.includes(query)  ||
        role.includes(query)
      )
    })
  }

  const filteredList = getFilteredList()

  // ── Spinner iniziale mentre recupera userId ────────────────────────────────
  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mr-2" />
        <p className="text-sm text-gray-600">Verifica autenticazione...</p>
      </div>
    )
  }

  // ── Spinner mentre carica tutti e 3 i tipi ─────────────────────────────────
  if (loadingAll) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600">Caricamento partecipanti...</p>
        </div>
      </div>
    )
  }

  // ── Render principale ──────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-1">Aggiungi Membri al Team</h3>
        <p className="text-sm text-gray-600">
          Seleziona uno o più membri da aggiungere al progetto
        </p>
      </div>

      {/* ── Selettore tipo con contatori aggiornati ─────────────────────────── */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={selectedType === 'artist' ? 'default' : 'outline'}
          onClick={() => setSelectedType('artist')}
          disabled={adding}
        >
          {/* ✅ contatore sempre corretto perché artists è già popolato */}
          Artisti ({artists.length})
        </Button>
        <Button
          type="button"
          variant={selectedType === 'venue' ? 'default' : 'outline'}
          onClick={() => setSelectedType('venue')}
          disabled={adding}
        >
          Venue ({venues.length})
        </Button>
        <Button
          type="button"
          variant={selectedType === 'collaborator' ? 'default' : 'outline'}
          onClick={() => setSelectedType('collaborator')}
          disabled={adding}
        >
          Collaboratori ({collaborators.length})
        </Button>
      </div>

      {/* ── Ricerca ─────────────────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder={`Cerca ${
            selectedType === 'artist'
              ? 'artisti'
              : selectedType === 'venue'
              ? 'venue'
              : 'collaboratori'
          }...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={adding}
        />
      </div>

      {/* ── Lista selezionabile ──────────────────────────────────────────────── */}
      <div className="border rounded-lg">
        <div className="max-h-[400px] overflow-y-auto p-2">
          {filteredList.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="font-medium">Nessun risultato trovato</p>
              <p className="text-xs mt-1">
                {searchQuery
                  ? 'Prova a modificare la ricerca'
                  : `Nessun ${
                      selectedType === 'artist'
                        ? 'artista'
                        : selectedType === 'venue'
                        ? 'venue'
                        : 'collaboratore'
                    } nel tuo database`}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredList.map((item: any) => {
                const isSelected  = selectedIds.includes(item.id)
                const displayName = getDisplayName(item)
                const photoUrl    = getPhotoUrl(item)

                return (
                  <Card
                    key={item.id}
                    className={`p-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedIds(
                        isSelected
                          ? selectedIds.filter(id => id !== item.id)
                          : [...selectedIds, item.id]
                      )
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded h-4 w-4"
                        onClick={(e) => e.stopPropagation()}
                      />

                      {/* Avatar */}
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={displayName}
                          className="w-10 h-10 rounded-full object-cover
                                     ring-2 ring-white shadow"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            const fallback = e.currentTarget.nextElementSibling
                            if (fallback) {
                              (fallback as HTMLElement).style.display = 'flex'
                            }
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-10 h-10 rounded-full
                          bg-gradient-to-br from-blue-500 to-purple-600
                          flex items-center justify-center
                          text-white font-bold shadow
                          ${photoUrl ? 'hidden' : ''}`}
                      >
                        {displayName.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{displayName}</p>
                        {item.email && (
                          <p className="text-xs text-gray-500 truncate">
                            {item.email}
                          </p>
                        )}
                        {selectedType === 'artist' &&
                          item.first_name &&
                          item.artist_name && (
                            <p className="text-xs text-gray-400">
                              {item.first_name} {item.last_name}
                            </p>
                          )}
                        {selectedType === 'venue' && item.city && (
                          <p className="text-xs text-gray-400">{item.city}</p>
                        )}
                        {selectedType === 'collaborator' && item.role && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {item.role}
                          </Badge>
                        )}
                      </div>

                      {/* Icone canali */}
                      <div className="flex gap-1 flex-shrink-0">
                        {item.email && (
                          <span className="text-xs" title="Email">📧</span>
                        )}
                        {selectedType === 'venue' ? (
                          <>
                            {getVenueSocial(item, 'instagram') && (
                              <span className="text-xs" title="Instagram">📷</span>
                            )}
                            {getVenueSocial(item, 'facebook') && (
                              <span className="text-xs" title="Facebook">👍</span>
                            )}
                          </>
                        ) : (
                          <>
                            {item.whatsapp_number && (
                              <span className="text-xs" title="WhatsApp">💬</span>
                            )}
                            {item.instagram_handle && (
                              <span className="text-xs" title="Instagram">📷</span>
                            )}
                            {item.facebook_profile && (
                              <span className="text-xs" title="Facebook">👍</span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer azioni ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <span className="text-sm text-gray-600">
          {selectedIds.length > 0 ? (
            <span className="font-semibold text-blue-600">
              {selectedIds.length}{' '}
              {selectedIds.length === 1 ? 'selezionato' : 'selezionati'}
            </span>
          ) : (
            'Nessuna selezione'
          )}
        </span>
        <Button
          onClick={handleAddParticipants}
          disabled={selectedIds.length === 0 || adding}
          className="min-w-[200px]"
        >
          {adding ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Aggiunta in corso...
            </>
          ) : (
            `Aggiungi ${
              selectedIds.length > 0 ? `(${selectedIds.length})` : ''
            } al Team`
          )}
        </Button>
      </div>
    </div>
  )
}