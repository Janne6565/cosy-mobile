import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useActiveInstance } from '../../hooks/useActiveInstance';
import { useServerActions } from '../../hooks/useServerActions';
import { useSubscription } from '../../hooks/useSubscription';
import { serverApi } from '../../api/serverApi';
import { formatBytes } from '../MetricBar';
import { MetricWidget } from './widgets/MetricWidget';
import { LogsWidget } from './widgets/LogsWidget';
import { FreetextWidget } from './widgets/FreetextWidget';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { GameServerDto, MetricPointDto, MetricValues, ServerStatus } from '../../types/api';

const BUSY_STATUSES: ServerStatus[] = ['PULLING_IMAGE', 'AWAITING_UPDATE', 'STOPPING'];

const statusMeta: Record<ServerStatus, { label: string; color: string }> = {
  RUNNING: { label: 'Running', color: Colors.running },
  STOPPED: { label: 'Stopped', color: Colors.stopped },
  FAILED: { label: 'Failed', color: Colors.failed },
  PULLING_IMAGE: { label: 'Pulling Image', color: Colors.pulling },
  AWAITING_UPDATE: { label: 'Updating', color: Colors.awaiting },
  STOPPING: { label: 'Stopping', color: Colors.awaiting },
};

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, mono && styles.mono]}>{value}</Text>
    </View>
  );
}

interface Props {
  uuid: string;
  server: GameServerDto;
}

export function OverviewTab({ uuid, server }: Props) {
  const { startServer, stopServer } = useServerActions();
  const { apiClient } = useActiveInstance();
  const [actionLoading, setActionLoading] = useState(false);
  const [metricValues, setMetricValues] = useState<MetricValues | null>(null);

  const isBusy = BUSY_STATUSES.includes(server.status) || actionLoading;
  const isRunning = server.status === 'RUNNING';
  const meta = statusMeta[server.status] ?? statusMeta.STOPPED;

  const layouts = (server.private_dashboard_layouts ?? []).filter((l) => l.valid !== false);
  const hasMetricWidgets = layouts.some((l) => l.layout_type === 'METRIC');

  useEffect(() => {
    if (!hasMetricWidgets || !apiClient) return;
    serverApi
      .getMetrics(apiClient, uuid)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMetricValues(data[data.length - 1].metric_values);
        }
      })
      .catch(() => {});
  }, [uuid, apiClient, hasMetricWidgets]);

  const handleMetricMessage = useCallback((point: MetricPointDto) => {
    if (point?.metric_values) {
      setMetricValues(point.metric_values);
    }
  }, []);

  useSubscription<MetricPointDto>(
    hasMetricWidgets ? `/topics/game-servers/${uuid}/metrics` : null,
    handleMetricMessage,
  );

  const handleStartStop = () => {
    if (isRunning) {
      Alert.alert('Stop Server', `Stop "${server.server_name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try { await stopServer(uuid); } catch { Alert.alert('Error', 'Failed to stop.'); }
            setActionLoading(false);
          },
        },
      ]);
    } else {
      Alert.alert('Start Server', `Start "${server.server_name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: async () => {
            setActionLoading(true);
            try { await startServer(uuid); } catch { Alert.alert('Error', 'Failed to start.'); }
            setActionLoading(false);
          },
        },
      ]);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero: Status + Action */}
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.statusSection}>
            <View style={[styles.statusIndicator, { backgroundColor: meta.color }]} />
            <Text style={[styles.statusLabel, { color: meta.color }]}>{meta.label}</Text>
          </View>
          <TouchableOpacity
            style={[styles.actionBtn, isRunning ? styles.stopBtn : styles.startBtn, isBusy && styles.disabledBtn]}
            onPress={handleStartStop}
            disabled={isBusy}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name={isRunning ? 'stop' : 'play'} size={14} color="#fff" />
                <Text style={styles.actionBtnText}>{isRunning ? 'Stop' : 'Start'}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Key info inline */}
        <View style={styles.heroInfo}>
          <View style={styles.heroInfoItem}>
            <Text style={styles.heroInfoLabel}>Owner</Text>
            <Text style={styles.heroInfoValue}>{server.owner.username}</Text>
          </View>
          {server.docker_image_tag && (
            <View style={styles.heroInfoItem}>
              <Text style={styles.heroInfoLabel}>Version</Text>
              <Text style={styles.heroInfoValue}>{server.docker_image_tag}</Text>
            </View>
          )}
          {server.docker_hardware_limits && (
            <View style={styles.heroInfoItem}>
              <Text style={styles.heroInfoLabel}>CPU / Mem</Text>
              <Text style={styles.heroInfoValue}>
                {server.docker_hardware_limits.docker_max_cpu_cores}C / {formatBytes(server.docker_hardware_limits.docker_memory_limit)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Details card */}
      <View style={styles.card}>
        {server.docker_image_name && (
          <InfoRow label="Image" value={`${server.docker_image_name}:${server.docker_image_tag ?? 'latest'}`} mono />
        )}
        {server.created_on && (
          <InfoRow label="Created" value={new Date(server.created_on).toLocaleDateString()} />
        )}
        {server.timestamp_last_started && (
          <InfoRow label="Last Started" value={new Date(server.timestamp_last_started).toLocaleString()} />
        )}
        {server.port_mappings && server.port_mappings.length > 0 && (
          <>
            {server.port_mappings.map((p, i) => (
              <InfoRow key={i} label={`Port ${p.protocol.toUpperCase()}`} value={`${p.host_port} \u2192 ${p.container_port}`} mono />
            ))}
          </>
        )}
      </View>

      {/* Dashboard widgets */}
      {layouts.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionTitle}>Dashboard</Text>
            <View style={styles.sectionLine} />
          </View>
          <View style={styles.grid}>
            {layouts.map((layout) => {
              const key = layout.uuid ?? `${layout.layout_type}-${layout.metric_type}`;
              const isSmall = layout.size === 'SMALL';

              switch (layout.layout_type) {
                case 'METRIC':
                  return metricValues ? (
                    <View key={key} style={isSmall ? styles.halfItem : styles.fullItem}>
                      <MetricWidget metricType={layout.metric_type ?? ''} metricValues={metricValues} />
                    </View>
                  ) : null;
                case 'LOGS':
                  return (
                    <View key={key} style={isSmall ? styles.halfItem : styles.fullItem}>
                      <LogsWidget uuid={uuid} />
                    </View>
                  );
                case 'FREETEXT':
                  return (
                    <View key={key} style={isSmall ? styles.halfItem : styles.fullItem}>
                      <FreetextWidget title={layout.title} content={layout.content} />
                    </View>
                  );
                default:
                  return null;
              }
            })}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.md, gap: Spacing.sm },

  // Hero
  hero: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  actionBtn: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    alignItems: 'center',
    gap: 6,
  },
  startBtn: { backgroundColor: Colors.running },
  stopBtn: { backgroundColor: Colors.failed },
  disabledBtn: { opacity: 0.5 },
  actionBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },

  heroInfo: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    gap: Spacing.md,
  },
  heroInfoItem: {
    flex: 1,
    gap: 2,
  },
  heroInfoLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroInfoValue: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '500',
  },

  // Cards
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: { color: Colors.textSecondary, fontSize: 13 },
  infoValue: { color: Colors.text, fontSize: 13, flexShrink: 1, textAlign: 'right', maxWidth: '60%' },
  mono: { fontFamily: 'Courier' },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  sectionLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  halfItem: { width: '48%' },
  fullItem: { width: '100%' },
});
