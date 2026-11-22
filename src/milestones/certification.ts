import { LangCode } from '../types';
import { CEFRLevel, MILESTONE_DEFS } from '../milestones';

export type MasterPillar =
  | 'listening'
  | 'reading_syntax'
  | 'writing'
  | 'speaking';

export interface PillarScore {
  pillar: MasterPillar;
  name: string;
  scorePct: number;
  weight: number;
  weightedScore: number;
}

export type HonorsTier = 'HONORS' | 'GOLD' | 'SILVER';

export interface MasterDiplomaCertificate {
  id: string;
  serialNumber: string;
  languageId: LangCode;
  courseName: string;
  level: CEFRLevel;
  levelTitle: string;
  recipientName: string;
  issuedDate: string;
  overallScorePct: number;
  honorsTier: HonorsTier;
  pillarScores: PillarScore[];
  cryptographicSeal: string;
  summaryReport: string;
}

export interface MasterCertificationProgress {
  completedDiplomas: Record<string, MasterDiplomaCertificate>;
  aggregateMasteryPct: number;
  totalDiplomasAwarded: number;
  retentionVelocity: number;
}

/**
 * Computes deterministic pseudo-cryptographic certification seal.
 */
export function computeCryptographicSeal(
  lang: LangCode,
  level: CEFRLevel,
  overallScorePct: number,
  timestamp: number
): string {
  const seed = `${lang}-${level}-${overallScorePct}-${timestamp}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  return `SEAL-ORRALI-${level}-${hex}`;
}

export function generateSerialId(
  lang: LangCode,
  level: CEFRLevel,
  timestamp: number
): string {
  const suffix = (timestamp % 1000000).toString().padStart(6, '0');
  return `ORRALI-CEFR-${lang.toUpperCase()}-${level}-${suffix}`;
}

export function calculateHonorsTier(overallScorePct: number): HonorsTier {
  if (overallScorePct >= 95) return 'HONORS';
  if (overallScorePct >= 85) return 'GOLD';
  return 'SILVER';
}

/**
 * Builds the 4-pillar scores and overall weighted CEFR score.
 */
export function evaluatePillars(rawScores: {
  listeningPct: number;
  readingSyntaxPct: number;
  writingPct: number;
  speakingPct: number;
}): { pillarScores: PillarScore[]; overallScorePct: number } {
  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

  const listening = clamp(rawScores.listeningPct);
  const readingSyntax = clamp(rawScores.readingSyntaxPct);
  const writing = clamp(rawScores.writingPct);
  const speaking = clamp(rawScores.speakingPct);

  const pillarScores: PillarScore[] = [
    {
      pillar: 'listening',
      name: 'Acoustic & Speed Listening',
      scorePct: listening,
      weight: 0.25,
      weightedScore: listening * 0.25,
    },
    {
      pillar: 'reading_syntax',
      name: 'Reading & Syntax Parsing',
      scorePct: readingSyntax,
      weight: 0.25,
      weightedScore: readingSyntax * 0.25,
    },
    {
      pillar: 'writing',
      name: 'Writing Composition & Morphology',
      scorePct: writing,
      weight: 0.25,
      weightedScore: writing * 0.25,
    },
    {
      pillar: 'speaking',
      name: 'Spoken Fluency & Retort Cadence',
      scorePct: speaking,
      weight: 0.25,
      weightedScore: speaking * 0.25,
    },
  ];

  const overallScorePct = Math.round(
    pillarScores.reduce((sum, p) => sum + p.weightedScore, 0)
  );

  return { pillarScores, overallScorePct };
}

/**
 * Generates an official Master Diploma Certificate upon passing CEFR evaluation.
 */
export function generateMasterCertificate(params: {
  languageId: LangCode;
  courseName: string;
  level: CEFRLevel;
  recipientName?: string;
  listeningPct: number;
  readingSyntaxPct: number;
  writingPct: number;
  speakingPct: number;
  issuedTimestamp?: number;
}): MasterDiplomaCertificate | null {
  const { pillarScores, overallScorePct } = evaluatePillars({
    listeningPct: params.listeningPct,
    readingSyntaxPct: params.readingSyntaxPct,
    writingPct: params.writingPct,
    speakingPct: params.speakingPct,
  });

  // Minimum passing grade across European Triad is 80%
  if (overallScorePct < 80) {
    return null;
  }

  const timestamp = params.issuedTimestamp ?? Date.now();
  const serialNumber = generateSerialId(params.languageId, params.level, timestamp);
  const cryptographicSeal = computeCryptographicSeal(
    params.languageId,
    params.level,
    overallScorePct,
    timestamp
  );
  const honorsTier = calculateHonorsTier(overallScorePct);

  const def = MILESTONE_DEFS.find((d) => d.level === params.level);
  const levelTitle = def ? def.title : `CEFR ${params.level} Diploma`;

  const dateStr = new Date(timestamp).toISOString().split('T')[0] ?? '2026-11-22';
  const recipient = params.recipientName ?? 'Learner of ORRALI';

  const summaryReport = `Official CEFR ${params.level} Master Certification in ${params.courseName} awarded with ${honorsTier} honors (${overallScorePct}%). Validated across Listening (${pillarScores[0]?.scorePct}%), Reading & Syntax (${pillarScores[1]?.scorePct}%), Writing (${pillarScores[2]?.scorePct}%), and Spoken Retort Cadence (${pillarScores[3]?.scorePct}%).`;

  return {
    id: `cert-${params.languageId}-${params.level}-${timestamp}`,
    serialNumber,
    languageId: params.languageId,
    courseName: params.courseName,
    level: params.level,
    levelTitle,
    recipientName: recipient,
    issuedDate: dateStr,
    overallScorePct,
    honorsTier,
    pillarScores,
    cryptographicSeal,
    summaryReport,
  };
}

/**
 * Calculates aggregated mastery metrics across multiple diplomas.
 */
export function summarizeCertificationAnalytics(
  certificates: MasterDiplomaCertificate[]
): MasterCertificationProgress {
  if (certificates.length === 0) {
    return {
      completedDiplomas: {},
      aggregateMasteryPct: 0,
      totalDiplomasAwarded: 0,
      retentionVelocity: 0.85,
    };
  }

  const completedDiplomas: Record<string, MasterDiplomaCertificate> = {};
  let totalPct = 0;

  for (const cert of certificates) {
    completedDiplomas[cert.id] = cert;
    totalPct += cert.overallScorePct;
  }

  const aggregateMasteryPct = Math.round(totalPct / certificates.length);
  // Retention velocity increases with certificate count and mastery score
  const retentionVelocity = Math.min(
    0.99,
    0.88 + (certificates.length * 0.02) + (aggregateMasteryPct / 1000)
  );

  return {
    completedDiplomas,
    aggregateMasteryPct,
    totalDiplomasAwarded: certificates.length,
    retentionVelocity: parseFloat(retentionVelocity.toFixed(3)),
  };
}
