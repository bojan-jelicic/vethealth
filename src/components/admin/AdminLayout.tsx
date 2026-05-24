import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Users,
  PawPrint,
  ClipboardList,
  FileText,
  DollarSign,
  Package,
  Bell,
  BookOpen,
  Image,
  Settings,
  ScrollText,
  LogOut,
  User,
  Shield,
  Stethoscope,
  ChevronDown,
  Menu,
  Search,
  Plus,
  FilePlus,
  X,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FEATURES } from '@/config/features';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AdminLayoutProps {
  children: React.ReactNode;
}

type NavItem = {
  to: string;
  icon: any;
  label: string;
  end?: boolean;
  adminOnly?: boolean;
  flag?: keyof typeof FEATURES;
};

const allNavSections: { label: string; items: NavItem[] }[] = [
  {
    label: 'Glavno',
    items: [
      { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
      { to: '/app/clients', icon: Users, label: 'Klijenti', flag: 'adminCRM' },
      { to: '/app/pets', icon: PawPrint, label: 'Ljubimci', flag: 'adminCRM' },
      { to: '/app/visits', icon: ClipboardList, label: 'Posjete', flag: 'adminCRM' },
      { to: '/app/documents', icon: FileText, label: 'Dokumenti', flag: 'adminCRM' },
    ],
  },
  {
    label: 'Upravljanje',
    items: [
      { to: '/app/pricing', icon: Stethoscope, label: 'Usluge' },
      { to: '/app/inventory', icon: Package, label: 'Lager', flag: 'adminInventory' },
      { to: '/app/reminders', icon: Bell, label: 'Podsjetnici', flag: 'adminReminders' },
    ],
  },
  {
    label: 'Sadržaj',
    items: [
      { to: '/app/blog', icon: BookOpen, label: 'Blog' },
      { to: '/app/gallery', icon: Image, label: 'Galerija', flag: 'adminGallery' },
      { to: '/app/messages', icon: Mail, label: 'Poruke', flag: 'adminMessagesPage' },
    ],
  },
  {
    label: 'Sistem',
    items: [
      { to: '/app/settings', icon: Settings, label: 'Postavke', adminOnly: true },
      { to: '/app/audit-logs', icon: ScrollText, label: 'Audit zapisi', adminOnly: true },
    ],
  },
];

const navSections = allNavSections
  .map((s) => ({ ...s, items: s.items.filter((i) => !i.flag || FEATURES[i.flag]) }))
  .filter((s) => s.items.length > 0);

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { signOut, user, role, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/app/login');
  };

  const roleLabel = role === 'admin' ? 'Administrator' : role === 'vet' ? 'Veterinar' : 'Korisnik';
  const RoleIcon = role === 'admin' ? Shield : Stethoscope;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to clients with search query
      navigate(`/app/clients?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transform transition-transform duration-200',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-border flex-shrink-0">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <PawPrint className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-heading font-bold text-base leading-tight">VetHealth</h1>
            <p className="text-[11px] text-muted-foreground leading-tight">Veterinarski Sistem</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
          {navSections.map((section) => {
            const visibleItems = section.items.filter(
              (item) => !('adminOnly' in item && item.adminOnly) || isAdmin
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.label}>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1.5">
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {visibleItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={'end' in item ? item.end : false}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground font-medium'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive h-9 px-3"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Odjavi se</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 border-b border-border bg-card flex items-center gap-3 px-4 lg:px-6 flex-shrink-0">
          {/* Mobile menu trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Global Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={FEATURES.adminCRM ? 'Pretraži klijente, ljubimce...' : 'Pretraži...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-muted/50 border-transparent focus:border-border focus:bg-background"
              />
            </div>
          </form>

          {/* Quick Actions */}
          {FEATURES.adminQuickActions && (
          <div className="hidden sm:flex items-center gap-2 ml-auto">
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 h-9"
              onClick={() => navigate('/app/visits?action=new')}
            >
              <Plus className="h-3.5 w-3.5" />
              Nova posjeta
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 h-9"
              onClick={() => navigate('/app/documents?action=new')}
            >
              <FilePlus className="h-3.5 w-3.5" />
              Novi nalaz
            </Button>
          </div>
          )}

          {/* Mobile quick actions */}
          {FEATURES.adminQuickActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="sm:hidden">
              <Button variant="default" size="icon" className="h-9 w-9">
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate('/app/visits?action=new')} className="cursor-pointer">
                <ClipboardList className="w-4 h-4 mr-2" />
                Nova posjeta
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/app/documents?action=new')} className="cursor-pointer">
                <FilePlus className="w-4 h-4 mr-2" />
                Novi nalaz
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          )}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={cn("gap-2 h-9 px-2", !FEATURES.adminQuickActions && "ml-auto")}>
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-1">
                  <span className="text-sm truncate">{user?.email}</span>
                  <span className="text-xs text-muted-foreground font-normal flex items-center gap-1">
                    <RoleIcon className="w-3 h-3" />
                    {roleLabel}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate('/app/settings')}
                className="cursor-pointer"
              >
                <Settings className="w-4 h-4 mr-2" />
                Postavke
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-destructive cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Odjavi se
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
