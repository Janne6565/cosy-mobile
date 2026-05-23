import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../../src/redux/hooks';
import { selectInstances, selectActiveInstanceId, selectActiveInstance } from '../../../src/redux/selectors/instanceSelectors';
import { setActiveInstance, removeInstance } from '../../../src/redux/slices/instanceSlice';
import { tokenService } from '../../../src/services/tokenService';
import { logout } from '../../../src/api/authApi';
import { createApiClient } from '../../../src/api/createApiClient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../../../src/constants/theme';

export default function SettingsScreen() {
  const dispatch = useAppDispatch();
  const instances = useAppSelector(selectInstances);
  const activeInstanceId = useAppSelector(selectActiveInstanceId);
  const activeInstance = useAppSelector(selectActiveInstance);

  const handleSwitch = (instanceId: string) => {
    dispatch(setActiveInstance(instanceId));
    const instance = instances.find((i) => i.id === instanceId);
    if (instance?.isAuthenticated) {
      router.replace('/(app)/servers');
    } else {
      router.replace({ pathname: '/(auth)/login', params: { instanceId } });
    }
  };

  const handleLogout = () => {
    if (!activeInstance) return;
    Alert.alert('Sign Out', `Sign out of ${activeInstance.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          const client = createApiClient(activeInstance.id, activeInstance.baseUrl);
          await logout(activeInstance.id, client);
          router.replace({ pathname: '/(auth)/login', params: { instanceId: activeInstance.id } });
        },
      },
    ]);
  };

  const handleDelete = (instanceId: string) => {
    const inst = instances.find((i) => i.id === instanceId);
    Alert.alert('Remove Instance', `Remove "${inst?.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await tokenService.deleteRefreshToken(instanceId);
          dispatch(removeInstance(instanceId));
          if (instances.length <= 1) {
            router.replace('/instances');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Current user */}
      {activeInstance && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Current Instance</Text>
          <Text style={styles.instanceName}>{activeInstance.name}</Text>
          <Text style={styles.instanceUrl}>{activeInstance.baseUrl}</Text>
          {activeInstance.username ? (
            <Text style={styles.username}>Signed in as {activeInstance.username}</Text>
          ) : null}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Instance list */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>All Instances</Text>
        {instances.map((inst) => (
          <View key={inst.id} style={styles.instanceRow}>
            <TouchableOpacity
              style={[styles.instanceBtn, inst.id === activeInstanceId && styles.activeBtn]}
              onPress={() => handleSwitch(inst.id)}
            >
              <View style={styles.activeIndicator}>
                {inst.id === activeInstanceId && <View style={styles.activeDot} />}
              </View>
              <View style={styles.instanceInfo}>
                <Text style={styles.instName}>{inst.name}</Text>
                <Text style={styles.instUrl} numberOfLines={1}>{inst.baseUrl}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDelete(inst.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/instances/add')}
        >
          <Text style={styles.addBtnText}>+ Add Instance</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, gap: Spacing.md },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  instanceName: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  instanceUrl: { color: Colors.textSecondary, fontSize: 12, fontFamily: 'Courier' },
  username: { color: Colors.textMuted, fontSize: 13 },
  logoutBtn: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.failedBg,
    borderRadius: Radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  logoutText: { color: Colors.failed, fontWeight: '600', fontSize: 14 },
  instanceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  instanceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceAlt,
    gap: Spacing.sm,
  },
  activeBtn: { backgroundColor: Colors.primaryMuted },
  activeIndicator: { width: 10, alignItems: 'center' },
  activeDot: { width: 8, height: 8, borderRadius: Radius.full, backgroundColor: Colors.primary },
  instanceInfo: { flex: 1 },
  instName: { color: Colors.text, fontSize: 14, fontWeight: '500' },
  instUrl: { color: Colors.textSecondary, fontSize: 11, fontFamily: 'Courier' },
  deleteBtn: { padding: 4 },
  addBtn: {
    marginTop: Spacing.sm,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
  },
  addBtnText: { color: Colors.primary, fontSize: 14, fontWeight: '500' },
});
