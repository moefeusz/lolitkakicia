import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, TrendingDown, Target, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/income', icon: TrendingUp, label: 'Wpływy' },
  { path: '/expenses', icon: TrendingDown, label: 'Wydatki' },
  { path: '/goals', icon: Target, label: 'Cele' },
];

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Main content */}
      <main className="pb-24 pt-4">
        {children}
      </main>

      {/* Bottom navigation - mobile first */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 rounded-lg px-4 py-2 transition-all ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'animate-scale-in' : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => signOut()}
            className="flex flex-col items-center gap-1 rounded-lg px-4 py-2 text-muted-foreground transition-all hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-xs font-medium">Wyloguj</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
