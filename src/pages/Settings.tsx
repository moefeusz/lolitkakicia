import { Moon, Sun, Download, User, Shield } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTheme } from '@/hooks/useTheme';
import { useTransactions } from '@/hooks/useTransactions';
import { exportTransactionsToCSV } from '@/lib/exportCSV';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { transactions } = useTransactions();
  const { user } = useAuth();

  const handleExportAll = () => {
    if (transactions.length === 0) {
      toast.error('Brak transakcji do eksportu');
      return;
    }
    exportTransactionsToCSV(transactions, 'wszystkie-transakcje');
    toast.success('Eksport zakończony!');
  };

  return (
    <AppLayout>
      <div className="container max-w-lg px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Ustawienia</h1>
          <p className="text-sm text-muted-foreground">Personalizuj swoją aplikację</p>
        </div>

        <div className="space-y-4">
          {/* User info */}
          <div className="rounded-xl bg-card border border-border p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{user?.email}</p>
                <p className="text-sm text-muted-foreground">Zalogowany użytkownik</p>
              </div>
            </div>
          </div>

          {/* Theme toggle */}
          <div className="rounded-xl bg-card border border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="h-5 w-5 text-primary" />
                ) : (
                  <Sun className="h-5 w-5 text-warning" />
                )}
                <div>
                  <p className="font-medium">Motyw</p>
                  <p className="text-sm text-muted-foreground">
                    {theme === 'dark' ? 'Ciemny' : 'Jasny'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative h-8 w-14 rounded-full transition-colors ${
                  theme === 'dark' ? 'bg-primary' : 'bg-secondary'
                }`}
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                    theme === 'dark' ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Export */}
          <div className="rounded-xl bg-card border border-border p-4">
            <button
              onClick={handleExportAll}
              className="flex w-full items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Eksportuj dane</p>
                  <p className="text-sm text-muted-foreground">
                    Pobierz wszystkie transakcje (CSV)
                  </p>
                </div>
              </div>
              <span className="rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {transactions.length} rekordów
              </span>
            </button>
          </div>

          {/* Security */}
          <div className="rounded-xl bg-card border border-border p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Bezpieczeństwo</p>
                <p className="text-sm text-muted-foreground">
                  Dane są szyfrowane i chronione
                </p>
              </div>
            </div>
          </div>

          {/* App info */}
          <div className="rounded-xl bg-secondary/50 border border-border p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Wspólne Finanse v1.0
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Zbudowane z ❤️ dla Konki i Ani
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
