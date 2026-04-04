import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalSearchParams } from 'expo-router';
import { useActiveInstance } from '../../../../src/hooks/useActiveInstance';
import { useServerActions } from '../../../../src/hooks/useServerActions';
import { useServer } from '../../../../src/hooks/useServers';
import { serverApi } from '../../../../src/api/serverApi';
import { LogEntry } from '../../../../src/types/api';
import { LogViewer } from '../../../../src/components/LogViewer';
import { Colors, Radius, Spacing } from '../../../../src/constants/theme';

const HOUR_OPTIONS = [1, 5, 24, 48] as const;
type HourOption = (typeof HOUR_OPTIONS)[number];

export default function LogsAndConsoleScreen() {
  const { uuid } = useGlobalSearchParams<{ uuid: string }>();
  const { apiClient } = useActiveInstance();
  const server = useServer(uuid);
  const { sendCommand } = useServerActions();

  // Logs state
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sinceHours, setSinceHours] = useState<HourOption>(5);

  // Console state
  const [command, setCommand] = useState('');
  const [sending, setSending] = useState(false);

  const fetchLogs = async () => {
    if (!apiClient) return;
    setLoading(true);
    setError(null);
    try {
      const data = await serverApi.getLogs(apiClient, uuid, 500, sinceHours);
      setLogs(data ?? []);
    } catch (e: any) {
      console.error('[logs] error:', e.response?.status, e.response?.data ?? e.message);
      setError('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [uuid, sinceHours, apiClient]);

  const handleSend = async () => {
    const cmd = command.trim();
    if (!cmd) return;

    if (server?.status !== 'RUNNING') {
      Alert.alert('Server Offline', 'The server must be running to send commands.');
      return;
    }

    setCommand('');
    setSending(true);
    try {
      await sendCommand(uuid, cmd);
      // Refresh logs after sending command
      setTimeout(fetchLogs, 1000);
    } catch {
      Alert.alert('Error', 'Failed to send command');
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={120}
    >
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.filters}>
          {HOUR_OPTIONS.map((h) => (
            <TouchableOpacity
              key={h}
              style={[styles.chip, sinceHours === h && styles.chipActive]}
              onPress={() => setSinceHours(h)}
            >
              <Text style={[styles.chipText, sinceHours === h && styles.chipTextActive]}>
                {h}h
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={fetchLogs} style={styles.refreshBtn} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Ionicons name="refresh" size={20} color={Colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Logs */}
      {error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchLogs} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <LogViewer logs={logs} />
      )}

      {/* Command input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={command}
          onChangeText={setCommand}
          placeholder="Send command..."
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          editable={!sending}
        />
        <TouchableOpacity
          style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color={Colors.text} />
          ) : (
            <Ionicons name="arrow-up" size={20} color={Colors.text} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filters: { flexDirection: 'row', gap: Spacing.xs },
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '500' },
  chipTextActive: { color: Colors.text },
  refreshBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  errorText: { color: Colors.error, fontSize: 14 },
  retryBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: Colors.surface, borderRadius: Radius.sm },
  retryText: { color: Colors.primary, fontSize: 14 },
  inputRow: {
    flexDirection: 'row',
    padding: Spacing.sm,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 14,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    fontFamily: 'Courier',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
});
