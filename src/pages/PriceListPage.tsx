import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { useServicesWithCategories, CategoryWithServices } from '@/hooks/useAppointmentData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, Clock, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCategoryIcon } from '@/lib/categoryIcons';

const ServiceCategoryCard = ({ category }: { category: CategoryWithServices }) => {
  const IconComponent = getCategoryIcon(category.icon);

  if (category.services.length === 0) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-secondary/30 border-b border-border">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <IconComponent className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-heading font-semibold text-foreground">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-sm font-normal text-muted-foreground mt-0.5">
                {category.description}
              </p>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full">
          <tbody>
            {category.services.map((service, index) => (
              <tr
                key={service.id}
                className={`
                  border-b border-border last:border-b-0 
                  transition-colors hover:bg-secondary/20
                  ${index % 2 === 0 ? 'bg-card' : 'bg-secondary/5'}
                `}
              >
                <td className="py-4 px-6">
                  <div>
                    <p className="font-medium text-foreground">
                      {service.name}
                    </p>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mt-1 hidden md:block">
                        {service.description}
                      </p>
                    )}
                    {/* Mobile duration */}
                    <div className="flex items-center gap-1 mt-1 sm:hidden text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{service.duration_minutes} min</span>
                    </div>
                  </div>
                </td>
                <td className="text-center py-4 px-4 hidden sm:table-cell">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration_minutes} min</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="text-lg font-bold text-primary">
                    {service.price?.toFixed(2) || '—'}
                  </span>
                  {service.price && (
                    <span className="text-sm text-muted-foreground ml-1">
                      KM
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

const PriceListPage = () => {
  const { data: categories, isLoading, error } = useServicesWithCategories();

  const breadcrumbs = [{ label: 'Cjenovnik Usluga' }];

  const handlePrint = () => {
    window.print();
  };

  const totalServices = categories?.reduce((sum, cat) => sum + cat.services.length, 0) || 0;

  return (
    <Layout>
      <Helmet>
        <title>Cjenovnik Usluga | Veterinarska Ordinacija Banja Luka</title>
        <meta
          name="description"
          content="Pregledajte kompletan cjenovnik veterinarskih usluga. Transparentne cijene za preglede, vakcinacije, hirurgiju i druge usluge."
        />
      </Helmet>

      <PageHero
        title="Cjenovnik Usluga"
        breadcrumbs={breadcrumbs}
        compact
      />

      <section className="py-6 md:py-10 bg-background print:py-4">
        <div className="container-custom">
          {/* Print Button */}
          <div className="flex justify-end mb-4 print:hidden">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Štampaj Cjenovnik
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Učitavanje cjenovnika...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="flex items-center gap-4 p-6">
                <AlertCircle className="w-8 h-8 text-destructive flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Greška pri učitavanju
                  </h3>
                  <p className="text-muted-foreground">
                    Došlo je do greške prilikom učitavanja cjenovnika. Molimo pokušajte ponovo.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!isLoading && !error && totalServices === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-muted-foreground text-lg">
                  Trenutno nema dostupnih usluga u cjenovniku.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Price List by Category */}
          {!isLoading && !error && categories && totalServices > 0 && (
            <div className="space-y-6">
              {/* Info Card */}
              <Card className="bg-primary/5 border-primary/20 print:hidden">
                <CardContent className="p-4">
                  <p className="text-sm text-foreground">
                    <strong>Napomena:</strong> Cijene su izražene u konvertibilnim markama (KM) i informativnog su karaktera.
                    Konačna cijena može varirati ovisno o složenosti tretmana i potrebnim materijalima. 
                    Za tačnu procjenu, molimo kontaktirajte nas.
                  </p>
                </CardContent>
              </Card>

              {/* Categories Grid */}
              <div className="space-y-6">
                {categories.map((category) => (
                  <ServiceCategoryCard key={category.id} category={category} />
                ))}
              </div>

              {/* Additional Info */}
              <div className="grid md:grid-cols-2 gap-6 print:hidden">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-heading font-semibold text-foreground mb-3">
                      Načini Plaćanja
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full" />
                        Gotovina
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full" />
                        Platne kartice (Visa, Mastercard)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full" />
                        Plaćanje na rate (za veće iznose)
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-heading font-semibold text-foreground mb-3">
                      Popusti
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-accent rounded-full" />
                        10% popust za umirovljenike
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-accent rounded-full" />
                        15% popust za više ljubimaca
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-accent rounded-full" />
                        Posebne cijene za azile i udruge
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Print Styles */}
      <style>{`
        @media print {
          header, footer, .print\\:hidden {
            display: none !important;
          }
          .print\\:py-4 {
            padding-top: 1rem !important;
            padding-bottom: 1rem !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </Layout>
  );
};

export default PriceListPage;
