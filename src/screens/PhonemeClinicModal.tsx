import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  buildPhonemeSprint,
  evaluatePhonemeSprintAnswer,
  MinimalPair,
  PhonemeEvaluationResult,
  PhonemeSprintChallenge,
} from '../audio/phonemeClinic';
import { playEmotionalSpeech } from '../audio/emotionalTts';
import { playEarcon } from '../earcons';
import { triggerHaptic } from '../sensory';
import { Course } from '../types';

const C = {
  midnight: '#1B1536',
  purple: '#30234D',
  gold: '#D4AF7C',
  ivory: '#F8F6F1',
  ink: '#211B32',
  muted: '#827B8D',
  white: '#FFFFFF',
  green: '#638B70',
  red: '#B75D61',
  cardBg: '#2A1F45',
  cardBgAlt: '#1F1735',
  amber: '#E5A548',
  cyan: '#58A6FF',
};

interface Props {
  visible: boolean;
  course: Course;
  onFinish?: (earnedXp: number) => void;
  onClose: () => void;
}

export default function PhonemeClinicModal({
  visible,
  course,
  onFinish,
  onClose,
}: Props) {
  const [deck, setDeck] = useState<PhonemeSprintChallenge[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedKey, setSelectedKey] = useState<'A' | 'B' | null>(null);
  const [evaluation, setEvaluation] = useState<PhonemeEvaluationResult | null>(null);
  const [totalXp, setTotalXp] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const startNewSession = () => {
    const sprint = buildPhonemeSprint(course.code, 5);
    setDeck(sprint);
    setCurrentIndex(0);
    setSelectedKey(null);
    setEvaluation(null);
    setTotalXp(0);
    setIsCompleted(false);
  };

  useEffect(() => {
    if (visible) {
      startNewSession();
    }
  }, [visible, course.code]);

  const currentChallenge = deck[currentIndex];

  const handlePlayPrompt = (slow: boolean = false) => {
    if (!currentChallenge) return;
    triggerHaptic('light');
    void playEarcon('success');
    void playEmotionalSpeech(currentChallenge.playedWord, {
      languageId: course.code,
      overrideRate: slow ? 0.65 : 0.95,
    });
  };

  const handlePlaySentence = () => {
    if (!currentChallenge) return;
    triggerHaptic('light');
    void playEmotionalSpeech(currentChallenge.targetSentence, {
      languageId: course.code,
      overrideRate: 0.85,
    });
  };

  const handleSelectOption = (key: 'A' | 'B') => {
    if (!currentChallenge || selectedKey) return;
    setSelectedKey(key);

    const res = evaluatePhonemeSprintAnswer(currentChallenge, key);
    setEvaluation(res);
    setTotalXp((prev) => prev + res.earnedXp);

    if (res.isCorrect) {
      triggerHaptic('success');
      void playEarcon('success');
    } else {
      triggerHaptic('error');
      void playEarcon('error');
    }
  };

  const handleNextChallenge = () => {
    if (currentIndex + 1 < deck.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedKey(null);
      setEvaluation(null);
    } else {
      setIsCompleted(true);
      void playEarcon('fanfare');
      if (onFinish) {
        onFinish(totalXp);
      }
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <View style={s.container}>
          {/* Header */}
          <View style={s.header}>
            <View>
              <Text style={s.title}>Phoneme Diagnostic Clinic</Text>
              <Text style={s.subtitle}>
                Minimal Pairs & Muscle Memory • {course.name}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close Phoneme Clinic"
              style={s.closeBtn}
              onPress={onClose}
            >
              <Text style={s.closeText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView
            style={s.scroll}
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {isCompleted ? (
              <View style={s.completeCard}>
                <Text style={s.completeBadge}>CLINIC DRILL COMPLETE</Text>
                <Text style={s.completeTitle}>Acoustic Ears Calibrated! 🎯</Text>
                <Text style={s.completeDesc}>
                  You trained your ear on fine-grained vowel contrasts, mouth
                  mechanics, and minimal pairs across {course.name}.
                </Text>
                <View style={s.xpPill}>
                  <Text style={s.xpPillText}>+{totalXp} XP EARNED</Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  style={s.primaryActionBtn}
                  onPress={startNewSession}
                >
                  <Text style={s.primaryActionText}>Train Again</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  style={s.secondaryActionBtn}
                  onPress={onClose}
                >
                  <Text style={s.secondaryActionText}>Return to Dashboard</Text>
                </Pressable>
              </View>
            ) : currentChallenge ? (
              <View>
                {/* Progress bar */}
                <View style={s.progressRow}>
                  <Text style={s.progressLabel}>
                    Pair {currentIndex + 1} of {deck.length}
                  </Text>
                  <Text style={s.scoreLabel}>XP: +{totalXp}</Text>
                </View>
                <View style={s.progressBarBg}>
                  <View
                    style={[
                      s.progressBarFill,
                      {
                        width: `${((currentIndex + 1) / deck.length) * 100}%`,
                      },
                    ]}
                  />
                </View>

                {/* Acoustic Prompt Player */}
                <View style={s.acousticCard}>
                  <Text style={s.acousticCategory}>
                    CONTRAST: {currentChallenge.pair.category.toUpperCase().replace(/_/g, ' ')}
                  </Text>
                  <Text style={s.acousticPrompt}>
                    Which word did you hear?
                  </Text>

                  <View style={s.audioControlsRow}>
                    <Pressable
                      accessibilityRole="button"
                      style={s.playAudioBtn}
                      onPress={() => handlePlayPrompt(false)}
                    >
                      <Text style={s.playAudioIcon}>🔊</Text>
                      <Text style={s.playAudioText}>Play Normal (1.0x)</Text>
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      style={s.playSlowBtn}
                      onPress={() => handlePlayPrompt(true)}
                    >
                      <Text style={s.playAudioIcon}>🐢</Text>
                      <Text style={s.playSlowText}>Slow Turtle (0.65x)</Text>
                    </Pressable>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    style={s.sentenceContextBtn}
                    onPress={handlePlaySentence}
                  >
                    <Text style={s.sentenceContextText}>
                      💬 Hear in sentence: "{currentChallenge.targetSentence}"
                    </Text>
                  </Pressable>
                </View>

                {/* Two Minimal Pair Choices */}
                <View style={s.optionsContainer}>
                  {currentChallenge.options.map((opt) => {
                    const isSelected = selectedKey === opt.key;
                    const isTarget = currentChallenge.targetChoice === opt.key;

                    return (
                      <Pressable
                        key={opt.key}
                        accessibilityRole="button"
                        style={[
                          s.optionCard,
                          selectedKey && isTarget && s.optionCardCorrect,
                          selectedKey && isSelected && !isTarget && s.optionCardWrong,
                        ]}
                        onPress={() => handleSelectOption(opt.key)}
                        disabled={!!selectedKey}
                      >
                        <View style={s.optionHeaderRow}>
                          <Text style={s.optionBadge}>OPTION {opt.key}</Text>
                          <Text style={s.phonemeBadge}>{opt.phoneme}</Text>
                        </View>
                        <Text style={s.optionWord}>{opt.word}</Text>
                        <Text style={s.optionMeaning}>{opt.meaning}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Diagnostic Evaluation & Mouth Mechanics */}
                {evaluation && (
                  <View
                    style={[
                      s.feedbackCard,
                      evaluation.isCorrect
                        ? s.feedbackCardCorrect
                        : s.feedbackCardWrong,
                    ]}
                  >
                    <View style={s.feedbackHeader}>
                      <Text style={s.feedbackStatus}>
                        {evaluation.isCorrect
                          ? '✓ ACOUSTIC HIT'
                          : '✕ PHONETIC MISS'}
                      </Text>
                      <Text style={s.earnedXpText}>
                        +{evaluation.earnedXp} XP
                      </Text>
                    </View>
                    <Text style={s.feedbackText}>{evaluation.feedback}</Text>

                    <View style={s.mechanicsBox}>
                      <Text style={s.mechanicsTitle}>👄 Mouth Mechanics Tip:</Text>
                      <Text style={s.mechanicsBody}>{evaluation.mouthTip}</Text>
                    </View>

                    <Pressable
                      accessibilityRole="button"
                      style={s.continueBtn}
                      onPress={handleNextChallenge}
                    >
                      <Text style={s.continueBtnText}>
                        {currentIndex + 1 < deck.length
                          ? 'Next Minimal Pair →'
                          : 'View Sprint Results →'}
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            ) : null}
          </ScrollView>
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
  container: {
    width: '100%',
    maxHeight: '92%',
    backgroundColor: C.midnight,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#3D315E',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2D234A',
  },
  title: {
    color: C.ivory,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: C.muted,
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2A1F45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: C.ivory,
    fontSize: 14,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  scoreLabel: {
    color: C.gold,
    fontSize: 12,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#2A1F45',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: C.gold,
    borderRadius: 3,
  },
  acousticCard: {
    backgroundColor: C.cardBg,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3D315E',
    alignItems: 'center',
  },
  acousticCategory: {
    color: C.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  acousticPrompt: {
    color: C.ivory,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
    textAlign: 'center',
  },
  audioControlsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
    width: '100%',
  },
  playAudioBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.purple,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  playAudioIcon: {
    fontSize: 16,
  },
  playAudioText: {
    color: C.white,
    fontSize: 12,
    fontWeight: '700',
  },
  playSlowBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1736',
    borderWidth: 1,
    borderColor: '#3D315E',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  playSlowText: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  sentenceContextBtn: {
    backgroundColor: '#1E1736',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    width: '100%',
  },
  sentenceContextText: {
    color: C.ivory,
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  optionCard: {
    flex: 1,
    backgroundColor: C.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#3D315E',
    alignItems: 'center',
  },
  optionCardCorrect: {
    borderColor: C.green,
    backgroundColor: '#1C3127',
  },
  optionCardWrong: {
    borderColor: C.red,
    backgroundColor: '#351C24',
  },
  optionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  optionBadge: {
    color: C.muted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  phonemeBadge: {
    color: C.cyan,
    fontSize: 11,
    fontWeight: '900',
  },
  optionWord: {
    color: C.ivory,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },
  optionMeaning: {
    color: C.muted,
    fontSize: 11,
    textAlign: 'center',
  },
  feedbackCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginTop: 4,
  },
  feedbackCardCorrect: {
    backgroundColor: '#182B21',
    borderColor: C.green,
  },
  feedbackCardWrong: {
    backgroundColor: '#2D1820',
    borderColor: C.red,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackStatus: {
    color: C.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  earnedXpText: {
    color: C.gold,
    fontSize: 12,
    fontWeight: '800',
  },
  feedbackText: {
    color: C.ivory,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  mechanicsBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  mechanicsTitle: {
    color: C.gold,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  mechanicsBody: {
    color: C.ivory,
    fontSize: 11,
    lineHeight: 16,
  },
  continueBtn: {
    backgroundColor: C.gold,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueBtnText: {
    color: C.midnight,
    fontSize: 13,
    fontWeight: '800',
  },
  completeCard: {
    backgroundColor: C.cardBg,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3D315E',
  },
  completeBadge: {
    color: C.gold,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  completeTitle: {
    color: C.ivory,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  completeDesc: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 16,
  },
  xpPill: {
    backgroundColor: 'rgba(212, 175, 124, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.gold,
    marginBottom: 20,
  },
  xpPillText: {
    color: C.gold,
    fontSize: 14,
    fontWeight: '900',
  },
  primaryActionBtn: {
    backgroundColor: C.gold,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryActionText: {
    color: C.midnight,
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryActionBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryActionText: {
    color: C.muted,
    fontSize: 13,
    fontWeight: '700',
  },
});
