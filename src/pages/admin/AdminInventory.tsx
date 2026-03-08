import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Package, Search, Plus, Pencil, Trash2, ArrowDownCircle, ArrowUpCircle,
  RefreshCw, History, AlertTriangle, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// ─── Types ──────────────────────────────────────
interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  current_quantity: number;
  low_stock_threshold: number;
  purchase_price: number | null;
  sell_price: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface StockMovement {
  id: string;
  item_id: string;
  type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  note: string | null;
  linked_visit_id: string | null;
  created_at: string;
}

interface ItemForm {
  name: string;
  unit: string;
  low_stock_threshold: string;
  purchase_price: string;
  sell_price: string;
  is_active: boolean;
}

const emptyForm: ItemForm = {
  name: '', unit: 'kom', low_stock_threshold: '5',
  purchase_price: '', sell_price: '', is_active: true,
};

const TABLE_ITEMS = 'inventory_items' as any;
const TABLE_MOVES = 'stock_movements' as any;

const typeLabels: Record<string, string> = { IN: 'Ulaz', OUT: 'Izlaz', ADJUST: 'Korekcija' };
const typeColors: Record<string, string> = {
  IN: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  OUT: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  ADJUST: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

const AdminInventory = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState<ItemForm>(emptyForm);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [moveItem, setMoveItem] = useState<InventoryItem | null>(null);
  const [moveType, setMoveType] = useState<'IN' | 'OUT' | 'ADJUST'>('IN');
  const [moveQty, setMoveQty] = useState('');
  const [moveNote, setMoveNote] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  // ─── Queries ────────────────────────────────
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['inventory-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLE_ITEMS).select('*').order('name');
      if (error) throw error;
      return (data ?? []) as unknown as InventoryItem[];
    },
  });

  const { data: movements = [] } = useQuery({
    queryKey: ['stock-movements', historyItem?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLE_MOVES).select('*')
        .eq('item_id', historyItem!.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as unknown as StockMovement[];
    },
    enabled: !!historyItem?.id,
  });

  // ─── Mutations ──────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        unit: form.unit,
        low_stock_threshold: parseFloat(form.low_stock_threshold) || 5,
        purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : null,
        sell_price: form.sell_price ? parseFloat(form.sell_price) : null,
        is_active: form.is_active,
      };
      if (editingItem) {
        const { error } = await supabase.from(TABLE_ITEMS).update(payload).eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(TABLE_ITEMS).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory-items'] });
      toast({ title: editingItem ? 'Artikal ažuriran' : 'Artikal kreiran' });
      closeItemDialog();
    },
    onError: () => toast({ title: 'Greška', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(TABLE_ITEMS).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory-items'] });
      toast({ title: 'Artikal obrisan' });
      setDeleteConfirm(null);
    },
  });

  const stockMoveMutation = useMutation({
    mutationFn: async () => {
      if (!moveItem) return;
      const qty = parseFloat(moveQty) || 0;
      if (qty <= 0 && moveType !== 'ADJUST') throw new Error('Invalid qty');

      // Insert movement
      const { error: moveErr } = await supabase.from(TABLE_MOVES).insert({
        item_id: moveItem.id,
        type: moveType,
        quantity: qty,
        note: moveNote || null,
      });
      if (moveErr) throw moveErr;

      // Update current_quantity
      let newQty = moveItem.current_quantity;
      if (moveType === 'IN') newQty += qty;
      else if (moveType === 'OUT') newQty = Math.max(0, newQty - qty);
      else newQty = qty; // ADJUST sets absolute

      const { error: updErr } = await supabase.from(TABLE_ITEMS)
        .update({ current_quantity: newQty }).eq('id', moveItem.id);
      if (updErr) throw updErr;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory-items'] });
      qc.invalidateQueries({ queryKey: ['stock-movements', moveItem?.id] });
      toast({ title: moveType === 'IN' ? 'Zaliha dodana' : moveType === 'OUT' ? 'Zaliha izdana' : 'Korekcija izvršena' });
      closeMoveDialog();
    },
    onError: () => toast({ title: 'Greška pri promjeni zalihe', variant: 'destructive' }),
  });

  // ─── Helpers ────────────────────────────────
  const openCreateDialog = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setItemDialogOpen(true);
  };

  const openEditDialog = (item: InventoryItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      unit: item.unit,
      low_stock_threshold: String(item.low_stock_threshold),
      purchase_price: item.purchase_price != null ? String(item.purchase_price) : '',
      sell_price: item.sell_price != null ? String(item.sell_price) : '',
      is_active: item.is_active,
    });
    setItemDialogOpen(true);
  };

  const closeItemDialog = () => {
    setItemDialogOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
  };

  const openMoveDialog = (item: InventoryItem, type: 'IN' | 'OUT' | 'ADJUST') => {
    setMoveItem(item);
    setMoveType(type);
    setMoveQty(type === 'ADJUST' ? String(item.current_quantity) : '');
    setMoveNote('');
    setMoveDialogOpen(true);
  };

  const closeMoveDialog = () => {
    setMoveDialogOpen(false);
    setMoveItem(null);
    setMoveQty('');
    setMoveNote('');
  };

  const openHistory = (item: InventoryItem) => {
    setHistoryItem(item);
    setHistoryOpen(true);
  };

  // ─── Filtering ──────────────────────────────
  const filteredItems = items.filter((item) => {
    if (!showInactive && !item.is_active) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const lowStockCount = items.filter((i) => i.is_active && i.current_quantity <= i.low_stock_threshold).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Lager</h1>
          <p className="text-sm text-muted-foreground">Upravljanje zalihama i materijalima</p>
        </div>
        <Button className="gap-1.5" onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />Novi artikal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Ukupno artikala</p>
          <p className="text-2xl font-bold">{items.filter((i) => i.is_active).length}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Niska zaliha</p>
          <p className="text-2xl font-bold flex items-center gap-2">
            {lowStockCount}
            {lowStockCount > 0 && <AlertTriangle className="h-5 w-5 text-destructive" />}
          </p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Ukupna vrijednost (nabavna)</p>
          <p className="text-2xl font-bold">
            {items.filter((i) => i.is_active && i.purchase_price != null)
              .reduce((s, i) => s + (i.current_quantity * (i.purchase_price || 0)), 0).toFixed(2)} KM
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Pretraži artikle..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <Switch checked={showInactive} onCheckedChange={setShowInactive} />
            Prikaži neaktivne
          </label>
        </div>

        {/* Table */}
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>{isLoading ? 'Učitavanje...' : 'Nema artikala.'}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naziv</TableHead>
                <TableHead className="text-right w-24">Količina</TableHead>
                <TableHead className="w-20">Jedinica</TableHead>
                <TableHead className="text-right w-24">Min.</TableHead>
                <TableHead className="text-right w-28">Nabavna</TableHead>
                <TableHead className="text-right w-28">Prodajna</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-44"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => {
                const isLow = item.current_quantity <= item.low_stock_threshold;
                return (
                  <TableRow key={item.id} className={!item.is_active ? 'opacity-50' : ''}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className={`text-right font-medium ${isLow ? 'text-destructive' : ''}`}>
                      {Number(item.current_quantity)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{Number(item.low_stock_threshold)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {item.purchase_price != null ? `${Number(item.purchase_price).toFixed(2)}` : '—'}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {item.sell_price != null ? `${Number(item.sell_price).toFixed(2)}` : '—'}
                    </TableCell>
                    <TableCell>
                      {!item.is_active ? (
                        <Badge variant="outline">Neaktivan</Badge>
                      ) : isLow ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />Nisko
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Na stanju</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Ulaz"
                          onClick={() => openMoveDialog(item, 'IN')}>
                          <ArrowDownCircle className="h-3.5 w-3.5 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Izlaz"
                          onClick={() => openMoveDialog(item, 'OUT')}>
                          <ArrowUpCircle className="h-3.5 w-3.5 text-red-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Korekcija"
                          onClick={() => openMoveDialog(item, 'ADJUST')}>
                          <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Historija"
                          onClick={() => openHistory(item)}>
                          <History className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Uredi"
                          onClick={() => openEditDialog(item)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" title="Obriši"
                          onClick={() => setDeleteConfirm(item.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* ─── Create/Edit Item Dialog ─────────── */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Uredi artikal' : 'Novi artikal'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Naziv *</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required placeholder="npr. Amoksicilin 250mg" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Jedinica mjere</Label>
                <Select value={form.unit} onValueChange={(v) => setForm((p) => ({ ...p, unit: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kom">kom</SelectItem>
                    <SelectItem value="kutija">kutija</SelectItem>
                    <SelectItem value="boca">boca</SelectItem>
                    <SelectItem value="doza">doza</SelectItem>
                    <SelectItem value="ml">ml</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="par">par</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Min. količina (upozorenje)</Label>
                <Input type="number" step="1" min="0" value={form.low_stock_threshold} onChange={(e) => setForm((p) => ({ ...p, low_stock_threshold: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Nabavna cijena (KM)</Label>
                <Input type="number" step="0.01" min="0" value={form.purchase_price} onChange={(e) => setForm((p) => ({ ...p, purchase_price: e.target.value }))} placeholder="Opcionalno" />
              </div>
              <div className="space-y-2">
                <Label>Prodajna cijena (KM)</Label>
                <Input type="number" step="0.01" min="0" value={form.sell_price} onChange={(e) => setForm((p) => ({ ...p, sell_price: e.target.value }))} placeholder="Opcionalno" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm((p) => ({ ...p, is_active: v }))} id="active" />
              <Label htmlFor="active">Aktivan</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeItemDialog}>Otkaži</Button>
              <Button type="submit" disabled={saveMutation.isPending || !form.name.trim()}>
                {saveMutation.isPending ? 'Čuvanje...' : editingItem ? 'Sačuvaj' : 'Kreiraj'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Stock Movement Dialog ───────────── */}
      <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {moveType === 'IN' && <ArrowDownCircle className="h-5 w-5 text-green-600" />}
              {moveType === 'OUT' && <ArrowUpCircle className="h-5 w-5 text-red-600" />}
              {moveType === 'ADJUST' && <RefreshCw className="h-5 w-5 text-blue-600" />}
              {typeLabels[moveType]} — {moveItem?.name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); stockMoveMutation.mutate(); }} className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-3 text-sm">
              <span className="text-muted-foreground">Trenutna količina: </span>
              <span className="font-semibold">{moveItem ? Number(moveItem.current_quantity) : 0} {moveItem?.unit}</span>
            </div>
            <div className="space-y-2">
              <Label>
                {moveType === 'ADJUST' ? 'Nova količina' : 'Količina'}
              </Label>
              <Input
                type="number" step="0.01" min="0"
                value={moveQty}
                onChange={(e) => setMoveQty(e.target.value)}
                placeholder={moveType === 'ADJUST' ? 'Unesite tačnu količinu' : 'Unesite količinu'}
                required
                autoFocus
              />
              {moveType !== 'ADJUST' && moveItem && moveQty && (
                <p className="text-xs text-muted-foreground">
                  Nova količina: <span className="font-medium">
                    {moveType === 'IN'
                      ? Number(moveItem.current_quantity) + (parseFloat(moveQty) || 0)
                      : Math.max(0, Number(moveItem.current_quantity) - (parseFloat(moveQty) || 0))
                    } {moveItem.unit}
                  </span>
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Napomena <span className="text-muted-foreground font-normal">(opcionalno)</span></Label>
              <Textarea
                value={moveNote}
                onChange={(e) => setMoveNote(e.target.value)}
                placeholder="npr. Narudžba #123, potrošeno na posjeti..."
                rows={2}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeMoveDialog}>Otkaži</Button>
              <Button
                type="submit"
                disabled={stockMoveMutation.isPending || !moveQty || (parseFloat(moveQty) || 0) <= 0 && moveType !== 'ADJUST'}
              >
                {stockMoveMutation.isPending ? 'Obrada...' : 'Potvrdi'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Movement History Dialog ─────────── */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historija — {historyItem?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="bg-muted/30 rounded-lg p-3 text-sm mb-4">
            <span className="text-muted-foreground">Trenutna količina: </span>
            <span className="font-semibold">{historyItem ? Number(historyItem.current_quantity) : 0} {historyItem?.unit}</span>
          </div>
          {movements.length === 0 ? (
            <p className="text-center py-8 text-sm text-muted-foreground">Nema zabilježenih promjena.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead className="text-right">Količina</TableHead>
                  <TableHead>Napomena</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {format(new Date(m.created_at), 'dd.MM.yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[m.type]}`}>
                        {typeLabels[m.type]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {m.type === 'IN' ? '+' : m.type === 'OUT' ? '-' : '='}{Number(m.quantity)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                      {m.note || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirm ──────────────────── */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati artikal?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova akcija će obrisati artikal i svu povezanu historiju promjena. Ovo se ne može poništiti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Otkaži</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}>
              Obriši
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminInventory;
