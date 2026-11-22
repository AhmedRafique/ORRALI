import { CEFRLevel, LangCode } from '../types';
import { GrammarGender, GrammarNumber, GrammarPerson, MatrixSlotOption } from './types';

export interface LexiconSlotEntry extends MatrixSlotOption {
  category: 'subject' | 'verb' | 'object' | 'connector' | 'adjective' | 'adverb';
  languageId: LangCode;
  minLevel: CEFRLevel;
  person?: GrammarPerson;
  isModal?: boolean;
  isInfinitive?: boolean;
}

export const MATRIX_LEXICON: LexiconSlotEntry[] = [
  // --- FRENCH SUBJECTS ---
  { id: 'fr_sub_je', text: 'je', translation: 'I', category: 'subject', languageId: 'fr', minLevel: 'A1', person: '1s' },
  { id: 'fr_sub_tu', text: 'tu', translation: 'you (informal)', category: 'subject', languageId: 'fr', minLevel: 'A1', person: '2s' },
  { id: 'fr_sub_nous', text: 'nous', translation: 'we', category: 'subject', languageId: 'fr', minLevel: 'A1', person: '1p' },
  { id: 'fr_sub_vous', text: 'vous', translation: 'you (formal/plural)', category: 'subject', languageId: 'fr', minLevel: 'A1', person: '2p' },
  { id: 'fr_sub_chef', text: 'le chef de projet', translation: 'the project manager', category: 'subject', languageId: 'fr', minLevel: 'B1', person: '3s', gender: 'm' },
  { id: 'fr_sub_delegation', text: 'la délégation', translation: 'the delegation', category: 'subject', languageId: 'fr', minLevel: 'C1', person: '3s', gender: 'f' },

  // --- FRENCH VERBS ---
  { id: 'fr_v_chercher', text: 'chercher', translation: 'to look for', category: 'verb', languageId: 'fr', minLevel: 'A1' },
  { id: 'fr_v_trouver', text: 'trouver', translation: 'to find', category: 'verb', languageId: 'fr', minLevel: 'A1' },
  { id: 'fr_v_vouloir', text: 'vouloir', translation: 'to want', category: 'verb', languageId: 'fr', minLevel: 'A1', isModal: true },
  { id: 'fr_v_pouvoir', text: 'pouvoir', translation: 'to be able to', category: 'verb', languageId: 'fr', minLevel: 'A2', isModal: true },
  { id: 'fr_v_envisager', text: 'envisager', translation: 'to consider / envision', category: 'verb', languageId: 'fr', minLevel: 'B2' },
  { id: 'fr_v_nuancer', text: 'nuancer', translation: 'to qualify / nuance', category: 'verb', languageId: 'fr', minLevel: 'C1' },

  // --- FRENCH OBJECTS ---
  { id: 'fr_obj_cafe', text: 'un café', translation: 'a coffee', category: 'object', languageId: 'fr', minLevel: 'A1', gender: 'm', number: 's' },
  { id: 'fr_obj_billet', text: 'un billet de train', translation: 'a train ticket', category: 'object', languageId: 'fr', minLevel: 'A1', gender: 'm', number: 's' },
  { id: 'fr_obj_solution', text: 'une solution adaptée', translation: 'a tailored solution', category: 'object', languageId: 'fr', minLevel: 'B1', gender: 'f', number: 's' },
  { id: 'fr_obj_compromis', text: 'un compromis diplomatique', translation: 'a diplomatic compromise', category: 'object', languageId: 'fr', minLevel: 'B2', gender: 'm', number: 's' },
  { id: 'fr_obj_precedent', text: 'un précédent juridique', translation: 'a legal precedent', category: 'object', languageId: 'fr', minLevel: 'C1', gender: 'm', number: 's' },

  // --- FRENCH CONNECTORS ---
  { id: 'fr_conn_mais', text: 'mais', translation: 'but', category: 'connector', languageId: 'fr', minLevel: 'A1' },
  { id: 'fr_conn_parceque', text: 'parce que', translation: 'because', category: 'connector', languageId: 'fr', minLevel: 'A2' },
  { id: 'fr_conn_bienque', text: 'bien que', translation: 'even though (+ subjunctive)', category: 'connector', languageId: 'fr', minLevel: 'B2', tags: ['subjunctive'] },
  { id: 'fr_conn_cependant', text: 'cependant', translation: 'however', category: 'connector', languageId: 'fr', minLevel: 'B2' },
  { id: 'fr_conn_endepitde', text: 'en dépit de', translation: 'despite (+ noun)', category: 'connector', languageId: 'fr', minLevel: 'C1' },

  // --- GERMAN SUBJECTS ---
  { id: 'de_sub_ich', text: 'ich', translation: 'I', category: 'subject', languageId: 'de', minLevel: 'A1', person: '1s' },
  { id: 'de_sub_du', text: 'du', translation: 'you', category: 'subject', languageId: 'de', minLevel: 'A1', person: '2s' },
  { id: 'de_sub_wir', text: 'wir', translation: 'we', category: 'subject', languageId: 'de', minLevel: 'A1', person: '1p' },
  { id: 'de_sub_sie', text: 'Sie', translation: 'you (formal)', category: 'subject', languageId: 'de', minLevel: 'A1', person: '3p' },
  { id: 'de_sub_experte', text: 'der Experte', translation: 'the expert', category: 'subject', languageId: 'de', minLevel: 'B2', person: '3s', gender: 'm' },

  // --- GERMAN VERBS ---
  { id: 'de_v_brauchen', text: 'brauchen', translation: 'to need', category: 'verb', languageId: 'de', minLevel: 'A1' },
  { id: 'de_v_suchen', text: 'suchen', translation: 'to look for', category: 'verb', languageId: 'de', minLevel: 'A1' },
  { id: 'de_v_koennen', text: 'können', translation: 'can / to be able to', category: 'verb', languageId: 'de', minLevel: 'A2', isModal: true },
  { id: 'de_v_beruecksichtigen', text: 'berücksichtigen', translation: 'to take into account', category: 'verb', languageId: 'de', minLevel: 'B2' },

  // --- GERMAN OBJECTS ---
  { id: 'de_obj_kaffee', text: 'Kaffee', translation: 'coffee', category: 'object', languageId: 'de', minLevel: 'A1', gender: 'm', number: 's' },
  { id: 'de_obj_fahrkarte', text: 'Fahrkarte', translation: 'train ticket', category: 'object', languageId: 'de', minLevel: 'A1', gender: 'f', number: 's' },
  { id: 'de_obj_loesung', text: 'Lösung', translation: 'solution', category: 'object', languageId: 'de', minLevel: 'B1', gender: 'f', number: 's' },
  { id: 'de_obj_kompromiss', text: 'Kompromiss', translation: 'compromise', category: 'object', languageId: 'de', minLevel: 'B2', gender: 'm', number: 's' },

  // --- GERMAN CONNECTORS ---
  { id: 'de_conn_aber', text: 'aber', translation: 'but', category: 'connector', languageId: 'de', minLevel: 'A1' },
  { id: 'de_conn_weil', text: 'weil', translation: 'because (verb at end)', category: 'connector', languageId: 'de', minLevel: 'A2', tags: ['subordinate'] },
  { id: 'de_conn_obwohl', text: 'obwohl', translation: 'although (verb at end)', category: 'connector', languageId: 'de', minLevel: 'B2', tags: ['subordinate'] },
  { id: 'de_conn_dennoch', text: 'dennoch', translation: 'nevertheless', category: 'connector', languageId: 'de', minLevel: 'B2' },

  // --- SPANISH SUBJECTS ---
  { id: 'es_sub_yo', text: 'yo', translation: 'I', category: 'subject', languageId: 'es', minLevel: 'A1', person: '1s' },
  { id: 'es_sub_tu', text: 'tú', translation: 'you', category: 'subject', languageId: 'es', minLevel: 'A1', person: '2s' },
  { id: 'es_sub_nosotros', text: 'nosotros', translation: 'we', category: 'subject', languageId: 'es', minLevel: 'A1', person: '1p' },
  { id: 'es_sub_usted', text: 'usted', translation: 'you (formal)', category: 'subject', languageId: 'es', minLevel: 'A1', person: '3s' },
  { id: 'es_sub_equipo', text: 'el equipo', translation: 'the team', category: 'subject', languageId: 'es', minLevel: 'B1', person: '3s', gender: 'm' },

  // --- SPANISH VERBS ---
  { id: 'es_v_necesitar', text: 'necesitar', translation: 'to need', category: 'verb', languageId: 'es', minLevel: 'A1' },
  { id: 'es_v_buscar', text: 'buscar', translation: 'to look for', category: 'verb', languageId: 'es', minLevel: 'A1' },
  { id: 'es_v_querer', text: 'querer', translation: 'to want', category: 'verb', languageId: 'es', minLevel: 'A1', isModal: true },
  { id: 'es_v_consensuar', text: 'consensuar', translation: 'to build consensus', category: 'verb', languageId: 'es', minLevel: 'B2' },

  // --- SPANISH OBJECTS ---
  { id: 'es_obj_cafe', text: 'un café con leche', translation: 'a coffee with milk', category: 'object', languageId: 'es', minLevel: 'A1', gender: 'm', number: 's' },
  { id: 'es_obj_billete', text: 'un billete de tren', translation: 'a train ticket', category: 'object', languageId: 'es', minLevel: 'A1', gender: 'm', number: 's' },
  { id: 'es_obj_acuerdo', text: 'un acuerdo viable', translation: 'a viable agreement', category: 'object', languageId: 'es', minLevel: 'B2', gender: 'm', number: 's' },

  // --- SPANISH CONNECTORS ---
  { id: 'es_conn_pero', text: 'pero', translation: 'but', category: 'connector', languageId: 'es', minLevel: 'A1' },
  { id: 'es_conn_porque', text: 'porque', translation: 'because', category: 'connector', languageId: 'es', minLevel: 'A2' },
  { id: 'es_conn_apesardeque', text: 'a pesar de que', translation: 'even though (+ subjunctive)', category: 'connector', languageId: 'es', minLevel: 'B2', tags: ['subjunctive'] },
  { id: 'es_conn_sinembargo', text: 'sin embargo', translation: 'however', category: 'connector', languageId: 'es', minLevel: 'B2' },
];

export function getLexiconSlots(
  languageId: LangCode,
  category: LexiconSlotEntry['category'],
  maxLevel: CEFRLevel = 'C1'
): LexiconSlotEntry[] {
  const levelsOrder: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const maxIdx = levelsOrder.indexOf(maxLevel);

  return MATRIX_LEXICON.filter((entry) => {
    if (entry.languageId !== languageId || entry.category !== category) return false;
    const entryIdx = levelsOrder.indexOf(entry.minLevel);
    return entryIdx <= maxIdx;
  });
}
