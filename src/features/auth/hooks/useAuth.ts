import { useContext } from 'react';
import { AuthContext, type AuthResource } from './AuthContext';

export function useAuth(): AuthResource {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
