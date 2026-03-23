// src/components/artists/ArtistDetailImages.tsx

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Upload, Edit2 } from 'lucide-react';
import ImageManager from './ImageManager';
import { toast } from 'sonner';

interface ArtistDetailImagesProps {
  artistId: string;
  isEditable?: boolean;
}

export default function ArtistDetailImages({ artistId, isEditable = false }: ArtistDetailImagesProps) {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    loadImages();
  }, [artistId]);

  const loadImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('artist_images')
        .select('*')
        .eq('artist_id', artistId)
        .order('sort_order');

      if (error) throw error;

      setImages(
        (data || []).map(img => ({
          id: img.id,
          url: img.image_url,
          caption: img.caption || '',
          sort_order: img.sort_order || 0,
        }))
      );
    } catch (error) {
      console.error('Error loading images:', error);
      toast.error('Errore nel caricamento delle immagini');
    } finally {
      setLoading(false);
    }
  };

  const handleImagesChange = (newImages: any[]) => {
    setImages(newImages);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con Bottone Edit */}
      {isEditable && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Portfolio Immagini</h3>
          <Button
            variant={editMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setEditMode(!editMode)}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            {editMode ? 'Fatto' : 'Modifica Ordine'}
          </Button>
        </div>
      )}

      {/* Modalità Edit: Drag & Drop */}
      {editMode ? (
        <div className="border rounded-lg p-4 bg-gray-50">
          <p className="text-sm text-gray-600 mb-4">
            💡 Trascina le immagini per cambiare l'ordine. La prima sarà quella principale.
          </p>
          <ImageManager
            images={images}
            onImagesChange={handleImagesChange}
            artistId={artistId}
            autoSave={true} // ✅ Salva automaticamente
          />
        </div>
      ) : (
        /* Modalità View: Griglia Immagini */
        images.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nessuna immagine caricata</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="relative aspect-square rounded-lg overflow-hidden border hover:shadow-md transition-shadow group"
              >
                <img
                  src={image.url}
                  alt={image.caption || `Immagine ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                    ⭐ Principale
                  </div>
                )}
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <p className="text-white text-sm">{image.caption}</p>
                  </div>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                    #{index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}