import { LangCode, LearningActivityKind, SavedPhrase, ConversationMemoryContext, GrammarRadarData } from './types';

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
  if (target.includes('er') || target.includes('ir') || target.includes('ar')) {
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
  
  const lowerText = text.toLowerCase();

  if (targetLanguage === 'fr') {
    // Basic heuristics for passe compose
    if ((lowerText.includes('j\'ai ') || lowerText.includes('suis ')) && (lowerText.includes('é') || lowerText.includes('u') || lowerText.includes('is'))) {
      detectedPatterns.push('passe_compose');
    }
    if (lowerText.includes('voudrais') || lowerText.includes('aimerais')) {
      detectedPatterns.push('conditionnel');
    }
  } else if (targetLanguage === 'es') {
    if (lowerText.includes('he ') || lowerText.includes('has ')) {
      detectedPatterns.push('perfecto');
    }
  } else if (targetLanguage === 'de') {
    if (lowerText.includes('habe ') && (lowerText.includes('ge') || lowerText.includes('t'))) {
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
