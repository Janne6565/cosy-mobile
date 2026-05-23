import React from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInputProps,
} from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/theme';

interface SettingsTextInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  disabled?: boolean;
}

export function SettingsTextInput({ label, disabled, ...props }: SettingsTextInputProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, disabled && styles.inputDisabled]}
        placeholderTextColor={Colors.textMuted}
        editable={!disabled}
        {...props}
      />
    </View>
  );
}

interface SettingsNumberInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
}

export function SettingsNumberInput({
  label,
  value,
  onChangeText,
  placeholder,
  disabled,
}: SettingsNumberInputProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, disabled && styles.inputDisabled]}
        value={value}
        onChangeText={(text) => onChangeText(text.replace(/[^0-9.]/g, ''))}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        keyboardType="numeric"
        editable={!disabled}
      />
    </View>
  );
}

interface SettingsSwitchProps {
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
}

export function SettingsSwitch({ label, value, onValueChange, disabled }: SettingsSwitchProps) {
  return (
    <View style={styles.switchRow}>
      <Text style={[styles.label, { flex: 1 }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: Colors.surfaceAlt, true: Colors.primaryMuted }}
        thumbColor={value ? Colors.primary : Colors.textSecondary}
      />
    </View>
  );
}

interface SaveCancelBarProps {
  onSave: () => void;
  onCancel: () => void;
  saving?: boolean;
  disabled?: boolean;
}

export function SaveCancelBar({ onSave, onCancel, saving, disabled }: SaveCancelBarProps) {
  return (
    <View style={styles.barRow}>
      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={onCancel}
        disabled={saving}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.saveBtn, (saving || disabled) && styles.saveBtnDisabled]}
        onPress={onSave}
        disabled={saving || disabled}
      >
        {saving ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.saveText}>Save</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldContainer: {
    gap: 4,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.sm,
    color: Colors.text,
    fontSize: 13,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  barRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
  },
  cancelText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
