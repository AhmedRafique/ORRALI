import { CEFRLevel, LangCode } from '../types';
import { norm } from '../exercises';
import { getTemplatesByLanguage } from './templates';
import {
  GeneratedMatrixSentence,
  GrammarPerson,
  GrammarSlotType,
  MatrixExercise,
  MatrixExerciseKind,
  MatrixSlotOption,
  MatrixTemplate,
  MorphologicalContext,
} from './types';

/**
 * Generates a grammatically sound sentence permutation from a matrix template.
 */
export function generateMatrixSentence(
  template: MatrixTemplate,
  slotSelections?: Partial<Record<GrammarSlotType, MatrixSlotOption>>
): GeneratedMatrixSentence {
  const selected: Partial<Record<GrammarSlotType, MatrixSlotOption>> = {};

  for (const slot of template.slots) {
    if (slotSelections && slotSelections[slot.type]) {
      selected[slot.type] = slotSelections[slot.type];
    } else {
      // Pick random option from template options
      const idx = Math.floor(Math.random() * slot.options.length);
      selected[slot.type] = slot.options[idx];
    }
  }

  // Derive morphological context from selected subject
  let person: GrammarPerson = '1s';
  const subText = (selected.subject?.text ?? '').toLowerCase();
  if (subText === 'tu' || subText === 'du' || subText === 'tú') person = '2s';
  else if (subText === 'il' || subText === 'elle' || subText === 'er' || subText === 'sie' || subText === 'él' || subText === 'ella' || subText === 'usted' || subText.startsWith('le ') || subText.startsWith('la ') || subText.startsWith('der ') || subText.startsWith('die ') || subText.startsWith('das ') || subText.startsWith('el ')) person = '3s';
  else if (subText === 'nous' || subText === 'wir' || subText === 'nosotros') person = '1p';
  else if (subText === 'vous' || subText === 'ihr' || subText === 'vosotros') person = '2p';
  else if (subText === 'ils' || subText === 'elles' || subText === 'sie (pl.)' || subText === 'ellos') person = '3p';

  const context: MorphologicalContext = {
    person,
    gender: selected.subject?.gender ?? 'm',
    number: person.endsWith('p') ? 'p' : 's',
    tense: template.defaultTense,
  };

  const { target, en, notes, alternatives = [] } = template.assembler(selected, context);

  const slotMap: Record<string, string> = {};
  for (const [k, v] of Object.entries(selected)) {
    if (v) slotMap[k] = v.text;
  }

  return {
    id: `mat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    templateId: template.id,
    languageId: template.languageId,
    level: template.level,
    target,
    en,
    slots: slotMap,
    grammarExplanation: notes,
    alternatives,
  };
}

/**
 * Builds an interactive Matrix Exercise (Substitution, Tense Flip, Case Governance).
 */
export function generateMatrixExercise(
  languageId: LangCode,
  level: CEFRLevel = 'A1',
  kind: MatrixExerciseKind = 'substitution'
): MatrixExercise {
  const templates = getTemplatesByLanguage(languageId).filter(
    (t) => t.level === level
  );
  const template = templates[0] ?? getTemplatesByLanguage(languageId)[0];

  const baseSentence = generateMatrixSentence(template);

  // For substitution drill: swap the subject
  const subjectSlot = template.slots.find((s) => s.type === 'subject');
  const targetSubject =
    subjectSlot?.options.find((o) => o.text !== baseSentence.slots.subject) ??
    subjectSlot?.options[0];

  const targetSentence = generateMatrixSentence(template, {
    subject: targetSubject,
  });

  return {
    id: `ex_mat_${Date.now()}`,
    kind,
    level: template.level,
    languageId,
    prompt: `Transform this sentence by changing the subject to "${targetSubject?.text ?? 'nous'}"`,
    instructions: `Maintain correct verb agreement and elisions for the new subject.`,
    baseSentence: baseSentence.target,
    baseEn: baseSentence.en,
    targetSolution: targetSentence.target,
    acceptableAlternatives: targetSentence.alternatives,
    grammarTip: targetSentence.grammarExplanation,
  };
}

/**
 * Evaluates learner's answer against target solution and acceptable grammatical variants.
 */
export function evaluateMatrixExercise(
  exercise: MatrixExercise,
  userResponse: string
): { isCorrect: boolean; feedback: string; earnedXp: number } {
  const userNorm = norm(userResponse);
  const targetNorm = norm(exercise.targetSolution);

  if (userNorm === targetNorm) {
    return {
      isCorrect: true,
      feedback: `Bravo ! Correct matrix transformation. ${exercise.grammarTip}`,
      earnedXp: 20,
    };
  }

  for (const alt of exercise.acceptableAlternatives) {
    if (userNorm === norm(alt)) {
      return {
        isCorrect: true,
        feedback: `Excellent ! Valid alternative agreement accepted. ${exercise.grammarTip}`,
        earnedXp: 20,
      };
    }
  }

  return {
    isCorrect: false,
    feedback: `Notice the agreement rule: expected "${exercise.targetSolution}". ${exercise.grammarTip}`,
    earnedXp: 5,
  };
}
