import { Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

const AdminSettings = () => (
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

    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Notifikacije</CardTitle>
        <CardDescription>Upravljanje email i SMS obavještenjima</CardDescription>
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

export default AdminSettings;
