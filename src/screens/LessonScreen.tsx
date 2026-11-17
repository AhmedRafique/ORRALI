import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  createAudioPlayer,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  useAudioRecorder,
} from 'expo-audio';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { findBestVoiceForLanguage, playPhraseAudio, stopAllAudio } from '../audio';
import { buildExercises, evaluateAnswer, evaluateScramble } from '../exercises';
import { playEarcon } from '../earcons';
import { evaluatePronunciation } from '../scoring';
import { triggerHaptic } from '../sensory';
import { Course, Item, LessonCheckpoint, PronunciationResult } from '../types';

const C = {
  midnight: '#1B1536',
  gold: '#D4AF7C',
  ivory: '#F8F6F1',
  ink: '#211B32',
  muted: '#827B8D',
  line: '#E6E0EB',
  white: '#FFFFFF',
  green: '#638B70',
  red: '#B75D61',
  lilac: '#EEE9F6',
};

interface Props {
  course: Course;
  title: string;
  items: Item[];
  lessonId?: string;
  isReview?: boolean;
  initialIndex?: number;
  initialCorrectIds?: string[];
  initialWrongIds?: string[];
  onFinish: (result: { correctIds: string[]; wrongIds: string[] }) => void;
  onSaveCheckpoint?: (checkpoint: LessonCheckpoint) => void;
  onExit: () => void;
}

export default function LessonScreen({
  course,
  title,
  items,
  lessonId,
  isReview = false,
  initialIndex = 0,
  initialCorrectIds = [],
  initialWrongIds = [],
  onFinish,
  onSaveCheckpoint,
  onExit,
}: Props) {
  const exercises = useMemo(() => buildExercises(course, items, isReview), [course, items, isReview]);
  const [index, setIndex] = useState(Math.min(initialIndex, Math.max(0, exercises.length - 1)));
  const [answer, setAnswer] = useState('');
  const [picked, setPicked] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<null | { ok: boolean; expected: string; hint?: string }>(null);
  const [correctIds, setCorrectIds] = useState<string[]>(initialCorrectIds);
  const [wrongIds, setWrongIds] = useState<string[]>(initialWrongIds);
  const [voiceId, setVoiceId] = useState<string | undefined>(undefined);

  // Audio recording & pronunciation state
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const [recordStartTime, setRecordStartTime] = useState<number | null>(null);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [pronunciation, setPronunciation] = useState<PronunciationResult | null>(null);

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript;
    if (text) {
      setLiveTranscript(text);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.log('[ORRALI STT Error]', event.error, event.message);
  });

  const ex = exercises[index];
  const progress = (index + (feedback ? 1 : 0)) / Math.max(1, exercises.length);

  // Discover and set highest quality neural voice for course language (e.g. French / German)
  useEffect(() => {
    let active = true;
    findBestVoiceForLanguage(course.code).then((bestVoice) => {
      if (active && bestVoice) {
        setVoiceId(bestVoice);
      }
    });
    return () => {
      active = false;
    };
  }, [course.code]);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      void stopAllAudio();
    };
  }, []);

  // Stop audio when exercise changes & auto-play if it's an intro card
  useEffect(() => {
    void stopAllAudio();
    setPronunciation(null);
    setIsRecording(false);
    setRecordedUri(null);
    setSelectedIndices([]);

    if (ex?.kind === 'intro') {
      const timer = setTimeout(() => {
        void playPhraseAudio(ex.item, course.code, voiceId);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [index, ex?.kind, ex?.item, course.code, voiceId]);

  // Save checkpoint helper
  const persistCheckpoint = (newIndex: number, newCorrect: string[], newWrong: string[]) => {
    if (lessonId && onSaveCheckpoint && newIndex > 0 && newIndex < exercises.length) {
      onSaveCheckpoint({
        lessonId,
        exerciseIndex: newIndex,
        totalExercises: exercises.length,
        correctIds: newCorrect,
        wrongIds: newWrong,
        updatedAt: Date.now(),
      });
    }
  };

  // Handle exit with audio stop and checkpoint save
  const handleExit = () => {
    void stopAllAudio();
    persistCheckpoint(index, correctIds, wrongIds);
    onExit();
  };

  // Android hardware back press interception
  useEffect(() => {
    const onBackPress = () => {
      Alert.alert(
        'Leave Lesson?',
        'Your progress up to this step is saved. You can resume anytime.',
        [
          { text: 'Keep Learning', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: handleExit },
        ],
        { cancelable: true }
      );
      return true;
    };

    const backSub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => {
      backSub.remove();
    };
  }, [index, correctIds, wrongIds]);

  const confirmExit = () => {
    Alert.alert(
      'Leave Lesson?',
      'Your progress up to this step is saved. You can resume anytime.',
      [
        { text: 'Keep Learning', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: handleExit },
      ],
      { cancelable: true }
    );
  };

  const speak = (item: Item) => {
    void playPhraseAudio(item, course.code, voiceId);
  };

  // Speaking Recording Handlers
  const startRecording = async () => {
    try {
      const perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Microphone Permission Needed',
          'Please enable microphone access in your phone settings to practice speaking out loud.'
        );
        return;
      }
      void stopAllAudio();
      setPronunciation(null);
      setLiveTranscript('');
      setRecordStartTime(Date.now());
      setIsRecording(true);
      void triggerHaptic('light');
      recorder.record();

      // Start native speech recognizer in the course target language
      try {
        const langMap: Record<string, string> = { fr: 'fr-FR', de: 'de-DE', es: 'es-ES' };
        const sttLang = langMap[course.speechLang] ?? 'fr-FR';

        const sttPerm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (sttPerm.granted) {
          ExpoSpeechRecognitionModule.start({
            lang: sttLang,
            interimResults: true,
            maxAlternatives: 1,
            continuous: false,
          });
        }
      } catch (sttErr) {
        console.warn('[ORRALI STT] start error:', sttErr);
      }
    } catch (err) {
      console.warn('[ORRALI Speak] startRecording error:', err);
      setIsRecording(false);
    }
  };

  const stopRecordingAndEvaluate = async () => {
    try {
      setIsRecording(false);
      await recorder.stop();

      try {
        ExpoSpeechRecognitionModule.stop();
      } catch {
        /* best effort */
      }

      const durationMs = recordStartTime ? Date.now() - recordStartTime : 1200;
      setRecordedUri(recorder.uri);

      // Evaluate authentic pronunciation against real recognized transcript
      const result = evaluatePronunciation(ex.item.target, durationMs, liveTranscript);
      setPronunciation(result);
      void triggerHaptic(result.passed ? 'success' : 'warning');

      if (result.passed) {
        const nextCorrect = correctIds.includes(ex.item.id) ? correctIds : [...correctIds, ex.item.id];
        const nextWrong = wrongIds.filter((id) => id !== ex.item.id);
        setCorrectIds(nextCorrect);
        setWrongIds(nextWrong);
        persistCheckpoint(index, nextCorrect, nextWrong);
      } else {
        const nextWrong = wrongIds.includes(ex.item.id) ? wrongIds : [...wrongIds, ex.item.id];
        const nextCorrect = correctIds.filter((id) => id !== ex.item.id);
        setWrongIds(nextWrong);
        setCorrectIds(nextCorrect);
        persistCheckpoint(index, nextCorrect, nextWrong);
      }
    } catch (err) {
      console.warn('[ORRALI Speak] stopRecording error:', err);
      setIsRecording(false);
    }
  };

  const playRecordedAudio = () => {
    if (recordedUri) {
      try {
        const p = createAudioPlayer(recordedUri);
        p.play();
      } catch {}
    }
  };

  // Mutually exclusive correct/wrong answer status with smart evaluation
  const check = () => {
    if (feedback || ex.kind === 'intro' || ex.kind === 'speak') return;

    if (ex.kind === 'scramble') {
      const words = selectedIndices.map((i) => ex.tokens![i]);
      const isOk = evaluateScramble(words, ex.item);
      setFeedback({
        ok: isOk,
        expected: ex.item.target,
        hint: isOk
          ? 'Parfait! Sentence reconstructed accurately.'
          : 'Check the word order carefully and try again.',
      });

      if (isOk) {
        void triggerHaptic('success');
        void playEarcon('success');
        const nextCorrect = correctIds.includes(ex.item.id) ? correctIds : [...correctIds, ex.item.id];
        const nextWrong = wrongIds.filter((id) => id !== ex.item.id);
        setCorrectIds(nextCorrect);
        setWrongIds(nextWrong);
        speak(ex.item);
        persistCheckpoint(index, nextCorrect, nextWrong);
      } else {
        void triggerHaptic('error');
        void playEarcon('error');
        const nextWrong = wrongIds.includes(ex.item.id) ? wrongIds : [...wrongIds, ex.item.id];
        const nextCorrect = correctIds.filter((id) => id !== ex.item.id);
        setWrongIds(nextWrong);
        setCorrectIds(nextCorrect);
        persistCheckpoint(index, nextCorrect, nextWrong);
      }
      return;
    }

    const given = ex.kind === 'choice' ? picked ?? '' : answer;
    const evalRes = evaluateAnswer(given, ex.item);

    setFeedback({
      ok: evalRes.ok,
      expected: evalRes.expected,
      hint: evalRes.hint,
    });

    if (evalRes.ok) {
      void triggerHaptic('success');
      void playEarcon('success');
      const nextCorrect = correctIds.includes(ex.item.id) ? correctIds : [...correctIds, ex.item.id];
      const nextWrong = wrongIds.filter((id) => id !== ex.item.id);
      setCorrectIds(nextCorrect);
      setWrongIds(nextWrong);
      speak(ex.item);
      persistCheckpoint(index, nextCorrect, nextWrong);
    } else {
      void triggerHaptic('error');
      void playEarcon('error');
      const nextWrong = wrongIds.includes(ex.item.id) ? wrongIds : [...wrongIds, ex.item.id];
      const nextCorrect = correctIds.filter((id) => id !== ex.item.id);
      setWrongIds(nextWrong);
      setCorrectIds(nextCorrect);
      persistCheckpoint(index, nextCorrect, nextWrong);
    }
  };

  const next = () => {
    void stopAllAudio();
    if (index + 1 >= exercises.length) {
      void playEarcon('fanfare');
      onFinish({ correctIds, wrongIds });
      return;
    }
    const nextIdx = index + 1;
    setIndex(nextIdx);
    setAnswer('');
    setPicked(null);
    setFeedback(null);
    setPronunciation(null);
    setRecordedUri(null);
    setIsRecording(false);
    setSelectedIndices([]);
    persistCheckpoint(nextIdx, correctIds, wrongIds);
  };

  const canCheck =
    ex.kind === 'choice'
      ? !!picked
      : ex.kind === 'scramble'
      ? selectedIndices.length === (ex.tokens?.length ?? 0)
      : ex.kind === 'speak'
      ? !!pronunciation?.passed
      : answer.trim().length > 0;

  const prompt =
    ex.kind === 'intro'
      ? 'Meet your new phrase'
      : ex.kind === 'scramble'
      ? 'Assemble the sentence in correct order'
      : ex.kind === 'speak'
      ? 'Say this phrase out loud'
      : ex.kind === 'choice'
      ? 'Choose the translation of'
      : ex.kind === 'listen'
      ? 'Listen carefully and type what you hear'
      : `Translate into ${course.name}`;

  return (
    <KeyboardAvoidingView
      style={s.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={s.top}>
          <Pressable onPress={confirmExit} style={s.close}>
            <Text style={s.closeText}>×</Text>
          </Pressable>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={s.counter}>
            {index + 1}/{exercises.length}
          </Text>
        </View>

        <Text style={s.chapter}>{title.toUpperCase()}</Text>
        <Text style={s.prompt}>{prompt}</Text>
        {ex.kind !== 'listen' && ex.kind !== 'intro' && ex.kind !== 'speak' && (
          <Text style={s.meaning}>{ex.item.en}</Text>
        )}

        {/* Phase 1: Intro Card */}
        {ex.kind === 'intro' && (
          <View style={s.introCard}>
            <View style={s.introBadge}>
              <Text style={s.introBadgeText}>NEW PHRASE</Text>
            </View>
            <Text style={s.introTarget}>{ex.item.target}</Text>
            {ex.item.phonetic && <Text style={s.introPhonetic}>/{ex.item.phonetic}/</Text>}
            <Text style={s.introMeaning}>{ex.item.en}</Text>
            <Pressable style={s.playButton} onPress={() => speak(ex.item)}>
              <Text style={s.playIcon}>▶</Text>
              <Text style={s.playText}>Listen carefully</Text>
            </Pressable>
            {ex.item.notes && (
              <View style={s.notesBox}>
                <Text style={s.notesTitle}>CULTURAL & USAGE TIP</Text>
                <Text style={s.notesText}>{ex.item.notes}</Text>
              </View>
            )}
          </View>
        )}

        {/* Phase 2: Speaking Drill */}
        {ex.kind === 'speak' && (
          <View style={s.speakPanel}>
            <Text style={s.speakTarget}>{ex.item.target}</Text>
            {ex.item.phonetic && <Text style={s.speakPhonetic}>/{ex.item.phonetic}/</Text>}
            <Text style={s.speakMeaning}>{ex.item.en}</Text>

            <Pressable style={s.playButton} onPress={() => speak(ex.item)}>
              <Text style={s.playIcon}>▶</Text>
              <Text style={s.playText}>Listen to pronunciation</Text>
            </Pressable>

            <View style={s.micArea}>
              <Pressable
                onPress={isRecording ? stopRecordingAndEvaluate : startRecording}
                style={[s.micButton, isRecording && s.micButtonRecording]}
              >
                <Text style={s.micIcon}>{isRecording ? '⏹' : '🎙'}</Text>
                <Text style={s.micText}>
                  {isRecording ? 'Listening... Tap to finish' : 'Tap to speak'}
                </Text>
              </Pressable>
            </View>

            {isRecording && (
              <View style={s.waveformCard}>
                <Text style={s.waveformLiveBadge}>● LIVE ACOUSTIC SPEECH LAB</Text>
                <View style={s.waveformBars}>
                  {[18, 38, 22, 55, 30, 68, 42, 58, 26, 62, 34, 48, 20].map((h, i) => (
                    <View
                      key={i}
                      style={[
                        s.waveformBar,
                        {
                          height: h,
                          backgroundColor: i % 2 === 0 ? C.gold : '#C79858',
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={s.waveformHint}>Listening to your natural cadence and phonemes…</Text>
              </View>
            )}

            {pronunciation && (
              <View
                style={[
                  s.scoreCard,
                  pronunciation.passed ? s.scoreGood : s.scoreRetry,
                ]}
              >
                <View style={s.scoreTop}>
                  <View style={s.scoreBadge}>
                    <Text style={s.scoreBadgeText}>{pronunciation.overallScore}% CADENCE MATCH</Text>
                  </View>
                  {recordedUri && (
                    <Pressable style={s.playbackBtn} onPress={playRecordedAudio}>
                      <Text style={s.playbackText}>Hear yourself 🔊</Text>
                    </Pressable>
                  )}
                </View>

                {liveTranscript.length > 0 ? (
                  <Text style={s.heardText}>Recognized: "{liveTranscript}"</Text>
                ) : (
                  <Text style={s.heardText}>(No clear speech recognized in {course.name})</Text>
                )}

                <Text style={s.scoreFeedback}>{pronunciation.feedback}</Text>

                <View style={s.wordPills}>
                  {pronunciation.words.map((w, idx) => (
                    <View
                      key={idx}
                      style={[
                        s.wordPill,
                        w.status === 'great'
                          ? s.wordPillGreat
                          : w.status === 'good'
                          ? s.wordPillGood
                          : s.wordPillRetry,
                      ]}
                    >
                      <Text style={s.wordPillText}>{w.word}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Always provide a way to skip or proceed without getting trapped */}
            <Pressable style={s.skipButton} onPress={next}>
              <Text style={s.skipButtonText}>
                {pronunciation ? 'Skip this drill ›' : 'Can’t speak right now? Skip ›'}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Phase 3: Multiple Choice */}
        {ex.kind === 'choice' && (
          <View style={s.options}>
            {ex.options!.map((o, i) => (
              <Pressable
                key={`${ex.item.id}-${o}-${i}`}
                disabled={!!feedback}
                onPress={() => setPicked(o)}
                style={[
                  s.option,
                  picked === o && s.optionPicked,
                  feedback && o === ex.item.target && s.optionCorrect,
                  feedback && picked === o && o !== ex.item.target && s.optionWrong,
                ]}
              >
                <Text style={[s.optionText, picked === o && s.optionTextPicked]}>{o}</Text>
                <Text style={s.optionLetter}>{String.fromCharCode(65 + i)}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Phase 3b: Interactive Sentence Scramble (Word Tiles) */}
        {ex.kind === 'scramble' && (
          <View style={s.scramblePanel}>
            <Text style={s.scrambleMeaning}>"{ex.item.en}"</Text>

            {/* Selected Word Tiles Slot */}
            <View style={s.slotArea}>
              {selectedIndices.length === 0 ? (
                <Text style={s.slotPlaceholder}>Tap word tiles below to assemble the sentence…</Text>
              ) : (
                <View style={s.slotRow}>
                  {selectedIndices.map((tokenIdx, slotPos) => (
                    <Pressable
                      key={`slot-${slotPos}`}
                      style={s.selectedTile}
                      onPress={() => {
                        if (feedback) return;
                        void triggerHaptic('selection');
                        setSelectedIndices((prev) => prev.filter((_, i) => i !== slotPos));
                      }}
                    >
                      <Text style={s.selectedTileText}>{ex.tokens![tokenIdx]}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Word Tiles Bank */}
            <View style={s.tileBank}>
              {ex.tokens?.map((token, tokenIdx) => {
                const isUsed = selectedIndices.includes(tokenIdx);
                return (
                  <Pressable
                    key={`bank-${tokenIdx}`}
                    disabled={isUsed || !!feedback}
                    style={[s.bankTile, isUsed && s.bankTileUsed]}
                    onPress={() => {
                      void triggerHaptic('selection');
                      setSelectedIndices((prev) => [...prev, tokenIdx]);
                    }}
                  >
                    <Text style={[s.bankTileText, isUsed && s.bankTileTextUsed]}>{token}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Phase 4: Listen & Write */}
        {ex.kind === 'listen' && (
          <View style={s.listenPanel}>
            <Pressable style={s.playButton} onPress={() => speak(ex.item)}>
              <Text style={s.playIcon}>▶</Text>
              <Text style={s.playText}>Play audio</Text>
            </Pressable>
            <Text style={s.listenHint}>Listen to the pronunciation, then write the phrase.</Text>
            <TextInput
              style={s.input}
              value={answer}
              onChangeText={setAnswer}
              editable={!feedback}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Type what you hear…"
              placeholderTextColor="#A49CAA"
            />
          </View>
        )}

        {/* Phase 5: Translate & Type */}
        {ex.kind === 'type' && (
          <View style={s.listenPanel}>
            <TextInput
              style={s.input}
              value={answer}
              onChangeText={setAnswer}
              editable={!feedback}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder={`Write in ${course.name}…`}
              placeholderTextColor="#A49CAA"
            />
          </View>
        )}

        <View style={s.bottom}>
          {feedback && (
            <View style={[s.feedbackBox, feedback.ok ? s.feedbackGood : s.feedbackBad]}>
              <Text style={[s.feedbackTitle, { color: feedback.ok ? C.green : C.red }]}>
                {feedback.ok ? (feedback.hint ? 'Spot on!' : 'Beautifully done!') : 'Not quite — keep going'}
              </Text>
              <Text style={s.feedbackAnswer}>
                {feedback.ok
                  ? feedback.hint ?? 'Your answer is correct.'
                  : `Correct answer: ${feedback.expected}`}
              </Text>
            </View>
          )}
          {ex.kind === 'speak' && pronunciation && !pronunciation.passed && (
            <Pressable style={s.tryAgainBtn} onPress={startRecording}>
              <Text style={s.tryAgainBtnText}>🎙️ Try Again to Improve Score</Text>
            </Pressable>
          )}

          <Pressable
            disabled={
              ex.kind === 'speak'
                ? !pronunciation
                : ex.kind !== 'intro' && !feedback && !canCheck
            }
            onPress={
              ex.kind === 'intro' || feedback || ex.kind === 'speak'
                ? next
                : check
            }
            style={[
              s.cta,
              (ex.kind === 'speak' ? !pronunciation : ex.kind !== 'intro' && !feedback && !canCheck) &&
                s.ctaDisabled,
            ]}
          >
            <Text style={s.ctaText}>
              {ex.kind === 'intro'
                ? index + 1 === exercises.length
                  ? 'Finish lesson'
                  : 'I understand · Continue'
                : ex.kind === 'speak'
                ? pronunciation?.passed
                  ? index + 1 === exercises.length
                    ? 'Finish lesson'
                    : 'Continue'
                  : index + 1 === exercises.length
                  ? 'Finish lesson'
                  : 'Continue Anyway ›'
                : feedback
                ? index + 1 === exercises.length
                  ? 'Finish lesson'
                  : 'Continue'
                : 'Check answer'}
            </Text>
          </Pressable>
          <Text style={s.encouragement}>ONE STEP CLOSER TO A NEW WORLD</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: C.ivory },
  scrollContent: { flexGrow: 1, padding: 22, paddingTop: 25, paddingBottom: 15 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  close: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EDE8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: C.midnight, fontSize: 25, lineHeight: 28 },
  progressTrack: { flex: 1, height: 7, borderRadius: 8, backgroundColor: '#E5DFE9', overflow: 'hidden' },
  progressFill: { height: 7, borderRadius: 8, backgroundColor: C.gold },
  counter: { color: C.muted, fontSize: 10, fontWeight: '800' },
  chapter: { color: '#9B8CA9', fontSize: 9, letterSpacing: 1.8, fontWeight: '900', marginTop: 34 },
  prompt: { color: C.ink, fontSize: 21, lineHeight: 29, fontWeight: '800', marginTop: 12 },
  meaning: { color: C.midnight, fontSize: 29, fontWeight: '800', marginTop: 13, marginBottom: 23 },
  introCard: {
    backgroundColor: C.white,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1.5,
    borderColor: C.line,
    marginTop: 10,
    marginBottom: 16,
  },
  introBadge: {
    alignSelf: 'flex-start',
    backgroundColor: C.lilac,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 14,
  },
  introBadgeText: {
    color: C.midnight,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  introTarget: {
    color: C.midnight,
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 6,
  },
  introPhonetic: {
    color: C.gold,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  introMeaning: {
    color: C.ink,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  notesBox: {
    backgroundColor: '#FBF9F4',
    borderLeftWidth: 3,
    borderLeftColor: C.gold,
    padding: 12,
    borderRadius: 10,
    marginTop: 18,
  },
  notesTitle: {
    color: '#8A7042',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },
  notesText: {
    color: C.ink,
    fontSize: 12,
    lineHeight: 18,
  },
  speakPanel: {
    backgroundColor: C.white,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1.5,
    borderColor: C.line,
    marginTop: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  speakTarget: {
    color: C.midnight,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  speakPhonetic: {
    color: C.gold,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  speakMeaning: {
    color: C.muted,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 18,
  },
  micArea: { marginTop: 20, marginBottom: 10, alignItems: 'center' },
  micButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.midnight,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 28,
    shadowColor: C.midnight,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  micButtonRecording: { backgroundColor: '#C04348' },
  micIcon: { fontSize: 20, color: C.gold },
  micText: { color: C.white, fontSize: 14, fontWeight: '800' },
  scramblePanel: { width: '100%', alignItems: 'center', marginVertical: 10 },
  scrambleMeaning: {
    color: C.ink,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  slotArea: {
    width: '100%',
    minHeight: 80,
    backgroundColor: C.white,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2D9E8',
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  slotPlaceholder: {
    color: C.muted,
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  slotRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  selectedTile: {
    backgroundColor: C.midnight,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    shadowColor: C.midnight,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  selectedTileText: { color: C.white, fontSize: 14, fontWeight: '800' },
  tileBank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    width: '100%',
  },
  bankTile: {
    backgroundColor: '#F0EBF5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#DED5E6',
  },
  bankTileUsed: { opacity: 0.25, backgroundColor: '#E2DCE8', borderColor: 'transparent' },
  bankTileText: { color: C.ink, fontSize: 14, fontWeight: '800' },
  bankTileTextUsed: { color: C.muted },
  waveformCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E8DFD0',
    padding: 14,
    alignItems: 'center',
    marginVertical: 12,
  },
  waveformLiveBadge: {
    color: '#C04348',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  waveformBars: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 70,
    gap: 6,
  },
  waveformBar: {
    width: 5,
    borderRadius: 3,
  },
  waveformHint: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
  },
  scoreCard: {
    width: '100%',
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
    borderWidth: 1.5,
  },
  scoreGood: { backgroundColor: '#EAF2EC', borderColor: C.green },
  scoreRetry: { backgroundColor: '#FDF3E7', borderColor: '#E5A548' },
  scoreTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  scoreBadge: { backgroundColor: C.white, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  scoreBadgeText: { color: C.midnight, fontSize: 10, fontWeight: '900' },
  playbackBtn: { paddingHorizontal: 6, paddingVertical: 3 },
  playbackText: { color: C.midnight, fontSize: 11, fontWeight: '700' },
  heardText: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '700',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  scoreFeedback: { color: C.ink, fontSize: 13, fontWeight: '700', marginBottom: 10 },
  wordPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  wordPill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  wordPillGreat: { backgroundColor: '#D2EAD8' },
  wordPillGood: { backgroundColor: '#FCEDD3' },
  wordPillRetry: { backgroundColor: '#FAD7D9' },
  wordPillText: { color: C.ink, fontSize: 11, fontWeight: '800' },
  skipButton: { marginTop: 16, padding: 6 },
  skipButtonText: { color: C.muted, fontSize: 11, fontWeight: '600', textDecorationLine: 'underline' },
  options: { gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: C.line,
    backgroundColor: C.white,
  },
  optionPicked: { borderColor: '#9A83B4', backgroundColor: '#F0EBF7' },
  optionCorrect: { borderColor: C.green, backgroundColor: '#EAF2EC' },
  optionWrong: { borderColor: C.red, backgroundColor: '#F8EDEE' },
  optionText: { color: C.ink, fontSize: 15, fontWeight: '600', flex: 1 },
  optionTextPicked: { color: C.midnight },
  optionLetter: { color: '#A69DAC', fontSize: 10, fontWeight: '800', marginLeft: 10 },
  listenPanel: { marginTop: 12 },
  playButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.midnight,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 15,
    marginBottom: 6,
  },
  playIcon: { color: C.gold, fontSize: 12 },
  playText: { color: C.white, fontWeight: '800', fontSize: 12 },
  listenHint: { color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 16, marginBottom: 12, textAlign: 'center' },
  input: {
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 17,
    color: C.ink,
  },
  bottom: { marginTop: 'auto', paddingTop: 25, paddingBottom: 10 },
  feedbackBox: { padding: 14, borderRadius: 15, marginBottom: 12 },
  feedbackGood: { backgroundColor: '#EAF2EC' },
  feedbackBad: { backgroundColor: '#F8EDEE' },
  feedbackTitle: { fontSize: 14, fontWeight: '900' },
  feedbackAnswer: { color: C.ink, fontSize: 12, marginTop: 4 },
  tryAgainBtn: {
    backgroundColor: '#F3EEF8',
    borderWidth: 1.5,
    borderColor: '#DED5E6',
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 10,
  },
  tryAgainBtnText: { color: C.midnight, fontSize: 12, fontWeight: '800' },
  cta: { backgroundColor: C.midnight, padding: 17, borderRadius: 16, alignItems: 'center' },
  ctaDisabled: { backgroundColor: '#BDB7C5' },
  ctaText: { color: C.white, fontWeight: '900', fontSize: 13, letterSpacing: 0.6 },
  encouragement: { color: '#A59DAA', fontSize: 8, letterSpacing: 1.5, textAlign: 'center', marginTop: 14 },
});
