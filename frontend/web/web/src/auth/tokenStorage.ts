interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const EXPIRES_AT_KEY = 'access_token_expires_at';

export function saveTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn: number
): void {
  const expiresAt: number = Date.now() + expiresIn * 1000;
  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  sessionStorage.setItem(EXPIRES_AT_KEY, expiresAt.toString());
}

export function getAccessToken(): string | null {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

export function isAccessTokenExpired(): boolean {
  const expiresAt: string | null = sessionStorage.getItem(EXPIRES_AT_KEY);
  if (!expiresAt) {
    return true;
  }
  const expiresAtNumber: number = Number(expiresAt);
  return Date.now() >= expiresAtNumber;
}

export function clearTokens(): void {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(EXPIRES_AT_KEY);
}

// Альтернативная версия функции с более гибкой логикой поиска
export function getUserIdFromToken(fieldName?: string): string | null {
  const accessToken = getAccessToken();
  
  if (!accessToken) {
    return null;
  }
  
  try {
    const payloadBase64 = accessToken.split('.')[1];
    
    if (!payloadBase64) {
      return null;
    }
    
    const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson);
    
    // Если указано конкретное поле
    if (fieldName && payload[fieldName]) {
      return payload[fieldName];
    }
    
    // Пробуем найти id в стандартных полях
    const possibleFields = ['sub', 'userId', 'uuid', 'id', 'user_id', 'user_uuid'];
    
    for (const field of possibleFields) {
      if (payload[field]) {
        return payload[field];
      }
    }
    
    return null;
    
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}