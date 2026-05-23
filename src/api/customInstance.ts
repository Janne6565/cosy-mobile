import axios, { AxiosRequestConfig } from 'axios';
import { store } from '../redux/store';
import { setAuthenticated, setUnauthenticated } from '../redux/slices/instanceSlice';
import { selectIdentityToken, selectIsTokenExpired } from '../redux/selectors/instanceSelectors';
import { tokenService } from '../services/tokenService';
import { fetchIdentityToken } from './authApi';

// Active instance context — call setActiveInstance() before using generated hooks
let activeInstanceId: string | null = null;
let activeBaseUrl: string | null = null;

export const setActiveInstance = (instanceId: string, baseUrl: string) => {
  activeInstanceId = instanceId;
  activeBaseUrl = baseUrl;
};

export const getActiveInstanceId = () => activeInstanceId;

const refreshPromises: Record<string, Promise<string | null>> = {};

const IDENTITY_TOKEN_BUFFER_MS = 5 * 60 * 1000;

const axiosInstance = axios.create({
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

axiosInstance.interceptors.request.use(async (config) => {
  if (!activeInstanceId || config.url?.includes('/auth/login')) return config;

  const instanceId = activeInstanceId;
  const baseUrl = activeBaseUrl!;
  const state = store.getState();
  const isExpired = selectIsTokenExpired(instanceId)(state);

  if (isExpired) {
    if (!refreshPromises[instanceId]) {
      refreshPromises[instanceId] = (async () => {
        const refreshToken = await tokenService.getRefreshToken(instanceId);
        if (!refreshToken) return null;
        try {
          const token = await fetchIdentityToken(baseUrl, refreshToken);
          const expiresAt = Date.now() + 60 * 60 * 1000 - IDENTITY_TOKEN_BUFFER_MS;
          store.dispatch(setAuthenticated({ instanceId, identityToken: token, expiresAt }));
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

axiosInstance.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      'data' in response.data
    ) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401 && activeInstanceId) {
      store.dispatch(setUnauthenticated(activeInstanceId));
    }
    return Promise.reject(error);
  },
);

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const source = axios.CancelToken.source();

  const promise = axiosInstance({
    ...config,
    ...options,
    baseURL: activeBaseUrl ?? undefined,
    cancelToken: source.token,
    headers: {
      ...(config.headers ?? {}),
      ...(options?.headers ?? {}),
    },
  }).then((response) => response as T);

  // @ts-expect-error
  promise.cancel = () => source.cancel('Query was cancelled');

  return promise;
};
