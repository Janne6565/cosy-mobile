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
import { router } from 'expo-router';
import axios from 'axios';
import { useAppDispatch } from '../../src/redux/hooks';
import { addInstance, setActiveInstance } from '../../src/redux/slices/instanceSlice';
import { Colors, Radius, Spacing } from '../../src/constants/theme';

export default function AddInstanceScreen() {
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [checking, setChecking] = useState(false);
  const dispatch = useAppDispatch();

  const handleAdd = async () => {
    const url = baseUrl.trim().replace(/\/+$/, '');
    if (!name.trim() || !url) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }

    setChecking(true);
    try {
      // Quick connectivity check
      await axios.get(`${url}/v3/api-docs`, { timeout: 8000 });
    } catch (e: any) {
      // 401/403 is fine — it means the server is reachable
      if (!e.response) {
        Alert.alert('Cannot reach server', `Could not connect to ${url}. Check the URL and try again.`);
        setChecking(false);
        return;
      }
    } finally {
      setChecking(false);
    }

    const result = dispatch(addInstance({ name: name.trim(), baseUrl: url, username: '' }));
    const id = result.meta.id;
    dispatch(setActiveInstance(id));
    router.replace({ pathname: '/(auth)/login', params: { instanceId: id } });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.form}>
        <Text style={styles.title}>Add Cosy Instance</Text>
        <Text style={styles.subtitle}>
          Enter the URL of your Cosy backend and a label for it.
        </Text>

        <Text style={styles.label}>Instance Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="My Home Server"
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Backend URL</Text>
        <TextInput
          style={styles.input}
          value={baseUrl}
          onChangeText={setBaseUrl}
          placeholder="https://cosy.example.com/api"
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />

        <TouchableOpacity
          style={[styles.button, checking && styles.buttonDisabled]}
          onPress={handleAdd}
          disabled={checking}
        >
          {checking ? (
            <ActivityIndicator color={Colors.text} />
          ) : (
            <Text style={styles.buttonText}>Connect</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  form: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  title: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    marginTop: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 15,
    padding: Spacing.md,
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
});
