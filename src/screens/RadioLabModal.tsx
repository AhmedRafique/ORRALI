import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { playPhraseAudio, stopAllAudio } from '../audio';
import { playEarcon } from '../earcons';
import {
  buildRadioLabRound,
  DictationChallenge,
  evaluateDictationAnswer,
} from '../radioLab';
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
  line: '#EAE5EE',
  green: '#638B70',
  red: '#B75D61',
  cardBg: '#2A1F45',
  amber: '#E5A548',
};

interface Props {
  visible: boolean;
  course: Course;
  onFinish: (earnedXp: number) => void;
  onClose: () => void;
}

export default function RadioLabModal({ visible, course, onFinish, onClose }: Props) {
  const round = useMemo(() => buildRadioLabRound(course, 5), [course, visible]);
  const [index, setIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ isOk: boolean } | null>(null);
  const [isRoundFinished, setIsRoundFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const challenge = round[index];
  const totalChallenges = round.length;

  useEffect(() => {
    if (visible) {
      setIndex(0);
      setSelectedWords([]);
      setFeedback(null);
      setIsRoundFinished(false);
      setCorrectCount(0);
    }
  }, [visible]);

  // Auto-play phrase when challenge opens
  useEffect(() => {
    if (visible && challenge) {
      void playPhraseAudio(challenge.item, course.code, undefined, false);
    }
  }, [visible, index, challenge, course.code]);

  const handlePickWord = (word: string) => {
    if (feedback?.isOk || selectedWords.length >= challenge.targetWords.length) return;
    void triggerHaptic('selection');
    setSelectedWords((prev) => [...prev, word]);
  };

  const handleRemoveWord = (wordIndex: number) => {
    if (feedback?.isOk) return;
    void triggerHaptic('selection');
    setSelectedWords((prev) => prev.filter((_, i) => i !== wordIndex));
  };

  const handleCheck = () => {
    if (selectedWords.length !== challenge.targetWords.length) return;
    const isOk = evaluateDictationAnswer(challenge, selectedWords);
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

  const handleNextChallenge = () => {
    void stopAllAudio();
    if (index + 1 >= totalChallenges) {
      setIsRoundFinished(true);
      void playEarcon('fanfare');
    } else {
      setIndex((i) => i + 1);
      setSelectedWords([]);
      setFeedback(null);
    }
  };

  const handleClose = () => {
    void stopAllAudio();
    onClose();
  };

  const handleClaim = () => {
    void triggerHaptic('success');
    void stopAllAudio();
    onFinish(15);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={handleClose}>
      <View style={s.overlay}>
        <View style={s.card}>
          {/* Header with Vintage Radio Tuner Aesthetic */}
          <View style={s.header}>
            <View>
              <View style={s.badge}>
                <Text style={s.badgeText}>📻 RADIO LAB · NATIVE DICTATION</Text>
              </View>
              <Text style={s.tunerFrequency}>FM 98.4 MHz · Connected Speech</Text>
            </View>
            <Pressable onPress={handleClose} style={s.closeBtn}>
              <Text style={s.closeText}>×</Text>
            </Pressable>
          </View>

          {!isRoundFinished ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Broadcast Progress Bar */}
              <View style={s.progressRow}>
                <Text style={s.counter}>
                  Signal {index + 1} of {totalChallenges}
                </Text>
                <Text style={s.streakText}>✦ Score: {correctCount}</Text>
              </View>

              <View style={s.track}>
                <View
                  style={[
                    s.fill,
                    { width: `${((index + 1) / Math.max(1, totalChallenges)) * 100}%` },
                  ]}
                />
              </View>

              {/* Audio Broadcast Station Card */}
              <View style={s.radioStationBox}>
                <Text style={s.broadcastTranslation}>"{challenge?.item.en}"</Text>

                {/* Audio Playback Controls */}
                <View style={s.audioRow}>
                  <Pressable
                    style={s.playBtn}
                    onPress={() => {
                      void triggerHaptic('selection');
                      void playPhraseAudio(challenge.item, course.code, undefined, false);
                    }}
                  >
                    <Text style={s.playIcon}>▶ Normal</Text>
                  </Pressable>

                  <Pressable
                    style={s.turtleBtn}
                    onPress={() => {
                      void triggerHaptic('selection');
                      void playPhraseAudio(challenge.item, course.code, undefined, true);
                    }}
                  >
                    <Text style={s.turtleIcon}>🐢 Slow (0.72x)</Text>
                  </Pressable>
                </View>

                {/* Animated Broadcast Frequency Bars */}
                <View style={s.frequencyBars}>
                  {[12, 28, 16, 36, 22, 44, 18, 30, 14].map((h, i) => (
                    <View
                      key={i}
                      style={[
                        s.freqBar,
                        {
                          height: h,
                          backgroundColor: i % 2 === 0 ? C.gold : '#BF9456',
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>

              {/* Cloze Dictation Slot Assembly */}
              <Text style={s.instructionTitle}>Assemble the missing words from the audio:</Text>
              <View style={s.clozeSentenceArea}>
                {challenge?.tokens.map((token, tIdx) => {
                  const isBlank = challenge.blankIndices.includes(tIdx);

                  if (!isBlank) {
                    return (
                      <View key={`token-${tIdx}`} style={s.plainWordBox}>
                        <Text style={s.plainWordText}>{token}</Text>
                      </View>
                    );
                  }

                  // Find which blank index this slot represents (0, 1, etc.)
                  const slotPos = challenge.blankIndices.indexOf(tIdx);
                  const filledWord = selectedWords[slotPos];

                  return (
                    <Pressable
                      key={`blank-${tIdx}`}
                      style={[
                        s.blankSlot,
                        filledWord && s.blankSlotFilled,
                        feedback && (feedback.isOk ? s.blankSlotCorrect : s.blankSlotWrong),
                      ]}
                      onPress={() => {
                        if (filledWord) handleRemoveWord(slotPos);
                      }}
                    >
                      <Text
                        style={[
                          s.blankSlotText,
                          filledWord && s.blankSlotTextFilled,
                        ]}
                      >
                        {filledWord ?? '?'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Word Bank Chips */}
              <Text style={s.bankTitle}>Tap words to fill the signal blanks:</Text>
              <View style={s.wordBank}>
                {challenge?.wordBank.map((word, wIdx) => {
                  const usedCountInSlots = selectedWords.filter((w) => w === word).length;
                  const totalInBank = challenge.wordBank.filter((w) => w === word).length;
                  const isUsed = usedCountInSlots >= totalInBank;

                  return (
                    <Pressable
                      key={`bank-${word}-${wIdx}`}
                      disabled={isUsed || feedback?.isOk}
                      style={[s.bankChip, isUsed && s.bankChipUsed]}
                      onPress={() => handlePickWord(word)}
                    >
                      <Text style={[s.bankChipText, isUsed && s.bankChipTextUsed]}>
                        {word}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Connected Speech Insight Banner */}
              {feedback && (
                <View
                  style={[
                    s.insightBox,
                    feedback.isOk ? s.insightBoxOk : s.insightBoxRetry,
                  ]}
                >
                  <Text style={s.insightTitle}>
                    {feedback.isOk ? '✓ ACCURATE DICTATION!' : '✕ SIGNAL DISTORTED'}
                  </Text>
                  <Text style={s.insightText}>
                    {feedback.isOk
                      ? challenge.connectedSpeechTip
                      : 'Listen carefully to the audio again and match the missing word cadence.'}
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={s.actionRow}>
                {!feedback?.isOk ? (
                  <Pressable
                    disabled={selectedWords.length !== challenge.targetWords.length}
                    style={[
                      s.checkBtn,
                      selectedWords.length !== challenge.targetWords.length && s.checkBtnDisabled,
                    ]}
                    onPress={handleCheck}
                  >
                    <Text style={s.checkBtnText}>Verify Signal Check ✦</Text>
                  </Pressable>
                ) : (
                  <Pressable style={s.nextBtn} onPress={handleNextChallenge}>
                    <Text style={s.nextBtnText}>Next Broadcast Signal ›</Text>
                  </Pressable>
                )}
              </View>
            </ScrollView>
          ) : (
            <View style={s.finishArea}>
              <Text style={s.finishIcon}>📻</Text>
              <Text style={s.finishTitle}>Broadcast Tuning Complete!</Text>
              <Text style={s.finishSub}>
                You decoded {correctCount} of {totalChallenges} native speech signals with acoustic liaison recognition.
              </Text>
              <Pressable style={s.claimBtn} onPress={handleClaim}>
                <Text style={s.claimBtnText}>Claim +15 XP & Return Home</Text>
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
    maxHeight: '94%',
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
    backgroundColor: '#FAF0DE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#8A5D1E',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  tunerFrequency: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
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
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  counter: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  streakText: {
    color: C.gold,
    fontSize: 12,
    fontWeight: '900',
  },
  track: {
    width: '100%',
    height: 6,
    backgroundColor: C.line,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  fill: {
    height: '100%',
    backgroundColor: C.gold,
    borderRadius: 3,
  },
  radioStationBox: {
    backgroundColor: '#241B3D',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    marginBottom: 18,
  },
  broadcastTranslation: {
    color: C.white,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 14,
  },
  audioRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  playBtn: {
    backgroundColor: C.gold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
  },
  playIcon: {
    color: C.midnight,
    fontSize: 12,
    fontWeight: '800',
  },
  turtleBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  turtleIcon: {
    color: C.white,
    fontSize: 12,
    fontWeight: '800',
  },
  frequencyBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 44,
  },
  freqBar: {
    width: 4,
    borderRadius: 2,
  },
  instructionTitle: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  clozeSentenceArea: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAF9FC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#ECE6F2',
    marginBottom: 18,
  },
  plainWordBox: {
    paddingVertical: 6,
  },
  plainWordText: {
    color: C.midnight,
    fontSize: 17,
    fontWeight: '800',
  },
  blankSlot: {
    minWidth: 54,
    minHeight: 34,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.gold,
    borderStyle: 'dashed',
    backgroundColor: '#FFFDF9',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  blankSlotFilled: {
    borderStyle: 'solid',
    backgroundColor: '#EAF1FA',
    borderColor: '#B8D3F2',
  },
  blankSlotCorrect: {
    backgroundColor: '#EEF7F2',
    borderColor: C.green,
  },
  blankSlotWrong: {
    backgroundColor: '#FDEEEF',
    borderColor: C.red,
  },
  blankSlotText: {
    color: '#BA9255',
    fontSize: 15,
    fontWeight: '900',
  },
  blankSlotTextFilled: {
    color: '#1E5AA8',
  },
  bankTitle: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  wordBank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  bankChip: {
    backgroundColor: '#F3EEF8',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5DCEF',
  },
  bankChipUsed: {
    opacity: 0.35,
    backgroundColor: '#ECE7F2',
  },
  bankChipText: {
    color: C.midnight,
    fontSize: 14,
    fontWeight: '800',
  },
  bankChipTextUsed: {
    color: C.muted,
  },
  insightBox: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  insightBoxOk: {
    backgroundColor: '#EDF7F1',
    borderColor: '#BFE3CE',
  },
  insightBoxRetry: {
    backgroundColor: '#FCF0F1',
    borderColor: '#F5C5C8',
  },
  insightTitle: {
    color: C.ink,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  insightText: {
    color: C.ink,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  actionRow: {
    marginBottom: 10,
  },
  checkBtn: {
    backgroundColor: C.midnight,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  checkBtnDisabled: {
    opacity: 0.45,
  },
  checkBtnText: {
    color: C.white,
    fontSize: 13,
    fontWeight: '800',
  },
  nextBtn: {
    backgroundColor: C.green,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  nextBtnText: {
    color: C.white,
    fontSize: 13,
    fontWeight: '800',
  },
  finishArea: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  finishIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  finishTitle: {
    color: C.midnight,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },
  finishSub: {
    color: C.muted,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  claimBtn: {
    backgroundColor: C.midnight,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  claimBtnText: {
    color: C.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
