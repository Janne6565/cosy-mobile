import React, { useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { useServers } from '../../../src/hooks/useServers';
import { useServerActions } from '../../../src/hooks/useServerActions';
import { useAppSelector } from '../../../src/redux/hooks';
import { selectActiveInstance } from '../../../src/redux/selectors/instanceSelectors';
import { ServerCard } from '../../../src/components/ServerCard';
import { Colors, Spacing } from '../../../src/constants/theme';

export default function ServerListScreen() {
  const navigation = useNavigation();
  const { servers, isLoading, error, refetch } = useServers();
  const { startServer, stopServer } = useServerActions();
  const instance = useAppSelector(selectActiveInstance);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  useLayoutEffect(() => {
    navigation.setOptions({
      title: instance?.name ?? 'Servers',
      headerRight: () => (
        <TouchableOpacity
          onPress={() => router.push('/(app)/settings')}
          style={{ marginRight: 16 }}
        >
          <Text style={{ color: Colors.primary, fontSize: 14 }}>Instances</Text>
        </TouchableOpacity>
      ),
    });
  }, [instance?.name]);

  const handleStartStop = async (uuid: string, isRunning: boolean) => {
    setActionLoading((s) => ({ ...s, [uuid]: true }));
    try {
      if (isRunning) {
        Alert.alert('Stop Server', 'Are you sure you want to stop this server?', [
          { text: 'Cancel', style: 'cancel', onPress: () => setActionLoading((s) => ({ ...s, [uuid]: false })) },
          {
            text: 'Stop',
            style: 'destructive',
            onPress: async () => {
              try { await stopServer(uuid); } catch { Alert.alert('Error', 'Failed to stop server.'); }
              setActionLoading((s) => ({ ...s, [uuid]: false }));
            },
          },
        ]);
      } else {
        await startServer(uuid);
        setActionLoading((s) => ({ ...s, [uuid]: false }));
      }
    } catch {
      Alert.alert('Error', 'Action failed. Please try again.');
      setActionLoading((s) => ({ ...s, [uuid]: false }));
    }
  };

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isLoading && servers.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No servers found</Text>
        <Text style={styles.emptySubtitle}>You don't have access to any servers on this instance.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={servers}
      keyExtractor={(s) => s.uuid}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refetch}
          tintColor={Colors.primary}
        />
      }
      renderItem={({ item }) => (
        <ServerCard
          server={item}
          onPress={() => router.push(`/(app)/servers/${item.uuid}`)}
          onStartStop={() => handleStartStop(item.uuid, item.status === 'RUNNING')}
          actionLoading={actionLoading[item.uuid]}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: Spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.md },
  errorText: { color: Colors.error, fontSize: 15, textAlign: 'center' },
  retryBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, backgroundColor: Colors.surface, borderRadius: 8 },
  retryText: { color: Colors.primary, fontSize: 14 },
  emptyTitle: { color: Colors.text, fontSize: 17, fontWeight: '600' },
  emptySubtitle: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center' },
});
