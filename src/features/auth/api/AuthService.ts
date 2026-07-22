import type { AuthUser } from '../types/User';
import type { Credentials } from '../types/Credentials';

/**
 * Every future auth backend (API, JWT, OAuth, Azure AD, ...) implements this
 * same shape. login() is async even though the hardcoded implementation
 * resolves instantly — that's what lets a real network-backed AuthService
 * replace it later without touching AuthProvider or any component.
 */
export interface AuthService {
  login(credentials: Credentials): Promise<AuthUser>;
  logout(): Promise<void>;
  getStoredUser(): AuthUser | null;
}
