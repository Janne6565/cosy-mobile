import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useActiveInstance } from '../../hooks/useActiveInstance';
import { serverApi } from '../../api/serverApi';
import { GameServerDto, GameServerUpdateDto, PortMapping, VolumeMountDto } from '../../types/api';
import { CollapsibleSection } from './CollapsibleSection';
import { SettingsTextInput, SettingsNumberInput, SaveCancelBar } from './FormFields';
import { ArrayEditor } from './ArrayEditor';
import { Colors, Radius, Spacing } from '../../constants/theme';
import Toast from 'react-native-toast-message';

interface Props {
  server: GameServerDto;
  hasPermission: boolean;
}

export function GeneralSettingsSection({ server, hasPermission }: Props) {
  const { apiClient } = useActiveInstance();
  const [saving, setSaving] = useState(false);

  const [serverName, setServerName] = useState(server.server_name);
  const [imageName, setImageName] = useState(server.docker_image_name ?? '');
  const [imageTag, setImageTag] = useState(server.docker_image_tag ?? '');
  const [cpuCores, setCpuCores] = useState(
    server.docker_hardware_limits?.docker_max_cpu_cores?.toString() ?? '',
  );
  const [memoryLimit, setMemoryLimit] = useState(
    server.docker_hardware_limits?.docker_memory_limit?.toString() ?? '',
  );
  const [ports, setPorts] = useState<PortMapping[]>(server.port_mappings ?? []);
  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>(
    server.environment_variables ?? [],
  );
  const [execCmd, setExecCmd] = useState<string[]>(server.execution_command ?? []);
  const [volumes, setVolumes] = useState<VolumeMountDto[]>(server.volume_mounts ?? []);

  useEffect(() => {
    setServerName(server.server_name);
    setImageName(server.docker_image_name ?? '');
    setImageTag(server.docker_image_tag ?? '');
    setCpuCores(server.docker_hardware_limits?.docker_max_cpu_cores?.toString() ?? '');
    setMemoryLimit(server.docker_hardware_limits?.docker_memory_limit?.toString() ?? '');
    setPorts(server.port_mappings ?? []);
    setEnvVars(server.environment_variables ?? []);
    setExecCmd(server.execution_command ?? []);
    setVolumes(server.volume_mounts ?? []);
  }, [server]);

  const isServerActive = server.status !== 'STOPPED';
  const disabled = !hasPermission || isServerActive;

  const isDirty =
    serverName !== server.server_name ||
    imageName !== (server.docker_image_name ?? '') ||
    imageTag !== (server.docker_image_tag ?? '') ||
    cpuCores !== (server.docker_hardware_limits?.docker_max_cpu_cores?.toString() ?? '') ||
    memoryLimit !== (server.docker_hardware_limits?.docker_memory_limit?.toString() ?? '') ||
    JSON.stringify(ports) !== JSON.stringify(server.port_mappings ?? []) ||
    JSON.stringify(envVars) !== JSON.stringify(server.environment_variables ?? []) ||
    JSON.stringify(execCmd) !== JSON.stringify(server.execution_command ?? []) ||
    JSON.stringify(volumes) !== JSON.stringify(server.volume_mounts ?? []);

  const resetForm = () => {
    setServerName(server.server_name);
    setImageName(server.docker_image_name ?? '');
    setImageTag(server.docker_image_tag ?? '');
    setCpuCores(server.docker_hardware_limits?.docker_max_cpu_cores?.toString() ?? '');
    setMemoryLimit(server.docker_hardware_limits?.docker_memory_limit?.toString() ?? '');
    setPorts(server.port_mappings ?? []);
    setEnvVars(server.environment_variables ?? []);
    setExecCmd(server.execution_command ?? []);
    setVolumes(server.volume_mounts ?? []);
  };

  const handleSave = async () => {
    if (!apiClient || !serverName.trim() || !imageName.trim() || !imageTag.trim()) {
      Alert.alert('Validation', 'Server name, image name, and image tag are required.');
      return;
    }
    setSaving(true);
    try {
      const dto: GameServerUpdateDto = {
        server_name: serverName.trim(),
        docker_image_name: imageName.trim(),
        docker_image_tag: imageTag.trim(),
        port_mappings: ports,
        environment_variables: envVars,
        execution_command: execCmd.length > 0 ? execCmd : undefined,
        volume_mounts: volumes,
      };
      if (cpuCores || memoryLimit) {
        dto.docker_hardware_limits = {
          docker_max_cpu_cores: cpuCores ? parseFloat(cpuCores) : 0,
          docker_memory_limit: memoryLimit ? parseInt(memoryLimit, 10) : 0,
        };
      }
      await serverApi.updateServer(apiClient, server.uuid, dto);
      Toast.show({ type: 'success', text1: 'Settings saved' });
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error ?? 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <CollapsibleSection
      title="General"
      icon="settings-outline"
      disabled={!hasPermission}
      disabledReason={!hasPermission ? 'No permission' : undefined}
    >
      {isServerActive && (
        <View style={styles.warning}>
          <Ionicons name="warning-outline" size={14} color={Colors.warning} />
          <Text style={styles.warningText}>Server must be stopped to edit</Text>
        </View>
      )}

      <SettingsTextInput
        label="Server Name"
        value={serverName}
        onChangeText={setServerName}
        placeholder="My Server"
        disabled={disabled}
      />
      <SettingsTextInput
        label="Docker Image"
        value={imageName}
        onChangeText={setImageName}
        placeholder="e.g. itzg/minecraft-server"
        disabled={disabled}
        autoCapitalize="none"
      />
      <SettingsTextInput
        label="Image Tag"
        value={imageTag}
        onChangeText={setImageTag}
        placeholder="e.g. latest"
        disabled={disabled}
        autoCapitalize="none"
      />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <SettingsNumberInput
            label="CPU Cores"
            value={cpuCores}
            onChangeText={setCpuCores}
            placeholder="e.g. 2"
            disabled={disabled}
          />
        </View>
        <View style={styles.halfField}>
          <SettingsNumberInput
            label="Memory (bytes)"
            value={memoryLimit}
            onChangeText={setMemoryLimit}
            placeholder="e.g. 2147483648"
            disabled={disabled}
          />
        </View>
      </View>

      <Text style={styles.sectionLabel}>Port Mappings</Text>
      <ArrayEditor
        items={ports}
        onChange={setPorts}
        createItem={() => ({ host_port: 0, container_port: 0, protocol: 'TCP' })}
        addLabel="+ Add Port"
        disabled={disabled}
        renderRow={(port, _, update) => (
          <View style={styles.portRow}>
            <TextInput
              style={styles.inlineInput}
              value={port.host_port ? String(port.host_port) : ''}
              onChangeText={(t) => update({ ...port, host_port: parseInt(t, 10) || 0 })}
              placeholder="Host"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              editable={!disabled}
            />
            <Text style={styles.arrow}>{'\u2192'}</Text>
            <TextInput
              style={styles.inlineInput}
              value={port.container_port ? String(port.container_port) : ''}
              onChangeText={(t) => update({ ...port, container_port: parseInt(t, 10) || 0 })}
              placeholder="Container"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              editable={!disabled}
            />
            <TextInput
              style={[styles.inlineInput, { width: 50 }]}
              value={port.protocol}
              onChangeText={(t) => update({ ...port, protocol: t.toUpperCase() })}
              placeholder="TCP"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="characters"
              editable={!disabled}
            />
          </View>
        )}
      />

      <Text style={styles.sectionLabel}>Environment Variables</Text>
      <ArrayEditor
        items={envVars}
        onChange={setEnvVars}
        createItem={() => ({ key: '', value: '' })}
        addLabel="+ Add Variable"
        disabled={disabled}
        renderRow={(env, _, update) => (
          <View style={styles.kvRow}>
            <TextInput
              style={[styles.inlineInput, { flex: 1 }]}
              value={env.key}
              onChangeText={(t) => update({ ...env, key: t })}
              placeholder="KEY"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="characters"
              editable={!disabled}
            />
            <TextInput
              style={[styles.inlineInput, { flex: 2 }]}
              value={env.value}
              onChangeText={(t) => update({ ...env, value: t })}
              placeholder="value"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
              editable={!disabled}
            />
          </View>
        )}
      />

      <Text style={styles.sectionLabel}>Execution Command</Text>
      <ArrayEditor
        items={execCmd}
        onChange={setExecCmd}
        createItem={() => ''}
        addLabel="+ Add Argument"
        disabled={disabled}
        renderRow={(arg, _, update) => (
          <TextInput
            style={styles.inlineInputFull}
            value={arg}
            onChangeText={update}
            placeholder="argument"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="none"
            editable={!disabled}
          />
        )}
      />

      <Text style={styles.sectionLabel}>Volume Mounts</Text>
      <ArrayEditor
        items={volumes}
        onChange={setVolumes}
        createItem={() => ({ container_path: '' })}
        addLabel="+ Add Volume"
        disabled={disabled}
        renderRow={(vol, _, update) => (
          <TextInput
            style={styles.inlineInputFull}
            value={vol.container_path}
            onChangeText={(t) => update({ ...vol, container_path: t })}
            placeholder="/data"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="none"
            editable={!disabled}
          />
        )}
      />

      {isDirty && !disabled && (
        <SaveCancelBar onSave={handleSave} onCancel={resetForm} saving={saving} />
      )}
    </CollapsibleSection>
  );
}

const styles = StyleSheet.create({
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.awaitingBg,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
  },
  warningText: {
    color: Colors.warning,
    fontSize: 12,
    fontWeight: '500',
  },
  sectionLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  halfField: {
    flex: 1,
  },
  portRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  kvRow: {
    flexDirection: 'row',
    gap: 6,
  },
  arrow: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  inlineInput: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: Radius.sm,
    color: Colors.text,
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minWidth: 60,
  },
  inlineInputFull: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: Radius.sm,
    color: Colors.text,
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
});
