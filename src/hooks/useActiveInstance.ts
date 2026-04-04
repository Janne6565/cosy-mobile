import { useMemo, useRef, useEffect } from 'react';
import { useAppSelector } from '../redux/hooks';
import { selectActiveInstance } from '../redux/selectors/instanceSelectors';
import { createApiClient } from '../api/createApiClient';
import { AxiosInstance } from 'axios';
import { CosyInstance } from '../types/instance';

interface ActiveInstanceResult {
  instance: CosyInstance | undefined;
  apiClient: AxiosInstance | null;
  isReady: boolean;
}

export function useActiveInstance(): ActiveInstanceResult {
  const instance = useAppSelector(selectActiveInstance);
  const apiClientRef = useRef<AxiosInstance | null>(null);
  const instanceIdRef = useRef<string | undefined>(undefined);

  // Only recreate apiClient if instance.id or instance.baseUrl actually changed
  if (instance?.id !== instanceIdRef.current) {
    instanceIdRef.current = instance?.id;
    if (instance) {
      apiClientRef.current = createApiClient(instance.id, instance.baseUrl);
    } else {
      apiClientRef.current = null;
    }
  }

  return { 
    instance, 
    apiClient: apiClientRef.current, 
    isReady: !!instance && !!apiClientRef.current 
  };
}
