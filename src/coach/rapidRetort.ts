import { LangCode } from '../types';

export interface RetortOption {
  text: string;
  hasFiller: boolean;
  isNaturalComeback: boolean;
  pedagogicalNote: string;
}

export interface RapidRetortScenario {
  id: string;
  languageId: LangCode;
  interlocutorName: string;
  context: string;
  incomingPrompt: string;
  englishTranslation: string;
  urgencyLevel: 'moderate' | 'high' | 'pressure';
  idealRetort: string;
  validFillers: string[];
  acceptableKeywords: string[];
  options: RetortOption[];
}

export interface RetortEvaluation {
  isSuccessful: boolean;
  speedSeconds: number;
  detectedFiller?: string;
  fluencyScore: number;
  earnedXp: number;
  feedback: string;
  nativeAlternative: string;
}

export const DISCOURSE_FILLERS: Record<LangCode, string[]> = {
  fr: ['du coup', 'en fait', 'genre', 'enfin', 'écoute', 'disons', 'tu vois', 'bah', 'ben', 'franchement', 'attendez', 'c’est-à-dire'],
  de: ['halt', 'na ja', 'quasi', 'eigentlich', 'sozusagen', 'mal sehen', 'pass auf', 'tja', 'ehrlich gesagt', 'na gut'],
  es: ['en plan', 'o sea', 'bueno', 'a ver', 'pues nada', 'digo yo', 'fíjate', 'es que', 'qué va', 'mira', 'ya ves'],
};

export const RAPID_RETORT_CATALOG: RapidRetortScenario[] = [
  // --- FRENCH (fr) ---
  {
    id: 'fr-retort-late-arrival',
    languageId: 'fr',
    interlocutorName: 'Camille',
    context: 'Terrasse de café à Montmartre',
    incomingPrompt: "Alors, t'étais où ? On t'attend depuis une demi-heure !",
    englishTranslation: "So, where were you? We've been waiting for you for half an hour!",
    urgencyLevel: 'pressure',
    idealRetort: "Écoute, en fait la ligne 4 était complètement bloquée, désolé !",
    validFillers: ['écoute', 'en fait', 'du coup', 'bah', 'désolé'],
    acceptableKeywords: ['bloquée', 'métro', 'retard', 'bouchon', 'désolé', 'ligne'],
    options: [
      {
        text: "Écoute, en fait le métro était complètement à l'arrêt, pardon !",
        hasFiller: true,
        isNaturalComeback: true,
        pedagogicalNote: "Authentic, conversational comeback using 'Écoute' and 'en fait' to defuse tension immediately.",
      },
      {
        text: "Je suis désolé pour mon retard de trente minutes.",
        hasFiller: false,
        isNaturalComeback: false,
        pedagogicalNote: "Stiff and robotic textbook phrasing; lacks natural conversational fluidity.",
      },
      {
        text: "Pourquoi vous m'attendez ici ?",
        hasFiller: false,
        isNaturalComeback: false,
        pedagogicalNote: "Aggressive and defensive; violates social politeness norms.",
      },
    ],
  },
  {
    id: 'fr-retort-expensive-bill',
    languageId: 'fr',
    interlocutorName: 'Serveur pressé',
    context: 'Bistrot parisien touristique',
    incomingPrompt: "Ça vous fera quarante-cinq euros pour les deux cafés et l'eau plate.",
    englishTranslation: "That will be forty-five euros for the two coffees and the still water.",
    urgencyLevel: 'high',
    idealRetort: "Attendez, enfin, il doit y avoir une erreur sur l'addition, non ?",
    validFillers: ['attendez', 'enfin', 'c’est-à-dire', 'pardon'],
    acceptableKeywords: ['erreur', 'addition', 'cher', 'quarante', 'vérifier'],
    options: [
      {
        text: "Attendez, enfin... vous êtes sûr qu'il n'y a pas une erreur là ?",
        hasFiller: true,
        isNaturalComeback: true,
        pedagogicalNote: "Polite yet assertive retort using 'Attendez, enfin' to trigger a bill review without creating a scene.",
      },
      {
        text: "Non, je refuse de payer cette somme exorbitante !",
        hasFiller: false,
        isNaturalComeback: false,
        pedagogicalNote: "Overly dramatic theatrical response rather than a practical dispute.",
      },
      {
        text: "Oui d'accord, voici ma carte bleue.",
        hasFiller: false,
        isNaturalComeback: false,
        pedagogicalNote: "Accepts an obvious overcharge without questioning it.",
      },
    ],
  },

  // --- GERMAN (de) ---
  {
    id: 'de-retort-delayed-train',
    languageId: 'de',
    interlocutorName: 'Zugbegleiter',
    context: 'Hauptbahnhof Gleis 7',
    incomingPrompt: "Der ICE nach München fällt leider wegen einer Signalstörung komplett aus.",
    englishTranslation: "The ICE to Munich is unfortunately completely cancelled due to a signal malfunction.",
    urgencyLevel: 'pressure',
    idealRetort: "Na ja, gibt es denn halt eine alternative Verbindung über Nürnberg?",
    validFillers: ['na ja', 'halt', 'pass auf', 'eigentlich'],
    acceptableKeywords: ['alternative', 'verbindung', 'wann', 'nürnberg', 'umsteigen', 'zug'],
    options: [
      {
        text: "Na ja, gibt es denn halt irgendeine alternative Verbindung für heute?",
        hasFiller: true,
        isNaturalComeback: true,
        pedagogicalNote: "Natural resilience using modal particle 'halt' and 'Na ja' to pivot immediately to solutions.",
      },
      {
        text: "Das ist sehr schlecht für meine persönliche Planung.",
        hasFiller: false,
        isNaturalComeback: false,
        pedagogicalNote: "Too formal and passive; does not ask for the next train connection.",
      },
      {
        text: "Ich bleibe einfach für immer am Bahnhof stehen.",
        hasFiller: false,
        isNaturalComeback: false,
        pedagogicalNote: "Sarcastic surrender that leaves you stranded.",
      },
    ],
  },
  {
    id: 'de-retort-urgent-deadline',
    languageId: 'de',
    interlocutorName: 'Projektleiter Felix',
    context: 'Open-Space Büro in Frankfurt',
    incomingPrompt: "Schaffst du die Präsentation für den Vorstand noch vor 17 Uhr?",
    englishTranslation: "Can you manage the board presentation before 5 PM?",
    urgencyLevel: 'high',
    idealRetort: "Mal sehen, eigentlich brauche ich noch dreißig Minuten für die Zahlen.",
    validFillers: ['mal sehen', 'eigentlich', 'pass auf', 'na gut'],
    acceptableKeywords: ['zahlen', 'fertig', 'minuten', 'schaffe', 'senden'],
    options: [
      {
        text: "Eigentlich schon, pass auf: ich brauche nur noch kurz die letzten Zahlen.",
        hasFiller: true,
        isNaturalComeback: true,
        pedagogicalNote: "Confident professional retort using 'eigentlich' and 'pass auf' to manage expectations realistically.",
      },
      {
        text: "Nein, das ist absolut unmöglich und nicht machbar.",
        hasFiller: false,
        isNaturalComeback: false,
        pedagogicalNote: "Abrupt rejection without offering status or ETA.",
      },
      {
        text: "Ich weiß nicht, was eine Präsentation ist.",
        hasFiller: false,
        isNaturalComeback: false,
        pedagogicalNote: "Nonsensical response.",
      },
    ],
  },

  // --- SPANISH (es) ---
  {
    id: 'es-retort-split-bill',
    languageId: 'es',
    interlocutorName: 'Mateo',
    context: 'Tapeo de fin de semana en Madrid',
    incomingPrompt: "¿Oye, dividimos la cuenta a partes iguales aunque solo hayas tomado agua?",
    englishTranslation: "Hey, shall we split the bill equally even though you only had water?",
    urgencyLevel: 'pressure',
    idealRetort: "A ver, o sea, prefiero pagar lo mío que os habéis pedido tres raciones de jamón.",
    validFillers: ['a ver', 'o sea', 'bueno', 'en plan'],
    acceptableKeywords: ['pagar', 'mío', 'agua', 'cuenta', 'raciones', 'separado'],
    options: [
      {
        text: "A ver, o sea... yo pago lo mío, que vosotros os habéis puesto las botas con el jamón.",
        hasFiller: true,
        isNaturalComeback: true,
        pedagogicalNote: "Spot-on Spanish social assertiveness using 'A ver' and 'o sea' with a witty idiom ('ponerse las botas').",
      },
      {
        text: "Sí, acepto pagar el total de todos ustedes.",
        hasFiller: false,
        isNaturalComeback: false,
        pedagogicalNote: "Overly submissive; pays for everyone else's lavish dinner.",
      },
      {
        text: "Me voy corriendo del restaurante sin pagar nada.",
        hasFiller: false,
        isNaturalComeback: false,
        pedagogicalNote: "Illegal dining and dashing; unhelpful.",
      },
    ],
  },
  {
    id: 'es-retort-rainy-surprise',
    languageId: 'es',
    interlocutorName: 'Lucía',
    context: 'Plaza Mayor en pleno chaparrón',
    incomingPrompt: "¡Madre mía, está cayendo la del pulpo y vienes sin paraguas!",
    englishTranslation: "Good grief, it's pouring cats and dogs and you came without an umbrella!",
    urgencyLevel: 'moderate',
    idealRetort: "Es que, mira, cuando salí de casa hacía un sol increíble, ¡ya ves!",
    validFillers: ['es que', 'mira', 'ya ves', 'qué va'],
    acceptableKeywords: ['sol', 'casa', 'salí', 'tiempo', 'paraguas', 'llover'],
    options: [
      {
        text: "Es que, mira... ¡cuando salí de casa hacía un solazo de cine, ya ves!",
        hasFiller: true,
        isNaturalComeback: true,
        pedagogicalNote: "Vibrant colloquial retort with 'Es que', 'mira', and 'ya ves' perfectly contextualizing the weather change.",
      },
      {
        text: "El agua moja la ropa y la piel de las personas.",
        hasFiller: false,
        isNaturalComeback: false,
        pedagogicalNote: "Cold scientific definition of precipitation; completely unhuman.",
      },
      {
        text: "No llueve, estás alucinando por completo.",
        hasFiller: false,
        isNaturalComeback: false,
        pedagogicalNote: "Denying physical reality while soaked in rain.",
      },
    ],
  },
];

export function getRetortScenariosByLanguage(lang: LangCode): RapidRetortScenario[] {
  return RAPID_RETORT_CATALOG.filter((s) => s.languageId === lang);
}

export function getRetortScenarioById(id: string): RapidRetortScenario | undefined {
  return RAPID_RETORT_CATALOG.find((s) => s.id === id);
}

export function buildRetortDuelDeck(lang: LangCode, count: number = 3): RapidRetortScenario[] {
  const pool = getRetortScenariosByLanguage(lang);
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, pool.length));
}

/**
 * Checks if input text contains an authentic conversational filler for the given language.
 */
export function detectDiscourseFillers(input: string, lang: LangCode): string | undefined {
  const normalized = input.toLowerCase();
  const fillers = DISCOURSE_FILLERS[lang] ?? [];
  return fillers.find((f) => normalized.includes(f.toLowerCase()));
}

/**
 * Evaluates a rapid retort response under countdown pressure.
 */
export function evaluateRetortSubmission(
  scenario: RapidRetortScenario,
  responseText: string,
  elapsedSeconds: number
): RetortEvaluation {
  const normalized = responseText.trim().toLowerCase();
  const matchedOption = scenario.options.find((o) => o.text.trim().toLowerCase() === normalized);

  const detectedFiller = detectDiscourseFillers(responseText, scenario.languageId);
  const containsKeyword = scenario.acceptableKeywords.some((k) => normalized.includes(k.toLowerCase()));

  // Time-based speed multiplier
  const isSpeedy = elapsedSeconds <= 5.0;
  const isTimeOut = elapsedSeconds > 10.0;

  if (matchedOption) {
    if (matchedOption.isNaturalComeback) {
      const speedBonus = isSpeedy ? 15 : 5;
      const fillerBonus = matchedOption.hasFiller ? 10 : 0;
      const totalXp = 25 + speedBonus + fillerBonus;

      return {
        isSuccessful: true,
        speedSeconds: elapsedSeconds,
        detectedFiller: detectedFiller ?? scenario.validFillers[0],
        fluencyScore: isSpeedy ? 98 : 85,
        earnedXp: totalXp,
        feedback: `Lightning Retort! Delivered in ${elapsedSeconds.toFixed(1)}s with natural fluency. ${matchedOption.pedagogicalNote}`,
        nativeAlternative: scenario.idealRetort,
      };
    }

    return {
      isSuccessful: false,
      speedSeconds: elapsedSeconds,
      detectedFiller,
      fluencyScore: 40,
      earnedXp: 5,
      feedback: `Missed the conversational rhythm. ${matchedOption.pedagogicalNote}`,
      nativeAlternative: scenario.idealRetort,
    };
  }

  // Open-text or freeform input evaluation
  if (!isTimeOut && (detectedFiller || containsKeyword)) {
    const totalXp = isSpeedy ? 35 : 25;
    return {
      isSuccessful: true,
      speedSeconds: elapsedSeconds,
      detectedFiller,
      fluencyScore: isSpeedy ? 92 : 80,
      earnedXp: totalXp,
      feedback: `Spontaneous Comeback! Communicative intent met under time pressure (${elapsedSeconds.toFixed(1)}s).`,
      nativeAlternative: scenario.idealRetort,
    };
  }

  return {
    isSuccessful: false,
    speedSeconds: elapsedSeconds,
    detectedFiller,
    fluencyScore: 25,
    earnedXp: 5,
    feedback: isTimeOut
      ? 'Time freeze! Native speakers move forward if you hesitate past 10 seconds. Buy time with discourse fillers.'
      : 'Incongruent retort! Your comeback did not resolve the social situation.',
    nativeAlternative: scenario.idealRetort,
  };
}
