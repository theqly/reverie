interface AuthConfig {
  keycloakUrl: string;  
  realm: string;         
  clientId: string;     
  redirectUri: string;  
}

export const authConfig: AuthConfig = {
  keycloakUrl: 'http://localhost:9090',
  realm: 'reverie-realm',
  clientId: 'frontend',
  redirectUri: 'http://localhost:5173/auth/callback',
};
