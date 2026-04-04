import { AxiosInstance } from 'axios';
import { GameServerDto, LogEntry, MetricPointDto, PermissionDto, ServerStatusDto } from '../types/api';

export const serverApi = {
  listServers: (client: AxiosInstance): Promise<GameServerDto[]> =>
    client.get('/game-server').then((r) => r.data),

  getServer: (client: AxiosInstance, uuid: string): Promise<GameServerDto> =>
    client.get(`/game-server/${uuid}`).then((r) => r.data),

  getStatus: (client: AxiosInstance, uuid: string): Promise<ServerStatusDto> =>
    client.get(`/game-server/${uuid}/status`).then((r) => r.data),

  startServer: (client: AxiosInstance, uuid: string): Promise<void> =>
    client.post(`/game-server/${uuid}/start`),

  stopServer: (client: AxiosInstance, uuid: string): Promise<void> =>
    client.post(`/game-server/${uuid}/stop`),

  sendCommand: (client: AxiosInstance, uuid: string, command: string): Promise<void> =>
    client.post(`/game-server/${uuid}/send-command`, { command }),

  getLogs: (
    client: AxiosInstance,
    uuid: string,
    limit = 500,
    sinceHours = 5,
  ): Promise<LogEntry[]> =>
    client
      .get(`/game-server/${uuid}/logs`, { params: { limit, sinceHours } })
      .then((r) => r.data),

  getMetrics: (
    client: AxiosInstance,
    uuid: string,
    start?: string,
    end?: string,
  ): Promise<MetricPointDto[]> =>
    client
      .get(`/game-server/${uuid}/metrics`, { params: { start, end, pointCount: 60 } })
      .then((r) => r.data),

  getPermissions: (client: AxiosInstance, uuid: string): Promise<PermissionDto[]> =>
    client.get(`/game-server/${uuid}/permissions`).then((r) => r.data),
};
