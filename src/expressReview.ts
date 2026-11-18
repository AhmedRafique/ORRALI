import { isDue } from './srs';
import { Course, Item, Progress } from './types';

export interface ExpressCard {
  item: Item;
  lessonTitle: string;
}

export type ExpressSwipeAction = 'knew_it' | 'needs_practice';

export interface ExpressSwipeResult {
  isOk: boolean;
  earnedXp: number;
}

/**
 * Extracts exactly up to 5 of the most urgently due cards for a 3-Minute Express Review.
 */
export function extractExpressReviewDeck(course: Course, progress: Progress): ExpressCard[] {
  const now = Date.now();
  const allCards: { item: Item; lessonTitle: string; due: number }[] = [];

  for (const lesson of course.lessons) {
    for (const item of lesson.items) {
      const card = progress.cards[item.id];
      if (isDue(card)) {
        allCards.push({
          item,
          lessonTitle: lesson.title,
          due: card!.due,
        });
      }
    }
  }

  // Sort by most overdue first
  allCards.sort((a, b) => a.due - b.due);

  return allCards.slice(0, 5).map((c) => ({
    item: c.item,
    lessonTitle: c.lessonTitle,
  }));
}

/**
 * Evaluates the swipe action and returns SM-2 correctness and XP yield.
 */
export function evaluateExpressSwipe(action: ExpressSwipeAction): ExpressSwipeResult {
  if (action === 'knew_it') {
    return { isOk: true, earnedXp: 3 };
  }
  return { isOk: false, earnedXp: 1 };
}
