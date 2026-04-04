import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CosyInstance } from '../types/instance';
import { Colors, Radius, Spacing } from '../constants/theme';

interface Props {
  instance: CosyInstance;
  isActive: boolean;
  onPress: () => void;
  onDelete: () => void;
}

export function InstanceCard({ instance, isActive, onPress, onDelete }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, isActive && styles.active]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.left}>
        <View style={[styles.dot, { backgroundColor: isActive ? Colors.running : Colors.stopped }]} />
      </View>
      <View style={styles.center}>
        <Text style={styles.name}>{instance.name}</Text>
        <Text style={styles.url} numberOfLines={1}>
          {instance.baseUrl}
        </Text>
        <View style={styles.userRow}>
          {instance.isAuthenticated ? (
            <>
              <Ionicons name="checkmark-circle" size={12} color={Colors.running} />
              <Text style={styles.user}>{instance.username}</Text>
            </>
          ) : (
            <Text style={styles.user}>Not logged in</Text>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={onDelete}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close" size={16} color={Colors.textMuted} />
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
  active: {
    borderColor: Colors.primary,
  },
  left: {
    paddingTop: 2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
  },
  center: {
    flex: 1,
    gap: 3,
  },
  name: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  url: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Courier',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  user: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  deleteBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
