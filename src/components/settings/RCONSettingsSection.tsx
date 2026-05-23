import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useActiveInstance } from '../../hooks/useActiveInstance';
import { serverApi } from '../../api/serverApi';
import { GameServerDto } from '../../types/api';
import { CollapsibleSection } from './CollapsibleSection';
import { SettingsTextInput, SettingsNumberInput, SettingsSwitch, SaveCancelBar } from './FormFields';
import Toast from 'react-native-toast-message';

interface Props {
  server: GameServerDto;
  hasPermission: boolean;
}

export function RCONSettingsSection({ server, hasPermission }: Props) {
  const { apiClient } = useActiveInstance();
  const rcon = server.rcon_configuration;

  const [enabled, setEnabled] = useState(rcon?.enabled ?? false);
  const [port, setPort] = useState(rcon?.port?.toString() ?? '');
  const [password, setPassword] = useState(rcon?.password ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEnabled(rcon?.enabled ?? false);
    setPort(rcon?.port?.toString() ?? '');
    setPassword(rcon?.password ?? '');
  }, [rcon?.enabled, rcon?.port, rcon?.password]);

  const isDirty =
    enabled !== (rcon?.enabled ?? false) ||
    port !== (rcon?.port?.toString() ?? '') ||
    password !== (rcon?.password ?? '');

  const resetForm = () => {
    setEnabled(rcon?.enabled ?? false);
    setPort(rcon?.port?.toString() ?? '');
    setPassword(rcon?.password ?? '');
  };

  const handleSave = async () => {
    if (!apiClient) return;
    if (enabled) {
      const portNum = parseInt(port, 10);
      if (!portNum || portNum < 1 || portNum > 65535) {
        Alert.alert('Validation', 'Port must be between 1 and 65535.');
        return;
      }
      if (!password.trim()) {
        Alert.alert('Validation', 'Password is required when RCON is enabled.');
        return;
      }
    }
    setSaving(true);
    try {
      await serverApi.updateRCON(apiClient, server.uuid, {
        enabled,
        ...(port ? { port: parseInt(port, 10) } : {}),
        password,
      });
      Toast.show({ type: 'success', text1: 'RCON settings saved' });
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error ?? 'Failed to save RCON settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <CollapsibleSection
      title="RCON"
      icon="terminal-outline"
      disabled={!hasPermission}
      disabledReason={!hasPermission ? 'No permission' : undefined}
    >
      <SettingsSwitch
        label="Enable RCON"
        value={enabled}
        onValueChange={setEnabled}
      />

      {enabled && (
        <>
          <SettingsNumberInput
            label="Port"
            value={port}
            onChangeText={setPort}
            placeholder="25575"
          />
          <SettingsTextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="RCON password"
            secureTextEntry
            autoCapitalize="none"
          />
        </>
      )}

      {isDirty && (
        <SaveCancelBar onSave={handleSave} onCancel={resetForm} saving={saving} />
      )}
    </CollapsibleSection>
  );
}
