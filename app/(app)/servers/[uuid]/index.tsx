import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useGlobalSearchParams, useNavigation, router } from 'expo-router';
import { useLayoutEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useServer } from '../../../../src/hooks/useServers';
import { OverviewTab } from '../../../../src/components/server/OverviewTab';
import { LogsConsoleTab } from '../../../../src/components/server/LogsConsoleTab';
import { MetricsTab } from '../../../../src/components/server/MetricsTab';
import { Colors, Radius, Spacing } from '../../../../src/constants/theme';

type Tab = 'overview' | 'logs' | 'metrics';

const TABS: { key: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'overview', label: 'Overview', icon: 'grid-outline' },
  { key: 'logs', label: 'Console', icon: 'terminal-outline' },
  { key: 'metrics', label: 'Metrics', icon: 'bar-chart-outline' },
];

export default function ServerDetailScreen() {
  const { uuid } = useGlobalSearchParams<{ uuid: string }>();
  const server = useServer(uuid);
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerStyle: { backgroundColor: Colors.background },
      headerTintColor: Colors.text,
      headerTitleStyle: { fontWeight: '600', fontSize: 16 },
      title: server?.server_name ?? 'Server',
      headerShadowVisible: false,
      headerRight: () => (
        <TouchableOpacity
          onPress={() => router.push(`/(app)/servers/${uuid}/settings`)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{ marginRight: 4 }}
        >
          <Ionicons name="settings-outline" size={22} color={Colors.text} />
        </TouchableOpacity>
      ),
    });
  }, [server?.server_name, uuid]);

  if (!server) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={active ? (tab.icon.replace('-outline', '') as keyof typeof Ionicons.glyphMap) : tab.icon}
                size={16}
                color={active ? Colors.primary : Colors.textMuted}
              />
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab content */}
      <View style={styles.content}>
        {activeTab === 'overview' && <OverviewTab uuid={uuid} server={server} />}
        {activeTab === 'logs' && <LogsConsoleTab uuid={uuid} />}
        {activeTab === 'metrics' && <MetricsTab uuid={uuid} server={server} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: 6,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Radius.sm,
    gap: 6,
    backgroundColor: Colors.surface,
  },
  tabActive: {
    backgroundColor: Colors.primaryMuted,
  },
  tabText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: Colors.primary,
  },
  content: { flex: 1 },
});
