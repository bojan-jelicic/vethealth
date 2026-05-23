import { useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ArrowUp, ArrowDown, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ServiceContentBlock } from '@/hooks/useAppointmentData';

const BUCKET = 'service-images';

export const uploadServiceImage = async (file: File, folder: string): Promise<string> => {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
};

interface Props {
  blocks: ServiceContentBlock[];
  onChange: (b: ServiceContentBlock[]) => void;
  folder: string;
}

const newBlock = (type: ServiceContentBlock['type']): ServiceContentBlock => {
  const id = crypto.randomUUID();
  if (type === 'image') return { id, type, title: '', image_url: '' };
  return { id, type, title: '', body: '' };
};

export const ServiceContentEditor = ({ blocks, onChange, folder }: Props) => {
  const { toast } = useToast();

  const update = (idx: number, patch: Partial<ServiceContentBlock>) => {
    const next = blocks.slice();
    next[idx] = { ...next[idx], ...patch } as ServiceContentBlock;
    onChange(next);
  };
  const remove = (idx: number) => onChange(blocks.filter((_, i) => i !== idx));
  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = blocks.slice();
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(next);
  };
  const add = (type: ServiceContentBlock['type']) => onChange([...blocks, newBlock(type)]);

  return (
    <div className="space-y-3">
      {blocks.length === 0 && (
        <p className="text-xs text-muted-foreground">Nema dodatnih sekcija. Dodajte tekstualni, slikovni ili list blok ispod.</p>
      )}
      {blocks.map((b, i) => (
        <div key={b.id} className="rounded-lg border border-border p-3 space-y-2 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Blok {i + 1} · {b.type === 'text' ? 'Tekst' : b.type === 'image' ? 'Slika' : 'Lista'}
            </span>
            <div className="flex gap-1">
              <Button type="button" size="icon" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0}>
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button type="button" size="icon" variant="ghost" onClick={() => move(i, 1)} disabled={i === blocks.length - 1}>
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button type="button" size="icon" variant="ghost" className="text-destructive" onClick={() => remove(i)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Input
            placeholder="Naslov (opciono)"
            value={b.title || ''}
            onChange={(e) => update(i, { title: e.target.value })}
          />
          {b.type === 'image' ? (
            <ImageField
              value={(b as Extract<ServiceContentBlock, { type: 'image' }>).image_url}
              folder={folder}
              onChange={(url) => update(i, { image_url: url } as any)}
              onError={(msg) => toast({ title: 'Greška uploada', description: msg, variant: 'destructive' })}
            />
          ) : (
            <Textarea
              rows={b.type === 'list' ? 5 : 4}
              placeholder={b.type === 'list' ? 'Po jedna stavka u redu' : 'Tekst...'}
              value={(b as any).body || ''}
              onChange={(e) => update(i, { body: e.target.value } as any)}
            />
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => add('text')}>
          <Plus className="h-4 w-4 mr-1" /> Tekst
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => add('image')}>
          <Plus className="h-4 w-4 mr-1" /> Slika
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => add('list')}>
          <Plus className="h-4 w-4 mr-1" /> Lista
        </Button>
      </div>
    </div>
  );
};

interface ImageFieldProps {
  value: string;
  folder: string;
  onChange: (url: string) => void;
  onError: (msg: string) => void;
}

export const ImageField = ({ value, folder, onChange, onError }: ImageFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFile = async (file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return onError('Slika ne smije biti veća od 5MB');
    try {
      const url = await uploadServiceImage(file, folder);
      onChange(url);
    } catch (e: any) {
      onError(e?.message || 'Upload nije uspio');
    }
  };
  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative">
          <img src={value} alt="" className="w-full h-40 object-cover rounded-md border border-border" />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => onChange('')}
          >
            Ukloni
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-32 border-2 border-dashed border-border rounded-md flex flex-col items-center justify-center text-muted-foreground hover:bg-muted transition"
        >
          <Upload className="h-5 w-5 mb-1" />
          <span className="text-sm">Klikni za upload slike (max 5MB)</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] || null)}
      />
    </div>
  );
};