import { LangCode } from '../types';

export type SyntaxNodeType =
  | 'ROOT'
  | 'SUBJECT'
  | 'PREDICATE'
  | 'DIRECT_OBJECT'
  | 'INDIRECT_OBJECT'
  | 'PREPOSITIONAL_OBJECT'
  | 'SUBORDINATE_CLAUSE'
  | 'MODAL_VERB'
  | 'CONJUNCTION'
  | 'ADVERBIAL'
  | 'ADJECTIVAL'
  | 'CLITIC_PRONOUN';

export type CaseGovernance =
  | 'NOMINATIVE'
  | 'ACCUSATIVE'
  | 'DATIVE'
  | 'GENITIVE'
  | 'SUBJUNCTIVE'
  | 'COD_AGREEMENT'
  | 'NONE';

export interface DependencyNode {
  id: string;
  token: string;
  lemma?: string;
  role: SyntaxNodeType;
  caseGovernance?: CaseGovernance;
  caseNote?: string;
  parentId?: string;
  relation: string; // e.g. "root", "nsubj", "obj", "iobj", "obl", "aux", "mark", "advmod"
  explanation: string;
}

export interface SentenceDependencyTree {
  id: string;
  languageId: LangCode;
  fullSentence: string;
  translation: string;
  cefrLevel: 'A2' | 'B1' | 'B2' | 'C1';
  radarHighlights: {
    governanceRule: string;
    linguisticMechanism: string;
    trapToAvoid: string;
  };
  rootNode: DependencyNode;
  allNodes: DependencyNode[];
}

export interface SyntaxNodeChallenge {
  id: string;
  tree: SentenceDependencyTree;
  maskedNodeId: string;
  targetRole: SyntaxNodeType;
  targetToken: string;
  options: {
    token: string;
    role: SyntaxNodeType;
    isCorrect: boolean;
  }[];
}

export const DEPENDENCY_TREES_CATALOG: SentenceDependencyTree[] = [
  // --- FRENCH (fr) ---
  {
    id: 'fr-tree-cod-agreement',
    languageId: 'fr',
    fullSentence: 'Les fleurs que Paul a achetées sont magnifiques.',
    translation: 'The flowers that Paul bought are magnificent.',
    cefrLevel: 'B1',
    radarHighlights: {
      governanceRule: 'Accord du participe passé avec le COD antéposé',
      linguisticMechanism:
        'When the direct object (COD: "que" referring to "Les fleurs", feminine plural) precedes the auxiliary "avoir", the past participle agrees (-ées).',
      trapToAvoid: 'Do not leave "acheté" invariable when the relative pronoun "que" stands before "a".',
    },
    rootNode: {
      id: 'fr-cod-sont',
      token: 'sont',
      lemma: 'être',
      role: 'ROOT',
      relation: 'root',
      explanation: 'Main copular predicate governing the entire sentence.',
    },
    allNodes: [
      {
        id: 'fr-cod-les-fleurs',
        token: 'Les fleurs',
        lemma: 'fleur',
        role: 'SUBJECT',
        parentId: 'fr-cod-sont',
        relation: 'nsubj',
        explanation: 'Feminine plural grammatical subject of "sont".',
      },
      {
        id: 'fr-cod-que',
        token: 'que',
        lemma: 'que',
        role: 'DIRECT_OBJECT',
        caseGovernance: 'COD_AGREEMENT',
        caseNote: 'Anteposed COD (relative pronoun referring to "Les fleurs")',
        parentId: 'fr-cod-achetees',
        relation: 'obj',
        explanation: 'Relative pronoun acting as direct object of "a achetées".',
      },
      {
        id: 'fr-cod-paul',
        token: 'Paul',
        lemma: 'Paul',
        role: 'SUBJECT',
        parentId: 'fr-cod-achetees',
        relation: 'nsubj',
        explanation: 'Subject of the embedded relative clause.',
      },
      {
        id: 'fr-cod-achetees',
        token: 'a achetées',
        lemma: 'acheter',
        role: 'PREDICATE',
        caseGovernance: 'COD_AGREEMENT',
        caseNote: 'Participle inflected with feminine plural -ées',
        parentId: 'fr-cod-les-fleurs',
        relation: 'acl:relcl',
        explanation: 'Relative clause verb inflected to match the preceding COD "que" (fleurs).',
      },
      {
        id: 'fr-cod-sont',
        token: 'sont',
        lemma: 'être',
        role: 'ROOT',
        relation: 'root',
        explanation: 'Main copular verb.',
      },
      {
        id: 'fr-cod-magnifiques',
        token: 'magnifiques',
        lemma: 'magnifique',
        role: 'ADJECTIVAL',
        parentId: 'fr-cod-sont',
        relation: 'xcomp',
        explanation: 'Predicate adjective modifying "Les fleurs".',
      },
    ],
  },
  {
    id: 'fr-tree-clitic-order',
    languageId: 'fr',
    fullSentence: 'Je ne te le dirai jamais.',
    translation: 'I will never tell it to you.',
    cefrLevel: 'A2',
    radarHighlights: {
      governanceRule: 'Ordre des pronoms personnels et négation encadrante',
      linguisticMechanism:
        'Indirect clitic (te) precedes direct clitic (le), embraced inside the negative sandwich "ne ... jamais".',
      trapToAvoid: 'Never say "Je ne le te dirai pas"; 1st/2nd person clitics precede 3rd person direct clitics.',
    },
    rootNode: {
      id: 'fr-clitic-dirai',
      token: 'dirai',
      lemma: 'dire',
      role: 'ROOT',
      relation: 'root',
      explanation: 'Future indicative predicate governing clitics and negation.',
    },
    allNodes: [
      {
        id: 'fr-clitic-je',
        token: 'Je',
        lemma: 'je',
        role: 'SUBJECT',
        parentId: 'fr-clitic-dirai',
        relation: 'nsubj',
        explanation: 'Subject pronoun (1st person singular).',
      },
      {
        id: 'fr-clitic-te',
        token: 'te',
        lemma: 'te',
        role: 'INDIRECT_OBJECT',
        caseGovernance: 'DATIVE',
        caseNote: 'Dative clitic: to you',
        parentId: 'fr-clitic-dirai',
        relation: 'iobj',
        explanation: 'Preverbal indirect object pronoun.',
      },
      {
        id: 'fr-clitic-le',
        token: 'le',
        lemma: 'le',
        role: 'DIRECT_OBJECT',
        caseGovernance: 'ACCUSATIVE',
        caseNote: 'Accusative clitic: it',
        parentId: 'fr-clitic-dirai',
        relation: 'obj',
        explanation: 'Preverbal direct object pronoun.',
      },
      {
        id: 'fr-clitic-dirai',
        token: 'dirai',
        lemma: 'dire',
        role: 'ROOT',
        relation: 'root',
        explanation: 'Head verb in simple future tense.',
      },
      {
        id: 'fr-clitic-jamais',
        token: 'ne ... jamais',
        lemma: 'ne jamais',
        role: 'ADVERBIAL',
        parentId: 'fr-clitic-dirai',
        relation: 'advmod',
        explanation: 'Negative polarity adverb bracket.',
      },
    ],
  },

  // --- GERMAN (de) ---
  {
    id: 'de-tree-subordinate-verb-final',
    languageId: 'de',
    fullSentence: 'Ich weiß, dass er heute nach Hause kommt.',
    translation: 'I know that he is coming home today.',
    cefrLevel: 'A2',
    radarHighlights: {
      governanceRule: 'Nebensatz-Wortstellung mit subordinierender Konjunktion (Verb-Letzt)',
      linguisticMechanism:
        'The subordinating conjunction "dass" kicks the conjugated verb "kommt" to the absolute end of the subordinate clause.',
      trapToAvoid: 'Never place the verb in V2 position after "dass" (e.g. *dass er kommt heute nach Hause* is wrong).',
    },
    rootNode: {
      id: 'de-sub-weiss',
      token: 'weiß',
      lemma: 'wissen',
      role: 'ROOT',
      relation: 'root',
      explanation: 'Main clause predicate in verb-second (V2) position.',
    },
    allNodes: [
      {
        id: 'de-sub-ich',
        token: 'Ich',
        lemma: 'ich',
        role: 'SUBJECT',
        caseGovernance: 'NOMINATIVE',
        parentId: 'de-sub-weiss',
        relation: 'nsubj',
        explanation: 'Subject of main clause.',
      },
      {
        id: 'de-sub-weiss',
        token: 'weiß',
        lemma: 'wissen',
        role: 'ROOT',
        relation: 'root',
        explanation: 'Main clause verb.',
      },
      {
        id: 'de-sub-dass',
        token: 'dass',
        lemma: 'dass',
        role: 'CONJUNCTION',
        parentId: 'de-sub-kommt',
        relation: 'mark',
        explanation: 'Subordinating conjunction triggering verb-final word order.',
      },
      {
        id: 'de-sub-er',
        token: 'er',
        lemma: 'er',
        role: 'SUBJECT',
        caseGovernance: 'NOMINATIVE',
        parentId: 'de-sub-kommt',
        relation: 'nsubj',
        explanation: 'Subject of the subordinate clause.',
      },
      {
        id: 'de-sub-heute',
        token: 'heute',
        lemma: 'heute',
        role: 'ADVERBIAL',
        parentId: 'de-sub-kommt',
        relation: 'advmod',
        explanation: 'Temporal adverbial (TeKaMoLo: time first).',
      },
      {
        id: 'de-sub-nach-hause',
        token: 'nach Hause',
        lemma: 'nach Hause',
        role: 'PREPOSITIONAL_OBJECT',
        parentId: 'de-sub-kommt',
        relation: 'obl',
        explanation: 'Directional prepositional phrase (homeward).',
      },
      {
        id: 'de-sub-kommt',
        token: 'kommt',
        lemma: 'kommen',
        role: 'SUBORDINATE_CLAUSE',
        parentId: 'de-sub-weiss',
        relation: 'ccomp',
        explanation: 'Conjugated verb placed at the very end of the subordinate clause.',
      },
    ],
  },
  {
    id: 'de-tree-two-way-prepositions',
    languageId: 'de',
    fullSentence: 'Er stellt die Flasche auf den Tisch.',
    translation: 'He places the bottle onto the table.',
    cefrLevel: 'B1',
    radarHighlights: {
      governanceRule: 'Wechselpräpositionen: Akkusativ bei Richtungsbewegung (Wohin?)',
      linguisticMechanism:
        'The dynamic verb "stellen" expresses motion towards a destination, governing the Accusative case ("den Tisch") with "auf".',
      trapToAvoid: 'Do not use Dative ("dem Tisch") for directional movement into a place.',
    },
    rootNode: {
      id: 'de-prep-stellt',
      token: 'stellt',
      lemma: 'stellen',
      role: 'ROOT',
      relation: 'root',
      explanation: 'Transitive causative verb of motion requiring an accusative object and directional destination.',
    },
    allNodes: [
      {
        id: 'de-prep-er',
        token: 'Er',
        lemma: 'er',
        role: 'SUBJECT',
        caseGovernance: 'NOMINATIVE',
        parentId: 'de-prep-stellt',
        relation: 'nsubj',
        explanation: 'Agent subject in Nominative.',
      },
      {
        id: 'de-prep-stellt',
        token: 'stellt',
        lemma: 'stellen',
        role: 'ROOT',
        relation: 'root',
        explanation: 'Causative verb (to put upright).',
      },
      {
        id: 'de-prep-die-flasche',
        token: 'die Flasche',
        lemma: 'Flasche',
        role: 'DIRECT_OBJECT',
        caseGovernance: 'ACCUSATIVE',
        parentId: 'de-prep-stellt',
        relation: 'obj',
        explanation: 'Direct object undergoing movement, governed by Accusative.',
      },
      {
        id: 'de-prep-auf-den-tisch',
        token: 'auf den Tisch',
        lemma: 'auf der Tisch',
        role: 'PREPOSITIONAL_OBJECT',
        caseGovernance: 'ACCUSATIVE',
        caseNote: 'Accusative masculine singular (den Tisch)',
        parentId: 'de-prep-stellt',
        relation: 'obl',
        explanation: 'Two-way preposition "auf" taking Accusative for directional movement (Wohin?).',
      },
    ],
  },

  // --- SPANISH (es) ---
  {
    id: 'es-tree-subjunctive-trigger',
    languageId: 'es',
    fullSentence: 'Me alegro de que vengas a la fiesta.',
    translation: 'I am glad that you are coming to the party.',
    cefrLevel: 'B1',
    radarHighlights: {
      governanceRule: 'Gobernanza del Modo Subjuntivo por emoción (WEIRDO: Emotion)',
      linguisticMechanism:
        'The main clause expresses emotional stance ("alegrarse de"), with a change of grammatical subject triggering the Subjunctive mood ("vengas").',
      trapToAvoid: 'Never use Indicative ("vienes") after an emotional trigger when the subject changes.',
    },
    rootNode: {
      id: 'es-sub-alegro',
      token: 'Me alegro',
      lemma: 'alegrarse',
      role: 'ROOT',
      relation: 'root',
      explanation: 'Pronominal emotive verb governing the subordinate subjunctive clause.',
    },
    allNodes: [
      {
        id: 'es-sub-alegro',
        token: 'Me alegro',
        lemma: 'alegrarse',
        role: 'ROOT',
        relation: 'root',
        explanation: 'Head verb expressing emotion.',
      },
      {
        id: 'es-sub-que',
        token: 'de que',
        lemma: 'de que',
        role: 'CONJUNCTION',
        parentId: 'es-sub-vengas',
        relation: 'mark',
        explanation: 'Compound complementizer linking main clause to subjunctive clause.',
      },
      {
        id: 'es-sub-vengas',
        token: 'vengas',
        lemma: 'venir',
        role: 'SUBORDINATE_CLAUSE',
        caseGovernance: 'SUBJUNCTIVE',
        caseNote: 'Present subjunctive of venir (tú)',
        parentId: 'es-sub-alegro',
        relation: 'ccomp',
        explanation: 'Subjunctive verb governed by emotional trigger with subject shift.',
      },
      {
        id: 'es-sub-fiesta',
        token: 'a la fiesta',
        lemma: 'a la fiesta',
        role: 'PREPOSITIONAL_OBJECT',
        parentId: 'es-sub-vengas',
        relation: 'obl',
        explanation: 'Directional complement of destination.',
      },
    ],
  },
  {
    id: 'es-tree-double-clitic',
    languageId: 'es',
    fullSentence: 'Ella se lo dio a su hermano.',
    translation: 'She gave it to her brother.',
    cefrLevel: 'A2',
    radarHighlights: {
      governanceRule: 'Regla del se espurio (sustitución de le por se ante lo/la)',
      linguisticMechanism:
        'When an indirect object pronoun (le) precedes a 3rd person direct clitic (lo), phonetic dissimilation replaces "le" with "se".',
      trapToAvoid: 'Never say *le lo dio; two consecutive /l/ clitics are ungrammatical in Spanish.',
    },
    rootNode: {
      id: 'es-clitic-dio',
      token: 'dio',
      lemma: 'dar',
      role: 'ROOT',
      relation: 'root',
      explanation: 'Transitive verb of transfer in preterite tense.',
    },
    allNodes: [
      {
        id: 'es-clitic-ella',
        token: 'Ella',
        lemma: 'ella',
        role: 'SUBJECT',
        caseGovernance: 'NOMINATIVE',
        parentId: 'es-clitic-dio',
        relation: 'nsubj',
        explanation: 'Overt subject pronoun for emphasis/clarity.',
      },
      {
        id: 'es-clitic-se',
        token: 'se',
        lemma: 'le',
        role: 'INDIRECT_OBJECT',
        caseGovernance: 'DATIVE',
        caseNote: 'Spurious "se" replacing indirect clitic "le" before "lo"',
        parentId: 'es-clitic-dio',
        relation: 'iobj',
        explanation: 'Phonetically shifted indirect object pronoun (to him/her).',
      },
      {
        id: 'es-clitic-lo',
        token: 'lo',
        lemma: 'lo',
        role: 'DIRECT_OBJECT',
        caseGovernance: 'ACCUSATIVE',
        caseNote: 'Direct object pronoun (masculine singular)',
        parentId: 'es-clitic-dio',
        relation: 'obj',
        explanation: 'Direct object clitic pronoun.',
      },
      {
        id: 'es-clitic-dio',
        token: 'dio',
        lemma: 'dar',
        role: 'ROOT',
        relation: 'root',
        explanation: 'Head verb in preterite.',
      },
      {
        id: 'es-clitic-a-su-hermano',
        token: 'a su hermano',
        lemma: 'hermano',
        role: 'INDIRECT_OBJECT',
        parentId: 'es-clitic-dio',
        relation: 'obl',
        explanation: 'Reduplicated full noun phrase indirect object.',
      },
    ],
  },
];

export function getDependencyTreesByLanguage(lang: LangCode): SentenceDependencyTree[] {
  return DEPENDENCY_TREES_CATALOG.filter((t) => t.languageId === lang);
}

export function getDependencyTreeById(id: string): SentenceDependencyTree | undefined {
  return DEPENDENCY_TREES_CATALOG.find((t) => t.id === id);
}

/**
 * Builds a Syntax Radar Challenge where one critical governance node is masked.
 */
export function buildSyntaxRadarChallenge(lang: LangCode): SyntaxNodeChallenge {
  const pool = getDependencyTreesByLanguage(lang);
  const tree = pool[Math.floor(Math.random() * pool.length)] ?? pool[0] ?? DEPENDENCY_TREES_CATALOG[0];

  // Pick a node with interesting role or case governance
  const eligibleNodes = tree.allNodes.filter(
    (n) => n.role !== 'ROOT' && (n.caseGovernance || ['DIRECT_OBJECT', 'SUBORDINATE_CLAUSE', 'INDIRECT_OBJECT'].includes(n.role))
  );

  const targetNode =
    eligibleNodes[Math.floor(Math.random() * eligibleNodes.length)] ??
    tree.allNodes[1] ??
    tree.allNodes[0];

  // Generate distractors
  const distractors: { token: string; role: SyntaxNodeType; isCorrect: boolean }[] = [];

  // Add realistic distractors
  if (targetNode.role === 'DIRECT_OBJECT') {
    distractors.push({ token: `${targetNode.token} [Subject]`, role: 'SUBJECT', isCorrect: false });
    distractors.push({ token: `${targetNode.token} [Indirect Object]`, role: 'INDIRECT_OBJECT', isCorrect: false });
  } else if (targetNode.role === 'SUBORDINATE_CLAUSE') {
    distractors.push({ token: `${targetNode.token} [Main Verb]`, role: 'ROOT', isCorrect: false });
    distractors.push({ token: `${targetNode.token} [Adverbial]`, role: 'ADVERBIAL', isCorrect: false });
  } else if (targetNode.role === 'PREPOSITIONAL_OBJECT') {
    distractors.push({ token: `${targetNode.token} [Direct Object]`, role: 'DIRECT_OBJECT', isCorrect: false });
    distractors.push({ token: `${targetNode.token} [Subject]`, role: 'SUBJECT', isCorrect: false });
  } else {
    distractors.push({ token: `${targetNode.token} [Direct Object]`, role: 'DIRECT_OBJECT', isCorrect: false });
    distractors.push({ token: `${targetNode.token} [Predicate]`, role: 'PREDICATE', isCorrect: false });
  }

  const options = [
    { token: targetNode.token, role: targetNode.role, isCorrect: true },
    ...distractors.slice(0, 2),
  ].sort(() => 0.5 - Math.random());

  return {
    id: `challenge-${tree.id}-${targetNode.id}`,
    tree,
    maskedNodeId: targetNode.id,
    targetRole: targetNode.role,
    targetToken: targetNode.token,
    options,
  };
}

/**
 * Evaluates the learner's syntax radar selection.
 */
export function evaluateSyntaxAnswer(
  challenge: SyntaxNodeChallenge,
  selectedToken: string
): { isCorrect: boolean; feedback: string; ruleExplanation: string; earnedXp: number } {
  const isCorrect = selectedToken === challenge.targetToken;
  const targetNode = challenge.tree.allNodes.find((n) => n.id === challenge.maskedNodeId);

  if (isCorrect) {
    return {
      isCorrect: true,
      feedback: `Structural Bullseye! "${challenge.targetToken}" functions as the ${challenge.targetRole.replace(/_/g, ' ')}.`,
      ruleExplanation: `${challenge.tree.radarHighlights.governanceRule}: ${challenge.tree.radarHighlights.linguisticMechanism}`,
      earnedXp: 25,
    };
  }

  return {
    isCorrect: false,
    feedback: `Syntactic slip! "${challenge.targetToken}" was expected as ${challenge.targetRole.replace(/_/g, ' ')}.`,
    ruleExplanation: `Notice: ${targetNode?.explanation ?? challenge.tree.radarHighlights.trapToAvoid}`,
    earnedXp: 5,
  };
}

/**
 * Flattens and orders nodes starting from subject, root, and complements for clean tree view.
 */
export function getTreeHierarchy(tree: SentenceDependencyTree): {
  root: DependencyNode;
  children: DependencyNode[];
} {
  const root = tree.rootNode;
  const children = tree.allNodes.filter((n) => n.id !== root.id);
  return { root, children };
}
