import { useState } from 'react';
import { Settings, Mail, Send, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AdminSettings = () => {
  // Email config (mock/local storage for MVP)
  const [emailConfig, setEmailConfig] = useState(() => {
    const stored = localStorage.getItem('vethealth_email_config');
    return stored ? JSON.parse(stored) : {
      sender_name: 'VetHealth.ba',
      sender_email: 'info@vethealth.ba',
      reply_to: 'info@vethealth.ba',
      enabled: true,
    };
  });
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testSent, setTestSent] = useState(false);

  const saveEmailConfig = () => {
    localStorage.setItem('vethealth_email_config', JSON.stringify(emailConfig));
    toast({ title: 'Email postavke sačuvane' });
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast({ title: 'Unesite email adresu', variant: 'destructive' });
      return;
    }
    setSendingTest(true);
    setTestSent(false);
    try {
      const { data, error } = await supabase.functions.invoke('send-reminder-email', {
        body: {
          reminder_id: null,
          recipient_email: testEmail,
          recipient_name: 'Test korisnik',
          pet_name: 'Rex',
          reminder_title: 'Test podsjetnik — Revakcinacija',
          reminder_type: 'vaccine_due',
          due_date: new Date().toISOString().split('T')[0],
          description: 'Ovo je test email iz VetHealth sistema.',
          is_test: true,
        },
      });
      if (error) throw error;
      setTestSent(true);
      toast({ title: 'Test email poslan!' });
    } catch (err) {
      toast({ title: 'Greška pri slanju test emaila', variant: 'destructive' });
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Postavke</h1>
        <p className="text-sm text-muted-foreground">Sistemska podešavanja aplikacije</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informacije o ordinaciji</CardTitle>
          <CardDescription>Osnovni podaci o veterinarskoj ordinaciji</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Naziv ordinacije</Label>
            <Input defaultValue="VetHealth.ba" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input defaultValue="+387 51 123 456" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue="info@vethealth.ba" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Adresa</Label>
            <Input defaultValue="Ulica Primjer 123, 78000 Banjaluka" />
          </div>
          <Button>Sačuvaj promjene</Button>
        </CardContent>
      </Card>

      {/* Email Sender Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email postavke
              </CardTitle>
              <CardDescription>Konfiguracija slanja email podsjetnika</CardDescription>
            </div>
            <Badge variant={emailConfig.enabled ? 'default' : 'secondary'}>
              {emailConfig.enabled ? 'Aktivno' : 'Neaktivno'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Email slanje aktivno</p>
              <p className="text-sm text-muted-foreground">Omogući slanje email podsjetnika klijentima</p>
            </div>
            <Switch
              checked={emailConfig.enabled}
              onCheckedChange={(v) => setEmailConfig((p: any) => ({ ...p, enabled: v }))}
            />
          </div>
          <Separator />
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ime pošiljaoca</Label>
              <Input
                value={emailConfig.sender_name}
                onChange={(e) => setEmailConfig((p: any) => ({ ...p, sender_name: e.target.value }))}
                placeholder="VetHealth.ba"
              />
            </div>
            <div className="space-y-2">
              <Label>Email pošiljaoca</Label>
              <Input
                value={emailConfig.sender_email}
                onChange={(e) => setEmailConfig((p: any) => ({ ...p, sender_email: e.target.value }))}
                placeholder="info@vethealth.ba"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Reply-to adresa</Label>
            <Input
              value={emailConfig.reply_to}
              onChange={(e) => setEmailConfig((p: any) => ({ ...p, reply_to: e.target.value }))}
              placeholder="info@vethealth.ba"
            />
          </div>
          <Button onClick={saveEmailConfig}>Sačuvaj email postavke</Button>

          <Separator />

          {/* Test Email */}
          <div>
            <p className="font-medium text-foreground mb-1">Pošalji test email</p>
            <p className="text-sm text-muted-foreground mb-3">
              Pošaljite probni email da provjerite da li konfiguracija radi ispravno.
            </p>
            <div className="flex gap-2">
              <Input
                value={testEmail}
                onChange={(e) => { setTestEmail(e.target.value); setTestSent(false); }}
                placeholder="unesite@email.com"
                type="email"
                className="max-w-sm"
              />
              <Button
                onClick={sendTestEmail}
                disabled={sendingTest || !testEmail}
                variant={testSent ? 'outline' : 'default'}
                className="gap-1.5"
              >
                {sendingTest ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Slanje...</>
                ) : testSent ? (
                  <><CheckCircle className="h-4 w-4 text-green-600" />Poslano</>
                ) : (
                  <><Send className="h-4 w-4" />Pošalji test</>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notifikacije</CardTitle>
          <CardDescription>Upravljanje automatskim obavještenjima</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Email podsjetnici</p>
              <p className="text-sm text-muted-foreground">Šalji automatske podsjetnike klijentima</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Nova zakazivanja</p>
              <p className="text-sm text-muted-foreground">Obavijesti o novim terminima</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
