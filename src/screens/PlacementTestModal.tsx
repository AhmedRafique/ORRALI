import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { playPhraseAudio, stopAllAudio } from '../audio';
import { playEarcon } from '../earcons';
import { CEFRLevel } from '../milestones';
import {
  applyPlacementResult,
  buildPlacementQuestionPool,
  evaluatePlacementLevel,
  PlacementQuestion,
} from '../placement';
import { triggerHaptic } from '../sensory';
import { Course, Progress } from '../types';

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
};

interface Props {
  visible: boolean;
  course: Course;
  progress: Progress;
  onApply: (updatedProgress: Progress) => void;
  onClose: () => void;
}

export default function PlacementTestModal({
  visible,
  course,
  progress,
  onApply,
  onClose,
}: Props) {
  const pool = useMemo(() => buildPlacementQuestionPool(course), [course, visible]);

  // Flattened question list: A1 (3), A2 (3), B1 (3), B2 (3)
  const allQuestions = useMemo(() => [
    ...pool.A1,
    ...pool.A2,
    ...pool.B1,
    ...pool.B2,
  ], [pool]);

  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [scoreByLevel, setScoreByLevel] = useState<Record<CEFRLevel, number>>({
    A1: 0,
    A2: 0,
    B1: 0,
    B2: 0,
  });
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (visible) {
      setQuestionIdx(0);
      setSelectedOpt(null);
      setScoreByLevel({ A1: 0, A2: 0, B1: 0, B2: 0 });
      setIsFinished(false);
    }
  }, [visible]);

  const currentQ: PlacementQuestion | undefined = allQuestions[questionIdx];
  const totalQuestions = allQuestions.length;

  const handlePickOption = (option: string) => {
    if (selectedOpt !== null || !currentQ) return;

    setSelectedOpt(option);
    const isCorrect = option === currentQ.item.target;

    if (isCorrect) {
      void triggerHaptic('success');
      void playEarcon('success');
      setScoreByLevel((prev) => ({
        ...prev,
        [currentQ.level]: (prev[currentQ.level] ?? 0) + 1,
      }));
    } else {
      void triggerHaptic('error');
      void playEarcon('error');
    }

    setTimeout(() => {
      setSelectedOpt(null);
      if (questionIdx + 1 >= totalQuestions) {
        setIsFinished(true);
        void playEarcon('fanfare');
      } else {
        setQuestionIdx((i) => i + 1);
      }
    }, 450);
  };

  const assessedLevel = useMemo(() => evaluatePlacementLevel(scoreByLevel), [scoreByLevel]);

  const handleApply = () => {
    void triggerHaptic('success');
    void stopAllAudio();
    const updated = applyPlacementResult(progress, course, assessedLevel, scoreByLevel);
    onApply(updated);
    onClose();
  };

  const handleClose = () => {
    void stopAllAudio();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={handleClose}>
      <View style={s.overlay}>
        <View style={s.card}>
          {/* Header */}
          <View style={s.header}>
            <View>
              <View style={s.badge}>
                <Text style={s.badgeText}>🧭 ADAPTIVE CEFR PLACEMENT TEST</Text>
              </View>
              <Text style={s.subHeader}>
                Testing: Level {currentQ?.level ?? 'A1'} · {course.name}
              </Text>
            </View>
            <Pressable onPress={handleClose} style={s.closeBtn}>
              <Text style={s.closeText}>×</Text>
            </Pressable>
          </View>

          {!isFinished && currentQ ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Progress counter */}
              <View style={s.progressRow}>
                <Text style={s.counter}>
                  Question {questionIdx + 1} of {totalQuestions}
                </Text>
                <View style={s.levelPill}>
                  <Text style={s.levelPillText}>CEFR {currentQ.level}</Text>
                </View>
              </View>

              <View style={s.track}>
                <View
                  style={[
                    s.fill,
                    { width: `${((questionIdx + 1) / Math.max(1, totalQuestions)) * 100}%` },
                  ]}
                />
              </View>

              {/* Question Card */}
              <View style={s.questionCard}>
                <Text style={s.promptLabel}>Translate into {course.name}:</Text>
                <Text style={s.promptEnglish}>"{currentQ.item.en}"</Text>

                <Pressable
                  style={s.audioBtn}
                  onPress={() => {
                    void triggerHaptic('light');
                    void playPhraseAudio(currentQ.item, course.code, undefined, false);
                  }}
                >
                  <Text style={s.audioBtnText}>🔊 Listen Hint</Text>
                </Pressable>
              </View>

              {/* Options List */}
              <View style={s.optionsList}>
                {currentQ.options.map((opt, i) => {
                  const isSelected = selectedOpt === opt;
                  const isTarget = opt === currentQ.item.target;
                  return (
                    <Pressable
                      key={`${opt}-${i}`}
                      disabled={selectedOpt !== null}
                      style={[
                        s.optionBtn,
                        isSelected && s.optionBtnSelected,
                        selectedOpt !== null && isTarget && s.optionBtnCorrect,
                        selectedOpt !== null && isSelected && !isTarget && s.optionBtnWrong,
                      ]}
                      onPress={() => handlePickOption(opt)}
                    >
                      <Text style={s.optionLetter}>{String.fromCharCode(65 + i)}</Text>
                      <Text
                        style={[
                          s.optionText,
                          isSelected && s.optionTextSelected,
                          selectedOpt !== null && isTarget && s.optionTextCorrect,
                        ]}
                      >
                        {opt}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          ) : (
            <View style={s.certifiedArea}>
              <Text style={s.certifiedIcon}>🏆</Text>
              <Text style={s.certifiedTitle}>Placement Certified!</Text>
              <View style={s.assessedBadge}>
                <Text style={s.assessedBadgeText}>
                  Assessed Level: CEFR {assessedLevel}
                </Text>
              </View>

              <Text style={s.certifiedDesc}>
                {assessedLevel === 'B2'
                  ? 'Incredible mastery! You tested out of A1, A2, and B1. Your curriculum, mature SM-2 intervals, and Gold Diplomas are ready.'
                  : assessedLevel === 'B1'
                  ? 'Great proficiency! You tested out of A1 and A2 foundations. You are fast-tracked directly to B1 Threshold.'
                  : assessedLevel === 'A2'
                  ? 'Solid foundation! You tested out of A1 basics. You are fast-tracked directly to A2 Waystage.'
                  : 'Welcome to your language journey! Starting from A1 gives you complete step-by-step foundation.'}
              </Text>

              <View style={s.bountyCard}>
                <Text style={s.bountyTitle}>✦ REWARDS & UNLOCKS</Text>
                <Text style={s.bountyItem}>
                  ✓ Auto-completed chapters: {assessedLevel === 'B2' ? '15 units' : assessedLevel === 'B1' ? '10 units' : assessedLevel === 'A2' ? '5 units' : '0 units'}
                </Text>
                <Text style={s.bountyItem}>
                  ✓ Official Gold Diplomas: {assessedLevel === 'B2' ? 'A1, A2, B1' : assessedLevel === 'B1' ? 'A1, A2' : assessedLevel === 'A2' ? 'A1' : 'Ready to earn'}
                </Text>
                <Text style={s.bountyItem}>
                  ✓ Placement XP Bounty: {assessedLevel === 'B2' ? '+250 XP' : assessedLevel === 'B1' ? '+150 XP' : assessedLevel === 'A2' ? '+75 XP' : '+0 XP'}
                </Text>
              </View>

              <Pressable style={s.applyBtn} onPress={handleApply}>
                <Text style={s.applyBtnText}>Apply Placement & Start Learning ✦</Text>
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
  subHeader: {
    color: C.muted,
    fontSize: 12,
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
  levelPill: {
    backgroundColor: '#EAE5F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  levelPillText: {
    color: '#4B3663',
    fontSize: 11,
    fontWeight: '800',
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
  questionCard: {
    backgroundColor: '#FAF9FC',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ECE6F2',
    marginBottom: 18,
  },
  promptLabel: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  promptEnglish: {
    color: C.midnight,
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginVertical: 10,
  },
  audioBtn: {
    backgroundColor: '#F0EAF8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  audioBtnText: {
    color: C.purple,
    fontSize: 11,
    fontWeight: '800',
  },
  optionsList: {
    gap: 10,
    marginBottom: 10,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#E2D9EB',
  },
  optionBtnSelected: {
    borderColor: C.purple,
    backgroundColor: '#F7F3FB',
  },
  optionBtnCorrect: {
    borderColor: C.green,
    backgroundColor: '#EDF7F1',
  },
  optionBtnWrong: {
    borderColor: C.red,
    backgroundColor: '#FDEEEF',
  },
  optionLetter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1ECF6',
    color: C.purple,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 10,
  },
  optionText: {
    color: C.ink,
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  optionTextSelected: {
    color: C.purple,
    fontWeight: '800',
  },
  optionTextCorrect: {
    color: '#2B5738',
    fontWeight: '800',
  },
  certifiedArea: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  certifiedIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  certifiedTitle: {
    color: C.midnight,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 6,
  },
  assessedBadge: {
    backgroundColor: '#FAF0DE',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EADBBF',
    marginBottom: 12,
  },
  assessedBadgeText: {
    color: '#8A5D1E',
    fontSize: 14,
    fontWeight: '900',
  },
  certifiedDesc: {
    color: C.ink,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  bountyCard: {
    width: '100%',
    backgroundColor: '#FAF9FC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECE6F2',
    marginBottom: 18,
  },
  bountyTitle: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  bountyItem: {
    color: C.ink,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  applyBtn: {
    backgroundColor: C.midnight,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  applyBtnText: {
    color: C.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
