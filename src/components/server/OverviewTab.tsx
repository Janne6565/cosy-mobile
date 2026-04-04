import React, { useState } from 'react';
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
import { useServerActions } from '../../hooks/useServerActions';
import { StatusBadge } from '../StatusBadge';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { GameServerDto, ServerStatus } from '../../types/api';

const BUSY_STATUSES: ServerStatus[] = ['PULLING_IMAGE', 'AWAITING_UPDATE', 'STOPPING'];

function formatBytes(bytes: number): string {
  const gb = bytes / 1024 / 1024 / 1024;
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  return `${(bytes / 1024 / 1024).toFixed(0)} MB`;
}

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

export function OverviewTab({ uuid, server }: Props) {
  const { startServer, stopServer } = useServerActions();
  const [actionLoading, setActionLoading] = useState(false);

  const isBusy = BUSY_STATUSES.includes(server.status) || actionLoading;
  const isRunning = server.status === 'RUNNING';

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
      {/* Status + action */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <StatusBadge status={server.status} />
          <TouchableOpacity
            style={[styles.actionBtn, isRunning ? styles.stopBtn : styles.startBtn, isBusy && styles.disabledBtn]}
            onPress={handleStartStop}
            disabled={isBusy}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color={Colors.text} />
            ) : (
              <View style={styles.actionBtnInner}>
                <Ionicons name={isRunning ? 'stop' : 'play'} size={14} color={Colors.text} />
                <Text style={styles.actionBtnText}>{isRunning ? 'Stop' : 'Start'}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Details */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Details</Text>
        <InfoRow label="Owner" value={`${server.owner.username} (${server.owner.role})`} />
        {server.docker_image_name && (
          <InfoRow label="Image" value={`${server.docker_image_name}:${server.docker_image_tag ?? 'latest'}`} />
        )}
        {server.created_on && (
          <InfoRow label="Created" value={new Date(server.created_on).toLocaleDateString()} />
        )}
        {server.timestamp_last_started && (
          <InfoRow label="Last Started" value={new Date(server.timestamp_last_started).toLocaleString()} />
        )}
      </View>

      {/* Resources */}
      {server.docker_hardware_limits && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <InfoRow label="CPU Cores" value={`${server.docker_hardware_limits.docker_max_cpu_cores} cores`} />
          <InfoRow label="Memory" value={formatBytes(server.docker_hardware_limits.docker_memory_limit)} />
        </View>
      )}

      {/* Ports */}
      {server.port_mappings && server.port_mappings.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ports</Text>
          {server.port_mappings.map((p, i) => (
            <InfoRow key={i} label={p.protocol.toUpperCase()} value={`${p.host_port} \u2192 ${p.container_port}`} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.md, gap: Spacing.sm },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 2 },
  infoLabel: { color: Colors.textSecondary, fontSize: 13 },
  infoValue: { color: Colors.text, fontSize: 13, fontFamily: 'Courier', flexShrink: 1, textAlign: 'right', maxWidth: '60%' },
  actionBtn: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  startBtn: { backgroundColor: Colors.running },
  stopBtn: { backgroundColor: Colors.failed },
  disabledBtn: { opacity: 0.5 },
  actionBtnText: { color: Colors.text, fontWeight: '600', fontSize: 13 },
});
