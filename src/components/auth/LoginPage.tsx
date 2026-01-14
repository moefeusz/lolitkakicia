import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Wallet, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [viewMode, setViewMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, signUp, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const { error } =
        viewMode === 'signup'
          ? await signUp(email, password)
          : await signIn(email, password);

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('Wystąpił nieoczekiwany błąd');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Wysłaliśmy link do resetu hasła na podany adres.');
      }
    } catch (err) {
      setError('Wystąpił nieoczekiwany błąd');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Finanse</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Prywatny dashboard finansowy
          </p>
        </div>

        {/* Form */}
        <form onSubmit={viewMode === 'reset' ? handleReset : handleSubmit} className="space-y-4">
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
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          {viewMode !== 'reset' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Hasło
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
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {isLoading
              ? 'Ładowanie...'
              : viewMode === 'signup'
              ? 'Zarejestruj się'
              : viewMode === 'reset'
              ? 'Wyślij link resetu'
              : 'Zaloguj się'}
          </button>
        </form>

        {viewMode !== 'reset' && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {viewMode === 'signup' ? 'Masz już konto?' : 'Nie masz konta?'}{' '}
            <button
              onClick={() =>
                setViewMode(viewMode === 'signup' ? 'signin' : 'signup')
              }
              className="font-medium text-primary hover:underline"
            >
              {viewMode === 'signup' ? 'Zaloguj się' : 'Zarejestruj się'}
            </button>
          </p>
        )}

        <p className="mt-4 text-center text-sm text-muted-foreground">
          <button
            onClick={() => setViewMode(viewMode === 'reset' ? 'signin' : 'reset')}
            className="font-medium text-primary hover:underline"
          >
            {viewMode === 'reset' ? 'Wróć do logowania' : 'Nie pamiętasz hasła?'}
          </button>
        </p>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Dostęp tylko dla uprawnionych użytkowników
        </p>
      </div>
    </div>
  );
}
