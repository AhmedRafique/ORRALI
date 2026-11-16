import { Card } from './types';

const DAY = 24 * 60 * 60 * 1000;

export function newCard(): Card {
  return { due: Date.now(), interval: 0, ease: 2.5, reps: 0, lapses: 0, lastReviewed: Date.now() };
}

/** SM-2 with mistake (lapse) tracking. Incorrect answers reset interval and increment lapse count. */
export function review(card: Card | undefined, correct: boolean): Card {
  const c = card ?? newCard();
  const lapses = c.lapses ?? 0;
  if (!correct) {
    return {
      ...c,
      reps: 0,
      interval: 0,
      ease: Math.max(1.3, Number((c.ease - 0.2).toFixed(2))),
      due: Date.now() + 10 * 60 * 1000,
      lapses: lapses + 1,
      lastReviewed: Date.now(),
    };
  }
  const reps = c.reps + 1;
  const interval = reps === 1 ? 1 : reps === 2 ? 3 : Math.round(c.interval * c.ease);
  return {
    reps,
    interval,
    ease: Math.min(3.2, Number((c.ease + 0.05).toFixed(2))),
    due: Date.now() + interval * DAY,
    lapses,
    lastReviewed: Date.now(),
  };
}

export function isDue(card: Card | undefined): boolean {
  return !!card && card.due <= Date.now();
}
