import { LangCode } from './types';
import { norm } from './exercises';

export type VerbTense = 'present' | 'past';

export interface VerbDef {
  infinitive: string;
  en: string;
  conjugations: Record<VerbTense, Record<string, string>>;
}

export interface VerbChallenge {
  infinitive: string;
  en: string;
  pronoun: string;
  tense: VerbTense;
  answer: string;
}

export const VERB_DB: Record<LangCode, VerbDef[]> = {
  fr: [
    {
      infinitive: 'être',
      en: 'to be',
      conjugations: {
        present: {
          'Je': 'suis',
          'Tu': 'es',
          'Il/Elle': 'est',
          'Nous': 'sommes',
          'Vous': 'êtes',
          'Ils/Elles': 'sont',
        },
        past: {
          "J'": 'ai été',
          'Tu': 'as été',
          'Il/Elle': 'a été',
          'Nous': 'avons été',
          'Vous': 'avez été',
          'Ils/Elles': 'ont été',
        },
      },
    },
    {
      infinitive: 'avoir',
      en: 'to have',
      conjugations: {
        present: {
          "J'": 'ai',
          'Tu': 'as',
          'Il/Elle': 'a',
          'Nous': 'avons',
          'Vous': 'avez',
          'Ils/Elles': 'ont',
        },
        past: {
          "J'": 'ai eu',
          'Tu': 'as eu',
          'Il/Elle': 'a eu',
          'Nous': 'avons eu',
          'Vous': 'avez eu',
          'Ils/Elles': 'ont eu',
        },
      },
    },
    {
      infinitive: 'aller',
      en: 'to go',
      conjugations: {
        present: {
          'Je': 'vais',
          'Tu': 'vas',
          'Il/Elle': 'va',
          'Nous': 'allons',
          'Vous': 'allez',
          'Ils/Elles': 'vont',
        },
        past: {
          'Je': 'suis allé',
          'Tu': 'es allé',
          'Il/Elle': 'est allé',
          'Nous': 'sommes allés',
          'Vous': 'êtes allés',
          'Ils/Elles': 'sont allés',
        },
      },
    },
  ],
  de: [
    {
      infinitive: 'sein',
      en: 'to be',
      conjugations: {
        present: {
          'ich': 'bin',
          'du': 'bist',
          'er/sie/es': 'ist',
          'wir': 'sind',
          'ihr': 'seid',
          'sie/Sie': 'sind',
        },
        past: {
          'ich': 'war',
          'du': 'warst',
          'er/sie/es': 'war',
          'wir': 'waren',
          'ihr': 'wart',
          'sie/Sie': 'waren',
        },
      },
    },
    {
      infinitive: 'haben',
      en: 'to have',
      conjugations: {
        present: {
          'ich': 'habe',
          'du': 'hast',
          'er/sie/es': 'hat',
          'wir': 'haben',
          'ihr': 'habt',
          'sie/Sie': 'haben',
        },
        past: {
          'ich': 'hatte',
          'du': 'hattest',
          'er/sie/es': 'hatte',
          'wir': 'hatten',
          'ihr': 'hattet',
          'sie/Sie': 'hatten',
        },
      },
    },
    {
      infinitive: 'werden',
      en: 'to become',
      conjugations: {
        present: {
          'ich': 'werde',
          'du': 'wirst',
          'er/sie/es': 'wird',
          'wir': 'werden',
          'ihr': 'werdet',
          'sie/Sie': 'werden',
        },
        past: {
          'ich': 'wurde',
          'du': 'wurdest',
          'er/sie/es': 'wurde',
          'wir': 'wurden',
          'ihr': 'wurdet',
          'sie/Sie': 'wurden',
        },
      },
    },
  ],
  es: [
    {
      infinitive: 'ser',
      en: 'to be (permanent)',
      conjugations: {
        present: {
          'yo': 'soy',
          'tú': 'eres',
          'él/ella': 'es',
          'nosotros': 'somos',
          'vosotros': 'sois',
          'ellos/ellas': 'son',
        },
        past: {
          'yo': 'fui',
          'tú': 'fuiste',
          'él/ella': 'fue',
          'nosotros': 'fuimos',
          'vosotros': 'fuisteis',
          'ellos/ellas': 'fueron',
        },
      },
    },
    {
      infinitive: 'estar',
      en: 'to be (location/state)',
      conjugations: {
        present: {
          'yo': 'estoy',
          'tú': 'estás',
          'él/ella': 'está',
          'nosotros': 'estamos',
          'vosotros': 'estáis',
          'ellos/ellas': 'están',
        },
        past: {
          'yo': 'estuve',
          'tú': 'estuviste',
          'él/ella': 'estuvo',
          'nosotros': 'estuvimos',
          'vosotros': 'estuvisteis',
          'ellos/ellas': 'estuvieron',
        },
      },
    },
    {
      infinitive: 'ir',
      en: 'to go',
      conjugations: {
        present: {
          'yo': 'voy',
          'tú': 'vas',
          'él/ella': 'va',
          'nosotros': 'vamos',
          'vosotros': 'vais',
          'ellos/ellas': 'van',
        },
        past: {
          'yo': 'fui',
          'tú': 'fuiste',
          'él/ella': 'fue',
          'nosotros': 'fuimos',
          'vosotros': 'fuisteis',
          'ellos/ellas': 'fueron',
        },
      },
    },
  ],
};

export function generateVerbChallenge(lang: LangCode): VerbChallenge {
  const verbs = VERB_DB[lang] ?? VERB_DB.fr;
  const verbIndex = Math.floor(Math.random() * verbs.length);
  const verb = verbs[verbIndex];

  const tenses: VerbTense[] = ['present', 'past'];
  const tense = tenses[Math.floor(Math.random() * tenses.length)];

  const pronouns = Object.keys(verb.conjugations[tense]);
  const pronounIndex = Math.floor(Math.random() * pronouns.length);
  const pronoun = pronouns[pronounIndex];

  const answer = verb.conjugations[tense][pronoun];

  return {
    infinitive: verb.infinitive,
    en: verb.en,
    pronoun,
    tense,
    answer,
  };
}

export function evaluateConjugation(expected: string, user: string): boolean {
  return norm(expected) === norm(user);
}
