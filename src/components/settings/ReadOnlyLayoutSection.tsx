import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CollapsibleSection } from './CollapsibleSection';
import { Colors, Radius, Spacing } from '../../constants/theme';

interface LayoutItem {
  uuid?: string;
  size?: string;
  layout_type?: string;
  metric_type?: string;
  title?: string;
}

interface Props {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  layouts?: LayoutItem[];
  hasPermission: boolean;
  enabled?: boolean;
}

export function ReadOnlyLayoutSection({ title, icon, layouts, hasPermission, enabled }: Props) {
  const items = layouts ?? [];

  return (
    <CollapsibleSection
      title={title}
      icon={icon}
      disabled={!hasPermission}
      disabledReason={!hasPermission ? 'No permission' : undefined}
    >
      {enabled !== undefined && (
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status</Text>
          <View style={[styles.statusBadge, enabled ? styles.enabledBadge : styles.disabledBadge]}>
            <Text style={[styles.statusText, enabled ? styles.enabledText : styles.disabledText]}>
              {enabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        </View>
      )}

      {items.length === 0 ? (
        <Text style={styles.emptyText}>No layouts configured</Text>
      ) : (
        items.map((item, i) => (
          <View key={item.uuid ?? i} style={styles.layoutRow}>
            <View style={styles.badges}>
              {item.layout_type && (
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{item.layout_type}</Text>
                </View>
              )}
              {item.size && (
                <View style={styles.sizeBadge}>
                  <Text style={styles.sizeBadgeText}>{item.size}</Text>
                </View>
              )}
            </View>
            <Text style={styles.layoutDetail} numberOfLines={1}>
              {item.metric_type ?? item.title ?? '—'}
            </Text>
          </View>
        ))
      )}

      <Text style={styles.note}>Edit layout on the web dashboard</Text>
    </CollapsibleSection>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  enabledBadge: {
    backgroundColor: Colors.runningBg,
  },
  disabledBadge: {
    backgroundColor: Colors.stoppedBg,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  enabledText: {
    color: Colors.running,
  },
  disabledText: {
    color: Colors.stopped,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: Spacing.sm,
  },
  layoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 4,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: Colors.primaryMuted,
  },
  typeBadgeText: {
    color: Colors.primary,
    fontSize: 9,
    fontWeight: '700',
  },
  sizeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: Colors.surfaceHighlight,
  },
  sizeBadgeText: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: '600',
  },
  layoutDetail: {
    flex: 1,
    color: Colors.text,
    fontSize: 12,
  },
  note: {
    color: Colors.textMuted,
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
