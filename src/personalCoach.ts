import { LangCode, LearningActivityKind, SavedPhrase, ConversationMemoryContext, GrammarRadarData } from './types';

const INFINITIVE_ENDINGS: Record<LangCode, RegExp> = {
  fr: /^\p{L}{3,}(er|ir|re|oir)$/u,
  es: /^\p{L}{3,}(ar|er|ir)$/u,
  de: /^\p{L}{3,}(en|ern|eln)$/u,
};

// Common non-verbs that happen to share an infinitive-looking ending.
const NOT_VERBS = new Set(['hier', 'cher', 'mer', 'super', 'dernier', 'premier', 'entier', 'leer', 'der', 'wir', 'mir', 'dir', 'ihr']);

/**
 * Very small heuristic: a phrase "looks like" a verb phrase when it is a single
 * token (or starts with a token) that ends in an infinitive ending for the language.
 * Matches whole words only, so "Merci beaucoup" is not tagged as a verb.
 */
function looksLikeInfinitivePhrase(languageId: LangCode, target: string): boolean {
  const ending = INFINITIVE_ENDINGS[languageId];
  if (!ending) return false;
  const tokens = target.toLowerCase().replace(/[.,!?;:]/g, '').split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;
  const candidate = tokens[0];
  return !NOT_VERBS.has(candidate) && ending.test(candidate);
}

/**
 * Creates a new personal phrase saved by the user.
 */
export function savePersonalPhrase(
  languageId: LangCode,
  target: string,
  en: string,
  sourceActivity: LearningActivityKind
): SavedPhrase {
  const id = `${languageId}-phrase-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const tags: string[] = [];

  // Very simple auto-tagging
  const lower = target.toLowerCase() + ' ' + en.toLowerCase();
  if (lower.includes('travel') || lower.includes('voyage') || lower.includes('viaj')) {
    tags.push('travel');
  }
  if (lower.includes('gusta') || lower.includes('like') || lower.includes('aime')) {
    tags.push('preference');
  }
  if (looksLikeInfinitivePhrase(languageId, target)) {
    tags.push('verb');
  }

  return {
    id,
    target,
    en,
    languageId,
    savedAt: Date.now(),
    sourceActivity,
    tags
  };
}

/**
 * Updates the contextual conversational memory with new interactions.
 */
export function updateConversationMemory(
  memory: ConversationMemoryContext,
  updates: { newPreference?: { key: string; value: string }; newMistake?: string }
): ConversationMemoryContext {
  const nextMemory = { ...memory };
  nextMemory.userPreferences = { ...memory.userPreferences };
  nextMemory.knownMistakes = [...memory.knownMistakes];
  nextMemory.lastInteractionAt = Date.now();

  if (updates.newPreference) {
    nextMemory.userPreferences[updates.newPreference.key] = updates.newPreference.value;
  }

  if (updates.newMistake && !nextMemory.knownMistakes.includes(updates.newMistake)) {
    nextMemory.knownMistakes.push(updates.newMistake);
  }

  return nextMemory;
}

/**
 * Analyzes text to provide real-time Grammar Radar metrics.
 */
export function analyzeGrammarRadar(
  targetLanguage: LangCode,
  text: string
): GrammarRadarData {
  const detectedPatterns: string[] = [];
  const suggestedFocus: string[] = [];
  
  if (targetLanguage === 'fr') {
    // Passé composé = avoir/être conjugated + a past participle.
    // Participles are matched by form (-é/-ée/-és/-ées) or from a list of common irregulars,
    // so present-tense "je suis ici" is NOT mistaken for a past tense.
    const aux = "(?:j'ai|ai|as|a|avons|avez|ont|suis|es|est|sommes|êtes|etes|sont)";
    const irregular = '(?:fait|pris|mis|vu|eu|été|ete|dit|écrit|ecrit|bu|lu|su|pu|voulu|dû|du|reçu|recu|venu|parti|sorti|né|ne|mort|ouvert|offert|appris|compris|vécu|vecu)';
    const participle = `(?:\\p{L}+(?:é|ée|és|ées)|${irregular})`;
    const passeCompose = new RegExp(`(?<![\\p{L}])${aux}\\s+(?:\\p{L}+\\s+)?${participle}(?![\\p{L}])`, 'iu');
    if (passeCompose.test(text.replace(/’/g, "'"))) {
      detectedPatterns.push('passe_compose');
    }
    if (/(?<![\p{L}])(voudrais|aimerais|pourrais|devrais)(?![\p{L}])/iu.test(text)) {
      detectedPatterns.push('conditionnel');
    }
  } else if (targetLanguage === 'es') {
    // Pretérito perfecto = haber + participle (-ado / -ido / irregular).
    if (/(?<![\p{L}])(he|has|ha|hemos|habéis|habeis|han)\s+(?:\p{L}+(?:ado|ido)|hecho|dicho|visto|puesto|escrito|abierto|vuelto|roto|muerto)(?![\p{L}])/iu.test(text)) {
      detectedPatterns.push('perfecto');
    }
  } else if (targetLanguage === 'de') {
    // Perfekt = haben/sein + ge-…-t / ge-…-en participle at the end of the clause.
    if (/(?<![\p{L}])(habe|hast|hat|haben|habt|bin|bist|ist|sind|seid)(?![\p{L}]).*?(?<![\p{L}])ge\p{L}{2,}(?:t|en)(?![\p{L}])/iu.test(text)) {
      detectedPatterns.push('perfekt');
    }
  }

  if (detectedPatterns.includes('passe_compose')) {
    suggestedFocus.push('Review auxiliary verbs (avoir/être)');
  }

  return {
    radarId: `radar-${Date.now()}`,
    targetLanguage,
    detectedPatterns,
    suggestedFocus
  };
}

export {
  generateCoachResponse,
  buildPedagogicalSystemPrompt,
  setAiServiceConfig,
  getAiServiceConfig,
} from './coach/aiService';
export type {
  AiProvider,
  AiServiceConfig,
  CoachRequestParams,
  CoachResponse,
} from './coach/aiService';
