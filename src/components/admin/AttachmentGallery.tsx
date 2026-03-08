import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Trash2, X, ZoomIn, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { attachmentService } from '@/services/attachmentService';
import type { Attachment } from '@/services/types';

interface Props {
  entityType: string;
  entityId: string;
  attachments: Attachment[];
  maxSizeMb?: number;
  readOnly?: boolean;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPTED_EXT = '.jpg,.jpeg,.png,.webp';

export const AttachmentGallery = ({
  entityType,
  entityId,
  attachments,
  maxSizeMb = 10,
  readOnly = false,
}: Props) => {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState('');

  const imageAttachments = attachments.filter(
    (a) => a.mime_type && ACCEPTED_TYPES.includes(a.mime_type)
  );

  const deleteMutation = useMutation({
    mutationFn: async (att: Attachment) => {
      // Try to delete from storage too
      const path = att.file_url?.split('/pet-attachments/')[1];
      if (path) {
        await supabase.storage.from('pet-attachments').remove([path]);
      }
      await attachmentService.remove(att.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`${entityType}-attachments`, entityId] });
      qc.invalidateQueries({ queryKey: ['visit-attachments', entityId] });
      toast({ title: 'Prilog obrisan' });
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        // Validate type
        if (!ACCEPTED_TYPES.includes(file.type)) {
          toast({ title: `Nepodržan format: ${file.name}`, description: 'Dozvoljeni formati: JPG, PNG, WebP', variant: 'destructive' });
          continue;
        }
        // Validate size
        if (file.size > maxSizeMb * 1024 * 1024) {
          toast({ title: `Prevelika datoteka: ${file.name}`, description: `Maksimalna veličina: ${maxSizeMb}MB`, variant: 'destructive' });
          continue;
        }

        const ext = file.name.split('.').pop() || 'jpg';
        const storagePath = `${entityType}/${entityId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from('pet-attachments')
          .upload(storagePath, file, { contentType: file.type, upsert: false });

        if (upErr) {
          toast({ title: `Greška pri uploadu: ${file.name}`, variant: 'destructive' });
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('pet-attachments')
          .getPublicUrl(storagePath);

        await attachmentService.create({
          entity_type: entityType,
          entity_id: entityId,
          file_name: file.name,
          file_url: urlData.publicUrl,
          mime_type: file.type,
        });
      }

      qc.invalidateQueries({ queryKey: [`${entityType}-attachments`, entityId] });
      qc.invalidateQueries({ queryKey: ['visit-attachments', entityId] });
      toast({ title: `${files.length > 1 ? 'Slike uploadovane' : 'Slika uploadovana'}` });
    } catch {
      toast({ title: 'Greška pri uploadu', variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {/* Upload button */}
      {!readOnly && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXT}
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
            {uploading ? 'Upload...' : 'Dodaj slike'}
          </Button>
          <span className="text-xs text-muted-foreground ml-2">
            JPG, PNG, WebP · max {maxSizeMb}MB
          </span>
        </div>
      )}

      {/* Gallery grid */}
      {imageAttachments.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          Nema slika za prikaz.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {imageAttachments.map((att) => (
            <div
              key={att.id}
              className="group relative aspect-square rounded-lg border border-border overflow-hidden bg-muted cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all"
              onClick={() => { setPreviewUrl(att.file_url); setPreviewName(att.file_name); }}
            >
              <img
                src={att.file_url}
                alt={att.file_name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {/* Delete button */}
              {!readOnly && (
                <button
                  className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-destructive/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                  onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(att); }}
                  title="Obriši"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
              {/* File name */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
                <p className="text-[10px] text-white truncate">{att.file_name}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview modal */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <div className="relative">
            <img
              src={previewUrl || ''}
              alt={previewName}
              className="w-full max-h-[85vh] object-contain bg-black"
            />
            <div className="absolute top-3 right-3 flex gap-2">
              <a
                href={previewUrl || ''}
                download={previewName}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
              >
                <Download className="h-4 w-4" />
              </a>
              <button
                className="h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                onClick={() => setPreviewUrl(null)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-4 py-2">
              <p className="text-sm text-white">{previewName}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
