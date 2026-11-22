import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { courses } from '../content';
import { VIDEO_IMMERSION_CLIPS } from '../video/catalog';
import { MISSIONS_CATALOG } from '../missions/catalog';
import { WRITING_CHALLENGES_CATALOG } from '../writing/catalog';
import { CHARACTER_BACKSTORIES } from '../personas/backstories';
import { MINIMAL_PAIRS_CATALOG } from '../audio/phonemeClinic';
import { DEPENDENCY_TREES_CATALOG } from '../grammar/dependencyTree';
import { RAPID_RETORT_CATALOG } from '../coach/rapidRetort';

describe('ROUND 1 ADVERSARIAL AUDIT: Curriculum, Content & Asset Parity', () => {
  describe('1. European Triad Curriculum & Course Scale', () => {
    it('verifies all 3 courses (FR, DE, ES) have exactly 30 units and 180 items each (540 total)', () => {
      assert.equal(courses.length, 3);
      const codes = courses.map((c) => c.code);
      assert.deepEqual(codes.sort(), ['de', 'es', 'fr']);

      let grandTotalItems = 0;

      for (const course of courses) {
        assert.equal(course.lessons.length, 30, `${course.name} should have exactly 30 units`);

        for (const lesson of course.lessons) {
          assert.equal(
            lesson.items.length,
            6,
            `Lesson ${lesson.id} in ${course.name} must have exactly 6 items`
          );
          grandTotalItems += lesson.items.length;
        }
      }

      assert.equal(grandTotalItems, 540, 'Total curriculum items across FR/DE/ES must equal 540');
    });

    it('verifies global uniqueness of all 540 item IDs across the entire application', () => {
      const seenIds = new Set<string>();
      const duplicateIds: string[] = [];

      for (const course of courses) {
        for (const lesson of course.lessons) {
          for (const item of lesson.items) {
            if (seenIds.has(item.id)) {
              duplicateIds.push(item.id);
            }
            seenIds.add(item.id);
          }
        }
      }

      assert.equal(
        duplicateIds.length,
        0,
        `Detected duplicate item IDs: ${duplicateIds.join(', ')}`
      );
    });

    it('verifies no empty fields in any curriculum item and valid alternatives array', () => {
      for (const course of courses) {
        for (const lesson of course.lessons) {
          assert.ok(lesson.title.trim().length > 0, `Lesson ${lesson.id} has empty title`);
          assert.ok(lesson.level, `Lesson ${lesson.id} must specify CEFR level`);

          for (const item of lesson.items) {
            assert.ok(item.id.trim().length > 0, `Empty item id in ${lesson.id}`);
            assert.ok(item.target.trim().length > 0, `Empty target in ${item.id}`);
            assert.ok(item.en.trim().length > 0, `Empty english in ${item.id}`);
            assert.ok(item.phonetic && item.phonetic.trim().length > 0, `Empty phonetic in ${item.id}`);
            assert.ok(item.notes && item.notes.trim().length > 0, `Empty notes in ${item.id}`);
            assert.ok(Array.isArray(item.alternatives), `Alternatives must be array in ${item.id}`);
          }
        }
      }
    });

    it('verifies all 90 units have complete Grammar Capsules with summary and explanation', () => {
      for (const course of courses) {
        for (const lesson of course.lessons) {
          const cap = lesson.grammarCapsule;
          assert.ok(cap, `Unit ${lesson.id} in ${course.name} is missing grammarCapsule`);
          assert.ok(cap?.title.trim().length > 0, `Unit ${lesson.id} capsule has empty title`);
          assert.ok(cap?.tag.trim().length > 0, `Unit ${lesson.id} capsule has empty tag`);
          assert.ok(cap?.summary.trim().length > 0, `Unit ${lesson.id} capsule has empty summary`);
          assert.ok(Array.isArray(cap?.examples) && cap.examples.length >= 1, `Unit ${lesson.id} capsule missing examples`);
          assert.ok(cap?.explanation.trim().length > 0, `Unit ${lesson.id} capsule has empty explanation`);
        }
      }
    });
  });

  describe('2. Physical Audio Asset Parity & Earcon Integrity', () => {
    it('verifies all physical earcon files exist on disk in assets/audio/earcons', () => {
      const earconFiles = ['chime_success.wav', 'chime_error.wav', 'chime_fanfare.wav'];
      for (const file of earconFiles) {
        const p = path.join('assets', 'audio', 'earcons', file);
        assert.ok(fs.existsSync(p), `Missing physical earcon: ${p}`);
        assert.ok(fs.statSync(p).size > 1000, `Corrupt earcon file: ${p}`);
      }
    });

    it('verifies audioMap entries in src/audioMap.ts cover registered curriculum audio', () => {
      const audioMapContent = fs.readFileSync('src/audioMap.ts', 'utf8');
      assert.ok(audioMapContent.includes('AUDIO_ASSETS'));

      // Check that units 1-12 have audio mapping entries in audioMap.ts
      for (let u = 1; u <= 12; u++) {
        for (let i = 1; i <= 6; i++) {
          assert.ok(
            audioMapContent.includes(`'fr-${u}-${i}':`),
            `Missing audioMap entry for fr-${u}-${i}`
          );
        }
      }
    });
  });

  describe('3. Catalogs & Specialized Immersion Modules Integrity', () => {
    it('verifies Video Immersion Lounge catalog clips and subtitle timing order', () => {
      assert.ok(VIDEO_IMMERSION_CLIPS.length >= 3);
      for (const clip of VIDEO_IMMERSION_CLIPS) {
        assert.ok(clip.id.length > 0);
        assert.ok(clip.title.length > 0);
        assert.ok(clip.subtitles.length > 0);

        for (let i = 0; i < clip.subtitles.length; i++) {
          const sub = clip.subtitles[i];
          assert.ok(sub.startMs < sub.endMs, `Inverted subtitle timestamps in ${clip.id}`);
          if (i > 0) {
            assert.ok(
              sub.startMs >= clip.subtitles[i - 1].startMs,
              `Subtitles not chronologically ordered in ${clip.id}`
            );
          }
        }
      }
    });

    it('verifies Real-Life Missions catalog has valid dialogue turns and challenges', () => {
      assert.ok(MISSIONS_CATALOG.length >= 3);
      for (const m of MISSIONS_CATALOG) {
        assert.ok(m.id.length > 0);
        assert.ok(m.title.length > 0);
        assert.ok(m.dialogueTurns.length >= 2);
        assert.ok(m.unexpectedEvent.npcStatement.length > 0);
        assert.ok(m.finalChallenge.prompt.length > 0);
      }
    });

    it('verifies Writing Lab challenges have valid word counts and keywords', () => {
      assert.ok(WRITING_CHALLENGES_CATALOG.length >= 3);
      for (const c of WRITING_CHALLENGES_CATALOG) {
        assert.ok(c.id.length > 0);
        assert.ok(c.minimumWords > 0);
        assert.ok(c.requiredKeywords.length > 0);
      }
    });

    it('verifies all 9 Persona Backstories have cultural dossiers and relationship tiers', () => {
      const keys = Object.keys(CHARACTER_BACKSTORIES);
      assert.equal(keys.length, 9, 'Must have 9 personas (3 per language)');
      for (const key of keys) {
        const p = CHARACTER_BACKSTORIES[key];
        assert.ok(p.originCity.length > 0);
        assert.ok(p.favoriteSpot.length > 0);
        assert.ok(p.secretTip.length > 0);
        assert.ok(p.greetings.acquaintance.target.length > 0);
        assert.ok(p.anecdotes.length >= 3);
      }
    });

    it('verifies Minimal Pairs catalog has valid mouth mechanics and acoustic tips', () => {
      assert.ok(MINIMAL_PAIRS_CATALOG.length >= 12);
      for (const pair of MINIMAL_PAIRS_CATALOG) {
        assert.ok(pair.acousticTip.length > 0);
        assert.ok(pair.mouthMechanicsA.tonguePosition.length > 0);
        assert.ok(pair.mouthMechanicsB.tonguePosition.length > 0);
      }
    });

    it('verifies Dependency Trees catalog has valid root and child relations', () => {
      assert.ok(DEPENDENCY_TREES_CATALOG.length >= 6);
      for (const tree of DEPENDENCY_TREES_CATALOG) {
        assert.equal(tree.rootNode.role, 'ROOT');
        assert.ok(tree.allNodes.length >= 4);
      }
    });

    it('verifies Rapid Retort catalog has pressure scenarios with fillers and comebacks', () => {
      assert.ok(RAPID_RETORT_CATALOG.length >= 6);
      for (const sc of RAPID_RETORT_CATALOG) {
        assert.ok(sc.validFillers.length > 0);
        assert.ok(sc.options.some((o) => o.isNaturalComeback && o.hasFiller));
      }
    });
  });
});
