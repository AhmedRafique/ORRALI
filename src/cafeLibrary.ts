import { breakdownSentence, WordAnatomy } from './anatomy';
import { LangCode } from './types';

export interface CafeQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface CafeStory {
  id: string;
  courseCode: LangCode;
  title: string;
  titleEn: string;
  readTimeMin: number;
  culturalTheme: string;
  paragraphs: string[];
  questions: CafeQuizQuestion[];
}

export const CAFE_STORIES: CafeStory[] = [
  {
    id: 'cafe-fr-marais',
    courseCode: 'fr',
    title: 'Un Après-midi dans le Marais',
    titleEn: 'An Afternoon in Le Marais',
    readTimeMin: 3,
    culturalTheme: 'Parisian Café Culture & Architecture',
    paragraphs: [
      'Le soleil brille doucement sur les pavés historiques du Marais. À chaque coin de rue, les terrasses des cafés se remplissent d’arômes de café frais et de croissants croustillants.',
      'Dans une petite cour ombragée, un vieux serveur salue chaleureusement ses habitués. Ici, le temps ralentit : lire un bon livre en buvant un expresso est un véritable art de vivre.',
    ],
    questions: [
      {
        question: 'Où se déroule cette histoire ?',
        options: ['À la Tour Eiffel', 'Dans le quartier du Marais', 'Sur la Côte d’Azur', 'À Lyon'],
        correctIndex: 1,
      },
      {
        question: 'Quel est l’art de vivre décrit dans le texte ?',
        options: ['Courir pour attraper le métro', 'Prendre le temps de lire au café', 'Acheter des souvenirs', 'Travailler tard'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'cafe-de-englischer-garten',
    courseCode: 'de',
    title: 'Ein Spaziergang durch den Englischen Garten',
    titleEn: 'A Walk Through the English Garden',
    readTimeMin: 3,
    culturalTheme: 'Munich Green Spaces & Biergarten Traditions',
    paragraphs: [
      'Der Englische Garten in München ist eine grüne Oase mitten in der Stadt. Entlang des schattigen Bachs spazieren Freunde, und am Eisbach bewundern Touristen die mutigen Surfer auf den kalten Wellen.',
      'Unter den großen Kastanienbäumen des Biergartens am Chinesischen Turm treffen sich Menschen bei Brezeln und frischer Musik. Es ist das perfekte Gefühl von bayerischer Gemütlichkeit.',
    ],
    questions: [
      {
        question: 'Was machen Surfer am Eisbach ?',
        options: ['Sie trinken Kaffee', 'Sie surfen auf kalten Wellen', 'Sie spielen Fußball', 'Sie kaufen Brot'],
        correctIndex: 1,
      },
      {
        question: 'Wo treffen sich Menschen für Gemütlichkeit ?',
        options: ['Im Bahnhof', 'Am Chinesischen Turm im Biergarten', 'In der U-Bahn', 'Im Büro'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'cafe-es-la-latina',
    courseCode: 'es',
    title: 'La Noche de Tapas en La Latina',
    titleEn: 'A Tapas Night in La Latina',
    readTimeMin: 3,
    culturalTheme: 'Madrid Evening Life & Tapas Crawls',
    paragraphs: [
      'Cuando cae la tarde en Madrid, el barrio histórico de La Latina se despierta con risas y música alegre. Las estrechas calles empedradas se llenan de amigos buscando las mejores tapas de la ciudad.',
      'En cada taberna tradicional se comparte una ración de tortilla española caliente, pan crujiente y aceitunas. "Tapear" no es solo comer, es una forma entrañable de compartir la vida con amigos.',
    ],
    questions: [
      {
        question: '¿Qué barrio de Madrid se describe en la historia?',
        options: ['El Retiro', 'La Latina', 'Chamberí', 'Salamanca'],
        correctIndex: 1,
      },
      {
        question: '¿Qué significa "tapear" según el texto?',
        options: ['Comer rápido solo', 'Compartir comida y amistad', 'Ir de compras', 'Dormir la siesta'],
        correctIndex: 1,
      },
    ],
  },
];

export function getCafeStoriesByLanguage(lang: LangCode): CafeStory[] {
  return CAFE_STORIES.filter((s) => s.courseCode === lang);
}

export function tokenizeStoryParagraph(paragraph: string, lang: LangCode): WordAnatomy[] {
  return breakdownSentence(paragraph, lang);
}

export function evaluateCafeComprehension(
  story: CafeStory,
  userAnswers: number[]
): { isPassed: boolean; earnedXp: number } {
  if (userAnswers.length !== story.questions.length) {
    return { isPassed: false, earnedXp: 0 };
  }

  const allCorrect = story.questions.every(
    (q, idx) => userAnswers[idx] === q.correctIndex
  );

  return {
    isPassed: allCorrect,
    earnedXp: allCorrect ? 20 : 0,
  };
}
