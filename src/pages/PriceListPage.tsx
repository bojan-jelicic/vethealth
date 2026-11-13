import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { useServicesWithCategories, CategoryWithServices, hasServiceDetails } from '@/hooks/useAppointmentData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react';
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
        <table className="w-full table-fixed">
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
                    {hasServiceDetails(service) ? (
                      <Link
                        to={`/services/${service.slug}`}
                        className="font-medium text-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5 group"
                      >
                        {service.name}
                        <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                      </Link>
                    ) : (
                      <p className="font-medium text-foreground">
                        {service.name}
                      </p>
                    )}
                    {service.description && (
                      <p className="text-sm text-muted-foreground mt-1 hidden md:block">
                        {service.description}
                      </p>
                    )}
                  </div>
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

  const totalServices = categories?.reduce((sum, cat) => sum + cat.services.length, 0) || 0;

  return (
    <Layout>
      <Helmet>
        <title>Usluge | Veterinarska Ordinacija Banja Luka</title>
        <meta
          name="description"
          content="Pregledajte veterinarske usluge VEThealth ambulante: pregledi, vakcinacije, hirurgija, laboratorija i druge usluge."
        />
      </Helmet>

      <section className="pt-32 md:pt-36 pb-2">
        <div className="container-custom">
          <h1 className="text-h1 text-foreground">Naše usluge</h1>
        </div>
      </section>

      <section className="pt-4 pb-6 md:pb-10 bg-background print:py-4">
        <div className="container-custom">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Učitavanje usluga...</p>
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
                    Došlo je do greške prilikom učitavanja usluga. Molimo pokušajte ponovo.
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
                  Trenutno nema dostupnih usluga.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Price List by Category */}
          {!isLoading && !error && categories && totalServices > 0 && (
            <div className="space-y-6">
              {/* Categories Grid */}
              <div className="space-y-6">
                {categories.map((category) => (
                  <ServiceCategoryCard key={category.id} category={category} />
                ))}
              </div>

              {/* Additional Info */}
              <div className="grid gap-6 print:hidden">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-heading font-semibold text-foreground mb-3">
                      Načini plaćanja
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
