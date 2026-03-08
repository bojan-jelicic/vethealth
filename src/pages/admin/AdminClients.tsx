import { Users, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSearchParams } from 'react-router-dom';

const placeholderClients = [
  { id: '1', name: 'Marija Petrović', email: 'marija@email.com', phone: '+387 65 111 222', pets: 2 },
  { id: '2', name: 'Nikola Jović', email: 'nikola@email.com', phone: '+387 66 333 444', pets: 1 },
  { id: '3', name: 'Ana Kovačević', email: 'ana@email.com', phone: '+387 65 555 666', pets: 3 },
];

const AdminClients = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Klijenti</h1>
          <p className="text-sm text-muted-foreground">Upravljajte vlasnicima ljubimaca</p>
        </div>
        <Button><Users className="w-4 h-4 mr-2" />Novi klijent</Button>
      </div>

      <div className="bg-card rounded-lg border border-border">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Pretraži klijente..." defaultValue={query} className="pl-9" />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ime i prezime</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead className="text-center">Ljubimci</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {placeholderClients.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.email}</TableCell>
                <TableCell className="text-muted-foreground">{c.phone}</TableCell>
                <TableCell className="text-center">{c.pets}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminClients;
