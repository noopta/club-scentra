import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';
import { messages as messagesApi, Message } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function ChatScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();
  const { user } = useAuth();
  const { id, name, isGroup } = useLocalSearchParams<{ id: string; name: string; isGroup?: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const loadMessages = useCallback(async () => {
    if (!id) return;
    try {
      const res = await messagesApi.getMessages(id);
      setMessages(res.messages);
    } catch (err) {
      setMessages([]);
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not load messages');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [messages]);

  const handleSend = async () => {
    const body = text.trim();
    if (!body || !id || sending) return;
    setText('');
    setSending(true);
    try {
      const sent = await messagesApi.sendMessage(id, body);
      setMessages(prev => [...prev, sent]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    } catch (err) {
      setText(body);
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerName}>{name}</Text>
          {isGroup === '1' && <Text style={styles.headerSub}>Group Chat</Text>}
        </View>
        <Ionicons name="ellipsis-horizontal" size={22} color={Theme.colors.textPrimary} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Theme.colors.primary} />
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <Text style={styles.emptyText}>No messages yet. Say hello!</Text>
          ) : messages.map((msg) => {
            const isMine = msg.senderId === user?.id;
            return (
              <View key={msg.id} style={[styles.bubbleRow, isMine && styles.bubbleRowMine]}>
                {!isMine && (
                  msg.sender?.avatarUrl ? (
                    <Image source={{ uri: msg.sender.avatarUrl }} style={styles.bubbleAvatar} />
                  ) : (
                    <View style={[styles.bubbleAvatar, { backgroundColor: Theme.colors.border, alignItems: 'center', justifyContent: 'center' }]}>
                      <Ionicons name="person" size={14} color={Theme.colors.textMuted} />
                    </View>
                  )
                )}
                <View style={styles.bubbleContent}>
                  {!isMine && isGroup === '1' && (
                    <Text style={styles.bubbleSender}>{msg.sender?.displayName ?? msg.sender?.username}</Text>
                  )}
                  <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
                    <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>{msg.body}</Text>
                  </View>
                  <Text style={[styles.bubbleTime, isMine && styles.bubbleTimeMine]}>{formatTime(msg.createdAt)}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Message..."
          placeholderTextColor={Theme.colors.textMuted}
          multiline
          maxLength={8000}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!text.trim() || sending) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || sending}
          activeOpacity={0.8}
        >
          {sending ? (
            <ActivityIndicator size="small" color={Theme.colors.white} />
          ) : (
            <Ionicons name="send" size={18} color={Theme.colors.white} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (c: typeof Theme.colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 54 : 40, paddingHorizontal: Theme.spacing.md, paddingBottom: Theme.spacing.md, backgroundColor: c.white, borderBottomWidth: 1, borderBottomColor: c.border },
  backButton: { padding: Theme.spacing.sm, marginRight: Theme.spacing.sm },
  headerCenter: { flex: 1 },
  headerName: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.bold, color: c.textPrimary },
  headerSub: { fontSize: Theme.fontSize.xs, color: c.textSecondary },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  messageList: { flex: 1 },
  messageListContent: { paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.md, gap: 12 },
  emptyText: { textAlign: 'center', color: c.textMuted, marginTop: 40, fontSize: Theme.fontSize.sm },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  bubbleRowMine: { flexDirection: 'row-reverse' },
  bubbleAvatar: { width: 28, height: 28, borderRadius: 14 },
  bubbleContent: { maxWidth: '75%' },
  bubbleSender: { fontSize: 11, color: c.textSecondary, marginBottom: 3, marginLeft: 4 },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMine: { backgroundColor: c.primary, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: c.white, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: c.border },
  bubbleText: { fontSize: Theme.fontSize.md, color: c.textPrimary },
  bubbleTextMine: { color: c.white },
  bubbleTime: { fontSize: 11, color: c.textMuted, marginTop: 3, marginLeft: 4 },
  bubbleTimeMine: { textAlign: 'right', marginRight: 4 },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.sm, paddingBottom: Platform.OS === 'ios' ? 28 : Theme.spacing.sm, backgroundColor: c.white, borderTopWidth: 1, borderTopColor: c.border, gap: Theme.spacing.sm },
  input: { flex: 1, backgroundColor: c.background, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: Theme.fontSize.md, color: c.textPrimary, maxHeight: 120 },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { backgroundColor: c.border },
});
