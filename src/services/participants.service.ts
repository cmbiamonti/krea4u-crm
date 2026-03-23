// services/participants.service.ts - VERSIONE CORRETTA E COMPLETA

import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import type { 
  ProjectParticipant, 
  AddParticipantInput,
  Artist,
  Venue,
  Collaborator,
  Profile,
  ParticipantType
} from '@/types/database'

export class ParticipantsService {
  
  /**
   * ✅ Helper per ottenere i dati del partecipante dalle tabelle originali
   * Recupera: display_name, email, phone, profile_photo_url, instagram, whatsapp, facebook
   */
  private static async fetchParticipantData(
    participantType: ParticipantType,
    participantId: string
  ): Promise<Partial<ProjectParticipant>> {
    logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    logger.log('🔍 FETCH PARTICIPANT DATA')
    logger.log('Type:', participantType)
    logger.log('ID:', participantId)

    try {
      switch (participantType) {
        case 'artist': {
          logger.log('📌 Fetching ARTIST from artists table...')
          const { data, error } = await supabase
            .from('artists')
            .select('*')
            .eq('id', participantId)
            .single()

          if (error) {
            logger.error('❌ Artist fetch error:', error)
            throw new Error(`Errore nel recupero dell'artista: ${error.message}`)
          }

          if (!data) {
            throw new Error('Artista non trovato')
          }

          logger.log('✅ Artist found:', data.first_name, data.last_name)

          return {
            display_name: data.artist_name || `${data.first_name} ${data.last_name}`,
            email: data.email || null,
            phone: data.phone || null,
            profile_photo_url: (data as any).profile_photo_url || null,
            preferred_contact_method: (data as any).preferred_contact_method || 'email',
          }
        }

        case 'venue': {
          logger.log('📌 Fetching VENUE from venues table...')
          const { data, error } = await supabase
            .from('venues')
            .select('*')
            .eq('id', participantId)
            .single()

          if (error) {
            logger.error('❌ Venue fetch error:', error)
            throw new Error(`Errore nel recupero del venue: ${error.message}`)
          }

          if (!data) {
            throw new Error('Venue non trovato')
          }

          logger.log('✅ Venue found:', data.venue_name)

          return {
            display_name: data.venue_name,
            email: data.email || null,
            phone: data.phone || null,
            profile_photo_url: (data as any).photo_url || null,
            preferred_contact_method: (data as any).preferred_contact_method || 'email',
          }
        }

        case 'collaborator': {
          logger.log('📌 Fetching COLLABORATOR from collaborators table...')
          const { data, error } = await supabase
            .from('collaborators')
            .select('*')
            .eq('id', participantId)
            .single()

          if (error) {
            logger.error('❌ Collaborator fetch error:', error)
            logger.error('Error code:', error.code)
            logger.error('Error message:', error.message)
            throw new Error(`Errore nel recupero del collaboratore: ${error.message}`)
          }

          if (!data) {
            throw new Error('Collaboratore non trovato')
          }

          logger.log('✅ Collaborator found:', data.full_name)

          return {
            display_name: data.full_name,
            email: data.email || null,
            phone: data.phone || null,
            profile_photo_url: data.profile_photo_url || null,
            instagram_handle: data.instagram_handle || null,
            whatsapp_number: data.whatsapp_number || null,
            facebook_profile: data.facebook_profile || null,
            preferred_contact_method: (data as any).preferred_contact_method || 'email',
          }
        }

        case 'curator': {
          logger.log('📌 Fetching CURATOR from profiles table...')
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', participantId)
            .single()

          if (error) {
            logger.error('❌ Curator fetch error:', error)
            throw new Error(`Errore nel recupero del curatore: ${error.message}`)
          }

          if (!data) {
            throw new Error('Curatore non trovato')
          }

          logger.log('✅ Curator found:', (data as any).curator_name || data.company_name)

          return {
            display_name: (data as any).curator_name || data.company_name || 'Curatore',
            email: (data as any).email || null,
            phone: data.phone || null,
            profile_photo_url: (data as any).avatar_url || null,
            instagram_handle: (data as any).instagram_handle || null,
            whatsapp_number: null,
            facebook_profile: null,
            preferred_contact_method: 'email',
          }
        }

        default:
          throw new Error(`Tipo partecipante non supportato: ${participantType}`)
      }
    } catch (error: any) {
      logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      logger.error('❌ ERROR IN FETCH PARTICIPANT DATA')
      logger.error('Error:', error.message)
      logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      throw error
    }
  }

  /**
   * ✅ Aggiungi singolo partecipante al progetto
   */
  static async addParticipant(input: AddParticipantInput): Promise<ProjectParticipant> {
    logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    logger.log('➕ ADD SINGLE PARTICIPANT')
    logger.log('Project ID:', input.project_id)
    logger.log('Type:', input.participant_type)
    logger.log('Participant ID:', input.participant_id)
    logger.log('Role:', input.role_in_project)

    // Verifica autenticazione
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Non autenticato')
    }

    logger.log('✅ User authenticated:', user.id)

    try {
      // 1. Verifica duplicati
      logger.log('🔍 Checking for duplicates...')
      const { data: existing, error: checkError } = await supabase
        .from('project_participants')
        .select('id')
        .eq('project_id', input.project_id)
        .eq('participant_id', input.participant_id)
        .eq('participant_type', input.participant_type)
        .maybeSingle()

      if (checkError) {
        logger.error('❌ Duplicate check error:', checkError)
        throw checkError
      }

      if (existing) {
        logger.warn('⚠️ Duplicate found')
        throw new Error('Questo membro è già nel team del progetto')
      }

      logger.log('✅ No duplicates found')

      // 2. Fetch dati del partecipante dalla tabella originale
      const participantData = await this.fetchParticipantData(
        input.participant_type,
        input.participant_id
      )

      logger.log('✅ Participant data fetched')

      // 3. Prepara dati per insert
      const insertData = {
        project_id: input.project_id,
        participant_type: input.participant_type,
        participant_id: input.participant_id,
        role_in_project: input.role_in_project?.trim() || null,
        notes: input.notes?.trim() || null,
        added_by: user.id,
        display_name: participantData.display_name || 'Nome non disponibile',
        email: participantData.email,
        phone: participantData.phone,
        profile_photo_url: participantData.profile_photo_url,
        instagram_handle: participantData.instagram_handle,
        whatsapp_number: participantData.whatsapp_number,
        facebook_profile: participantData.facebook_profile,
        preferred_contact_method: participantData.preferred_contact_method,
      }

      logger.log('📦 INSERT DATA:', {
        ...insertData,
        display_name: insertData.display_name,
        email: insertData.email,
        has_instagram: !!insertData.instagram_handle,
        has_whatsapp: !!insertData.whatsapp_number,
        has_facebook: !!insertData.facebook_profile,
      })

      // 4. Insert nel database
      const { data, error } = await supabase
        .from('project_participants')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        logger.error('❌ INSERT ERROR')
        logger.error('Code:', error.code)
        logger.error('Message:', error.message)
        logger.error('Details:', error.details)
        logger.error('Hint:', error.hint)
        logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        throw error
      }

      logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      logger.log('✅ PARTICIPANT ADDED SUCCESSFULLY')
      logger.log('ID:', data.id)
      logger.log('Display Name:', data.display_name)
      logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      return data as ProjectParticipant
    } catch (error: any) {
      logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      logger.error('❌ FINAL ERROR IN ADD PARTICIPANT')
      logger.error('Error:', error.message || error)
      logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      throw error
    }
  }

  /**
   * ✅ Aggiungi multipli partecipanti al progetto
   */
  static async addMultipleParticipants(
    projectId: string,
    participants: Array<{
      type: string
      id: string
      role?: string
    }>
  ): Promise<ProjectParticipant[]> {
    logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    logger.log('➕ ADD MULTIPLE PARTICIPANTS')
    logger.log('Project ID:', projectId)
    logger.log('Count:', participants.length)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Non autenticato')
    }

    try {
      // Fetch dati per ogni partecipante
      const inputsWithData = await Promise.all(
        participants.map(async (p) => {
          const participantData = await this.fetchParticipantData(
            p.type as ParticipantType,
            p.id
          )

          return {
            project_id: projectId,
            participant_type: p.type,
            participant_id: p.id,
            role_in_project: p.role?.trim() || null,
            added_by: user.id,
            notes: null,
            display_name: participantData.display_name || 'Nome non disponibile',
            email: participantData.email,
            phone: participantData.phone,
            profile_photo_url: participantData.profile_photo_url,
            instagram_handle: participantData.instagram_handle,
            whatsapp_number: participantData.whatsapp_number,
            facebook_profile: participantData.facebook_profile,
            preferred_contact_method: participantData.preferred_contact_method,
          }
        })
      )

      logger.log('📦 Inserting', inputsWithData.length, 'participants')

      const { data, error } = await supabase
        .from('project_participants')
        .insert(inputsWithData)
        .select()

      if (error) {
        logger.error('❌ Insert error:', error)
        throw error
      }

      logger.log('✅ Participants added:', data?.length)
      logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      return data as ProjectParticipant[]
    } catch (error: any) {
      logger.error('❌ Error in addMultipleParticipants:', error)
      throw error
    }
  }

  /**
   * ✅ Ottieni tutti i partecipanti di un progetto
   */
  static async getProjectParticipants(projectId: string): Promise<ProjectParticipant[]> {
    logger.log('📋 Getting participants for project:', projectId)

    const { data, error } = await supabase
      .from('project_participants')
      .select('*')
      .eq('project_id', projectId)
      .order('added_at', { ascending: true })

    if (error) {
      logger.error('❌ Error fetching participants:', error)
      throw error
    }

    logger.log('✅ Participants found:', data?.length || 0)
    return (data || []) as ProjectParticipant[]
  }

  /**
   * ✅ Rimuovi partecipante dal progetto
   */
  static async removeParticipant(participantId: string): Promise<void> {
    logger.log('🗑️ Removing participant:', participantId)
    
    const { error } = await supabase
      .from('project_participants')
      .delete()
      .eq('id', participantId)

    if (error) {
      logger.error('❌ Delete error:', error)
      throw error
    }

    logger.log('✅ Participant removed')
  }

  /**
   * ✅ Aggiorna informazioni partecipante
   */
  static async updateParticipant(
    participantId: string,
    updates: Partial<ProjectParticipant>
  ): Promise<ProjectParticipant> {
    logger.log('📝 Updating participant:', participantId)

    const { data, error } = await supabase
      .from('project_participants')
      .update(updates)
      .eq('id', participantId)
      .select()
      .single()

    if (error) {
      logger.error('❌ Update error:', error)
      throw error
    }

    logger.log('✅ Participant updated')
    return data as ProjectParticipant
  }

  /**
   * ✅ Sincronizza dati del partecipante dalla tabella originale
   */
  static async syncParticipantData(participantId: string): Promise<ProjectParticipant> {
    logger.log('🔄 Syncing participant data:', participantId)

    const { data: participant, error: fetchError } = await supabase
      .from('project_participants')
      .select('*')
      .eq('id', participantId)
      .single()

    if (fetchError) {
      logger.error('❌ Fetch error:', fetchError)
      throw fetchError
    }

    const typedParticipant = participant as ProjectParticipant

    const freshData = await this.fetchParticipantData(
      typedParticipant.participant_type,
      typedParticipant.participant_id
    )

    return this.updateParticipant(participantId, freshData)
  }

  /**
   * ✅ Ottieni lista artisti disponibili
   */
  static async getAvailableArtists(): Promise<Artist[]> {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .order('last_name')

    if (error) throw error
    return (data || []) as Artist[]
  }

  /**
   * ✅ Ottieni lista venue disponibili
   */
  static async getAvailableVenues(): Promise<Venue[]> {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .order('venue_name')

    if (error) throw error
    return (data || []) as Venue[]
  }

  /**
   * ✅ Ottieni lista collaboratori disponibili
   */
  static async getAvailableCollaborators(): Promise<Collaborator[]> {
    const { data, error } = await supabase
      .from('collaborators')
      .select('*')
      .order('full_name')

    if (error) throw error
    return (data || []) as Collaborator[]
  }

  /**
   * ✅ Ottieni profilo del curatore corrente
   */
  static async getCurrentCuratorProfile(): Promise<Profile> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non autenticato')

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return data as Profile
  }

  /**
   * ✅ Verifica se l'utente corrente è partecipante del progetto
   */
  static async isProjectParticipant(projectId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data } = await supabase
      .from('project_participants')
      .select('id')
      .eq('project_id', projectId)
      .eq('participant_type', 'curator')
      .eq('participant_id', user.id)
      .maybeSingle()

    return !!data
  }

  /**
   * ✅ Ottieni record partecipante dell'utente corrente
   */
  static async getCurrentUserParticipant(projectId: string): Promise<ProjectParticipant | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
      .from('project_participants')
      .select('*')
      .eq('project_id', projectId)
      .eq('participant_type', 'curator')
      .eq('participant_id', user.id)
      .maybeSingle()

    if (!data) return null
    return data as ProjectParticipant
  }
}