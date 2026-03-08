import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Calendar,
  Stethoscope,
  Users,
  Mail,
  LogOut,
  PawPrint,
  LayoutDashboard,
  FolderOpen,
  User,
  Shield,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/app/appointments', icon: Calendar, label: 'Termini' },
  { to: '/app/services', icon: Stethoscope, label: 'Usluge', adminOnly: true },
  { to: '/app/categories', icon: FolderOpen, label: 'Kategorije', adminOnly: true },
  { to: '/app/veterinarians', icon: Users, label: 'Veterinari', adminOnly: true },
  { to: '/app/messages', icon: Mail, label: 'Poruke' },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { signOut, user, role, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/app/login');
  };

  const visibleNavItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  const roleLabel = role === 'admin' ? 'Administrator' : role === 'vet' ? 'Veterinar' : 'Korisnik';
  const RoleIcon = role === 'admin' ? Shield : Stethoscope;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transform transition-transform duration-200',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <PawPrint className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-lg">VetHealth</h1>
              <p className="text-xs text-muted-foreground">App Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border lg:hidden">
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Odjavi se
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <RoleIcon className="w-4 h-4 text-primary" />
              <span>{roleLabel}</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="hidden sm:inline text-sm max-w-[160px] truncate">
                    {user?.email}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <span className="truncate">{user?.email}</span>
                    <span className="text-xs text-muted-foreground font-normal flex items-center gap-1">
                      <RoleIcon className="w-3 h-3" />
                      {roleLabel}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Odjavi se
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
