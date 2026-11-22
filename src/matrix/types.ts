import { CEFRLevel, LangCode } from '../types';

export type GrammarPerson = '1s' | '2s' | '3s' | '1p' | '2p' | '3p';
export type GrammarGender = 'm' | 'f' | 'n';
export type GrammarNumber = 's' | 'p';
export type GermanCase = 'nom' | 'acc' | 'dat' | 'gen';

export type TenseMood =
  | 'present'
  | 'past_compound'
  | 'imperfect'
  | 'future'
  | 'conditional'
  | 'subjunctive_present'
  | 'subjunctive_imperfect'
  | 'passive';

export type GrammarSlotType =
  | 'subject'
  | 'connector'
  | 'auxiliary'
  | 'verb'
  | 'direct_object'
  | 'indirect_object'
  | 'adjective'
  | 'adverb'
  | 'prepositional_phrase'
  | 'time_clause';

export interface MorphologicalContext {
  person: GrammarPerson;
  gender: GrammarGender;
  number: GrammarNumber;
  tense: TenseMood;
  germanCase?: GermanCase;
  isSubordinate?: boolean;
  isQuestion?: boolean;
  isNegative?: boolean;
}

export interface MatrixSlotOption {
  id: string;
  text: string;
  translation: string;
  gender?: GrammarGender;
  number?: GrammarNumber;
  vowelStart?: boolean;
  tags?: string[];
}

export interface MatrixTemplate {
  id: string;
  languageId: LangCode;
  level: CEFRLevel;
  title: string;
  grammarConcept: string;
  defaultTense: TenseMood;
  slots: Array<{
    type: GrammarSlotType;
    label: string;
    options: MatrixSlotOption[];
  }>;
  assembler: (
    selected: Partial<Record<GrammarSlotType, MatrixSlotOption>>,
    context: MorphologicalContext
  ) => {
    target: string;
    en: string;
    notes: string;
    alternatives?: string[];
  };
}

export interface GeneratedMatrixSentence {
  id: string;
  templateId: string;
  languageId: LangCode;
  level: CEFRLevel;
  target: string;
  en: string;
  slots: Record<string, string>;
  grammarExplanation: string;
  alternatives: string[];
}

export type MatrixExerciseKind =
  | 'substitution'
  | 'tense_flip'
  | 'connector_synthesis'
  | 'case_governance';

export interface MatrixExercise {
  id: string;
  kind: MatrixExerciseKind;
  level: CEFRLevel;
  languageId: LangCode;
  prompt: string;
  instructions: string;
  baseSentence: string;
  baseEn: string;
  targetSolution: string;
  acceptableAlternatives: string[];
  slotChoices?: Array<{
    slotLabel: string;
    options: string[];
    correctOption: string;
  }>;
  grammarTip: string;
}
