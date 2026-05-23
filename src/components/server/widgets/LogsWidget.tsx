import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useActiveInstance } from '../../../hooks/useActiveInstance';
import { useSubscription } from '../../../hooks/useSubscription';
import { serverApi } from '../../../api/serverApi';
import { LogEntry } from '../../../types/api';
import { Colors, Radius, Spacing } from '../../../constants/theme';

type LogLevel = 'error' | 'warn' | 'info';

function getLogLevel(message: string): LogLevel {
  const m = message.toLowerCase();
  if (m.includes('error') || m.includes('fatal') || m.includes('exception')) return 'error';
  if (m.includes('warn')) return 'warn';
  return 'info';
}

const levelColors: Record<LogLevel, { text: string; accent: string }> = {
  error: { text: '#fca5a5', accent: Colors.error },
  warn: { text: '#fcd34d', accent: Colors.warning },
  info: { text: '#c4c4d4', accent: 'transparent' },
};

function formatTime(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return timestamp?.slice(11, 19) ?? '';
  }
}

interface Props {
  uuid: string;
}

export function LogsWidget({ uuid }: Props) {
  const { apiClient } = useActiveInstance();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!apiClient) return;
    setLoading(true);
    serverApi
      .getLogs(apiClient, uuid, 50, 1)
      .then((data) => {
        const entries = data ?? [];
        entries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        setLogs(entries);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [uuid, apiClient]);

  const handleLogMessage = useCallback((entry: LogEntry) => {
    if (entry?.message) {
      setLogs((prev) => [...prev.slice(-99), entry]);
    }
  }, []);

  useSubscription<LogEntry>(
    `/topics/game-servers/${uuid}/logs`,
    handleLogMessage,
  );

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Logs</Text>
      <View style={styles.logContainer}>
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={styles.loader} />
        ) : logs.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No logs available</Text>
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
            nestedScrollEnabled
          >
            {logs.map((item, i) => {
              const level = getLogLevel(item.message);
              const colors = levelColors[level];
              return (
                <View key={i} style={styles.row}>
                  <View style={[styles.levelBar, { backgroundColor: colors.accent }]} />
                  <View style={styles.rowContent}>
                    <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
                    <Text style={[styles.message, { color: colors.text }]}>{item.message}</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  logContainer: {
    height: 200,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  loader: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: Colors.textMuted, fontSize: 13 },
  scroll: { flex: 1, backgroundColor: '#0a0a10' },
  row: { flexDirection: 'row' },
  levelBar: { width: 3, borderRadius: 1.5, marginVertical: 2 },
  rowContent: { flex: 1, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  timestamp: { color: '#6366f1', fontSize: 10, fontFamily: 'Courier', marginBottom: 1, opacity: 0.8 },
  message: { fontSize: 11.5, fontFamily: 'Courier', lineHeight: 16 },
});
