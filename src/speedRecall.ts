import { selectPlausibleDistractors, shuffle } from './exercises';
import { Course, Item } from './types';

export interface SpeedQuestion {
  item: Item;
  promptEn: string;
  correctTarget: string;
  options: string[];
}

export type SpeedRank = 'Bronze' | 'Silver' | 'Gold' | 'Diamond';

export interface SpeedScoreResult {
  totalXp: number;
  accuracy: number;
  rank: SpeedRank;
  correctCount: number;
  totalAttempts: number;
  maxCombo: number;
}

/**
 * Generates an arcade speed challenge deck drawing across the course's vocabulary,
 * equipped with close, plausible multiple-choice distractors.
 */
export function generateSpeedDeck(course: Course, count = 20): SpeedQuestion[] {
  const allItems: Item[] = course.lessons.flatMap((l) => l.items);
  const selectedItems: Item[] = shuffle([...allItems]).slice(0, count);

  return selectedItems.map((item: Item) => {
    const distractors = selectPlausibleDistractors(course, allItems, item, 3);
    const options = shuffle([item.target, ...distractors.map((d) => d.target)]);

    return {
      item,
      promptEn: item.en,
      correctTarget: item.target,
      options,
    };
  });
}

/**
 * Calculates arcade score, XP reward, accuracy, and tier ranking.
 */
export function calculateSpeedScore(
  correctCount: number,
  totalAttempts: number,
  maxCombo: number
): SpeedScoreResult {
  if (totalAttempts <= 0 || correctCount <= 0) {
    return {
      totalXp: 0,
      accuracy: 0,
      rank: 'Bronze',
      correctCount: 0,
      totalAttempts: 0,
      maxCombo: 0,
    };
  }

  const accuracy = Math.round((correctCount / totalAttempts) * 100);

  // Determine Rank
  let rank: SpeedRank = 'Bronze';
  if (accuracy >= 90 && correctCount >= 10) {
    rank = 'Diamond';
  } else if (accuracy >= 80 && correctCount >= 7) {
    rank = 'Gold';
  } else if (accuracy >= 65 && correctCount >= 4) {
    rank = 'Silver';
  }

  // Calculate XP (2 XP per correct + combo bonus, max 30 XP)
  const base = correctCount * 2;
  const comboBonus = Math.floor(maxCombo * 1.5);
  const totalXp = Math.min(30, Math.max(5, base + comboBonus));

  return {
    totalXp,
    accuracy,
    rank,
    correctCount,
    totalAttempts,
    maxCombo,
  };
}
