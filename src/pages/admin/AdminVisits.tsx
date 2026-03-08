import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ClipboardList, Search, Filter, X, CalendarIcon, Plus, Download, Loader2,
} from 'lucide-react';
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
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { visitService } from '@/services/visitService';
import { exportVisitsCsv } from '@/services/exportService';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};
const statusLabels: Record<string, string> = {
  scheduled: 'Zakazana',
  in_progress: 'U toku',
  completed: 'Završena',
  cancelled: 'Otkazana',
};

const AdminVisits = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [exportingCsv, setExportingCsv] = useState(false);

  const { data: allVisits = [], isLoading } = useQuery({
    queryKey: ['visits', statusFilter],
    queryFn: () => visitService.list(statusFilter && statusFilter !== 'all' ? { status: statusFilter } : undefined),
  });

  // Client-side date range filter
  const visits = allVisits.filter((v) => {
    const d = new Date(v.date_time);
    if (dateFrom && d < dateFrom) return false;
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      if (d > end) return false;
    }
    return true;
  });

  const hasFilters = statusFilter || dateFrom || dateTo;

  const clearFilters = () => {
    setStatusFilter('');
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const dateLabel = () => {
    if (dateFrom && dateTo) return `${format(dateFrom, 'dd.MM')} — ${format(dateTo, 'dd.MM.yyyy')}`;
    if (dateFrom) return `Od ${format(dateFrom, 'dd.MM.yyyy')}`;
    if (dateTo) return `Do ${format(dateTo, 'dd.MM.yyyy')}`;
    return 'Datum';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Posjete</h1>
          <p className="text-sm text-muted-foreground">
            Pregled i upravljanje posjetama · {visits.length} rezultata
          </p>
        </div>
        <Button className="gap-2" onClick={() => navigate('/app/visits/new')}>
          <Plus className="w-4 h-4" />
          Nova posjeta
        </Button>
      </div>

      {/* Table Card */}
      <div className="bg-card rounded-lg border border-border">
        {/* Filters */}
        <div className="p-4 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Status filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] h-9">
                <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                <SelectItem value="scheduled">Zakazana</SelectItem>
                <SelectItem value="in_progress">U toku</SelectItem>
                <SelectItem value="completed">Završena</SelectItem>
                <SelectItem value="cancelled">Otkazana</SelectItem>
              </SelectContent>
            </Select>

            {/* Date range */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn(
                  'h-9 gap-1.5 font-normal',
                  (dateFrom || dateTo) && 'text-foreground'
                )}>
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {dateLabel()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Od datuma</p>
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      className={cn("p-0 pointer-events-auto")}
                    />
                  </div>
                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Do datuma</p>
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      className={cn("p-0 pointer-events-auto")}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 h-9 text-muted-foreground">
                <X className="h-3.5 w-3.5" />Očisti
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum</TableHead>
              <TableHead>Ljubimac</TableHead>
              <TableHead>Vlasnik</TableHead>
              <TableHead>Razlog</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : visits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  {hasFilters ? 'Nema rezultata za zadane filtere.' : 'Nema posjeta u evidenciji.'}
                </TableCell>
              </TableRow>
            ) : (
              visits.map((visit) => (
                <TableRow
                  key={visit.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/app/visits/${visit.id}`)}
                >
                  <TableCell className="font-medium whitespace-nowrap">
                    {format(new Date(visit.date_time), 'dd.MM.yyyy HH:mm')}
                  </TableCell>
                  <TableCell>{(visit.pet as any)?.name || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{(visit.owner as any)?.name || '—'}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">{visit.reason || '—'}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[visit.status] || ''}`}>
                      {statusLabels[visit.status] || visit.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminVisits;
