import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameServerDto, ServerStatus } from '../../types/api';

interface ServerState {
  servers: Record<string, Record<string, GameServerDto>>;
  loading: Record<string, boolean>;
  error: Record<string, string | null>;
}

const initialState: ServerState = {
  servers: {},
  loading: {},
  error: {},
};

const serverSlice = createSlice({
  name: 'server',
  initialState,
  reducers: {
    setServers: (
      state,
      action: PayloadAction<{ instanceId: string; servers: GameServerDto[] }>,
    ) => {
      const { instanceId, servers } = action.payload;
      state.servers[instanceId] = Object.fromEntries(servers.map((sv) => [sv.uuid, sv]));
    },
    updateServerStatus: (
      state,
      action: PayloadAction<{ instanceId: string; serverUuid: string; status: ServerStatus }>,
    ) => {
      const { instanceId, serverUuid, status } = action.payload;
      const instanceServers = state.servers[instanceId];
      if (instanceServers?.[serverUuid]) {
        instanceServers[serverUuid].status = status;
      }
    },
    clearServers: (state, action: PayloadAction<string>) => {
      const instanceId = action.payload;
      delete state.servers[instanceId];
    },
    setLoading: (state, action: PayloadAction<{ instanceId: string; loading: boolean }>) => {
      const { instanceId, loading } = action.payload;
      state.loading[instanceId] = loading;
    },
    setError: (state, action: PayloadAction<{ instanceId: string; error: string | null }>) => {
      const { instanceId, error } = action.payload;
      state.error[instanceId] = error;
    },
  },
});

export const { setServers, updateServerStatus, clearServers, setLoading, setError } =
  serverSlice.actions;

export default serverSlice.reducer;
