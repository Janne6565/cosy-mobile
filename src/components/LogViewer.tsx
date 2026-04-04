import React, { useRef } from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';
import { LogEntry } from '../types/api';
import { Colors, Radius, Spacing } from '../constants/theme';

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
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return timestamp?.slice(11, 19) ?? '';
  }
}

interface Props {
  logs: LogEntry[];
}

export function LogViewer({ logs }: Props) {
  const listRef = useRef<FlatList>(null);

  if (logs.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No logs available</Text>
      </View>
    );
  }

  return (
    <FlatList
      ref={listRef}
      data={logs}
      keyExtractor={(_, i) => String(i)}
      renderItem={({ item }) => {
        const level = getLogLevel(item.message);
        const colors = levelColors[level];
        return (
          <View style={styles.row}>
            <View style={[styles.levelBar, { backgroundColor: colors.accent }]} />
            <View style={styles.rowContent}>
              <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
              <Text style={[styles.message, { color: colors.text }]}>
                {item.message}
              </Text>
            </View>
          </View>
        );
      }}
      onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
      style={styles.list}
      contentContainerStyle={styles.content}
      initialNumToRender={50}
      maxToRenderPerBatch={30}
      windowSize={10}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: '#0a0a10',
  },
  content: {
    paddingVertical: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
  },
  levelBar: {
    width: 3,
    borderRadius: 1.5,
    marginVertical: 2,
  },
  rowContent: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  timestamp: {
    color: '#6366f1',
    fontSize: 10,
    fontFamily: 'Courier',
    marginBottom: 1,
    opacity: 0.8,
  },
  message: {
    fontSize: 11.5,
    fontFamily: 'Courier',
    lineHeight: 16,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginLeft: 3,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
});
