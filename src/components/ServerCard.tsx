import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GameServerDto, ServerStatus } from '../types/api';
import { Colors, Radius, Spacing } from '../constants/theme';

const BUSY_STATUSES: ServerStatus[] = ['PULLING_IMAGE', 'AWAITING_UPDATE', 'STOPPING'];

const statusMeta: Record<ServerStatus, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  RUNNING: { label: 'Running', color: Colors.running, icon: 'radio-button-on' },
  STOPPED: { label: 'Stopped', color: Colors.stopped, icon: 'radio-button-off' },
  FAILED: { label: 'Failed', color: Colors.failed, icon: 'alert-circle' },
  PULLING_IMAGE: { label: 'Pulling', color: Colors.pulling, icon: 'cloud-download-outline' },
  AWAITING_UPDATE: { label: 'Updating', color: Colors.awaiting, icon: 'sync-outline' },
  STOPPING: { label: 'Stopping', color: Colors.awaiting, icon: 'time-outline' },
};

interface Props {
  server: GameServerDto;
  onPress: () => void;
  onStartStop: () => void;
  actionLoading?: boolean;
}

export function ServerCard({ server, onPress, onStartStop, actionLoading }: Props) {
  const isBusy = BUSY_STATUSES.includes(server.status) || actionLoading;
  const isRunning = server.status === 'RUNNING';
  const meta = statusMeta[server.status] ?? statusMeta.STOPPED;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Left accent */}
      <View style={[styles.accent, { backgroundColor: meta.color }]} />

      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{server.server_name}</Text>
          <TouchableOpacity
            style={[styles.action, isRunning ? styles.actionStop : styles.actionStart, isBusy && styles.actionDisabled]}
            onPress={onStartStop}
            disabled={isBusy}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {actionLoading ? (
              <ActivityIndicator size={14} color={isRunning ? Colors.failed : Colors.running} />
            ) : (
              <Ionicons
                name={isRunning ? 'stop-circle' : 'play-circle'}
                size={22}
                color={isRunning ? Colors.failed : Colors.running}
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View style={styles.statusRow}>
            {meta.icon && !BUSY_STATUSES.includes(server.status) ? (
              <View style={[styles.statusDot, { backgroundColor: meta.color }]} />
            ) : (
              <ActivityIndicator size={8} color={meta.color} />
            )}
            <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
          </View>
          {server.docker_image_tag && (
            <Text style={styles.tag} numberOfLines={1}>{server.docker_image_tag}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  accent: {
    width: 4,
  },
  body: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  action: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionStart: {
    backgroundColor: 'rgba(52,211,153,0.1)',
  },
  actionStop: {
    backgroundColor: 'rgba(248,113,113,0.1)',
  },
  actionDisabled: {
    opacity: 0.4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tag: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: 'Courier',
  },
});
