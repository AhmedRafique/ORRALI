import { LangCode } from './types';

export interface WordAnatomy {
  word: string;
  cleanWord: string;
  meaningEn: string;
  role?: string;
}

const LEXICON_BY_LANG: Record<LangCode, Record<string, { meaningEn: string; role?: string }>> = {
  fr: {
    bonjour: { meaningEn: 'Hello / Good morning', role: 'Greeting' },
    hier: { meaningEn: 'Yesterday', role: 'Time Adverb' },
    "j'ai": { meaningEn: 'I have', role: 'Subject + Auxiliary' },
    visité: { meaningEn: 'Visited', role: 'Past Participle' },
    visite: { meaningEn: 'Visited', role: 'Past Participle' },
    le: { meaningEn: 'The (masc.)', role: 'Definite Article' },
    la: { meaningEn: 'The (fem.)', role: 'Definite Article' },
    les: { meaningEn: 'The (plural)', role: 'Definite Article' },
    un: { meaningEn: 'A / An (masc.)', role: 'Indefinite Article' },
    une: { meaningEn: 'A / An (fem.)', role: 'Indefinite Article' },
    musée: { meaningEn: 'Museum', role: 'Masculine Noun' },
    café: { meaningEn: 'Coffee / Café', role: 'Masculine Noun' },
    restaurant: { meaningEn: 'Restaurant', role: 'Masculine Noun' },
    merci: { meaningEn: 'Thank you', role: 'Courtesy Expression' },
    "s'il": { meaningEn: 'If it', role: 'Conjunction' },
    vous: { meaningEn: 'You (formal/plural)', role: 'Pronoun' },
    plaît: { meaningEn: 'Pleases', role: 'Verb' },
  },
  de: {
    ich: { meaningEn: 'I', role: 'Subject Pronoun' },
    habe: { meaningEn: 'Have (1st person)', role: 'Auxiliary Verb' },
    das: { meaningEn: 'The (neuter)', role: 'Definite Article' },
    der: { meaningEn: 'The (masc.)', role: 'Definite Article' },
    die: { meaningEn: 'The (fem./plural)', role: 'Definite Article' },
    museum: { meaningEn: 'Museum', role: 'Neuter Noun' },
    besucht: { meaningEn: 'Visited', role: 'Past Participle' },
    gestern: { meaningEn: 'Yesterday', role: 'Time Adverb' },
    bitte: { meaningEn: 'Please / You are welcome', role: 'Courtesy Word' },
    danke: { meaningEn: 'Thank you', role: 'Courtesy Expression' },
    kaffee: { meaningEn: 'Coffee', role: 'Masculine Noun' },
  },
  es: {
    ayer: { meaningEn: 'Yesterday', role: 'Time Adverb' },
    visité: { meaningEn: 'I visited (past)', role: 'Preterite Verb' },
    visite: { meaningEn: 'I visited (past)', role: 'Preterite Verb' },
    el: { meaningEn: 'The (masc.)', role: 'Definite Article' },
    la: { meaningEn: 'The (fem.)', role: 'Definite Article' },
    museo: { meaningEn: 'Museum', role: 'Masculine Noun' },
    del: { meaningEn: 'Of the (de + el)', role: 'Contracted Preposition' },
    prado: { meaningEn: 'Prado (Famous Museum)', role: 'Proper Noun' },
    hola: { meaningEn: 'Hello', role: 'Greeting' },
    gracias: { meaningEn: 'Thank you', role: 'Courtesy Expression' },
    por: { meaningEn: 'For / By', role: 'Preposition' },
    favor: { meaningEn: 'Favor', role: 'Noun' },
  },
};

/**
 * Breaks down a target sentence into individual tappable word anatomy tokens
 * with isolated meanings and grammatical roles.
 */
export function breakdownSentence(
  targetPhrase: string,
  courseCode: LangCode
): WordAnatomy[] {
  if (!targetPhrase || targetPhrase.trim().length === 0) {
    return [];
  }

  const langLexicon = LEXICON_BY_LANG[courseCode] ?? LEXICON_BY_LANG.fr;
  const rawWords = targetPhrase.trim().split(/\s+/);

  return rawWords.map((raw) => {
    const cleanWord = raw.replace(/^[.,!?¿¡;:"']+|[.,!?¿¡;:"']+$/g, '').trim();
    const lookupKey = cleanWord.toLowerCase();
    const entry = langLexicon[lookupKey];

    const meaningEn = entry?.meaningEn ?? cleanWord;
    const role =
      entry?.role ?? (cleanWord.length <= 3 ? 'Grammatical Particle' : 'Vocabulary Word');

    return {
      word: cleanWord || raw,
      cleanWord,
      meaningEn,
      role,
    };
  });
}
