import { useTranslation } from 'react-i18next';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const FAQ = () => {
  const { t } = useTranslation();
  const faqKeys = ['q1', 'q2', 'q3', 'q4', 'q5'];

  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-h2 text-foreground mb-2">{t('faq.title')}</h2>
            <p className="text-muted-foreground">{t('faq.subtitle')}</p>
          </div>
          <Accordion type="single" collapsible className="bg-card rounded-card shadow-card px-6">
            {faqKeys.map((k) => (
              <AccordionItem key={k} value={k}>
                <AccordionTrigger className="text-left font-heading font-medium">
                  {t(`faq.${k}.q`)}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {t(`faq.${k}.a`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};