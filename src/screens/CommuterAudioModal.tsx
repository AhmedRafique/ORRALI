import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Speech from 'expo-speech';
import { playPhraseAudio, stopAllAudio } from '../audio';
import {
  buildCommuterQueue,
  CommuterStep,
  getCommuterPromptText,
  resolveNextCommuterStep,
} from '../commuterAudio';
import { playEarcon } from '../earcons';
import { triggerHaptic } from '../sensory';
import { Course, Item } from '../types';

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
  cardBg: '#2A1F45',
};

interface Props {
  visible: boolean;
  course: Course;
  items: Item[];
  onFinish: (earnedXp: number) => void;
  onClose: () => void;
}

export default function CommuterAudioModal({
  visible,
  course,
  items,
  onFinish,
  onClose,
}: Props) {
  const queue = useMemo(() => buildCommuterQueue(items, 10), [items, visible]);
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState<CommuterStep>('prompt_en');
  const [isPlaying, setIsPlaying] = useState(true);
  const [playSlowRepeat, setPlaySlowRepeat] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const currentItem = queue[index];
  const totalItems = queue.length;

  // Clear timers on unmount or visibility change
  useEffect(() => {
    isMountedRef.current = true;
    if (visible) {
      setIndex(0);
      setStep('prompt_en');
      setIsPlaying(true);
      setIsCompleted(false);
    } else {
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
      void stopAllAudio();
    }
    return () => {
      isMountedRef.current = false;
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
      void stopAllAudio();
    };
  }, [visible]);

  // Main commuter hands-free state machine
  useEffect(() => {
    if (!visible || !isPlaying || isCompleted || !currentItem) return;

    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);

    if (step === 'prompt_en') {
      const promptText = getCommuterPromptText(course.code, currentItem.en);
      void stopAllAudio();
      void Speech.speak(promptText, {
        language: 'en',
        rate: 0.95,
        onDone: () => {
          if (!isMountedRef.current || !visible) return;
          setStep('thinking_pause');
        },
        onError: () => {
          if (!isMountedRef.current || !visible) return;
          setStep('thinking_pause');
        },
      });
    } else if (step === 'thinking_pause') {
      // 2.8 second thinking pause for learner to produce target phrase in their head or aloud
      stepTimerRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        setStep('target_normal');
      }, 2800);
    } else if (step === 'target_normal') {
      void playPhraseAudio(currentItem, course.code, undefined, false);
      // Average audio duration + pause before slow repeat
      stepTimerRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        setStep(resolveNextCommuterStep('target_normal', playSlowRepeat));
      }, 2600);
    } else if (step === 'short_pause') {
      stepTimerRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        setStep('target_slow');
      }, 1000);
    } else if (step === 'target_slow') {
      void playPhraseAudio(currentItem, course.code, undefined, true);
      stepTimerRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        setStep('completed');
      }, 3200);
    } else if (step === 'completed') {
      // Move to next item or finish session
      stepTimerRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        if (index + 1 >= totalItems) {
          setIsCompleted(true);
          void playEarcon('fanfare');
        } else {
          setIndex((i) => i + 1);
          setStep('prompt_en');
        }
      }, 1200);
    }

    return () => {
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    };
  }, [visible, isPlaying, step, index, currentItem, course.code, playSlowRepeat, isCompleted, totalItems]);

  const handleTogglePlay = () => {
    void triggerHaptic('selection');
    if (isPlaying) {
      void stopAllAudio();
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    void triggerHaptic('selection');
    void stopAllAudio();
    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    if (index + 1 < totalItems) {
      setIndex((i) => i + 1);
      setStep('prompt_en');
    } else {
      setIsCompleted(true);
      void playEarcon('fanfare');
    }
  };

  const handlePrev = () => {
    void triggerHaptic('selection');
    void stopAllAudio();
    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    setIndex((i) => Math.max(0, i - 1));
    setStep('prompt_en');
  };

  const handleClose = () => {
    void stopAllAudio();
    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
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
          {/* Header */}
          <View style={s.header}>
            <View style={s.badge}>
              <Text style={s.badgeText}>🎧 COMMUTER & WALKING AUDIO</Text>
            </View>
            <Pressable onPress={handleClose} style={s.closeBtn}>
              <Text style={s.closeText}>×</Text>
            </Pressable>
          </View>

          {!isCompleted ? (
            <View style={s.content}>
              {/* Progress counter & bar */}
              <View style={s.progressRow}>
                <Text style={s.counter}>
                  Phrase {index + 1} of {totalItems}
                </Text>
                <Pressable
                  style={[s.turtleToggle, playSlowRepeat && s.turtleToggleActive]}
                  onPress={() => {
                    void triggerHaptic('selection');
                    setPlaySlowRepeat(!playSlowRepeat);
                  }}
                >
                  <Text style={[s.turtleToggleText, playSlowRepeat && s.turtleToggleTextActive]}>
                    🐢 Slow Repeat: {playSlowRepeat ? 'ON' : 'OFF'}
                  </Text>
                </Pressable>
              </View>

              <View style={s.track}>
                <View style={[s.fill, { width: `${((index + 1) / Math.max(1, totalItems)) * 100}%` }]} />
              </View>

              {/* Step indicator badge */}
              <View style={s.stepPill}>
                <Text style={s.stepPillText}>
                  {step === 'prompt_en'
                    ? '🎙️ English Prompt'
                    : step === 'thinking_pause'
                    ? '⏳ How do you say it? (Speak or think)'
                    : step === 'target_normal'
                    ? '🔊 Native Studio Audio (1.0x)'
                    : step === 'short_pause'
                    ? '⏸️ Listen closely for accent...'
                    : step === 'target_slow'
                    ? '🐢 Phonetic Turtle Slow (0.72x)'
                    : '✓ Transitioning to next phrase...'}
                </Text>
              </View>

              {/* Main Phrase Card */}
              <View style={s.phraseCard}>
                <Text style={s.meaningEn}>"{currentItem?.en}"</Text>

                {step !== 'prompt_en' && step !== 'thinking_pause' ? (
                  <View style={s.revealedBox}>
                    <Text style={s.targetPhrase}>{currentItem?.target}</Text>
                    {currentItem?.phonetic && (
                      <Text style={s.phonetic}>/{currentItem.phonetic}/</Text>
                    )}
                  </View>
                ) : (
                  <View style={s.hiddenBox}>
                    <Text style={s.hiddenPrompt}>Say it out loud now...</Text>
                  </View>
                )}
              </View>

              {/* Player Controls */}
              <View style={s.controlsRow}>
                <Pressable
                  disabled={index === 0}
                  style={[s.controlBtn, index === 0 && s.controlBtnDisabled]}
                  onPress={handlePrev}
                >
                  <Text style={s.controlIcon}>⏮️</Text>
                  <Text style={s.controlLabel}>Prev</Text>
                </Pressable>

                <Pressable style={s.playBtn} onPress={handleTogglePlay}>
                  <Text style={s.playIcon}>{isPlaying ? '⏸️' : '▶️'}</Text>
                </Pressable>

                <Pressable style={s.controlBtn} onPress={handleNext}>
                  <Text style={s.controlIcon}>⏭️</Text>
                  <Text style={s.controlLabel}>Next</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={s.completedArea}>
              <Text style={s.completedIcon}>🎉</Text>
              <Text style={s.completedTitle}>Commuter Session Complete!</Text>
              <Text style={s.completedSub}>
                You reviewed {totalItems} phrases hands-free with native neural audio. Keep your ears tuned to authentic rhythm!
              </Text>
              <Pressable style={s.claimBtn} onPress={handleClaim}>
                <Text style={s.claimBtnText}>Claim +15 XP & Continue</Text>
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
    marginBottom: 16,
  },
  badge: {
    backgroundColor: '#FAF0DE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    color: '#8A5D1E',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
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
    marginBottom: 8,
  },
  counter: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  turtleToggle: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F1ECF6',
  },
  turtleToggleActive: {
    backgroundColor: '#E7DCF4',
  },
  turtleToggleText: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  turtleToggleTextActive: {
    color: C.purple,
    fontWeight: '800',
  },
  track: {
    width: '100%',
    height: 6,
    backgroundColor: C.line,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 18,
  },
  fill: {
    height: '100%',
    backgroundColor: C.gold,
    borderRadius: 3,
  },
  stepPill: {
    backgroundColor: '#FAF4E8',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE2CB',
    marginBottom: 16,
  },
  stepPillText: {
    color: '#7D581A',
    fontSize: 12,
    fontWeight: '800',
  },
  phraseCard: {
    width: '100%',
    backgroundColor: '#FAF9FC',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ECE6F2',
    minHeight: 180,
    justifyContent: 'center',
    marginBottom: 22,
  },
  meaningEn: {
    color: C.ink,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  revealedBox: {
    alignItems: 'center',
  },
  targetPhrase: {
    color: C.purple,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  phonetic: {
    color: C.muted,
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
    marginTop: 4,
  },
  hiddenBox: {
    paddingVertical: 12,
  },
  hiddenPrompt: {
    color: '#9C93A8',
    fontSize: 14,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  controlBtn: {
    alignItems: 'center',
    padding: 10,
  },
  controlBtnDisabled: {
    opacity: 0.3,
  },
  controlIcon: {
    fontSize: 24,
  },
  controlLabel: {
    color: C.muted,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  playBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: C.midnight,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: C.midnight,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  playIcon: {
    fontSize: 28,
  },
  completedArea: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  completedIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  completedTitle: {
    color: C.midnight,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },
  completedSub: {
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
