import { shuffle } from './exercises';
import { evaluatePronunciation } from './scoring';
import { Course, Item, PronunciationResult } from './types';

export interface ShadowChallenge {
  item: Item;
  lessonTitle: string;
}

/**
 * Builds a deck of randomized phrases for Shadowing mimicry.
 */
export function buildShadowingDeck(course: Course, count = 5): ShadowChallenge[] {
  const allItems: ShadowChallenge[] = [];
  for (const lesson of course.lessons) {
    for (const item of lesson.items) {
      allItems.push({
        item,
        lessonTitle: lesson.title,
      });
    }
  }

  return shuffle(allItems).slice(0, count);
}

/**
 * Evaluates the learner's shadowed recording against the target phrase.
 * We leverage the existing pronunciation scoring engine but pass an artificial duration
 * to focus the feedback purely on textual mimicry and phonetic alignment.
 */
export function evaluateShadowingAttempt(
  item: Item,
  spokenTranscript: string
): PronunciationResult {
  // Pass an artificial 2-second duration since we are only scoring the transcript
  return evaluatePronunciation(item.target, 2000, spokenTranscript);
}
