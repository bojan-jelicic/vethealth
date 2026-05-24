import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useClinicSettings } from '@/hooks/useClinicSettings';
import { logAudit } from '@/services/auditService';

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const { data: clinic } = useClinicSettings();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    pon_pet: '',
    sub: '',
    ned: '',
    social_facebook: '',
    social_instagram: '',
  });
  const [savingClinic, setSavingClinic] = useState(false);

  useEffect(() => {
    if (!clinic) return;
    setForm({
      name: clinic.name || '',
      phone: clinic.phone || '',
      email: clinic.email || '',
      address: clinic.address || '',
      pon_pet: clinic.working_hours?.pon_pet || '',
      sub: clinic.working_hours?.sub || '',
      ned: clinic.working_hours?.ned || '',
      social_facebook: clinic.social_facebook || '',
      social_instagram: clinic.social_instagram || '',
    });
  }, [clinic]);

  const saveClinicSettings = async () => {
    if (!clinic?.id) return;
    setSavingClinic(true);
    const { error } = await (supabase as any)
      .from('clinic_settings')
      .update({
        name: form.name,
        phone: form.phone || null,
        email: form.email || null,
        address: form.address || null,
        working_hours: {
          pon_pet: form.pon_pet,
          sub: form.sub,
          ned: form.ned,
        },
        social_facebook: form.social_facebook || null,
        social_instagram: form.social_instagram || null,
      })
      .eq('id', clinic.id);
    setSavingClinic(false);
    if (error) {
      toast({ title: 'Greška pri snimanju', description: error.message, variant: 'destructive' });
      return;
    }
    await logAudit({
      action: 'update',
      entity_type: 'clinic_settings',
      entity_id: clinic.id,
      metadata: {
        name: form.name,
        phone_changed: (clinic.phone || '') !== form.phone,
        email_changed: (clinic.email || '') !== form.email,
        address_changed: (clinic.address || '') !== form.address,
      },
    });
    queryClient.invalidateQueries({ queryKey: ['clinic-settings'] });
    toast({ title: 'Postavke ordinacije sačuvane' });
  };

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
          <CardDescription>Ovi podaci se prikazuju na javnom sajtu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Naziv ordinacije</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Adresa</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>

          <Separator />
          <p className="text-sm font-medium text-foreground">Radno vrijeme</p>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Pon - Pet</Label>
              <Input value={form.pon_pet} onChange={(e) => setForm({ ...form, pon_pet: e.target.value })} placeholder="08:00 - 20:00" />
            </div>
            <div className="space-y-2">
              <Label>Subota</Label>
              <Input value={form.sub} onChange={(e) => setForm({ ...form, sub: e.target.value })} placeholder="09:00 - 14:00" />
            </div>
            <div className="space-y-2">
              <Label>Nedjelja</Label>
              <Input value={form.ned} onChange={(e) => setForm({ ...form, ned: e.target.value })} placeholder="Zatvoreno" />
            </div>
          </div>

          <Separator />
          <p className="text-sm font-medium text-foreground">Društvene mreže</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Facebook URL</Label>
              <Input value={form.social_facebook} onChange={(e) => setForm({ ...form, social_facebook: e.target.value })} placeholder="https://facebook.com/..." />
            </div>
            <div className="space-y-2">
              <Label>Instagram URL</Label>
              <Input value={form.social_instagram} onChange={(e) => setForm({ ...form, social_instagram: e.target.value })} placeholder="https://instagram.com/..." />
            </div>
          </div>

          <Button onClick={saveClinicSettings} disabled={savingClinic} className="gap-2">
            {savingClinic ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Sačuvaj promjene
          </Button>
        </CardContent>
      </Card>

      {/* Email Sender Configuration — SKRIVENO za sada */}
      {false && (
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
      )}

      {/* Notifikacije — SKRIVENO za sada */}
      {false && (
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
      )}
    </div>
  );
};

export default AdminSettings;
