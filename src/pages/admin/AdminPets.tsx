import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PawPrint, Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { petService } from '@/services/petService';
import { clientService } from '@/services/clientService';

const AdminPets = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [speciesFilter, setSpeciesFilter] = useState(searchParams.get('species') || '');
  const [ownerFilter, setOwnerFilter] = useState(searchParams.get('owner') || '');
  const [microchipFilter, setMicrochipFilter] = useState(searchParams.get('chip') || '');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch all pets
  const { data: allPets = [], isLoading } = useQuery({
    queryKey: ['pets', debouncedSearch],
    queryFn: () => petService.list({ search: debouncedSearch || undefined }),
  });

  // Fetch owners for filter dropdown
  const { data: clients = [] } = useQuery({
    queryKey: ['clients-dropdown'],
    queryFn: () => clientService.list(),
  });

  // Client-side filters
  const filteredPets = allPets.filter((pet) => {
    if (speciesFilter && pet.species !== speciesFilter) return false;
    if (ownerFilter && pet.owner_id !== ownerFilter) return false;
    if (microchipFilter && (!pet.microchip_id || !pet.microchip_id.toLowerCase().includes(microchipFilter.toLowerCase()))) return false;
    return true;
  });

  // Unique species for filter
  const speciesList = [...new Set(allPets.map((p) => p.species))].sort();

  const hasFilters = speciesFilter || ownerFilter || microchipFilter;

  const clearFilters = () => {
    setSpeciesFilter('');
    setOwnerFilter('');
    setMicrochipFilter('');
    setSearchParams({});
  };

  const updateSearch = (val: string) => {
    setSearch(val);
    const params: Record<string, string> = {};
    if (val) params.q = val;
    if (speciesFilter) params.species = speciesFilter;
    if (ownerFilter) params.owner = ownerFilter;
    setSearchParams(params);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Ljubimci</h1>
          <p className="text-sm text-muted-foreground">
            Evidencija svih ljubimaca · {filteredPets.length} rezultata
          </p>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-card rounded-lg border border-border">
        {/* Search + Filters */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži po imenu ili mikročipu..."
                value={search}
                onChange={(e) => updateSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
                <SelectTrigger className="w-[140px] h-9">
                  <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="Vrsta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Sve vrste</SelectItem>
                  {speciesList.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="Vlasnik" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi vlasnici</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative">
                <Input
                  placeholder="Mikročip..."
                  value={microchipFilter}
                  onChange={(e) => setMicrochipFilter(e.target.value)}
                  className="h-9 w-[150px] text-sm"
                />
              </div>

              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 h-9 text-muted-foreground">
                  <X className="h-3.5 w-3.5" />
                  Očisti
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ime</TableHead>
              <TableHead>Vrsta</TableHead>
              <TableHead>Rasa</TableHead>
              <TableHead>Vlasnik</TableHead>
              <TableHead>Mikročip</TableHead>
              <TableHead>Spol</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredPets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <PawPrint className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  {debouncedSearch || hasFilters ? 'Nema rezultata za zadane filtere.' : 'Nema ljubimaca u evidenciji.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredPets.map((pet) => (
                <TableRow
                  key={pet.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/app/pets/${pet.id}`)}
                >
                  <TableCell className="font-medium">{pet.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{pet.species}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{pet.breed || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{(pet.owner as any)?.name || '—'}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{pet.microchip_id || '—'}</TableCell>
                  <TableCell>{pet.sex === 'M' ? 'Mužjak' : pet.sex === 'F' ? 'Ženka' : '—'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminPets;
