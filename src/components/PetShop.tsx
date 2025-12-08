import { ShoppingBag, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const products = [
  {
    id: 1,
    name: 'Premium Hrana za Pse',
    category: 'Hrana',
    price: '45.00 KM',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400&h=400&fit=crop',
  },
  {
    id: 2,
    name: 'Mačja Hrana - Grain Free',
    category: 'Hrana',
    price: '38.00 KM',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=400&fit=crop',
  },
  {
    id: 3,
    name: 'Interaktivna Igračka',
    category: 'Igračke',
    price: '15.00 KM',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=400&h=400&fit=crop',
  },
  {
    id: 4,
    name: 'Ortopedski Krevet',
    category: 'Oprema',
    price: '89.00 KM',
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=400&fit=crop',
  },
];

export const PetShop = () => {
  return (
    <section id="petshop" className="section-padding">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <span className="inline-block text-accent font-medium text-small uppercase tracking-wider mb-4">
              Pet Shop
            </span>
            <h2 className="text-h2 text-foreground mb-4">
              Sve Za Vašeg Ljubimca
            </h2>
            <p className="text-muted-foreground">
              Kvalitetna hrana, igračke i oprema od provjerenih proizvođača. 
              Posjetite naš Pet Shop ili naručite online.
            </p>
          </div>
          <Button variant="outline" className="self-start md:self-auto">
            Pogledaj Sve Proizvode
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
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
                <div className="absolute top-3 left-3">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>
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
                </div>
                <h3 className="font-heading font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <p className="text-h4 font-heading font-bold text-primary">
                  {product.price}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Banner */}
        <div className="mt-16 relative overflow-hidden rounded-card bg-gradient-to-r from-primary to-primary/80 p-8 md:p-12">
          <div className="relative z-10 max-w-lg">
            <h3 className="text-h3 text-primary-foreground mb-4">
              Besplatna Dostava Za Narudžbe Preko 50 KM
            </h3>
            <p className="text-primary-foreground/80 mb-6">
              Naručite online i uživajte u besplatnoj dostavi na području Banjaluke 
              za sve narudžbe iznad 50 KM.
            </p>
            <Button variant="accent" size="lg">
              Naruči Sada
            </Button>
          </div>
          {/* Decorative */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute right-20 bottom-0 w-48 h-48 bg-primary-foreground/10 rounded-full blur-2xl" />
        </div>
      </div>
    </section>
  );
};
