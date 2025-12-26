interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

//зачем тут присваиваем значение?
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
