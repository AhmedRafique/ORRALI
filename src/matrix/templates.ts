import { CEFRLevel, LangCode } from '../types';
import {
  conjugateFrenchVerb,
  conjugateGermanVerb,
  conjugateSpanishVerb,
  elideFrench,
  inflectGermanArticle,
} from './morphology';
import { MatrixTemplate } from './types';

export const MATRIX_TEMPLATES: MatrixTemplate[] = [
  // =========================================================================
  // FRENCH TEMPLATES
  // =========================================================================
  {
    id: 'fr_tpl_a1_direct',
    languageId: 'fr',
    level: 'A1',
    title: 'A1 · Demande Directe & Présent Simple',
    grammarConcept: 'Subject + Verb Agreement + Object',
    defaultTense: 'present',
    slots: [
      {
        type: 'subject',
        label: 'Subject',
        options: [
          { id: 's1', text: 'je', translation: 'I' },
          { id: 's2', text: 'tu', translation: 'you' },
          { id: 's3', text: 'nous', translation: 'we' },
          { id: 's4', text: 'vous', translation: 'you (formal)' },
        ],
      },
      {
        type: 'verb',
        label: 'Action Verb',
        options: [
          { id: 'v1', text: 'chercher', translation: 'to look for' },
          { id: 'v2', text: 'vouloir', translation: 'to want' },
          { id: 'v3', text: 'trouver', translation: 'to find' },
        ],
      },
      {
        type: 'direct_object',
        label: 'Object',
        options: [
          { id: 'o1', text: 'un café', translation: 'a coffee' },
          { id: 'o2', text: 'un billet de train', translation: 'a train ticket' },
          { id: 'o3', text: 'une table libre', translation: 'an open table' },
        ],
      },
    ],
    assembler: (selected, context) => {
      const sub = selected.subject?.text ?? 'je';
      const verbInf = selected.verb?.text ?? 'chercher';
      const obj = selected.direct_object?.text ?? 'un café';

      const person = context.person ?? '1s';
      const conjugatedVerb = conjugateFrenchVerb(verbInf, person, 'present');
      const target = `${elideFrench(sub, conjugatedVerb)} ${obj}`;

      const enSub = selected.subject?.translation ?? 'I';
      const enVerb = selected.verb?.translation ?? 'look for';
      const enObj = selected.direct_object?.translation ?? 'a coffee';
      const en = `${enSub} ${enVerb.replace('to ', '')} ${enObj}`;

      return {
        target,
        en,
        notes: `French present tense: verb '${verbInf}' agrees with subject '${sub}'.`,
        alternatives: [`${sub} ${conjugatedVerb} ${obj}`],
      };
    },
  },
  {
    id: 'fr_tpl_b2_concession',
    languageId: 'fr',
    level: 'B2',
    title: 'B2 · Concession avec Bien que & Subjonctif',
    grammarConcept: 'Concessive Connector + Subjunctive Verb + Main Clause',
    defaultTense: 'subjunctive_present',
    slots: [
      {
        type: 'connector',
        label: 'Concessive Connector',
        options: [
          { id: 'c1', text: 'bien que', translation: 'even though' },
          { id: 'c2', text: 'quoique', translation: 'although' },
        ],
      },
      {
        type: 'subject',
        label: 'Subordinate Subject',
        options: [
          { id: 's1', text: 'nous', translation: 'we' },
          { id: 's2', text: 'vous', translation: 'you' },
          { id: 's3', text: 'le projet', translation: 'the project' },
        ],
      },
      {
        type: 'verb',
        label: 'Subjunctive Verb',
        options: [
          { id: 'v1', text: 'avoir', translation: 'to have' },
          { id: 'v2', text: 'être', translation: 'to be' },
        ],
      },
      {
        type: 'prepositional_phrase',
        label: 'Main Clause',
        options: [
          { id: 'p1', text: 'nous restons prudents', translation: 'we remain cautious' },
          { id: 'p2', text: 'il faut agir vite', translation: 'we must act fast' },
        ],
      },
    ],
    assembler: (selected, context) => {
      const conn = selected.connector?.text ?? 'bien que';
      const sub = selected.subject?.text ?? 'nous';
      const verbInf = selected.verb?.text ?? 'avoir';
      const main = selected.prepositional_phrase?.text ?? 'nous restons prudents';

      const person = context.person ?? '1p';
      const conj = conjugateFrenchVerb(verbInf, person, 'subjunctive_present');
      const subClause = elideFrench(sub, conj);

      const target = `${conn} ${subClause}, ${main}`;
      const en = `${selected.connector?.translation ?? 'even though'} ${selected.subject?.translation ?? 'we'} are prepared, ${selected.prepositional_phrase?.translation ?? 'we remain cautious'}`;

      return {
        target,
        en,
        notes: `B2 concession: '${conn}' strictly requires the subjunctive mood ('${conj}').`,
      };
    },
  },

  // =========================================================================
  // GERMAN TEMPLATES
  // =========================================================================
  {
    id: 'de_tpl_a1_accusative',
    languageId: 'de',
    level: 'A1',
    title: 'A1 · Akkusativobjekt & Feste Verben',
    grammarConcept: 'Subject + Verb + Accusative Noun Phrase',
    defaultTense: 'present',
    slots: [
      {
        type: 'subject',
        label: 'Subject',
        options: [
          { id: 's1', text: 'ich', translation: 'I' },
          { id: 's2', text: 'wir', translation: 'we' },
          { id: 's3', text: 'Sie', translation: 'you (formal)' },
        ],
      },
      {
        type: 'verb',
        label: 'Verb',
        options: [
          { id: 'v1', text: 'brauchen', translation: 'to need' },
          { id: 'v2', text: 'suchen', translation: 'to look for' },
        ],
      },
      {
        type: 'direct_object',
        label: 'Noun Phrase',
        options: [
          { id: 'o1', text: 'Kaffee', translation: 'coffee', gender: 'm' },
          { id: 'o2', text: 'Fahrkarte', translation: 'ticket', gender: 'f' },
        ],
      },
    ],
    assembler: (selected, context) => {
      const sub = selected.subject?.text ?? 'ich';
      const verbInf = selected.verb?.text ?? 'brauchen';
      const noun = selected.direct_object?.text ?? 'Kaffee';
      const gender = selected.direct_object?.gender ?? 'm';

      const person = context.person ?? '1s';
      const conj = conjugateGermanVerb(verbInf, person, 'present');
      const article = inflectGermanArticle('indef', 'acc', gender, 's');

      const target = `${sub} ${conj} ${article ? article + ' ' : ''}${noun}`;
      const en = `${selected.subject?.translation ?? 'I'} ${selected.verb?.translation?.replace('to ', '') ?? 'need'} a ${selected.direct_object?.translation ?? 'coffee'}`;

      return {
        target,
        en,
        notes: `German accusative case: masculine noun '${noun}' takes article '${article}'.`,
      };
    },
  },

  // =========================================================================
  // SPANISH TEMPLATES
  // =========================================================================
  {
    id: 'es_tpl_a1_direct',
    languageId: 'es',
    level: 'A1',
    title: 'A1 · Expresión de Necesidad y Objeto Directo',
    grammarConcept: 'Subject/Pro-Drop + Verb + Direct Object',
    defaultTense: 'present',
    slots: [
      {
        type: 'subject',
        label: 'Subject (Optional Pro-Drop)',
        options: [
          { id: 's1', text: 'yo', translation: 'I' },
          { id: 's2', text: 'nosotros', translation: 'we' },
          { id: 's3', text: 'usted', translation: 'you (formal)' },
        ],
      },
      {
        type: 'verb',
        label: 'Verb',
        options: [
          { id: 'v1', text: 'necesitar', translation: 'to need' },
          { id: 'v2', text: 'buscar', translation: 'to look for' },
        ],
      },
      {
        type: 'direct_object',
        label: 'Object',
        options: [
          { id: 'o1', text: 'un billete de tren', translation: 'a train ticket' },
          { id: 'o2', text: 'una habitación tranquila', translation: 'a quiet room' },
        ],
      },
    ],
    assembler: (selected, context) => {
      const sub = selected.subject?.text ?? 'yo';
      const verbInf = selected.verb?.text ?? 'necesitar';
      const obj = selected.direct_object?.text ?? 'un billete de tren';

      const person = context.person ?? '1s';
      const conj = conjugateSpanishVerb(verbInf, person, 'present');

      const target = `${sub} ${conj} ${obj}`;
      const en = `${selected.subject?.translation ?? 'I'} ${selected.verb?.translation?.replace('to ', '') ?? 'need'} ${selected.direct_object?.translation ?? 'a train ticket'}`;

      return {
        target,
        en,
        notes: `Spanish present tense: '${verbInf}' conjugates to '${conj}'. Pro-drop also accepts: '${conj} ${obj}'.`,
        alternatives: [`${conj} ${obj}`],
      };
    },
  },
];

export function getTemplatesByLanguage(languageId: LangCode): MatrixTemplate[] {
  return MATRIX_TEMPLATES.filter((t) => t.languageId === languageId);
}

export function getTemplateById(id: string): MatrixTemplate | undefined {
  return MATRIX_TEMPLATES.find((t) => t.id === id);
}
