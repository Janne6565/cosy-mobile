import axios, { AxiosInstance } from 'axios';
import { store } from '../redux/store';
import { setAuthenticated, setUnauthenticated } from '../redux/slices/instanceSlice';
import { selectIdentityToken, selectIsTokenExpired } from '../redux/selectors/instanceSelectors';
import { tokenService } from '../services/tokenService';
import { fetchIdentityToken } from './authApi';

// In-flight refresh promises keyed by instanceId to prevent race conditions
const refreshPromises: Record<string, Promise<string | null>> = {};

export function createApiClient(instanceId: string, baseUrl: string): AxiosInstance {
  const client = axios.create({
    baseURL: baseUrl,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.request.use(async (config) => {
    // Skip auth header for login endpoint
    if (config.url?.includes('/auth/login')) return config;

    const state = store.getState();
    const isExpired = selectIsTokenExpired(instanceId)(state);

    if (isExpired) {
      // Deduplicate concurrent refresh requests
      if (!refreshPromises[instanceId]) {
        refreshPromises[instanceId] = (async () => {
          const refreshToken = await tokenService.getRefreshToken(instanceId);
          if (!refreshToken) return null;
          try {
            const BUFFER = 5 * 60 * 1000;
            const token = await fetchIdentityToken(baseUrl, refreshToken);
            store.dispatch(setAuthenticated({ instanceId, identityToken: token, expiresAt: Date.now() + 60 * 60 * 1000 - BUFFER }));
            return token;
          } catch {
            store.dispatch(setUnauthenticated(instanceId));
            return null;
          } finally {
            delete refreshPromises[instanceId];
          }
        })();
      }
      await refreshPromises[instanceId];
    }

    const token = selectIdentityToken(instanceId)(store.getState());
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => {
      // Unwrap ApiResponse envelope if present
      if (
        response.data &&
        typeof response.data === 'object' &&
        'success' in response.data &&
        'data' in response.data
      ) {
        response.data = response.data.data;
      }
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        store.dispatch(setUnauthenticated(instanceId));
      }
      return Promise.reject(error);
    },
  );

  return client;
}
