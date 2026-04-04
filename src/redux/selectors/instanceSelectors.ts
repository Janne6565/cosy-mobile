import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { CosyInstance } from '../../types/instance';

export const selectInstances = (state: RootState) => state.instance.instances;
export const selectActiveInstanceId = (state: RootState) => state.instance.activeInstanceId;
export const selectAuthStates = (state: RootState) => state.instance.authStates;
export const selectHasHydrated = (state: RootState) => state.instance._hasHydrated;

// Memoized - finds item in array
export const selectActiveInstance = createSelector(
  [selectInstances, selectActiveInstanceId],
  (instances, activeInstanceId): CosyInstance | undefined => {
    return instances.find((i) => i.id === activeInstanceId);
  },
);

// Simple lookup - no memoization needed
export const selectIdentityToken = (instanceId: string) => (state: RootState): string | null => {
  return state.instance.authStates[instanceId]?.identityToken ?? null;
};

// Simple lookup with logic - no memoization needed
export const selectIsTokenExpired = (instanceId: string) => (state: RootState): boolean => {
  const authState = state.instance.authStates[instanceId];
  if (!authState?.identityToken) return true;
  return Date.now() >= authState.identityTokenExpiresAt;
};
