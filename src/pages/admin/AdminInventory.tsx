import { Package, Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const placeholderItems = [
  { id: '1', name: 'Vakcina - Nobivac', qty: 24, unit: 'doza', minQty: 10, status: 'ok' },
  { id: '2', name: 'Amoksicilin 250mg', qty: 8, unit: 'kutija', minQty: 10, status: 'low' },
  { id: '3', name: 'Hirurški konac', qty: 45, unit: 'kom', minQty: 20, status: 'ok' },
  { id: '4', name: 'Šampon antiparazitski', qty: 3, unit: 'boca', minQty: 5, status: 'low' },
];

const AdminInventory = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Lager</h1>
        <p className="text-sm text-muted-foreground">Upravljanje zalihama i materijalima</p>
      </div>
      <Button><Plus className="w-4 h-4 mr-2" />Novi artikal</Button>
    </div>

    <div className="bg-card rounded-lg border border-border">
      <div className="p-4 border-b border-border">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pretraži lager..." className="pl-9" />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Naziv</TableHead>
            <TableHead className="text-right">Količina</TableHead>
            <TableHead>Jedinica</TableHead>
            <TableHead className="text-right">Min. količina</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {placeholderItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="text-right">{item.qty}</TableCell>
              <TableCell className="text-muted-foreground">{item.unit}</TableCell>
              <TableCell className="text-right text-muted-foreground">{item.minQty}</TableCell>
              <TableCell>
                <Badge variant={item.status === 'ok' ? 'secondary' : 'destructive'}>
                  {item.status === 'ok' ? 'Na stanju' : 'Niska zaliha'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

export default AdminInventory;
