import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, ExternalLink } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { slugify } from '@/lib/slug';
import { ServiceContentEditor, ImageField } from '@/components/admin/ServiceContentEditor';
import type { ServiceContentBlock } from '@/hooks/useAppointmentData';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  hero_image_url: string | null;
  content_blocks: ServiceContentBlock[];
  author_name: string | null;
  read_time_minutes: number;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  hero_image_url: string;
  content_blocks: ServiceContentBlock[];
  author_name: string;
  read_time_minutes: number;
  status: 'draft' | 'published';
}

const emptyForm = (): FormState => ({
  title: '',
  slug: '',
  excerpt: '',
  hero_image_url: '',
  content_blocks: [],
  author_name: '',
  read_time_minutes: 5,
  status: 'draft',
});

const AdminBlogManager = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: posts, isLoading } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as BlogPost[];
    },
  });

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm());
    setSlugTouched(false);
    setOpen(true);
  };

  const openEdit = (p: BlogPost) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt || '',
      hero_image_url: p.hero_image_url || '',
      content_blocks: Array.isArray(p.content_blocks) ? p.content_blocks : [],
      author_name: p.author_name || '',
      read_time_minutes: p.read_time_minutes || 5,
      status: p.status,
    });
    setSlugTouched(true);
    setOpen(true);
  };

  useEffect(() => {
    if (!slugTouched) setForm((f) => ({ ...f, slug: slugify(f.title) }));
  }, [form.title, slugTouched]);

  const handleSave = async (publish?: boolean) => {
    if (!form.title.trim()) {
      toast({ title: 'Naslov je obavezan', variant: 'destructive' });
      return;
    }
    if (!form.slug.trim()) {
      toast({ title: 'Slug je obavezan', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const status = publish !== undefined ? (publish ? 'published' : 'draft') : form.status;
      const payload: any = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        excerpt: form.excerpt.trim(),
        hero_image_url: form.hero_image_url || null,
        content_blocks: form.content_blocks,
        author_name: form.author_name.trim() || null,
        read_time_minutes: Number(form.read_time_minutes) || 5,
        status,
      };

      if (editingId) {
        const existing = posts?.find((p) => p.id === editingId);
        if (status === 'published' && !existing?.published_at) {
          payload.published_at = new Date().toISOString();
        }
        const { error } = await supabase.from('blog_posts').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        if (status === 'published') payload.published_at = new Date().toISOString();
        const { error } = await supabase.from('blog_posts').insert(payload);
        if (error) throw error;
      }
      toast({ title: editingId ? 'Članak ažuriran' : 'Članak kreiran' });
      qc.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      qc.invalidateQueries({ queryKey: ['public-blog-posts'] });
      setOpen(false);
    } catch (e: any) {
      toast({ title: 'Greška', description: e?.message || 'Snimanje nije uspjelo', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Članak obrisan' });
      qc.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      qc.invalidateQueries({ queryKey: ['public-blog-posts'] });
    },
    onError: (e: any) => toast({ title: 'Greška', description: e?.message, variant: 'destructive' }),
  });

  const folder = `blog/${editingId || 'new'}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Blog</h1>
          <p className="text-sm text-muted-foreground">Upravljanje blog člancima</p>
        </div>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" />Novi članak</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : !posts?.length ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground">Još nema članaka. Kreirajte prvi članak.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-card rounded-lg border border-border p-4 flex items-center justify-between gap-4 hover:shadow-sm transition-shadow"
            >
              <button
                onClick={() => openEdit(post)}
                className="flex-1 text-left space-y-1 min-w-0"
              >
                <h3 className="font-heading font-semibold text-foreground truncate">{post.title}</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{new Date(post.created_at).toLocaleDateString('sr-Latn-RS')}</span>
                  <span>•</span>
                  <span className="truncate">/{post.slug}</span>
                </div>
              </button>
              <Badge variant={post.status === 'published' ? 'default' : 'outline'}>
                {post.status === 'published' ? 'Objavljeno' : 'Nacrt'}
              </Badge>
              {post.status === 'published' && (
                <Button size="icon" variant="ghost" asChild title="Otvori">
                  <Link to={`/blog/${post.slug}`} target="_blank"><ExternalLink className="w-4 h-4" /></Link>
                </Button>
              )}
              <Button size="icon" variant="ghost" onClick={() => openEdit(post)} title="Izmijeni">
                <Pencil className="w-4 h-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="icon" variant="ghost" className="text-destructive" title="Obriši">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Obrisati članak?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Ova akcija je nepovratna. Članak "{post.title}" će biti trajno obrisan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Otkaži</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteMutation.mutate(post.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Obriši
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl lg:max-w-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingId ? 'Izmijeni članak' : 'Novi članak'}</SheetTitle>
            <SheetDescription>
              Popunite osnovne podatke i dodajte sekcije sadržaja.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5 py-6">
            <div className="space-y-2">
              <Label htmlFor="title">Naslov *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Npr. Vodič za vakcinaciju štenaca"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => { setSlugTouched(true); setForm({ ...form, slug: slugify(e.target.value) }); }}
                placeholder="vakcinacija-stenaca"
              />
              <p className="text-xs text-muted-foreground">URL članka: /blog/{form.slug || '...'}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Kratak opis</Label>
              <Textarea
                id="excerpt"
                rows={3}
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="Kratak opis koji se prikazuje na kartici i u SEO meta opisu."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="author">Autor</Label>
                <Input
                  id="author"
                  value={form.author_name}
                  onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                  placeholder="Dr. Marko Petrović"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rt">Vrijeme čitanja (min)</Label>
                <Input
                  id="rt"
                  type="number"
                  min={1}
                  value={form.read_time_minutes}
                  onChange={(e) => setForm({ ...form, read_time_minutes: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Naslovna slika</Label>
              <ImageField
                value={form.hero_image_url}
                folder={folder}
                onChange={(url) => setForm({ ...form, hero_image_url: url })}
                onError={(msg) => toast({ title: 'Greška uploada', description: msg, variant: 'destructive' })}
              />
            </div>

            <div className="space-y-2">
              <Label>Sekcije sadržaja</Label>
              <ServiceContentEditor
                blocks={form.content_blocks}
                onChange={(b) => setForm({ ...form, content_blocks: b })}
                folder={folder}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={form.status} onValueChange={(v: 'draft' | 'published') => setForm({ ...form, status: v })}>
                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Nacrt</SelectItem>
                  <SelectItem value="published">Objavljeno</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter className="gap-2 flex-col sm:flex-row">
            <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
              Sačuvaj kao nacrt
            </Button>
            <Button onClick={() => handleSave(true)} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {form.status === 'published' || !editingId ? 'Objavi' : 'Sačuvaj i objavi'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminBlogManager;
