import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useActiveInstance } from '../../hooks/useActiveInstance';
import { serverApi } from '../../api/serverApi';
import { GameServerDto, PermissionDto } from '../../types/api';
import { CollapsibleSection } from './CollapsibleSection';
import { Colors, Radius, Spacing } from '../../constants/theme';

interface Props {
  server: GameServerDto;
  hasPermission: boolean;
}

export function AccessManagementSection({ server, hasPermission }: Props) {
  const { apiClient } = useActiveInstance();
  const [permData, setPermData] = useState<PermissionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!apiClient || loaded) return;
    setLoading(true);
    serverApi
      .getPermissions(apiClient, server.uuid)
      .then(setPermData)
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        setLoaded(true);
      });
  }, [apiClient, server.uuid, loaded]);

  const groups = server.access_groups ?? [];

  return (
    <CollapsibleSection
      title="Access Management"
      icon="people-outline"
      disabled={!hasPermission}
      disabledReason={!hasPermission ? 'No permission' : undefined}
    >

      {groups.length > 0 && (
        <>
          <Text style={styles.label}>Access Groups</Text>
          {groups.map((g) => (
            <View key={g.uuid} style={styles.groupCard}>
              <Text style={styles.groupName}>{g.name}</Text>
            </View>
          ))}
        </>
      )}

      <Text style={styles.label}>Users & Permissions</Text>
      {loading ? (
        <ActivityIndicator color={Colors.primary} style={styles.loader} />
      ) : permData.length === 0 ? (
        <Text style={styles.emptyText}>No permission data available</Text>
      ) : (
        permData.filter((entry) => entry.user).map((entry) => (
          <View key={entry.user.uuid} style={styles.userCard}>
            <Text style={styles.username}>{entry.user.username}</Text>
            <View style={styles.permBadges}>
              {entry.permissions.map((p) => (
                <View key={p} style={styles.permBadge}>
                  <Text style={styles.permText}>{p.replace(/^CHANGE_/, '').replace(/_/g, ' ')}</Text>
                </View>
              ))}
            </View>
          </View>
        ))
      )}

      <Text style={styles.note}>Edit access management on the web dashboard</Text>
    </CollapsibleSection>
  );
}

const styles = StyleSheet.create({
  label: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  groupCard: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
  },
  groupName: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  userCard: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    gap: 6,
  },
  username: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  permBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  permBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: Colors.primaryMuted,
  },
  permText: {
    color: Colors.primary,
    fontSize: 9,
    fontWeight: '600',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  loader: {
    paddingVertical: Spacing.sm,
  },
  note: {
    color: Colors.textMuted,
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
