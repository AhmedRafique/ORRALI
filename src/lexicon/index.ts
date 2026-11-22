import { LangCode } from '../types';
import { norm, stripAccents } from '../exercises';
import { DE_DOMAIN_LEXICON } from './deBank';
import { ES_DOMAIN_LEXICON } from './esBank';
import { FR_DOMAIN_LEXICON } from './frBank';
import {
  DomainLexiconFilter,
  DomainPhraseEntry,
  DomainStatistics,
  StreetDomain,
} from './types';

export * from './types';
export { FR_DOMAIN_LEXICON } from './frBank';
export { DE_DOMAIN_LEXICON } from './deBank';
export { ES_DOMAIN_LEXICON } from './esBank';

const ALL_DOMAIN_PHRASES: DomainPhraseEntry[] = [
  ...FR_DOMAIN_LEXICON,
  ...DE_DOMAIN_LEXICON,
  ...ES_DOMAIN_LEXICON,
];

const DOMAIN_METADATA: Record<StreetDomain, { label: string; icon: string }> = {
  medical_pharmacy: { label: 'Medical & Pharmacy', icon: '🏥' },
  housing_rental: { label: 'Housing & Rental', icon: '🏠' },
  public_admin_visas: { label: 'Public Admin & Visas', icon: '🏛️' },
  transit_breakdown: { label: 'Transit & Breakdown', icon: '🚗' },
  romance_social: { label: 'Romance & Social', icon: '💬' },
  work_tech_finance: { label: 'Work, Tech & Finance', icon: '💻' },
  gastronomy_culinary: { label: 'Gastronomy & Dining', icon: '🥖' },
  urban_slang_nuance: { label: 'Urban Slang & Nuance', icon: '⚡' },
};

/**
 * Returns all domain phrases, optionally filtered by language.
 */
export function getAllDomainPhrases(lang?: LangCode): DomainPhraseEntry[] {
  if (!lang) return ALL_DOMAIN_PHRASES;
  return ALL_DOMAIN_PHRASES.filter((p) => p.languageId === lang);
}

/**
 * Searches and filters domain street phrases with accent leniency and query matching.
 */
export function queryDomainLexicon(filter: DomainLexiconFilter): DomainPhraseEntry[] {
  let list = ALL_DOMAIN_PHRASES;

  if (filter.languageId) {
    list = list.filter((p) => p.languageId === filter.languageId);
  }

  if (filter.domain) {
    list = list.filter((p) => p.domain === filter.domain);
  }

  if (filter.level) {
    list = list.filter((p) => p.level === filter.level);
  }

  if (filter.query && filter.query.trim()) {
    const qNorm = stripAccents(norm(filter.query));
    list = list.filter((p) => {
      const targetNorm = stripAccents(norm(p.target));
      const enNorm = stripAccents(norm(p.en));
      const phoneticNorm = stripAccents(norm(p.phonetic ?? ''));
      return (
        targetNorm.includes(qNorm) ||
        enNorm.includes(qNorm) ||
        phoneticNorm.includes(qNorm)
      );
    });
  }

  if (filter.limit && filter.limit > 0) {
    list = list.slice(0, filter.limit);
  }

  return list;
}

/**
 * Returns count breakdown across all 8 street domains for a given language.
 */
export function getDomainStatistics(lang: LangCode): DomainStatistics[] {
  const langPhrases = getAllDomainPhrases(lang);
  const domains: StreetDomain[] = [
    'medical_pharmacy',
    'housing_rental',
    'public_admin_visas',
    'transit_breakdown',
    'romance_social',
    'work_tech_finance',
    'gastronomy_culinary',
    'urban_slang_nuance',
  ];

  return domains.map((domain) => {
    const count = langPhrases.filter((p) => p.domain === domain).length;
    const meta = DOMAIN_METADATA[domain];
    return {
      domain,
      label: meta.label,
      icon: meta.icon,
      count,
    };
  });
}
