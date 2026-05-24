import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, User, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { Button } from '@/components/ui/button';
import { ContentBlocksRenderer } from '@/components/ContentBlocksRenderer';
import type { ServiceContentBlock } from '@/hooks/useAppointmentData';

const formatDate = (iso: string | null) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('sr-Latn-RS', { day: 'numeric', month: 'long', year: 'numeric' });
};

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ['public-blog-post', slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug!)
        .eq('status', 'published')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-h2 text-foreground mb-4">Članak nije pronađen</h1>
            <Button asChild>
              <Link to="/blog">Povratak na blog</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const blocks: ServiceContentBlock[] = Array.isArray((post as any).content_blocks)
    ? ((post as any).content_blocks as ServiceContentBlock[])
    : [];

  return (
    <Layout>
      <Helmet>
        <title>{post.title} | Blog</title>
        {post.excerpt && <meta name="description" content={post.excerpt} />}
      </Helmet>

      <PageHero
        title={post.title}
        description={post.excerpt || undefined}
        breadcrumbs={[
          { label: 'Blog', href: '/blog' },
          { label: post.title },
        ]}
      />

      <section className="section-padding pt-8">
        <div className="container-custom max-w-4xl">
          <div className="flex flex-wrap items-center gap-4 text-small text-muted-foreground mb-8">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(post.published_at || post.created_at)}
            </span>
            {post.author_name && (
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.author_name}
              </span>
            )}
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {post.read_time_minutes} min čitanja
            </span>
          </div>

          {post.hero_image_url && (
            <div className="rounded-card overflow-hidden shadow-card mb-10">
              <img
                src={post.hero_image_url}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover"
              />
            </div>
          )}

          <article className="space-y-8">
            {blocks.length === 0 && !post.excerpt && (
              <p className="text-muted-foreground">Sadržaj članka još nije dodat.</p>
            )}
            <ContentBlocksRenderer blocks={blocks} />
          </article>

          <div className="mt-12 pt-8 border-t border-border">
            <Button variant="outline" asChild>
              <Link to="/blog"><ArrowLeft className="w-4 h-4 mr-2" />Svi članci</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default BlogPostPage;