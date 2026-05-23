import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius } from '../constants/theme';

export function formatBytes(bytes: number): string {
  if (!bytes || !isFinite(bytes)) return '0 B';
  const gb = bytes / 1024 / 1024 / 1024;
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = bytes / 1024 / 1024;
  if (mb >= 1) return `${mb.toFixed(0)} MB`;
  const kb = bytes / 1024;
  if (kb >= 1) return `${kb.toFixed(0)} KB`;
  return `${bytes} B`;
}

interface MetricBarProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  formatValue?: (v: number) => string;
}

export function MetricBar({ label, value, max, unit, formatValue }: MetricBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const color = pct > 85 ? Colors.failed : pct > 60 ? Colors.awaiting : Colors.running;
  const display = formatValue ? formatValue(value) : `${value.toFixed(1)}${unit}`;
  // Ensure the bar is at least visible when value > 0
  const barWidth = pct > 0 && pct < 2 ? 2 : pct;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color }]}>{display}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${barWidth}%` as any, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: Colors.textSecondary, fontSize: 13 },
  value: { fontSize: 13, fontWeight: '600', fontFamily: 'Courier' },
  track: {
    height: 6,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: Radius.full },
});
