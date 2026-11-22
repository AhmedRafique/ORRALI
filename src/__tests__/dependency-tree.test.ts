import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEPENDENCY_TREES_CATALOG,
  getDependencyTreesByLanguage,
  getDependencyTreeById,
  buildSyntaxRadarChallenge,
  evaluateSyntaxAnswer,
  getTreeHierarchy,
} from '../grammar/dependencyTree';

describe('Visual Grammar Dependency Tree & Syntax Radar (TDD)', () => {
  describe('1. European Triad Dependency Catalog Integrity', () => {
    it('provides dependency trees across French, German, and Spanish', () => {
      const frTrees = getDependencyTreesByLanguage('fr');
      const deTrees = getDependencyTreesByLanguage('de');
      const esTrees = getDependencyTreesByLanguage('es');

      assert.ok(frTrees.length >= 2, 'French catalog should have at least 2 trees');
      assert.ok(deTrees.length >= 2, 'German catalog should have at least 2 trees');
      assert.ok(esTrees.length >= 2, 'Spanish catalog should have at least 2 trees');
    });

    it('verifies all trees have valid root, nodes, translations, and radar highlights', () => {
      for (const tree of DEPENDENCY_TREES_CATALOG) {
        assert.ok(tree.id.length > 0);
        assert.ok(tree.fullSentence.length > 0);
        assert.ok(tree.translation.length > 0);
        assert.ok(tree.radarHighlights.governanceRule.length > 0);
        assert.ok(tree.radarHighlights.linguisticMechanism.length > 0);
        assert.ok(tree.radarHighlights.trapToAvoid.length > 0);
        assert.ok(tree.rootNode.id.length > 0);
        assert.equal(tree.rootNode.role, 'ROOT');
        assert.ok(tree.allNodes.length >= 4);

        // Every node must have role and explanation
        for (const node of tree.allNodes) {
          assert.ok(node.id.length > 0);
          assert.ok(node.token.length > 0);
          assert.ok(node.role.length > 0);
          assert.ok(node.relation.length > 0);
          assert.ok(node.explanation.length > 0);
        }
      }
    });

    it('retrieves specific dependency tree by ID', () => {
      const tree = getDependencyTreeById('de-tree-two-way-prepositions');
      assert.ok(tree);
      assert.equal(tree?.languageId, 'de');
      assert.ok(tree?.fullSentence.includes('Tisch'));
      assert.ok(tree?.radarHighlights.governanceRule.includes('Wechselpräpositionen'));
    });
  });

  describe('2. Syntax Hierarchy & Tree Decomposition', () => {
    it('splits sentence tree into root predicate and child arguments', () => {
      const tree = getDependencyTreeById('fr-tree-cod-agreement');
      assert.ok(tree);
      if (!tree) return;

      const hierarchy = getTreeHierarchy(tree);
      assert.equal(hierarchy.root.id, 'fr-cod-sont');
      assert.equal(hierarchy.root.role, 'ROOT');
      assert.ok(hierarchy.children.length >= 4);
    });
  });

  describe('3. Dynamic Syntax Challenge Generation & Evaluation', () => {
    it('generates a syntax radar challenge with target role and options', () => {
      const challenge = buildSyntaxRadarChallenge('fr');
      assert.ok(challenge.id.length > 0);
      assert.ok(challenge.targetRole.length > 0);
      assert.ok(challenge.targetToken.length > 0);
      assert.ok(challenge.options.length >= 2);
      assert.ok(challenge.options.some((o) => o.isCorrect && o.token === challenge.targetToken));
    });

    it('evaluates correct syntax radar hit with 25 XP and grammatical rule', () => {
      const challenge = buildSyntaxRadarChallenge('de');
      const correctToken = challenge.targetToken;

      const result = evaluateSyntaxAnswer(challenge, correctToken);
      assert.equal(result.isCorrect, true);
      assert.equal(result.earnedXp, 25);
      assert.ok(result.feedback.includes('Structural Bullseye'));
      assert.ok(result.ruleExplanation.length > 0);
    });

    it('evaluates incorrect syntax radar choice with 5 constructive XP and trap advice', () => {
      const challenge = buildSyntaxRadarChallenge('es');
      const wrongToken = 'WRONG_SYNTAX_SELECTION';

      const result = evaluateSyntaxAnswer(challenge, wrongToken);
      assert.equal(result.isCorrect, false);
      assert.equal(result.earnedXp, 5);
      assert.ok(result.feedback.includes('Syntactic slip'));
      assert.ok(result.ruleExplanation.includes('Notice:'));
    });
  });
});
