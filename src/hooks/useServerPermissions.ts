import { useCallback, useEffect, useState } from 'react';
import { useActiveInstance } from './useActiveInstance';
import { serverApi } from '../api/serverApi';

export const PERMISSIONS = {
  CHANGE_SERVER_CONFIGS: 'CHANGE_SERVER_CONFIGS',
  CHANGE_RCON_SETTINGS: 'CHANGE_RCON_SETTINGS',
  CHANGE_WEBHOOK_SETTINGS: 'CHANGE_WEBHOOK_SETTINGS',
  CHANGE_PERMISSIONS_SETTINGS: 'CHANGE_PERMISSIONS_SETTINGS',
  CHANGE_PRIVATE_DASHBOARD_SETTINGS: 'CHANGE_PRIVATE_DASHBOARD_SETTINGS',
  CHANGE_PUBLIC_DASHBOARD_SETTINGS: 'CHANGE_PUBLIC_DASHBOARD_SETTINGS',
  CHANGE_METRICS_SETTINGS: 'CHANGE_METRICS_SETTINGS',
} as const;

export function useServerPermissions(uuid: string) {
  const { apiClient, instance } = useActiveInstance();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!apiClient || !uuid) return;
    setLoading(true);
    serverApi
      .getPermissions(apiClient, uuid)
      .then((data) => {
        const username = instance?.username;
        if (!username) {
          setPermissions([]);
          return;
        }
        const entry = data.find((p) => p.user.username === username);
        setPermissions(entry?.permissions ?? []);
      })
      .catch(() => setPermissions([]))
      .finally(() => setLoading(false));
  }, [apiClient, uuid, instance?.username]);

  const hasPermission = useCallback(
    (perm: string) => permissions.includes(perm),
    [permissions],
  );

  return { permissions, loading, hasPermission };
}
