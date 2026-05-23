import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useActiveInstance } from '../../hooks/useActiveInstance';
import { serverApi } from '../../api/serverApi';
import { GameServerDto, ServerDesign } from '../../types/api';
import { CollapsibleSection } from './CollapsibleSection';
import { SaveCancelBar } from './FormFields';
import { Colors, Radius, Spacing } from '../../constants/theme';
import Toast from 'react-native-toast-message';

const DESIGNS: { value: ServerDesign; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'HOUSE', label: 'House', icon: 'home-outline' },
  { value: 'CASTLE', label: 'Castle', icon: 'shield-outline' },
];

interface Props {
  server: GameServerDto;
  hasPermission: boolean;
}

export function DesignSettingsSection({ server, hasPermission }: Props) {
  const { apiClient } = useActiveInstance();
  const [selected, setSelected] = useState<ServerDesign>(server.design ?? 'HOUSE');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelected(server.design ?? 'HOUSE');
  }, [server.design]);

  const isDirty = selected !== (server.design ?? 'HOUSE');

  const handleSave = async () => {
    if (!apiClient) return;
    setSaving(true);
    try {
      await serverApi.updateDesign(apiClient, server.uuid, selected);
      Toast.show({ type: 'success', text1: 'Design updated' });
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error ?? 'Failed to update design');
    } finally {
      setSaving(false);
    }
  };

  return (
    <CollapsibleSection
      title="Design"
      icon="color-palette-outline"
      disabled={!hasPermission}
      disabledReason={!hasPermission ? 'No permission' : undefined}
    >
      <View style={styles.options}>
        {DESIGNS.map((d) => {
          const active = selected === d.value;
          return (
            <TouchableOpacity
              key={d.value}
              style={[styles.option, active && styles.optionActive]}
              onPress={() => setSelected(d.value)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={d.icon}
                size={24}
                color={active ? Colors.primary : Colors.textMuted}
              />
              <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                {d.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isDirty && (
        <SaveCancelBar
          onSave={handleSave}
          onCancel={() => setSelected(server.design ?? 'HOUSE')}
          saving={saving}
        />
      )}
    </CollapsibleSection>
  );
}

const styles = StyleSheet.create({
  options: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceAlt,
    gap: 6,
  },
  optionActive: {
    backgroundColor: Colors.primaryMuted,
  },
  optionLabel: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  optionLabelActive: {
    color: Colors.primary,
  },
});
