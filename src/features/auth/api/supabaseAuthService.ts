import type { User } from '@supabase/supabase-js';
import { supabase } from '@data/supabaseClient';
import type { AuthService } from './AuthService';
import type { AuthUser } from '../types/User';

function toAuthUser(user: User | null | undefined): AuthUser | null {
  return user?.email ? { username: user.email } : null;
}

export const supabaseAuthService: AuthService = {
  async login({ username, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email: username, password });
    if (error) throw new Error(error.message);
    const user = toAuthUser(data.user);
    if (!user) throw new Error('Login failed');
    return user;
  },

  async logout() {
    await supabase.auth.signOut();
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return toAuthUser(data.session?.user);
  },

  onAuthStateChange(callback) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(toAuthUser(session?.user));
    });
    return () => subscription.unsubscribe();
  },
};
