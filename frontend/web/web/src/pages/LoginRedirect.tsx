import { useEffect } from 'react';
import { redirectToLogin } from '../auth/authService';


export default function LoginRedirect(): null {

  useEffect(() => {
    redirectToLogin();
  }, []);

  return null;
}
