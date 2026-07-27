import type { AuthUser } from '../types/User';
import type { Credentials } from '../types/Credentials';

/**
 * Every auth backend implements this same shape. getSession() and onAuthStateChange() are async/
 * reactive rather than a synchronous getStoredUser(), because a real backend (Supabase, an API,
 * OAuth) needs to validate or refresh a session before it can say who's logged in.
 */
export interface AuthService {
  login(credentials: Credentials): Promise<AuthUser>;
  logout(): Promise<void>;
  /** Resolves the currently-authenticated user, if any, restoring a prior session. */
  getSession(): Promise<AuthUser | null>;
  /** Fires whenever the session changes (login, logout, token refresh, expiry). Returns an unsubscribe function. */
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void;
}
