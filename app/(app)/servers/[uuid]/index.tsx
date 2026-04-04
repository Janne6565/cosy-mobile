import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useGlobalSearchParams, useNavigation } from 'expo-router';
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
  { key: 'logs', label: 'Logs & Console', icon: 'terminal-outline' },
  { key: 'metrics', label: 'Metrics', icon: 'stats-chart-outline' },
];

export default function ServerDetailScreen() {
  const { uuid } = useGlobalSearchParams<{ uuid: string }>();
  const server = useServer(uuid);
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerStyle: { backgroundColor: Colors.surface },
      headerTintColor: Colors.text,
      headerTitleStyle: { fontWeight: '600', fontSize: 16 },
      title: server?.server_name ?? 'Server',
    });
  }, [server?.server_name]);

  if (!server) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Segmented control */}
      <View style={styles.segmentBar}>
        <View style={styles.segmentContainer}>
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.segment, active && styles.segmentActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={tab.icon}
                  size={14}
                  color={active ? Colors.text : Colors.textMuted}
                />
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Tab content */}
      <View style={styles.content}>
        {activeTab === 'overview' && <OverviewTab uuid={uuid} server={server} />}
        {activeTab === 'logs' && <LogsConsoleTab uuid={uuid} />}
        {activeTab === 'metrics' && <MetricsTab uuid={uuid} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  segmentBar: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingTop: 6,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.sm,
    padding: 3,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: Radius.sm - 1,
    gap: 4,
  },
  segmentActive: {
    backgroundColor: Colors.primary,
  },
  segmentText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: Colors.text,
  },
  content: { flex: 1 },
});
