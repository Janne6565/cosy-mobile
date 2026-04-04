import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CosyInstance, InstanceAuthState } from '../../types/instance';

interface InstanceState {
  _hasHydrated: boolean;
  instances: CosyInstance[];
  authStates: Record<string, InstanceAuthState>;
  activeInstanceId: string | null;
}

const initialState: InstanceState = {
  _hasHydrated: false,
  instances: [],
  authStates: {},
  activeInstanceId: null,
};

const instanceSlice = createSlice({
  name: 'instance',
  initialState,
  reducers: {
    setHasHydrated: (state, action: PayloadAction<boolean>) => {
      state._hasHydrated = action.payload;
    },
    addInstance: {
      reducer: (state, action: PayloadAction<{ data: Omit<CosyInstance, 'id' | 'isAuthenticated'>; id: string }>) => {
        const { data, id } = action.payload;
        state.instances.push({ ...data, id, isAuthenticated: false });
      },
      prepare: (data: Omit<CosyInstance, 'id' | 'isAuthenticated'>) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        return { payload: { data, id }, meta: { id } };
      },
    },
    removeInstance: (state, action: PayloadAction<string>) => {
      const instanceId = action.payload;
      state.instances = state.instances.filter((i) => i.id !== instanceId);
      delete state.authStates[instanceId];
      if (state.activeInstanceId === instanceId) {
        state.activeInstanceId = state.instances[0]?.id ?? null;
      }
    },
    setActiveInstance: (state, action: PayloadAction<string>) => {
      state.activeInstanceId = action.payload;
    },
    setAuthenticated: (
      state,
      action: PayloadAction<{ instanceId: string; identityToken: string; expiresAt: number }>,
    ) => {
      const { instanceId, identityToken, expiresAt } = action.payload;
      const instance = state.instances.find((i) => i.id === instanceId);
      if (instance) {
        instance.isAuthenticated = true;
      }
      state.authStates[instanceId] = {
        instanceId,
        identityToken,
        identityTokenExpiresAt: expiresAt,
      };
    },
    setUnauthenticated: (state, action: PayloadAction<string>) => {
      const instanceId = action.payload;
      const instance = state.instances.find((i) => i.id === instanceId);
      if (instance) {
        instance.isAuthenticated = false;
      }
      state.authStates[instanceId] = {
        instanceId,
        identityToken: null,
        identityTokenExpiresAt: 0,
      };
    },
    updateUsername: (state, action: PayloadAction<{ instanceId: string; username: string }>) => {
      const { instanceId, username } = action.payload;
      const instance = state.instances.find((i) => i.id === instanceId);
      if (instance) {
        instance.username = username;
      }
    },
  },
});

export const {
  setHasHydrated,
  addInstance,
  removeInstance,
  setActiveInstance,
  setAuthenticated,
  setUnauthenticated,
  updateUsername,
} = instanceSlice.actions;

export default instanceSlice.reducer;
