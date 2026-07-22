import { createContext } from 'react';
import type { AuthUser } from '../types/User';
import type { Credentials } from '../types/Credentials';

export interface AuthResource {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthResource | undefined>(undefined);
