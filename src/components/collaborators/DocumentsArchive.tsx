// src/components/collaborators/DocumentsArchive.tsx

import { useState, useEffect } from 'react';
import { 
  FileText, Upload, Download, Trash2, Eye, Filter, 
  Calendar, Tag, Lock, ExternalLink 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { collaboratorService } from '@/services/collaborator.service';
import type { CollaboratorDocument, CollaboratorCategory, Collaborator } from '@/types/collaborator.types';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

export default function DocumentsArchive() {
  const [documents, setDocuments] = useState<CollaboratorDocument[]>([]);
  const [categories, setCategories] = useState<CollaboratorCategory[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('📂 Loading documents data...');
      
      const [cats, collabs] = await Promise.all([
        collaboratorService.getCategories(),
        collaboratorService.getCollaborators()
      ]);
      
      console.log('✅ Categories loaded:', cats.length);
      console.log('✅ Collaborators loaded:', collabs.length);
      
      setCategories(cats);
      setCollaborators(collabs);
      
      // Load all documents for all collaborators
      const allDocs = await Promise.all(
        collabs.map(c => collaboratorService.getDocuments(c.id))
      );
      
      const flatDocs = allDocs.flat();
      console.log('✅ Documents loaded:', flatDocs.length);
      setDocuments(flatDocs);
    } catch (error) {
      console.error('❌ Error loading documents:', error);
      toast.error('Errore nel caricamento dei documenti');
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (selectedCategory !== 'all' && doc.category_id !== selectedCategory) return false;
    if (selectedType !== 'all' && doc.document_type !== selectedType) return false;
    if (searchTerm && !doc.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo documento?')) return;
    
    try {
      await collaboratorService.deleteDocument(id);
      toast.success('Documento eliminato');
      loadData();
    } catch (error) {
      toast.error('Errore nell\'eliminazione');
    }
  };

  const getDocumentIcon = (type: string) => {
    const icons = {
      contract: '📄',
      invoice: '🧾',
      certificate: '🏆',
      cv: '👤',
      portfolio: '🎨',
      other: '📎'
    };
    return icons[type as keyof typeof icons] || '📎';
  };

  const getDocumentBadge = (type: string) => {
    const variants = {
      contract: 'default',
      invoice: 'secondary',
      certificate: 'outline',
      cv: 'default',
      portfolio: 'secondary',
      other: 'outline'
    } as const;

    const labels = {
      contract: 'Contratto',
      invoice: 'Fattura',
      certificate: 'Certificato',
      cv: 'CV',
      portfolio: 'Portfolio',
      other: 'Altro'
    };

    return (
      <Badge variant={variants[type as keyof typeof variants] || 'outline'}>
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Archivio Documenti</h3>
          <p className="text-sm text-gray-500">
            {filteredDocuments.length} documenti trovati
          </p>
        </div>
        <Button onClick={() => setUploadModalOpen(true)} className="gap-2">
          <Upload className="h-4 w-4" />
          Carica Documento
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Input
          placeholder="Cerca documento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i tipi</SelectItem>
            <SelectItem value="contract">Contratti</SelectItem>
            <SelectItem value="invoice">Fatture</SelectItem>
            <SelectItem value="certificate">Certificati</SelectItem>
            <SelectItem value="cv">CV</SelectItem>
            <SelectItem value="portfolio">Portfolio</SelectItem>
            <SelectItem value="other">Altri</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Nessun documento trovato
          </h3>
          <p className="text-sm text-gray-500">
            Carica il primo documento per iniziare
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => {
            const collaborator = collaborators.find(c => c.id === doc.collaborator_id);
            
            return (
              <div
                key={doc.id}
                className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">
                      {getDocumentIcon(doc.document_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {doc.title}
                      </h4>
                      {collaborator && (
                        <p className="text-xs text-gray-500">
                          {collaborator.full_name}
                        </p>
                      )}
                    </div>
                  </div>
                  {doc.is_confidential && (
                    <Lock className="h-4 w-4 text-red-500" />
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {getDocumentBadge(doc.document_type)}
                  {doc.expires_at && (
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="h-3 w-3" />
                      Scade: {new Date(doc.expires_at).toLocaleDateString('it-IT')}
                    </Badge>
                  )}
                </div>

                {/* Description */}
                {doc.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {doc.description}
                  </p>
                )}

                {/* Tags */}
                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {doc.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-xs rounded"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t text-xs text-gray-500">
                  <div>
                    <div>{formatFileSize(doc.file_size)}</div>
                    <div>
                      {formatDistanceToNow(new Date(doc.uploaded_at), { 
                        addSuffix: true,
                        locale: it 
                      })}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(doc.file_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = doc.file_url;
                        a.download = doc.file_name || 'document';
                        a.click();
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <UploadDocumentModal
          collaborators={collaborators}
          onClose={() => setUploadModalOpen(false)}
          onSuccess={() => {
            setUploadModalOpen(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

// ✅ Upload Modal Component con FIX
function UploadDocumentModal({ 
  collaborators, 
  onClose, 
  onSuccess 
}: { 
  collaborators: Collaborator[]; 
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    collaborator_id: '',
    document_type: 'other' as any,
    title: '',
    description: '',
    file: null as File | null
  });

  // ✅ Debug log per vedere i collaboratori
  useEffect(() => {
    console.log('🔍 Collaborators in modal:', collaborators.length);
    console.log('📋 First collaborator:', collaborators[0]);
  }, [collaborators]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.file) {
      toast.error('Seleziona un file');
      return;
    }
    
    if (!formData.collaborator_id) {
      toast.error('Seleziona un collaboratore');
      return;
    }

    setLoading(true);
    try {
      await collaboratorService.uploadDocument(
        formData.collaborator_id,
        formData.file,
        formData.document_type,
        formData.title || formData.file.name,
        formData.description
      );
      toast.success('Documento caricato con successo');
      onSuccess();
    } catch (error: any) {
      console.error('❌ Error uploading:', error);
      toast.error(error.message || 'Errore nel caricamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Carica Documento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ✅ Collaboratore Select con Debug */}
          <div>
            <Label htmlFor="collaborator_id">
              Collaboratore * 
              <span className="text-xs text-gray-500 ml-2">
                ({collaborators.length} disponibili)
              </span>
            </Label>
            {collaborators.length === 0 ? (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                ⚠️ Nessun collaboratore trovato. Crea prima un collaboratore.
              </div>
            ) : (
              <Select
                value={formData.collaborator_id}
                onValueChange={(value) => {
                  console.log('✅ Selected collaborator:', value);
                  setFormData({ ...formData, collaborator_id: value });
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona collaboratore" />
                </SelectTrigger>
                <SelectContent>
                  {collaborators.map(collab => (
                    <SelectItem key={collab.id} value={collab.id}>
                      {collab.full_name} {collab.email && `(${collab.email})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Tipo Documento */}
          <div>
            <Label htmlFor="document_type">Tipo Documento *</Label>
            <Select
              value={formData.document_type}
              onValueChange={(value: any) => setFormData({ ...formData, document_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contract">Contratto</SelectItem>
                <SelectItem value="invoice">Fattura</SelectItem>
                <SelectItem value="certificate">Certificato</SelectItem>
                <SelectItem value="cv">CV</SelectItem>
                <SelectItem value="portfolio">Portfolio</SelectItem>
                <SelectItem value="other">Altro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Titolo */}
          <div>
            <Label htmlFor="title">Titolo</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Lascia vuoto per usare il nome del file"
            />
          </div>

          {/* Descrizione */}
          <div>
            <Label htmlFor="description">Descrizione</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrizione opzionale"
            />
          </div>

          {/* File */}
          <div>
            <Label htmlFor="file">File *</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => setFormData({ 
                ...formData, 
                file: e.target.files?.[0] || null 
              })}
              required
            />
            {formData.file && (
              <p className="text-xs text-gray-500 mt-1">
                {formData.file.name} ({(formData.file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button 
              type="submit" 
              disabled={loading || collaborators.length === 0}
            >
              {loading ? 'Caricamento...' : 'Carica'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}