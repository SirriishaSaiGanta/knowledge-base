import { localStorageAdapter } from '@data/storage/localStorageAdapter';
import type { AuthService } from './AuthService';
import type { AuthUser } from '../types/User';
import type { Credentials } from '../types/Credentials';

const AUTH_STORAGE_KEY = 'kb:auth';

/**
 * Predefined-credentials implementation. This is a client-side gate only —
 * the credentials and the check both ship in the JS bundle, so anyone with
 * devtools access can read them or bypass the check entirely. There is no
 * backend to enforce anything. Acceptable for a single-user local app;
 * replace this file with an API-backed AuthService before this app is ever
 * exposed to more than one trusted user.
 */
const PREDEFINED_USERS: Credentials[] = [{ username: 'admin', password: 'admin123' }];

export const hardcodedAuthService: AuthService = {
  async login({ username, password }) {
    const match = PREDEFINED_USERS.find((user) => user.username === username && user.password === password);
    if (!match) {
      throw new Error('Invalid username or password');
    }

    const user: AuthUser = { username: match.username };
    localStorageAdapter.set(AUTH_STORAGE_KEY, user);
    return user;
  },

  async logout() {
    localStorageAdapter.remove(AUTH_STORAGE_KEY);
  },

  getStoredUser() {
    return localStorageAdapter.get<AuthUser>(AUTH_STORAGE_KEY);
  },
};
