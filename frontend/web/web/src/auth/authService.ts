import { authConfig } from './AuthConfig';
import {
  generateRandomString,
  generateCodeChallenge,
} from './pkce';
import {
  saveTokens,
  clearTokens,
  getRefreshToken,
} from './tokenStorage';

const STATE_KEY = 'oauth_state';
const NONCE_KEY = 'oauth_nonce';
const CODE_VERIFIER_KEY = 'oauth_code_verifier';

export async function redirectToLogin(): Promise<void> {
  const state: string = generateRandomString(32);

  const nonce: string = generateRandomString(32);

  const codeVerifier: string = generateRandomString(64);

  const codeChallenge: string =
    await generateCodeChallenge(codeVerifier);

  sessionStorage.setItem(STATE_KEY, state);
  sessionStorage.setItem(NONCE_KEY, nonce);
  sessionStorage.setItem(CODE_VERIFIER_KEY, codeVerifier);

  const authUrl = new URL(
    `${authConfig.keycloakUrl}/realms/${authConfig.realm}/protocol/openid-connect/auth`
  );

  authUrl.searchParams.set('client_id', authConfig.clientId);
  authUrl.searchParams.set('redirect_uri', authConfig.redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid profile email');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('nonce', nonce);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  window.location.href = authUrl.toString();
}

let isProcessing = false;

export async function handleAuthCallback(
  code: string,
  returnedState: string
): Promise<void> {
  if (isProcessing) return;

  const storedState: string | null =
    sessionStorage.getItem(STATE_KEY);

  if (!storedState || storedState !== returnedState) {
    throw new Error('Invalid OAuth state');
  }

  const codeVerifier: string | null =
    sessionStorage.getItem(CODE_VERIFIER_KEY);

  if (!codeVerifier) {
    throw new Error('Missing code verifier');
  }

  try {
    isProcessing = true;

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: authConfig.clientId,
      redirect_uri: authConfig.redirectUri,
      code: code,
      code_verifier: codeVerifier,
    });

    const response = await fetch(
      `${authConfig.keycloakUrl}/realms/${authConfig.realm}/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Keycloak error:', errorData);
      throw new Error('Token request failed');
    }

    const tokenResponse = await response.json();
    saveTokens(
      tokenResponse.access_token,
      tokenResponse.refresh_token,
      tokenResponse.expires_in
    );

    sessionStorage.removeItem(STATE_KEY);
    sessionStorage.removeItem(NONCE_KEY);
    sessionStorage.removeItem(CODE_VERIFIER_KEY);

  } finally {
    isProcessing = false;
  }
}

export async function refreshAccessToken(): Promise<void> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: authConfig.clientId,
    refresh_token: refreshToken,
  });

  const response = await fetch(
    `${authConfig.keycloakUrl}/realms/${authConfig.realm}/protocol/openid-connect/token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    }
  );

  if (!response.ok) {
    throw new Error('Refresh token expired');
  }

  const tokenResponse = await response.json();

  saveTokens(
    tokenResponse.access_token,
    tokenResponse.refresh_token,
    tokenResponse.expires_in
  );
}

export function logout(): void {
  clearTokens();
}
