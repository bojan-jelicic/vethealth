import { Layout } from '@/components/Layout';
import { Hero } from '@/components/Hero';
import { Services } from '@/components/Services';
import { PetShop } from '@/components/PetShop';
import { About } from '@/components/About';
import { Testimonials } from '@/components/Testimonials';
import { Contact } from '@/components/Contact';
import { FEATURES } from '@/config/features';

const Index = () => {
  return (
    <Layout>
      <Hero />
      <Services />
      {FEATURES.publicPetShop && <PetShop />}
      <About />
      <Testimonials />
      <Contact />
    </Layout>
  );
};

export default Index;
