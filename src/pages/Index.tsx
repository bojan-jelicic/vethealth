import { Layout } from '@/components/Layout';
import { Hero } from '@/components/Hero';
import { Services } from '@/components/Services';
import { PetShop } from '@/components/PetShop';
import { About } from '@/components/About';
import { Testimonials } from '@/components/Testimonials';
import { Contact } from '@/components/Contact';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2, Shield } from 'lucide-react';

const Index = () => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const createAdminUser = async () => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-admin');
      
      if (error) throw error;
      
      toast({
        title: 'Admin korisnik kreiran!',
        description: `Email: ${data.email} | Password: ${data.password}`,
        duration: 10000,
      });
    } catch (err) {
      toast({
        title: 'Greška',
        description: 'Nije moguće kreirati admin korisnika',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Layout>
      {/* Temp Admin Button */}
      <div className="fixed bottom-24 right-6 z-50">
        <Button 
          onClick={createAdminUser} 
          disabled={isCreating}
          className="shadow-lg"
        >
          {isCreating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Shield className="h-4 w-4 mr-2" />
          )}
          Kreiraj Admin
        </Button>
      </div>
      
      <Hero />
      <Services />
      <PetShop />
      <About />
      <Testimonials />
      <Contact />
    </Layout>
  );
};

export default Index;
