// src/components/collaborators/CollaboratorsManager.tsx

import { useState } from 'react';
import { Plus, Users, FileText, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import CollaboratorsList from './CollaboratorsList';
import CollaboratorForm from './CollaboratorForm';
import DocumentsArchive from './DocumentsArchive';
import CollaboratorsStats from './CollaboratorsStats';
import CategoriesManager from './CategoriesManager';
import type { Collaborator } from '@/types/collaborator.types';

export default function CollaboratorsManager() {
  const [activeTab, setActiveTab] = useState('list');
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // ✅ Aggiungi questo

  const handleCreate = () => {
    setSelectedCollaborator(null);
    setIsFormOpen(true);
  };

  const handleEdit = (collaborator: Collaborator) => {
    setSelectedCollaborator(collaborator);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedCollaborator(null);
    setRefreshKey(prev => prev + 1); // ✅ Forza refresh
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestione Collaboratori</h2>
          <p className="text-sm text-gray-500 mt-1">
            Organizza e gestisci i tuoi collaboratori per categoria
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuovo Collaboratore
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="list" className="gap-2">
            <Users className="h-4 w-4" />
            Collaboratori
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Archivio Documenti
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistiche
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            Categorie
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* ✅ Aggiungi key per forzare re-render */}
          <CollaboratorsList key={refreshKey} onEdit={handleEdit} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <DocumentsArchive />
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <CollaboratorsStats />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <CategoriesManager />
        </TabsContent>
      </Tabs>

      {isFormOpen && (
        <CollaboratorForm
          collaborator={selectedCollaborator}
          onClose={handleFormClose}
          onSuccess={handleFormClose}
        />
      )}
    </div>
  );
}