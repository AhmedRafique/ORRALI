import { LangCode, ProgressiveAudioItem, PronunciationMap, PronunciationResult } from './types';

/**
 * Calculates acoustic metrics such as Words Per Minute (WPM) and Intonation Variance.
 */
export function evaluateAcousticMetrics(
  durationMs: number,
  wordCount: number,
  intensitySamples: number[]
): { cadenceWpm: number; cadenceHealth: 'too_slow' | 'good' | 'too_fast'; intonationVariance: number } {
  const minutes = Math.max(durationMs / 60000, 0.01);
  const cadenceWpm = Math.round(wordCount / minutes);

  let cadenceHealth: 'too_slow' | 'good' | 'too_fast' = 'good';
  if (cadenceWpm < 60) cadenceHealth = 'too_slow';
  else if (cadenceWpm > 130) cadenceHealth = 'too_fast';

  // Calculate standard deviation of intensity samples to represent intonation variance
  let intonationVariance = 0;
  if (intensitySamples.length > 0) {
    const mean = intensitySamples.reduce((a, b) => a + b, 0) / intensitySamples.length;
    const sqDiffs = intensitySamples.map(val => Math.pow(val - mean, 2));
    const variance = sqDiffs.reduce((a, b) => a + b, 0) / intensitySamples.length;
    intonationVariance = Math.round(Math.sqrt(variance) * 100);
  }

  return { cadenceWpm, cadenceHealth, intonationVariance };
}

/**
 * Updates a user's Pronunciation Skill Map with a new PronunciationResult.
 */
export function updatePronunciationMap(
  currentMap: PronunciationMap,
  result: PronunciationResult
): PronunciationMap {
  const nextMap = {
    ...currentMap,
    wordScores: { ...currentMap.wordScores }
  };

  // Update cadence average
  if (result.cadenceWpm) {
    if (nextMap.averageCadenceWpm === 0) {
      nextMap.averageCadenceWpm = result.cadenceWpm;
    } else {
      nextMap.averageCadenceWpm = Math.round((nextMap.averageCadenceWpm + result.cadenceWpm) / 2);
    }
  }

  if (nextMap.averageCadenceWpm > 0) {
    if (nextMap.averageCadenceWpm < 60) nextMap.cadenceHealth = 'too_slow';
    else if (nextMap.averageCadenceWpm > 130) nextMap.cadenceHealth = 'too_fast';
    else nextMap.cadenceHealth = 'good';
  }

  // Update individual word scores
  for (const { word, score } of result.words) {
    const key = word.toLowerCase();
    const existing = nextMap.wordScores[key];
    if (existing) {
      nextMap.wordScores[key] = {
        occurrences: existing.occurrences + 1,
        averageScore: Math.round((existing.averageScore * existing.occurrences + score) / (existing.occurrences + 1)),
        lastScore: score
      };
    } else {
      nextMap.wordScores[key] = {
        occurrences: 1,
        averageScore: score,
        lastScore: score
      };
    }
  }

  return nextMap;
}

const AUDIO_LIBRARY_MOCK: ProgressiveAudioItem[] = [
  {
    id: 'fr-b1-intonation-01',
    level: 'B1',
    target: 'C\'est incroyable, n\'est-ce pas ?',
    en: 'It\'s incredible, isn\'t it?',
    durationMs: 2500,
    focus: 'intonation'
  },
  {
    id: 'fr-a1-vocab-01',
    level: 'A1',
    target: 'Bonjour le monde',
    en: 'Hello world',
    durationMs: 1500,
    focus: 'vocabulary'
  }
];

/**
 * Retrieves a filtered set of audio items for the Progressive Audio Library.
 */
export function getProgressiveAudioLibrary(
  languageId: LangCode,
  level: string,
  focus: 'vocabulary' | 'grammar' | 'cadence' | 'intonation'
): ProgressiveAudioItem[] {
  // In a real implementation, this would query the SQLite database or content store
  return AUDIO_LIBRARY_MOCK.filter(item => 
    item.level === level && item.focus === focus && item.id.startsWith(languageId)
  );
}
