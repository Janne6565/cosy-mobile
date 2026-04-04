import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAppSelector, useAppDispatch } from '../../src/redux/hooks';
import { selectInstances } from '../../src/redux/selectors/instanceSelectors';
import { updateUsername } from '../../src/redux/slices/instanceSlice';
import { login } from '../../src/api/authApi';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../../src/constants/theme';

export default function LoginScreen() {
  const { instanceId } = useLocalSearchParams<{ instanceId: string }>();
  const dispatch = useAppDispatch();
  const instances = useAppSelector(selectInstances);
  const instance = instances.find((i) => i.id === instanceId);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!instance || !username.trim() || !password) return;

    setLoading(true);
    try {
      await login(instance.id, instance.baseUrl, username.trim(), password);
      // Update username on instance
      dispatch(updateUsername({ instanceId: instance.id, username: username.trim() }));
      router.replace('/(app)/servers');
    } catch (e: any) {
      console.error('Login error:', JSON.stringify({
        status: e.response?.status,
        data: e.response?.data,
        message: e.message,
        url: `${instance.baseUrl}/auth/login?tokenMode=direct`,
      }, null, 2));

      let msg: string;
      if (e.response?.status === 401) {
        msg = 'Invalid username or password.';
      } else if (e.response?.status) {
        msg = `Server returned ${e.response.status}: ${JSON.stringify(e.response.data)}`;
      } else {
        msg = `Network error: ${e.message}`;
      }
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.form}>
        {instance && (
          <View style={styles.instanceInfo}>
            <Text style={styles.instanceName}>{instance.name}</Text>
            <Text style={styles.instanceUrl}>{instance.baseUrl}</Text>
          </View>
        )}

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowPassword((v) => !v)}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.text} />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => router.replace('/instances')}
        >
          <Text style={styles.cancelText}>Use a different instance</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  form: { flex: 1, padding: Spacing.lg, gap: Spacing.sm },
  instanceInfo: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  instanceName: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  instanceUrl: { color: Colors.textSecondary, fontSize: 12, fontFamily: 'Courier', marginTop: 2 },
  label: { color: Colors.textSecondary, fontSize: 13, fontWeight: '500', marginTop: Spacing.sm },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 15,
    padding: Spacing.md,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  passwordInput: { flex: 1 },
  eyeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  cancelBtn: { alignItems: 'center', marginTop: Spacing.md },
  cancelText: { color: Colors.textSecondary, fontSize: 14 },
});
