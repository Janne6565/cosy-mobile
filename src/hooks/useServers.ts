import { useCallback, useEffect } from 'react';
import { useActiveInstance } from './useActiveInstance';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setServers, setLoading, setError } from '../redux/slices/serverSlice';
import { selectServersByInstance, selectInstanceLoading, selectInstanceError } from '../redux/selectors/serverSelectors';
import { serverApi } from '../api/serverApi';
import { GameServerDto } from '../types/api';

// Module-level guard: survives component remounts, only resets on app restart
const fetchedInstances = new Set<string>();

export function useServers() {
  const { instance, apiClient } = useActiveInstance();
  const dispatch = useAppDispatch();

  const instanceId = instance?.id ?? '';

  const servers = useAppSelector(selectServersByInstance(instanceId));
  const isLoading = useAppSelector(selectInstanceLoading(instanceId));
  const loadError = useAppSelector(selectInstanceError(instanceId));

  const fetchServers = useCallback(async () => {
    if (!apiClient || !instanceId) return;

    dispatch(setLoading({ instanceId, loading: true }));
    dispatch(setError({ instanceId, error: null }));
    try {
      const data = await serverApi.listServers(apiClient);
      const sorted = [...(Array.isArray(data) ? data : [])].sort((a, b) => {
        if (a.status === 'RUNNING' && b.status !== 'RUNNING') return -1;
        if (b.status === 'RUNNING' && a.status !== 'RUNNING') return 1;
        return a.server_name.localeCompare(b.server_name);
      });
      dispatch(setServers({ instanceId, servers: sorted }));
    } catch (e: any) {
      console.error('[servers] fetch error:', e.response?.status, e.response?.data ?? e.message);
      dispatch(setError({ instanceId, error: 'Failed to load servers' }));
    } finally {
      dispatch(setLoading({ instanceId, loading: false }));
    }
  }, [apiClient, instanceId, dispatch]);

  useEffect(() => {
    if (!apiClient || !instanceId) return;

    if (!fetchedInstances.has(instanceId)) {
      fetchedInstances.add(instanceId);
      fetchServers();
    }
  }, [instanceId, apiClient, fetchServers]);

  const refetch = useCallback(async () => {
    // Manual refetch bypasses the guard
    await fetchServers();
  }, [fetchServers]);

  return { servers, isLoading, error: loadError, refetch };
}

export function useServer(uuid: string): GameServerDto | undefined {
  const { instance } = useActiveInstance();
  const instanceId = instance?.id ?? '';
  return useAppSelector(selectServersByInstance(instanceId)).find((s) => s.uuid === uuid);
}
