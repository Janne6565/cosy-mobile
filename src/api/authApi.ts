import axios from 'axios';
import { tokenService } from '../services/tokenService';
import { store } from '../redux/store';
import { setAuthenticated, setUnauthenticated } from '../redux/slices/instanceSlice';
import { DirectLoginResponse } from '../types/api';

const IDENTITY_TOKEN_BUFFER_MS = 5 * 60 * 1000; // 5 minutes before expiry

export async function login(
  instanceId: string,
  baseUrl: string,
  username: string,
  password: string,
): Promise<void> {
  console.log('[auth] POST', `${baseUrl}/auth/login?tokenMode=direct`);
  const response = await axios.post<DirectLoginResponse>(
    `${baseUrl}/auth/login?tokenMode=DIRECT`,
    { username, password },
    { headers: { 'Content-Type': 'application/json' } },
  );

  console.log('[auth] login response status:', response.status);
  console.log('[auth] login response data:', JSON.stringify(response.data));

  // Response may be wrapped in ApiResponse envelope: { data: { refreshToken }, success, ... }
  const body = response.data as any;
  const refreshToken = body?.data?.refresh_token;
  if (!refreshToken) {
    throw new Error(
      'No refreshToken in login response. Response was: ' + JSON.stringify(body),
    );
  }

  await tokenService.saveRefreshToken(instanceId, refreshToken);

  console.log('[auth] fetching identity token...');
  const identityToken = await fetchIdentityToken(baseUrl, refreshToken);
  console.log('[auth] got identity token, length:', identityToken?.length);
  const expiresAt = Date.now() + 60 * 60 * 1000 - IDENTITY_TOKEN_BUFFER_MS;

  store.dispatch(setAuthenticated({ instanceId, identityToken, expiresAt }));
}

export async function fetchIdentityToken(
  baseUrl: string,
  refreshToken: string,
): Promise<string> {
  const response = await axios.get(`${baseUrl}/auth/token`, {
    headers: { Cookie: `refreshToken=${refreshToken}` },
  });
  // May be raw JWT string or wrapped in ApiResponse envelope
  const body = response.data;
  if (typeof body === 'string') return body;
  if (body?.data && typeof body.data === 'string') return body.data;
  console.error('[auth] unexpected /auth/token response:', JSON.stringify(body));
  throw new Error('Unexpected identity token response format');
}

export async function refreshIdentityToken(
  instanceId: string,
  baseUrl: string,
): Promise<string | null> {
  const refreshToken = await tokenService.getRefreshToken(instanceId);
  if (!refreshToken) return null;

  try {
    const identityToken = await fetchIdentityToken(baseUrl, refreshToken);
    const expiresAt = Date.now() + 60 * 60 * 1000 - IDENTITY_TOKEN_BUFFER_MS;
    store.dispatch(setAuthenticated({ instanceId, identityToken, expiresAt }));
    return identityToken;
  } catch {
    store.dispatch(setUnauthenticated(instanceId));
    return null;
  }
}

export async function logout(
  instanceId: string,
  apiClient: ReturnType<typeof axios.create>,
): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    await tokenService.deleteRefreshToken(instanceId);
    store.dispatch(setUnauthenticated(instanceId));
  }
}
