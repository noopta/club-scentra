import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';

const MOCK_CONVERSATIONS: Record<string, { sender: string; text: string; time: string; mine: boolean }[]> = {
  '1': [
    { sender: 'LukeH', text: 'Yo! You coming to the meet tonight?', time: '8:01 PM', mine: false },
    { sender: 'me', text: 'Yeah for sure! What time does it start?', time: '8:04 PM', mine: true },
    { sender: 'LukeH', text: 'Doors open at 7, but people usually show up around 8', time: '8:05 PM', mine: false },
    { sender: 'me', text: 'Perfect, I\'ll be there. Parking on Queen?', time: '8:07 PM', mine: true },
    { sender: 'LukeH', text: 'Yeah the lot on Queen and Spadina. See you there 🔥', time: '8:08 PM', mine: false },
    { sender: 'LukeH', text: 'You coming to the meet tonight?', time: '8:10 PM', mine: false },
  ],
  '2': [
    { sender: 'MaxDrift99', text: 'Just finished my new wrap bro', time: '6:30 PM', mine: false },
    { sender: 'me', text: 'No way! Send pics!', time: '6:32 PM', mine: true },
    { sender: 'MaxDrift99', text: 'Check out my new wrap!', time: '6:33 PM', mine: false },
  ],
  '3': [
    { sender: 'TurboTina', text: 'Are you going to Clutch and Coffee this Sunday?', time: '2:00 PM', mine: false },
    { sender: 'me', text: 'Definitely, wouldn\'t miss it', time: '2:15 PM', mine: true },
    { sender: 'TurboTina', text: 'See you at Clutch and Coffee', time: '2:20 PM', mine: false },
  ],
  '4': [
    { sender: 'Adi10', text: 'Bro last night was insane', time: '11:00 AM', mine: false },
    { sender: 'me', text: 'Right?? Best meet of the year', time: '11:05 AM', mine: true },
    { sender: 'Adi10', text: 'That was a sick event 🔥', time: '11:10 AM', mine: false },
  ],
  '5': [
    { sender: 'JDMQueen', text: 'I uploaded the photos to Google Drive', time: 'Yesterday', mine: false },
    { sender: 'me', text: 'Amazing, thanks so much!', time: 'Yesterday', mine: true },
    { sender: 'JDMQueen', text: 'Sent you the photos from last week', time: 'Yesterday', mine: false },
  ],
  'g1': [
    { sender: 'MaxDrift99', text: 'Who\'s bringing the stereo setup?', time: '5:00 PM', mine: false },
    { sender: 'TurboTina', text: 'I can bring mine', time: '5:01 PM', mine: false },
    { sender: 'me', text: 'I\'ll handle food runs 🍔', time: '5:05 PM', mine: true },
    { sender: 'LukeH', text: 'Let\'s gooo! Saturday can\'t come sooner 🔥', time: '5:10 PM', mine: false },
  ],
  'g2': [
    { sender: 'Adi10', text: 'Added everyone to the group', time: '1:00 PM', mine: false },
    { sender: 'JDMQueen', text: 'What\'s the plan for next meet?', time: '1:02 PM', mine: false },
    { sender: 'me', text: 'Thinking downtown cruise, same spot as last time', time: '1:05 PM', mine: true },
  ],
};

const AVATARS: Record<string, string> = {
  LukeH: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
  MaxDrift99: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
  TurboTina: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
  Adi10: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
  JDMQueen: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
};

export default function ChatScreen() {
  const router = useRouter();
  const { id, name, avatar, isGroup } = useLocalSearchParams<{ id: string; name: string; avatar: string; isGroup?: string }>();
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState(MOCK_CONVERSATIONS[id] || []);

  const sendMessage = () => {
    if (!text.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    setMessages(prev => [...prev, { sender: 'me', text: text.trim(), time, mine: true }]);
    setText('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        {isGroup === 'true' ? (
          <View style={styles.groupAvatarRow}>
            <View style={styles.groupIcon}>
              <Ionicons name="people" size={22} color={Theme.colors.white} />
            </View>
          </View>
        ) : (
          <Image source={{ uri: avatar }} style={styles.headerAvatar} />
        )}
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{name}</Text>
          <Text style={styles.headerStatus}>{isGroup === 'true' ? 'Group · Tap for info' : 'Active now'}</Text>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="ellipsis-horizontal" size={22} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        {messages.map((msg, i) => {
          const prevMsg = i > 0 ? messages[i - 1] : null;
          const showSender = !msg.mine && isGroup === 'true' && msg.sender !== prevMsg?.sender;
          return (
            <View key={i} style={[styles.msgRow, msg.mine ? styles.msgRowMine : styles.msgRowOther]}>
              {!msg.mine && (
                <Image
                  source={{ uri: AVATARS[msg.sender] || avatar }}
                  style={styles.bubbleAvatar}
                />
              )}
              <View style={styles.bubbleWrapper}>
                {showSender && (
                  <Text style={styles.senderLabel}>{msg.sender}</Text>
                )}
                <View style={[styles.bubble, msg.mine ? styles.bubbleMine : styles.bubbleOther]}>
                  <Text style={[styles.bubbleText, msg.mine ? styles.bubbleTextMine : styles.bubbleTextOther]}>
                    {msg.text}
                  </Text>
                </View>
                <Text style={[styles.timeText, msg.mine ? styles.timeTextMine : styles.timeTextOther]}>
                  {msg.time}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="camera-outline" size={24} color={Theme.colors.textMuted} />
        </TouchableOpacity>
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Message..."
            placeholderTextColor={Theme.colors.textMuted}
            value={text}
            onChangeText={setText}
            multiline
            returnKeyType="default"
          />
        </View>
        {text.trim().length > 0 ? (
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Ionicons name="send" size={20} color={Theme.colors.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="heart-outline" size={24} color={Theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
    backgroundColor: Theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  backBtn: {
    padding: Theme.spacing.sm,
    marginRight: 4,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: Theme.spacing.sm,
  },
  groupAvatarRow: {
    marginRight: Theme.spacing.sm,
  },
  groupIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.textPrimary,
  },
  headerStatus: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.textSecondary,
  },
  headerAction: {
    padding: Theme.spacing.sm,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.lg,
    gap: 4,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  msgRowMine: {
    justifyContent: 'flex-end',
  },
  msgRowOther: {
    justifyContent: 'flex-start',
  },
  bubbleAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 16,
  },
  bubbleWrapper: {
    maxWidth: '72%',
  },
  senderLabel: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.textSecondary,
    marginBottom: 2,
    marginLeft: 12,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMine: {
    backgroundColor: Theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: Theme.colors.white,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: Theme.fontSize.md,
    lineHeight: 20,
  },
  bubbleTextMine: {
    color: Theme.colors.white,
  },
  bubbleTextOther: {
    color: Theme.colors.textPrimary,
  },
  timeText: {
    fontSize: 10,
    color: Theme.colors.textMuted,
    marginTop: 3,
  },
  timeTextMine: {
    textAlign: 'right',
  },
  timeTextOther: {
    textAlign: 'left',
    marginLeft: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 28 : Theme.spacing.sm,
    backgroundColor: Theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    gap: 6,
  },
  iconBtn: {
    padding: 8,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 40,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.textPrimary,
    maxHeight: 100,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
