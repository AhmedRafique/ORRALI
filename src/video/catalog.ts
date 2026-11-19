import { LangCode } from '../types';
import { CommunityMission, VideoImmersionClip } from './types';

export const VIDEO_IMMERSION_CLIPS: VideoImmersionClip[] = [
  // --- FRENCH CLIPS ---
  {
    id: 'fr_clip_01_boulangerie',
    title: 'Au Fournil Parisien',
    topic: 'Ordering fresh croissants and a tradition baguette in Montmartre',
    languageId: 'fr',
    level: 'A2',
    durationSeconds: 12,
    thumbnailEmoji: '🥖',
    category: 'culinary_craft',
    speakerName: 'Élodie (Artisane Boulangère)',
    subtitles: [
      {
        id: 'fr_sub_1',
        startMs: 0,
        endMs: 5000,
        targetSentence: 'Bonjour ! Une baguette tradition bien cuite, s’il vous plaît.',
        translation: 'Hello! A well-baked traditional baguette, please.',
        words: [
          { word: 'Bonjour', translation: 'Hello' },
          { word: 'baguette', translation: 'baguette', phonetic: 'bah-get' },
          { word: 'tradition', translation: 'traditional artisan style' },
          { word: 'cuite', translation: 'baked / crusty' },
          { word: 'plaît', translation: 'please' },
        ],
      },
      {
        id: 'fr_sub_2',
        startMs: 5100,
        endMs: 12000,
        targetSentence: 'Et avec ceci, vous désirez un croissant au beurre ?',
        translation: 'And with this, would you like a butter croissant?',
        words: [
          { word: 'avec', translation: 'with' },
          { word: 'ceci', translation: 'this' },
          { word: 'désirez', translation: 'would you like / desire' },
          { word: 'croissant', translation: 'croissant', phonetic: 'krwah-sahn' },
          { word: 'beurre', translation: 'butter', phonetic: 'buhr' },
        ],
      },
    ],
    comprehensionCheck: {
      question: 'What kind of baguette did the customer request?',
      options: ['Une baguette blanche', 'Une baguette tradition bien cuite', 'Du pain de mie', 'Un croissant'],
      correctIndex: 1,
      explanation: 'The customer requested “Une baguette tradition bien cuite” (a well-baked artisan baguette).',
    },
  },
  {
    id: 'fr_clip_02_marche',
    title: 'Le Marché Provençal',
    topic: 'Discovering fresh lavender and goat cheese in Provence',
    languageId: 'fr',
    level: 'B1',
    durationSeconds: 14,
    thumbnailEmoji: '🧀',
    category: 'cultural_snippet',
    speakerName: 'Marc (Producteur Local)',
    subtitles: [
      {
        id: 'fr_sub_3',
        startMs: 0,
        endMs: 7000,
        targetSentence: 'Nos fromages de chèvre sont affinés artisanalement dans les collines.',
        translation: 'Our goat cheeses are aged in an artisan way in the hills.',
        words: [
          { word: 'fromages', translation: 'cheeses' },
          { word: 'chèvre', translation: 'goat', phonetic: 'sheh-vruh' },
          { word: 'affinés', translation: 'aged / matured' },
          { word: 'artisanalement', translation: 'artisanally' },
        ],
      },
      {
        id: 'fr_sub_4',
        startMs: 7100,
        endMs: 14000,
        targetSentence: 'Prenez le temps de goûter avec ce morceau de pain aux noix.',
        translation: 'Take the time to taste with this piece of walnut bread.',
        words: [
          { word: 'temps', translation: 'time' },
          { word: 'goûter', translation: 'to taste / sample' },
          { word: 'morceau', translation: 'piece / bite' },
          { word: 'noix', translation: 'walnuts' },
        ],
      },
    ],
    comprehensionCheck: {
      question: 'Where are the cheeses matured?',
      options: ['In a supermarket cellar', 'In the hills', 'In a coastal cave', 'In Paris'],
      correctIndex: 1,
      explanation: 'Marc mentions they are “affinés dans les collines” (aged in the hills).',
    },
  },

  // --- GERMAN CLIPS ---
  {
    id: 'de_clip_01_biergarten',
    title: 'Münchner Biergarten Kultur',
    topic: 'Ordering giant pretzels and Obatzda at the Chinesischer Turm',
    languageId: 'de',
    level: 'A2',
    durationSeconds: 12,
    thumbnailEmoji: '🥨',
    category: 'culinary_craft',
    speakerName: 'Maximilian (Münchner)',
    subtitles: [
      {
        id: 'de_sub_1',
        startMs: 0,
        endMs: 6000,
        targetSentence: 'Grüß Gott ! Eine frische Brezel und eine Portion Obatzda, bitte.',
        translation: 'Hello! A fresh pretzel and a portion of Obatzda cheese, please.',
        words: [
          { word: 'Grüß Gott', translation: 'Hello (Bavarian greeting)' },
          { word: 'frische', translation: 'fresh' },
          { word: 'Brezel', translation: 'pretzel', phonetic: 'bray-tsel' },
          { word: 'Obatzda', translation: 'Bavarian spiced cheese spread' },
        ],
      },
      {
        id: 'de_sub_2',
        startMs: 6100,
        endMs: 12000,
        targetSentence: 'Setzen wir uns unter die Kastanienbäume im Schatten !',
        translation: 'Let’s sit under the chestnut trees in the shade!',
        words: [
          { word: 'Setzen', translation: 'to sit down' },
          { word: 'Kastanienbäume', translation: 'chestnut trees' },
          { word: 'Schatten', translation: 'shade' },
        ],
      },
    ],
    comprehensionCheck: {
      question: 'Where do they decide to sit?',
      options: ['Inside the pavilion', 'Under the chestnut trees in the shade', 'By the fountain', 'At the entrance'],
      correctIndex: 1,
      explanation: 'They sit “unter die Kastanienbäume im Schatten” (under the chestnut trees in the shade).',
    },
  },

  // --- SPANISH CLIPS ---
  {
    id: 'es_clip_01_churros',
    title: 'Chocolatería San Ginés',
    topic: 'Tasting classic Madrid churros with thick dipping chocolate',
    languageId: 'es',
    level: 'A2',
    durationSeconds: 12,
    thumbnailEmoji: '☕',
    category: 'culinary_craft',
    speakerName: 'Elena (Madrileña)',
    subtitles: [
      {
        id: 'es_sub_1',
        startMs: 0,
        endMs: 6000,
        targetSentence: '¡Buenas tardes ! Una ración de churros con chocolate caliente, por favor.',
        translation: 'Good afternoon! A serving of churros with hot chocolate, please.',
        words: [
          { word: 'ración', translation: 'serving / portion' },
          { word: 'churros', translation: 'churros' },
          { word: 'chocolate', translation: 'chocolate' },
          { word: 'caliente', translation: 'hot' },
        ],
      },
      {
        id: 'es_sub_2',
        startMs: 6100,
        endMs: 12000,
        targetSentence: 'El chocolate es espeso y perfecto para mojar en una tarde fresca.',
        translation: 'The chocolate is thick and perfect for dipping on a crisp evening.',
        words: [
          { word: 'espeso', translation: 'thick / rich' },
          { word: 'perfecto', translation: 'perfect' },
          { word: 'mojar', translation: 'to dip' },
          { word: 'tarde', translation: 'afternoon / evening' },
        ],
      },
    ],
    comprehensionCheck: {
      question: 'How is the dipping chocolate described?',
      options: ['Dulce y ligero', 'Espeso y caliente', 'Frío', 'Amargo'],
      correctIndex: 1,
      explanation: 'Elena highlights that “el chocolate es espeso” (thick/rich).',
    },
  },
];

export const COMMUNITY_MISSIONS: CommunityMission[] = [
  {
    id: 'comm_fr_coffee',
    languageId: 'fr',
    title: 'Bistro de Paris Community Goal',
    description: 'The ORRALI community is uniting to order 10,000 virtual coffees across France.',
    targetCount: 10000,
    currentCount: 7420,
    unitName: 'coffees ordered',
    rewardXp: 50,
    isCompleted: false,
  },
  {
    id: 'comm_de_train',
    languageId: 'de',
    title: 'Bavarian ICE Transit Initiative',
    description: 'Master 5,000 transit and platform dialogues across German stations.',
    targetCount: 5000,
    currentCount: 3890,
    unitName: 'transit dialogues',
    rewardXp: 50,
    isCompleted: false,
  },
  {
    id: 'comm_es_market',
    languageId: 'es',
    title: 'Gran Mercado Cultural Challenge',
    description: 'Complete 8,000 market and culinary exchanges across Spain.',
    targetCount: 8000,
    currentCount: 6150,
    unitName: 'market orders',
    rewardXp: 50,
    isCompleted: false,
  },
];

export function getVideoClipsByLanguage(languageId: LangCode): VideoImmersionClip[] {
  return VIDEO_IMMERSION_CLIPS.filter((c) => c.languageId === languageId);
}

export function getVideoClipById(id: string): VideoImmersionClip | undefined {
  return VIDEO_IMMERSION_CLIPS.find((c) => c.id === id);
}

export function getCommunityMissions(languageId?: LangCode): CommunityMission[] {
  if (!languageId) return COMMUNITY_MISSIONS;
  return COMMUNITY_MISSIONS.filter((m) => m.languageId === languageId);
}
