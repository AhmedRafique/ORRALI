import { dayKey } from './streak';
import { LangCode, Progress } from './types';

export interface DailySparkWord {
  phrase: string;
  meaningEn: string;
  phonetic: string;
  category: string;
  culturalInsight: string;
  courseCode: LangCode;
  bonusXp: number;
}

const SPARK_POOL: Record<LangCode, DailySparkWord[]> = {
  fr: [
    {
      phrase: 'Coup de foudre',
      meaningEn: 'Love at first sight',
      phonetic: 'koo duh foodr',
      category: 'Romantic Idiom',
      culturalInsight:
        'Literally "a stroke of lightning". Used for romantic encounters and instant infatuation with cities, art, and places.',
      courseCode: 'fr',
      bonusXp: 5,
    },
    {
      phrase: 'Simple comme bonjour',
      meaningEn: 'As easy as pie',
      phonetic: 'sam-pluh kohm bohn-zhoor',
      category: 'Everyday Wisdom',
      culturalInsight:
        'Literally "simple as saying hello". Celebrates natural, effortless clarity and elegance.',
      courseCode: 'fr',
      bonusXp: 5,
    },
    {
      phrase: 'Goutte d’eau qui fait déborder le vase',
      meaningEn: 'The straw that broke the camel’s back',
      phonetic: 'goot doh kee feh deh-bohr-deh luh vahz',
      category: 'Expressive Idiom',
      culturalInsight:
        'Literally "the drop of water that overflows the vase". Common in conversational and political debates.',
      courseCode: 'fr',
      bonusXp: 5,
    },
    {
      phrase: 'Joie de vivre',
      meaningEn: 'Joy of living',
      phonetic: 'zhwah duh vee-vruh',
      category: 'Philosophy & Lifestyle',
      culturalInsight:
        'The quintessential French celebration of savoring simple pleasures: warm bread, lively conversation, and shared moments.',
      courseCode: 'fr',
      bonusXp: 5,
    },
  ],
  de: [
    {
      phrase: 'Übung macht den Meister',
      meaningEn: 'Practice makes perfect',
      phonetic: 'ew-boong mahkht den my-ster',
      category: 'Proverbial Wisdom',
      culturalInsight:
        'Literally "practice makes the master". Celebrates disciplined German craftsmanship, persistence, and continuous growth.',
      courseCode: 'de',
      bonusXp: 5,
    },
    {
      phrase: 'Zwei Fliegen mit einer Klappe schlagen',
      meaningEn: 'Kill two birds with one stone',
      phonetic: 'tsvay flee-gen mit ay-ner klahp-puh shlah-gen',
      category: 'Efficient Idiom',
      culturalInsight:
        'Literally "swat two flies with one flyswatter". A favorite idiom reflecting efficiency and thoroughness.',
      courseCode: 'de',
      bonusXp: 5,
    },
    {
      phrase: 'Die Daumen drücken',
      meaningEn: 'To cross one’s fingers for someone',
      phonetic: 'dee dow-men drewk-ken',
      category: 'Everyday Custom',
      culturalInsight:
        'In Germany, people press their thumbs inside their fists for good luck rather than crossing fingers.',
      courseCode: 'de',
      bonusXp: 5,
    },
    {
      phrase: 'Gemütlichkeit',
      meaningEn: 'Warm coziness and peace of mind',
      phonetic: 'geh-mewt-likh-kayt',
      category: 'Cultural Feeling',
      culturalInsight:
        'An untranslatable feeling of warmth, cordiality, and unhurried contentment with good friends.',
      courseCode: 'de',
      bonusXp: 5,
    },
  ],
  es: [
    {
      phrase: 'Querer es poder',
      meaningEn: 'Where there is a will, there is a way',
      phonetic: 'keh-rair ess poh-dair',
      category: 'Proverbial Wisdom',
      culturalInsight:
        'Beloved Hispanic proverb celebrating the inner power of determination and perseverance.',
      courseCode: 'es',
      bonusXp: 5,
    },
    {
      phrase: 'Matar dos pájaros de un tiro',
      meaningEn: 'Kill two birds with one stone',
      phonetic: 'mah-tahr dohs pah-khah-rohs deh oon tee-roh',
      category: 'Everyday Idiom',
      culturalInsight:
        'Literally "to kill two birds with one shot". Used frequently across Spain and Latin America.',
      courseCode: 'es',
      bonusXp: 5,
    },
    {
      phrase: 'Estar en las nubes',
      meaningEn: 'To have one’s head in the clouds',
      phonetic: 'ess-tahr en lahs noo-bess',
      category: 'Expressive Idiom',
      culturalInsight:
        'Describes daydreaming or enjoying pleasant thoughts while the world rushes by.',
      courseCode: 'es',
      bonusXp: 5,
    },
    {
      phrase: 'Sobremesa',
      meaningEn: 'Lingering conversation after a meal',
      phonetic: 'soh-breh-meh-sah',
      category: 'Cultural Tradition',
      culturalInsight:
        'The sacred Spanish tradition of staying at the table for an hour after eating to chat, laugh, and connect.',
      courseCode: 'es',
      bonusXp: 5,
    },
  ],
};

/**
 * Deterministically retrieves the Daily Spark Word of the Day for the active course and date.
 * Rotates smoothly and sequentially every calendar day.
 */
export function getWordOfTheDay(courseCode: LangCode, date = new Date()): DailySparkWord {
  const pool = SPARK_POOL[courseCode] ?? SPARK_POOL.fr;
  // Compute day number aligned with local calendar day (matching dayKey)
  const localMidnightUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const dayNumber = Math.floor(localMidnightUtc / (1000 * 60 * 60 * 24));
  const index = Math.abs(dayNumber) % pool.length;
  return pool[index];
}

/**
 * Checks whether the learner has claimed today's +5 XP spark bonus.
 */
export function isDailySparkClaimed(progress: Progress, todayKey: string): boolean {
  return progress.dailySparkClaimedDay === todayKey;
}
