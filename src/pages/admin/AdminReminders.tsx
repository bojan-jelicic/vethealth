import { Bell, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const placeholderReminders = [
  { id: '1', date: '2026-03-10', pet: 'Rex', owner: 'Marija Petrović', type: 'Vakcinacija', sent: false },
  { id: '2', date: '2026-03-12', pet: 'Mia', owner: 'Nikola Jović', type: 'Redovni pregled', sent: false },
  { id: '3', date: '2026-03-05', pet: 'Bubi', owner: 'Ana Kovačević', type: 'Terapija', sent: true },
];

const AdminReminders = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Podsjetnici</h1>
        <p className="text-sm text-muted-foreground">Automatski i ručni podsjetnici za klijente</p>
      </div>
      <Button><Plus className="w-4 h-4 mr-2" />Novi podsjetnik</Button>
    </div>

    <div className="bg-card rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Datum</TableHead>
            <TableHead>Ljubimac</TableHead>
            <TableHead>Vlasnik</TableHead>
            <TableHead>Tip</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {placeholderReminders.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.date}</TableCell>
              <TableCell>{r.pet}</TableCell>
              <TableCell className="text-muted-foreground">{r.owner}</TableCell>
              <TableCell>{r.type}</TableCell>
              <TableCell>
                <Badge variant={r.sent ? 'secondary' : 'outline'}>
                  {r.sent ? 'Poslan' : 'Čeka slanje'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

export default AdminReminders;
