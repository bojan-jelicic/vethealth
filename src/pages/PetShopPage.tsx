import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Star, Filter, Search, Tag } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const products = [
  { id: 1, name: 'Premium Hrana za Pse - Adult', category: 'food', price: 45.00, originalPrice: 55.00, rating: 4.9, reviews: 128, image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400&h=400&fit=crop', badgeKey: 'sale' },
  { id: 2, name: 'Mačja Hrana - Grain Free', category: 'food', price: 38.00, rating: 4.8, reviews: 95, image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=400&fit=crop' },
  { id: 3, name: 'Interaktivna Igračka za Pse', category: 'toys', price: 15.00, rating: 4.7, reviews: 67, image: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=400&h=400&fit=crop' },
  { id: 4, name: 'Ortopedski Krevet - Veliki', category: 'accessories', price: 89.00, rating: 5.0, reviews: 42, image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=400&fit=crop', badgeKey: 'new' },
  { id: 5, name: 'Vitamini za Pse', category: 'health', price: 25.00, rating: 4.6, reviews: 89, image: 'https://images.unsplash.com/photo-1585846416120-3a7354ed7d39?w=400&h=400&fit=crop' },
  { id: 6, name: 'Ogrlica sa GPS Trackerom', category: 'accessories', price: 120.00, rating: 4.9, reviews: 34, image: 'https://images.unsplash.com/photo-1599839619722-537e0e2e9ccc?w=400&h=400&fit=crop', badgeKey: 'bestseller' },
  { id: 7, name: 'Šampon za Pse - Prirodni', category: 'health', price: 18.00, rating: 4.5, reviews: 156, image: 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?w=400&h=400&fit=crop' },
  { id: 8, name: 'Mačja Igračka - Set', category: 'toys', price: 12.00, rating: 4.8, reviews: 78, image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400&h=400&fit=crop' },
];

const PetShopPage = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', nameKey: 'petShopPage.all', count: 16 },
    { id: 'food', nameKey: 'petShopPage.food', count: 6 },
    { id: 'toys', nameKey: 'petShopPage.toys', count: 4 },
    { id: 'accessories', nameKey: 'petShopPage.accessories', count: 3 },
    { id: 'health', nameKey: 'petShopPage.health', count: 3 },
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const badgeStyles: Record<string, string> = {
    sale: 'bg-destructive text-destructive-foreground',
    new: 'bg-success text-success-foreground',
    bestseller: 'bg-accent text-accent-foreground',
  };

  return (
    <Layout>
      <Helmet>
        <title>{t('petShopPage.seoTitle')}</title>
        <meta name="description" content={t('petShopPage.seoDescription')} />
      </Helmet>
      <PageHero title={t('petShopPage.title')} description={t('petShopPage.description')} breadcrumbs={[{ label: t('nav.petShop') }]} />

      <section className="section-padding">
        <div className="container-custom">
          {/* Promo Banner */}
          <div className="mb-12 relative overflow-hidden rounded-card bg-gradient-to-r from-accent to-accent/80 p-8 md:p-12">
            <div className="relative z-10 max-w-lg">
              <div className="inline-flex items-center gap-2 bg-foreground/10 text-accent-foreground px-3 py-1 rounded-full text-small font-medium mb-4">
                <Tag className="w-4 h-4" />{t('petShopPage.specialOffer')}
              </div>
              <h3 className="text-h3 text-accent-foreground mb-4">{t('petShopPage.promoTitle')}</h3>
              <p className="text-accent-foreground/80 mb-6">{t('petShopPage.promoDesc')}</p>
              <Button variant="default" size="lg">{t('petShopPage.registerNow')}</Button>
            </div>
            <div className="absolute right-0 top-0 w-64 h-64 bg-foreground/10 rounded-full blur-3xl" />
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <div className="bg-card p-4 rounded-card shadow-card">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder={t('petShopPage.searchPlaceholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <div className="bg-card p-4 rounded-card shadow-card">
                  <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-primary" />
                    <h3 className="font-heading font-semibold text-foreground">{t('petShopPage.categories')}</h3>
                  </div>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${selectedCategory === cat.id ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary/50 text-foreground'}`}>
                        <span>{t(cat.nameKey)}</span>
                        <span className={`text-small ${selectedCategory === cat.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>({cat.count})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">{t('petShopPage.showing')} {filteredProducts.length} {t('petShopPage.products')}</p>
              </div>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="group bg-card rounded-card shadow-card overflow-hidden card-hover">
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {product.badgeKey && (
                        <div className="absolute top-3 left-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${badgeStyles[product.badgeKey]}`}>
                            {t(`petShopPage.${product.badgeKey}`)}
                          </span>
                        </div>
                      )}
                      <button className="absolute top-3 right-3 w-10 h-10 bg-card/90 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-accent hover:text-accent-foreground">
                        <ShoppingBag className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 fill-accent text-accent" />
                        <span className="text-small font-medium text-foreground">{product.rating}</span>
                        <span className="text-small text-muted-foreground">({product.reviews})</span>
                      </div>
                      <h3 className="font-heading font-medium text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">{product.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-h4 font-heading font-bold text-primary">{product.price.toFixed(2)} KM</span>
                        {product.originalPrice && <span className="text-small text-muted-foreground line-through">{product.originalPrice.toFixed(2)} KM</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {filteredProducts.length === 0 && (
                <div className="text-center py-12"><p className="text-muted-foreground">{t('petShopPage.noProducts')}</p></div>
              )}
            </div>
          </div>

          <div className="mt-16 bg-secondary/50 rounded-card p-8 text-center">
            <h3 className="text-h3 text-foreground mb-2">{t('petShopPage.freeShipping')}</h3>
            <p className="text-muted-foreground">{t('petShopPage.freeShippingDesc')}</p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PetShopPage;
