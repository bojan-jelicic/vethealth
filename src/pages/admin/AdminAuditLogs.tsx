import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Loader2, Trash2, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ENTITY_TYPES = [
  'all', 'auth', 'clinic_settings', 'veterinarian', 'visit', 'pet', 'client',
  'visit_document', 'document_template', 'attachment', 'audit_logs',
];

const AdminAuditLogs = () => {
  const queryClient = useQueryClient();
  const [entityType, setEntityType] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [retentionDays, setRetentionDays] = useState<number>(365);
  const [purging, setPurging] = useState(false);

  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs', entityType],
    queryFn: async () => {
      let q = supabase
        .from('audit_logs')
        .select('id, actor_user_id, action, entity_type, entity_id, metadata, created_at')
        .order('created_at', { ascending: false })
        .limit(500);
      if (entityType !== 'all') q = q.eq('entity_type', entityType);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = (logs ?? []).filter((l: any) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      l.action?.toLowerCase().includes(s) ||
      l.entity_type?.toLowerCase().includes(s) ||
      l.entity_id?.toLowerCase().includes(s) ||
      JSON.stringify(l.metadata ?? {}).toLowerCase().includes(s)
    );
  });

  const purge = useMutation({
    mutationFn: async () => {
      const { data, error } = await (supabase as any).rpc('purge_audit_logs', { _older_than_days: retentionDays });
      if (error) throw error;
      return data as number;
    },
    onMutate: () => setPurging(true),
    onSettled: () => setPurging(false),
    onSuccess: (deleted) => {
      toast({ title: 'Zapisi obrisani', description: `Uklonjeno ${deleted} zapisa starijih od ${retentionDays} dana.` });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
    onError: (err: any) => {
      toast({ title: 'Greška pri brisanju', description: err.message, variant: 'destructive' });
    },
  });

  const fmtDate = (s: string) => new Date(s).toLocaleString('sr-Latn-BA');

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Audit zapisi
          </h1>
          <p className="text-sm text-muted-foreground">
            Pregled osjetljivih akcija u sistemu (prijave, izmjene postavki, pristup veterinarima, izmjene kartona).
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filteri</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Tip entiteta</Label>
            <Select value={entityType} onValueChange={setEntityType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ENTITY_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t === 'all' ? 'Svi' : t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs">Pretraga (akcija, ID, metapodaci)</Label>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="npr. update, login, ime..." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Učitavanje...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">Nema zapisa za prikazane filtere.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[170px]">Vrijeme</TableHead>
                  <TableHead>Akcija</TableHead>
                  <TableHead>Entitet</TableHead>
                  <TableHead>ID entiteta</TableHead>
                  <TableHead>Korisnik</TableHead>
                  <TableHead>Metapodaci</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((l: any) => (
                  <TableRow key={l.id}>
                    <TableCell className="text-xs whitespace-nowrap">{fmtDate(l.created_at)}</TableCell>
                    <TableCell><Badge variant="outline">{l.action}</Badge></TableCell>
                    <TableCell className="text-sm">{l.entity_type}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{l.entity_id?.slice(0, 8) ?? '-'}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{l.actor_user_id?.slice(0, 8) ?? '-'}</TableCell>
                    <TableCell className="text-xs max-w-md truncate" title={JSON.stringify(l.metadata)}>
                      {l.metadata && Object.keys(l.metadata).length > 0 ? JSON.stringify(l.metadata) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Čuvanje zapisa</CardTitle>
          <CardDescription>
            Zapisi se čuvaju neograničeno. Možete obrisati zapise starije od zadanog broja dana (minimum 30).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-end gap-3 flex-wrap">
          <div className="space-y-1.5">
            <Label className="text-xs">Obriši zapise starije od (dana)</Label>
            <Input
              type="number"
              min={30}
              value={retentionDays}
              onChange={(e) => setRetentionDays(Math.max(30, Number(e.target.value) || 30))}
              className="w-32"
            />
          </div>
          <Button
            variant="destructive"
            onClick={() => purge.mutate()}
            disabled={purging}
            className="gap-2"
          >
            {purging ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Obriši stare zapise
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuditLogs;