import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

export function ResetPasswordPage() {
 codex/add-email-and-password-to-whitelist-xq8fx8
  const { updatePassword, session, isLoading } = useAuth();

  const { updatePassword } = useAuth();
 main
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
 codex/add-email-and-password-to-whitelist-xq8fx8
  const [isSaving, setIsSaving] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
 main

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError('Hasło musi mieć minimum 6 znaków');
      return;
    }

    if (password !== confirmPassword) {
      setError('Hasła nie są takie same');
      return;
    }

codex/add-email-and-password-to-whitelist-xq8fx8
    if (!session) {
      setError('Brak aktywnej sesji resetu. Otwórz link z maila ponownie.');
      return;
    }

    setIsSaving(true);

    setIsLoading(true);
main
    try {
      const { error } = await updatePassword(password);
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Hasło zostało zaktualizowane. Możesz się zalogować.');
      }
    } catch (err) {
      setError('Wystąpił nieoczekiwany błąd');
    } finally {
codex/add-email-and-password-to-whitelist-xq8fx8
      setIsSaving(false);

      setIsLoading(false);
main
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Reset hasła</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ustaw nowe hasło do konta.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
codex/add-email-and-password-to-whitelist-xq8fx8
          {!session && !isLoading && !success && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-600">
              Link resetu jest nieaktywny lub wygasł. Poproś o nowy link resetu hasła.
            </div>
          )}

 main
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <p>{success}</p>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">
              Nowe hasło
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field pl-10"
                minLength={6}
                required
 codex/add-email-and-password-to-whitelist-xq8fx8
                autoComplete="new-password"
                disabled={!!success}

 main
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">
              Potwierdź hasło
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field pl-10"
                minLength={6}
                required
codex/add-email-and-password-to-whitelist-xq8fx8
                autoComplete="new-password"
                disabled={!!success}

 main
              />
            </div>
          </div>

          <button
            type="submit"
 codex/add-email-and-password-to-whitelist-xq8fx8
            disabled={isSaving || isLoading || !session}
            className="btn-primary w-full disabled:opacity-50"
          >
            {isSaving || isLoading ? 'Zapisywanie...' : 'Zapisz nowe hasło'}

            disabled={isLoading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {isLoading ? 'Zapisywanie...' : 'Zapisz nowe hasło'}
 main
          </button>
        </form>
      </div>
    </div>
  );
}
