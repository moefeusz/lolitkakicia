import { useAuth } from '@/hooks/useAuth';
import { ShieldX, LogOut } from 'lucide-react';

export function NotWhitelisted() {
  const { signOut, user } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm animate-fade-in text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <ShieldX className="h-10 w-10 text-destructive" />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-foreground">Brak dostępu</h1>
        
        <p className="mb-6 text-muted-foreground">
          Konto <span className="text-foreground">{user?.email}</span> nie ma uprawnień do korzystania z tej aplikacji.
        </p>

        <p className="mb-8 text-sm text-muted-foreground">
          Jeśli uważasz, że to błąd, skontaktuj się z właścicielem aplikacji.
        </p>

        <button
          onClick={() => signOut()}
          className="inline-flex items-center gap-2 rounded-lg bg-secondary px-6 py-3 font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
        >
          <LogOut className="h-4 w-4" />
          Wyloguj się
        </button>
      </div>
    </div>
  );
}
