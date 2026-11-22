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
  AcousticListeningChallenge,
  AmbientNoiseProfile,
  evaluateEarTrainingAnswer,
  generateEarTrainingChallenge,
  SPEECH_RATES,
  SpeechRateTier,
} from '../audio/acousticEarTrainer';
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
};

interface Props {
  visible: boolean;
  course: Course;
  onFinish?: (earnedXp: number) => void;
  onClose: () => void;
}

export default function EarTrainerModal({
  visible,
  course,
  onFinish,
  onClose,
}: Props) {
  const [speedTier, setSpeedTier] = useState<SpeechRateTier>('fast_street');
  const [ambient, setAmbient] = useState<AmbientNoiseProfile>('cafe_clatter');
  const [challenge, setChallenge] = useState<AcousticListeningChallenge | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [resultFeedback, setResultFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Generate a challenge when modal opens or settings change
  const loadNewChallenge = (
    tier: SpeechRateTier = speedTier,
    amb: AmbientNoiseProfile = ambient
  ) => {
    const allItems = course.lessons.flatMap((l) => l.items);
    const randomItem =
      allItems[Math.floor(Math.random() * allItems.length)] ?? allItems[0];
    const ch = generateEarTrainingChallenge(
      randomItem?.target ?? 'Bonjour comment allez-vous',
      randomItem?.en ?? 'Hello how are you',
      course.code,
      tier,
      amb
    );
    setChallenge(ch);
    setSelectedWord(null);
    setResultFeedback(null);
    setIsCorrect(null);
  };

  useEffect(() => {
    if (visible) {
      loadNewChallenge();
    }
  }, [visible, course.code]);

  const handlePlayAudio = () => {
    if (!challenge) return;
    triggerHaptic('light');
    void playEarcon('success');
    void playEmotionalSpeech(challenge.targetPhrase, {
      languageId: course.code,
      overrideRate: challenge.playbackRate,
    });
  };

  const handleSelectOption = (word: string) => {
    if (!challenge || selectedWord) return;
    setSelectedWord(word);
    const res = evaluateEarTrainingAnswer(challenge, word);
    setIsCorrect(res.isCorrect);
    setResultFeedback(res.feedback);

    if (res.isCorrect) {
      triggerHaptic('success');
      void playEarcon('fanfare');
      onFinish?.(res.earnedXp);
    } else {
      triggerHaptic('error');
      void playEarcon('error');
    }
  };

  if (!challenge) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.modalOverlay}>
        <View style={s.modalContainer}>
          {/* Header */}
          <View style={s.headerRow}>
            <View style={s.badgePill}>
              <Text style={s.badgePillText}>
                ⚡ FAST NATIVE EAR TRAINER · {challenge.playbackRate}x
              </Text>
            </View>
            <Pressable onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <Text style={s.title}>Listening World 2.0</Text>
          <Text style={s.subtitle}>
            Train your ear to decode fast street speech over ambient city noise and phonetic liaisons.
          </Text>

          {/* Speed Selector Tabs */}
          <View style={s.speedTabsRow}>
            {(
              [
                ['learner', '0.75x'],
                ['standard', '1.0x'],
                ['fast_street', '1.25x'],
                ['blazing_native', '1.5x'],
              ] as const
            ).map(([tier, label]) => {
              const isActive = speedTier === tier;
              return (
                <Pressable
                  key={tier}
                  style={[s.speedTab, isActive && s.speedTabActive]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setSpeedTier(tier);
                    loadNewChallenge(tier, ambient);
                  }}
                >
                  <Text style={[s.speedTabText, isActive && s.speedTabTextActive]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Ambient Noise Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.ambientScroll}
            contentContainerStyle={s.ambientContent}
          >
            {(
              [
                ['quiet_studio', '🎙️ Studio'],
                ['cafe_clatter', '☕ Café Clatter'],
                ['subway_rumble', '🚇 Metro Rumble'],
                ['street_rain', '🌧️ Street Rain'],
              ] as const
            ).map(([prof, label]) => {
              const isActive = ambient === prof;
              return (
                <Pressable
                  key={prof}
                  style={[s.ambientChip, isActive && s.ambientChipActive]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setAmbient(prof);
                    loadNewChallenge(speedTier, prof);
                  }}
                >
                  <Text
                    style={[
                      s.ambientChipText,
                      isActive && s.ambientChipTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <ScrollView style={s.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Audio Playback Card */}
            <View style={s.audioCard}>
              <Text style={s.audioCardLabel}>
                ACOUSTIC PLAYBACK ({challenge.playbackRate}x Speed)
              </Text>
              <Pressable style={s.playBtn} onPress={handlePlayAudio}>
                <Text style={s.playBtnIcon}>▶</Text>
                <Text style={s.playBtnText}>Play Native Phrase</Text>
              </Pressable>

              {/* Masked Sentence */}
              <View style={s.maskedSentenceBox}>
                <Text style={s.maskedTargetText}>{challenge.maskedTarget}</Text>
                <Text style={s.enText}>"{challenge.en}"</Text>
              </View>
            </View>

            {/* Multiple Choice Options */}
            <Text style={s.optionsLabel}>Which word did you hear in the blank ?</Text>
            <View style={s.optionsGrid}>
              {challenge.distractors.map((word, i) => {
                const isPicked = selectedWord === word;
                return (
                  <Pressable
                    key={i}
                    style={[s.optionPill, isPicked && s.optionPillPicked]}
                    disabled={!!selectedWord}
                    onPress={() => handleSelectOption(word)}
                  >
                    <Text
                      style={[
                        s.optionPillText,
                        isPicked && s.optionPillTextPicked,
                      ]}
                    >
                      {word}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Result Debrief */}
            {resultFeedback && (
              <View
                style={[
                  s.feedbackCard,
                  { borderColor: isCorrect ? C.green : C.red },
                ]}
              >
                <Text
                  style={[
                    s.feedbackHeading,
                    { color: isCorrect ? C.green : C.red },
                  ]}
                >
                  {isCorrect ? '✓ Sound Decoded !' : '⚠️ Ear Slip'}
                </Text>
                <Text style={s.feedbackText}>{resultFeedback}</Text>
              </View>
            )}

            {/* Phonetic Liaison Breakdown */}
            {challenge.liaisons.length > 0 && (
              <View style={s.liaisonCard}>
                <Text style={s.liaisonHeading}>
                  🔍 Street Phonetic Mergers & Liaisons
                </Text>
                {challenge.liaisons.map((l, i) => (
                  <View key={i} style={s.liaisonItem}>
                    <Text style={s.liaisonWords}>
                      "{l.word1}" ➔ "{l.word2}"
                    </Text>
                    <Text style={s.liaisonExpl}>{l.explanation}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Next Challenge Button */}
            {selectedWord && (
              <Pressable
                style={s.nextBtn}
                onPress={() => loadNewChallenge(speedTier, ambient)}
              >
                <Text style={s.nextBtnText}>Next Ear Challenge →</Text>
              </Pressable>
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
    backgroundColor: 'rgba(27, 21, 54, 0.88)',
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
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 16,
  },
  speedTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#130E26',
    borderRadius: 10,
    padding: 4,
    marginBottom: 10,
    gap: 6,
  },
  speedTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  speedTabActive: {
    backgroundColor: C.purple,
  },
  speedTabText: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  speedTabTextActive: {
    color: C.gold,
  },
  ambientScroll: {
    flexGrow: 0,
    marginBottom: 12,
  },
  ambientContent: {
    gap: 6,
  },
  ambientChip: {
    backgroundColor: C.cardBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  ambientChipActive: {
    borderColor: C.gold,
    backgroundColor: '#3F2C68',
  },
  ambientChipText: {
    color: C.ivory,
    fontSize: 12,
    fontWeight: '600',
  },
  ambientChipTextActive: {
    color: C.gold,
    fontWeight: '800',
  },
  scrollArea: {
    flexGrow: 0,
  },
  audioCard: {
    backgroundColor: C.cardBgAlt,
    padding: 16,
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: C.gold,
    marginBottom: 14,
  },
  audioCardLabel: {
    color: C.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.purple,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  playBtnIcon: {
    color: C.gold,
    fontSize: 14,
  },
  playBtnText: {
    color: C.ivory,
    fontSize: 14,
    fontWeight: '700',
  },
  maskedSentenceBox: {
    backgroundColor: '#130E26',
    padding: 12,
    borderRadius: 8,
  },
  maskedTargetText: {
    color: C.ivory,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  enText: {
    color: C.gold,
    fontSize: 12,
    fontStyle: 'italic',
  },
  optionsLabel: {
    color: C.ivory,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  optionPill: {
    backgroundColor: C.cardBg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.purple,
  },
  optionPillPicked: {
    borderColor: C.gold,
    backgroundColor: '#3F2C68',
  },
  optionPillText: {
    color: C.ivory,
    fontSize: 13,
    fontWeight: '700',
  },
  optionPillTextPicked: {
    color: C.gold,
  },
  feedbackCard: {
    backgroundColor: C.cardBg,
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    marginBottom: 12,
  },
  feedbackHeading: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  feedbackText: {
    color: C.ivory,
    fontSize: 12,
    lineHeight: 17,
  },
  liaisonCard: {
    backgroundColor: '#1E1838',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  liaisonHeading: {
    color: C.gold,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
  },
  liaisonItem: {
    marginBottom: 6,
  },
  liaisonWords: {
    color: C.ivory,
    fontSize: 12,
    fontWeight: '700',
  },
  liaisonExpl: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 15,
  },
  nextBtn: {
    backgroundColor: C.gold,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  nextBtnText: {
    color: C.midnight,
    fontSize: 14,
    fontWeight: '800',
  },
});
