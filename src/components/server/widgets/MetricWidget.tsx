import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MetricBar } from '../../MetricBar';
import { MetricValues } from '../../../types/api';
import { getMetricBarProps } from '../../../utils/metricMapping';
import { Colors, Radius, Spacing } from '../../../constants/theme';

interface Props {
  metricType: string;
  metricValues: MetricValues;
}

export function MetricWidget({ metricType, metricValues }: Props) {
  const config = getMetricBarProps(metricType, metricValues);
  if (!config) return null;

  return (
    <View style={styles.card}>
      {config.showBar ? (
        <MetricBar
          label={config.label}
          value={config.value}
          max={config.max}
          unit={config.unit}
          formatValue={config.formatValue}
        />
      ) : (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{config.label}</Text>
          <Text style={styles.infoValue}>
            {config.formatValue ? config.formatValue(config.value) : `${config.value.toFixed(1)}${config.unit}`}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { color: Colors.textSecondary, fontSize: 13 },
  infoValue: { color: Colors.text, fontSize: 13, fontFamily: 'Courier' },
});
