import Keycloak from 'keycloak-js';

// Конфигурация Keycloak
const keycloakConfig = {
  url: 'http://localhost:8180',
  realm: 'reverie-realm',
  clientId: 'frontend',
};

// Создаём экземпляр Keycloak
export const keycloak = new Keycloak(keycloakConfig);

// Флаг инициализации
let initialized = false;
let initPromise: Promise<boolean> | null = null;
let tokenRefreshInterval: ReturnType<typeof setInterval> | null = null;

// Инициализация Keycloak (singleton)
export async function initKeycloak(): Promise<boolean> {
  // Если уже инициализирован - возвращаем текущий статус
  if (initialized) {
    return keycloak.authenticated ?? false;
  }

  // Если инициализация в процессе - ждём её
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const authenticated = await keycloak.init({
        onLoad: 'check-sso',
        checkLoginIframe: false,
      });

      initialized = true;
      if (import.meta.env.DEV) {
        console.log('[Auth] Keycloak initialized, authenticated:', authenticated);
      }

      if (authenticated) {
        setupTokenRefresh();
      }

      return authenticated;
    } catch (error) {
      console.error('[Auth] Failed to initialize Keycloak:', error);
      initialized = true; // Помечаем как инициализированный чтобы не пытаться снова
      return false;
    }
  })();

  return initPromise;
}

// Автоматическое обновление токена
function setupTokenRefresh() {
  // Предотвращаем создание нескольких интервалов
  if (tokenRefreshInterval) {
    return;
  }

  // Обновляем токен каждые 60 секунд
  tokenRefreshInterval = setInterval(async () => {
    try {
      const refreshed = await keycloak.updateToken(70);
      if (refreshed) {
        if (import.meta.env.DEV) {
          console.log('[Auth] Token refreshed');
        }
      }
    } catch (error) {
      console.error('[Auth] Failed to refresh token:', error);
    }
  }, 60000);
}

// Остановка обновления токена
function stopTokenRefresh() {
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval);
    tokenRefreshInterval = null;
  }
}

// Логин
export function login() {
  keycloak.login({
    redirectUri: window.location.origin + '/feed',
  });
}

// Регистрация
export function register() {
  keycloak.register({
    redirectUri: window.location.origin + '/feed',
  });
}

// Логаут
export function logout() {
  stopTokenRefresh();
  keycloak.logout({
    redirectUri: window.location.origin + '/login',
  });
}

// Получить токен
export function getToken(): string | undefined {
  return keycloak.token;
}

// Получить ID пользователя из токена
export function getUserId(): string | null {
  if (keycloak.tokenParsed) {
    return keycloak.tokenParsed.sub || null;
  }
  return null;
}

// Получить данные пользователя из токена
export function getUserInfo(): {
  id: string | null;
  email: string | null;
  name: string | null;
  preferredUsername: string | null;
} {
  const tokenParsed = keycloak.tokenParsed;

  if (!tokenParsed) {
    return {
      id: null,
      email: null,
      name: null,
      preferredUsername: null,
    };
  }

  return {
    id: tokenParsed.sub || null,
    email: tokenParsed.email || null,
    name: tokenParsed.name || null,
    preferredUsername: tokenParsed.preferred_username || null,
  };
}

// Проверка аутентификации
export function isAuthenticated(): boolean {
  return !!keycloak.authenticated;
}

// Проверка роли
export function hasRole(role: string): boolean {
  return keycloak.hasRealmRole(role);
}
