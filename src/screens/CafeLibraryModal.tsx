import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Speech from 'expo-speech';
import { WordAnatomy } from '../anatomy';
import { playEarcon } from '../earcons';
import {
  CafeStory,
  evaluateCafeComprehension,
  getCafeStoriesByLanguage,
  tokenizeStoryParagraph,
} from '../cafeLibrary';
import { getGenderPalette } from '../gender';
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
  paper: '#FAF8F5',
};

interface Props {
  visible: boolean;
  course: Course;
  onFinish: (earnedXp: number) => void;
  onClose: () => void;
}

export default function CafeLibraryModal({ visible, course, onFinish, onClose }: Props) {
  const stories = useMemo(() => getCafeStoriesByLanguage(course.code), [course.code, visible]);
  const [storyIndex, setStoryIndex] = useState(0);
  const [inspectedWord, setInspectedWord] = useState<WordAnatomy | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<{ isPassed: boolean } | null>(null);
  const [isReadingAudio, setIsReadingAudio] = useState(false);

  const story: CafeStory | undefined = stories[storyIndex] ?? stories[0];

  useEffect(() => {
    return () => {
      void Speech.stop();
    };
  }, []);

  const handlePlayAudio = (rate: number) => {
    if (!story) return;
    void triggerHaptic('selection');
    void Speech.stop();

    const fullText = story.paragraphs.join(' ');
    setIsReadingAudio(true);

    void Speech.speak(fullText, {
      language: course.speechLang,
      rate,
      onDone: () => setIsReadingAudio(false),
      onError: () => setIsReadingAudio(false),
    });
  };

  const handleStopAudio = () => {
    void triggerHaptic('light');
    void Speech.stop();
    setIsReadingAudio(false);
  };

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (quizResult?.isPassed) return;
    void triggerHaptic('selection');
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIdx] = optionIdx;
      return next;
    });
  };

  const handleCheckQuiz = () => {
    if (!story || answers.length < story.questions.length) return;

    const res = evaluateCafeComprehension(story, answers);
    setQuizResult({ isPassed: res.isPassed });

    if (res.isPassed) {
      void playEarcon('fanfare');
      void triggerHaptic('success');
    } else {
      void playEarcon('error');
      void triggerHaptic('error');
    }
  };

  const handleClaim = () => {
    void triggerHaptic('success');
    void Speech.stop();
    onFinish(20);
    onClose();
  };

  const handleClose = () => {
    void Speech.stop();
    onClose();
  };

  if (!visible || !story) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={handleClose}>
      <View style={s.overlay}>
        <View style={s.card}>
          {/* Header */}
          <View style={s.header}>
            <View>
              <View style={s.badge}>
                <Text style={s.badgeText}>📚 CAFÉ LIBRARY · READING LOUNGE</Text>
              </View>
              <Text style={s.headerTheme}>{story.culturalTheme}</Text>
            </View>
            <Pressable onPress={handleClose} style={s.closeBtn}>
              <Text style={s.closeText}>×</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Story Title & Meta */}
            <View style={s.titleBox}>
              <Text style={s.storyTitle}>{story.title}</Text>
              <Text style={s.storyTitleEn}>"{story.titleEn}"</Text>
              <Text style={s.readTime}>⏳ {story.readTimeMin} min read · Tap any word to translate</Text>
            </View>

            {/* Audiobook Controls */}
            <View style={s.audiobookRow}>
              {!isReadingAudio ? (
                <>
                  <Pressable style={s.audioBtn} onPress={() => handlePlayAudio(0.95)}>
                    <Text style={s.audioBtnText}>🔊 Read Aloud (Normal)</Text>
                  </Pressable>
                  <Pressable style={s.turtleBtn} onPress={() => handlePlayAudio(0.72)}>
                    <Text style={s.turtleBtnText}>🐢 Turtle Read (0.72x)</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable style={s.stopBtn} onPress={handleStopAudio}>
                  <Text style={s.stopBtnText}>⏹ Stop Audiobook</Text>
                </Pressable>
              )}
            </View>

            {/* Tap-to-Inspect Popover Banner */}
            {inspectedWord && (
              <View style={s.anatomyPopover}>
                <View style={s.popoverTop}>
                  <Text style={s.popoverWord}>{inspectedWord.cleanWord}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {inspectedWord.gender && (() => {
                      const pal = getGenderPalette(inspectedWord.gender);
                      return (
                        <View
                          style={{
                            backgroundColor: pal.badgeBg,
                            borderColor: pal.border,
                            borderWidth: 1,
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 6,
                          }}
                        >
                          <Text style={{ color: pal.badge, fontSize: 10, fontWeight: '800' }}>
                            {pal.symbol} {pal.label}
                          </Text>
                        </View>
                      );
                    })()}
                    <Text style={s.popoverRole}>{inspectedWord.role}</Text>
                  </View>
                </View>
                <Text style={s.popoverMeaning}>Meaning: {inspectedWord.meaningEn}</Text>
              </View>
            )}

            {/* Interactive Story Paragraphs */}
            <View style={s.readingArea}>
              {story.paragraphs.map((paragraph, pIdx) => {
                const words = tokenizeStoryParagraph(paragraph, course.code);
                return (
                  <View key={`p-${pIdx}`} style={s.paragraphBox}>
                    <View style={s.wordsWrap}>
                      {words.map((w, wIdx) => {
                        const isInspected = inspectedWord?.word === w.word;
                        const pal = w.gender ? getGenderPalette(w.gender) : null;
                        return (
                          <Pressable
                            key={`w-${pIdx}-${wIdx}`}
                            style={[
                              s.wordPill,
                              pal && { backgroundColor: pal.badgeBg, borderColor: pal.border },
                              isInspected && s.wordPillActive,
                            ]}
                            onPress={() => {
                              void triggerHaptic('light');
                              setInspectedWord(isInspected ? null : w);
                            }}
                          >
                            <Text
                              style={[
                                s.wordText,
                                pal && { color: pal.badge },
                                isInspected && s.wordTextActive,
                              ]}
                            >
                              {w.word}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Cultural Comprehension Quiz */}
            <View style={s.quizSection}>
              <Text style={s.quizTitle}>Cultural Comprehension Quiz</Text>
              <Text style={s.quizSub}>Answer both questions correctly to earn your reading XP:</Text>

              {story.questions.map((q, qIdx) => (
                <View key={`q-${qIdx}`} style={s.questionBox}>
                  <Text style={s.questionText}>{qIdx + 1}. {q.question}</Text>
                  <View style={s.optionsList}>
                    {q.options.map((opt, oIdx) => {
                      const isPicked = answers[qIdx] === oIdx;
                      return (
                        <Pressable
                          key={`opt-${qIdx}-${oIdx}`}
                          disabled={quizResult?.isPassed}
                          style={[s.optionRow, isPicked && s.optionRowPicked]}
                          onPress={() => handleSelectOption(qIdx, oIdx)}
                        >
                          <Text style={[s.optionRadio, isPicked && s.optionRadioPicked]}>
                            {isPicked ? '●' : '○'}
                          </Text>
                          <Text style={[s.optionLabel, isPicked && s.optionLabelPicked]}>{opt}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}

              {quizResult && (
                <View
                  style={[
                    s.resultBox,
                    quizResult.isPassed ? s.resultBoxOk : s.resultBoxRetry,
                  ]}
                >
                  <Text style={s.resultTitle}>
                    {quizResult.isPassed ? '✓ COMPREHENSION CERTIFIED!' : '✕ SOME ANSWERS INCORRECT'}
                  </Text>
                  <Text style={s.resultText}>
                    {quizResult.isPassed
                      ? 'Formidable! You understood the authentic text in the original language.'
                      : 'Review the story text and try the questions again.'}
                  </Text>
                </View>
              )}

              <View style={s.quizActionRow}>
                {!quizResult?.isPassed ? (
                  <Pressable
                    disabled={answers.length < story.questions.length}
                    style={[
                      s.checkBtn,
                      answers.length < story.questions.length && s.checkBtnDisabled,
                    ]}
                    onPress={handleCheckQuiz}
                  >
                    <Text style={s.checkBtnText}>Verify Comprehension ✦</Text>
                  </Pressable>
                ) : (
                  <Pressable style={s.claimBtn} onPress={handleClaim}>
                    <Text style={s.claimBtnText}>Claim +20 XP & Return</Text>
                  </Pressable>
                )}
              </View>
            </View>
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
  headerTheme: {
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
  titleBox: {
    marginBottom: 14,
  },
  storyTitle: {
    color: C.midnight,
    fontSize: 22,
    fontWeight: '900',
  },
  storyTitleEn: {
    color: C.purple,
    fontSize: 14,
    fontWeight: '700',
    fontStyle: 'italic',
    marginTop: 2,
  },
  readTime: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
  },
  audiobookRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  audioBtn: {
    backgroundColor: C.midnight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  audioBtnText: {
    color: C.white,
    fontSize: 12,
    fontWeight: '800',
  },
  turtleBtn: {
    backgroundColor: '#F3EEF8',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6DEEF',
  },
  turtleBtnText: {
    color: C.purple,
    fontSize: 12,
    fontWeight: '800',
  },
  stopBtn: {
    backgroundColor: C.red,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  stopBtnText: {
    color: C.white,
    fontSize: 12,
    fontWeight: '800',
  },
  anatomyPopover: {
    backgroundColor: '#FAF4E8',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFE2CB',
    marginBottom: 16,
  },
  popoverTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  popoverWord: {
    color: C.midnight,
    fontSize: 15,
    fontWeight: '900',
  },
  popoverRole: {
    color: '#8A5D1E',
    fontSize: 11,
    fontWeight: '800',
  },
  popoverMeaning: {
    color: C.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  readingArea: {
    backgroundColor: C.paper,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#EFECE6',
    marginBottom: 20,
  },
  paragraphBox: {
    marginBottom: 14,
  },
  wordsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  wordPill: {
    backgroundColor: '#FAF9FC',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E8E3EE',
  },
  wordPillActive: {
    borderColor: C.midnight,
    backgroundColor: '#EAE5F0',
  },
  wordText: {
    color: C.ink,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  wordTextActive: {
    fontWeight: '800',
  },
  quizSection: {
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingTop: 16,
    marginBottom: 10,
  },
  quizTitle: {
    color: C.midnight,
    fontSize: 17,
    fontWeight: '900',
  },
  quizSub: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 14,
  },
  questionBox: {
    backgroundColor: '#FAF9FC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECE6F2',
    marginBottom: 14,
  },
  questionText: {
    color: C.ink,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  optionsList: {
    gap: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5DCEF',
  },
  optionRowPicked: {
    borderColor: C.purple,
    backgroundColor: '#F5EFFC',
  },
  optionRadio: {
    color: C.muted,
    fontSize: 14,
    marginRight: 8,
  },
  optionRadioPicked: {
    color: C.purple,
  },
  optionLabel: {
    color: C.ink,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  optionLabelPicked: {
    color: C.purple,
    fontWeight: '800',
  },
  resultBox: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  resultBoxOk: {
    backgroundColor: '#EDF7F1',
    borderColor: '#BFE3CE',
  },
  resultBoxRetry: {
    backgroundColor: '#FCF0F1',
    borderColor: '#F5C5C8',
  },
  resultTitle: {
    color: C.ink,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  resultText: {
    color: C.ink,
    fontSize: 12,
    fontWeight: '600',
  },
  quizActionRow: {
    marginBottom: 8,
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
    fontSize: 14,
    fontWeight: '800',
  },
  claimBtn: {
    backgroundColor: C.green,
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
