import { CEFRLevel, LangCode } from '../types';

export type StreetDomain =
  | 'medical_pharmacy'
  | 'housing_rental'
  | 'public_admin_visas'
  | 'transit_breakdown'
  | 'romance_social'
  | 'work_tech_finance'
  | 'gastronomy_culinary'
  | 'urban_slang_nuance';

export interface DomainPhraseEntry {
  id: string;
  languageId: LangCode;
  domain: StreetDomain;
  level: CEFRLevel;
  target: string;
  en: string;
  phonetic?: string;
  gender?: 'm' | 'f' | 'n';
  partOfSpeech?: 'noun' | 'verb' | 'phrase' | 'adjective' | 'idiom';
  notes?: string;
  exampleUsage?: string;
}

export interface DomainLexiconFilter {
  languageId?: LangCode;
  domain?: StreetDomain;
  level?: CEFRLevel;
  query?: string;
  limit?: number;
}

export interface DomainStatistics {
  domain: StreetDomain;
  label: string;
  icon: string;
  count: number;
}
