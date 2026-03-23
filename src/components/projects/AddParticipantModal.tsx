// src/components/projects/AddParticipantModal.tsx - VERSIONE CORRETTA

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { ParticipantsService } from '@/services/participants.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, UserPlus, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface AddParticipantModalProps {
  open: boolean
  onClose: () => void
  projectId: string
  onParticipantAdded: () => void // ✅ Callback per aggiornare la lista
}

interface Artist {
  id: string
  first_name: string
  last_name: string
  artist_name: string | null
  email: string | null
  phone: string | null
}

interface Venue {
  id: string
  venue_name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  city: string | null
}

interface Collaborator {
  id: string
  full_name: string
  role: string | null
  email: string | null
  phone: string | null
}

type ParticipantType = 'artist' | 'venue' | 'collaborator'

export default function AddParticipantModal({
  open,
  onClose,
  projectId,
  onParticipantAdded
}: AddParticipantModalProps) {
  const [activeTab, setActiveTab] = useState<ParticipantType>('artist')
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)

  const [artists, setArtists] = useState<Artist[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string>('')
  const [roleInProject, setRoleInProject] = useState('')

  // ✅ Carica dati quando il modal si apre o cambia tab
  useEffect(() => {
    if (open) {
      loadData()
      // Reset selezione quando cambia tab
      setSelectedId('')
      setRoleInProject('')
      setSearchQuery('')
    }
  }, [open, activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'artist') {
        const { data, error } = await supabase
          .from('artists')
          .select('id, first_name, last_name, artist_name, email, phone')
          .order('last_name')

        if (error) {
          logger.error('❌ Error loading artists:', error)
          throw error
        }
        
        setArtists(data || [])
        logger.log('✅ Artists loaded:', data?.length || 0)
      } else if (activeTab === 'venue') {
        const { data, error } = await supabase
          .from('venues')
          .select('id, venue_name, contact_name, email, phone, city')
          .order('venue_name')

        if (error) {
          logger.error('❌ Error loading venues:', error)
          throw error
        }
        
        setVenues(data || [])
        logger.log('✅ Venues loaded:', data?.length || 0)
      } else if (activeTab === 'collaborator') {
        const { data, error } = await supabase
          .from('collaborators')
          .select('id, full_name, role, email, phone')
          .order('full_name')

        if (error) {
          logger.error('❌ Error loading collaborators:', error)
          throw error
        }
        
        setCollaborators(data || [])
        logger.log('✅ Collaborators loaded:', data?.length || 0)
      }
    } catch (error: any) {
      logger.error('❌ Error loading data:', error)
      toast.error('Errore nel caricamento dei dati')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Gestisce l'aggiunta del partecipante
  const handleAdd = async () => {
    if (!selectedId) {
      toast.error('Seleziona un membro da aggiungere')
      return
    }

    if (!projectId) {
      toast.error('ID progetto mancante')
      return
    }

    logger.log('=== 🚀 ADD PARTICIPANT START ===')
    logger.log('Project ID:', projectId)
    logger.log('Selected ID:', selectedId)
    logger.log('Type:', activeTab)
    logger.log('Role:', roleInProject)

    setAdding(true)

    try {
      const params = {
        project_id: projectId,
        participant_type: activeTab,
        participant_id: selectedId,
        role_in_project: roleInProject.trim() || null,
        notes: null,
      }

      logger.log('📦 Params:', params)

      // ✅ Chiama il service
      await ParticipantsService.addParticipant(params)

      logger.log('✅ Participant added successfully')
      toast.success('Membro aggiunto al team con successo!')

      // ✅ IMPORTANTE: Chiama il callback PRIMA di chiudere
      // Questo permette al parent di ricaricare i dati
      await onParticipantAdded()

      // ✅ Chiudi il modal DOPO il callback
      onClose()

      // ✅ Reset del form
      resetForm()

    } catch (error: any) {
      logger.error('❌ Error adding participant:', error)
      console.error('Full error:', error)
      
      // Gestisci errori specifici
      if (error.message?.includes('duplicate key')) {
        toast.error('Questo membro è già nel team')
      } else if (error.message?.includes('not found')) {
        toast.error(`${activeTab} non trovato nel database`)
      } else if (error.code === '23505') {
        toast.error('Questo membro è già stato aggiunto al progetto')
      } else {
        toast.error(error.message || 'Errore nell\'aggiunta del membro')
      }
    } finally {
      setAdding(false)
    }
  }

  // ✅ Reset del form
  const resetForm = () => {
    setSelectedId('')
    setRoleInProject('')
    setSearchQuery('')
  }

  // ✅ Filtra i dati in base alla ricerca
  const filterData = () => {
    const query = searchQuery.toLowerCase().trim()

    if (!query) {
      // Se non c'è ricerca, mostra tutti
      if (activeTab === 'artist') return artists
      if (activeTab === 'venue') return venues
      return collaborators
    }

    if (activeTab === 'artist') {
      return artists.filter(a =>
        `${a.first_name} ${a.last_name}`.toLowerCase().includes(query) ||
        a.artist_name?.toLowerCase().includes(query) ||
        a.email?.toLowerCase().includes(query)
      )
    } else if (activeTab === 'venue') {
      return venues.filter(v =>
        v.venue_name.toLowerCase().includes(query) ||
        v.contact_name?.toLowerCase().includes(query) ||
        v.city?.toLowerCase().includes(query) ||
        v.email?.toLowerCase().includes(query)
      )
    } else {
      return collaborators.filter(c =>
        c.full_name.toLowerCase().includes(query) ||
        c.role?.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query)
      )
    }
  }

  const filteredData = filterData()

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen && !adding) {
        onClose()
      }
    }}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Aggiungi Membro al Team
          </DialogTitle>
          <DialogDescription>
            Seleziona artisti, venue o collaboratori da aggiungere al progetto
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => {
            setActiveTab(v as ParticipantType)
            setSelectedId('') // Reset selezione quando cambia tab
            setSearchQuery('')
          }}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="artist">
                Artisti ({artists.length})
              </TabsTrigger>
              <TabsTrigger value="venue">
                Venue ({venues.length})
              </TabsTrigger>
              <TabsTrigger value="collaborator">
                Collaboratori ({collaborators.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 mt-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={`Cerca ${activeTab === 'artist' ? 'artisti' : activeTab === 'venue' ? 'venue' : 'collaboratori'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  disabled={loading}
                />
              </div>

              {/* List */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Caricamento...</p>
                  </div>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
                  <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">Nessun risultato trovato</p>
                  <p className="text-xs mt-2">
                    {searchQuery ? 'Prova a modificare la ricerca' : 'Nessun elemento disponibile'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto border rounded-lg p-2">
                  {filteredData.map((item: any) => {
                    const isSelected = selectedId === item.id
                    const displayName = activeTab === 'artist' 
                      ? (item.artist_name || `${item.first_name} ${item.last_name}`)
                      : activeTab === 'venue'
                      ? item.venue_name
                      : item.full_name

                    return (
                      <Card
                        key={item.id}
                        className={`p-3 cursor-pointer transition-all ${
                          isSelected 
                            ? 'ring-2 ring-blue-500 bg-blue-50 shadow-md' 
                            : 'hover:bg-gray-50 hover:shadow'
                        }`}
                        onClick={() => setSelectedId(item.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Avatar */}
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                              {displayName.charAt(0).toUpperCase()}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{displayName}</p>
                              {item.email && (
                                <p className="text-xs text-gray-500 truncate">{item.email}</p>
                              )}
                              {activeTab === 'artist' && item.first_name && item.artist_name && (
                                <p className="text-xs text-gray-400 truncate">
                                  {item.first_name} {item.last_name}
                                </p>
                              )}
                              {activeTab === 'venue' && item.city && (
                                <p className="text-xs text-gray-400">{item.city}</p>
                              )}
                              {activeTab === 'collaborator' && item.role && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  {item.role}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Checkbox */}
                          {isSelected && (
                            <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}

              {/* Ruolo nel Progetto */}
              {selectedId && (
                <div className="space-y-2 pt-2 border-t">
                  <Label htmlFor="role">Ruolo nel Progetto (opzionale)</Label>
                  <Input
                    id="role"
                    placeholder="Es: Artista principale, Curatore assistente, Tecnico..."
                    value={roleInProject}
                    onChange={(e) => setRoleInProject(e.target.value)}
                    disabled={adding}
                  />
                  <p className="text-xs text-gray-500">
                    Specifica il ruolo specifico di questo membro nel progetto
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={adding}
          >
            Annulla
          </Button>
          <Button 
            onClick={handleAdd} 
            disabled={!selectedId || adding}
          >
            {adding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Aggiunta in corso...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Aggiungi al Team
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}