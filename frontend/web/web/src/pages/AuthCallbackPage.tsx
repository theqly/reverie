import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleAuthCallback } from '../auth/authService';

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const code = params.get('code');
    const state = params.get('state');

    if (!code || !state) {
      console.error('Нет code или state');
      navigate('/login');
      return;
    }

    handleAuthCallback(code, state)
      .then(() => {
        navigate('/');
      })
      .catch((err) => {
        console.error('Auth callback error', err);
        navigate('/login');
      });
  }, [navigate]);

  return <div>Авторизация...</div>;
}
