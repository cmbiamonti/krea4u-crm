// src/components/artists/ImageManager.tsx

import { X, GripVertical, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ImageManagerProps {
  images: any[];
  onImagesChange: (images: any[]) => void;
  artistId?: string;
  itemId?: string;
  autoSave?: boolean;
  tableName?: 'artist_images' | 'venue_images';
  storageBucket?: 'artist-images' | 'venue-images';
}

export default function ImageManager({ 
  images, 
  onImagesChange, 
  artistId,
  itemId,
  autoSave = false,
  tableName = 'artist_images',
  storageBucket = 'artist-images'
}: ImageManagerProps) {
  const id = itemId || artistId;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((img) => img.id === active.id);
    const newIndex = images.findIndex((img) => img.id === over.id);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔄 DRAG END')
    console.log('Active:', active.id)
    console.log('Over:', over.id)
    console.log('Old index:', oldIndex, '→ New index:', newIndex)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    const newImages = arrayMove(images, oldIndex, newIndex);
    
    const updatedImages = newImages.map((img, index) => ({
      ...img,
      sort_order: index + 1
    }));

    // ✅ Aggiorna stato locale PRIMA
    console.log('📝 Updating local state...')
    onImagesChange(updatedImages);

    // ✅ Salvataggio automatico su DB
    if (autoSave && id) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('💾 AUTO SAVING TO DATABASE')
      console.log('Table:', tableName)
      console.log('Item ID:', id)
      console.log('Images to update:', updatedImages.length)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      try {
        const updates = updatedImages.map((img, idx) => {
          console.log(`  ${idx + 1}. Image ${img.id} → sort_order: ${img.sort_order}`)
          
          return supabase
            .from(tableName)
            .update({ sort_order: img.sort_order })
            .eq('id', img.id)
        });

        const results = await Promise.all(updates);
        
        // ✅ Verifica errori
        const errors = results.filter(r => r.error);
        if (errors.length > 0) {
          console.error('❌ Some updates failed:')
          errors.forEach(e => console.error('  -', e.error))
          toast.error('Errore parziale nell\'aggiornamento')
        } else {
          console.log('✅ All updates successful!')
          toast.success('Ordine immagini aggiornato')
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      } catch (error) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.error('❌ Error updating sort order:', error)
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        toast.error('Errore nell\'aggiornamento')
      }
    } else {
      if (!autoSave) {
        console.log('ℹ️ AutoSave is disabled, changes will be saved on form submit')
      }
      if (!id) {
        console.warn('⚠️ No ID provided, cannot auto-save')
      }
    }
  };

  const handleDelete = async (imageId: string, imageUrl: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa immagine?')) return;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🗑️ DELETE IMAGE')
    console.log('Image ID:', imageId)
    console.log('Image URL:', imageUrl)
    console.log('Auto save:', autoSave)
    console.log('Item ID:', id)
    console.log('Table:', tableName)
    console.log('Storage:', storageBucket)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    if (autoSave && id) {
      try {
        // 1. Elimina da storage
        const path = imageUrl.split('/app').pop();
        if (path) {
          console.log('📁 Deleting from storage:', path)
          const { error: storageError } = await supabase.storage
            .from(storageBucket)
            .remove([`${id}/${path}`]);
          
          if (storageError) {
            console.warn('⚠️ Storage delete warning:', storageError)
          } else {
            console.log('✅ Storage deleted')
          }
        }

        // 2. Elimina da database
        console.log('💾 Deleting from database...')
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('id', imageId);

        if (error) {
          console.error('❌ DB delete error:', error)
          throw error;
        }

        console.log('✅ DB deleted')
        toast.success('Immagine eliminata');
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      } catch (error) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.error('❌ Delete error:', error)
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        toast.error('Errore nell\'eliminazione');
        return;
      }
    } else {
      console.log('ℹ️ Skipping DB delete (autoSave disabled or no ID)')
    }

    // ✅ Rimuovi dall'array locale
    console.log('📝 Removing from local state...')
    onImagesChange(images.filter(img => img.id !== imageId));
    console.log('✅ Local state updated')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed rounded-lg">
        <p className="text-sm text-gray-500">Nessuna immagine</p>
      </div>
    );
  }

  // ✅ Log iniziale
  console.log('🖼️ ImageManager render:', {
    imagesCount: images.length,
    autoSave,
    tableName,
    storageBucket,
    id,
    hasArtistId: !!artistId,
    hasItemId: !!itemId
  });

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={images.map(img => img.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {images.map((image, index) => (
            <SortableImageItem
              key={image.id}
              image={image}
              index={index}
              onDelete={() => handleDelete(image.id, image.url)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

interface SortableImageItemProps {
  image: any;
  index: number;
  onDelete: () => void;
}

function SortableImageItem({ image, index, onDelete }: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-white border rounded-lg ${
        isDragging ? 'shadow-lg' : 'hover:shadow-md'
      }`}
    >
      {/* Drag Handle */}
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-gray-400" />
      </button>

      {/* Badge Ordine */}
      <div className="flex items-center gap-1">
        {index === 0 && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
        <span className="text-xs font-medium text-gray-600">
          #{index + 1}
        </span>
      </div>

      {/* Preview */}
      <img
        src={image.url}
        alt={image.caption || `Immagine ${index + 1}`}
        className="h-16 w-16 object-cover rounded"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {image.caption || `Immagine ${index + 1}`}
        </p>
        <p className="text-xs text-gray-500">
          {index === 0 ? 'Immagine principale' : `Priorità ${index + 1}`}
        </p>
      </div>

      {/* Delete Button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}