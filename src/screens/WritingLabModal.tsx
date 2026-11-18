import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Speech from 'expo-speech';
import { playEarcon } from '../earcons';
import { triggerHaptic } from '../sensory';
import { Course } from '../types';
import {
  WritingChallenge,
  WritingCorrectionResult,
} from '../writing/types';
import {
  countWords,
  evaluateWritingSubmission,
  normalizeText,
} from '../writing/engine';
import {
  getWritingChallengeById,
  getWritingChallengesByLanguage,
} from '../writing/catalog';

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
  amber: '#E5A548',
  blue: '#3A5A98',
};

interface Props {
  visible: boolean;
  course: Course;
  initialChallengeId?: string;
  onFinish: (result: { challengeId: string; correction: WritingCorrectionResult }) => void;
  onClose: () => void;
}

export default function WritingLabModal({
  visible,
  course,
  initialChallengeId,
  onFinish,
  onClose,
}: Props) {
  const availableChallenges = useMemo(
    () => getWritingChallengesByLanguage(course.code),
    [course.code]
  );

  const [selectedChallenge, setSelectedChallenge] = useState<WritingChallenge | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [correctionResult, setCorrectionResult] = useState<WritingCorrectionResult | null>(null);
  const [showIncomingTranslation, setShowIncomingTranslation] = useState(false);

  // Initialize selected challenge
  useEffect(() => {
    if (visible) {
      const target =
        (initialChallengeId ? getWritingChallengeById(initialChallengeId) : null) ??
        availableChallenges[0] ??
        null;
      setSelectedChallenge(target);
      setSubmissionText('');
      setCorrectionResult(null);
      setShowIncomingTranslation(false);
    }
  }, [visible, initialChallengeId, course.code, availableChallenges]);

  const wordCount = useMemo(() => countWords(submissionText), [submissionText]);
  const norm = useMemo(() => normalizeText(submissionText), [submissionText]);

  function speakText(text: string) {
    try {
      Speech.speak(text, { language: course.speechLang, rate: 0.92 });
    } catch {}
  }

  function handleSubmit() {
    if (!selectedChallenge || !submissionText.trim()) return;
    const result = evaluateWritingSubmission(selectedChallenge, submissionText);
    setCorrectionResult(result);

    if (result.isAccurate) {
      triggerHaptic('success');
      void playEarcon('fanfare');
    } else {
      triggerHaptic('error');
      void playEarcon('error');
    }
  }

  function handleClaimXp() {
    if (!selectedChallenge || !correctionResult) return;
    triggerHaptic('success');
    onFinish({ challengeId: selectedChallenge.id, correction: correctionResult });
    onClose();
  }

  function handleInsertPhrase(phrase: string) {
    triggerHaptic('light');
    setSubmissionText((prev) => (prev ? `${prev} ${phrase}` : phrase));
  }

  if (!selectedChallenge) {
    return null;
  }

  const isWordCountSufficient = wordCount >= selectedChallenge.minimumWords;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.modalOverlay}>
        <View style={s.modalContainer}>
          {/* Header */}
          <View style={s.headerRow}>
            <View style={s.badgePill}>
              <Text style={s.badgePillText}>
                {selectedChallenge.format.toUpperCase().replace('_', ' ')} · {selectedChallenge.level}
              </Text>
            </View>
            <Pressable onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <Text style={s.title}>{selectedChallenge.title}</Text>
          <Text style={s.subtitle}>{selectedChallenge.subtitle}</Text>

          <ScrollView style={s.contentScroll} contentContainerStyle={s.contentContainer}>
            {/* WRITING WORKSPACE (Before Submission) */}
            {!correctionResult ? (
              <View>
                {/* Incoming Message Card (if applicable) */}
                {selectedChallenge.incomingMessage && (
                  <View style={s.incomingCard}>
                    <Text style={s.incomingSender}>
                      📨 From: {selectedChallenge.incomingMessage.sender}
                    </Text>
                    <Text style={s.incomingText}>"{selectedChallenge.incomingMessage.text}"</Text>
                    {showIncomingTranslation ? (
                      <Text style={s.incomingTrans}>
                        "{selectedChallenge.incomingMessage.translation}"
                      </Text>
                    ) : (
                      <Pressable
                        style={s.transToggleBtn}
                        onPress={() => setShowIncomingTranslation(true)}
                      >
                        <Text style={s.transToggleText}>Translate message</Text>
                      </Pressable>
                    )}
                  </View>
                )}

                {/* Scenario Instructions Checklist */}
                <View style={s.instructionsCard}>
                  <Text style={s.instructionsHeading}>📋 Writing Objectives</Text>
                  {selectedChallenge.instructions.map((inst, idx) => (
                    <View key={idx} style={s.instructionRow}>
                      <Text style={s.bulletCheck}>•</Text>
                      <Text style={s.instructionText}>{inst}</Text>
                    </View>
                  ))}
                </View>

                {/* Suggested Vocabulary / Expressions Chips */}
                <Text style={s.chipsHeading}>💡 Useful Expressions (Tap to insert):</Text>
                <View style={s.chipsRow}>
                  {selectedChallenge.suggestedExpressions.map((exp) => (
                    <Pressable
                      key={exp.phrase}
                      style={s.exprChip}
                      onPress={() => handleInsertPhrase(exp.phrase)}
                    >
                      <Text style={s.exprChipText}>+ {exp.phrase}</Text>
                    </Pressable>
                  ))}
                </View>

                {/* Editor Area */}
                <View style={s.editorBox}>
                  <TextInput
                    style={s.editorInput}
                    placeholder="Draft your response here..."
                    placeholderTextColor={C.muted}
                    multiline
                    numberOfLines={5}
                    value={submissionText}
                    onChangeText={setSubmissionText}
                  />
                  <View style={s.editorFooter}>
                    <Text
                      style={[
                        s.wordCounter,
                        { color: isWordCountSufficient ? C.green : C.amber },
                      ]}
                    >
                      {wordCount} / {selectedChallenge.minimumWords} words
                    </Text>
                    {submissionText.length > 0 && (
                      <Pressable onPress={() => setSubmissionText('')}>
                        <Text style={s.clearBtnText}>Clear</Text>
                      </Pressable>
                    )}
                  </View>
                </View>

                <Pressable
                  style={[s.primaryBtn, { opacity: submissionText.trim() ? 1.0 : 0.5 }]}
                  disabled={!submissionText.trim()}
                  onPress={handleSubmit}
                >
                  <Text style={s.primaryBtnText}>Submit for Pedagogical Correction ✨</Text>
                </Pressable>
              </View>
            ) : (
              /* CORRECTION DEBRIEF (After Submission) */
              <View>
                {/* Result Header Card */}
                <View style={s.debriefCard}>
                  <Text style={s.debriefStatus}>
                    {correctionResult.isAccurate ? '🎉 WRITING PASSED' : '⚠️ REVISION RECOMMENDED'}
                  </Text>
                  <Text style={s.debriefScore}>
                    {Math.round(correctionResult.score * 100)}% ACCURACY SCORE
                  </Text>
                  <Text style={s.debriefFeedback}>{correctionResult.feedback}</Text>
                  <Text style={s.xpBadge}>+{correctionResult.earnedXp} XP EARNED</Text>
                </View>

                {/* Text Comparison (Original vs Corrected) */}
                <Text style={s.sectionHeading}>Your Text & Grammar Check</Text>
                <View style={s.textDiffCard}>
                  <Text style={s.textDiffLabel}>Original Submission:</Text>
                  <Text style={s.originalText}>{correctionResult.originalText}</Text>

                  {correctionResult.mistakes.length > 0 && (
                    <View style={{ marginTop: 10 }}>
                      <Text style={s.textDiffLabel}>Corrected Grammar:</Text>
                      <Text style={s.correctedText}>{correctionResult.correctedText}</Text>
                    </View>
                  )}
                </View>

                {/* Mistake Spans Breakdown */}
                {correctionResult.mistakes.length > 0 && (
                  <View style={s.mistakesContainer}>
                    <Text style={s.sectionHeading}>Identified Areas for Improvement</Text>
                    {correctionResult.mistakes.map((m) => (
                      <View key={m.id} style={s.mistakeCard}>
                        <View style={s.mistakeHeader}>
                          <View style={s.categoryTag}>
                            <Text style={s.categoryTagText}>{m.category.toUpperCase()}</Text>
                          </View>
                          <Text style={s.mistakeSnippet}>{m.originalSnippet}</Text>
                        </View>
                        <Text style={s.mistakeExplanation}>{m.explanation}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Natural Alternative ("How a Native Speaker Would Write It") */}
                <View style={s.nativeAlternativeCard}>
                  <View style={s.nativeHeader}>
                    <Text style={s.nativeTitle}>🗣️ How a Native Speaker Would Write It</Text>
                    <Pressable
                      style={s.speakerBtn}
                      onPress={() => speakText(correctionResult.naturalAlternative)}
                    >
                      <Text style={s.speakerBtnText}>🔊 Listen</Text>
                    </Pressable>
                  </View>
                  <Text style={s.nativeText}>"{correctionResult.naturalAlternative}"</Text>
                </View>

                {/* Underlying Grammar Rule */}
                <View style={s.ruleCard}>
                  <Text style={s.ruleHeading}>📘 Grammar & Syntax Rule</Text>
                  <Text style={s.ruleText}>{correctionResult.grammarRule}</Text>
                </View>

                {/* Vocabulary Recommendation */}
                <View style={s.vocabUpgradeCard}>
                  <Text style={s.vocabUpgradeHeading}>✨ Vocabulary Upgrade</Text>
                  <Text style={s.vocabUpgradeText}>{correctionResult.vocabularyRecommendation}</Text>
                </View>

                {/* Follow-up Practice Prompt */}
                <View style={s.followUpCard}>
                  <Text style={s.followUpHeading}>🚀 Next Challenge Step</Text>
                  <Text style={s.followUpPrompt}>{correctionResult.followUpExercise.prompt}</Text>
                  <Text style={s.followUpHint}>
                    Target phrasing: {correctionResult.followUpExercise.targetHint}
                  </Text>
                </View>

                <Pressable style={s.primaryBtn} onPress={handleClaimXp}>
                  <Text style={s.primaryBtnText}>Claim XP & Complete Writing Lab</Text>
                </Pressable>

                <Pressable
                  style={s.secondaryBtn}
                  onPress={() => {
                    setCorrectionResult(null);
                    setSubmissionText('');
                  }}
                >
                  <Text style={s.secondaryBtnText}>Revise & Try Again</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 21, 54, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '92%',
    backgroundColor: C.midnight,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.gold,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgePill: {
    backgroundColor: C.purple,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgePillText: {
    color: C.gold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    color: C.muted,
    fontSize: 18,
  },
  title: {
    color: C.ivory,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: C.muted,
    fontSize: 13,
    marginBottom: 16,
  },
  contentScroll: {
    flexGrow: 0,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  incomingCard: {
    backgroundColor: '#1E1838',
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: C.blue,
  },
  incomingSender: {
    color: C.gold,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  incomingText: {
    color: C.ivory,
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  incomingTrans: {
    color: C.muted,
    fontSize: 12,
    marginTop: 6,
  },
  transToggleBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  transToggleText: {
    color: C.gold,
    fontSize: 11,
    fontWeight: '700',
  },
  instructionsCard: {
    backgroundColor: C.cardBg,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  instructionsHeading: {
    color: C.gold,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bulletCheck: {
    color: C.gold,
    fontSize: 14,
    marginRight: 6,
    lineHeight: 18,
  },
  instructionText: {
    color: C.ivory,
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  chipsHeading: {
    color: C.muted,
    fontSize: 12,
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  exprChip: {
    backgroundColor: C.purple,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  exprChipText: {
    color: C.gold,
    fontSize: 11,
    fontWeight: '600',
  },
  editorBox: {
    backgroundColor: '#130E26',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: C.purple,
    marginBottom: 14,
  },
  editorInput: {
    color: C.ivory,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  editorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 6,
  },
  wordCounter: {
    fontSize: 12,
    fontWeight: '700',
  },
  clearBtnText: {
    color: C.muted,
    fontSize: 12,
  },
  debriefCard: {
    backgroundColor: C.cardBg,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  debriefStatus: {
    color: C.gold,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  debriefScore: {
    color: C.ivory,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 6,
  },
  debriefFeedback: {
    color: C.ivory,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
  },
  xpBadge: {
    color: C.amber,
    fontSize: 14,
    fontWeight: '800',
  },
  sectionHeading: {
    color: C.ivory,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 8,
  },
  textDiffCard: {
    backgroundColor: C.cardBg,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  textDiffLabel: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  originalText: {
    color: C.ivory,
    fontSize: 13,
    lineHeight: 18,
  },
  correctedText: {
    color: C.green,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  mistakesContainer: {
    marginBottom: 12,
  },
  mistakeCard: {
    backgroundColor: '#351C24',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: C.red,
    marginBottom: 8,
  },
  mistakeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  categoryTag: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryTagText: {
    color: C.amber,
    fontSize: 9,
    fontWeight: '800',
  },
  mistakeSnippet: {
    color: C.ivory,
    fontSize: 12,
    fontWeight: '700',
  },
  mistakeExplanation: {
    color: C.ivory,
    fontSize: 12,
    lineHeight: 17,
  },
  nativeAlternativeCard: {
    backgroundColor: '#1E1838',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: C.gold,
  },
  nativeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  nativeTitle: {
    color: C.gold,
    fontSize: 13,
    fontWeight: '700',
  },
  speakerBtn: {
    backgroundColor: C.purple,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  speakerBtnText: {
    color: C.gold,
    fontSize: 11,
    fontWeight: '700',
  },
  nativeText: {
    color: C.ivory,
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  ruleCard: {
    backgroundColor: C.cardBg,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  ruleHeading: {
    color: C.gold,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  ruleText: {
    color: C.ivory,
    fontSize: 12,
    lineHeight: 18,
  },
  vocabUpgradeCard: {
    backgroundColor: C.cardBg,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  vocabUpgradeHeading: {
    color: C.gold,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  vocabUpgradeText: {
    color: C.ivory,
    fontSize: 12,
    lineHeight: 18,
  },
  followUpCard: {
    backgroundColor: '#1A2E22',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: C.green,
    marginBottom: 14,
  },
  followUpHeading: {
    color: C.green,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  followUpPrompt: {
    color: C.ivory,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 2,
  },
  followUpHint: {
    color: C.muted,
    fontSize: 11,
    fontStyle: 'italic',
  },
  primaryBtn: {
    backgroundColor: C.gold,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: {
    color: C.midnight,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryBtnText: {
    color: C.muted,
    fontSize: 14,
    fontWeight: '600',
  },
});
