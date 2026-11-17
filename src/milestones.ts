import { selectPlausibleDistractors, shuffle } from './exercises';
import { Course, Exercise, Item } from './types';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';

export interface MilestoneDef {
  level: CEFRLevel;
  title: string;
  subtitle: string;
  passingScorePct: number;
  questionCount: number;
  xpReward: number;
}

export const MILESTONE_DEFS: MilestoneDef[] = [
  {
    level: 'A1',
    title: 'CEFR A1 Breakthrough Diploma',
    subtitle: 'Comprehensive synthesis exam of everyday foundations & courtesy',
    passingScorePct: 80,
    questionCount: 12,
    xpReward: 50,
  },
  {
    level: 'A2',
    title: 'CEFR A2 Elementary Diploma',
    subtitle: 'Comprehensive synthesis exam of past events, future plans & travel',
    passingScorePct: 80,
    questionCount: 12,
    xpReward: 50,
  },
  {
    level: 'B1',
    title: 'CEFR B1 Intermediate Diploma',
    subtitle: 'Comprehensive synthesis exam of opinions, hypotheses & subjunctive',
    passingScorePct: 80,
    questionCount: 12,
    xpReward: 50,
  },
  {
    level: 'B2',
    title: 'CEFR B2 Upper-Intermediate Diploma',
    subtitle: 'Comprehensive synthesis exam of professional & idiomatic mastery',
    passingScorePct: 80,
    questionCount: 12,
    xpReward: 50,
  },
];

export function getMilestoneDefs(): MilestoneDef[] {
  return MILESTONE_DEFS;
}

/**
 * Builds a 12-question comprehensive multiple-choice milestone exam
 * synthesizing items from the target CEFR level.
 */
export function buildMilestoneExamExercises(
  course: Course,
  level: CEFRLevel,
  count = 12
): Exercise[] {
  const levelLessons = course.lessons.filter((l) => l.level?.startsWith(level));
  const pool = levelLessons.flatMap((l) => l.items);
  const selectedItems: Item[] = shuffle([...pool]).slice(0, count);

  // If pool has fewer items than count, loop or take all
  const finalItems = selectedItems.length < count ? pool.slice(0, count) : selectedItems;

  return finalItems.map((item) => {
    const distractors = selectPlausibleDistractors(course, pool, item, 3);
    const options = shuffle([item.target, ...distractors.map((d) => d.target)]);
    return {
      kind: 'choice',
      item,
      options,
    };
  });
}

/**
 * Evaluates milestone exam performance.
 * Score >= 80% awards the official Gold Diploma and +50 XP.
 */
export function evaluateMilestoneExam(
  correctCount: number,
  totalQuestions: number
): { passed: boolean; scorePct: number; earnedXp: number } {
  if (totalQuestions <= 0) {
    return { passed: false, scorePct: 0, earnedXp: 0 };
  }

  const scorePct = Math.round((correctCount / totalQuestions) * 100);
  const passed = scorePct >= 80;
  const earnedXp = passed ? 50 : Math.max(5, correctCount * 2);

  return { passed, scorePct, earnedXp };
}
