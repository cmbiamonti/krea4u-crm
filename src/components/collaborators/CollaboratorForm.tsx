// src/components/collaborators/CollaboratorForm.tsx

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { collaboratorService } from '@/services/collaborator.service';
import type { Collaborator, CollaboratorCategory, CreateCollaboratorDTO } from '@/types/collaborator.types';
import { toast } from 'sonner';

interface Props {
  collaborator: Collaborator | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CollaboratorForm({ collaborator, onClose, onSuccess }: Props) {
  const [categories, setCategories] = useState<CollaboratorCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCollaboratorDTO>({
    category_id: null,
    full_name: '', // ✅ Campo che esiste
    role: '', // ✅ Invece di status
    email: '',
    phone: '',
    mobile: '',
    bio: '',
    company: '',
    specialization: '',
    vat_number: '',
    tax_code: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'Italia',
    website: '',
    linkedin_url: '',
    instagram_handle: '',
    facebook_profile: '',
    whatsapp_number: '',
    preferred_contact_method: '',
    contract_type: undefined,
    contract_start_date: '',
    contract_end_date: '',
    hourly_rate: undefined,
    daily_rate: undefined,
    skills: [],
    languages: [],
    certifications: [],
    status: 'active', // ✅ Aggiunto
    notes: ''
  });

  useEffect(() => {
    loadCategories();
    if (collaborator) {
      setFormData({
        category_id: collaborator.category_id,
        full_name: collaborator.full_name,
        email: collaborator.email,
        phone: collaborator.phone || '',
        mobile: collaborator.mobile || '',
        company: collaborator.company || '',
        role: collaborator.role || '',
        specialization: collaborator.specialization || '',
        vat_number: collaborator.vat_number || '',
        tax_code: collaborator.tax_code || '',
        address: collaborator.address || '',
        city: collaborator.city || '',
        postal_code: collaborator.postal_code || '',
        country: collaborator.country || 'Italia',
        website: collaborator.website || '',
        linkedin_url: collaborator.linkedin_url || '',
        contract_type: collaborator.contract_type || undefined,
        contract_start_date: collaborator.contract_start_date || '',
        contract_end_date: collaborator.contract_end_date || '',
        hourly_rate: collaborator.hourly_rate || undefined,
        daily_rate: collaborator.daily_rate || undefined,
        skills: collaborator.skills || [],
        languages: collaborator.languages || [],
        certifications: collaborator.certifications || [],
        notes: collaborator.notes || ''
      });
    }
  }, [collaborator]);

  const loadCategories = async () => {
    try {
      const data = await collaboratorService.getCategories();
      setCategories(data);
    } catch (error) {
      toast.error('Errore nel caricamento delle categorie');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (collaborator) {
        await collaboratorService.updateCollaborator(collaborator.id, formData);
        toast.success('Collaboratore aggiornato con successo');
      } else {
        await collaboratorService.createCollaborator(formData);
        toast.success('Collaboratore creato con successo');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Errore nel salvataggio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {collaborator ? 'Modifica Collaboratore' : 'Nuovo Collaboratore'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="anagrafica">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="anagrafica">Anagrafica</TabsTrigger>
              <TabsTrigger value="professionale">Professionale</TabsTrigger>
              <TabsTrigger value="contratto">Contratto</TabsTrigger>
              <TabsTrigger value="competenze">Competenze</TabsTrigger>
            </TabsList>

            {/* Tab Anagrafica */}
            <TabsContent value="anagrafica" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Nome Completo *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                    placeholder="Es: Mario Rossi"
                  />
                </div>

                <div>
                  <Label htmlFor="role">Ruolo</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="Es: Artista, Curatore, Tecnico..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category_id">Categoria</Label>
                <Select
                  value={formData.category_id || undefined}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mobile">Cellulare</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="website">Sito Web</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Indirizzo</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">Città</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="postal_code">CAP</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="country">Paese</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Tab Professionale */}
            <TabsContent value="professionale" className="space-y-4">
              <div>
                <Label htmlFor="company">Azienda</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Ruolo</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="specialization">Specializzazione</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vat_number">Partita IVA</Label>
                  <Input
                    id="vat_number"
                    value={formData.vat_number}
                    onChange={(e) => setFormData({ ...formData, vat_number: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="tax_code">Codice Fiscale</Label>
                  <Input
                    id="tax_code"
                    value={formData.tax_code}
                    onChange={(e) => setFormData({ ...formData, tax_code: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="linkedin_url">LinkedIn</Label>
                <Input
                  id="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </TabsContent>

            {/* Tab Contratto */}
            <TabsContent value="contratto" className="space-y-4">
              <div>
                <Label htmlFor="contract_type">Tipo Contratto</Label>
                <Select
                  value={formData.contract_type}
                  onValueChange={(value: any) => setFormData({ ...formData, contract_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="employee">Dipendente</SelectItem>
                    <SelectItem value="consultant">Consulente</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contract_start_date">Data Inizio</Label>
                  <Input
                    id="contract_start_date"
                    type="date"
                    value={formData.contract_start_date}
                    onChange={(e) => setFormData({ ...formData, contract_start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contract_end_date">Data Fine</Label>
                  <Input
                    id="contract_end_date"
                    type="date"
                    value={formData.contract_end_date}
                    onChange={(e) => setFormData({ ...formData, contract_end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hourly_rate">Tariffa Oraria (€)</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    step="0.01"
                    value={formData.hourly_rate || ''}
                    onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) || undefined })}
                  />
                </div>
                <div>
                  <Label htmlFor="daily_rate">Tariffa Giornaliera (€)</Label>
                  <Input
                    id="daily_rate"
                    type="number"
                    step="0.01"
                    value={formData.daily_rate || ''}
                    onChange={(e) => setFormData({ ...formData, daily_rate: parseFloat(e.target.value) || undefined })}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Tab Competenze */}
            <TabsContent value="competenze" className="space-y-4">
              <div>
                <Label htmlFor="skills">Competenze (separate da virgola)</Label>
                <Textarea
                  id="skills"
                  value={formData.skills?.join(', ') || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="Es: Curatela, Gestione progetti, Marketing..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="languages">Lingue (separate da virgola)</Label>
                <Input
                  id="languages"
                  value={formData.languages?.join(', ') || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    languages: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="Es: Italiano, Inglese, Francese..."
                />
              </div>

              <div>
                <Label htmlFor="certifications">Certificazioni (separate da virgola)</Label>
                <Textarea
                  id="certifications"
                  value={formData.certifications?.join(', ') || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    certifications: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="notes">Note</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={5}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvataggio...' : 'Salva'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}