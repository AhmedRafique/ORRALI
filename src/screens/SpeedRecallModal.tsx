import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { playEarcon } from '../earcons';
import { triggerHaptic } from '../sensory';
import { calculateSpeedScore, generateSpeedDeck, SpeedScoreResult } from '../speedRecall';
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
  onFinish: (earnedXp: number) => void;
  onClose: () => void;
}

export default function SpeedRecallModal({ visible, course, onFinish, onClose }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [currentCombo, setCurrentCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [pickedOption, setPickedOption] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate 30 rapid-fire questions
  const deck = useMemo(() => generateSpeedDeck(course, 30), [course, isPlaying]);
  const currentQ = deck[currentIndex % deck.length];

  // Start game timer
  useEffect(() => {
    if (isPlaying && timeLeft > 0 && !gameOver) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            void playEarcon('fanfare');
            setGameOver(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, timeLeft, gameOver]);

  const startGame = () => {
    setTimeLeft(60);
    setCurrentIndex(0);
    setCorrectCount(0);
    setTotalAttempts(0);
    setCurrentCombo(0);
    setMaxCombo(0);
    setPickedOption(null);
    setIsAnswerCorrect(null);
    setGameOver(false);
    setIsPlaying(true);
    void triggerHaptic('selection');
  };

  const handlePickOption = (option: string) => {
    if (!isPlaying || gameOver || pickedOption !== null) return;

    setPickedOption(option);
    setTotalAttempts((a) => a + 1);

    const isMatch = option === currentQ.correctTarget;
    setIsAnswerCorrect(isMatch);

    if (isMatch) {
      void triggerHaptic('success');
      void playEarcon('success');
      setCorrectCount((c) => c + 1);
      setCurrentCombo((prev) => {
        const next = prev + 1;
        setMaxCombo((m) => Math.max(m, next));
        return next;
      });
    } else {
      void triggerHaptic('error');
      void playEarcon('error');
      setCurrentCombo(0);
    }

    // Fast advance (220ms flash for rapid arcade pacing)
    setTimeout(() => {
      setPickedOption(null);
      setIsAnswerCorrect(null);
      setCurrentIndex((idx) => idx + 1);
    }, 220);
  };

  const scoreResult: SpeedScoreResult = calculateSpeedScore(
    correctCount,
    totalAttempts,
    maxCombo
  );

  const handleClaim = () => {
    onFinish(scoreResult.totalXp);
    setIsPlaying(false);
    setGameOver(false);
    onClose();
  };

  const handleClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsPlaying(false);
    setGameOver(false);
    onClose();
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={handleClose}>
      <View style={s.overlay}>
        <View style={s.card}>
          <View style={s.header}>
            <View style={s.badge}>
              <Text style={s.badgeText}>⚡ 60-SECOND SPEED RECALL</Text>
            </View>
            <Pressable onPress={handleClose} style={s.closeBtn}>
              <Text style={s.closeText}>×</Text>
            </Pressable>
          </View>

          {/* Screen 1: Welcome / Rules */}
          {!isPlaying && !gameOver && (
            <View style={s.welcomeContent}>
              <Text style={s.welcomeIcon}>⚡</Text>
              <Text style={s.title}>Speed Recall Arcade</Text>
              <Text style={s.subtitle}>
                Test your sub-conscious fluency! Match as many {course.name} phrases as you can before the 60-second timer runs out.
              </Text>

              <View style={s.ruleRow}>
                <Text style={s.ruleIcon}>🔥</Text>
                <Text style={s.ruleText}>Chain consecutive correct answers for Combo XP multipliers.</Text>
              </View>
              <View style={s.ruleRow}>
                <Text style={s.ruleIcon}>🏆</Text>
                <Text style={s.ruleText}>Reach Diamond rank to claim maximum bonus XP!</Text>
              </View>

              <Pressable style={s.startBtn} onPress={startGame}>
                <Text style={s.startBtnText}>Start 60s Challenge ⚡</Text>
              </Pressable>
            </View>
          )}

          {/* Screen 2: Active Gameplay */}
          {isPlaying && !gameOver && currentQ && (
            <View style={s.gameplayArea}>
              <View style={s.timerBarTrack}>
                <View
                  style={[
                    s.timerBarFill,
                    {
                      width: `${(timeLeft / 60) * 100}%`,
                      backgroundColor: timeLeft <= 10 ? C.red : C.gold,
                    },
                  ]}
                />
              </View>

              <View style={s.statsHeader}>
                <Text style={s.timerLabel}>⏱ {timeLeft}s</Text>
                {currentCombo >= 2 ? (
                  <View style={s.comboBadge}>
                    <Text style={s.comboText}>🔥 {currentCombo}x COMBO</Text>
                  </View>
                ) : (
                  <Text style={s.scoreLabel}>{correctCount} correct</Text>
                )}
              </View>

              <View style={s.promptCard}>
                <Text style={s.promptLabel}>MEANING IN ENGLISH:</Text>
                <Text style={s.promptTarget}>"{currentQ.promptEn}"</Text>
              </View>

              <View style={s.optionsGrid}>
                {currentQ.options.map((opt, i) => {
                  const isPicked = pickedOption === opt;
                  let optStyle = s.optDefault;
                  if (isPicked) {
                    optStyle = isAnswerCorrect ? s.optCorrect : s.optWrong;
                  }

                  return (
                    <Pressable
                      key={`${currentIndex}-${opt}-${i}`}
                      style={[s.optionTile, optStyle]}
                      onPress={() => handlePickOption(opt)}
                    >
                      <Text
                        style={[
                          s.optionTileText,
                          isPicked && isAnswerCorrect && s.optionTileTextCorrect,
                          isPicked && !isAnswerCorrect && s.optionTileTextWrong,
                        ]}
                      >
                        {opt}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* Screen 3: Game Over & Trophy Summary */}
          {gameOver && (
            <View style={s.summaryContent}>
              <Text style={s.rankIcon}>
                {scoreResult.rank === 'Diamond'
                  ? '💎'
                  : scoreResult.rank === 'Gold'
                  ? '🥇'
                  : scoreResult.rank === 'Silver'
                  ? '🥈'
                  : '🥉'}
              </Text>
              <Text style={s.summaryRank}>{scoreResult.rank} Recaller</Text>
              <Text style={s.summarySub}>
                You recalled {correctCount} of {totalAttempts} words under time pressure!
              </Text>

              <View style={s.metricsGrid}>
                <View style={s.metricBox}>
                  <Text style={s.metricNum}>+{scoreResult.totalXp}</Text>
                  <Text style={s.metricLabel}>XP EARNED</Text>
                </View>
                <View style={s.metricBox}>
                  <Text style={s.metricNum}>{scoreResult.accuracy}%</Text>
                  <Text style={s.metricLabel}>ACCURACY</Text>
                </View>
                <View style={s.metricBox}>
                  <Text style={s.metricNum}>{maxCombo}x</Text>
                  <Text style={s.metricLabel}>BEST COMBO</Text>
                </View>
              </View>

              <Pressable style={s.claimBtn} onPress={handleClaim}>
                <Text style={s.claimBtnText}>Claim +{scoreResult.totalXp} XP & Continue</Text>
              </Pressable>

              <Pressable style={s.replayBtn} onPress={startGame}>
                <Text style={s.replayBtnText}>Play Again ↻</Text>
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
    backgroundColor: 'rgba(27, 21, 54, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  card: {
    width: '100%',
    maxHeight: '90%',
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

  // Welcome Screen
  welcomeContent: { alignItems: 'center', paddingVertical: 14 },
  welcomeIcon: { fontSize: 44, marginBottom: 10 },
  title: { color: C.midnight, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  subtitle: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF9FB',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: '#EAE5EF',
  },
  ruleIcon: { fontSize: 20, marginRight: 10 },
  ruleText: { color: C.ink, fontSize: 11, fontWeight: '700', flex: 1 },
  startBtn: {
    backgroundColor: C.midnight,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 14,
  },
  startBtnText: { color: C.white, fontSize: 14, fontWeight: '800' },

  // Gameplay Screen
  gameplayArea: { paddingVertical: 6 },
  timerBarTrack: {
    height: 6,
    backgroundColor: '#EAE5EE',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  timerBarFill: { height: '100%', borderRadius: 3 },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  timerLabel: { color: C.midnight, fontSize: 16, fontWeight: '900' },
  scoreLabel: { color: C.muted, fontSize: 12, fontWeight: '800' },
  comboBadge: {
    backgroundColor: '#FAF0DE',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  comboText: { color: '#8A5D1E', fontSize: 11, fontWeight: '900' },
  promptCard: {
    backgroundColor: '#F7F4FA',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E2D9E8',
  },
  promptLabel: {
    color: C.muted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  promptTarget: {
    color: C.midnight,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  optionsGrid: { gap: 10 },
  optionTile: {
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optDefault: { backgroundColor: '#FAF9FC', borderColor: C.line },
  optCorrect: { backgroundColor: '#EBF4ED', borderColor: C.green },
  optWrong: { backgroundColor: '#F9ECEE', borderColor: C.red },
  optionTileText: { color: C.ink, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  optionTileTextCorrect: { color: '#275231', fontWeight: '800' },
  optionTileTextWrong: { color: '#7E2C30', fontWeight: '800' },

  // Summary Screen
  summaryContent: { alignItems: 'center', paddingVertical: 10 },
  rankIcon: { fontSize: 48, marginBottom: 8 },
  summaryRank: { color: C.midnight, fontSize: 24, fontWeight: '800' },
  summarySub: { color: C.muted, fontSize: 12, textAlign: 'center', marginTop: 4, marginBottom: 18 },
  metricsGrid: { flexDirection: 'row', gap: 10, width: '100%', marginBottom: 18 },
  metricBox: {
    flex: 1,
    backgroundColor: '#FAF9FB',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAE5EF',
  },
  metricNum: { color: C.midnight, fontSize: 18, fontWeight: '900' },
  metricLabel: { color: C.muted, fontSize: 9, fontWeight: '800', marginTop: 4 },
  claimBtn: {
    backgroundColor: C.midnight,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  claimBtnText: { color: C.white, fontSize: 13, fontWeight: '800' },
  replayBtn: { paddingVertical: 10 },
  replayBtnText: { color: C.muted, fontSize: 12, fontWeight: '800' },
});
