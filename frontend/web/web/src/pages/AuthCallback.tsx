import { useEffect } from 'react';
import { handleAuthCallback } from '../auth/authService';

export default function AuthCallback(): null {

  useEffect(() => {

    const params: URLSearchParams =
      new URLSearchParams(window.location.search);

    const code: string | null = params.get('code');

    const state: string | null = params.get('state');

    if (!code || !state) {
      throw new Error('Missing code or state');
    }
    
    handleAuthCallback(code, state);

  }, []);

  return null;
}
