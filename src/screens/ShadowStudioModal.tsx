import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { requestRecordingPermissionsAsync, useAudioRecorder, RecordingPresets } from 'expo-audio';
import { useSpeechRecognitionEvent, ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { playPhraseAudio, stopAllAudio } from '../audio';
import { playEarcon } from '../earcons';
import { triggerHaptic } from '../sensory';
import { Course, PronunciationResult } from '../types';
import { buildShadowingDeck, evaluateShadowingAttempt } from '../shadowStudio';

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
};

interface Props {
  visible: boolean;
  course: Course;
  onFinish: (earnedXp: number) => void;
  onClose: () => void;
}

export default function ShadowStudioModal({ visible, course, onFinish, onClose }: Props) {
  const deck = useMemo(() => buildShadowingDeck(course, 5), [course, visible]);
  const [index, setIndex] = useState(0);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [transcript, setTranscript] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const latestTranscriptRef = useRef('');

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const currentChallenge = deck[index];
  const totalRounds = deck.length;

  useEffect(() => {
    if (visible) {
      setIndex(0);
      setRoundsPlayed(0);
      setIsRecording(false);
      setResult(null);
      setTranscript('');
      latestTranscriptRef.current = '';
      setCorrectCount(0);
    }
  }, [visible]);

  useEffect(() => {
    return () => {
      void stopAllAudio();
      try {
        recorder.stop();
        ExpoSpeechRecognitionModule.stop();
      } catch {}
    };
  }, []);

  useSpeechRecognitionEvent('result', (event) => {
    if (event.results && event.results.length > 0) {
      const text = event.results[0].transcript;
      latestTranscriptRef.current = text;
      setTranscript(text);
    }
  });

  const handlePlayNative = () => {
    void triggerHaptic('selection');
    void playPhraseAudio(currentChallenge.item, course.code, undefined, false);
  };

  const startRecording = async () => {
    try {
      const status = await requestRecordingPermissionsAsync();
      if (status.status !== 'granted') return;

      void stopAllAudio();
      setResult(null);
      setTranscript('');
      latestTranscriptRef.current = '';
      
      await ExpoSpeechRecognitionModule.start({
        lang: course.speechLang,
        interimResults: true,
      });
      await recorder.record();
      setIsRecording(true);
      void triggerHaptic('light');
    } catch {
      // Graceful failure
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;
    try {
      ExpoSpeechRecognitionModule.stop();
      recorder.stop();
    } catch {}
    
    setIsRecording(false);
    void triggerHaptic('selection');

    // Give speech engine a brief 350ms settlement window to flush final packets
    setTimeout(() => {
      const textToScore = latestTranscriptRef.current || transcript;
      const res = evaluateShadowingAttempt(currentChallenge.item, textToScore);
      setResult(res);

      if (res.passed) {
        void playEarcon('success');
        setCorrectCount((c) => c + 1);
      } else {
        void playEarcon('error');
      }
    }, 350);
  };

  const handleNext = () => {
    if (roundsPlayed + 1 >= totalRounds) {
      setRoundsPlayed((r) => r + 1);
      void playEarcon('fanfare');
    } else {
      setRoundsPlayed((r) => r + 1);
      setIndex((i) => i + 1);
      setResult(null);
      setTranscript('');
    }
  };

  const handleClose = () => {
    void stopAllAudio();
    onClose();
  };

  const handleClaim = () => {
    void triggerHaptic('success');
    onFinish(15);
    onClose();
  };

  if (!visible) return null;
  const isFinished = roundsPlayed >= totalRounds;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={handleClose}>
      <View style={s.overlay}>
        <View style={s.card}>
          <View style={s.header}>
            <View style={s.badge}>
              <Text style={s.badgeText}>🎙️ SHADOWING STUDIO</Text>
            </View>
            <Pressable onPress={handleClose} style={s.closeBtn}>
              <Text style={s.closeText}>×</Text>
            </Pressable>
          </View>

          {!isFinished ? (
            <View style={s.content}>
              <View style={s.progressRow}>
                <Text style={s.counter}>
                  Phrase {roundsPlayed + 1} of {totalRounds}
                </Text>
                <Text style={s.streakText}>✦ Score: {correctCount}</Text>
              </View>

              <View style={s.track}>
                <View
                  style={[s.fill, { width: `${((roundsPlayed + 1) / Math.max(1, totalRounds)) * 100}%` }]}
                />
              </View>

              <Text style={s.instruction}>Listen to the native speaker, then hold to mimic their rhythm.</Text>

              <View style={s.phraseBox}>
                <Text style={s.meaningEn}>"{currentChallenge?.item.en}"</Text>
                <Text style={s.targetPhrase}>{currentChallenge?.item.target}</Text>
                {currentChallenge?.item.phonetic && (
                  <Text style={s.phonetic}>/{currentChallenge.item.phonetic}/</Text>
                )}
                <Pressable style={s.playNativeBtn} onPress={handlePlayNative}>
                  <Text style={s.playNativeText}>▶ Play Native Audio</Text>
                </Pressable>
              </View>

              {/* Recording Station */}
              <View style={s.recordBox}>
                <Pressable
                  style={[s.micBtn, isRecording && s.micBtnActive]}
                  onPressIn={startRecording}
                  onPressOut={stopRecording}
                >
                  <Text style={s.micIcon}>{isRecording ? '🎙️' : '🎤'}</Text>
                </Pressable>
                <Text style={s.micHint}>
                  {isRecording ? 'Recording... Release to stop' : 'Hold to shadow (mimic)'}
                </Text>

                {transcript.length > 0 && (
                  <Text style={s.transcriptText}>"{transcript}"</Text>
                )}
              </View>

              {/* Feedback Area */}
              {result && (
                <View style={[s.feedbackBox, result.passed ? s.feedbackBoxOk : s.feedbackBoxRetry]}>
                  <Text style={s.feedbackTitle}>
                    {result.passed ? '✓ GREAT PRONUNCIATION!' : '✕ KEEP TRYING'}
                  </Text>
                  <Text style={s.feedbackText}>{result.feedback}</Text>
                  <View style={s.wordPills}>
                    {result.words.map((w, i) => (
                      <View
                        key={`word-${i}`}
                        style={[
                          s.wordPill,
                          w.status === 'great'
                            ? s.wordGreat
                            : w.status === 'good'
                            ? s.wordGood
                            : s.wordRetry,
                        ]}
                      >
                        <Text
                          style={[
                            s.wordText,
                            w.status === 'great' || w.status === 'good'
                              ? s.wordTextWhite
                              : s.wordTextDark,
                          ]}
                        >
                          {w.word}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Next Button */}
              {result && (
                <View style={s.actionRow}>
                  <Pressable style={s.nextBtn} onPress={handleNext}>
                    <Text style={s.nextBtnText}>Next Phrase ›</Text>
                  </Pressable>
                </View>
              )}
            </View>
          ) : (
            <View style={s.finishArea}>
              <Text style={s.finishIcon}>🎙️</Text>
              <Text style={s.finishTitle}>Studio Session Complete!</Text>
              <Text style={s.finishSub}>
                You shadowed {totalRounds} phrases, tuning your ear to native cadence and rhythm.
              </Text>
              <Pressable style={s.claimBtn} onPress={handleClaim}>
                <Text style={s.claimBtnText}>Claim +15 XP & Rest</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(27, 21, 54, 0.85)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  card: { width: '100%', backgroundColor: C.white, borderRadius: 24, padding: 20, shadowColor: C.midnight, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.22, shadowRadius: 20, elevation: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  badge: { backgroundColor: '#EAE5F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  badgeText: { color: '#4B3663', fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3EEF8', justifyContent: 'center', alignItems: 'center' },
  closeText: { color: C.ink, fontSize: 20, fontWeight: '800', lineHeight: 22 },
  content: { alignItems: 'center' },
  progressRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  counter: { color: C.muted, fontSize: 12, fontWeight: '800' },
  streakText: { color: C.gold, fontSize: 12, fontWeight: '900' },
  track: { width: '100%', height: 6, backgroundColor: C.line, borderRadius: 3, overflow: 'hidden', marginBottom: 16 },
  fill: { height: '100%', backgroundColor: C.gold, borderRadius: 3 },
  instruction: { color: C.muted, fontSize: 13, fontWeight: '700', textAlign: 'center', marginBottom: 16, paddingHorizontal: 10 },
  phraseBox: { backgroundColor: '#FAF9FC', borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1.5, borderColor: '#ECE6F2', width: '100%', marginBottom: 20 },
  meaningEn: { color: C.ink, fontSize: 16, fontWeight: '800', textAlign: 'center', marginBottom: 10 },
  targetPhrase: { color: C.purple, fontSize: 24, fontWeight: '900', textAlign: 'center' },
  phonetic: { color: C.muted, fontSize: 14, fontWeight: '600', fontStyle: 'italic', marginTop: 6, marginBottom: 16 },
  playNativeBtn: { backgroundColor: C.midnight, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16, flexDirection: 'row', alignItems: 'center' },
  playNativeText: { color: C.white, fontSize: 13, fontWeight: '800' },
  recordBox: { width: '100%', alignItems: 'center', marginBottom: 20 },
  micBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3EEF8', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#EAE5EE' },
  micBtnActive: { backgroundColor: '#FDEEEF', borderColor: C.red, transform: [{ scale: 1.05 }] },
  micIcon: { fontSize: 32 },
  micHint: { color: C.muted, fontSize: 12, fontWeight: '700', marginTop: 10 },
  transcriptText: { color: C.ink, fontSize: 14, fontStyle: 'italic', marginTop: 10, textAlign: 'center' },
  feedbackBox: { width: '100%', borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 16 },
  feedbackBoxOk: { backgroundColor: '#EDF7F1', borderColor: '#BFE3CE' },
  feedbackBoxRetry: { backgroundColor: '#FCF0F1', borderColor: '#F5C5C8' },
  feedbackTitle: { color: C.ink, fontSize: 11, fontWeight: '900', letterSpacing: 0.8, marginBottom: 4 },
  feedbackText: { color: C.ink, fontSize: 13, fontWeight: '700', marginBottom: 10 },
  wordPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  wordPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  wordGreat: { backgroundColor: C.green },
  wordGood: { backgroundColor: C.gold },
  wordRetry: { backgroundColor: '#F5C5C8' },
  wordText: { fontSize: 12, fontWeight: '700' },
  wordTextWhite: { color: C.white },
  wordTextDark: { color: '#822D31' },
  actionRow: { width: '100%' },
  nextBtn: { backgroundColor: C.green, width: '100%', paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  nextBtnText: { color: C.white, fontSize: 14, fontWeight: '800' },
  finishArea: { alignItems: 'center', paddingVertical: 20 },
  finishIcon: { fontSize: 48, marginBottom: 12 },
  finishTitle: { color: C.midnight, fontSize: 20, fontWeight: '900', marginBottom: 8 },
  finishSub: { color: C.muted, fontSize: 13, fontWeight: '600', textAlign: 'center', lineHeight: 18, marginBottom: 20 },
  claimBtn: { backgroundColor: C.midnight, width: '100%', paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  claimBtnText: { color: C.white, fontSize: 14, fontWeight: '800' },
});
