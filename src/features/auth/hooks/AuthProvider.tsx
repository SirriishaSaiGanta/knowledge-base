import { useCallback, useState, type PropsWithChildren } from 'react';
import { hardcodedAuthService } from '../api/hardcodedAuthService';
import type { AuthUser } from '../types/User';
import type { Credentials } from '../types/Credentials';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(() => hardcodedAuthService.getStoredUser());

  const login = useCallback(async (credentials: Credentials) => {
    const authenticated = await hardcodedAuthService.login(credentials);
    setUser(authenticated);
  }, []);

  const logout = useCallback(() => {
    void hardcodedAuthService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
