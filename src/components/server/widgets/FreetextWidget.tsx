import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { KeyValueEntry } from '../../../types/api';
import { Colors, Radius, Spacing } from '../../../constants/theme';

interface Props {
  title?: string;
  content?: KeyValueEntry[];
}

export function FreetextWidget({ title, content }: Props) {
  return (
    <View style={styles.card}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {content?.map((entry, i) => (
        <View key={i} style={styles.entry}>
          <Text style={styles.entryKey}>{entry.key}</Text>
          <Text style={styles.entryValue}>{entry.value}</Text>
        </View>
      ))}
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
  title: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  entry: {
    gap: 2,
  },
  entryKey: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: Colors.surfaceAlt,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderTopLeftRadius: Radius.sm,
    borderTopRightRadius: Radius.sm,
    overflow: 'hidden',
  },
  entryValue: {
    color: Colors.text,
    fontSize: 14,
    backgroundColor: Colors.surfaceAlt,
    borderBottomLeftRadius: Radius.sm,
    borderBottomRightRadius: Radius.sm,
    borderTopRightRadius: Radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 4,
    overflow: 'hidden',
  },
});
