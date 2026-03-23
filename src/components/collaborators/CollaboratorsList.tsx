// src/components/collaborators/CollaboratorsList.tsx

import { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, Archive, Edit2, Trash2, MoreVertical, Users, CheckCircle // ✅ Aggiungi CheckCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { collaboratorService } from '@/services/collaborator.service';
import type { Collaborator, CollaboratorCategory, CollaboratorFilters, CollaboratorStatus } from '@/types/collaborator.types';
import { toast } from 'sonner';

interface Props {
  onEdit: (collaborator: Collaborator) => void;
}

export default function CollaboratorsList({ onEdit }: Props) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [categories, setCategories] = useState<CollaboratorCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CollaboratorFilters>({});

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('📂 Loading collaborators with filters:', filters);
      
      const [collabData, catData] = await Promise.all([
        collaboratorService.getCollaborators(filters),
        collaboratorService.getCategories()
      ]);
      
      console.log('✅ Collaborators loaded:', collabData.length);
      console.log('✅ Categories loaded:', catData.length);
      
      // ✅ Debug: mostra category_id di ogni collaboratore
      collabData.forEach(c => {
        console.log(`${c.full_name} -> category_id: ${c.category_id}`);
      });
      
      setCollaborators(collabData);
      setCategories(catData);
    } catch (error) {
      console.error('❌ Error loading collaborators:', error);
      toast.error('Errore nel caricamento dei collaboratori');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (collaborator: Collaborator) => {
    try {
      const blob = await collaboratorService.exportToPDF(collaborator.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${collaborator.full_name}.pdf`;
      a.click();
      toast.success('PDF generato con successo');
    } catch (error) {
      toast.error('Errore nella generazione del PDF');
    }
  };

  // ✅ AGGIUNGI QUESTA FUNZIONE
  const handleToggleStatus = async (id: string, status: CollaboratorStatus) => {
    try {
      await collaboratorService.toggleCollaboratorStatus(id, status);
      toast.success(`Collaboratore ${status === 'active' ? 'attivato' : 'disattivato'}`);
      loadData();
    } catch (error) {
      toast.error('Errore nel cambio di status');
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Sei sicuro di voler archiviare questo collaboratore?')) return;
    
    try {
      await collaboratorService.archiveCollaborator(id);
      toast.success('Collaboratore archiviato');
      loadData();
    } catch (error) {
      toast.error('Errore nell\'archiviazione');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo collaboratore?')) return;
    
    try {
      await collaboratorService.deleteCollaborator(id);
      toast.success('Collaboratore eliminato');
      loadData();
    } catch (error) {
      toast.error('Errore nell\'eliminazione');
    }
  };

  const getStatusBadge = (status: CollaboratorStatus) => {
    const config = {
      active: {
        variant: 'default' as const,
        label: 'Attivo',
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      inactive: {
        variant: 'secondary' as const,
        label: 'Inattivo',
        className: 'bg-gray-100 text-gray-800 border-gray-200'
      },
      archived: {
        variant: 'outline' as const,
        label: 'Archiviato',
        className: 'bg-red-50 text-red-800 border-red-200'
      }
    };

    const { variant, label, className } = config[status] || config.active;

    return (
      <Badge variant={variant} className={className}>
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cerca per nome o email..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>

        <Select
          value={filters.category_id || 'all'}
          onValueChange={(value) => setFilters({ 
            ...filters, 
            category_id: value === 'all' ? undefined : value 
          })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le categorie</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => setFilters({ 
            ...filters, 
            status: value === 'all' ? undefined : value as CollaboratorStatus
          })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti</SelectItem>
            <SelectItem value="active">Attivi</SelectItem>
            <SelectItem value="inactive">Inattivi</SelectItem>
            <SelectItem value="archived">Archiviati</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        </div>
      ) : collaborators.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Nessun collaboratore trovato
          </h3>
          <p className="text-sm text-gray-500">
            Inizia aggiungendo il tuo primo collaboratore
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Collaboratore
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contatti
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ruolo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {collaborators.map((collaborator) => (
                  <tr key={collaborator.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {collaborator.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {collaborator.full_name}
                          </div>
                          {collaborator.company && (
                            <div className="text-sm text-gray-500">
                              {collaborator.company}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {collaborator.category && (
                        <Badge 
                          variant="outline"
                          style={{ 
                            borderColor: collaborator.category.color || undefined,
                            color: collaborator.category.color || undefined
                          }}
                        >
                          {collaborator.category.name}
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{collaborator.email}</div>
                      {collaborator.phone && (
                        <div className="text-sm text-gray-500">{collaborator.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {collaborator.role || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(collaborator.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(collaborator)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Modifica
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExport(collaborator)}>
                            <Download className="mr-2 h-4 w-4" />
                            Esporta PDF
                          </DropdownMenuItem>
                          
                          {collaborator.status === 'active' && (
                            <DropdownMenuItem onClick={() => handleToggleStatus(collaborator.id, 'inactive')}>
                              <Archive className="mr-2 h-4 w-4" />
                              Disattiva
                            </DropdownMenuItem>
                          )}
                          {collaborator.status === 'inactive' && (
                            <DropdownMenuItem onClick={() => handleToggleStatus(collaborator.id, 'active')}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Attiva
                            </DropdownMenuItem>
                          )}
                          {collaborator.status !== 'archived' && (
                            <DropdownMenuItem onClick={() => handleArchive(collaborator.id)}>
                              <Archive className="mr-2 h-4 w-4" />
                              Archivia
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem 
                            onClick={() => handleDelete(collaborator.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Elimina
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}