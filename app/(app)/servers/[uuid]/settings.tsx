import React from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useGlobalSearchParams, useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { useServer } from '../../../../src/hooks/useServers';
import { useServerPermissions, PERMISSIONS } from '../../../../src/hooks/useServerPermissions';
import { GeneralSettingsSection } from '../../../../src/components/settings/GeneralSettingsSection';
import { DesignSettingsSection } from '../../../../src/components/settings/DesignSettingsSection';
import { RCONSettingsSection } from '../../../../src/components/settings/RCONSettingsSection';
import { WebhooksSection } from '../../../../src/components/settings/WebhooksSection';
import { AccessManagementSection } from '../../../../src/components/settings/AccessManagementSection';
import { ReadOnlyLayoutSection } from '../../../../src/components/settings/ReadOnlyLayoutSection';
import { Colors, Spacing } from '../../../../src/constants/theme';

export default function ServerSettingsScreen() {
  const { uuid } = useGlobalSearchParams<{ uuid: string }>();
  const server = useServer(uuid);
  const navigation = useNavigation();
  const { hasPermission, loading: permLoading } = useServerPermissions(uuid);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerStyle: { backgroundColor: Colors.background },
      headerTintColor: Colors.text,
      headerTitleStyle: { fontWeight: '600', fontSize: 16 },
      title: 'Settings',
      headerShadowVisible: false,
    });
  }, []);

  if (!server) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <GeneralSettingsSection
        server={server}
        hasPermission={hasPermission(PERMISSIONS.CHANGE_SERVER_CONFIGS)}
      />
      <DesignSettingsSection
        server={server}
        hasPermission={hasPermission(PERMISSIONS.CHANGE_SERVER_CONFIGS)}
      />
      <RCONSettingsSection
        server={server}
        hasPermission={hasPermission(PERMISSIONS.CHANGE_RCON_SETTINGS)}
      />
      <WebhooksSection
        server={server}
        hasPermission={hasPermission(PERMISSIONS.CHANGE_WEBHOOK_SETTINGS)}
      />
      <AccessManagementSection
        server={server}
        hasPermission={hasPermission(PERMISSIONS.CHANGE_PERMISSIONS_SETTINGS)}
      />
      <ReadOnlyLayoutSection
        title="Private Dashboard"
        icon="grid-outline"
        layouts={server.private_dashboard_layouts}
        hasPermission={hasPermission(PERMISSIONS.CHANGE_PRIVATE_DASHBOARD_SETTINGS)}
      />
      <ReadOnlyLayoutSection
        title="Metrics Layout"
        icon="bar-chart-outline"
        layouts={server.metric_layout}
        hasPermission={hasPermission(PERMISSIONS.CHANGE_METRICS_SETTINGS)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
