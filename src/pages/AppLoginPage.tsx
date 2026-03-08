import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PawPrint, AlertTriangle } from 'lucide-react';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Unesite validnu email adresu'),
  password: z.string().min(6, 'Lozinka mora imati najmanje 6 karaktera'),
});

const AppLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { signIn, user, isStaff, sessionExpired, dismissSessionExpired } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user && isStaff) {
      navigate('/app/dashboard');
    }
  }, [user, isStaff, navigate]);

  const validateForm = () => {
    try {
      authSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string } = {};
        err.errors.forEach((error) => {
          if (error.path[0] === 'email') fieldErrors.email = error.message;
          if (error.path[0] === 'password') fieldErrors.password = error.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    dismissSessionExpired();

    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Greška pri prijavi',
        description: error.message === 'Invalid login credentials'
          ? 'Pogrešan email ili lozinka'
          : error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Uspješna prijava',
        description: 'Dobrodošli nazad!',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <PawPrint className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-heading">VetHealth App</CardTitle>
          <CardDescription>Prijavite se sa vašim nalogom</CardDescription>
        </CardHeader>
        <CardContent>
          {sessionExpired && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground text-sm">Sesija je istekla</p>
                <p className="text-xs text-muted-foreground">Molimo prijavite se ponovo.</p>
              </div>
            </div>
          )}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="vas@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Lozinka</Label>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Prijava...</>
              ) : (
                'Prijavi se'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppLoginPage;
