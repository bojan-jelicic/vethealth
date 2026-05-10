import { useMemo, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CATEGORY_ICONS, getCategoryIcon } from '@/lib/categoryIcons';
import { ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconPickerProps {
  value: string;
  onChange: (name: string) => void;
  id?: string;
}

export function IconPicker({ value, onChange, id }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const Selected = getCategoryIcon(value);
  const selectedEntry = CATEGORY_ICONS.find((i) => i.name === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATEGORY_ICONS;
    return CATEGORY_ICONS.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.label.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className="w-full justify-between font-normal"
        >
          <span className="flex items-center gap-2 min-w-0">
            <Selected className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">
              {selectedEntry?.label || (value ? value : 'Odaberi ikonu')}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-3" align="start">
        <div className="relative mb-3">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pretraži ikone..."
            className="pl-8 h-9"
            autoFocus
          />
        </div>
        <div className="grid grid-cols-6 gap-1 max-h-64 overflow-y-auto">
          {filtered.map(({ name, label, Icon }) => {
            const isActive = name === value;
            return (
              <button
                key={name}
                type="button"
                title={label}
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                }}
                className={cn(
                  'flex items-center justify-center h-10 w-10 rounded-md border border-transparent hover:bg-accent hover:text-accent-foreground transition-colors',
                  isActive && 'border-primary bg-primary/10 text-primary',
                )}
              >
                <Icon className="h-5 w-5" />
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-6 text-center text-sm text-muted-foreground py-6">
              Nema rezultata
            </div>
          )}
        </div>
        {value && (
          <div className="mt-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
            >
              <X className="h-4 w-4 mr-2" /> Ukloni ikonu
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}