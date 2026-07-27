import { useCallback, useEffect, useState, type PropsWithChildren } from 'react';
import { supabaseAuthService } from '../api/supabaseAuthService';
import type { AuthUser } from '../types/User';
import type { Credentials } from '../types/Credentials';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  /* Starts true and only resolves once Supabase has confirmed whether a prior session exists —
   * without this gate, ProtectedRoute would see isAuthenticated: false on first render and bounce
   * a genuinely logged-in user to /login before the session check finishes. */
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  useEffect(() => {
    let active = true;

    supabaseAuthService.getSession().then((sessionUser) => {
      if (!active) return;
      setUser(sessionUser);
      setIsRestoringSession(false);
    });

    const unsubscribe = supabaseAuthService.onAuthStateChange((nextUser) => {
      if (!active) return;
      setUser(nextUser);
      setIsRestoringSession(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (credentials: Credentials) => {
    const authenticated = await supabaseAuthService.login(credentials);
    setUser(authenticated);
  }, []);

  const logout = useCallback(() => {
    void supabaseAuthService.logout();
    setUser(null);
  }, []);

  if (isRestoringSession) {
    return (
      <div className="login-page">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
