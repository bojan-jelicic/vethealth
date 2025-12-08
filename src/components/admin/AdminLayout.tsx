import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Stethoscope, 
  Users, 
  Mail, 
  LogOut, 
  PawPrint,
  LayoutDashboard,
  FolderOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/appointments', icon: Calendar, label: 'Termini' },
  { to: '/admin/services', icon: Stethoscope, label: 'Usluge' },
  { to: '/admin/categories', icon: FolderOpen, label: 'Kategorije' },
  { to: '/admin/veterinarians', icon: Users, label: 'Veterinari' },
  { to: '/admin/messages', icon: Mail, label: 'Poruke' },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <PawPrint className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-lg">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Veterinarska Ordinacija</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
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

        <div className="p-4 border-t border-border">
          <div className="mb-4 px-4">
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
          </div>
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
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
