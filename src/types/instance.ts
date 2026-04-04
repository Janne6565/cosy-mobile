export interface CosyInstance {
  id: string;
  name: string;
  baseUrl: string;
  username: string;
  isAuthenticated: boolean;
}

export interface InstanceAuthState {
  instanceId: string;
  identityToken: string | null;
  identityTokenExpiresAt: number;
}
