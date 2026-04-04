import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { store } from '../src/redux/store';
import { useAppDispatch, useAppSelector } from '../src/redux/hooks';
import { selectHasHydrated } from '../src/redux/selectors/instanceSelectors';
import { setActiveInstance } from '../src/redux/slices/instanceSlice';
import { refreshIdentityToken } from '../src/api/authApi';
import { Colors } from '../src/constants/theme';

export default function IndexScreen() {
  const hasHydrated = useAppSelector(selectHasHydrated);
  const dispatch = useAppDispatch();
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    if (!hasHydrated || navigating) return;

    async function init() {
      setNavigating(true);

      const state = store.getState();
      const instances = state.instance.instances;
      const activeInstanceId = state.instance.activeInstanceId;

      if (instances.length === 0) {
        router.replace('/instances');
        return;
      }

      const targetId = activeInstanceId ?? instances[0].id;
      dispatch(setActiveInstance(targetId));

      const targetInstance = instances.find((i) => i.id === targetId);
      if (!targetInstance) {
        router.replace('/instances');
        return;
      }

      const token = await refreshIdentityToken(targetId, targetInstance.baseUrl);
      if (token) {
        router.replace('/(app)/servers');
      } else {
        router.replace({ pathname: '/(auth)/login', params: { instanceId: targetId } });
      }
    }

    init();
  }, [hasHydrated]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
