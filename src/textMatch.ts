/**
 * Shared, forgiving text matching used by the Missions and Writing Lab engines.
 */

/**
 * Lower-cases, strips accents and punctuation, and collapses whitespace so that
 * learner input and catalog keywords can be compared fairly.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’]/g, ' ')
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"¡!¿]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * True when `phrase` appears in `normalizedText` as whole word(s).
 * Both arguments must already be normalized. Unlike String.includes this does
 * not match inside longer words ("eau" no longer matches "beau" or "chapeau").
 */
export function containsPhrase(normalizedText: string, phrase: string): boolean {
  if (!phrase) return false;
  return ` ${normalizedText} `.includes(` ${phrase} `);
}

/**
 * Keyword matching for catalog keywords, which are often word stems
 * ("arrive" should match "arriver", "arriverons").
 * - Short keywords (< 4 letters) must match as a whole word ("eau" != "beau").
 * - Longer keywords must match at the START of a word, so inflected endings
 *   are accepted but a keyword hidden mid-word is not.
 * Both arguments must already be normalized.
 */
export function containsKeyword(normalizedText: string, keyword: string): boolean {
  if (!keyword) return false;
  if (keyword.length < 4) return containsPhrase(normalizedText, keyword);
  return ` ${normalizedText}`.includes(` ${keyword}`);
}

/**
 * True when the learner's (normalized) answer is effectively the same sentence
 * as the (normalized) reference: either it contains the whole reference, or it
 * reuses at least 60% of the reference's words (minimum two). A lone word or a
 * short fragment of a longer sentence does not count.
 */
export function matchesReferenceSentence(normalizedAnswer: string, normalizedReference: string): boolean {
  if (!normalizedAnswer || !normalizedReference) return false;
  if (containsPhrase(normalizedAnswer, normalizedReference)) return true;

  const refTokens = normalizedReference.split(' ').filter(Boolean);
  const answerTokens = new Set(normalizedAnswer.split(' ').filter(Boolean));
  const shared = refTokens.filter((t) => answerTokens.has(t)).length;
  return shared >= 2 && shared / refTokens.length >= 0.6;
}
