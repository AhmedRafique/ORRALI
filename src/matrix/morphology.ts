import {
  GermanCase,
  GrammarGender,
  GrammarNumber,
  GrammarPerson,
  TenseMood,
} from './types';

// =========================================================================
// 1. FRENCH MORPHOLOGY
// =========================================================================

const ETRE_VERBS = new Set([
  'aller',
  'venir',
  'partir',
  'arriver',
  'entrer',
  'sortir',
  'monter',
  'descendre',
  'tomber',
  'rester',
  'retourner',
  'naître',
  'mourir',
]);

const FRENCH_PRONOUNS: Record<GrammarPerson, string> = {
  '1s': 'je',
  '2s': 'tu',
  '3s': 'il',
  '1p': 'nous',
  '2p': 'vous',
  '3p': 'ils',
};

export function getFrenchSubjectPronoun(
  person: GrammarPerson,
  gender: GrammarGender = 'm'
): string {
  if (person === '3s') return gender === 'f' ? 'elle' : 'il';
  if (person === '3p') return gender === 'f' ? 'elles' : 'ils';
  return FRENCH_PRONOUNS[person];
}

export function elideFrench(first: string, second: string): string {
  const f = first.trim();
  const s = second.trim();
  if (!s) return f;

  const startsWithVowel = /^[aeiouyhéèêàâîïôû]/i.test(s);
  if (startsWithVowel) {
    if (f.toLowerCase() === 'je') return `j'${s}`;
    if (f.toLowerCase() === 'de') return `d'${s}`;
    if (f.toLowerCase() === 'ne') return `n'${s}`;
    if (f.toLowerCase() === 'le' || f.toLowerCase() === 'la') return `l'${s}`;
    if (f.toLowerCase() === 'que') return `qu'${s}`;
  }
  return `${f} ${s}`;
}

export function conjugateFrenchVerb(
  infinitive: string,
  person: GrammarPerson,
  tense: TenseMood = 'present'
): string {
  const inf = infinitive.toLowerCase().trim();

  // Present tense irregulars
  if (tense === 'present') {
    if (inf === 'être') {
      const map: Record<GrammarPerson, string> = {
        '1s': 'suis',
        '2s': 'es',
        '3s': 'est',
        '1p': 'sommes',
        '2p': 'êtes',
        '3p': 'sont',
      };
      return map[person];
    }
    if (inf === 'avoir') {
      const map: Record<GrammarPerson, string> = {
        '1s': 'ai',
        '2s': 'as',
        '3s': 'a',
        '1p': 'avons',
        '2p': 'avez',
        '3p': 'ont',
      };
      return map[person];
    }
    if (inf === 'aller') {
      const map: Record<GrammarPerson, string> = {
        '1s': 'vais',
        '2s': 'vas',
        '3s': 'va',
        '1p': 'allons',
        '2p': 'allez',
        '3p': 'vont',
      };
      return map[person];
    }
    if (inf === 'faire') {
      const map: Record<GrammarPerson, string> = {
        '1s': 'fais',
        '2s': 'fais',
        '3s': 'fait',
        '1p': 'faisons',
        '2p': 'faites',
        '3p': 'font',
      };
      return map[person];
    }
    if (inf === 'pouvoir') {
      const map: Record<GrammarPerson, string> = {
        '1s': 'peux',
        '2s': 'peux',
        '3s': 'peut',
        '1p': 'pouvons',
        '2p': 'pouvez',
        '3p': 'peuvent',
      };
      return map[person];
    }
    if (inf === 'vouloir') {
      const map: Record<GrammarPerson, string> = {
        '1s': 'veux',
        '2s': 'veux',
        '3s': 'veut',
        '1p': 'voulons',
        '2p': 'voulez',
        '3p': 'veulent',
      };
      return map[person];
    }

    // Regular -er verbs (parler, chercher, aimer, trouver)
    if (inf.endsWith('er')) {
      const stem = inf.slice(0, -2);
      const endings: Record<GrammarPerson, string> = {
        '1s': 'e',
        '2s': 'es',
        '3s': 'e',
        '1p': 'ons',
        '2p': 'ez',
        '3p': 'ent',
      };
      return `${stem}${endings[person]}`;
    }

    // Regular -ir verbs (finir, choisir)
    if (inf.endsWith('ir')) {
      const stem = inf.slice(0, -2);
      const endings: Record<GrammarPerson, string> = {
        '1s': 'is',
        '2s': 'is',
        '3s': 'it',
        '1p': 'issons',
        '2p': 'issez',
        '3p': 'issent',
      };
      return `${stem}${endings[person]}`;
    }

    // Regular -re verbs (attendre, vendre)
    if (inf.endsWith('re')) {
      const stem = inf.slice(0, -2);
      const endings: Record<GrammarPerson, string> = {
        '1s': 's',
        '2s': 's',
        '3s': '',
        '1p': 'ons',
        '2p': 'ez',
        '3p': 'ent',
      };
      return `${stem}${endings[person]}`;
    }
  }

  // Compound past (Passé composé)
  if (tense === 'past_compound') {
    const usesEtre = ETRE_VERBS.has(inf);
    const aux = usesEtre
      ? conjugateFrenchVerb('être', person, 'present')
      : conjugateFrenchVerb('avoir', person, 'present');

    let participle = inf;
    if (inf.endsWith('er')) participle = `${inf.slice(0, -2)}é`;
    else if (inf.endsWith('ir')) participle = `${inf.slice(0, -2)}i`;
    else if (inf.endsWith('re')) participle = `${inf.slice(0, -2)}u`;
    if (inf === 'faire') participle = 'fait';
    if (inf === 'avoir') participle = 'eu';
    if (inf === 'être') participle = 'été';
    if (inf === 'prendre') participle = 'pris';

    return `${aux} ${participle}`;
  }

  // Subjunctive Present
  if (tense === 'subjunctive_present') {
    if (inf === 'être') {
      const map: Record<GrammarPerson, string> = {
        '1s': 'sois',
        '2s': 'sois',
        '3s': 'soit',
        '1p': 'soyons',
        '2p': 'soyez',
        '3p': 'soient',
      };
      return map[person];
    }
    if (inf === 'avoir') {
      const map: Record<GrammarPerson, string> = {
        '1s': 'aie',
        '2s': 'aies',
        '3s': 'ait',
        '1p': 'ayons',
        '2p': 'ayez',
        '3p': 'aient',
      };
      return map[person];
    }
    if (inf.endsWith('er')) {
      const stem = inf.slice(0, -2);
      const endings: Record<GrammarPerson, string> = {
        '1s': 'e',
        '2s': 'es',
        '3s': 'e',
        '1p': 'ions',
        '2p': 'iez',
        '3p': 'ent',
      };
      return `${stem}${endings[person]}`;
    }
  }

  return inf;
}

export function inflectFrenchAdjective(
  baseMasc: string,
  gender: GrammarGender = 'm',
  number: GrammarNumber = 's'
): string {
  let res = baseMasc;
  if (gender === 'f') {
    if (baseMasc === 'beau') res = 'belle';
    else if (baseMasc === 'nouveau') res = 'nouvelle';
    else if (baseMasc.endsWith('e')) res = baseMasc;
    else res = `${baseMasc}e`;
  }

  if (number === 'p') {
    if (res === 'beau' && gender === 'm') res = 'beaux';
    else if (!res.endsWith('s') && !res.endsWith('x')) res = `${res}s`;
  }

  return res;
}

// =========================================================================
// 2. GERMAN MORPHOLOGY
// =========================================================================

export function conjugateGermanVerb(
  infinitive: string,
  person: GrammarPerson,
  tense: TenseMood = 'present'
): string {
  const inf = infinitive.toLowerCase().trim();

  if (tense === 'present') {
    if (inf === 'sein') {
      const map: Record<GrammarPerson, string> = {
        '1s': 'bin',
        '2s': 'bist',
        '3s': 'ist',
        '1p': 'sind',
        '2p': 'seid',
        '3p': 'sind',
      };
      return map[person];
    }
    if (inf === 'haben') {
      const map: Record<GrammarPerson, string> = {
        '1s': 'habe',
        '2s': 'hast',
        '3s': 'hat',
        '1p': 'haben',
        '2p': 'habt',
        '3p': 'haben',
      };
      return map[person];
    }
    if (inf === 'können') {
      const map: Record<GrammarPerson, string> = {
        '1s': 'kann',
        '2s': 'kannst',
        '3s': 'kann',
        '1p': 'können',
        '2p': 'könnt',
        '3p': 'können',
      };
      return map[person];
    }
    if (inf === 'müssen') {
      const map: Record<GrammarPerson, string> = {
        '1s': 'muss',
        '2s': 'musst',
        '3s': 'muss',
        '1p': 'müssen',
        '2p': 'müsst',
        '3p': 'müssen',
      };
      return map[person];
    }

    // Standard regular verb (machen, suchen, brauchen, lernen)
    const stem = inf.endsWith('en') ? inf.slice(0, -2) : inf.slice(0, -1);
    const endings: Record<GrammarPerson, string> = {
      '1s': 'e',
      '2s': 'st',
      '3s': 't',
      '1p': 'en',
      '2p': 't',
      '3p': 'en',
    };
    return `${stem}${endings[person]}`;
  }

  // Modal Passive (z.B. "muss berücksichtigt werden")
  if (tense === 'passive') {
    const modal = conjugateGermanVerb('müssen', person, 'present');
    return `${modal} ... [Partizip II] werden`;
  }

  return inf;
}

export function inflectGermanArticle(
  articleType: 'def' | 'indef' | 'none',
  germanCase: GermanCase,
  gender: GrammarGender,
  number: GrammarNumber = 's'
): string {
  if (articleType === 'none') return '';

  if (number === 'p') {
    if (articleType === 'indef') return ''; // no indefinite plural article in German
    if (germanCase === 'nom') return 'die';
    if (germanCase === 'acc') return 'die';
    if (germanCase === 'dat') return 'den';
    if (germanCase === 'gen') return 'der';
  }

  if (articleType === 'def') {
    if (gender === 'm') {
      if (germanCase === 'nom') return 'der';
      if (germanCase === 'acc') return 'den';
      if (germanCase === 'dat') return 'dem';
      if (germanCase === 'gen') return 'des';
    }
    if (gender === 'f') {
      if (germanCase === 'nom') return 'die';
      if (germanCase === 'acc') return 'die';
      if (germanCase === 'dat') return 'der';
      if (germanCase === 'gen') return 'der';
    }
    if (gender === 'n') {
      if (germanCase === 'nom') return 'das';
      if (germanCase === 'acc') return 'das';
      if (germanCase === 'dat') return 'dem';
      if (germanCase === 'gen') return 'des';
    }
  }

  // Indefinite (ein, eine)
  if (gender === 'm') {
    if (germanCase === 'nom') return 'ein';
    if (germanCase === 'acc') return 'einen';
    if (germanCase === 'dat') return 'einem';
    if (germanCase === 'gen') return 'eines';
  }
  if (gender === 'f') {
    if (germanCase === 'nom') return 'eine';
    if (germanCase === 'acc') return 'eine';
    if (germanCase === 'dat') return 'einer';
    if (germanCase === 'gen') return 'einer';
  }
  if (gender === 'n') {
    if (germanCase === 'nom') return 'ein';
    if (germanCase === 'acc') return 'ein';
    if (germanCase === 'dat') return 'einem';
    if (germanCase === 'gen') return 'eines';
  }

  return 'der';
}

// =========================================================================
// 3. SPANISH MORPHOLOGY
// =========================================================================

export function conjugateSpanishVerb(
  infinitive: string,
  person: GrammarPerson,
  tense: TenseMood = 'present'
): string {
  const inf = infinitive.toLowerCase().trim();

  if (tense === 'present') {
    if (inf === 'ser') {
      const map: Record<GrammarPerson, string> = {
        '1s': 'soy',
        '2s': 'eres',
        '3s': 'es',
        '1p': 'somos',
        '2p': 'sois',
        '3p': 'son',
      };
      return map[person];
    }
    if (inf === 'estar') {
      const map: Record<GrammarPerson, string> = {
        '1s': 'estoy',
        '2s': 'estás',
        '3s': 'está',
        '1p': 'estamos',
        '2p': 'estáis',
        '3p': 'están',
      };
      return map[person];
    }
    if (inf === 'tener') {
      const map: Record<GrammarPerson, string> = {
        '1s': 'tengo',
        '2s': 'tienes',
        '3s': 'tiene',
        '1p': 'tenemos',
        '2p': 'tenéis',
        '3p': 'tienen',
      };
      return map[person];
    }
    if (inf === 'querer') {
      const map: Record<GrammarPerson, string> = {
        '1s': 'quiero',
        '2s': 'quieres',
        '3s': 'quiere',
        '1p': 'queremos',
        '2p': 'queréis',
        '3p': 'quieren',
      };
      return map[person];
    }

    // Regular -ar
    if (inf.endsWith('ar')) {
      const stem = inf.slice(0, -2);
      const endings: Record<GrammarPerson, string> = {
        '1s': 'o',
        '2s': 'as',
        '3s': 'a',
        '1p': 'amos',
        '2p': 'áis',
        '3p': 'an',
      };
      return `${stem}${endings[person]}`;
    }

    // Regular -er
    if (inf.endsWith('er')) {
      const stem = inf.slice(0, -2);
      const endings: Record<GrammarPerson, string> = {
        '1s': 'o',
        '2s': 'es',
        '3s': 'e',
        '1p': 'emos',
        '2p': 'éis',
        '3p': 'en',
      };
      return `${stem}${endings[person]}`;
    }

    // Regular -ir
    if (inf.endsWith('ir')) {
      const stem = inf.slice(0, -2);
      const endings: Record<GrammarPerson, string> = {
        '1s': 'o',
        '2s': 'es',
        '3s': 'e',
        '1p': 'imos',
        '2p': 'ís',
        '3p': 'en',
      };
      return `${stem}${endings[person]}`;
    }
  }

  // Subjunctive Present
  if (tense === 'subjunctive_present') {
    if (inf === 'ser') {
      const map: Record<GrammarPerson, string> = {
        '1s': 'sea',
        '2s': 'seas',
        '3s': 'sea',
        '1p': 'seamos',
        '2p': 'seáis',
        '3p': 'sean',
      };
      return map[person];
    }
    if (inf.endsWith('ar')) {
      const stem = inf.slice(0, -2);
      const endings: Record<GrammarPerson, string> = {
        '1s': 'e',
        '2s': 'es',
        '3s': 'e',
        '1p': 'emos',
        '2p': 'éis',
        '3p': 'en',
      };
      return `${stem}${endings[person]}`;
    }
    if (inf.endsWith('er') || inf.endsWith('ir')) {
      const stem = inf.slice(0, -2);
      const endings: Record<GrammarPerson, string> = {
        '1s': 'a',
        '2s': 'as',
        '3s': 'a',
        '1p': 'amos',
        '2p': 'áis',
        '3p': 'an',
      };
      return `${stem}${endings[person]}`;
    }
  }

  return inf;
}
