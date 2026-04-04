import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { GameServerDto } from '../../types/api';

export const selectAllServers = (state: RootState) => state.server.servers;
export const selectLoading = (state: RootState) => state.server.loading;
export const selectError = (state: RootState) => state.server.error;

// Create a cache for memoized selectors by instanceId
type ServerSelector = (state: RootState) => GameServerDto[];
const serversByInstanceCache = new Map<string, ServerSelector>();

export const selectServersByInstance = (instanceId: string): ServerSelector => {
  if (!serversByInstanceCache.has(instanceId)) {
    const selector = createSelector(
      [(state: RootState) => state.server.servers[instanceId]],
      (instanceServers): GameServerDto[] => Object.values(instanceServers ?? {}),
    );
    serversByInstanceCache.set(instanceId, selector);
  }
  return serversByInstanceCache.get(instanceId)!;
};

// Simple lookup - no memoization needed
export const selectServerByUuid = (instanceId: string, uuid: string) => (state: RootState): GameServerDto | undefined => {
  return state.server.servers[instanceId]?.[uuid];
};

// Simple lookup - no memoization needed
export const selectInstanceLoading = (instanceId: string) => (state: RootState): boolean => {
  return state.server.loading[instanceId] ?? false;
};

// Simple lookup - no memoization needed
export const selectInstanceError = (instanceId: string) => (state: RootState): string | null => {
  return state.server.error[instanceId] ?? null;
};
