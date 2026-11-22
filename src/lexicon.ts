import { norm, stripAccents } from './exercises';
import { isDue } from './srs';
import { Course, Item, LangCode, Progress } from './types';
import { getAllDomainPhrases } from './lexicon/index';

export * from './lexicon/index';

export type MasteryStatus = 'new' | 'learning' | 'mastered' | 'stumble';

export interface LexiconEntry {
  item: Item;
  lessonTitle: string;
  level: string;
  courseCode: LangCode;
  mastery: MasteryStatus;
  interval: number;
  reps: number;
  lapses: number;
  isDue: boolean;
}

export interface Flashcard {
  item: Item;
  lessonTitle: string;
  courseCode: LangCode;
  isFlipped: boolean;
}

/**
 * Builds vocabulary lexicon entries enriched with spaced repetition mastery status.
 */
export function getLexiconEntries(course: Course, progress: Progress): LexiconEntry[] {
  const entries: LexiconEntry[] = [];

  for (const lesson of course.lessons) {
    for (const item of lesson.items) {
      const card = progress.cards[item.id];
      const reps = card?.reps ?? 0;
      const interval = card?.interval ?? 0;
      const lapses = card?.lapses ?? 0;

      let mastery: MasteryStatus = 'new';
      if (lapses > 0 && interval < 7) {
        mastery = 'stumble';
      } else if (interval >= 21) {
        mastery = 'mastered';
      } else if (reps > 0) {
        mastery = 'learning';
      }

      entries.push({
        item,
        lessonTitle: lesson.title,
        level: lesson.level ?? 'A1',
        courseCode: course.code,
        mastery,
        interval,
        reps,
        lapses,
        isDue: isDue(card),
      });
    }
  }

  const domainPhrases = getAllDomainPhrases(course.code);
  for (const phrase of domainPhrases) {
    const card = progress.cards[phrase.id];
    const reps = card?.reps ?? 0;
    const interval = card?.interval ?? 0;
    const lapses = card?.lapses ?? 0;

    let mastery: MasteryStatus = 'new';
    if (lapses > 0 && interval < 7) {
      mastery = 'stumble';
    } else if (interval >= 21) {
      mastery = 'mastered';
    } else if (reps > 0) {
      mastery = 'learning';
    }

    entries.push({
      item: {
        id: phrase.id,
        target: phrase.target,
        en: phrase.en,
        phonetic: phrase.phonetic,
        notes: phrase.notes,
      },
      lessonTitle: phrase.domain.replace(/_/g, ' ').toUpperCase(),
      level: phrase.level,
      courseCode: course.code,
      mastery,
      interval,
      reps,
      lapses,
      isDue: isDue(card),
    });
  }

  return entries;
}

/**
 * Searches and filters vocabulary with accent leniency and case insensitivity.
 */
export function filterLexicon(
  entries: LexiconEntry[],
  query: string,
  filter: MasteryStatus | 'all' = 'all'
): LexiconEntry[] {
  const normQuery = stripAccents(norm(query));

  return entries.filter((entry) => {
    // 1. Mastery filter
    if (filter !== 'all' && entry.mastery !== filter) {
      return false;
    }

    // 2. Search query matching target, English translation, or phonetics
    if (!normQuery) return true;

    const target = stripAccents(norm(entry.item.target));
    const en = stripAccents(norm(entry.item.en));
    const phonetic = stripAccents(norm(entry.item.phonetic ?? ''));

    return (
      target.includes(normQuery) ||
      en.includes(normQuery) ||
      phonetic.includes(normQuery)
    );
  });
}

/**
 * Builds a rapid-fire flashcard flip deck, prioritizing stumbles and due cards.
 */
export function buildFlashcardDeck(
  entries: LexiconEntry[],
  count = 10,
  filter?: MasteryStatus
): Flashcard[] {
  let pool = entries;
  if (filter) {
    pool = entries.filter((e) => e.mastery === filter);
  }

  // Sort prioritizing stumbles first, then due cards, then learning cards
  const sorted = [...pool].sort((a, b) => {
    const scoreA =
      (a.mastery === 'stumble' ? 100 : 0) +
      (a.isDue ? 50 : 0) +
      (a.mastery === 'learning' ? 20 : 0);
    const scoreB =
      (b.mastery === 'stumble' ? 100 : 0) +
      (b.isDue ? 50 : 0) +
      (b.mastery === 'learning' ? 20 : 0);
    return scoreB - scoreA;
  });

  return sorted.slice(0, count).map((e) => ({
    item: e.item,
    lessonTitle: e.lessonTitle,
    courseCode: e.courseCode,
    isFlipped: false,
  }));
}
