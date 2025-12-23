import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  initKeycloak,
  login as keycloakLogin,
  logout as keycloakLogout,
  register as keycloakRegister,
  getUserInfo,
  getToken,
} from '../services/authService';

interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  preferredUsername: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  register: () => void;
  getToken: () => string | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const authenticated = await initKeycloak();
        setIsAuthenticated(authenticated);

        if (authenticated) {
          const userInfo = getUserInfo();
          if (userInfo.id) {
            setUser({
              id: userInfo.id,
              email: userInfo.email,
              name: userInfo.name,
              preferredUsername: userInfo.preferredUsername,
            });
          }
        }
      } catch (error) {
        console.error('[AuthContext] Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const login = () => {
    keycloakLogin();
  };

  const logout = () => {
    keycloakLogout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const register = () => {
    keycloakRegister();
  };

  const value: AuthContextType = {
    user,
    userId: user?.id || null,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Хук для получения userId
// Возвращает null если не авторизован (компонент сам решает что делать)
export const useCurrentUserId = (): string | null => {
  const { userId, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return userId;
};
