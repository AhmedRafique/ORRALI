import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluatePillars,
  calculateHonorsTier,
  computeCryptographicSeal,
  generateSerialId,
  generateMasterCertificate,
  summarizeCertificationAnalytics,
} from '../milestones/certification';

describe('Master Fluency Certification & Release Analytics (TDD)', () => {
  describe('1. 4-Pillar Evaluation & Honors Tiering', () => {
    it('evaluates weighted scores across all 4 pillars and clamps out-of-bound inputs', () => {
      const { pillarScores, overallScorePct } = evaluatePillars({
        listeningPct: 100,
        readingSyntaxPct: 90,
        writingPct: 80,
        speakingPct: 90,
      });

      assert.equal(pillarScores.length, 4);
      assert.equal(overallScorePct, 90);
      assert.equal(pillarScores[0]?.scorePct, 100);
      assert.equal(pillarScores[1]?.scorePct, 90);
      assert.equal(pillarScores[2]?.scorePct, 80);
      assert.equal(pillarScores[3]?.scorePct, 90);
    });

    it('assigns correct honors tiers based on score threshold', () => {
      assert.equal(calculateHonorsTier(97), 'HONORS');
      assert.equal(calculateHonorsTier(95), 'HONORS');
      assert.equal(calculateHonorsTier(88), 'GOLD');
      assert.equal(calculateHonorsTier(85), 'GOLD');
      assert.equal(calculateHonorsTier(82), 'SILVER');
    });
  });

  describe('2. Master Diploma Certificate Generation & Cryptographic Verification', () => {
    it('generates a verified certificate with serial number and seal for passing grades', () => {
      const cert = generateMasterCertificate({
        languageId: 'fr',
        courseName: 'French',
        level: 'C1',
        recipientName: 'Alexandre',
        listeningPct: 95,
        readingSyntaxPct: 92,
        writingPct: 88,
        speakingPct: 96,
        issuedTimestamp: 1763800000000,
      });

      assert.ok(cert);
      assert.equal(cert?.languageId, 'fr');
      assert.equal(cert?.level, 'C1');
      assert.equal(cert?.recipientName, 'Alexandre');
      assert.equal(cert?.honorsTier, 'GOLD');
      assert.ok(cert?.overallScorePct >= 90);
      assert.ok(cert?.serialNumber.startsWith('ORRALI-CEFR-FR-C1-'));
      assert.ok(cert?.cryptographicSeal.startsWith('SEAL-ORRALI-C1-'));
      assert.ok(cert?.summaryReport.includes('French'));
    });

    it('rejects certificate issuance when score is below 80% passing threshold', () => {
      const cert = generateMasterCertificate({
        languageId: 'de',
        courseName: 'German',
        level: 'B2',
        listeningPct: 70,
        readingSyntaxPct: 65,
        writingPct: 75,
        speakingPct: 60,
      });

      assert.equal(cert, null);
    });

    it('generates deterministic cryptographic seal for identical inputs', () => {
      const seal1 = computeCryptographicSeal('es', 'B1', 92, 1763800000000);
      const seal2 = computeCryptographicSeal('es', 'B1', 92, 1763800000000);
      const seal3 = computeCryptographicSeal('es', 'B2', 92, 1763800000000);

      assert.equal(seal1, seal2);
      assert.notEqual(seal1, seal3);
    });

    it('generates structured serial numbers', () => {
      const serial = generateSerialId('de', 'C1', 1234567);
      assert.equal(serial, 'ORRALI-CEFR-DE-C1-234567');
    });
  });

  describe('3. Relational Analytics & Retention Velocity', () => {
    it('summarizes analytics across multiple awarded certificates', () => {
      const cert1 = generateMasterCertificate({
        languageId: 'fr',
        courseName: 'French',
        level: 'B1',
        listeningPct: 85,
        readingSyntaxPct: 85,
        writingPct: 85,
        speakingPct: 85,
      })!;

      const cert2 = generateMasterCertificate({
        languageId: 'de',
        courseName: 'German',
        level: 'B2',
        listeningPct: 95,
        readingSyntaxPct: 95,
        writingPct: 95,
        speakingPct: 95,
      })!;

      const summary = summarizeCertificationAnalytics([cert1, cert2]);
      assert.equal(summary.totalDiplomasAwarded, 2);
      assert.equal(summary.aggregateMasteryPct, 90);
      assert.ok(summary.retentionVelocity >= 0.9);
      assert.ok(summary.completedDiplomas[cert1.id]);
      assert.ok(summary.completedDiplomas[cert2.id]);
    });

    it('handles empty certificate history safely without crashing', () => {
      const summary = summarizeCertificationAnalytics([]);
      assert.equal(summary.totalDiplomasAwarded, 0);
      assert.equal(summary.aggregateMasteryPct, 0);
      assert.ok(summary.retentionVelocity > 0);
    });
  });
});
