import { Stack, useGlobalSearchParams } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useLayoutEffect } from 'react';
import { Colors } from '../../../../src/constants/theme';
import { useServer } from '../../../../src/hooks/useServers';

export default function ServerDetailLayout() {
  const { uuid } = useGlobalSearchParams<{ uuid: string }>();
  const server = useServer(uuid);
  const nav = useNavigation();
  // The parent of this Stack is the servers Stack, whose parent is the (app) Tabs
  const tabNav = nav.getParent()?.getParent();

  // Hide the parent (Servers/Settings) tab bar when viewing server details
  useLayoutEffect(() => {
    tabNav?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => {
      tabNav?.setOptions({
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
        },
      });
    };
  }, [tabNav]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: server?.server_name ?? 'Server' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
    </Stack>
  );
}
