import { LangCode } from '../types';

export type PhonemeCategory =
  | 'nasal_vowels'
  | 'rounded_vowels'
  | 'open_closed_vowels'
  | 'fricatives'
  | 'ich_ach_laut'
  | 'umlauts'
  | 'devoicing'
  | 'taps_and_trills'
  | 'palatals'
  | 'bilabials';

export interface MouthMechanics {
  tonguePosition: string;
  lipRounding: string;
  vocalCords: string;
  airflow: string;
}

export interface MinimalPair {
  id: string;
  languageId: LangCode;
  category: PhonemeCategory;
  phonemeA: string;
  phonemeB: string;
  wordA: string;
  meaningA: string;
  wordB: string;
  meaningB: string;
  sentenceA: string;
  sentenceB: string;
  phoneticContrast: string;
  mouthMechanicsA: MouthMechanics;
  mouthMechanicsB: MouthMechanics;
  acousticTip: string;
}

export interface PhonemeSprintChallenge {
  id: string;
  pair: MinimalPair;
  targetChoice: 'A' | 'B';
  playedWord: string;
  targetSentence: string;
  targetMeaning: string;
  targetPhoneme: string;
  options: [
    { key: 'A'; word: string; meaning: string; phoneme: string },
    { key: 'B'; word: string; meaning: string; phoneme: string }
  ];
}

export interface PhonemeEvaluationResult {
  isCorrect: boolean;
  selectedKey: 'A' | 'B';
  targetChoice: 'A' | 'B';
  playedWord: string;
  targetPhoneme: string;
  feedback: string;
  mouthTip: string;
  earnedXp: number;
}

export const MINIMAL_PAIRS_CATALOG: MinimalPair[] = [
  // --- FRENCH (fr) ---
  {
    id: 'fr-pair-tu-tout',
    languageId: 'fr',
    category: 'rounded_vowels',
    phonemeA: '/y/',
    phonemeB: '/u/',
    wordA: 'tu',
    meaningA: 'you (informal)',
    wordB: 'tout',
    meaningB: 'all / everything',
    sentenceA: 'Tu comprends ce mot ?',
    sentenceB: 'Tout va très bien.',
    phoneticContrast: 'High front rounded [y] vs high back rounded [u].',
    mouthMechanicsA: {
      tonguePosition: 'High front (say "ee")',
      lipRounding: 'Tightly protruded and rounded like a whistle',
      vocalCords: 'Voiced',
      airflow: 'Continuous oral resonance',
    },
    mouthMechanicsB: {
      tonguePosition: 'High back (pulled toward soft palate)',
      lipRounding: 'Relaxed rounded lips',
      vocalCords: 'Voiced',
      airflow: 'Deep oral resonance',
    },
    acousticTip: 'For [y] ("tu"), keep tongue in the "ee" position while shaping lips into a tight "o".',
  },
  {
    id: 'fr-pair-vin-vent',
    languageId: 'fr',
    category: 'nasal_vowels',
    phonemeA: '/ɛ̃/',
    phonemeB: '/ɑ̃/',
    wordA: 'vin',
    meaningA: 'wine',
    wordB: 'vent',
    meaningB: 'wind',
    sentenceA: 'Un verre de vin blanc, s’il vous plaît.',
    sentenceB: 'Le vent souffle fort ce soir.',
    phoneticContrast: 'Open-mid front unrounded nasal [ɛ̃] vs open back rounded nasal [ɑ̃].',
    mouthMechanicsA: {
      tonguePosition: 'Mid-low front, flat tongue',
      lipRounding: 'Slightly spread lips (smile posture)',
      vocalCords: 'Voiced with lowered soft palate',
      airflow: 'Combined oral and nasal escape',
    },
    mouthMechanicsB: {
      tonguePosition: 'Low back, dropped jaw',
      lipRounding: 'O-shaped rounded lips',
      vocalCords: 'Voiced with lowered soft palate',
      airflow: 'Resonant nasal outflow',
    },
    acousticTip: '[ɛ̃] ("vin") is a smiling nasal; [ɑ̃] ("vent") drops the jaw into an open bell shape.',
  },
  {
    id: 'fr-pair-bon-bain',
    languageId: 'fr',
    category: 'nasal_vowels',
    phonemeA: '/ɔ̃/',
    phonemeB: '/ɛ̃/',
    wordA: 'bon',
    meaningA: 'good',
    wordB: 'bain',
    meaningB: 'bath',
    sentenceA: 'C’est un très bon café.',
    sentenceB: 'Je vais prendre un bain chaud.',
    phoneticContrast: 'Close-mid back rounded nasal [ɔ̃] vs open-mid front nasal [ɛ̃].',
    mouthMechanicsA: {
      tonguePosition: 'Mid back retracted',
      lipRounding: 'Tight circular lips',
      vocalCords: 'Voiced with lowered velum',
      airflow: 'Dark nasal resonance',
    },
    mouthMechanicsB: {
      tonguePosition: 'Mid front wide',
      lipRounding: 'Neutral / unrounded',
      vocalCords: 'Voiced with lowered velum',
      airflow: 'Bright forward nasal resonance',
    },
    acousticTip: '[ɔ̃] ("bon") sounds deep and hollow, while [ɛ̃] ("bain") sounds bright and nasalized.',
  },
  {
    id: 'fr-pair-dessus-dessous',
    languageId: 'fr',
    category: 'rounded_vowels',
    phonemeA: '/y/',
    phonemeB: '/u/',
    wordA: 'dessus',
    meaningA: 'above / on top',
    wordB: 'dessous',
    meaningB: 'under / beneath',
    sentenceA: 'Le livre est posé dessus.',
    sentenceB: 'La clé est cachée dessous.',
    phoneticContrast: 'Front rounded [y] vs back rounded [u] creates opposite spatial meanings.',
    mouthMechanicsA: {
      tonguePosition: 'High front',
      lipRounding: 'Sharp puckered lips',
      vocalCords: 'Voiced',
      airflow: 'High acoustic pitch',
    },
    mouthMechanicsB: {
      tonguePosition: 'High back',
      lipRounding: 'Rounded',
      vocalCords: 'Voiced',
      airflow: 'Lower acoustic pitch',
    },
    acousticTip: 'Missing the lip protrusion on "dessus" turns it into "dessous" (underneath).',
  },
  {
    id: 'fr-pair-poisson-poison',
    languageId: 'fr',
    category: 'fricatives',
    phonemeA: '/s/',
    phonemeB: '/z/',
    wordA: 'poisson',
    meaningA: 'fish',
    wordB: 'poison',
    meaningB: 'poison',
    sentenceA: 'Le poisson du jour est frais.',
    sentenceB: 'Ce champignon est un poison.',
    phoneticContrast: 'Voiceless alveolar sibilant [s] vs voiced alveolar sibilant [z].',
    mouthMechanicsA: {
      tonguePosition: 'Alveolar ridge tip constriction',
      lipRounding: 'Neutral',
      vocalCords: 'Silent / unvoiced',
      airflow: 'Sharp hissing friction',
    },
    mouthMechanicsB: {
      tonguePosition: 'Alveolar ridge tip constriction',
      lipRounding: 'Neutral',
      vocalCords: 'Vibrating / voiced',
      airflow: 'Buzzing friction',
    },
    acousticTip: 'Double "ss" is voiceless hissing /s/; single intervocalic "s" vibrates /z/.',
  },

  // --- GERMAN (de) ---
  {
    id: 'de-pair-schon-schon',
    languageId: 'de',
    category: 'umlauts',
    phonemeA: '/oː/',
    phonemeB: '/øː/',
    wordA: 'schon',
    meaningA: 'already',
    wordB: 'schön',
    meaningB: 'beautiful / nice',
    sentenceA: 'Ich bin schon am Bahnhof angekommen.',
    sentenceB: 'Das Wetter heute ist wirklich schön.',
    phoneticContrast: 'Back vowel [oː] vs front rounded umlaut [øː].',
    mouthMechanicsA: {
      tonguePosition: 'Mid-high back',
      lipRounding: 'Rounded',
      vocalCords: 'Voiced',
      airflow: 'Dark back resonance',
    },
    mouthMechanicsB: {
      tonguePosition: 'Mid-high front (say "eh")',
      lipRounding: 'Puckered circle lips',
      vocalCords: 'Voiced',
      airflow: 'Focused forward resonance',
    },
    acousticTip: 'Say "eh" (as in "bed") with rounded lips to pronounce "schön" [øː].',
  },
  {
    id: 'de-pair-fuhren-fuhlen',
    languageId: 'de',
    category: 'umlauts',
    phonemeA: '/uː/',
    phonemeB: '/yː/',
    wordA: 'fuhren',
    meaningA: 'drove (past)',
    wordB: 'fühlen',
    meaningB: 'to feel',
    sentenceA: 'Wir fuhren gestern nach Berlin.',
    sentenceB: 'Wir fühlen uns hier sehr wohl.',
    phoneticContrast: 'High back [uː] vs high front rounded umlaut [yː].',
    mouthMechanicsA: {
      tonguePosition: 'High back tongue body',
      lipRounding: 'Medium round',
      vocalCords: 'Voiced',
      airflow: 'Deep oral resonance',
    },
    mouthMechanicsB: {
      tonguePosition: 'High front tongue blade',
      lipRounding: 'Tight whistle round',
      vocalCords: 'Voiced',
      airflow: 'High-frequency resonance',
    },
    acousticTip: 'Say "ee" while holding lips rounded like an "o" to make ü [yː].',
  },
  {
    id: 'de-pair-nicht-nacht',
    languageId: 'de',
    category: 'ich_ach_laut',
    phonemeA: '/ç/',
    phonemeB: '/x/',
    wordA: 'nicht',
    meaningA: 'not',
    wordB: 'Nacht',
    meaningB: 'night',
    sentenceA: 'Das ist nicht so schwierig.',
    sentenceB: 'Gute Nacht und schlaf gut.',
    phoneticContrast: 'Palatal fricative Ich-Laut [ç] vs velar fricative Ach-Laut [x].',
    mouthMechanicsA: {
      tonguePosition: 'Arch of tongue raised toward hard palate (like whisper "hue")',
      lipRounding: 'Unrounded / slight smile',
      vocalCords: 'Unvoiced',
      airflow: 'Soft airy palatal hissing',
    },
    mouthMechanicsB: {
      tonguePosition: 'Back of tongue raised toward soft palate/uvula',
      lipRounding: 'Open neutral',
      vocalCords: 'Unvoiced',
      airflow: 'Deep throaty friction (scraping)',
    },
    acousticTip: 'After front vowels (i, e, ä, ö, ü), use palatal /ç/; after back vowels (a, o, u), use throaty /x/.',
  },
  {
    id: 'de-pair-rad-rat',
    languageId: 'de',
    category: 'devoicing',
    phonemeA: '/t/ (spelled d)',
    phonemeB: '/t/ (spelled t)',
    wordA: 'Rad',
    meaningA: 'wheel / bike',
    wordB: 'Rat',
    meaningB: 'advice / council',
    sentenceA: 'Mein altes Rad braucht neue Reifen.',
    sentenceB: 'Ich brauche deinen guten Rat.',
    phoneticContrast: 'Auslautverhärtung (final devoicing of voiced d to sharp [t]).',
    mouthMechanicsA: {
      tonguePosition: 'Alveolar stop with underlying voiced plural (Räder [d])',
      lipRounding: 'Neutral',
      vocalCords: 'Unvoiced at word end',
      airflow: 'Crisp alveolar plosive',
    },
    mouthMechanicsB: {
      tonguePosition: 'Alveolar stop (Räte [t])',
      lipRounding: 'Neutral',
      vocalCords: 'Unvoiced',
      airflow: 'Crisp alveolar plosive',
    },
    acousticTip: 'At the end of words, German d devoices into sharp t, identical to "Rat".',
  },
  {
    id: 'de-pair-holle-hohle',
    languageId: 'de',
    category: 'umlauts',
    phonemeA: '/œ/',
    phonemeB: '/oː/',
    wordA: 'Hölle',
    meaningA: 'hell',
    wordB: 'Höhle',
    meaningB: 'cave / hollow',
    sentenceA: 'Hier ist die Hölle los!',
    sentenceB: 'Der Bär schläft in der Höhle.',
    phoneticContrast: 'Short open-mid front rounded [œ] vs long tense back [oː].',
    mouthMechanicsA: {
      tonguePosition: 'Mid-low front',
      lipRounding: 'Relaxed rounded',
      vocalCords: 'Voiced',
      airflow: 'Short duration',
    },
    mouthMechanicsB: {
      tonguePosition: 'Mid-high back',
      lipRounding: 'Tight oval round',
      vocalCords: 'Voiced',
      airflow: 'Extended long duration',
    },
    acousticTip: 'Double consonant "ll" makes the umlaut [œ] snappy and short.',
  },

  // --- SPANISH (es) ---
  {
    id: 'es-pair-pero-perro',
    languageId: 'es',
    category: 'taps_and_trills',
    phonemeA: '/ɾ/',
    phonemeB: '/r/',
    wordA: 'pero',
    meaningA: 'but / however',
    wordB: 'perro',
    meaningB: 'dog',
    sentenceA: 'Quiero ir, pero no tengo tiempo.',
    sentenceB: 'El perro corre por el parque.',
    phoneticContrast: 'Single alveolar tap [ɾ] vs multiple alveolar trill [r].',
    mouthMechanicsA: {
      tonguePosition: 'Single tap against alveolar ridge (like American "ladder")',
      lipRounding: 'Neutral',
      vocalCords: 'Voiced',
      airflow: 'Instantaneous tap (~25ms)',
    },
    mouthMechanicsB: {
      tonguePosition: 'Relaxed tongue tip hovering at alveolar ridge',
      lipRounding: 'Neutral',
      vocalCords: 'Voiced with pressurized air',
      airflow: 'Multiple aerodynamic vibration taps (~3-4 pulses)',
    },
    acousticTip: '"pero" taps once; "perro" lets airflow rapidly vibrate the relaxed tongue tip.',
  },
  {
    id: 'es-pair-caro-carro',
    languageId: 'es',
    category: 'taps_and_trills',
    phonemeA: '/ɾ/',
    phonemeB: '/r/',
    wordA: 'caro',
    meaningA: 'expensive',
    wordB: 'carro',
    meaningB: 'car / cart',
    sentenceA: 'Este restaurante es muy caro.',
    sentenceB: 'Dejamos las maletas en el carro.',
    phoneticContrast: 'Single alveolar tap [ɾ] vs sustained trill [r].',
    mouthMechanicsA: {
      tonguePosition: 'Single brisk tap on alveolar roof',
      lipRounding: 'Neutral',
      vocalCords: 'Voiced',
      airflow: 'Quick ballistic movement',
    },
    mouthMechanicsB: {
      tonguePosition: 'Tongue blade sealed, tip free to flutter',
      lipRounding: 'Neutral',
      vocalCords: 'Voiced',
      airflow: 'Sustained trill vibration',
    },
    acousticTip: 'Mispronouncing the tap in "caro" turns an expensive bill into a vehicle ("carro").',
  },
  {
    id: 'es-pair-ano-ano',
    languageId: 'es',
    category: 'palatals',
    phonemeA: '/n/',
    phonemeB: '/ɲ/',
    wordA: 'ano',
    meaningA: 'anatomical canal',
    wordB: 'año',
    meaningB: 'year',
    sentenceA: 'El ano es un conducto anatómico.',
    sentenceB: '¡Feliz año nuevo a todos!',
    phoneticContrast: 'Alveolar nasal [n] vs voiced palatal nasal [ɲ] (enye).',
    mouthMechanicsA: {
      tonguePosition: 'Tongue tip against front upper gumline',
      lipRounding: 'Neutral',
      vocalCords: 'Voiced',
      airflow: 'Nasal cavity escape through front alveolar contact',
    },
    mouthMechanicsB: {
      tonguePosition: 'Tongue body pressed broad and flat against hard palate (like "canyon")',
      lipRounding: 'Neutral',
      vocalCords: 'Voiced',
      airflow: 'Nasal resonance with palatal contact release',
    },
    acousticTip: 'Always pronounce the palatal tilde [ɲ]: "año" has a broad tongue press like "canyon".',
  },
  {
    id: 'es-pair-cabo-capo',
    languageId: 'es',
    category: 'bilabials',
    phonemeA: '/β/',
    phonemeB: '/p/',
    wordA: 'cabo',
    meaningA: 'cape / end / corporal',
    wordB: 'capo',
    meaningB: 'boss / mobster',
    sentenceA: 'Llegamos al cabo de la costa.',
    sentenceB: 'El capo de la mafia fue detenido.',
    phoneticContrast: 'Intervocalic voiced bilabial approximant [β] vs voiceless bilabial plosive [p].',
    mouthMechanicsA: {
      tonguePosition: 'Neutral',
      lipRounding: 'Lips approach without fully sealing (gentle slit)',
      vocalCords: 'Voiced continuous vibration',
      airflow: 'Smooth friction-free bilabial glide',
    },
    mouthMechanicsB: {
      tonguePosition: 'Neutral',
      lipRounding: 'Full firm lip seal then burst',
      vocalCords: 'Unvoiced until burst',
      airflow: 'Sudden explosive oral release',
    },
    acousticTip: 'In Spanish, intervocalic "b/v" never pops like English "b"—lips just touch lightly.',
  },
  {
    id: 'es-pair-peine-pene',
    languageId: 'es',
    category: 'open_closed_vowels',
    phonemeA: '/ei/',
    phonemeB: '/e/',
    wordA: 'peine',
    meaningA: 'comb',
    wordB: 'pene',
    meaningB: 'penis / biological term',
    sentenceA: 'Compré un peine de madera.',
    sentenceB: 'El pene es un término biológico.',
    phoneticContrast: 'Diphthong [ei] with gliding second element vs pure monophthong [e].',
    mouthMechanicsA: {
      tonguePosition: 'Glides from mid-front [e] upward to high-front [i]',
      lipRounding: 'Spreads slightly wider',
      vocalCords: 'Voiced',
      airflow: 'Continuous dual-vowel resonance',
    },
    mouthMechanicsB: {
      tonguePosition: 'Stationary mid-front [e]',
      lipRounding: 'Neutral',
      vocalCords: 'Voiced',
      airflow: 'Single stable vowel resonance',
    },
    acousticTip: 'Articulate the glide [i] in "peine" clearly to avoid dropping into the embarrassing false friend.',
  },
];

export function getMinimalPairsByLanguage(lang: LangCode): MinimalPair[] {
  return MINIMAL_PAIRS_CATALOG.filter((p) => p.languageId === lang);
}

export function getMinimalPairById(id: string): MinimalPair | undefined {
  return MINIMAL_PAIRS_CATALOG.find((p) => p.id === id);
}

/**
 * Builds a dynamic Minimal Pair sprint challenge deck.
 */
export function buildPhonemeSprint(
  lang: LangCode,
  count: number = 5
): PhonemeSprintChallenge[] {
  const pool = getMinimalPairsByLanguage(lang);
  if (pool.length === 0) return [];

  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Math.min(count, pool.length));

  return selected.map((pair, idx) => {
    // Randomly choose whether A or B is the acoustic prompt
    const targetChoice: 'A' | 'B' = Math.random() >= 0.5 ? 'A' : 'B';
    const playedWord = targetChoice === 'A' ? pair.wordA : pair.wordB;
    const targetSentence =
      targetChoice === 'A' ? pair.sentenceA : pair.sentenceB;
    const targetMeaning = targetChoice === 'A' ? pair.meaningA : pair.meaningB;
    const targetPhoneme = targetChoice === 'A' ? pair.phonemeA : pair.phonemeB;

    return {
      id: `sprint-${pair.id}-${idx}`,
      pair,
      targetChoice,
      playedWord,
      targetSentence,
      targetMeaning,
      targetPhoneme,
      options: [
        {
          key: 'A',
          word: pair.wordA,
          meaning: pair.meaningA,
          phoneme: pair.phonemeA,
        },
        {
          key: 'B',
          word: pair.wordB,
          meaning: pair.meaningB,
          phoneme: pair.phonemeB,
        },
      ],
    };
  });
}

/**
 * Evaluates the learner's minimal pair auditory choice and returns actionable mouth mechanics feedback.
 */
export function evaluatePhonemeSprintAnswer(
  challenge: PhonemeSprintChallenge,
  selectedKey: 'A' | 'B'
): PhonemeEvaluationResult {
  const isCorrect = selectedKey === challenge.targetChoice;
  const targetChoice = challenge.targetChoice;
  const pair = challenge.pair;

  const targetWord = targetChoice === 'A' ? pair.wordA : pair.wordB;
  const otherWord = targetChoice === 'A' ? pair.wordB : pair.wordA;
  const targetPhoneme = targetChoice === 'A' ? pair.phonemeA : pair.phonemeB;
  const mechanics =
    targetChoice === 'A' ? pair.mouthMechanicsA : pair.mouthMechanicsB;

  if (isCorrect) {
    return {
      isCorrect: true,
      selectedKey,
      targetChoice,
      playedWord: challenge.playedWord,
      targetPhoneme,
      feedback: `Exact acoustic discrimination! You correctly recognized "${targetWord}" (${targetPhoneme}) versus "${otherWord}".`,
      mouthTip: `${pair.acousticTip} Tongue: ${mechanics.tonguePosition}. Lips: ${mechanics.lipRounding}.`,
      earnedXp: 20,
    };
  }

  return {
    isCorrect: false,
    selectedKey,
    targetChoice,
    playedWord: challenge.playedWord,
    targetPhoneme,
    feedback: `Phonetic slip! The audio was "${targetWord}" (${targetPhoneme}), not "${otherWord}". ${pair.phoneticContrast}`,
    mouthTip: `${pair.acousticTip} Check your articulation: ${mechanics.tonguePosition}, ${mechanics.lipRounding}.`,
    earnedXp: 5,
  };
}
