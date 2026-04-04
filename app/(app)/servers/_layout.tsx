import { Stack } from 'expo-router';
import { Colors } from '../../../src/constants/theme';

export default function ServersLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: true }} />
      <Stack.Screen name="[uuid]" options={{ headerShown: false }} />
    </Stack>
  );
}
