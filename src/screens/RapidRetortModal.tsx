import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  buildRetortDuelDeck,
  evaluateRetortSubmission,
  RapidRetortScenario,
  RetortEvaluation,
} from '../coach/rapidRetort';
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
  coral: '#E36209',
};

interface Props {
  visible: boolean;
  course: Course;
  onFinish?: (earnedXp: number) => void;
  onClose: () => void;
}

export default function RapidRetortModal({
  visible,
  course,
  onFinish,
  onClose,
}: Props) {
  const [deck, setDeck] = useState<RapidRetortScenario[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<RetortEvaluation | null>(null);
  const [totalXp, setTotalXp] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Timer states (10s countdown)
  const [secondsLeft, setSecondsLeft] = useState(10.0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const startNewDuel = () => {
    const rounds = buildRetortDuelDeck(course.code, 3);
    setDeck(rounds);
    setCurrentIndex(0);
    setSelectedText(null);
    setEvaluation(null);
    setTotalXp(0);
    setIsCompleted(false);
    resetTimer();
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSecondsLeft(10.0);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const rem = Math.max(0, 10.0 - elapsed);
      setSecondsLeft(rem);

      if (rem <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 100);
  };

  useEffect(() => {
    if (visible) {
      startNewDuel();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visible, course.code]);

  const currentScenario = deck[currentIndex];

  const handlePlayPrompt = () => {
    if (!currentScenario) return;
    triggerHaptic('light');
    void playEarcon('success');
    void playEmotionalSpeech(currentScenario.incomingPrompt, {
      languageId: course.code,
      overrideRate: 1.05, // Fast conversational rate
    });
  };

  const handleSelectOption = (text: string) => {
    if (!currentScenario || selectedText) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedText(text);
    const elapsed = Math.min(12.0, (Date.now() - startTimeRef.current) / 1000);

    const res = evaluateRetortSubmission(currentScenario, text, elapsed);
    setEvaluation(res);
    setTotalXp((prev) => prev + res.earnedXp);

    if (res.isSuccessful) {
      triggerHaptic('success');
      void playEarcon('success');
    } else {
      triggerHaptic('error');
      void playEarcon('error');
    }
  };

  const handleNextRound = () => {
    if (currentIndex + 1 < deck.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedText(null);
      setEvaluation(null);
      resetTimer();
    } else {
      setIsCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      void playEarcon('fanfare');
      if (onFinish) {
        onFinish(totalXp);
      }
    }
  };

  const timerRatio = Math.max(0, Math.min(1, secondsLeft / 10.0));
  const timerColor =
    timerRatio > 0.5 ? C.green : timerRatio > 0.25 ? C.amber : C.red;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <View style={s.container}>
          {/* Header */}
          <View style={s.header}>
            <View>
              <Text style={s.title}>Rapid Retort Duel ⚡</Text>
              <Text style={s.subtitle}>
                10-Second Conversational Pressure • {course.name}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close Rapid Retort"
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
                <Text style={s.completeBadge}>DUEL SURVIVED</Text>
                <Text style={s.completeTitle}>Fluency Velocity Proven! ⚡</Text>
                <Text style={s.completeDesc}>
                  You held your ground under intense conversational time pressure,
                  using authentic discourse fillers to navigate real-world banter.
                </Text>
                <View style={s.xpPill}>
                  <Text style={s.xpPillText}>+{totalXp} XP EARNED</Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  style={s.primaryActionBtn}
                  onPress={startNewDuel}
                >
                  <Text style={s.primaryActionText}>Duel Again</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  style={s.secondaryActionBtn}
                  onPress={onClose}
                >
                  <Text style={s.secondaryActionText}>Return to Dashboard</Text>
                </Pressable>
              </View>
            ) : currentScenario ? (
              <View>
                {/* Round Tracker & Timer */}
                <View style={s.timerHeaderRow}>
                  <Text style={s.roundBadge}>
                    ROUND {currentIndex + 1} OF {deck.length}
                  </Text>
                  <Text style={[s.countdownNumber, { color: timerColor }]}>
                    ⏱ {secondsLeft.toFixed(1)}s
                  </Text>
                </View>

                {/* Countdown progress bar */}
                <View style={s.timerBarBg}>
                  <View
                    style={[
                      s.timerBarFill,
                      { width: `${timerRatio * 100}%`, backgroundColor: timerColor },
                    ]}
                  />
                </View>

                {/* Scenario Prompt Card */}
                <View style={s.scenarioCard}>
                  <View style={s.scenarioSpeakerRow}>
                    <Text style={s.speakerName}>
                      🗣️ {currentScenario.interlocutorName}
                    </Text>
                    <Text style={s.contextTag}>{currentScenario.context}</Text>
                  </View>

                  <Text style={s.promptSpeechText}>
                    "{currentScenario.incomingPrompt}"
                  </Text>
                  <Text style={s.promptTransText}>
                    "{currentScenario.englishTranslation}"
                  </Text>

                  <Pressable
                    accessibilityRole="button"
                    style={s.listenBtn}
                    onPress={handlePlayPrompt}
                  >
                    <Text style={s.listenBtnText}>🔊 Hear Prompt</Text>
                  </Pressable>
                </View>

                {/* Retort Options List */}
                <Text style={s.optionsHeader}>
                  Choose your spontaneous comeback:
                </Text>

                <View style={s.optionsList}>
                  {currentScenario.options.map((opt, idx) => {
                    const isSelected = selectedText === opt.text;
                    const isNatural = opt.isNaturalComeback;

                    return (
                      <Pressable
                        key={idx}
                        accessibilityRole="button"
                        style={[
                          s.optionBtn,
                          selectedText && isNatural && s.optionCorrect,
                          selectedText && isSelected && !isNatural && s.optionWrong,
                        ]}
                        onPress={() => handleSelectOption(opt.text)}
                        disabled={!!selectedText}
                      >
                        <View style={s.optionHeaderRow}>
                          <Text style={s.optionNumber}>REPLY {idx + 1}</Text>
                          {opt.hasFiller && (
                            <Text style={s.fillerBadge}>+ FILLER BONUS</Text>
                          )}
                        </View>
                        <Text style={s.optionText}>{opt.text}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Evaluation Feedback */}
                {evaluation && (
                  <View
                    style={[
                      s.feedbackCard,
                      evaluation.isSuccessful
                        ? s.feedbackCardCorrect
                        : s.feedbackCardWrong,
                    ]}
                  >
                    <View style={s.feedbackHeader}>
                      <Text style={s.feedbackStatus}>
                        {evaluation.isSuccessful
                          ? '✓ VELOCITY SCORE: ' + evaluation.fluencyScore
                          : '✕ TIMEOUT OR STIFF RETORT'}
                      </Text>
                      <Text style={s.earnedXpText}>
                        +{evaluation.earnedXp} XP
                      </Text>
                    </View>
                    <Text style={s.feedbackText}>{evaluation.feedback}</Text>

                    <View style={s.idealAlternativeBox}>
                      <Text style={s.idealTitle}>💡 Native Speaker Retort:</Text>
                      <Text style={s.idealText}>
                        "{evaluation.nativeAlternative}"
                      </Text>
                    </View>

                    <Pressable
                      accessibilityRole="button"
                      style={s.nextRoundBtn}
                      onPress={handleNextRound}
                    >
                      <Text style={s.nextRoundBtnText}>
                        {currentIndex + 1 < deck.length
                          ? 'Next Retort Duel →'
                          : 'View Duel Results →'}
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
  timerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  roundBadge: {
    color: C.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  countdownNumber: {
    fontSize: 14,
    fontWeight: '900',
  },
  timerBarBg: {
    height: 8,
    backgroundColor: '#2A1F45',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  timerBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  scenarioCard: {
    backgroundColor: C.cardBg,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#3D315E',
    marginBottom: 16,
  },
  scenarioSpeakerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  speakerName: {
    color: C.gold,
    fontSize: 13,
    fontWeight: '800',
  },
  contextTag: {
    color: C.muted,
    fontSize: 10,
    fontStyle: 'italic',
  },
  promptSpeechText: {
    color: C.ivory,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 23,
    marginBottom: 4,
  },
  promptTransText: {
    color: C.muted,
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  listenBtn: {
    backgroundColor: C.purple,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  listenBtnText: {
    color: C.white,
    fontSize: 11,
    fontWeight: '700',
  },
  optionsHeader: {
    color: C.ivory,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
  },
  optionsList: {
    gap: 10,
    marginBottom: 16,
  },
  optionBtn: {
    backgroundColor: C.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: '#3D315E',
  },
  optionCorrect: {
    borderColor: C.green,
    backgroundColor: '#1C3127',
  },
  optionWrong: {
    borderColor: C.red,
    backgroundColor: '#351C24',
  },
  optionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  optionNumber: {
    color: C.muted,
    fontSize: 9,
    fontWeight: '800',
  },
  fillerBadge: {
    color: C.cyan,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  optionText: {
    color: C.ivory,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  feedbackCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
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
  idealAlternativeBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  idealTitle: {
    color: C.gold,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 2,
  },
  idealText: {
    color: C.ivory,
    fontSize: 12,
    fontStyle: 'italic',
  },
  nextRoundBtn: {
    backgroundColor: C.gold,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextRoundBtnText: {
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
