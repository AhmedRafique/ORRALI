import { LangCode } from '../types';
import { Mission, MissionCategory } from './types';

export const MISSIONS_CATALOG: Mission[] = [
  // -------------------------------------------------------------
  // 1. FRENCH TRAVEL: Le Bistro Parisien (Restaurant Ordering)
  // -------------------------------------------------------------
  {
    id: 'fr_mission_travel_04_restaurant',
    category: 'travel',
    number: 4,
    title: 'Le Bistro Parisien',
    subtitle: 'Order dinner, handle an unavailable dish, and settle the bill',
    context: 'A lively Parisian bistro on a Friday evening. The waiter approaches your table.',
    cefrLevel: 'A1',
    languageId: 'fr',
    requiredVocabulary: [
      { term: 'la carte', translation: 'the menu', phonetic: 'lah kart' },
      { term: "l'addition", translation: 'the bill / check', phonetic: 'lah-dee-syon' },
      { term: 'eau gazeuse', translation: 'sparkling water', phonetic: 'oh gah-zuhz' },
      { term: 'saumon', translation: 'salmon', phonetic: 'soh-mohn' },
      { term: 'poulet', translation: 'chicken', phonetic: 'poo-lay' },
    ],
    usefulExpressions: [
      { phrase: 'Je voudrais commander', translation: 'I would like to order', formality: 'polite' },
      { phrase: 'Est-ce que vous avez... ?', translation: 'Do you have... ?', formality: 'neutral' },
      { phrase: "L'addition, s'il vous plaît", translation: 'The bill, please', formality: 'polite' },
      { phrase: 'Puis-je payer par carte ?', translation: 'Can I pay by card ?', formality: 'polite' },
    ],
    prepExercises: [
      {
        question: 'How do you politely ask for the menu in French?',
        options: [
          'La carte, s’il vous plaît.',
          'Donne le menu.',
          'Je veux manger.',
          'Où est la nourriture ?',
        ],
        correctIndex: 0,
        explanation: '“La carte, s’il vous plaît” is the standard polite request in French restaurants.',
      },
      {
        question: 'Which phrase means “sparkling water”?',
        options: ['de l’eau plate', 'de l’eau gazeuse', 'du vin rouge', 'du café au lait'],
        correctIndex: 1,
        explanation: '“Eau gazeuse” or “eau pétillante” means sparkling water.',
      },
    ],
    listeningChallenge: {
      audioPrompt: 'Bonsoir ! Désolé, nous n’avons plus de saumon ce soir.',
      audioTranslation: 'Good evening! Sorry, we have no more salmon tonight.',
      question: 'What item is unavailable tonight according to the waiter?',
      options: ['Chicken', 'Salmon', 'Sparkling water', 'Bread'],
      correctIndex: 1,
    },
    dialogueTurns: [
      {
        id: 'turn_1',
        speaker: 'Serveur',
        speakerRole: 'npc',
        promptText: 'Bonsoir ! Vous avez choisi ou vous désirez un apéritif ?',
        promptTranslation: 'Good evening! Have you chosen or would you like an aperitif?',
        expectedIntent: 'Greet the waiter and ask for sparkling water or table water.',
        communicativeKeywords: ['bonsoir', 'bonjour', 'eau', 'gazeuse', 'bouteille'],
        validAlternatives: ['Bonsoir, une eau gazeuse s’il vous plaît', 'De l’eau s’il vous plaît'],
        hints: ['Bonsoir', 'Une eau gazeuse, s’il vous plaît'],
      },
      {
        id: 'turn_2',
        speaker: 'Serveur',
        speakerRole: 'npc',
        promptText: 'Parfait. Et comme plat principal pour vous ?',
        promptTranslation: 'Perfect. And as a main course for you?',
        expectedIntent: 'State what you would like to order (e.g. chicken or salmon).',
        communicativeKeywords: ['voudrais', 'prends', 'poulet', 'saumon', 'plat'],
        validAlternatives: ['Je voudrais le poulet, s’il vous plaît', 'Pour moi, le poulet'],
        hints: ['Je voudrais le poulet', 'Je prends le saumon'],
        branchingReply: {
          conditionKeywords: ['poulet'],
          replyText: 'Très bon choix, notre poulet rôti aux herbes est excellent !',
          replyEn: 'Very good choice, our roasted herb chicken is excellent!',
        },
      },
    ],
    unexpectedEvent: {
      title: 'Menu Shortage Curveball',
      situation: 'The waiter returns looking apologetic: the kitchen has just run out of the daily special.',
      npcStatement: 'Pardonnez-moi, le chef vient d’annoncer une rupture. Nous avons du bœuf ou du poisson grillé à la place.',
      npcStatementEn: 'Forgive me, the chef just announced a shortage. We have beef or grilled fish instead.',
      learnerObjective: 'Select an alternative dish politely without panicking.',
      requiredIntentKeywords: ['boeuf', 'poisson', 'prends', 'daccord', 'choisis'],
      acceptableAlternatives: [
        'Dans ce cas, je prends le poisson grillé, s’il vous plaît',
        'Je vais prendre le bœuf alors',
      ],
    },
    finalChallenge: {
      objective: 'Ask for the bill and check if payment by card is accepted.',
      prompt: 'Demandez l’addition et demandez si vous pouvez payer par carte bancaire.',
      promptEn: 'Ask for the check and ask if you can pay by credit card.',
      solutionKeywords: ['addition', 'carte', 'payer', 'combien'],
    },
  },

  // -------------------------------------------------------------
  // 2. GERMAN TRAVEL: Hauptbahnhof Fahrkarten (Train Tickets)
  // -------------------------------------------------------------
  {
    id: 'de_mission_travel_01_train',
    category: 'travel',
    number: 1,
    title: 'Hauptbahnhof Fahrkarten',
    subtitle: 'Buy a high-speed train ticket and handle a platform change',
    context: 'At the Munich central train station service counter. You need a ticket to Berlin.',
    cefrLevel: 'A1',
    languageId: 'de',
    requiredVocabulary: [
      { term: 'die Fahrkarte', translation: 'the ticket', phonetic: 'dee far-kar-teh' },
      { term: 'einfach', translation: 'one-way', phonetic: 'ine-fakh' },
      { term: 'hin und zurück', translation: 'round trip', phonetic: 'hin oond tsoo-rook' },
      { term: 'das Gleis', translation: 'the platform / track', phonetic: 'dahs glyce' },
      { term: 'die Verspätung', translation: 'the delay', phonetic: 'dee fer-shpay-toong' },
    ],
    usefulExpressions: [
      { phrase: 'Ich möchte eine Fahrkarte nach...', translation: 'I would like a ticket to...', formality: 'polite' },
      { phrase: 'Wann fährt der nächste Zug ?', translation: 'When does the next train leave ?', formality: 'neutral' },
      { phrase: 'Muss ich umsteigen ?', translation: 'Do I have to change trains ?', formality: 'neutral' },
    ],
    prepExercises: [
      {
        question: 'Which word means a “one-way” ticket in German?',
        options: ['hin und zurück', 'einfach', 'schnell', 'Gleis'],
        correctIndex: 1,
        explanation: '“Einfach” means one-way; “hin und zurück” means round trip.',
      },
    ],
    listeningChallenge: {
      audioPrompt: 'Achtung: Der ICE nach Berlin fährt heute von Gleis 7 ab.',
      audioTranslation: 'Attention: The ICE to Berlin departs today from platform 7.',
      question: 'Which platform is the train departing from?',
      options: ['Platform 3', 'Platform 5', 'Platform 7', 'Platform 11'],
      correctIndex: 2,
    },
    dialogueTurns: [
      {
        id: 'de_turn_1',
        speaker: 'Bahnbeamter',
        speakerRole: 'npc',
        promptText: 'Guten Tag ! Wie kann ich Ihnen helfen ?',
        promptTranslation: 'Good day! How can I help you?',
        expectedIntent: 'State that you want a ticket to Berlin.',
        communicativeKeywords: ['fahrkarte', 'berlin', 'mochte', 'ticket', 'zug'],
        validAlternatives: ['Ich möchte eine Fahrkarte nach Berlin, bitte', 'Ein Ticket nach Berlin'],
        hints: ['Eine Fahrkarte nach Berlin, bitte', 'Guten Tag, ich möchte nach Berlin fahren'],
      },
      {
        id: 'de_turn_2',
        speaker: 'Bahnbeamter',
        speakerRole: 'npc',
        promptText: 'Gerne. Einfach oder hin und zurück ?',
        promptTranslation: 'Gladly. One-way or round trip?',
        expectedIntent: 'Specify one-way or round trip.',
        communicativeKeywords: ['einfach', 'zuruck', 'hin'],
        validAlternatives: ['Einfach, bitte', 'Hin und zurück, bitte'],
        hints: ['Einfach, bitte', 'Hin und zurück'],
      },
    ],
    unexpectedEvent: {
      title: 'Platform Delay Curveball',
      situation: 'The agent notifies you of a 20-minute delay and asks if you still want this train.',
      npcStatement: 'Der nächste Zug hat leider 20 Minuten Verspätung. Möchten Sie trotzdem diesen Zug oder den späteren um 14 Uhr ?',
      npcStatementEn: 'The next train unfortunately has a 20-minute delay. Would you still like this train or the later one at 2 PM?',
      learnerObjective: 'Confirm your choice between the delayed train or later one.',
      requiredIntentKeywords: ['diesen', 'spateren', 'uhr', 'nehme', 'trotzdem', 'bitte'],
      acceptableAlternatives: ['Ich nehme trotzdem diesen Zug, bitte', 'Lieber den späteren um 14 Uhr'],
    },
    finalChallenge: {
      objective: 'Ask which track the train departs from and pay for your ticket.',
      prompt: 'Fragen Sie nach dem Gleis und bezahlen Sie mit Karte.',
      promptEn: 'Ask which track it departs from and pay with card.',
      solutionKeywords: ['gleis', 'karte', 'zahlen', 'abfahrt'],
    },
  },

  // -------------------------------------------------------------
  // 3. SPANISH TRAVEL: Registro en el Hotel (Hotel Check-In)
  // -------------------------------------------------------------
  {
    id: 'es_mission_travel_03_hotel',
    category: 'travel',
    number: 3,
    title: 'Registro en el Hotel',
    subtitle: 'Check into your hotel, request a quiet room, and ask for the Wi-Fi key',
    context: 'At the reception desk of a boutique hotel in Madrid.',
    cefrLevel: 'A1',
    languageId: 'es',
    requiredVocabulary: [
      { term: 'la reserva', translation: 'the reservation', phonetic: 'lah reh-sehr-bah' },
      { term: 'la habitación', translation: 'the room', phonetic: 'lah ah-bee-tah-syon' },
      { term: 'la llave', translation: 'the key', phonetic: 'lah yah-beh' },
      { term: 'el desayuno', translation: 'the breakfast', phonetic: 'ehl deh-sah-yoo-noh' },
    ],
    usefulExpressions: [
      { phrase: 'Tengo una reserva a nombre de...', translation: 'I have a reservation under the name of...', formality: 'polite' },
      { phrase: '¿A qué hora es el desayuno ?', translation: 'What time is breakfast ?', formality: 'neutral' },
      { phrase: '¿Cuál es la contraseña del wifi ?', translation: 'What is the Wi-Fi password ?', formality: 'neutral' },
    ],
    prepExercises: [
      {
        question: 'How do you say “I have a reservation” in Spanish?',
        options: ['Tengo una reserva', 'Quiero una mesa', 'Dónde está el tren', 'Hasta luego'],
        correctIndex: 0,
        explanation: '“Tengo una reserva” means “I have a reservation”.',
      },
    ],
    listeningChallenge: {
      audioPrompt: 'El desayuno se sirve en la terraza de siete a diez de la mañana.',
      audioTranslation: 'Breakfast is served on the terrace from seven to ten in the morning.',
      question: 'Until what time is breakfast served?',
      options: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM'],
      correctIndex: 2,
    },
    dialogueTurns: [
      {
        id: 'es_turn_1',
        speaker: 'Recepcionista',
        speakerRole: 'npc',
        promptText: '¡Buenas tardes ! Bienvenido al hotel. ¿En qué le puedo ayudar ?',
        promptTranslation: 'Good afternoon! Welcome to the hotel. How can I help you?',
        expectedIntent: 'State that you have a reservation.',
        communicativeKeywords: ['reserva', 'nombre', 'tengo', 'habitacion'],
        validAlternatives: ['Buenas tardes, tengo una reserva', 'Tengo una reserva a mi nombre'],
        hints: ['Buenas tardes, tengo una reserva', 'Tengo una habitación reservada'],
      },
      {
        id: 'es_turn_2',
        speaker: 'Recepcionista',
        speakerRole: 'npc',
        promptText: 'Excelente. ¿Tiene alguna preferencia para su estancia ?',
        promptTranslation: 'Excellent. Do you have any preference for your stay?',
        expectedIntent: 'Request a quiet room or a high floor.',
        communicativeKeywords: ['tranquila', 'silenciosa', 'piso', 'alta', 'cama', 'vista'],
        validAlternatives: ['Una habitación tranquila, por favor', 'En un piso alto si es posible'],
        hints: ['Una habitación tranquila, por favor', 'Con buena vista'],
      },
    ],
    unexpectedEvent: {
      title: 'Elevator Maintenance Curveball',
      situation: 'The receptionist warns that the main elevator is being serviced and offers luggage assistance.',
      npcStatement: 'El ascensor principal está en mantenimiento hasta las seis. ¿Desea que el botones le suba las maletas ?',
      npcStatementEn: 'The main elevator is undergoing maintenance until 6. Would you like the bellhop to carry your luggage up?',
      learnerObjective: 'Accept luggage assistance or confirm you will take the stairs.',
      requiredIntentKeywords: ['si', 'gracias', 'botones', 'maletas', 'escaleras', 'favor'],
      acceptableAlternatives: ['Sí, por favor, muchas gracias', 'No se preocupe, subo por la escalera'],
    },
    finalChallenge: {
      objective: 'Ask for the room key and the Wi-Fi password.',
      prompt: 'Pida la llave de la habitación y la contraseña del wifi.',
      promptEn: 'Ask for the room key and the Wi-Fi password.',
      solutionKeywords: ['llave', 'wifi', 'contrasena', 'clave'],
    },
  },

  // -------------------------------------------------------------
  // 4. FRENCH PROFESSIONAL: Réunion de Projet (Project Meeting)
  // -------------------------------------------------------------
  {
    id: 'fr_mission_prof_24_project',
    category: 'professional',
    number: 24,
    title: 'Point d’Avancement du Projet',
    subtitle: 'Give a concise status update, report a technical hurdle, and agree on next steps',
    context: 'A hybrid project stand-up meeting with your engineering colleagues in Lyon.',
    cefrLevel: 'B1',
    languageId: 'fr',
    requiredVocabulary: [
      { term: "l'avancement", translation: 'the progress / status', phonetic: 'lah-vahn-smahn' },
      { term: 'le blocage', translation: 'the roadblock / blocker', phonetic: 'luh bloh-kahzh' },
      { term: 'le délai', translation: 'the deadline', phonetic: 'luh day-lay' },
      { term: 'livrer', translation: 'to deliver / release', phonetic: 'lee-vray' },
    ],
    usefulExpressions: [
      { phrase: 'Nous sommes dans les temps', translation: 'We are on schedule', formality: 'formal' },
      { phrase: 'Nous rencontrons une difficulté', translation: 'We are encountering a difficulty', formality: 'formal' },
      { phrase: 'Je propose de planifier...', translation: 'I propose scheduling...', formality: 'formal' },
    ],
    prepExercises: [
      {
        question: 'Which phrase means “we are on schedule” in French business meetings?',
        options: ['Nous sommes en retard', 'Nous sommes dans les temps', 'Le projet est fini', 'Pas de problème'],
        correctIndex: 1,
        explanation: '“Nous sommes dans les temps” indicates being on schedule.',
      },
    ],
    listeningChallenge: {
      audioPrompt: 'Pour la prochaine étape, nous devons valider les tests avant jeudi midi.',
      audioTranslation: 'For the next step, we must validate tests before Thursday noon.',
      question: 'When must the tests be validated?',
      options: ['Tuesday evening', 'Wednesday morning', 'Thursday noon', 'Friday 5 PM'],
      correctIndex: 2,
    },
    dialogueTurns: [
      {
        id: 'fr_prof_turn_1',
        speaker: 'Chef de Projet',
        speakerRole: 'npc',
        promptText: 'Bonjour à tous. Pouvez-vous nous donner un résumé de l’avancement de votre tâche ?',
        promptTranslation: 'Hello everyone. Can you give us a summary of your task’s progress?',
        expectedIntent: 'Report that the initial phase is completed or on schedule.',
        communicativeKeywords: ['termine', 'fini', 'temps', 'progres', 'avance', 'etape'],
        validAlternatives: ['La première étape est terminée et nous sommes dans les temps', 'Nous avançons bien'],
        hints: ['Nous sommes dans les temps', 'La première phase est terminée'],
      },
    ],
    unexpectedEvent: {
      title: 'API Integration Delay Curveball',
      situation: 'A teammate announces that the third-party service is responding slowly, threatening the release.',
      npcStatement: 'Attention : le fournisseur a du retard sur l’API. Doit-on reporter la livraison ou déployer une version allégée ?',
      npcStatementEn: 'Attention: the provider is delayed on the API. Should we postpone delivery or deploy a lightweight version?',
      learnerObjective: 'Propose a pragmatic solution (e.g. mock the API or deploy the lightweight version).',
      requiredIntentKeywords: ['version', 'propose', 'reporter', 'developper', 'mock', 'solution', 'allegee'],
      acceptableAlternatives: ['Je propose de déployer la version allégée pour respecter le délai', 'On peut reporter'],
    },
    finalChallenge: {
      objective: 'Summarize the agreed action item and confirm the next meeting date.',
      prompt: 'Confirmez le plan d’action et la date de la prochaine réunion.',
      promptEn: 'Confirm the action plan and the date of the next meeting.',
      solutionKeywords: ['reunion', 'action', 'prochaine', 'jeudi', 'confirme'],
    },
  },
];

export function getMissionsByLanguage(languageId: LangCode): Mission[] {
  return MISSIONS_CATALOG.filter((m) => m.languageId === languageId);
}

export function getMissionById(id: string): Mission | undefined {
  return MISSIONS_CATALOG.find((m) => m.id === id);
}

export function getMissionsByCategory(languageId: LangCode, category: MissionCategory): Mission[] {
  return MISSIONS_CATALOG.filter((m) => m.languageId === languageId && m.category === category);
}
