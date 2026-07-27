import { useState, type FormEvent } from 'react';
import { Button, Input, PasswordInput } from '@shared/components/ui';
import { useAuth } from '../hooks/useAuth';

export interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ username, password });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="entity-form login-form" onSubmit={handleSubmit}>
      <label>
        Email
        <Input
          type="email"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="email"
          required
        />
      </label>
      <label>
        Password
        <PasswordInput
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
      </label>

      {error && (
        <p className="login-error" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in…' : 'Log in'}
      </Button>
    </form>
  );
}
