import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalSearchParams } from 'expo-router';
import { useServerActions } from '../../../../src/hooks/useServerActions';
import { useServer } from '../../../../src/hooks/useServers';
import { Colors, Radius, Spacing } from '../../../../src/constants/theme';

interface ConsoleLine {
  id: string;
  type: 'input' | 'info' | 'error';
  text: string;
}

export default function ConsoleScreen() {
  const { uuid } = useGlobalSearchParams<{ uuid: string }>();
  const server = useServer(uuid);
  const { sendCommand } = useServerActions();
  const [command, setCommand] = useState('');
  const [lines, setLines] = useState<ConsoleLine[]>([
    { id: '0', type: 'info', text: 'Console ready. Type a command and press Send.' },
  ]);
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const addLine = (type: ConsoleLine['type'], text: string) => {
    setLines((prev) => [...prev, { id: Date.now().toString(), type, text }]);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleSend = async () => {
    const cmd = command.trim();
    if (!cmd) return;

    if (server?.status !== 'RUNNING') {
      Alert.alert('Server Offline', 'The server must be running to send commands.');
      return;
    }

    setCommand('');
    addLine('input', `> ${cmd}`);
    setSending(true);
    try {
      await sendCommand(uuid, cmd);
      addLine('info', 'Command sent');
    } catch {
      addLine('error', 'Failed to send command');
    } finally {
      setSending(false);
    }
  };

  const lineColor = (type: ConsoleLine['type']) => {
    if (type === 'input') return Colors.primary;
    if (type === 'error') return Colors.error;
    return Colors.textMuted;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={120}
    >
      <FlatList
        ref={listRef}
        data={lines}
        keyExtractor={(l) => l.id}
        style={styles.output}
        contentContainerStyle={styles.outputContent}
        renderItem={({ item }) => (
          <Text style={[styles.line, { color: lineColor(item.type) }]}>{item.text}</Text>
        )}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={command}
          onChangeText={setCommand}
          placeholder="Enter command..."
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          editable={!sending}
        />
        <TouchableOpacity
          style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color={Colors.text} />
          ) : (
            <Ionicons name="arrow-up" size={20} color={Colors.text} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  output: { flex: 1 },
  outputContent: { padding: Spacing.md, gap: 4 },
  line: { fontSize: 13, fontFamily: 'Courier', lineHeight: 18 },
  inputRow: {
    flexDirection: 'row',
    padding: Spacing.sm,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 14,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    fontFamily: 'Courier',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
});
