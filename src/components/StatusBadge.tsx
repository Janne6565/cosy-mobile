import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ServerStatus } from '../types/api';
import { Colors, Radius, Spacing } from '../constants/theme';

const statusConfig: Record<
  ServerStatus,
  { label: string; color: string; bg: string; spinner?: boolean }
> = {
  RUNNING: { label: 'Running', color: Colors.running, bg: Colors.runningBg },
  STOPPED: { label: 'Stopped', color: Colors.stopped, bg: Colors.stoppedBg },
  FAILED: { label: 'Failed', color: Colors.failed, bg: Colors.failedBg },
  PULLING_IMAGE: {
    label: 'Pulling',
    color: Colors.pulling,
    bg: Colors.pullingBg,
    spinner: true,
  },
  AWAITING_UPDATE: {
    label: 'Updating',
    color: Colors.awaiting,
    bg: Colors.awaitingBg,
    spinner: true,
  },
  STOPPING: { label: 'Stopping', color: Colors.awaiting, bg: Colors.awaitingBg, spinner: true },
};

interface Props {
  status: ServerStatus;
}

export function StatusBadge({ status }: Props) {
  const config = statusConfig[status] ?? statusConfig.STOPPED;
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      {config.spinner ? (
        <ActivityIndicator size={10} color={config.color} style={styles.spinner} />
      ) : (
        <View style={[styles.dot, { backgroundColor: config.color }]} />
      )}
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    gap: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: Radius.full,
  },
  spinner: {
    width: 10,
    height: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
