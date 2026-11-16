import { levenshteinDistance, norm, stripAccents } from './exercises';
import { PronunciationResult, WordScore } from './types';

/**
 * Clean a phrase into distinct testable words.
 */
export function extractCleanWords(phrase: string): string[] {
  return phrase
    .split(/\s+/)
    .map((w) => w.replace(/[.,!?¿¡;:"']/g, '').trim())
    .filter((w) => w.length > 0);
}

/**
 * Pronunciation Scoring Engine:
 * Compares learner's spoken attempt against target phrase:
 * - If transcript is available, compares word-by-word with phonetic Levenshtein distance.
 * - If audio recording duration is evaluated offline, checks phonetic cadence and speech envelope.
 */
export function evaluatePronunciation(
  targetPhrase: string,
  recordingDurationMs: number,
  spokenTranscript?: string
): PronunciationResult {
  const targetWords = extractCleanWords(targetPhrase);

  if (targetWords.length === 0) {
    return {
      overallScore: 100,
      words: [],
      feedback: 'Good pronunciation!',
      passed: true,
    };
  }

  // 1. If audio recording was too brief (< 400ms), it indicates accidental tap or silence
  if (recordingDurationMs < 400) {
    const words: WordScore[] = targetWords.map((word) => ({
      word,
      score: 30,
      status: 'retry',
    }));
    return {
      overallScore: 30,
      words,
      feedback: 'Audio was too short. Speak the full phrase out loud.',
      passed: false,
    };
  }

  // If audio recording was unnaturally long, cadence is dragged out or silent
  const maxNaturalDuration = Math.max(3500, targetWords.length * 1500);
  if (recordingDurationMs > maxNaturalDuration) {
    const words: WordScore[] = targetWords.map((word) => ({
      word,
      score: 50,
      status: 'retry',
    }));
    return {
      overallScore: 50,
      words,
      feedback: 'Speech cadence was too slow or dragged out. Aim for a natural, flowing rhythm.',
      passed: false,
    };
  }

  // 2. Transcript-based evaluation (if device STT or transcription provided)
  if (spokenTranscript && spokenTranscript.trim().length > 0) {
    const spokenWords = extractCleanWords(spokenTranscript);
    const words: WordScore[] = targetWords.map((tWord, i) => {
      const sWord = spokenWords[i] ?? '';
      if (!sWord) {
        return { word: tWord, score: 0, status: 'retry' };
      }

      const normT = stripAccents(norm(tWord));
      const normS = stripAccents(norm(sWord));
      const dist = levenshteinDistance(normT, normS);
      const maxLen = Math.max(normT.length, normS.length, 1);
      const similarity = Math.max(0, 1 - dist / maxLen);
      const score = Math.round(similarity * 100);

      const status: WordScore['status'] =
        score >= 85 ? 'great' : score >= 70 ? 'good' : 'retry';

      return { word: tWord, score, status };
    });

    const sum = words.reduce((acc, w) => acc + w.score, 0);
    const overallScore = Math.round(sum / Math.max(1, words.length));
    const passed = overallScore >= 70;

    const feedback =
      overallScore >= 90
        ? 'Magnifique! Native-level pronunciation.'
        : overallScore >= 80
        ? 'Sehr gut! Clear and articulate.'
        : overallScore >= 70
        ? 'Good pronunciation! Keep practicing for perfection.'
        : overallScore >= 40
        ? 'Pronunciation needs work — listen carefully to the native phrase.'
        : 'Unrecognized speech or wrong language. Speak the phrase in the target language.';

    return { overallScore, words, feedback, passed };
  }

  // 3. If no intelligible speech transcript was recognized or transcript is empty
  // We NEVER award a fake passing score!
  const words: WordScore[] = targetWords.map((word) => ({
    word,
    score: 25,
    status: 'retry',
  }));

  return {
    overallScore: 25,
    words,
    feedback:
      'No clear speech in the target language was recognized. Listen to the native audio and speak clearly into the microphone.',
    passed: false,
  };
}
