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
  Mission,
  MissionScoreBreakdown,
  MissionStageKind,
} from '../missions/types';
import {
  calculateMissionScore,
  evaluateFinalChallenge,
  evaluateMissionTurn,
  evaluateUnexpectedEvent,
} from '../missions/engine';
import {
  getMissionById,
  getMissionsByLanguage,
} from '../missions/catalog';

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
  initialMissionId?: string;
  onFinish: (result: { missionId: string; score: MissionScoreBreakdown }) => void;
  onClose: () => void;
}

export default function MissionModal({
  visible,
  course,
  initialMissionId,
  onFinish,
  onClose,
}: Props) {
  const availableMissions = useMemo(
    () => getMissionsByLanguage(course.code),
    [course.code]
  );

  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [stage, setStage] = useState<MissionStageKind>('intro');

  // Prep state
  const [prepIndex, setPrepIndex] = useState(0);
  const [prepCorrectCount, setPrepCorrectCount] = useState(0);
  const [prepSelectedOption, setPrepSelectedOption] = useState<number | null>(null);

  // Listening state
  const [listeningSelectedOption, setListeningSelectedOption] = useState<number | null>(null);
  const [listeningPassed, setListeningPassed] = useState(false);

  // Dialogue state
  const [turnIndex, setTurnIndex] = useState(0);
  const [userSpeechInput, setUserSpeechInput] = useState('');
  const [dialogueHistory, setDialogueHistory] = useState<
    Array<{ speaker: string; text: string; isNpc: boolean; branchNotice?: string }>
  >([]);
  const [dialogueResults, setDialogueResults] = useState<
    Array<{ isCommunicative: boolean; relevanceScore: number; grammarScore: number }>
  >([]);
  const [showHints, setShowHints] = useState(false);

  // Unexpected event state
  const [unexpectedInput, setUnexpectedInput] = useState('');
  const [unexpectedResolved, setUnexpectedResolved] = useState(false);
  const [unexpectedFeedback, setUnexpectedFeedback] = useState<string | null>(null);

  // Final challenge state
  const [finalInput, setFinalInput] = useState('');
  const [finalPassed, setFinalPassed] = useState(false);
  const [finalFeedback, setFinalFeedback] = useState<string | null>(null);

  // Evaluation & Phrasebook state
  const [scoreBreakdown, setScoreBreakdown] = useState<MissionScoreBreakdown | null>(null);
  const [savedPhraseMap, setSavedPhraseMap] = useState<Record<string, boolean>>({});

  // Reset or select initial mission
  useEffect(() => {
    if (visible) {
      const target =
        (initialMissionId ? getMissionById(initialMissionId) : null) ??
        availableMissions[0] ??
        null;
      setSelectedMission(target);
      resetMissionState(target);
    }
  }, [visible, initialMissionId, course.code, availableMissions]);

  function resetMissionState(m: Mission | null) {
    setStage('intro');
    setPrepIndex(0);
    setPrepCorrectCount(0);
    setPrepSelectedOption(null);
    setListeningSelectedOption(null);
    setListeningPassed(false);
    setTurnIndex(0);
    setUserSpeechInput('');
    setDialogueResults([]);
    setShowHints(false);
    setUnexpectedInput('');
    setUnexpectedResolved(false);
    setUnexpectedFeedback(null);
    setFinalInput('');
    setFinalPassed(false);
    setFinalFeedback(null);
    setScoreBreakdown(null);
    setSavedPhraseMap({});

    if (m && m.dialogueTurns.length > 0) {
      setDialogueHistory([
        {
          speaker: m.dialogueTurns[0].speaker,
          text: m.dialogueTurns[0].promptText,
          isNpc: true,
        },
      ]);
    } else {
      setDialogueHistory([]);
    }
  }

  function speakText(text: string) {
    try {
      Speech.speak(text, { language: course.speechLang, rate: 0.95 });
    } catch {}
  }

  // --- Handlers ---
  function handleStartPrep() {
    triggerHaptic('light');
    setStage('prep');
  }

  function handleSelectPrepOption(optIdx: number) {
    if (!selectedMission || prepSelectedOption !== null) return;
    setPrepSelectedOption(optIdx);
    const isCorrect = optIdx === selectedMission.prepExercises[prepIndex].correctIndex;
    if (isCorrect) {
      triggerHaptic('success');
      setPrepCorrectCount((c) => c + 1);
    } else {
      triggerHaptic('error');
    }
  }

  function handleAdvancePrep() {
    if (!selectedMission) return;
    if (prepIndex + 1 < selectedMission.prepExercises.length) {
      setPrepIndex((i) => i + 1);
      setPrepSelectedOption(null);
    } else {
      setStage('listening');
      speakText(selectedMission.listeningChallenge.audioPrompt);
    }
  }

  function handleSelectListeningOption(optIdx: number) {
    if (!selectedMission || listeningSelectedOption !== null) return;
    setListeningSelectedOption(optIdx);
    const passed = optIdx === selectedMission.listeningChallenge.correctIndex;
    setListeningPassed(passed);
    if (passed) {
      triggerHaptic('success');
    } else {
      triggerHaptic('error');
    }
  }

  function handleAdvanceToDialogue() {
    if (!selectedMission) return;
    setStage('dialogue');
    if (selectedMission.dialogueTurns.length > 0) {
      speakText(selectedMission.dialogueTurns[0].promptText);
    }
  }

  function handleSubmitDialogueTurn() {
    if (!selectedMission || !userSpeechInput.trim()) return;
    const currentTurn = selectedMission.dialogueTurns[turnIndex];
    if (!currentTurn) return;

    const result = evaluateMissionTurn(currentTurn, userSpeechInput);
    if (result.isCommunicative) {
      triggerHaptic('success');
    } else {
      triggerHaptic('error');
    }

    const newResults = [...dialogueResults, result];
    setDialogueResults(newResults);

    const updatedHistory = [
      ...dialogueHistory,
      { speaker: 'You', text: userSpeechInput, isNpc: false },
    ];

    if (result.branchTaken) {
      updatedHistory.push({
        speaker: currentTurn.speaker,
        text: result.branchTaken,
        isNpc: true,
        branchNotice: 'Dynamic response triggered',
      });
      speakText(result.branchTaken);
    }

    setUserSpeechInput('');

    if (turnIndex + 1 < selectedMission.dialogueTurns.length) {
      const nextTurn = selectedMission.dialogueTurns[turnIndex + 1];
      setTurnIndex((i) => i + 1);
      updatedHistory.push({
        speaker: nextTurn.speaker,
        text: nextTurn.promptText,
        isNpc: true,
      });
      speakText(nextTurn.promptText);
      setDialogueHistory(updatedHistory);
    } else {
      // Advance to unexpected curveball
      setDialogueHistory(updatedHistory);
      setStage('unexpected_event');
      speakText(selectedMission.unexpectedEvent.npcStatement);
    }
  }

  function handleSubmitUnexpected() {
    if (!selectedMission || !unexpectedInput.trim()) return;
    const result = evaluateUnexpectedEvent(selectedMission.unexpectedEvent, unexpectedInput);
    setUnexpectedResolved(result.isResolved);
    setUnexpectedFeedback(result.feedback);

    if (result.isResolved) {
      triggerHaptic('success');
    } else {
      triggerHaptic('error');
    }
  }

  function handleAdvanceToFinalChallenge() {
    setStage('final_challenge');
  }

  function handleSubmitFinalChallenge() {
    if (!selectedMission || !finalInput.trim()) return;
    const result = evaluateFinalChallenge(selectedMission.finalChallenge, finalInput);
    setFinalPassed(result.isPassed);
    setFinalFeedback(result.feedback);

    if (result.isPassed) {
      triggerHaptic('success');
    } else {
      triggerHaptic('error');
    }
  }

  function handleCalculateFinalEvaluation() {
    if (!selectedMission) return;
    const breakdown = calculateMissionScore({
      mission: selectedMission,
      prepCorrectCount,
      prepTotal: selectedMission.prepExercises.length,
      listeningPassed,
      dialogueResults,
      unexpectedResolved,
      finalChallengePassed: finalPassed,
    });

    setScoreBreakdown(breakdown);
    setStage('evaluation');

    if (breakdown.passed) {
      void playEarcon('fanfare');
    } else {
      void playEarcon('error');
    }
  }

  function handleToggleSavePhrase(phrase: string) {
    triggerHaptic('light');
    setSavedPhraseMap((prev) => ({
      ...prev,
      [phrase]: !prev[phrase],
    }));
  }

  function handleCompleteMission() {
    if (!selectedMission || !scoreBreakdown) return;
    triggerHaptic('success');
    onFinish({ missionId: selectedMission.id, score: scoreBreakdown });
    onClose();
  }

  if (!selectedMission) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.modalOverlay}>
        <View style={s.modalContainer}>
          {/* Header */}
          <View style={s.headerRow}>
            <View style={s.badgePill}>
              <Text style={s.badgePillText}>{selectedMission.category.toUpperCase()} MISSION #{selectedMission.number}</Text>
            </View>
            <Pressable onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <Text style={s.title}>{selectedMission.title}</Text>
          <Text style={s.subtitle}>{selectedMission.subtitle}</Text>

          <ScrollView style={s.contentScroll} contentContainerStyle={s.contentContainer}>
            {/* STAGE 1: INTRO */}
            {stage === 'intro' && (
              <View>
                <View style={s.contextCard}>
                  <Text style={s.contextHeading}>📍 Scenario Context</Text>
                  <Text style={s.contextText}>{selectedMission.context}</Text>
                </View>

                <Text style={s.sectionHeading}>Key Vocabulary</Text>
                <View style={s.vocabRow}>
                  {selectedMission.requiredVocabulary.map((v) => (
                    <View key={v.term} style={s.vocabChip}>
                      <Text style={s.vocabTerm}>{v.term}</Text>
                      <Text style={s.vocabTrans}>{v.translation}</Text>
                    </View>
                  ))}
                </View>

                <Text style={s.sectionHeading}>Target Expressions</Text>
                {selectedMission.usefulExpressions.map((e) => (
                  <View key={e.phrase} style={s.expressionCard}>
                    <Text style={s.expressionPhrase}>{e.phrase}</Text>
                    <Text style={s.expressionTrans}>{e.translation}</Text>
                  </View>
                ))}

                <Pressable style={s.primaryBtn} onPress={handleStartPrep}>
                  <Text style={s.primaryBtnText}>Start Preparation Drill</Text>
                </Pressable>
              </View>
            )}

            {/* STAGE 2: PREPARATION DRILL */}
            {stage === 'prep' && (
              <View>
                <Text style={s.stageTag}>STAGE 1 OF 5 — PREPARATION</Text>
                <Text style={s.challengePrompt}>
                  {selectedMission.prepExercises[prepIndex].question}
                </Text>

                {selectedMission.prepExercises[prepIndex].options.map((opt, idx) => {
                  const isSelected = prepSelectedOption === idx;
                  const isCorrect = idx === selectedMission.prepExercises[prepIndex].correctIndex;
                  let optStyle: any = s.optionBtn;
                  if (prepSelectedOption !== null) {
                    if (isCorrect) optStyle = [s.optionBtn, s.optionCorrect];
                    else if (isSelected) optStyle = [s.optionBtn, s.optionWrong];
                  }

                  return (
                    <Pressable
                      key={opt}
                      style={optStyle}
                      onPress={() => handleSelectPrepOption(idx)}
                    >
                      <Text style={s.optionText}>{opt}</Text>
                    </Pressable>
                  );
                })}

                {prepSelectedOption !== null && (
                  <View style={s.explanationBox}>
                    <Text style={s.explanationText}>
                      {selectedMission.prepExercises[prepIndex].explanation}
                    </Text>
                    <Pressable style={s.primaryBtn} onPress={handleAdvancePrep}>
                      <Text style={s.primaryBtnText}>Next Step →</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            )}

            {/* STAGE 3: LISTENING CHALLENGE */}
            {stage === 'listening' && (
              <View>
                <Text style={s.stageTag}>STAGE 2 OF 5 — NATIVE LISTENING CHALLENGE</Text>
                <View style={s.audioCard}>
                  <Text style={s.audioCardHeading}>🎧 Listen Carefully</Text>
                  <Text style={s.audioQuoteText}>"{selectedMission.listeningChallenge.audioPrompt}"</Text>
                  <Pressable
                    style={s.replayBtn}
                    onPress={() => speakText(selectedMission.listeningChallenge.audioPrompt)}
                  >
                    <Text style={s.replayBtnText}>🔊 Replay Audio</Text>
                  </Pressable>
                </View>

                <Text style={s.challengePrompt}>
                  {selectedMission.listeningChallenge.question}
                </Text>

                {selectedMission.listeningChallenge.options.map((opt, idx) => {
                  const isSelected = listeningSelectedOption === idx;
                  const isCorrect = idx === selectedMission.listeningChallenge.correctIndex;
                  let optStyle: any = s.optionBtn;
                  if (listeningSelectedOption !== null) {
                    if (isCorrect) optStyle = [s.optionBtn, s.optionCorrect];
                    else if (isSelected) optStyle = [s.optionBtn, s.optionWrong];
                  }

                  return (
                    <Pressable
                      key={opt}
                      style={optStyle}
                      onPress={() => handleSelectListeningOption(idx)}
                    >
                      <Text style={s.optionText}>{opt}</Text>
                    </Pressable>
                  );
                })}

                {listeningSelectedOption !== null && (
                  <Pressable style={s.primaryBtn} onPress={handleAdvanceToDialogue}>
                    <Text style={s.primaryBtnText}>Begin Interactive Dialogue →</Text>
                  </Pressable>
                )}
              </View>
            )}

            {/* STAGE 4: INTERACTIVE DIALOGUE */}
            {stage === 'dialogue' && (
              <View>
                <Text style={s.stageTag}>
                  STAGE 3 OF 5 — INTERACTIVE DIALOGUE (TURN {turnIndex + 1}/{selectedMission.dialogueTurns.length})
                </Text>

                <View style={s.chatBox}>
                  {dialogueHistory.map((item, idx) => (
                    <View
                      key={idx}
                      style={item.isNpc ? s.npcBubble : s.userBubble}
                    >
                      <Text style={s.bubbleSpeaker}>{item.speaker}</Text>
                      <Text style={s.bubbleText}>{item.text}</Text>
                      {item.branchNotice && (
                        <Text style={s.branchNotice}>⚡ {item.branchNotice}</Text>
                      )}
                    </View>
                  ))}
                </View>

                <View style={s.inputContainer}>
                  <Text style={s.inputPrompt}>
                    Objective: {selectedMission.dialogueTurns[turnIndex]?.expectedIntent}
                  </Text>

                  <TextInput
                    style={s.textInput}
                    placeholder="Type or dictate your response..."
                    placeholderTextColor={C.muted}
                    value={userSpeechInput}
                    onChangeText={setUserSpeechInput}
                  />

                  {/* Useful expression helper chips */}
                  <View style={s.hintChipsRow}>
                    {selectedMission.dialogueTurns[turnIndex]?.hints.map((h) => (
                      <Pressable
                        key={h}
                        style={s.hintChip}
                        onPress={() => setUserSpeechInput(h)}
                      >
                        <Text style={s.hintChipText}>+ {h}</Text>
                      </Pressable>
                    ))}
                  </View>

                  <Pressable style={s.primaryBtn} onPress={handleSubmitDialogueTurn}>
                    <Text style={s.primaryBtnText}>Send Response</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* STAGE 5: UNEXPECTED EVENT CURVEBALL */}
            {stage === 'unexpected_event' && (
              <View>
                <View style={s.curveballCard}>
                  <Text style={s.curveballAlert}>⚡ UNEXPECTED SITUATION</Text>
                  <Text style={s.curveballTitle}>{selectedMission.unexpectedEvent.title}</Text>
                  <Text style={s.curveballSituation}>{selectedMission.unexpectedEvent.situation}</Text>
                  <View style={s.npcQuoteBox}>
                    <Text style={s.npcQuoteText}>"{selectedMission.unexpectedEvent.npcStatement}"</Text>
                    <Text style={s.npcQuoteTrans}>"{selectedMission.unexpectedEvent.npcStatementEn}"</Text>
                  </View>
                </View>

                <Text style={s.challengePrompt}>
                  Your Goal: {selectedMission.unexpectedEvent.learnerObjective}
                </Text>

                <TextInput
                  style={s.textInput}
                  placeholder="How do you handle this situation ?"
                  placeholderTextColor={C.muted}
                  value={unexpectedInput}
                  onChangeText={setUnexpectedInput}
                />

                {!unexpectedFeedback ? (
                  <Pressable style={s.primaryBtn} onPress={handleSubmitUnexpected}>
                    <Text style={s.primaryBtnText}>Submit Decision</Text>
                  </Pressable>
                ) : (
                  <View style={s.explanationBox}>
                    <Text style={s.explanationText}>{unexpectedFeedback}</Text>
                    <Pressable style={s.primaryBtn} onPress={handleAdvanceToFinalChallenge}>
                      <Text style={s.primaryBtnText}>Proceed to Final Challenge →</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            )}

            {/* STAGE 6: FINAL CHALLENGE */}
            {stage === 'final_challenge' && (
              <View>
                <Text style={s.stageTag}>STAGE 5 OF 5 — FINAL MISSION RESOLUTION</Text>
                <Text style={s.challengePrompt}>{selectedMission.finalChallenge.prompt}</Text>
                <Text style={s.challengeSub}>{selectedMission.finalChallenge.promptEn}</Text>

                <TextInput
                  style={s.textInput}
                  placeholder="Solve the final challenge..."
                  placeholderTextColor={C.muted}
                  value={finalInput}
                  onChangeText={setFinalInput}
                />

                {!finalFeedback ? (
                  <Pressable style={s.primaryBtn} onPress={handleSubmitFinalChallenge}>
                    <Text style={s.primaryBtnText}>Submit Final Resolution</Text>
                  </Pressable>
                ) : (
                  <View style={s.explanationBox}>
                    <Text style={s.explanationText}>{finalFeedback}</Text>
                    <Pressable style={s.primaryBtn} onPress={handleCalculateFinalEvaluation}>
                      <Text style={s.primaryBtnText}>View Mission Debrief & Scorecard →</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            )}

            {/* STAGE 7: EVALUATION & SCORECARD */}
            {stage === 'evaluation' && scoreBreakdown && (
              <View>
                <View style={s.debriefCard}>
                  <Text style={s.debriefStatus}>
                    {scoreBreakdown.passed ? '🎉 MISSION COMPLETED' : '⚠️ MISSION UNRESOLVED'}
                  </Text>
                  <Text style={s.debriefRating}>
                    {Math.round(scoreBreakdown.overallScore * 100)}% OVERALL RATING
                  </Text>
                  <Text style={s.debriefFeedback}>{scoreBreakdown.feedback}</Text>
                  <Text style={s.xpBanner}>+{scoreBreakdown.earnedXp} XP EARNED</Text>
                </View>

                <Text style={s.sectionHeading}>Performance Radar Breakdown</Text>
                
                <View style={s.metricRow}>
                  <Text style={s.metricLabel}>Communication Success</Text>
                  <Text style={s.metricVal}>{Math.round(scoreBreakdown.communicationSuccess * 100)}%</Text>
                </View>
                <View style={s.progressBarTrack}>
                  <View style={[s.progressBarFill, { width: `${scoreBreakdown.communicationSuccess * 100}%`, backgroundColor: C.green }]} />
                </View>

                <View style={s.metricRow}>
                  <Text style={s.metricLabel}>Comprehension & Listening</Text>
                  <Text style={s.metricVal}>{Math.round(scoreBreakdown.comprehension * 100)}%</Text>
                </View>
                <View style={s.progressBarTrack}>
                  <View style={[s.progressBarFill, { width: `${scoreBreakdown.comprehension * 100}%`, backgroundColor: C.gold }]} />
                </View>

                <View style={s.metricRow}>
                  <Text style={s.metricLabel}>Vocabulary Accuracy</Text>
                  <Text style={s.metricVal}>{Math.round(scoreBreakdown.vocabularyAccuracy * 100)}%</Text>
                </View>
                <View style={s.progressBarTrack}>
                  <View style={[s.progressBarFill, { width: `${scoreBreakdown.vocabularyAccuracy * 100}%`, backgroundColor: C.blue }]} />
                </View>

                <View style={s.metricRow}>
                  <Text style={s.metricLabel}>Grammar & Syntax</Text>
                  <Text style={s.metricVal}>{Math.round(scoreBreakdown.grammarScore * 100)}%</Text>
                </View>
                <View style={s.progressBarTrack}>
                  <View style={[s.progressBarFill, { width: `${scoreBreakdown.grammarScore * 100}%`, backgroundColor: C.purple }]} />
                </View>

                {scoreBreakdown.suggestedPhrasebookAdds.length > 0 && (
                  <View style={s.phrasebookBox}>
                    <Text style={s.phrasebookHeading}>📖 Recommended for Phrasebook</Text>
                    {scoreBreakdown.suggestedPhrasebookAdds.map((phrase) => {
                      const isSaved = !!savedPhraseMap[phrase];
                      return (
                        <Pressable
                          key={phrase}
                          style={s.phraseAddRow}
                          onPress={() => handleToggleSavePhrase(phrase)}
                        >
                          <Text style={s.phraseAddText}>{phrase}</Text>
                          <Text style={isSaved ? s.phraseSavedBadge : s.phraseSaveBtn}>
                            {isSaved ? '✓ Saved' : '+ Save'}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}

                <Pressable style={s.primaryBtn} onPress={handleCompleteMission}>
                  <Text style={s.primaryBtnText}>Claim XP & Return to World</Text>
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
  contextCard: {
    backgroundColor: C.cardBg,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: C.gold,
  },
  contextHeading: {
    color: C.gold,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  contextText: {
    color: C.ivory,
    fontSize: 13,
    lineHeight: 19,
  },
  sectionHeading: {
    color: C.ivory,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
  },
  vocabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  vocabChip: {
    backgroundColor: C.purple,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  vocabTerm: {
    color: C.gold,
    fontSize: 13,
    fontWeight: '700',
  },
  vocabTrans: {
    color: C.muted,
    fontSize: 11,
  },
  expressionCard: {
    backgroundColor: C.cardBg,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  expressionPhrase: {
    color: C.ivory,
    fontSize: 14,
    fontWeight: '600',
  },
  expressionTrans: {
    color: C.muted,
    fontSize: 12,
    marginTop: 2,
  },
  stageTag: {
    color: C.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  challengePrompt: {
    color: C.ivory,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    lineHeight: 22,
  },
  challengeSub: {
    color: C.muted,
    fontSize: 13,
    marginBottom: 12,
  },
  optionBtn: {
    backgroundColor: C.purple,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionCorrect: {
    borderColor: C.green,
    backgroundColor: '#203B2A',
  },
  optionWrong: {
    borderColor: C.red,
    backgroundColor: '#3B2022',
  },
  optionText: {
    color: C.ivory,
    fontSize: 14,
    fontWeight: '600',
  },
  explanationBox: {
    backgroundColor: C.cardBg,
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  explanationText: {
    color: C.ivory,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  audioCard: {
    backgroundColor: C.cardBg,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  audioCardHeading: {
    color: C.gold,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  audioQuoteText: {
    color: C.ivory,
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10,
  },
  replayBtn: {
    backgroundColor: C.purple,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  replayBtnText: {
    color: C.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  chatBox: {
    backgroundColor: '#130E26',
    borderRadius: 12,
    padding: 12,
    maxHeight: 200,
    marginBottom: 12,
  },
  npcBubble: {
    alignSelf: 'flex-start',
    backgroundColor: C.purple,
    padding: 10,
    borderRadius: 12,
    borderBottomLeftRadius: 2,
    marginBottom: 8,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: C.blue,
    padding: 10,
    borderRadius: 12,
    borderBottomRightRadius: 2,
    marginBottom: 8,
    maxWidth: '85%',
  },
  bubbleSpeaker: {
    color: C.gold,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  bubbleText: {
    color: C.ivory,
    fontSize: 13,
    lineHeight: 18,
  },
  branchNotice: {
    color: C.amber,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  inputContainer: {
    marginTop: 6,
  },
  inputPrompt: {
    color: C.muted,
    fontSize: 12,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: C.cardBg,
    color: C.ivory,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: C.purple,
    marginBottom: 8,
  },
  hintChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  hintChip: {
    backgroundColor: C.purple,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  hintChipText: {
    color: C.gold,
    fontSize: 11,
  },
  curveballCard: {
    backgroundColor: '#351C24',
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: C.amber,
    marginBottom: 14,
  },
  curveballAlert: {
    color: C.amber,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  curveballTitle: {
    color: C.ivory,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  curveballSituation: {
    color: C.ivory,
    fontSize: 13,
    marginBottom: 8,
  },
  npcQuoteBox: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    padding: 8,
    borderRadius: 6,
  },
  npcQuoteText: {
    color: C.gold,
    fontSize: 13,
    fontStyle: 'italic',
  },
  npcQuoteTrans: {
    color: C.muted,
    fontSize: 11,
    marginTop: 2,
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
  debriefRating: {
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
  xpBanner: {
    color: C.amber,
    fontSize: 14,
    fontWeight: '800',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 4,
  },
  metricLabel: {
    color: C.muted,
    fontSize: 12,
  },
  metricVal: {
    color: C.ivory,
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: C.purple,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  phrasebookBox: {
    backgroundColor: C.cardBg,
    padding: 12,
    borderRadius: 12,
    marginTop: 14,
    marginBottom: 14,
  },
  phrasebookHeading: {
    color: C.gold,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  phraseAddRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  phraseAddText: {
    color: C.ivory,
    fontSize: 13,
    flex: 1,
  },
  phraseSaveBtn: {
    color: C.gold,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
  },
  phraseSavedBadge: {
    color: C.green,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
  },
  primaryBtn: {
    backgroundColor: C.gold,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  primaryBtnText: {
    color: C.midnight,
    fontSize: 15,
    fontWeight: '700',
  },
});
