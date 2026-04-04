import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useActiveInstance } from './useActiveInstance';
import { useAppDispatch } from '../redux/hooks';
import { updateServerStatus } from '../redux/slices/serverSlice';
import { serverApi } from '../api/serverApi';
import { ServerStatus } from '../types/api';

export function useServerActions() {
  const { instance, apiClient } = useActiveInstance();
  const dispatch = useAppDispatch();

  const optimisticUpdate = (uuid: string, status: ServerStatus) => {
    if (instance) dispatch(updateServerStatus({ instanceId: instance.id, serverUuid: uuid, status }));
  };

  const startServer = useCallback(
    async (uuid: string) => {
      if (!apiClient) return;
      optimisticUpdate(uuid, 'PULLING_IMAGE');
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      try {
        await serverApi.startServer(apiClient, uuid);
        optimisticUpdate(uuid, 'RUNNING');
      } catch (e) {
        optimisticUpdate(uuid, 'STOPPED');
        throw e;
      }
    },
    [apiClient, instance?.id],
  );

  const stopServer = useCallback(
    async (uuid: string) => {
      if (!apiClient) return;
      optimisticUpdate(uuid, 'STOPPING');
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      try {
        await serverApi.stopServer(apiClient, uuid);
        optimisticUpdate(uuid, 'STOPPED');
      } catch (e) {
        optimisticUpdate(uuid, 'RUNNING');
        throw e;
      }
    },
    [apiClient, instance?.id],
  );

  const sendCommand = useCallback(
    async (uuid: string, command: string) => {
      if (!apiClient) return;
      await serverApi.sendCommand(apiClient, uuid, command);
    },
    [apiClient],
  );

  return { startServer, stopServer, sendCommand };
}
