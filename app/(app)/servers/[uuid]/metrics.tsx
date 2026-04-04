import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useGlobalSearchParams } from 'expo-router';
import { useActiveInstance } from '../../../../src/hooks/useActiveInstance';
import { serverApi } from '../../../../src/api/serverApi';
import { MetricPointDto } from '../../../../src/types/api';
import { Colors, Radius, Spacing } from '../../../../src/constants/theme';

function formatBytes(bytes: number): string {
  const gb = bytes / 1024 / 1024 / 1024;
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = bytes / 1024 / 1024;
  if (mb >= 1) return `${mb.toFixed(0)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function MetricBar({ label, value, max, unit, formatValue }: {
  label: string;
  value: number;
  max: number;
  unit: string;
  formatValue?: (v: number) => string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const color = pct > 85 ? Colors.failed : pct > 60 ? Colors.awaiting : Colors.running;
  const display = formatValue ? formatValue(value) : `${value.toFixed(1)}${unit}`;

  return (
    <View style={barStyles.container}>
      <View style={barStyles.header}>
        <Text style={barStyles.label}>{label}</Text>
        <Text style={[barStyles.value, { color }]}>{display}</Text>
      </View>
      <View style={barStyles.track}>
        <View style={[barStyles.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: { gap: 6 },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: Colors.textSecondary, fontSize: 13 },
  value: { fontSize: 13, fontWeight: '600', fontFamily: 'Courier' },
  track: {
    height: 8,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: Radius.full },
});

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function MetricsScreen() {
  const { uuid } = useGlobalSearchParams<{ uuid: string }>();
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
        <Text style={styles.emptyText}>No metrics available</Text>
        <Text style={styles.emptySubtext}>Server may be offline or metrics not configured</Text>
      </View>
    );
  }

  const latest = metrics[metrics.length - 1];
  const mv = latest.metric_values;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Resource usage bars */}
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

      {/* Network & I/O */}
      {(mv.network_input != null || mv.network_output != null || mv.block_read != null || mv.block_write != null) && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Network & I/O</Text>
          {mv.network_input != null && (
            <InfoRow label="Network In" value={formatBytes(mv.network_input)} />
          )}
          {mv.network_output != null && (
            <InfoRow label="Network Out" value={formatBytes(mv.network_output)} />
          )}
          {mv.block_read != null && (
            <InfoRow label="Block Read" value={formatBytes(mv.block_read)} />
          )}
          {mv.block_write != null && (
            <InfoRow label="Block Write" value={formatBytes(mv.block_write)} />
          )}
        </View>
      )}

      {/* Data points info */}
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
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, gap: Spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.xl },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  sectionTitle: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { color: Colors.textSecondary, fontSize: 14 },
  infoValue: { color: Colors.text, fontSize: 14, fontFamily: 'Courier' },
  errorText: { color: Colors.error, fontSize: 14 },
  retryBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: Colors.surface, borderRadius: Radius.sm },
  retryText: { color: Colors.primary, fontSize: 14 },
  emptyText: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  emptySubtext: { color: Colors.textSecondary, fontSize: 13, textAlign: 'center' },
});
