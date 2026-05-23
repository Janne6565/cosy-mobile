import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../../constants/theme';

interface Props<T> {
  items: T[];
  onChange: (items: T[]) => void;
  renderRow: (item: T, index: number, update: (val: T) => void) => React.ReactNode;
  createItem: () => T;
  addLabel?: string;
  disabled?: boolean;
}

export function ArrayEditor<T>({
  items,
  onChange,
  renderRow,
  createItem,
  addLabel = '+ Add',
  disabled,
}: Props<T>) {
  const handleUpdate = (index: number, val: T) => {
    const next = [...items];
    next[index] = val;
    onChange(next);
  };

  const handleDelete = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    onChange([...items, createItem()]);
  };

  return (
    <View style={styles.container}>
      {items.map((item, i) => (
        <View key={i} style={styles.row}>
          <View style={styles.rowContent}>
            {renderRow(item, i, (val) => handleUpdate(i, val))}
          </View>
          {!disabled && (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDelete(i)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color={Colors.failed} />
            </TouchableOpacity>
          )}
        </View>
      ))}
      {!disabled && (
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Text style={styles.addText}>{addLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  rowContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  deleteBtn: {
    padding: 2,
  },
  addBtn: {
    paddingVertical: 10,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
  },
  addText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '500',
  },
});
