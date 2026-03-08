import { FileText, Search, FilePlus, Layout } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const placeholderDocs = [
  { id: '1', date: '2026-03-08', type: 'Nalaz', pet: 'Rex', vet: 'Dr. Marko Petrović', status: 'Završen' },
  { id: '2', date: '2026-03-07', type: 'Recept', pet: 'Mia', vet: 'Dr. Ana Jović', status: 'Završen' },
  { id: '3', date: '2026-03-06', type: 'Nalaz', pet: 'Bubi', vet: 'Dr. Marko Petrović', status: 'U pripremi' },
];

const AdminDocuments = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Dokumenti</h1>
        <p className="text-sm text-muted-foreground">Nalazi, recepti i ostala dokumentacija</p>
      </div>
      <Button><FilePlus className="w-4 h-4 mr-2" />Novi nalaz</Button>
    </div>

    <div className="bg-card rounded-lg border border-border">
      <div className="p-4 border-b border-border">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pretraži dokumente..." className="pl-9" />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Datum</TableHead>
            <TableHead>Tip</TableHead>
            <TableHead>Ljubimac</TableHead>
            <TableHead>Veterinar</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {placeholderDocs.map((d) => (
            <TableRow key={d.id}>
              <TableCell className="font-medium">{d.date}</TableCell>
              <TableCell>{d.type}</TableCell>
              <TableCell>{d.pet}</TableCell>
              <TableCell className="text-muted-foreground">{d.vet}</TableCell>
              <TableCell><Badge variant={d.status === 'Završen' ? 'secondary' : 'outline'}>{d.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

export default AdminDocuments;
