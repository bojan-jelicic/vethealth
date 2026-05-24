import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
}

const _unused_articles_placeholder = [
  {
    id: 1,
    slug: 'vakcinacija-stenaca',
    title: 'Vodič Za Vakcinaciju Štenaca: Sve Što Trebate Znati',
    excerpt: 'Kompletni vodič za vakcinaciju vašeg štenca - kada, kako i zašto je važno poštovati raspored vakcinacija.',
    category: 'health',
    author: 'Dr. Marko Petrović',
    date: '2024-01-15',
    readTime: '8 min',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=500&fit=crop',
    featured: true,
  },
  {
    id: 2,
    slug: 'ishrana-macaka',
    title: 'Pravilna Ishrana Mačaka: Vodič Za Vlasnike',
    excerpt: 'Saznajte koje namirnice su sigurne za mačke, a koje trebate izbjegavati po svaku cijenu.',
    category: 'nutrition',
    author: 'Dr. Ana Jović',
    date: '2024-01-10',
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=500&fit=crop',
  },
  {
    id: 3,
    slug: 'znaci-bolesti-psa',
    title: '10 Znakova Da Vaš Pas Nije Dobro',
    excerpt: 'Naučite prepoznati rane znakove bolesti kod pasa i kada je vrijeme za posjetu veterinaru.',
    category: 'health',
    author: 'Dr. Marko Petrović',
    date: '2024-01-05',
    readTime: '7 min',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=500&fit=crop',
  },
  {
    id: 4,
    slug: 'trening-pasa',
    title: 'Osnovni Trening Za Pse: Savjeti Za Početnike',
    excerpt: 'Praktični savjeti za trening vašeg psa kod kuće - od osnovnih komandi do naprednih trikova.',
    category: 'behavior',
    author: 'Jelena Marić',
    date: '2023-12-28',
    readTime: '10 min',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=500&fit=crop',
  },
  {
    id: 5,
    slug: 'njega-dlake',
    title: 'Kako Pravilno Njegovati Dlaku Vašeg Ljubimca',
    excerpt: 'Sve o četkanju, kupanju i održavanju zdrave dlake kod pasa i mačaka različitih rasa.',
    category: 'care',
    author: 'Dr. Ana Jović',
    date: '2023-12-20',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1516222338250-863216ce01ea?w=800&h=500&fit=crop',
  },
  {
    id: 6,
    slug: 'zubna-higijena',
    title: 'Zubna Higijena Kod Kućnih Ljubimaca',
    excerpt: 'Zašto je važno brinuti o zubima vašeg ljubimca i kako pravilno čistiti zube kod kuće.',
    category: 'care',
    author: 'Dr. Marko Petrović',
    date: '2023-12-15',
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=500&fit=crop',
  },
];

const BlogPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = articles.filter((article) => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = articles.find(a => a.featured);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bs-BA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Layout>
      <PageHero
        title="Blog & Savjeti"
        description="Korisni članci i savjeti za brigu o vašim ljubimcima od naših veterinarskih stručnjaka."
        breadcrumbs={[{ label: 'Blog' }]}
      />

      <section className="section-padding">
        <div className="container-custom">
          {/* Featured Article */}
          {featuredArticle && (
            <div className="mb-12">
              <Link
                to={`/blog/${featuredArticle.slug}`}
                className="group grid md:grid-cols-2 gap-6 bg-card rounded-card shadow-card overflow-hidden card-hover"
              >
                <div className="aspect-video md:aspect-auto overflow-hidden">
                  <img
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1 rounded-full text-small font-medium w-fit mb-4">
                    <Tag className="w-4 h-4" />
                    Istaknuto
                  </div>
                  <h2 className="text-h3 text-foreground mb-4 group-hover:text-primary transition-colors">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {featuredArticle.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-small text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {featuredArticle.author}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(featuredArticle.date)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {featuredArticle.readTime}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Search */}
                <div className="bg-card p-4 rounded-card shadow-card">
                  <h3 className="font-heading font-semibold text-foreground mb-4">
                    Pretraži Članke
                  </h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Unesite pojam..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="bg-card p-4 rounded-card shadow-card">
                  <h3 className="font-heading font-semibold text-foreground mb-4">
                    Kategorije
                  </h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-secondary/50 text-foreground'
                        }`}
                      >
                        <span>{category.name}</span>
                        <span className={`text-small ${
                          selectedCategory === category.id
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        }`}>
                          ({category.count})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Articles Grid */}
            <div className="flex-1">
              <div className="grid md:grid-cols-2 gap-6">
                {filteredArticles.filter(a => !a.featured).map((article) => (
                  <Link
                    key={article.id}
                    to={`/blog/${article.slug}`}
                    className="group bg-card rounded-card shadow-card overflow-hidden card-hover"
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-3 text-small text-muted-foreground mb-3">
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">
                          {categories.find(c => c.id === article.category)?.name}
                        </span>
                        <span>{formatDate(article.date)}</span>
                      </div>
                      <h3 className="font-heading font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-small text-muted-foreground mb-4 line-clamp-2">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-small text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {article.readTime}
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

              {filteredArticles.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Nema članaka koji odgovaraju vašoj pretrazi.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default BlogPage;
