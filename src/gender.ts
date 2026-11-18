import { LangCode } from './types';

export type GrammaticalGender = 'masculine' | 'feminine' | 'neuter';

export interface GenderColorPalette {
  badge: string;
  badgeBg: string;
  border: string;
  label: string;
  symbol: string;
}

export const GENDER_PALETTES: Record<GrammaticalGender, GenderColorPalette> = {
  masculine: {
    badge: '#1E5AA8',
    badgeBg: '#EAF1FA',
    border: '#B8D3F2',
    label: 'Masculine',
    symbol: '♂',
  },
  feminine: {
    badge: '#B8325E',
    badgeBg: '#FCEEF3',
    border: '#F4C2D4',
    label: 'Feminine',
    symbol: '♀',
  },
  neuter: {
    badge: '#2E7D4E',
    badgeBg: '#EDF7F1',
    border: '#BFE3CE',
    label: 'Neuter',
    symbol: '⚲',
  },
};

export function getGenderPalette(gender: GrammaticalGender): GenderColorPalette {
  return GENDER_PALETTES[gender];
}

const GENDER_DICTIONARY: Record<
  LangCode,
  { masculine: Set<string>; feminine: Set<string>; neuter?: Set<string> }
> = {
  de: {
    masculine: new Set([
      'der',
      'den',
      'dem',
      'des',
      'ein',
      'einen',
      'einem',
      'eines',
      'dieser',
      'diesen',
      'diesem',
      'kaffee',
      'zug',
      'bahnhof',
      'tee',
      'kuchen',
      'apfel',
      'arzt',
      'park',
      'vater',
      'sohn',
      'freund',
      'schlüssel',
      'kellner',
      'platz',
      'wein',
      'tisch',
      'koffer',
    ]),
    feminine: new Set([
      'die',
      'eine',
      'einer',
      'diese',
      'dieser',
      'fahrkarte',
      'rechnung',
      'frau',
      'mutter',
      'tochter',
      'freundin',
      'apotheke',
      'stadt',
      'straße',
      'tasse',
      'zeit',
      'hilfe',
      'bäckerei',
      'karte',
      'sonne',
    ]),
    neuter: new Set([
      'das',
      'dem',
      'des',
      'dieses',
      'diesem',
      'museum',
      'brot',
      'brötchen',
      'gleis',
      'hotel',
      'zimmer',
      'wasser',
      'bier',
      'ticket',
      'auto',
      'kind',
      'haus',
      'bett',
      'fenster',
      'mädchen',
    ]),
  },
  fr: {
    masculine: new Set([
      'le',
      'un',
      'du',
      'au',
      'ce',
      'cet',
      'mon',
      'ton',
      'son',
      'café',
      'musée',
      'croissant',
      'restaurant',
      'train',
      'pain',
      'thé',
      'billet',
      'menu',
      'château',
      'garçon',
      'vin',
      'chapeau',
      'sac',
      'fromage',
      'verre',
      'hôtel',
      'aéroport',
    ]),
    feminine: new Set([
      'la',
      'une',
      'de la',
      'cette',
      'ma',
      'ta',
      'sa',
      'gare',
      'chambre',
      'addition',
      'table',
      'eau',
      'rue',
      'ville',
      'porte',
      'clé',
      'salade',
      'serviette',
      'boulangerie',
      'voiture',
      'fleur',
    ]),
  },
  es: {
    masculine: new Set([
      'el',
      'un',
      'del',
      'al',
      'este',
      'ese',
      'aquel',
      'café',
      'museo',
      'aeropuerto',
      'hotel',
      'tren',
      'pan',
      'vino',
      'restaurante',
      'billete',
      'chico',
      'plato',
      'baño',
      'vaso',
      'amigo',
      'padre',
      'hermano',
    ]),
    feminine: new Set([
      'la',
      'una',
      'esta',
      'esa',
      'aquella',
      'tortilla',
      'cuenta',
      'estación',
      'cerveza',
      'agua',
      'mesa',
      'calle',
      'ciudad',
      'puerta',
      'llave',
      'chica',
      'comida',
      'tapa',
      'tapas',
      'playa',
      'amiga',
      'madre',
    ]),
  },
};

/**
 * Detects the grammatical gender of a word in the target language.
 * Returns 'masculine', 'feminine', 'neuter', or null if non-gendered.
 */
export function detectWordGender(
  word: string,
  lang: LangCode
): GrammaticalGender | null {
  if (!word || word.trim().length === 0) return null;

  const clean = word
    .toLowerCase()
    .replace(/^[.,!?¿¡;:"']+|[.,!?¿¡;:"']+$/g, '')
    .trim();

  const langDict = GENDER_DICTIONARY[lang];
  if (!langDict) return null;

  if (langDict.masculine.has(clean)) return 'masculine';
  if (langDict.feminine.has(clean)) return 'feminine';
  if (langDict.neuter && langDict.neuter.has(clean)) return 'neuter';

  // Support elided article prefixes in French (e.g. l'addition, l'eau, d'eau, l'hôtel)
  if (lang === 'fr' && /^[ldcqjsn][’']/.test(clean)) {
    const stripped = clean.replace(/^[ldcqjsn][’']/, '');
    if (langDict.masculine.has(stripped)) return 'masculine';
    if (langDict.feminine.has(stripped)) return 'feminine';
  }

  return null;
}
