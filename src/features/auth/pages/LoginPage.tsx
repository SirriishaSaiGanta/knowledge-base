import { useLocation, useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';

interface LocationState {
  from?: { pathname: string };
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from?.pathname ?? '/nodes';

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <span className="login-logo" aria-hidden="true">
            🧠
          </span>
          <h1>Knowledge Hub</h1>
        </div>
        <LoginForm onSuccess={() => navigate(from, { replace: true })} />
      </div>
    </div>
  );
}
