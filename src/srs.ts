import { Card } from './types';

const DAY = 24 * 60 * 60 * 1000;

export function newCard(): Card {
  return { due: Date.now(), interval: 0, ease: 2.5, reps: 0 };
}

/** Simplified SM-2. `correct=false` resets the card to tomorrow-ish. */
export function review(card: Card | undefined, correct: boolean): Card {
  const c = card ?? newCard();
  if (!correct) {
    return { ...c, reps: 0, interval: 0, ease: Math.max(1.3, c.ease - 0.2), due: Date.now() + 10 * 60 * 1000 };
  }
  const reps = c.reps + 1;
  const interval = reps === 1 ? 1 : reps === 2 ? 3 : Math.round(c.interval * c.ease);
  return { reps, interval, ease: Math.min(3, c.ease + 0.05), due: Date.now() + interval * DAY };
}

export function isDue(card: Card | undefined): boolean {
  return !!card && card.due <= Date.now();
}
