import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PawPrint, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const PortalLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Check if user has client role
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '')
        .eq('role', 'client' as any);

      if (!roles?.length) {
        await supabase.auth.signOut();
        toast({ title: 'Pristup odbijen', description: 'Nemate pristup klijentskom portalu.', variant: 'destructive' });
      } else {
        navigate('/portal');
      }
    } catch (err: any) {
      toast({ title: 'Greška', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <PawPrint className="h-7 w-7 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-heading">Klijentski Portal</CardTitle>
          <CardDescription>Prijavite se za pristup podacima vaših ljubimaca</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Lozinka</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Prijava
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-6">
            Pristup portalu je dostupan samo registrovanim klijentima veterinarske ordinacije.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortalLogin;
