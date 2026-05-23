import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Clock, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { Button } from '@/components/ui/button';
import type { ServiceContentBlock } from '@/hooks/useAppointmentData';

const useServiceBySlug = (slug?: string) =>
  useQuery({
    queryKey: ['service-by-slug', slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, description, price, duration_minutes, slug, hero_image_url, long_description, content_blocks, service_categories(name)')
        .eq('slug', slug!)
        .eq('is_active', true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

const Block = ({ block }: { block: ServiceContentBlock }) => {
  if (block.type === 'image') {
    return (
      <figure className="space-y-2">
        <img
          src={block.image_url}
          alt={block.title || ''}
          className="w-full rounded-card shadow-card object-cover max-h-[480px]"
        />
        {block.title && (
          <figcaption className="text-small text-muted-foreground text-center">{block.title}</figcaption>
        )}
      </figure>
    );
  }
  if (block.type === 'list') {
    const items = (block.body || '').split('\n').map((s) => s.trim()).filter(Boolean);
    return (
      <div>
        {block.title && <h2 className="text-h3 text-foreground mb-4">{block.title}</h2>}
        <ul className="space-y-2 list-disc list-inside text-foreground">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div>
      {block.title && <h2 className="text-h3 text-foreground mb-4">{block.title}</h2>}
      <p className="text-muted-foreground text-lg whitespace-pre-line">{block.body}</p>
    </div>
  );
};

const ServiceDetailsPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: service, isLoading } = useServiceBySlug(slug);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!service) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-h2 text-foreground mb-4">Usluga nije pronađena</h1>
            <Button asChild>
              <Link to="/cjenovnik-usluga">Povratak na cjenovnik</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const blocks: ServiceContentBlock[] = Array.isArray((service as any).content_blocks)
    ? ((service as any).content_blocks as ServiceContentBlock[])
    : [];
  const category = (service as any).service_categories?.name as string | undefined;

  return (
    <Layout>
      <Helmet>
        <title>{service.name} | Veterinarska Ordinacija</title>
        {service.description && <meta name="description" content={service.description} />}
      </Helmet>
      <PageHero
        title={service.name}
        description={service.description || undefined}
        breadcrumbs={[
          { label: 'Usluge', href: '/cjenovnik-usluga' },
          ...(category ? [{ label: category }] : []),
          { label: service.name },
        ]}
      />

      <section className="section-padding pt-8">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              {service.hero_image_url && (
                <div className="rounded-card overflow-hidden shadow-card">
                  <img
                    src={service.hero_image_url}
                    alt={service.name}
                    className="w-full h-64 md:h-96 object-cover"
                  />
                </div>
              )}

              {service.long_description && (
                <div>
                  <h2 className="text-h3 text-foreground mb-4">O Usluzi</h2>
                  <p className="text-muted-foreground text-lg whitespace-pre-line">
                    {service.long_description}
                  </p>
                </div>
              )}

              {blocks.map((b) => (
                <Block key={b.id} block={b} />
              ))}

              {!service.hero_image_url && !service.long_description && blocks.length === 0 && (
                <p className="text-muted-foreground">Detaljan opis za ovu uslugu još nije dodat.</p>
              )}
            </div>

            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="bg-card p-6 rounded-card shadow-card space-y-4">
                  <div>
                    <span className="text-small text-muted-foreground">Cijena</span>
                    <p className="text-h4 font-heading font-bold text-primary">
                      {service.price != null ? `${Number(service.price).toFixed(2)} KM` : 'Po dogovoru'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration_minutes} min</span>
                  </div>
                  <Button variant="accent" className="w-full" asChild>
                    <Link to="/contact">Zakaži Termin</Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/cjenovnik-usluga">Sve usluge</Link>
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ServiceDetailsPage;