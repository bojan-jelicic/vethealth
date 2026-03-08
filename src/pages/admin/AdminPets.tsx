import { PawPrint, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const placeholderPets = [
  { id: '1', name: 'Rex', species: 'Pas', breed: 'Njemački Ovčar', owner: 'Marija Petrović', status: 'Aktivan' },
  { id: '2', name: 'Mia', species: 'Mačka', breed: 'Persijska', owner: 'Nikola Jović', status: 'Aktivan' },
  { id: '3', name: 'Bubi', species: 'Zec', breed: 'Patuljasti', owner: 'Ana Kovačević', status: 'Aktivan' },
];

const AdminPets = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Ljubimci</h1>
        <p className="text-sm text-muted-foreground">Evidencija svih ljubimaca</p>
      </div>
      <Button><PawPrint className="w-4 h-4 mr-2" />Novi ljubimac</Button>
    </div>

    <div className="bg-card rounded-lg border border-border">
      <div className="p-4 border-b border-border">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pretraži ljubimce..." className="pl-9" />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ime</TableHead>
            <TableHead>Vrsta</TableHead>
            <TableHead>Pasmina</TableHead>
            <TableHead>Vlasnik</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {placeholderPets.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell>{p.species}</TableCell>
              <TableCell className="text-muted-foreground">{p.breed}</TableCell>
              <TableCell className="text-muted-foreground">{p.owner}</TableCell>
              <TableCell><Badge variant="secondary">{p.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

export default AdminPets;
