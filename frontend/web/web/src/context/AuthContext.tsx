import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAccessToken } from '../auth/tokenStorage';
import { redirectToLogin, logout as authLogout } from '../auth/authService';

interface AuthContextType {
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  register: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      const payload = parseJwt(token);
      if (payload?.sub) {
        setUserId(payload.sub);
        setIsAuthenticated(true);
      }
    }
    setIsLoading(false);
  }, []);

  const login = () => {
    redirectToLogin();
  };

  const register = () => {
    redirectToLogin();
  };

  const logout = () => {
    authLogout();
    setUserId(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ userId, isAuthenticated, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useCurrentUserId(): string | null {
  const context = useContext(AuthContext);
  return context?.userId ?? null;
}
