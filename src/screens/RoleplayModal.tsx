import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { playPhraseAudio, stopAllAudio } from '../audio';
import { evaluateRoleplayTurn } from '../companion/roleplay';
import { RoleplayMessage, RoleplayScenario } from '../types';

const C = {
  midnight: '#1B1536',
  purple: '#30234D',
  gold: '#D4AF7C',
  ivory: '#F8F6F1',
  ink: '#211B32',
  muted: '#827B8D',
  white: '#FFFFFF',
  line: '#EAE5EE',
  lilac: '#EEE9F6',
  green: '#638B70',
};

interface Props {
  visible: boolean;
  scenario: RoleplayScenario;
  onFinishRoleplay: (earnedXp: number) => void;
  onClose: () => void;
}

export default function RoleplayModal({
  visible,
  scenario,
  onFinishRoleplay,
  onClose,
}: Props) {
  const [messages, setMessages] = useState<RoleplayMessage[]>(() => [
    {
      id: 'greeting',
      sender: 'ai',
      speakerName: scenario.personaName,
      avatar: scenario.avatar,
      target: scenario.initialGreeting.target,
      en: scenario.initialGreeting.en,
      timestamp: Date.now(),
    },
  ]);

  const [turnIndex, setTurnIndex] = useState(0);
  const [inputText, setInputText] = useState('');
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>(
    scenario.suggestedReplies
  );
  const [isCompleted, setIsCompleted] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // 1. Add user message
    const userMsg: RoleplayMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      speakerName: 'You',
      avatar: '👤',
      target: text.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // 2. Evaluate turn
    const turnRes = evaluateRoleplayTurn(scenario.id, turnIndex, text);

    setTimeout(() => {
      setMessages((prev) => [...prev, turnRes.reply]);
      if (turnRes.intentMet !== false) {
        setTurnIndex((v) => v + 1);
      }
      setSuggestedReplies(turnRes.suggestedNextReplies);

      if (turnRes.isCompleted) {
        setIsCompleted(true);
        setEarnedXp(turnRes.earnedXp ?? 20);
      }
    }, 400);
  };

  const playMessageAudio = (text: string) => {
    void playPhraseAudio({ id: 'roleplay', target: text, en: '' }, scenario.courseCode);
  };

  const handleFinish = () => {
    void stopAllAudio();
    if (isCompleted) {
      onFinishRoleplay(earnedXp);
    }
    onClose();
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={s.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={s.card}>
          <View style={s.header}>
            <View style={s.badge}>
              <Text style={s.badgeText}>✦ AI ROLEPLAY · CONVERSATION</Text>
            </View>
            <Pressable onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeText}>×</Text>
            </Pressable>
          </View>

          <View style={s.personaRow}>
            <Text style={s.personaAvatar}>{scenario.avatar}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.personaName}>
                {scenario.personaName} · {scenario.title}
              </Text>
              <Text style={s.personaRole}>{scenario.role}</Text>
            </View>
          </View>

          <View style={s.objectiveBox}>
            <Text style={s.objectiveText}>🎯 Goal: {scenario.contextObjective}</Text>
          </View>

          {/* Chat Messages */}
          <ScrollView style={s.chatScroll} showsVerticalScrollIndicator={false}>
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[s.msgRow, msg.sender === 'user' ? s.msgRowUser : s.msgRowAi]}
              >
                {msg.sender === 'ai' && <Text style={s.bubbleAvatar}>{msg.avatar}</Text>}
                <View
                  style={[s.bubble, msg.sender === 'user' ? s.bubbleUser : s.bubbleAi]}
                >
                  <View style={s.bubbleTop}>
                    <Text style={s.bubbleSpeaker}>{msg.speakerName}</Text>
                    {msg.sender === 'ai' && (
                      <Pressable onPress={() => playMessageAudio(msg.target)}>
                        <Text style={s.audioIcon}>🔊</Text>
                      </Pressable>
                    )}
                  </View>
                  <Text style={[s.bubbleTarget, msg.sender === 'user' && s.bubbleTargetUser]}>
                    {msg.target}
                  </Text>
                  {msg.en && <Text style={s.bubbleEn}>{msg.en}</Text>}

                  {msg.feedback && (
                    <View style={s.feedbackCard}>
                      <Text style={s.feedbackBadge}>COACHING</Text>
                      <Text style={s.feedbackText}>{msg.feedback}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}

            {isCompleted && (
              <View style={s.completeCard}>
                <Text style={s.completeIcon}>🎉</Text>
                <Text style={s.completeTitle}>Conversation Completed!</Text>
                <Text style={s.completeDesc}>
                  You navigated an authentic conversation in {scenario.courseCode === 'fr' ? 'French' : 'German'}.
                </Text>
                <Text style={s.completeXp}>+{earnedXp} XP EARNED</Text>
              </View>
            )}
          </ScrollView>

          {/* Quick Suggested Replies */}
          {!isCompleted && suggestedReplies.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.suggestionsScroll}>
              {suggestedReplies.map((reply, idx) => (
                <Pressable
                  key={idx}
                  style={s.suggestionChip}
                  onPress={() => handleSend(reply)}
                >
                  <Text style={s.suggestionText}>{reply}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {/* Input Area or Finish Button */}
          {isCompleted ? (
            <Pressable style={s.finishBtn} onPress={handleFinish}>
              <Text style={s.finishBtnText}>Finish Roleplay (+{earnedXp} XP)</Text>
            </Pressable>
          ) : (
            <View style={s.inputRow}>
              <TextInput
                style={s.input}
                placeholder="Write your response…"
                placeholderTextColor="#A49CAA"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={() => handleSend(inputText)}
              />
              <Pressable
                disabled={!inputText.trim()}
                style={[s.sendBtn, !inputText.trim() && s.sendBtnDisabled]}
                onPress={() => handleSend(inputText)}
              >
                <Text style={s.sendBtnText}>Send</Text>
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 21, 54, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxHeight: '92%',
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 20,
    shadowColor: C.midnight,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#F7F2E7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    color: '#8A692E',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0EBF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: C.midnight, fontSize: 22, lineHeight: 25 },
  personaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  personaAvatar: { fontSize: 26 },
  personaName: { color: C.midnight, fontSize: 15, fontWeight: '800' },
  personaRole: { color: C.muted, fontSize: 10 },
  objectiveBox: {
    backgroundColor: '#F7F4FA',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    marginBottom: 12,
  },
  objectiveText: { color: C.midnight, fontSize: 11, fontWeight: '700' },
  chatScroll: { maxHeight: 320, marginBottom: 12 },
  msgRow: { flexDirection: 'row', gap: 8, marginBottom: 10, alignItems: 'flex-start' },
  msgRowAi: { justifyContent: 'flex-start' },
  msgRowUser: { justifyContent: 'flex-end' },
  bubbleAvatar: { fontSize: 20, marginTop: 4 },
  bubble: { maxWidth: '82%', borderRadius: 16, padding: 12 },
  bubbleAi: { backgroundColor: '#F9F8FB', borderWidth: 1, borderColor: '#ECE6F2' },
  bubbleUser: { backgroundColor: C.midnight },
  bubbleTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  bubbleSpeaker: { color: '#8A6D34', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  audioIcon: { fontSize: 12, padding: 2 },
  bubbleTarget: { color: C.midnight, fontSize: 13, fontWeight: '800' },
  bubbleTargetUser: { color: C.white },
  bubbleEn: { color: C.muted, fontSize: 10, marginTop: 2 },
  feedbackCard: {
    backgroundColor: '#FAF8F4',
    borderLeftWidth: 2,
    borderLeftColor: C.gold,
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  feedbackBadge: { color: '#8A692E', fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  feedbackText: { color: C.ink, fontSize: 10, lineHeight: 14, marginTop: 2 },
  completeCard: {
    backgroundColor: '#EAF2EC',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 1.5,
    borderColor: C.green,
  },
  completeIcon: { fontSize: 28, marginBottom: 4 },
  completeTitle: { color: '#2B5738', fontSize: 16, fontWeight: '800' },
  completeDesc: { color: C.ink, fontSize: 11, textAlign: 'center', marginTop: 2 },
  completeXp: { color: '#2B5738', fontSize: 12, fontWeight: '900', letterSpacing: 1, marginTop: 8 },
  suggestionsScroll: { maxHeight: 38, marginBottom: 10 },
  suggestionChip: {
    backgroundColor: '#F3EEF8',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5DCEF',
  },
  suggestionText: { color: C.midnight, fontSize: 11, fontWeight: '700' },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    backgroundColor: '#F9F8FB',
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 12,
    color: C.ink,
  },
  sendBtn: {
    backgroundColor: C.midnight,
    paddingHorizontal: 18,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#D4CFDC' },
  sendBtnText: { color: C.white, fontWeight: '800', fontSize: 12 },
  finishBtn: {
    backgroundColor: C.midnight,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  finishBtnText: { color: C.white, fontWeight: '800', fontSize: 13 },
});
