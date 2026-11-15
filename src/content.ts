import { Course } from './types';

export const courses: Course[] = [
  {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷',
    speechLang: 'fr-FR',
    lessons: [
      {
        id: 'fr-1',
        title: 'Salutations',
        subtitle: 'Your first conversations',
        level: 'A1 · Foundations',
        items: [
          { id: 'fr-1-1', target: 'Bonjour', en: 'Hello' },
          { id: 'fr-1-2', target: 'Bonsoir', en: 'Good evening' },
          { id: 'fr-1-3', target: 'Merci beaucoup', en: 'Thank you very much' },
          { id: 'fr-1-4', target: "S'il vous plaît", en: 'Please' },
          { id: 'fr-1-5', target: 'Au revoir', en: 'Goodbye' },
          { id: 'fr-1-6', target: 'Comment ça va ?', en: 'How are you?' },
        ],
      },
      {
        id: 'fr-2',
        title: 'Se présenter',
        subtitle: 'Introduce yourself with confidence',
        level: 'A1 · Introductions',
        items: [
          { id: 'fr-2-1', target: "Je m'appelle Ahmed", en: 'My name is Ahmed' },
          { id: 'fr-2-2', target: "J'habite en Égypte", en: 'I live in Egypt' },
          { id: 'fr-2-3', target: 'Je suis ingénieur', en: 'I am an engineer' },
          { id: 'fr-2-4', target: 'Je parle un peu français', en: 'I speak a little French' },
          { id: 'fr-2-5', target: 'Enchanté', en: 'Nice to meet you' },
          { id: 'fr-2-6', target: 'Je ne comprends pas', en: "I don't understand" },
        ],
      },
      {
        id: 'fr-3',
        title: 'Au café',
        subtitle: 'Order naturally in a café',
        level: 'A1 · Everyday life',
        items: [
          { id: 'fr-3-1', target: 'Un café, s’il vous plaît', en: 'A coffee, please' },
          { id: 'fr-3-2', target: "L'addition, s'il vous plaît", en: 'The bill, please' },
          { id: 'fr-3-3', target: 'Je voudrais de l’eau', en: 'I would like some water' },
          { id: 'fr-3-4', target: 'Combien ça coûte ?', en: 'How much does it cost?' },
          { id: 'fr-3-5', target: "C'est délicieux", en: "It's delicious" },
          { id: 'fr-3-6', target: 'Où sont les toilettes ?', en: 'Where is the restroom?' },
        ],
      },
    ],
  },
  {
    code: 'de',
    name: 'Deutsch',
    flag: '🇩🇪',
    speechLang: 'de-DE',
    lessons: [
      {
        id: 'de-1',
        title: 'Begrüßung',
        subtitle: 'Your first conversations',
        level: 'A1 · Foundations',
        items: [
          { id: 'de-1-1', target: 'Hallo', en: 'Hello' },
          { id: 'de-1-2', target: 'Guten Abend', en: 'Good evening' },
          { id: 'de-1-3', target: 'Vielen Dank', en: 'Thank you very much' },
          { id: 'de-1-4', target: 'Bitte', en: 'Please' },
          { id: 'de-1-5', target: 'Auf Wiedersehen', en: 'Goodbye' },
          { id: 'de-1-6', target: 'Wie geht es dir?', en: 'How are you?' },
        ],
      },
      {
        id: 'de-2',
        title: 'Sich vorstellen',
        subtitle: 'Introduce yourself with confidence',
        level: 'A1 · Introductions',
        items: [
          { id: 'de-2-1', target: 'Ich heiße Ahmed', en: 'My name is Ahmed' },
          { id: 'de-2-2', target: 'Ich wohne in Ägypten', en: 'I live in Egypt' },
          { id: 'de-2-3', target: 'Ich bin Ingenieur', en: 'I am an engineer' },
          { id: 'de-2-4', target: 'Ich spreche ein bisschen Deutsch', en: 'I speak a little German' },
          { id: 'de-2-5', target: 'Freut mich', en: 'Nice to meet you' },
          { id: 'de-2-6', target: 'Ich verstehe nicht', en: "I don't understand" },
        ],
      },
      {
        id: 'de-3',
        title: 'Im Café',
        subtitle: 'Order naturally in a café',
        level: 'A1 · Everyday life',
        items: [
          { id: 'de-3-1', target: 'Einen Kaffee, bitte', en: 'A coffee, please' },
          { id: 'de-3-2', target: 'Die Rechnung, bitte', en: 'The bill, please' },
          { id: 'de-3-3', target: 'Ich möchte Wasser', en: 'I would like some water' },
          { id: 'de-3-4', target: 'Wie viel kostet das?', en: 'How much does it cost?' },
          { id: 'de-3-5', target: 'Das ist lecker', en: "It's delicious" },
          { id: 'de-3-6', target: 'Wo ist die Toilette?', en: 'Where is the restroom?' },
        ],
      },
    ],
  },
];
