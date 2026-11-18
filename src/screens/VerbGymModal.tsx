import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { evaluateConjugation, generateVerbChallenge, VerbChallenge } from '../verbs';
import { triggerHaptic } from '../sensory';
import { playEarcon } from '../earcons';
import { Course } from '../types';

const C = {
  midnight: '#1B1536',
  purple: '#30234D',
  gold: '#D4AF7C',
  ivory: '#F8F6F1',
  ink: '#211B32',
  muted: '#827B8D',
  white: '#FFFFFF',
  line: '#EAE5EE',
  green: '#638B70',
  red: '#B75D61',
  cardBg: '#2A1F45',
};

interface Props {
  visible: boolean;
  course: Course;
  onFinish: (earnedXp: number) => void;
  onClose: () => void;
}

export default function VerbGymModal({ visible, course, onFinish, onClose }: Props) {
  const [challenge, setChallenge] = useState<VerbChallenge | null>(null);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<{ isOk: boolean } | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [roundsPlayed, setRoundPlayed] = useState(0);

  const totalRounds = 10;

  useEffect(() => {
    if (visible) {
      setCorrectCount(0);
      setRoundPlayed(0);
      spinNewChallenge();
    }
  }, [visible]);

  const spinNewChallenge = () => {
    setIsSpinning(true);
    setInput('');
    setFeedback(null);
    void triggerHaptic('light');

    // Simulate slot machine spin delay
    setTimeout(() => {
      setChallenge(generateVerbChallenge(course.code));
      setIsSpinning(false);
      void triggerHaptic('selection');
    }, 600);
  };

  const handleCheck = () => {
    if (!challenge || !input.trim() || feedback) return;

    const isOk = evaluateConjugation(challenge.answer, input);
    setFeedback({ isOk });

    if (isOk) {
      void playEarcon('success');
      void triggerHaptic('success');
      setCorrectCount((c) => c + 1);
    } else {
      void playEarcon('error');
      void triggerHaptic('error');
    }
  };

  const handleNext = () => {
    if (roundsPlayed + 1 >= totalRounds) {
      setRoundPlayed((r) => r + 1);
      void playEarcon('fanfare');
    } else {
      setRoundPlayed((r) => r + 1);
      spinNewChallenge();
    }
  };

  const handleClaim = () => {
    void triggerHaptic('success');
    onFinish(15);
    onClose();
  };

  if (!visible) return null;

  const isFinished = roundsPlayed >= totalRounds;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.card}>
          {/* Header */}
          <View style={s.header}>
            <View style={s.badge}>
              <Text style={s.badgeText}>🏋️‍♂️ THE VERB GYM</Text>
            </View>
            <Pressable onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeText}>×</Text>
            </Pressable>
          </View>

          {!isFinished ? (
            <View style={s.content}>
              <View style={s.progressRow}>
                <Text style={s.counter}>
                  Rep {roundsPlayed + 1} of {totalRounds}
                </Text>
                <Text style={s.streakText}>✦ Score: {correctCount}</Text>
              </View>

              <View style={s.track}>
                <View
                  style={[
                    s.fill,
                    { width: `${((roundsPlayed + 1) / Math.max(1, totalRounds)) * 100}%` },
                  ]}
                />
              </View>

              {/* Slot Machine UI */}
              <View style={s.slotMachine}>
                <Text style={s.slotTitle}>Conjugate this verb:</Text>
                <Text style={s.infinitive}>{challenge?.infinitive}</Text>
                <Text style={s.infinitiveEn}>"{challenge?.en}"</Text>

                <View style={s.spinnersRow}>
                  <View style={[s.spinnerBox, isSpinning && s.spinnerBlur]}>
                    <Text style={s.spinnerLabel}>Pronoun</Text>
                    <Text style={s.spinnerValue}>
                      {isSpinning ? '...' : challenge?.pronoun}
                    </Text>
                  </View>
                  <View style={[s.spinnerBox, isSpinning && s.spinnerBlur]}>
                    <Text style={s.spinnerLabel}>Tense</Text>
                    <Text style={s.spinnerValue}>
                      {isSpinning
                        ? '...'
                        : challenge?.tense === 'present'
                        ? 'Present'
                        : 'Past'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Input Area */}
              <View style={s.inputArea}>
                <TextInput
                  style={[
                    s.input,
                    feedback && (feedback.isOk ? s.inputCorrect : s.inputWrong),
                  ]}
                  placeholder="Type conjugation..."
                  placeholderTextColor="#A49CAA"
                  value={input}
                  onChangeText={setInput}
                  editable={!feedback && !isSpinning}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onSubmitEditing={handleCheck}
                />
              </View>

              {/* Feedback Area */}
              {feedback && (
                <View
                  style={[
                    s.feedbackBox,
                    feedback.isOk ? s.feedbackBoxOk : s.feedbackBoxRetry,
                  ]}
                >
                  <Text style={s.feedbackTitle}>
                    {feedback.isOk ? '✓ PERFECT FORM!' : '✕ INCORRECT'}
                  </Text>
                  {!feedback.isOk && (
                    <Text style={s.feedbackText}>Correct answer: {challenge?.answer}</Text>
                  )}
                </View>
              )}

              {/* Action Buttons */}
              <View style={s.actionRow}>
                {!feedback ? (
                  <Pressable
                    disabled={!input.trim()}
                    style={[s.checkBtn, !input.trim() && s.checkBtnDisabled]}
                    onPress={handleCheck}
                  >
                    <Text style={s.checkBtnText}>Check Answer</Text>
                  </Pressable>
                ) : (
                  <Pressable style={s.nextBtn} onPress={handleNext}>
                    <Text style={s.nextBtnText}>Next Rep ›</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ) : (
            <View style={s.finishArea}>
              <Text style={s.finishIcon}>🏆</Text>
              <Text style={s.finishTitle}>Workout Complete!</Text>
              <Text style={s.finishSub}>
                You completed {totalRounds} intense verb reps. Consistency builds reflex memory!
              </Text>
              <Pressable style={s.claimBtn} onPress={handleClaim}>
                <Text style={s.claimBtnText}>Claim +15 XP & Rest</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 21, 54, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 20,
    shadowColor: C.midnight,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  badge: {
    backgroundColor: '#EAE5F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#4B3663',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3EEF8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: C.ink,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 22,
  },
  content: {
    alignItems: 'center',
  },
  progressRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  counter: { color: C.muted, fontSize: 12, fontWeight: '800' },
  streakText: { color: C.gold, fontSize: 12, fontWeight: '900' },
  track: {
    width: '100%',
    height: 6,
    backgroundColor: C.line,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  fill: { height: '100%', backgroundColor: C.gold, borderRadius: 3 },
  slotMachine: {
    backgroundColor: '#FAF9FC',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ECE6F2',
    width: '100%',
    marginBottom: 20,
  },
  slotTitle: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  infinitive: {
    color: C.purple,
    fontSize: 28,
    fontWeight: '900',
  },
  infinitiveEn: {
    color: C.muted,
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  spinnersRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  spinnerBox: {
    flex: 1,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerBlur: {
    opacity: 0.5,
  },
  spinnerLabel: {
    color: C.muted,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  spinnerValue: {
    color: C.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  inputArea: {
    width: '100%',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F3EEF8',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '700',
    color: C.midnight,
    borderWidth: 2,
    borderColor: 'transparent',
    textAlign: 'center',
  },
  inputCorrect: {
    backgroundColor: '#EDF7F1',
    borderColor: C.green,
    color: '#2B5738',
  },
  inputWrong: {
    backgroundColor: '#FCF0F1',
    borderColor: C.red,
    color: '#822D31',
  },
  feedbackBox: {
    width: '100%',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  feedbackBoxOk: { backgroundColor: '#EDF7F1', borderColor: '#BFE3CE' },
  feedbackBoxRetry: { backgroundColor: '#FCF0F1', borderColor: '#F5C5C8' },
  feedbackTitle: { color: C.ink, fontSize: 11, fontWeight: '900', letterSpacing: 0.8, marginBottom: 4 },
  feedbackText: { color: C.ink, fontSize: 13, fontWeight: '700' },
  actionRow: {
    width: '100%',
    marginBottom: 10,
  },
  checkBtn: {
    backgroundColor: C.midnight,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  checkBtnDisabled: { opacity: 0.45 },
  checkBtnText: { color: C.white, fontSize: 14, fontWeight: '800' },
  nextBtn: {
    backgroundColor: C.green,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  nextBtnText: { color: C.white, fontSize: 14, fontWeight: '800' },
  finishArea: { alignItems: 'center', paddingVertical: 20 },
  finishIcon: { fontSize: 48, marginBottom: 12 },
  finishTitle: { color: C.midnight, fontSize: 20, fontWeight: '900', marginBottom: 8 },
  finishSub: { color: C.muted, fontSize: 13, fontWeight: '600', textAlign: 'center', lineHeight: 18, marginBottom: 20 },
  claimBtn: {
    backgroundColor: C.midnight,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  claimBtnText: { color: C.white, fontSize: 14, fontWeight: '800' },
});
