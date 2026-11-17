import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { playEarcon } from '../earcons';
import { triggerHaptic } from '../sensory';
import { buildMilestoneExamExercises, CEFRLevel, evaluateMilestoneExam, MILESTONE_DEFS } from '../milestones';
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
  amber: '#E5A548',
};

interface Props {
  visible: boolean;
  course: Course;
  level: CEFRLevel;
  onPass: (earnedXp: number, diplomaKey: string) => void;
  onClose: () => void;
}

export default function MilestoneExamModal({ visible, course, level, onPass, onClose }: Props) {
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [examAttempt, setExamAttempt] = useState(0);

  const def = useMemo(() => MILESTONE_DEFS.find((m) => m.level === level) ?? MILESTONE_DEFS[0], [level]);
  const examExercises = useMemo(
    () => buildMilestoneExamExercises(course, level, 12),
    [course, level, visible, examAttempt]
  );

  const currentEx = examExercises[index];
  const totalQuestions = examExercises.length;

  const handlePickOption = (option: string) => {
    if (selectedOpt !== null || isFinished) return;

    setSelectedOpt(option);
    const isOk = option === currentEx.item.target;
    setIsAnswerCorrect(isOk);

    if (isOk) {
      void triggerHaptic('success');
      void playEarcon('success');
      setCorrectCount((c) => c + 1);
    } else {
      void triggerHaptic('error');
      void playEarcon('error');
    }

    setTimeout(() => {
      setSelectedOpt(null);
      setIsAnswerCorrect(null);
      if (index + 1 >= totalQuestions) {
        setIsFinished(true);
        const examResult = evaluateMilestoneExam(correctCount + (isOk ? 1 : 0), totalQuestions);
        if (examResult.passed) {
          void playEarcon('fanfare');
        }
      } else {
        setIndex((i) => i + 1);
      }
    }, 450);
  };

  const finalResult = evaluateMilestoneExam(correctCount, totalQuestions);
  const diplomaKey = `${course.code}-${level}`;

  const handleClaimDiploma = () => {
    onPass(finalResult.earnedXp, diplomaKey);
    onClose();
  };

  const handleRetry = () => {
    setIndex(0);
    setCorrectCount(0);
    setSelectedOpt(null);
    setIsAnswerCorrect(null);
    setIsFinished(false);
    setExamAttempt((a) => a + 1);
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.card}>
          <View style={s.header}>
            <View style={s.badge}>
              <Text style={s.badgeText}>🏅 CEFR {level} MILESTONE EXAM</Text>
            </View>
            <Pressable onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeText}>×</Text>
            </Pressable>
          </View>

          {/* Active Exam Questions */}
          {!isFinished && currentEx && (
            <View style={s.examArea}>
              <View style={s.progressRow}>
                <View style={s.progressTrack}>
                  <View
                    style={[
                      s.progressFill,
                      { width: `${((index + 1) / totalQuestions) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={s.counter}>
                  {index + 1} / {totalQuestions}
                </Text>
              </View>

              <Text style={s.examKicker}>SYNTHESIS COMPREHENSION</Text>
              <Text style={s.examPrompt}>Choose the correct {course.name} translation for:</Text>
              <View style={s.promptBox}>
                <Text style={s.promptText}>"{currentEx.item.en}"</Text>
              </View>

              <View style={s.optionsList}>
                {currentEx.options?.map((opt, i) => {
                  const isPicked = selectedOpt === opt;
                  let optStyle = s.optDefault;
                  if (isPicked) {
                    optStyle = isAnswerCorrect ? s.optCorrect : s.optWrong;
                  }

                  return (
                    <Pressable
                      key={`${index}-${opt}-${i}`}
                      style={[s.optionItem, optStyle]}
                      onPress={() => handlePickOption(opt)}
                    >
                      <Text style={s.optionText}>{opt}</Text>
                      <Text style={s.optionLetter}>{String.fromCharCode(65 + i)}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* Exam Result Screen */}
          {isFinished && (
            <View style={s.resultArea}>
              {finalResult.passed ? (
                <View style={s.diplomaFrame}>
                  <Text style={s.diplomaIcon}>🏅</Text>
                  <Text style={s.diplomaTitle}>OFFICIAL DIPLOMA</Text>
                  <Text style={s.diplomaLevel}>CEFR {level} FLUENCY</Text>
                  <Text style={s.diplomaCourse}>
                    {course.flag} {course.name} Mastery Certified
                  </Text>
                  <View style={s.diplomaDivider} />
                  <Text style={s.diplomaScore}>
                    Score: {finalResult.scorePct}% ({correctCount}/{totalQuestions} correct)
                  </Text>
                  <Text style={s.diplomaDate}>Issued by ORRALI Language Institute</Text>

                  <Pressable style={s.claimBtn} onPress={handleClaimDiploma}>
                    <Text style={s.claimBtnText}>Claim Diploma & +50 XP</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={s.failedFrame}>
                  <Text style={s.failedIcon}>📚</Text>
                  <Text style={s.failedTitle}>Almost There!</Text>
                  <Text style={s.failedSub}>
                    You scored {finalResult.scorePct}%. A score of 80% is required to earn the official CEFR {level} Gold Diploma.
                  </Text>
                  <Pressable style={s.claimBtn} onPress={handleRetry}>
                    <Text style={s.claimBtnText}>Try Exam Again ↻</Text>
                  </Pressable>
                </View>
              )}
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
    backgroundColor: 'rgba(27, 21, 54, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  card: {
    width: '100%',
    maxHeight: '92%',
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 22,
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
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#FAF0DE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    color: '#8A5D1E',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
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
  examArea: { paddingVertical: 4 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#EAE5EE',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: C.gold, borderRadius: 3 },
  counter: { color: C.muted, fontSize: 11, fontWeight: '800' },
  examKicker: { color: C.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1.2, marginBottom: 4 },
  examPrompt: { color: C.midnight, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  promptBox: {
    backgroundColor: '#F7F4FA',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E2D9E8',
  },
  promptText: { color: C.midnight, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  optionsList: { gap: 10 },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  optDefault: { backgroundColor: '#FAF9FC', borderColor: C.line },
  optCorrect: { backgroundColor: '#EBF4ED', borderColor: C.green },
  optWrong: { backgroundColor: '#F9ECEE', borderColor: C.red },
  optionText: { color: C.ink, fontSize: 14, fontWeight: '700', flex: 1 },
  optionLetter: { color: C.muted, fontSize: 11, fontWeight: '800', marginLeft: 8 },

  // Diploma Styles
  resultArea: { alignItems: 'center', paddingVertical: 14 },
  diplomaFrame: {
    width: '100%',
    backgroundColor: '#FCFAF5',
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: C.gold,
    padding: 22,
    alignItems: 'center',
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  diplomaIcon: { fontSize: 48, marginBottom: 6 },
  diplomaTitle: { color: '#8A5D1E', fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  diplomaLevel: { color: C.midnight, fontSize: 24, fontWeight: '900', marginTop: 4 },
  diplomaCourse: { color: C.ink, fontSize: 14, fontWeight: '700', marginTop: 4 },
  diplomaDivider: {
    width: '80%',
    height: 1,
    backgroundColor: '#E6D7BD',
    marginVertical: 14,
  },
  diplomaScore: { color: C.green, fontSize: 13, fontWeight: '800' },
  diplomaDate: { color: C.muted, fontSize: 10, marginTop: 4, marginBottom: 18 },
  claimBtn: {
    backgroundColor: C.midnight,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  claimBtnText: { color: C.white, fontSize: 13, fontWeight: '800' },

  failedFrame: { width: '100%', alignItems: 'center', padding: 12 },
  failedIcon: { fontSize: 44, marginBottom: 8 },
  failedTitle: { color: C.midnight, fontSize: 20, fontWeight: '800' },
  failedSub: { color: C.muted, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 6, marginBottom: 18 },
});
