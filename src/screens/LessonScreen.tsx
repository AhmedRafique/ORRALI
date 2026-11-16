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
import { findBestVoiceForLanguage, playPhraseAudio, stopAllAudio } from '../audio';
import { buildExercises, evaluateAnswer } from '../exercises';
import { Course, Item } from '../types';

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
  isReview?: boolean;
  onFinish: (result: { correctIds: string[]; wrongIds: string[] }) => void;
  onExit: () => void;
}

export default function LessonScreen({ course, title, items, isReview = false, onFinish, onExit }: Props) {
  const exercises = useMemo(() => buildExercises(course, items, isReview), [course, items, isReview]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [picked, setPicked] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<null | { ok: boolean; expected: string; hint?: string }>(null);
  const [correctIds, setCorrectIds] = useState<string[]>([]);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [voiceId, setVoiceId] = useState<string | undefined>(undefined);

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
    if (ex?.kind === 'intro') {
      const timer = setTimeout(() => {
        void playPhraseAudio(ex.item, course.code, voiceId);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [index, ex?.kind, ex?.item, course.code, voiceId]);

  // Handle exit with audio stop
  const handleExit = () => {
    void stopAllAudio();
    onExit();
  };

  // Android hardware back press interception
  useEffect(() => {
    const onBackPress = () => {
      Alert.alert(
        'Leave Lesson?',
        'Your current lesson progress will not be saved.',
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
  }, []);

  const confirmExit = () => {
    Alert.alert(
      'Leave Lesson?',
      'Your current lesson progress will not be saved.',
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

  // Mutually exclusive correct/wrong answer status with smart evaluation
  const check = () => {
    if (feedback || ex.kind === 'intro') return;
    const given = ex.kind === 'choice' ? picked ?? '' : answer;
    const evalRes = evaluateAnswer(given, ex.item);

    setFeedback({
      ok: evalRes.ok,
      expected: evalRes.expected,
      hint: evalRes.hint,
    });

    if (evalRes.ok) {
      setCorrectIds((prev) => (prev.includes(ex.item.id) ? prev : [...prev, ex.item.id]));
      setWrongIds((prev) => prev.filter((id) => id !== ex.item.id));
      speak(ex.item);
    } else {
      setWrongIds((prev) => (prev.includes(ex.item.id) ? prev : [...prev, ex.item.id]));
      setCorrectIds((prev) => prev.filter((id) => id !== ex.item.id));
    }
  };

  const next = () => {
    void stopAllAudio();
    if (index + 1 >= exercises.length) {
      onFinish({ correctIds, wrongIds });
      return;
    }
    setIndex((v) => v + 1);
    setAnswer('');
    setPicked(null);
    setFeedback(null);
  };

  const canCheck = ex.kind === 'choice' ? !!picked : answer.trim().length > 0;
  const prompt =
    ex.kind === 'intro'
      ? 'Meet your new phrase'
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
        {ex.kind !== 'listen' && ex.kind !== 'intro' && <Text style={s.meaning}>{ex.item.en}</Text>}

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
          <Pressable
            disabled={ex.kind !== 'intro' && !feedback && !canCheck}
            onPress={ex.kind === 'intro' || feedback ? next : check}
            style={[s.cta, ex.kind !== 'intro' && !feedback && !canCheck && s.ctaDisabled]}
          >
            <Text style={s.ctaText}>
              {ex.kind === 'intro'
                ? index + 1 === exercises.length
                  ? 'Finish lesson'
                  : 'I understand · Continue'
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
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.midnight,
    paddingHorizontal: 19,
    paddingVertical: 14,
    borderRadius: 15,
  },
  playIcon: { color: C.gold, fontSize: 13 },
  playText: { color: C.white, fontWeight: '800', fontSize: 13 },
  listenHint: { color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 16, marginBottom: 12 },
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
  cta: { backgroundColor: C.midnight, padding: 17, borderRadius: 16, alignItems: 'center' },
  ctaDisabled: { backgroundColor: '#BDB7C5' },
  ctaText: { color: C.white, fontWeight: '900', fontSize: 13, letterSpacing: 0.6 },
  encouragement: { color: '#A59DAA', fontSize: 8, letterSpacing: 1.5, textAlign: 'center', marginTop: 14 },
});
