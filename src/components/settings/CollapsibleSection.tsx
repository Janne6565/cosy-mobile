import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../../constants/theme';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface Props {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  disabledReason?: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export function CollapsibleSection({
  title,
  icon,
  disabled,
  disabledReason,
  defaultExpanded = false,
  children,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggle = () => {
    if (disabled) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggle}
        activeOpacity={disabled ? 1 : 0.7}
      >
        <View style={styles.headerLeft}>
          <Ionicons
            name={icon}
            size={18}
            color={disabled ? Colors.textMuted : Colors.primary}
          />
          <Text style={[styles.title, disabled && styles.titleDisabled]}>
            {title}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {disabled && disabledReason ? (
            <Text style={styles.disabledText}>{disabledReason}</Text>
          ) : null}
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={disabled ? Colors.textMuted : Colors.textSecondary}
          />
        </View>
      </TouchableOpacity>
      {expanded && !disabled && (
        <View style={styles.body}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  titleDisabled: {
    color: Colors.textMuted,
  },
  disabledText: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  body: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
});
