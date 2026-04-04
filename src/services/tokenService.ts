import * as SecureStore from 'expo-secure-store';

const key = (instanceId: string) => `cosy_rt_${instanceId}`;

export const tokenService = {
  saveRefreshToken: (instanceId: string, token: string) =>
    SecureStore.setItemAsync(key(instanceId), token),

  getRefreshToken: (instanceId: string) =>
    SecureStore.getItemAsync(key(instanceId)),

  deleteRefreshToken: (instanceId: string) =>
    SecureStore.deleteItemAsync(key(instanceId)),
};
