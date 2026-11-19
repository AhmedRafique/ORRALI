import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { playEarcon } from '../earcons';
import { triggerHaptic } from '../sensory';
import { Course } from '../types';
import {
  CommunityMission,
  SubtitleWord,
  VideoImmersionClip,
} from '../video/types';
import {
  contributeToCommunityMission,
  evaluateVideoComprehension,
  getActiveSubtitleAtTime,
  saveSubtitleWordToPhrasebook,
} from '../video/loungeEngine';
import {
  getCommunityMissions,
  getVideoClipsByLanguage,
} from '../video/catalog';

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
  amber: '#E5A548',
  blue: '#3A5A98',
};

interface Props {
  visible: boolean;
  course: Course;
  onFinishComprehension?: (earnedXp: number) => void;
  onClose: () => void;
}

export default function VideoLoungeModal({
  visible,
  course,
  onFinishComprehension,
  onClose,
}: Props) {
  const clips = useMemo(
    () => getVideoClipsByLanguage(course.code),
    [course.code]
  );
  const communityMissions = useMemo(
    () => getCommunityMissions(course.code),
    [course.code]
  );

  const [activeClipIndex, setActiveClipIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMs, setCurrentMs] = useState(0);
  const [selectedWord, setSelectedWord] = useState<SubtitleWord | null>(null);
  const [savedWords, setSavedWords] = useState<Record<string, boolean>>({});

  // Comprehension state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [comprehensionFeedback, setComprehensionFeedback] = useState<string | null>(null);
  const [earnedXp, setEarnedXp] = useState(0);

  // Community mission state
  const [activeMission, setActiveMission] = useState<CommunityMission | null>(
    communityMissions[0] ?? null
  );

  const activeClip = clips[activeClipIndex] ?? clips[0];

  // Timer loop for simulated video playback
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (visible && isPlaying && activeClip) {
      timer = setInterval(() => {
        setCurrentMs((prev) => {
          const next = prev + 500;
          if (next >= activeClip.durationSeconds * 1000) {
            setIsPlaying(false);
            return activeClip.durationSeconds * 1000;
          }
          return next;
        });
      }, 500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [visible, isPlaying, activeClip]);

  // Reset when modal opens or clip changes
  useEffect(() => {
    if (visible) {
      setCurrentMs(0);
      setIsPlaying(false);
      setSelectedWord(null);
      setSelectedOption(null);
      setComprehensionFeedback(null);
      setEarnedXp(0);
    }
  }, [visible, activeClipIndex]);

  const activeSubtitle = activeClip
    ? getActiveSubtitleAtTime(activeClip, currentMs)
    : undefined;

  function handlePlayPause() {
    triggerHaptic('light');
    if (!isPlaying && currentMs >= (activeClip?.durationSeconds ?? 0) * 1000) {
      setCurrentMs(0);
    }
    setIsPlaying(!isPlaying);
  }

  function handleWordTap(word: SubtitleWord) {
    triggerHaptic('selection');
    setIsPlaying(false); // auto-pause when learner inspects a word
    setSelectedWord(word);
  }

  function handleSaveWord(word: SubtitleWord) {
    triggerHaptic('success');
    saveSubtitleWordToPhrasebook(word);
    setSavedWords((prev) => ({ ...prev, [word.word]: true }));
  }

  function handleSelectOption(optionIdx: number) {
    if (selectedOption !== null || !activeClip) return;
    setSelectedOption(optionIdx);

    const res = evaluateVideoComprehension(activeClip, optionIdx);
    setEarnedXp(res.earnedXp);
    setComprehensionFeedback(res.feedback);

    if (res.isCorrect) {
      triggerHaptic('success');
      void playEarcon('fanfare');
      if (activeMission) {
        const { updatedMission } = contributeToCommunityMission(activeMission, 1);
        setActiveMission(updatedMission);
      }
    } else {
      triggerHaptic('error');
      void playEarcon('error');
    }

    onFinishComprehension?.(res.earnedXp);
  }

  if (!activeClip) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.modalOverlay}>
        <View style={s.modalContainer}>
          {/* Header */}
          <View style={s.headerRow}>
            <View style={s.badgePill}>
              <Text style={s.badgePillText}>
                VIDEO IMMERSION LOUNGE · {activeClip.level}
              </Text>
            </View>
            <Pressable onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <Text style={s.title}>{activeClip.title}</Text>
          <Text style={s.subtitle}>{activeClip.topic}</Text>

          <ScrollView style={s.scrollArea} contentContainerStyle={s.scrollContent}>
            {/* Video Viewport Simulation */}
            <View style={s.videoViewport}>
              <Text style={s.videoEmoji}>{activeClip.thumbnailEmoji}</Text>
              <Text style={s.speakerTag}>🗣️ {activeClip.speakerName}</Text>

              {/* Progress Scrubber */}
              <View style={s.scrubberRow}>
                <Pressable style={s.playBtn} onPress={handlePlayPause}>
                  <Text style={s.playBtnText}>{isPlaying ? '⏸ Pause' : '▶ Play'}</Text>
                </Pressable>
                <Text style={s.timeText}>
                  {Math.floor(currentMs / 1000)}s / {activeClip.durationSeconds}s
                </Text>
              </View>
            </View>

            {/* Interactive Subtitles Card */}
            <View style={s.subtitlesCard}>
              <Text style={s.subtitlesHeading}>Interactive Subtitles (Tap any word to inspect):</Text>
              {activeSubtitle ? (
                <View>
                  <View style={s.wordsRow}>
                    {activeSubtitle.words.map((w, idx) => (
                      <Pressable
                        key={idx}
                        style={s.wordChip}
                        onPress={() => handleWordTap(w)}
                      >
                        <Text style={s.wordText}>{w.word}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={s.subTranslation}>"{activeSubtitle.translation}"</Text>
                </View>
              ) : (
                <Text style={s.waitingSubText}>
                  {isPlaying ? 'Listening to speech...' : 'Press Play to begin immersion'}
                </Text>
              )}
            </View>

            {/* Word Inspector Popup */}
            {selectedWord && (
              <View style={s.inspectorCard}>
                <View style={s.inspectorHeader}>
                  <Text style={s.inspectorWord}>{selectedWord.word}</Text>
                  {selectedWord.phonetic && (
                    <Text style={s.inspectorPhonetic}>/{selectedWord.phonetic}/</Text>
                  )}
                </View>
                <Text style={s.inspectorTrans}>Translation: {selectedWord.translation}</Text>

                <Pressable
                  style={s.saveWordBtn}
                  onPress={() => handleSaveWord(selectedWord)}
                >
                  <Text style={s.saveWordText}>
                    {savedWords[selectedWord.word]
                      ? '✓ Saved to Phrasebook'
                      : '+ Save to Phrasebook'}
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Comprehension Quiz Card */}
            <View style={s.quizCard}>
              <Text style={s.quizHeading}>🧠 Comprehension Check</Text>
              <Text style={s.quizQuestion}>{activeClip.comprehensionCheck.question}</Text>

              {activeClip.comprehensionCheck.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === activeClip.comprehensionCheck.correctIndex;
                let optStyle: any = s.optionBtn;
                if (selectedOption !== null) {
                  if (isCorrect) optStyle = [s.optionBtn, s.optionCorrect];
                  else if (isSelected) optStyle = [s.optionBtn, s.optionWrong];
                }

                return (
                  <Pressable
                    key={opt}
                    style={optStyle}
                    onPress={() => handleSelectOption(idx)}
                  >
                    <Text style={s.optionText}>{opt}</Text>
                  </Pressable>
                );
              })}

              {comprehensionFeedback && (
                <View style={s.feedbackBox}>
                  <Text style={s.feedbackText}>{comprehensionFeedback}</Text>
                  {earnedXp > 0 && <Text style={s.xpReward}>+{earnedXp} XP</Text>}
                </View>
              )}
            </View>

            {/* Cooperative Community Mission Progress */}
            {activeMission && (
              <View style={s.communityCard}>
                <Text style={s.communityHeading}>🤝 Global Community Goal</Text>
                <Text style={s.communityTitle}>{activeMission.title}</Text>
                <Text style={s.communityDesc}>{activeMission.description}</Text>

                <View style={s.communityProgressRow}>
                  <Text style={s.communityNumbers}>
                    {activeMission.currentCount.toLocaleString()} /{' '}
                    {activeMission.targetCount.toLocaleString()} {activeMission.unitName}
                  </Text>
                  <Text style={s.communityPercent}>
                    {Math.round(
                      (activeMission.currentCount / activeMission.targetCount) * 100
                    )}
                    %
                  </Text>
                </View>
                <View style={s.track}>
                  <View
                    style={[
                      s.fill,
                      {
                        width: `${Math.min(
                          100,
                          (activeMission.currentCount / activeMission.targetCount) * 100
                        )}%`,
                      },
                    ]}
                  />
                </View>
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
    fontSize: 13,
    marginBottom: 16,
  },
  scrollArea: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  videoViewport: {
    backgroundColor: '#0F0B1E',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.purple,
    marginBottom: 14,
  },
  videoEmoji: {
    fontSize: 54,
    marginBottom: 8,
  },
  speakerTag: {
    color: C.gold,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
  },
  scrubberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  playBtn: {
    backgroundColor: C.gold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  playBtnText: {
    color: C.midnight,
    fontSize: 13,
    fontWeight: '800',
  },
  timeText: {
    color: C.ivory,
    fontSize: 12,
    fontWeight: '700',
  },
  subtitlesCard: {
    backgroundColor: C.cardBg,
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: C.gold,
  },
  subtitlesHeading: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
  },
  wordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  wordChip: {
    backgroundColor: C.purple,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  wordText: {
    color: C.ivory,
    fontSize: 15,
    fontWeight: '700',
  },
  subTranslation: {
    color: C.muted,
    fontSize: 13,
    fontStyle: 'italic',
  },
  waitingSubText: {
    color: C.muted,
    fontSize: 13,
    fontStyle: 'italic',
  },
  inspectorCard: {
    backgroundColor: '#1E2C4A',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: C.blue,
  },
  inspectorHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 2,
  },
  inspectorWord: {
    color: C.ivory,
    fontSize: 16,
    fontWeight: '800',
  },
  inspectorPhonetic: {
    color: C.gold,
    fontSize: 12,
    fontStyle: 'italic',
  },
  inspectorTrans: {
    color: C.ivory,
    fontSize: 13,
    marginBottom: 8,
  },
  saveWordBtn: {
    backgroundColor: C.purple,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  saveWordText: {
    color: C.gold,
    fontSize: 11,
    fontWeight: '700',
  },
  quizCard: {
    backgroundColor: C.cardBg,
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  quizHeading: {
    color: C.gold,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  quizQuestion: {
    color: C.ivory,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  optionBtn: {
    backgroundColor: C.purple,
    padding: 12,
    borderRadius: 10,
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
    fontSize: 13,
    fontWeight: '600',
  },
  feedbackBox: {
    backgroundColor: '#130E26',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  feedbackText: {
    color: C.ivory,
    fontSize: 12,
    lineHeight: 18,
  },
  xpReward: {
    color: C.amber,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  communityCard: {
    backgroundColor: '#1D253A',
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: C.blue,
  },
  communityHeading: {
    color: C.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  communityTitle: {
    color: C.ivory,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  communityDesc: {
    color: C.muted,
    fontSize: 12,
    marginBottom: 10,
  },
  communityProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  communityNumbers: {
    color: C.ivory,
    fontSize: 11,
    fontWeight: '700',
  },
  communityPercent: {
    color: C.gold,
    fontSize: 11,
    fontWeight: '800',
  },
  track: {
    height: 6,
    backgroundColor: C.purple,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: C.gold,
    borderRadius: 3,
  },
});
