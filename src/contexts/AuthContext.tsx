import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'vet' | 'user';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  isAdmin: boolean;
  isVet: boolean;
  isStaff: boolean; // admin OR vet
  isLoading: boolean;
  sessionExpired: boolean;
  dismissSessionExpired: () => void;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activityRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchRole = async (userId: string): Promise<AppRole | null> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) return null;
      return data.role as AppRole;
    } catch {
      return null;
    }
  };

  const clearSessionTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (activityRef.current) clearTimeout(activityRef.current);
  }, []);

  const startSessionTimeout = useCallback(() => {
    clearSessionTimeout();
    timeoutRef.current = setTimeout(async () => {
      await supabase.auth.signOut();
      setSessionExpired(true);
    }, SESSION_TIMEOUT_MS);
  }, [clearSessionTimeout]);

  const resetActivityTimer = useCallback(() => {
    if (!session) return;
    startSessionTimeout();
  }, [session, startSessionTimeout]);

  // Activity listeners
  useEffect(() => {
    if (!session) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handler = () => {
      if (activityRef.current) clearTimeout(activityRef.current);
      activityRef.current = setTimeout(resetActivityTimer, 1000); // debounce
    };

    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    startSessionTimeout();

    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      clearSessionTimeout();
    };
  }, [session, resetActivityTimer, startSessionTimeout, clearSessionTimeout]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => {
            fetchRole(session.user.id).then(setRole);
          }, 0);
        } else {
          setRole(null);
        }

        if (event === 'SIGNED_OUT') {
          setRole(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchRole(session.user.id).then((r) => {
          setRole(r);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setSessionExpired(false);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    clearSessionTimeout();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
  };

  const dismissSessionExpired = () => setSessionExpired(false);

  const isAdmin = role === 'admin';
  const isVet = role === 'vet';
  const isStaff = isAdmin || isVet;

  return (
    <AuthContext.Provider value={{
      user, session, role, isAdmin, isVet, isStaff, isLoading,
      sessionExpired, dismissSessionExpired,
      signIn, signUp, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
