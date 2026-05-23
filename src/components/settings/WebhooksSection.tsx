import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useActiveInstance } from '../../hooks/useActiveInstance';
import { serverApi } from '../../api/serverApi';
import { GameServerDto, WebhookDto } from '../../types/api';
import { CollapsibleSection } from './CollapsibleSection';
import { SettingsTextInput, SettingsSwitch, SaveCancelBar } from './FormFields';
import { Colors, Radius, Spacing } from '../../constants/theme';
import Toast from 'react-native-toast-message';

interface Props {
  server: GameServerDto;
  hasPermission: boolean;
}

const emptyWebhook: Omit<WebhookDto, 'uuid'> = {
  webhook_url: '',
  webhook_type: 'DISCORD',
  enabled: true,
  subscribed_events: [],
};

export function WebhooksSection({ server, hasPermission }: Props) {
  const { apiClient } = useActiveInstance();
  const [webhooks, setWebhooks] = useState<WebhookDto[]>(server.webhooks ?? []);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookDto | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state for modal
  const [url, setUrl] = useState('');
  const [type, setType] = useState('DISCORD');
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setWebhooks(server.webhooks ?? []);
  }, [server.webhooks]);

  const openAdd = () => {
    setEditingWebhook(null);
    setUrl('');
    setType('DISCORD');
    setEnabled(true);
    setModalVisible(true);
  };

  const openEdit = (webhook: WebhookDto) => {
    setEditingWebhook(webhook);
    setUrl(webhook.webhook_url ?? '');
    setType(webhook.webhook_type ?? 'DISCORD');
    setEnabled(webhook.enabled ?? true);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!apiClient) return;
    if (!url.trim()) {
      Alert.alert('Validation', 'Webhook URL is required.');
      return;
    }
    setSaving(true);
    try {
      if (editingWebhook?.uuid) {
        await serverApi.updateWebhook(apiClient, server.uuid, editingWebhook.uuid, {
          ...editingWebhook,
          webhook_url: url.trim(),
          webhook_type: type,
          enabled,
        });
      } else {
        await serverApi.createWebhook(apiClient, server.uuid, {
          webhook_url: url.trim(),
          webhook_type: type,
          enabled,
        });
      }
      Toast.show({ type: 'success', text1: editingWebhook ? 'Webhook updated' : 'Webhook created' });
      setModalVisible(false);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error ?? 'Failed to save webhook');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (webhook: WebhookDto) => {
    if (!apiClient || !webhook.uuid) return;
    Alert.alert('Delete Webhook', `Delete webhook "${webhook.webhook_url}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await serverApi.deleteWebhook(apiClient, server.uuid, webhook.uuid!);
            Toast.show({ type: 'success', text1: 'Webhook deleted' });
          } catch {
            Alert.alert('Error', 'Failed to delete webhook');
          }
        },
      },
    ]);
  };

  return (
    <CollapsibleSection
      title="Webhooks"
      icon="link-outline"
      disabled={!hasPermission}
      disabledReason={!hasPermission ? 'No permission' : undefined}
    >
      {webhooks.length === 0 ? (
        <Text style={styles.emptyText}>No webhooks configured</Text>
      ) : (
        webhooks.map((wh, i) => (
          <View key={wh.uuid ?? i} style={styles.webhookCard}>
            <TouchableOpacity style={styles.webhookInfo} onPress={() => openEdit(wh)}>
              <Text style={styles.webhookUrl} numberOfLines={1}>{wh.webhook_url}</Text>
              <View style={styles.badges}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{wh.webhook_type}</Text>
                </View>
                <View style={[styles.badge, wh.enabled ? styles.enabledBadge : styles.disabledBadge]}>
                  <Text style={[styles.badgeText, wh.enabled ? styles.enabledText : styles.disabledText]}>
                    {wh.enabled ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDelete(wh)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={16} color={Colors.failed} />
            </TouchableOpacity>
          </View>
        ))
      )}

      <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
        <Text style={styles.addText}>+ Add Webhook</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingWebhook ? 'Edit Webhook' : 'Add Webhook'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <SettingsTextInput
              label="Webhook URL"
              value={url}
              onChangeText={setUrl}
              placeholder="https://discord.com/api/webhooks/..."
              autoCapitalize="none"
              keyboardType="url"
            />
            <SettingsTextInput
              label="Type"
              value={type}
              onChangeText={setType}
              placeholder="DISCORD"
              autoCapitalize="characters"
            />
            <SettingsSwitch
              label="Enabled"
              value={enabled}
              onValueChange={setEnabled}
            />
            <SaveCancelBar
              onSave={handleSave}
              onCancel={() => setModalVisible(false)}
              saving={saving}
            />
          </View>
        </View>
      </Modal>
    </CollapsibleSection>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: Spacing.sm,
  },
  webhookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  webhookInfo: {
    flex: 1,
    gap: 4,
  },
  webhookUrl: {
    color: Colors.text,
    fontSize: 12,
    fontFamily: 'Courier',
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: Colors.surfaceHighlight,
  },
  enabledBadge: {
    backgroundColor: Colors.runningBg,
  },
  disabledBadge: {
    backgroundColor: Colors.stoppedBg,
  },
  badgeText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  enabledText: {
    color: Colors.running,
  },
  disabledText: {
    color: Colors.stopped,
  },
  deleteBtn: {
    padding: 4,
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
  modal: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '600',
  },
  modalBody: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
});
