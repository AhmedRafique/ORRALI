import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { playPhraseAudio, stopAllAudio } from '../audio';
import { askTutor } from '../companion/tutor';
import { LangCode, TutorExplanation } from '../types';

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
  courseCode: LangCode;
  initialTopic?: string;
  onClose: () => void;
}

export default function TutorModal({ visible, courseCode, initialTopic, onClose }: Props) {
  const [query, setQuery] = useState(initialTopic ?? '');
  const [answer, setAnswer] = useState<TutorExplanation>(() =>
    askTutor(initialTopic && initialTopic.length > 0 ? initialTopic : 'basics', courseCode)
  );

  const quickQuestions =
    courseCode === 'fr'
      ? [
          'When do I use Tu vs. Vous?',
          'Difference between Un and Une?',
          'How does ORRALI color-code noun gender?',
          'Why say Je voudrais instead of Je veux?',
        ]
      : courseCode === 'es'
      ? [
          'When do I use Ser vs. Estar?',
          'How does Me Gusta work?',
          'How does ORRALI color-code noun gender?',
          'What is the difference between Por and Para?',
        ]
      : [
          'Difference between Du and Sie?',
          'Why Der, Die, and Das?',
          'How does ORRALI color-code noun gender?',
          'Why is it Einen Kaffee in cafés?',
        ];

  const handleAsk = (q: string) => {
    setQuery(q);
    const res = askTutor(q, courseCode);
    setAnswer(res);
  };

  const playExampleAudio = (target: string) => {
    void playPhraseAudio({ id: 'tutor-ex', target, en: '' }, courseCode);
  };

  const handleClose = () => {
    void stopAllAudio();
    onClose();
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={handleClose}>
      <View style={s.overlay}>
        <View style={s.card}>
          <View style={s.header}>
            <View style={s.badge}>
              <Text style={s.badgeText}>✦ ASK ORRALI · AI TUTOR</Text>
            </View>
            <Pressable onPress={handleClose} style={s.closeBtn}>
              <Text style={s.closeText}>×</Text>
            </Pressable>
          </View>

          <Text style={s.title}>Explain to me like a child</Text>
          <Text style={s.subtitle}>
            Ask any grammar or pronunciation question in plain English.
          </Text>

          {/* Quick Question Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipsScroll}>
            {quickQuestions.map((q, idx) => (
              <Pressable key={idx} style={s.chip} onPress={() => handleAsk(q)}>
                <Text style={s.chipText}>{q}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Custom Search Input */}
          <View style={s.inputRow}>
            <TextInput
              style={s.input}
              placeholder={
                courseCode === 'fr'
                  ? 'e.g. Why is it en Égypte?...'
                  : courseCode === 'es'
                  ? 'e.g. Why ser vs estar?...'
                  : 'e.g. Why der vs den?...'
              }
              placeholderTextColor="#A49CAA"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => handleAsk(query)}
            />
            <Pressable style={s.askBtn} onPress={() => handleAsk(query)}>
              <Text style={s.askBtnText}>Ask</Text>
            </Pressable>
          </View>

          {/* AI Explanation Card */}
          <ScrollView style={s.answerScroll} showsVerticalScrollIndicator={false}>
            <Text style={s.answerTopic}>{answer.topic}</Text>

            <View style={s.summaryBox}>
              <Text style={s.summaryTitle}>SIMPLE EXPLANATION</Text>
              <Text style={s.summaryText}>{answer.childFriendlySummary}</Text>
            </View>

            <Text style={s.detailedText}>{answer.detailedExplanation}</Text>

            {answer.goldenRule && (
              <View style={s.goldenRuleBox}>
                <Text style={s.goldenRuleTitle}>GOLDEN RULE</Text>
                <Text style={s.goldenRuleText}>{answer.goldenRule}</Text>
              </View>
            )}

            <Text style={s.examplesTitle}>KEY EXAMPLES (TAP TO HEAR)</Text>
            {answer.examples.map((ex, idx) => (
              <Pressable
                key={idx}
                style={s.exampleCard}
                onPress={() => playExampleAudio(ex.target)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={s.exampleTarget}>{ex.target}</Text>
                  <Text style={s.exampleEn}>{ex.en}</Text>
                </View>
                <Text style={s.audioIcon}>🔊</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Pressable style={s.doneBtn} onPress={handleClose}>
            <Text style={s.doneBtnText}>I Understand · Got It</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 21, 54, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 22,
  },
  card: {
    width: '100%',
    maxHeight: '88%',
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 22,
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
  title: { color: C.midnight, fontSize: 20, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: C.muted, fontSize: 11, marginBottom: 12 },
  chipsScroll: { maxHeight: 38, marginBottom: 12 },
  chip: {
    backgroundColor: '#F3EEF8',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5DCEF',
  },
  chipText: { color: C.midnight, fontSize: 11, fontWeight: '700' },
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  input: {
    flex: 1,
    backgroundColor: '#F9F8FB',
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 12,
    color: C.ink,
  },
  askBtn: {
    backgroundColor: C.midnight,
    paddingHorizontal: 16,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  askBtnText: { color: C.white, fontWeight: '800', fontSize: 12 },
  answerScroll: { maxHeight: 300, marginBottom: 14 },
  answerTopic: { color: C.midnight, fontSize: 17, fontWeight: '800', marginBottom: 8 },
  summaryBox: {
    backgroundColor: '#FAF7F1',
    borderLeftWidth: 3,
    borderLeftColor: C.gold,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  summaryTitle: { color: '#8A692E', fontSize: 9, fontWeight: '900', letterSpacing: 0.8, marginBottom: 2 },
  summaryText: { color: C.ink, fontSize: 12, lineHeight: 18, fontWeight: '600' },
  detailedText: { color: C.muted, fontSize: 11, lineHeight: 17, marginBottom: 10 },
  goldenRuleBox: {
    backgroundColor: '#EAF2EC',
    borderLeftWidth: 3,
    borderLeftColor: C.green,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  goldenRuleTitle: { color: '#2C5A37', fontSize: 9, fontWeight: '900', letterSpacing: 0.8, marginBottom: 2 },
  goldenRuleText: { color: C.ink, fontSize: 11, lineHeight: 16, fontWeight: '700' },
  examplesTitle: { color: '#9B8CA9', fontSize: 9, fontWeight: '900', letterSpacing: 1, marginBottom: 6 },
  exampleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F8FB',
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#ECE6F2',
  },
  exampleTarget: { color: C.midnight, fontSize: 13, fontWeight: '800' },
  exampleEn: { color: C.muted, fontSize: 11, marginTop: 2 },
  audioIcon: { fontSize: 14, paddingLeft: 8 },
  doneBtn: {
    backgroundColor: C.midnight,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  doneBtnText: { color: C.white, fontWeight: '800', fontSize: 13 },
});
