import { ClipboardList, Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useSearchParams } from 'react-router-dom';

const placeholderVisits = [
  { id: '1', date: '2026-03-08', pet: 'Rex', owner: 'Marija Petrović', vet: 'Dr. Marko Petrović', reason: 'Redovni pregled', status: 'Zakazana' },
  { id: '2', date: '2026-03-07', pet: 'Mia', owner: 'Nikola Jović', vet: 'Dr. Ana Jović', reason: 'Vakcinacija', status: 'Završena' },
  { id: '3', date: '2026-03-06', pet: 'Bubi', owner: 'Ana Kovačević', vet: 'Dr. Marko Petrović', reason: 'Hitna pomoć', status: 'Završena' },
];

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Zakazana: 'default',
  Završena: 'secondary',
  Otkazana: 'destructive',
};

const AdminVisits = () => {
  const [searchParams] = useSearchParams();
  const isNew = searchParams.get('action') === 'new';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Posjete</h1>
          <p className="text-sm text-muted-foreground">Pregled i upravljanje posjetama</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />Nova posjeta</Button>
      </div>

      <div className="bg-card rounded-lg border border-border">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Pretraži posjete..." className="pl-9" />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum</TableHead>
              <TableHead>Ljubimac</TableHead>
              <TableHead>Vlasnik</TableHead>
              <TableHead>Veterinar</TableHead>
              <TableHead>Razlog</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {placeholderVisits.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-medium">{v.date}</TableCell>
                <TableCell>{v.pet}</TableCell>
                <TableCell className="text-muted-foreground">{v.owner}</TableCell>
                <TableCell className="text-muted-foreground">{v.vet}</TableCell>
                <TableCell>{v.reason}</TableCell>
                <TableCell><Badge variant={statusVariant[v.status] || 'outline'}>{v.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminVisits;
