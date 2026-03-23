// src/services/collaborator.service.ts

import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type {
  Collaborator,
  CollaboratorCategory,
  CollaboratorDocument,
  CreateCollaboratorDTO,
  UpdateCollaboratorDTO,
  CollaboratorFilters,
  CollaboratorStatus
} from '@/types/collaborator.types';

// ========== HELPER FUNCTIONS ==========

async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  return user.id;
}

/**
 * Formatta una data per PostgreSQL (YYYY-MM-DD)
 * Gestisce stringhe, Date objects e valori nulli/undefined
 */
function formatDateForDB(date: string | Date | null | undefined): string | null {
  if (!date) return null;
  
  try {
    // Se è già una stringa nel formato corretto (YYYY-MM-DD), ritornala
    if (typeof date === 'string') {
      // Se è una stringa vuota, ritorna null
      if (date.trim() === '') return null;
      
      // Se è già nel formato YYYY-MM-DD, ritornala
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }
      
      // Altrimenti, prova a parsarla come Date
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) return null;
      
      return parsed.toISOString().split('T')[0];
    }
    
    // Se è un Date object
    if (date instanceof Date) {
      if (isNaN(date.getTime())) return null;
      return date.toISOString().split('T')[0];
    }
    
    return null;
  } catch (error) {
    logger.error('❌ Error formatting date:', error);
    return null;
  }
}

/**
 * Pulisce i dati del collaboratore prima di inviarli al database
 */
function sanitizeCollaboratorData(data: CreateCollaboratorDTO | UpdateCollaboratorDTO): any {
  const sanitized: any = { ...data };
  
  // ✅ Formatta le date
  if ('contract_start_date' in sanitized) {
    sanitized.contract_start_date = formatDateForDB(sanitized.contract_start_date);
  }
  
  if ('contract_end_date' in sanitized) {
    sanitized.contract_end_date = formatDateForDB(sanitized.contract_end_date);
  }
  
  // ✅ Rimuovi campi undefined (Supabase non li gestisce bene)
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === undefined) {
      delete sanitized[key];
    }
  });
  
  // ✅ Converte stringhe vuote in null
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === '') {
      sanitized[key] = null;
    }
  });
  
  // ✅ Assicurati che gli array siano validi o null
  if (sanitized.skills && !Array.isArray(sanitized.skills)) {
    sanitized.skills = null;
  }
  if (sanitized.languages && !Array.isArray(sanitized.languages)) {
    sanitized.languages = null;
  }
  if (sanitized.certifications && !Array.isArray(sanitized.certifications)) {
    sanitized.certifications = null;
  }
  
  // ✅ Converti numeri stringa in numeri
  if (sanitized.hourly_rate && typeof sanitized.hourly_rate === 'string') {
    sanitized.hourly_rate = parseFloat(sanitized.hourly_rate) || null;
  }
  if (sanitized.daily_rate && typeof sanitized.daily_rate === 'string') {
    sanitized.daily_rate = parseFloat(sanitized.daily_rate) || null;
  }
  
  return sanitized;
}

// ========== SERVICE ==========

export const collaboratorService = {
  // ========== CATEGORIES ==========
  
  async getCategories(): Promise<CollaboratorCategory[]> {
    try {
      logger.log('📋 Fetching collaborator categories');
      
      const { data, error } = await supabase
        .from('collaborator_categories')
        .select('*')
        .order('order_index');
      
      if (error) throw error;
      
      logger.log('✅ Categories fetched:', data?.length || 0);
      return (data || []) as CollaboratorCategory[];
    } catch (error: any) {
      logger.error('❌ Error fetching categories:', error);
      throw new Error(error.message || 'Errore nel recupero delle categorie');
    }
  },

  async createCategory(
    name: string, 
    description?: string, 
    color?: string, 
    icon?: string
  ): Promise<CollaboratorCategory> {
    try {
      logger.log('📝 Creating category:', name);
      
      const { data, error } = await supabase
        .from('collaborator_categories')
        .insert({ name, description, color, icon })
        .select()
        .single();
      
      if (error) throw error;
      
      logger.log('✅ Category created:', data);
      return data as CollaboratorCategory;
    } catch (error: any) {
      logger.error('❌ Error creating category:', error);
      throw new Error(error.message || 'Errore nella creazione della categoria');
    }
  },

  async updateCategory(
    id: string,
    name: string,
    description?: string,
    color?: string,
    icon?: string
  ): Promise<CollaboratorCategory> {
    try {
      logger.log('📝 Updating category:', id);
      
      const { data, error } = await supabase
        .from('collaborator_categories')
        .update({ name, description, color, icon })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      logger.log('✅ Category updated:', data);
      return data as CollaboratorCategory;
    } catch (error: any) {
      logger.error('❌ Error updating category:', error);
      throw new Error(error.message || 'Errore nell\'aggiornamento della categoria');
    }
  },

  async deleteCategory(id: string): Promise<void> {
    try {
      logger.log('🗑️ Deleting category:', id);
      
      const { error } = await supabase
        .from('collaborator_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      logger.log('✅ Category deleted');
    } catch (error: any) {
      logger.error('❌ Error deleting category:', error);
      throw new Error(error.message || 'Errore nell\'eliminazione della categoria');
    }
  },

  // ========== COLLABORATORS ==========
  
  async getCollaborators(filters?: CollaboratorFilters): Promise<Collaborator[]> {
    try {
      logger.log('📋 Fetching collaborators with filters:', filters);
      
      // ✅ Costruisci la query in modo dichiarativo
      let query = supabase
        .from('collaborators')
        .select(`
          *,
          category:collaborator_categories(*)
        `);
      
      // ✅ Applica filtri uno alla volta (senza riassegnare query)
      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      
      if (filters?.role) {
        query = query.eq('role', filters.role);
      }
      
      if (filters?.search) {
        const searchTerm = filters.search;
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`);
      }
      
      // ✅ FIX: Usa .filter() invece di .eq() per contract_type
      if (filters?.contract_type) {
        query = query.filter('contract_type', 'eq', filters.contract_type);
      }
      
      // ✅ Aggiungi order alla fine
      query = query.order('full_name', { ascending: true });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      let result = (data || []) as unknown as Collaborator[];
      
      // ✅ Filtra STATUS in memoria (dopo il fetch)
      if (filters?.status) {
        result = result.filter(c => c.status === filters.status);
      } else {
        // Default: escludi archiviati se non specificato
        result = result.filter(c => c.status !== 'archived');
      }
      
      logger.log('✅ Collaborators fetched:', result.length);
      return result;
    } catch (error: any) {
      logger.error('❌ Error fetching collaborators:', error);
      throw new Error(error.message || 'Errore nel recupero dei collaboratori');
    }
  },

  async getCollaborator(id: string): Promise<Collaborator> {
    try {
      logger.log('🔍 Fetching collaborator:', id);
      
      const { data, error } = await supabase
        .from('collaborators')
        .select(`
          *,
          category:collaborator_categories(*),
          documents:collaborator_documents(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      logger.log('✅ Collaborator fetched:', data);
      return data as unknown as Collaborator;
    } catch (error: any) {
      logger.error('❌ Error fetching collaborator:', error);
      throw new Error(error.message || 'Errore nel recupero del collaboratore');
    }
  },

  async createCollaborator(dto: CreateCollaboratorDTO): Promise<Collaborator> {
    try {
      logger.log('📝 Creating collaborator:', dto);
      
      const userId = await getCurrentUserId();
      
      // ✅ Pulisci e formatta i dati SENZA created_by
      const sanitizedData = sanitizeCollaboratorData({
        ...dto,
        status: dto.status || 'active'
      });
      
      // ✅ Aggiungi created_by DOPO la sanitizzazione
      const dataToInsert = {
        ...sanitizedData,
        created_by: userId
      };
      
      logger.log('📤 Data to insert:', dataToInsert);
      
      const { data, error } = await supabase
        .from('collaborators')
        .insert(dataToInsert)
        .select(`
          *,
          category:collaborator_categories(*)
        `)
        .single();
      
      if (error) {
        logger.error('❌ Database error:', error);
        throw error;
      }
      
      logger.log('✅ Collaborator created:', data);
      return data as unknown as Collaborator;
    } catch (error: any) {
      logger.error('❌ Error creating collaborator:', error);
      throw new Error(error.message || 'Errore nella creazione del collaboratore');
    }
  },

  async updateCollaborator(id: string, dto: UpdateCollaboratorDTO): Promise<Collaborator> {
    try {
      logger.log('📝 Updating collaborator:', id, dto);
      
      // ✅ Pulisci e formatta i dati
      const sanitizedData = sanitizeCollaboratorData(dto);
      
      logger.log('📤 Sanitized update data:', sanitizedData);
      
      const { data, error } = await supabase
        .from('collaborators')
        .update(sanitizedData)
        .eq('id', id)
        .select(`
          *,
          category:collaborator_categories(*)
        `)
        .single();
      
      if (error) {
        logger.error('❌ Database error:', error);
        throw error;
      }
      
      logger.log('✅ Collaborator updated:', data);
      return data as unknown as Collaborator;
    } catch (error: any) {
      logger.error('❌ Error updating collaborator:', error);
      throw new Error(error.message || 'Errore nell\'aggiornamento del collaboratore');
    }
  },

  async deleteCollaborator(id: string): Promise<void> {
    try {
      logger.log('🗑️ Deleting collaborator:', id);
      
      const { error } = await supabase
        .from('collaborators')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      logger.log('✅ Collaborator deleted');
    } catch (error: any) {
      logger.error('❌ Error deleting collaborator:', error);
      throw new Error(error.message || 'Errore nell\'eliminazione del collaboratore');
    }
  },

  async archiveCollaborator(id: string): Promise<Collaborator> {
    try {
      logger.log('📦 Archiving collaborator:', id);
      
      return this.updateCollaborator(id, {
        status: 'archived',
        archived_at: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('❌ Error archiving collaborator:', error);
      throw new Error(error.message || 'Errore nell\'archiviazione del collaboratore');
    }
  },

  async unarchiveCollaborator(id: string): Promise<Collaborator> {
    try {
      logger.log('♻️ Unarchiving collaborator:', id);
      
      return this.updateCollaborator(id, {
        status: 'active',
        archived_at: null
      });
    } catch (error: any) {
      logger.error('❌ Error unarchiving collaborator:', error);
      throw new Error(error.message || 'Errore nel ripristino del collaboratore');
    }
  },

  async toggleCollaboratorStatus(id: string, status: CollaboratorStatus): Promise<Collaborator> {
    try {
      logger.log('🔄 Toggling collaborator status:', id, status);
      
      return this.updateCollaborator(id, { 
        status,
        archived_at: status === 'archived' ? new Date().toISOString() : null
      });
    } catch (error: any) {
      logger.error('❌ Error toggling status:', error);
      throw new Error(error.message || 'Errore nel cambio stato');
    }
  },

  // ========== DOCUMENTS ==========
  
  async getDocuments(collaboratorId: string): Promise<CollaboratorDocument[]> {
    try {
      logger.log('📄 Fetching documents for collaborator:', collaboratorId);
      
      const { data, error } = await supabase
        .from('collaborator_documents')
        .select('*')
        .eq('collaborator_id', collaboratorId)
        .order('uploaded_at', { ascending: false });
      
      if (error) throw error;
      
      logger.log('✅ Documents fetched:', data?.length || 0);
      return (data || []) as CollaboratorDocument[];
    } catch (error: any) {
      logger.error('❌ Error fetching documents:', error);
      throw new Error(error.message || 'Errore nel recupero dei documenti');
    }
  },

  async uploadDocument(
    collaboratorId: string,
    file: File,
    documentType: string,
    title: string,
    description?: string
  ): Promise<CollaboratorDocument> {
    try {
      logger.log('📤 Uploading document:', title);
      
      const userId = await getCurrentUserId();
      
      // Upload file to storage
      const fileName = `${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('collaborator-documents')
        .upload(`${collaboratorId}/${fileName}`, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('collaborator-documents')
        .getPublicUrl(uploadData.path);
      
      // Create document record
      const { data, error } = await supabase
        .from('collaborator_documents')
        .insert({
          collaborator_id: collaboratorId,
          document_type: documentType,
          title,
          description,
          file_url: publicUrl,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: userId
        })
        .select()
        .single();
      
      if (error) throw error;
      
      logger.log('✅ Document uploaded:', data);
      return data as CollaboratorDocument;
    } catch (error: any) {
      logger.error('❌ Error uploading document:', error);
      throw new Error(error.message || 'Errore nel caricamento del documento');
    }
  },

  async deleteDocument(id: string): Promise<void> {
    try {
      logger.log('🗑️ Deleting document:', id);
      
      // TODO: Eliminare anche il file dallo storage
      
      const { error } = await supabase
        .from('collaborator_documents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      logger.log('✅ Document deleted');
    } catch (error: any) {
      logger.error('❌ Error deleting document:', error);
      throw new Error(error.message || 'Errore nell\'eliminazione del documento');
    }
  },

  async exportToPDF(collaboratorId: string): Promise<Blob> {
    try {
      logger.log('📄 Exporting collaborator to PDF:', collaboratorId);
      
      const collaborator = await this.getCollaborator(collaboratorId);
      
      const pdfContent = {
        collaborator,
        exported_at: new Date().toISOString(),
        exported_by: await getCurrentUserId()
      };
      
      // TODO: Implementare generazione PDF reale con jsPDF o simili
      const blob = new Blob([JSON.stringify(pdfContent, null, 2)], {
        type: 'application/json'
      });
      
      logger.log('✅ PDF exported');
      return blob;
    } catch (error: any) {
      logger.error('❌ Error exporting PDF:', error);
      throw new Error(error.message || 'Errore nell\'export PDF');
    }
  },

  // ========== STATISTICS ==========
  
  async getStatistics() {
    try {
      logger.log('📊 Fetching statistics');
      
      const { data, error } = await supabase
        .from('collaborators')
        .select('status, role, category_id, contract_type');
      
      if (error) throw error;
      
      const collabData = (data || []) as any[];
      
      const stats = {
        total: collabData.length,
        byStatus: {} as Record<string, number>,
        byRole: {} as Record<string, number>,
        byCategory: {} as Record<string, number>,
        byContractType: {} as Record<string, number>
      };
      
      collabData.forEach(c => {
        // Status
        if (c.status) {
          stats.byStatus[c.status] = (stats.byStatus[c.status] || 0) + 1;
        }
        
        // Role
        if (c.role) {
          stats.byRole[c.role] = (stats.byRole[c.role] || 0) + 1;
        }
        
        // Category
        if (c.category_id) {
          stats.byCategory[c.category_id] = (stats.byCategory[c.category_id] || 0) + 1;
        }
        
        // Contract Type
        if (c.contract_type) {
          stats.byContractType[c.contract_type] = (stats.byContractType[c.contract_type] || 0) + 1;
        }
      });
      
      logger.log('✅ Statistics fetched:', stats);
      return stats;
    } catch (error: any) {
      logger.error('❌ Error fetching statistics:', error);
      throw new Error(error.message || 'Errore nel recupero delle statistiche');
    }
  }
};