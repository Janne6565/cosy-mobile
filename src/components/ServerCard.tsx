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
import { StatusBadge } from './StatusBadge';
import { Colors, Radius, Spacing } from '../constants/theme';

const BUSY_STATUSES: ServerStatus[] = ['PULLING_IMAGE', 'AWAITING_UPDATE', 'STOPPING'];

function getGameIconName(imageName?: string): keyof typeof Ionicons.glyphMap {
  const name = (imageName ?? '').toLowerCase();
  if (name.includes('minecraft')) return 'cube-outline';
  if (name.includes('valheim')) return 'shield-outline';
  if (name.includes('terraria')) return 'leaf-outline';
  if (name.includes('rust')) return 'hammer-outline';
  if (name.includes('ark')) return 'paw-outline';
  if (name.includes('factorio')) return 'construct-outline';
  if (name.includes('palworld')) return 'planet-outline';
  return 'server-outline';
}

interface Props {
  server: GameServerDto;
  onPress: () => void;
  onStartStop: () => void;
  actionLoading?: boolean;
}

export function ServerCard({ server, onPress, onStartStop, actionLoading }: Props) {
  const isBusy = BUSY_STATUSES.includes(server.status) || actionLoading;
  const isRunning = server.status === 'RUNNING';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.left}>
        <Ionicons name={getGameIconName(server.docker_image_name)} size={22} color={Colors.textSecondary} />
      </View>
      <View style={styles.center}>
        <Text style={styles.name} numberOfLines={1}>
          {server.server_name}
        </Text>
        {server.docker_image_name && (
          <Text style={styles.image} numberOfLines={1}>
            {server.docker_image_name}:{server.docker_image_tag ?? 'latest'}
          </Text>
        )}
        <StatusBadge status={server.status} />
      </View>
      <TouchableOpacity
        style={[styles.action, isBusy && styles.actionDisabled]}
        onPress={onStartStop}
        disabled={isBusy}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {actionLoading ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <Ionicons
            name={isRunning ? 'stop' : 'play'}
            size={16}
            color={isRunning ? Colors.error : Colors.running}
          />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  left: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  image: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Courier',
  },
  action: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionDisabled: {
    opacity: 0.4,
  },
});
