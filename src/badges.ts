import { Course, AchievementBadge, Progress } from './types';

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'learning' | 'streak' | 'speaking' | 'mastery';
  target: number;
  calculateCurrent: (p: Progress, courses: Course[]) => number;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first_words',
    title: 'First Words',
    description: 'Complete your first language chapter.',
    icon: '🌱',
    category: 'learning',
    target: 1,
    calculateCurrent: (p) => Object.keys(p.completed).length,
  },
  {
    id: 'streak_3',
    title: 'Habit Builder',
    description: 'Maintain a 3-day learning streak.',
    icon: '🔥',
    category: 'streak',
    target: 3,
    calculateCurrent: (p) => p.streak,
  },
  {
    id: 'streak_7',
    title: 'Week Champion',
    description: 'Achieve an unbroken 7-day streak.',
    icon: '⚡',
    category: 'streak',
    target: 7,
    calculateCurrent: (p) => p.streak,
  },
  {
    id: 'cafe_regular',
    title: 'Café Regular',
    description: 'Complete a café & dining chapter (Au Café or Im Café).',
    icon: '☕',
    category: 'curriculum' as any,
    target: 1,
    calculateCurrent: (p) => (p.completed['fr-4'] || p.completed['de-4'] ? 1 : 0),
  },
  {
    id: 'xp_centurion',
    title: 'XP Explorer',
    description: 'Earn 100 total experience points.',
    icon: '✧',
    category: 'learning',
    target: 100,
    calculateCurrent: (p) => p.xp,
  },
  {
    id: 'polyglot',
    title: 'Dual Polyglot',
    description: 'Earn at least 25 XP in both French and German.',
    icon: '🌐',
    category: 'learning',
    target: 2,
    calculateCurrent: (p) => {
      const frXp = p.courseXp?.['fr'] ?? 0;
      const deXp = p.courseXp?.['de'] ?? 0;
      let count = 0;
      if (frXp >= 25) count++;
      if (deXp >= 25) count++;
      return count;
    },
  },
  {
    id: 'memory_master',
    title: 'Memory Master',
    description: 'Move 5 vocabulary cards to long-term memory (interval ≥ 21 days).',
    icon: '🧠',
    category: 'mastery',
    target: 5,
    calculateCurrent: (p) =>
      Object.values(p.cards).filter((card) => card.interval >= 21).length,
  },
  {
    id: 'story_teller',
    title: 'Story Listener',
    description: 'Complete your first real-world conversational scenario.',
    icon: '📖',
    category: 'learning',
    target: 1,
    calculateCurrent: (p) => Object.keys(p.completedStories ?? {}).length,
  },
];

/**
 * Returns list of badges populated with current learner progress and unlock status.
 */
export function getBadgesWithProgress(progress: Progress, courses: Course[]): AchievementBadge[] {
  return BADGE_DEFINITIONS.map((def) => {
    const current = Math.min(def.target, def.calculateCurrent(progress, courses));
    const unlockedAt = progress.badges?.[def.id];
    const unlocked = !!unlockedAt || current >= def.target;

    return {
      id: def.id,
      title: def.title,
      description: def.description,
      icon: def.icon,
      category: def.category,
      current,
      target: def.target,
      unlocked,
      unlockedAt,
    };
  });
}

/**
 * Evaluates whether learner has unlocked new badges. Returns updated progress and new unlocks.
 */
export function evaluateBadges(
  progress: Progress,
  courses: Course[]
): { updatedProgress: Progress; newlyUnlocked: AchievementBadge[] } {
  const existingBadges = { ...(progress.badges ?? {}) };
  const newlyUnlocked: AchievementBadge[] = [];

  for (const def of BADGE_DEFINITIONS) {
    if (!existingBadges[def.id]) {
      const current = def.calculateCurrent(progress, courses);
      if (current >= def.target) {
        const now = Date.now();
        existingBadges[def.id] = now;
        newlyUnlocked.push({
          id: def.id,
          title: def.title,
          description: def.description,
          icon: def.icon,
          category: def.category,
          current: def.target,
          target: def.target,
          unlocked: true,
          unlockedAt: now,
        });
      }
    }
  }

  const updatedProgress: Progress = {
    ...progress,
    badges: existingBadges,
  };

  return { updatedProgress, newlyUnlocked };
}
