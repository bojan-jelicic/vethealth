import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, Search, ArrowRight, User, Loader2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface PublicBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  hero_image_url: string | null;
  author_name: string | null;
  read_time_minutes: number;
  published_at: string | null;
  created_at: string;
}

const formatDate = (iso: string | null) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('sr-Latn-RS', { day: 'numeric', month: 'long', year: 'numeric' });
};

const BlogPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: posts, isLoading } = useQuery({
    queryKey: ['public-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, hero_image_url, author_name, read_time_minutes, published_at, created_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as PublicBlogPost[];
    },
  });

  const filtered = (posts || []).filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || (p.excerpt || '').toLowerCase().includes(q);
  });

  return (
    <Layout>
      <Helmet>
        <title>Blog i savjeti | Veterinarska Ordinacija</title>
        <meta name="description" content="Korisni članci i savjeti za brigu o vašim ljubimcima od naših veterinarskih stručnjaka." />
      </Helmet>

      <PageHero
        title="Blog & Savjeti"
        description="Korisni članci i savjeti za brigu o vašim ljubimcima od naših veterinarskih stručnjaka."
        breadcrumbs={[{ label: 'Blog' }]}
      />

      <section className="section-padding">
        <div className="container-custom">
          <div className="max-w-md mb-10 mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži članke..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                {posts?.length ? 'Nema članaka koji odgovaraju vašoj pretrazi.' : 'Još nema objavljenih članaka.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group bg-card rounded-card shadow-card overflow-hidden card-hover flex flex-col"
                >
                  {post.hero_image_url && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.hero_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 text-small text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(post.published_at || post.created_at)}
                      </span>
                      {post.author_name && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {post.author_name}
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-small text-muted-foreground mb-4 line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div className="flex items-center gap-2 text-small text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {post.read_time_minutes} min
                      </div>
                      <div className="flex items-center text-primary font-medium text-small group-hover:gap-2 transition-all">
                        <span>Čitaj više</span>
                        <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default BlogPage;