import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useActiveInstance } from '../../hooks/useActiveInstance';
import { useSubscription } from '../../hooks/useSubscription';
import { serverApi } from '../../api/serverApi';
import { GameServerDto, MetricPointDto } from '../../types/api';
import { MetricBar, formatBytes } from '../MetricBar';
import { MetricWidget } from './widgets/MetricWidget';
import { Colors, Radius, Spacing } from '../../constants/theme';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

interface Props {
  uuid: string;
  server: GameServerDto;
}

export function MetricsTab({ uuid, server }: Props) {
  const { apiClient } = useActiveInstance();
  const [metrics, setMetrics] = useState<MetricPointDto[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    if (!apiClient) return;
    setLoading(true);
    setError(null);
    try {
      const data = await serverApi.getMetrics(apiClient, uuid);
      setMetrics(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error('[metrics] error:', e.response?.status, e.response?.data ?? e.message);
      setError('Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMetrics(); }, [uuid, apiClient]);

  // Live metrics via WebSocket
  const handleMetricMessage = useCallback((point: MetricPointDto) => {
    if (point?.metric_values) {
      setMetrics((prev) => {
        if (!prev) return [point];
        return [...prev, point];
      });
    }
  }, []);

  useSubscription<MetricPointDto>(
    `/topics/game-servers/${uuid}/metrics`,
    handleMetricMessage,
  );

  if (loading && !metrics) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={32} color={Colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchMetrics} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!metrics || metrics.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="analytics-outline" size={32} color={Colors.textMuted} />
        <Text style={styles.emptyText}>No metrics available</Text>
        <Text style={styles.emptySubtext}>Server may be offline or metrics not configured</Text>
      </View>
    );
  }

  const latest = metrics[metrics.length - 1];
  const mv = latest.metric_values;
  const metricLayout = server.metric_layout;
  const hasLayout = metricLayout && metricLayout.length > 0;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {hasLayout ? (
        // Layout-driven rendering
        <View style={styles.grid}>
          {metricLayout.map((entry) => (
            <View
              key={entry.uuid ?? entry.metric_type}
              style={entry.size === 'SMALL' ? styles.halfItem : styles.fullItem}
            >
              <MetricWidget
                metricType={entry.metric_type ?? ''}
                metricValues={mv}
              />
            </View>
          ))}
        </View>
      ) : (
        // Fallback: hardcoded view
        <>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Current Usage</Text>
            {mv.cpu_percent != null && (
              <MetricBar label="CPU" value={mv.cpu_percent} max={100} unit="%" />
            )}
            {mv.memory_percent != null && (
              <MetricBar label="Memory" value={mv.memory_percent} max={100} unit="%" />
            )}
            {mv.memory_usage != null && mv.memory_limit != null && mv.memory_limit > 0 && (
              <MetricBar
                label="Memory (absolute)"
                value={mv.memory_usage}
                max={mv.memory_limit}
                unit=""
                formatValue={(v) => `${formatBytes(v)} / ${formatBytes(mv.memory_limit!)}`}
              />
            )}
          </View>

          {(mv.network_input != null || mv.network_output != null || mv.block_read != null || mv.block_write != null) && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Network & I/O</Text>
              {mv.network_input != null && <InfoRow label="Network In" value={formatBytes(mv.network_input)} />}
              {mv.network_output != null && <InfoRow label="Network Out" value={formatBytes(mv.network_output)} />}
              {mv.block_read != null && <InfoRow label="Block Read" value={formatBytes(mv.block_read)} />}
              {mv.block_write != null && <InfoRow label="Block Write" value={formatBytes(mv.block_write)} />}
            </View>
          )}
        </>
      )}

      {/* Data info */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Data</Text>
        <InfoRow label="Data Points" value={`${metrics.length}`} />
        <InfoRow label="Latest" value={new Date(latest.time).toLocaleTimeString()} />
        <InfoRow label="Oldest" value={new Date(metrics[0].time).toLocaleTimeString()} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: Spacing.md, gap: Spacing.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.xl },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  halfItem: { width: '48%' },
  fullItem: { width: '100%' },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  sectionTitle: { color: Colors.textMuted, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { color: Colors.textSecondary, fontSize: 13 },
  infoValue: { color: Colors.text, fontSize: 13, fontFamily: 'Courier' },
  errorText: { color: Colors.error, fontSize: 14 },
  retryBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: Colors.surface, borderRadius: Radius.sm },
  retryText: { color: Colors.primary, fontSize: 14 },
  emptyText: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  emptySubtext: { color: Colors.textSecondary, fontSize: 13, textAlign: 'center' },
});
