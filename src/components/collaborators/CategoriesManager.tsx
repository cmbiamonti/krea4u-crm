// src/components/collaborators/CategoriesManager.tsx

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Users, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { collaboratorService } from '@/services/collaborator.service';
import type { CollaboratorCategory, Collaborator } from '@/types/collaborator.types';
import { toast } from 'sonner';

interface CategoryWithCount extends CollaboratorCategory {
  collaboratorCount: number;
}

export default function CategoriesManager() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CollaboratorCategory | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithCount | null>(null);
  const [categoryCollaborators, setCategoryCollaborators] = useState<Collaborator[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: 'users'
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      console.log('📂 Loading categories...');
      
      const [cats, allCollabs] = await Promise.all([
        collaboratorService.getCategories(),
        collaboratorService.getCollaborators()
      ]);
      
      console.log('✅ Categories:', cats.length);
      console.log('✅ Collaborators:', allCollabs.length);
      
      // ✅ Conta collaboratori per ogni categoria
      const categoriesWithCount = cats.map(cat => {
        const count = allCollabs.filter(c => c.category_id === cat.id).length;
        console.log(`  ${cat.name}: ${count} collaboratori`);
        return {
          ...cat,
          collaboratorCount: count
        };
      });
      
      setCategories(categoriesWithCount);
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      toast.error('Errore nel caricamento delle categorie');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (category?: CollaboratorCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        color: category.color || '#3B82F6',
        icon: category.icon || 'users'
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        color: '#3B82F6',
        icon: 'users'
      });
    }
    setIsFormOpen(true);
  };

  // ✅ Apri dettagli categoria
  const handleOpenDetails = async (category: CategoryWithCount) => {
    try {
      console.log('🔍 Loading collaborators for:', category.name);
      setSelectedCategory(category);
      
      const collabs = await collaboratorService.getCollaborators({
        category_id: category.id
      });
      
      console.log('✅ Found', collabs.length, 'collaborators');
      setCategoryCollaborators(collabs);
      setIsDetailOpen(true);
    } catch (error) {
      console.error('❌ Error loading collaborators:', error);
      toast.error('Errore nel caricamento dei collaboratori');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await collaboratorService.updateCategory(
          editingCategory.id,
          formData.name,
          formData.description,
          formData.color,
          formData.icon
        );
        toast.success('Categoria aggiornata con successo');
      } else {
        await collaboratorService.createCategory(
          formData.name,
          formData.description,
          formData.color,
          formData.icon
        );
        toast.success('Categoria creata con successo');
      }
      
      setIsFormOpen(false);
      setEditingCategory(null);
      loadCategories();
    } catch (error: any) {
      toast.error(error.message || 'Errore nel salvataggio');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Previeni apertura dettagli
    
    if (!confirm('Sei sicuro di voler eliminare questa categoria? I collaboratori associati rimarranno ma senza categoria.')) return;
    
    try {
      await collaboratorService.deleteCategory(id);
      toast.success('Categoria eliminata');
      loadCategories();
    } catch (error: any) {
      toast.error(error.message || 'Errore nell\'eliminazione');
    }
  };

  const colorPresets = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
    '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6'
  ];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gestione Categorie</h3>
          <p className="text-sm text-gray-500 mt-1">
            {categories.reduce((sum, c) => sum + c.collaboratorCount, 0)} collaboratori in {categories.length} categorie
          </p>
        </div>
        <Button onClick={() => handleOpenForm()} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nuova Categoria
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="p-4 hover:shadow-md transition-all cursor-pointer group relative"
            style={{ borderLeftWidth: '4px', borderLeftColor: category.color || undefined }}
            onClick={() => handleOpenDetails(category)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-1">
                <GripVertical className="h-4 w-4 text-gray-400" />
                <div className="flex-1">
                  <h4 className="font-medium group-hover:text-primary transition-colors">
                    {category.name}
                  </h4>
                  {category.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{category.description}</p>
                  )}
                </div>
              </div>
              
              {/* ✅ Badge con conteggio */}
              <Badge 
                variant={category.collaboratorCount > 0 ? 'default' : 'secondary'}
                className="gap-1"
              >
                <Users className="h-3 w-3" />
                {category.collaboratorCount}
              </Badge>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t mt-3">
              <div
                className="h-6 w-6 rounded-full border-2"
                style={{ backgroundColor: category.color || undefined }}
              />
              
              <div className="flex items-center gap-1">
                {/* ✅ Indicatore clickable */}
                <span className="text-xs text-gray-500 group-hover:text-primary">
                  Vedi dettagli
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary" />
                
                {/* Bottoni azioni */}
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenForm(category);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-red-600 hover:text-red-700"
                  onClick={(e) => handleDelete(category.id, e)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ✅ Form Modal (Crea/Modifica) */}
      {isFormOpen && (
        <Dialog open onOpenChange={setIsFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Modifica Categoria' : 'Nuova Categoria'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Es: Artisti, Curatori..."
                />
              </div>

              <div>
                <Label htmlFor="description">Descrizione</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrizione opzionale"
                />
              </div>

              <div>
                <Label>Colore</Label>
                <div className="flex gap-2 mt-2">
                  {colorPresets.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`h-8 w-8 rounded-full border-2 ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit">
                  {editingCategory ? 'Aggiorna' : 'Crea'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ✅ Detail Modal (Lista Collaboratori) */}
      {isDetailOpen && selectedCategory && (
        <Dialog open onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div
                  className="h-8 w-8 rounded-full"
                  style={{ backgroundColor: selectedCategory.color || undefined }}
                />
                {selectedCategory.name}
                <Badge variant="secondary" className="ml-auto">
                  {categoryCollaborators.length} collaboratori
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {categoryCollaborators.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Nessun collaboratore in questa categoria</p>
                </div>
              ) : (
                categoryCollaborators.map((collab) => (
                  <div
                    key={collab.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {collab.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{collab.full_name}</p>
                      <p className="text-xs text-gray-500">{collab.email}</p>
                    </div>
                    {collab.role && (
                      <Badge variant="outline" className="text-xs">
                        {collab.role}
                      </Badge>
                    )}
                    <Badge 
                      variant={
                        collab.status === 'active' ? 'default' : 
                        collab.status === 'inactive' ? 'secondary' : 
                        'outline'
                      }
                      className="text-xs"
                    >
                      {collab.status === 'active' ? 'Attivo' : 
                       collab.status === 'inactive' ? 'Inattivo' : 
                       'Archiviato'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}