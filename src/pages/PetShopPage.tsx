import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, Star, Filter, Search, Tag } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const categories = [
  { id: 'all', name: 'Sve', count: 16 },
  { id: 'food', name: 'Hrana', count: 6 },
  { id: 'toys', name: 'Igračke', count: 4 },
  { id: 'accessories', name: 'Oprema', count: 3 },
  { id: 'health', name: 'Zdravlje', count: 3 },
];

const products = [
  {
    id: 1,
    name: 'Premium Hrana za Pse - Adult',
    category: 'food',
    price: 45.00,
    originalPrice: 55.00,
    rating: 4.9,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400&h=400&fit=crop',
    badge: 'Akcija',
  },
  {
    id: 2,
    name: 'Mačja Hrana - Grain Free',
    category: 'food',
    price: 38.00,
    rating: 4.8,
    reviews: 95,
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=400&fit=crop',
  },
  {
    id: 3,
    name: 'Interaktivna Igračka za Pse',
    category: 'toys',
    price: 15.00,
    rating: 4.7,
    reviews: 67,
    image: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=400&h=400&fit=crop',
  },
  {
    id: 4,
    name: 'Ortopedski Krevet - Veliki',
    category: 'accessories',
    price: 89.00,
    rating: 5.0,
    reviews: 42,
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=400&fit=crop',
    badge: 'Novo',
  },
  {
    id: 5,
    name: 'Vitamini za Pse',
    category: 'health',
    price: 25.00,
    rating: 4.6,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1585846416120-3a7354ed7d39?w=400&h=400&fit=crop',
  },
  {
    id: 6,
    name: 'Ogrlica sa GPS Trackerom',
    category: 'accessories',
    price: 120.00,
    rating: 4.9,
    reviews: 34,
    image: 'https://images.unsplash.com/photo-1599839619722-537e0e2e9ccc?w=400&h=400&fit=crop',
    badge: 'Bestseler',
  },
  {
    id: 7,
    name: 'Šampon za Pse - Prirodni',
    category: 'health',
    price: 18.00,
    rating: 4.5,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?w=400&h=400&fit=crop',
  },
  {
    id: 8,
    name: 'Mačja Igračka - Set',
    category: 'toys',
    price: 12.00,
    rating: 4.8,
    reviews: 78,
    image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400&h=400&fit=crop',
  },
];

const PetShopPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Layout>
      <PageHero
        title="Pet Shop"
        description="Kvalitetna hrana, igračke i oprema za vaše ljubimce od provjerenih proizvođača."
        breadcrumbs={[{ label: 'Pet Shop' }]}
      />

      <section className="section-padding">
        <div className="container-custom">
          {/* Promo Banner */}
          <div className="mb-12 relative overflow-hidden rounded-card bg-gradient-to-r from-accent to-accent/80 p-8 md:p-12">
            <div className="relative z-10 max-w-lg">
              <div className="inline-flex items-center gap-2 bg-foreground/10 text-accent-foreground px-3 py-1 rounded-full text-small font-medium mb-4">
                <Tag className="w-4 h-4" />
                Specijalna Ponuda
              </div>
              <h3 className="text-h3 text-accent-foreground mb-4">
                20% Popusta Na Prvu Narudžbu!
              </h3>
              <p className="text-accent-foreground/80 mb-6">
                Registrujte se i uživajte u ekskluzivnom popustu na vašu prvu online narudžbu.
              </p>
              <Button variant="default" size="lg">
                Registruj Se Sada
              </Button>
            </div>
            <div className="absolute right-0 top-0 w-64 h-64 bg-foreground/10 rounded-full blur-3xl" />
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Search */}
                <div className="bg-card p-4 rounded-card shadow-card">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Pretraži proizvode..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="bg-card p-4 rounded-card shadow-card">
                  <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-primary" />
                    <h3 className="font-heading font-semibold text-foreground">
                      Kategorije
                    </h3>
                  </div>
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

            {/* Products Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  Prikazano {filteredProducts.length} proizvoda
                </p>
              </div>

              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-card rounded-card shadow-card overflow-hidden card-hover"
                  >
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.badge && (
                        <div className="absolute top-3 left-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            product.badge === 'Akcija'
                              ? 'bg-destructive text-destructive-foreground'
                              : product.badge === 'Novo'
                              ? 'bg-success text-success-foreground'
                              : 'bg-accent text-accent-foreground'
                          }`}>
                            {product.badge}
                          </span>
                        </div>
                      )}
                      <button className="absolute top-3 right-3 w-10 h-10 bg-card/90 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-accent hover:text-accent-foreground">
                        <ShoppingBag className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 fill-accent text-accent" />
                        <span className="text-small font-medium text-foreground">
                          {product.rating}
                        </span>
                        <span className="text-small text-muted-foreground">
                          ({product.reviews})
                        </span>
                      </div>
                      <h3 className="font-heading font-medium text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-h4 font-heading font-bold text-primary">
                          {product.price.toFixed(2)} KM
                        </span>
                        {product.originalPrice && (
                          <span className="text-small text-muted-foreground line-through">
                            {product.originalPrice.toFixed(2)} KM
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Nema proizvoda koji odgovaraju vašoj pretrazi.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Free Shipping Banner */}
          <div className="mt-16 bg-secondary/50 rounded-card p-8 text-center">
            <h3 className="text-h3 text-foreground mb-2">
              Besplatna Dostava Za Narudžbe Preko 50 KM
            </h3>
            <p className="text-muted-foreground">
              Naručite online i uživajte u besplatnoj dostavi na području Banjaluke.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PetShopPage;
