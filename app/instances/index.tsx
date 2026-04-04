import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../src/redux/hooks';
import { selectInstances, selectActiveInstanceId } from '../../src/redux/selectors/instanceSelectors';
import { setActiveInstance, removeInstance } from '../../src/redux/slices/instanceSlice';
import { tokenService } from '../../src/services/tokenService';
import { InstanceCard } from '../../src/components/InstanceCard';
import { Colors, Radius, Spacing } from '../../src/constants/theme';

export default function InstancesScreen() {
  const dispatch = useAppDispatch();
  const instances = useAppSelector(selectInstances);
  const activeInstanceId = useAppSelector(selectActiveInstanceId);

  const handleSelect = (instanceId: string) => {
    dispatch(setActiveInstance(instanceId));
    const instance = instances.find((i) => i.id === instanceId);
    if (instance?.isAuthenticated) {
      router.replace('/(app)/servers');
    } else {
      router.replace({ pathname: '/(auth)/login', params: { instanceId } });
    }
  };

  const handleDelete = (instanceId: string) => {
    Alert.alert('Remove Instance', 'Remove this Cosy instance from the app?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await tokenService.deleteRefreshToken(instanceId);
          dispatch(removeInstance(instanceId));
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {instances.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No Cosy instances</Text>
          <Text style={styles.emptySubtitle}>Add a Cosy backend URL to get started</Text>
        </View>
      ) : (
        <FlatList
          data={instances}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <InstanceCard
              instance={item}
              isActive={item.id === activeInstanceId}
              onPress={() => handleSelect(item.id)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/instances/add')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.md },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.xl,
  },
  emptyTitle: { color: Colors.text, fontSize: 18, fontWeight: '600' },
  emptySubtitle: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: { color: Colors.text, fontSize: 28, lineHeight: 32 },
});
