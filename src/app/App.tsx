import { ThemeProvider } from '@features/theme';
import { AuthProvider } from '@features/auth';
import { AppRoutes } from './routes';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}
