import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isWhitelisted: boolean;
  isPasswordRecovery: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    const ensureWhitelist = async () => {
      try {
        // If the function is not deployed yet, ignore the error and fall back to role check.
        await supabase.functions.invoke('ensure-whitelist');
      } catch {
        // no-op
      }
    };

    const checkWhitelist = async (userId: string) => {
      // First try to auto-whitelist if this email is in the allowlist.
      await ensureWhitelist();

      // Prefer a backend function to avoid any RLS visibility issues on user_roles.
      const { data, error } = await supabase.rpc('is_whitelisted', { _user_id: userId });

      if (error) {
        // Fall back to direct table check (may fail if RLS blocks it).
        const { data: roleRow } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();

        setIsWhitelisted(!!roleRow);
        return;
      }

      setIsWhitelisted(!!data);
    };

    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsPasswordRecovery(event === 'PASSWORD_RECOVERY');

      if (session?.user) {
        await checkWhitelist(session.user.id);
      } else {
        setIsWhitelisted(false);
      }

      setIsLoading(false);
    });

    const initializeSession = async () => {
      const hash = window.location.hash;
      const search = window.location.search;
      const hasRecoveryHashTokens =
        hash.includes('access_token=') &&
        hash.includes('refresh_token=') &&
        hash.includes('type=recovery');
      const hasRecoverySearchTokens =
        search.includes('access_token=') &&
        search.includes('refresh_token=') &&
        search.includes('type=recovery');

      const recoveryParamsSource = hasRecoveryHashTokens
        ? hash
        : hasRecoverySearchTokens
        ? search
        : null;

      if (recoveryParamsSource) {
        const params = new URLSearchParams(recoveryParamsSource.replace(/^[#?]/, ''));
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (!error) {
            setIsPasswordRecovery(true);
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      }

      // THEN get initial session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await checkWhitelist(session.user.id);
      } else {
        setIsWhitelisted(false);
      }

      setIsLoading(false);
    };

    initializeSession();

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (!error) {
      setIsPasswordRecovery(false);
    }
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsPasswordRecovery(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isWhitelisted,
        isPasswordRecovery,
        signIn,
        signUp,
        resetPassword,
        updatePassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
