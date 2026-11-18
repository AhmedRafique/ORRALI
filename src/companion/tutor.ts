import { LangCode, TutorExplanation } from '../types';

export interface TutorKnowledgeEntry {
  keywords: string[];
  courseCode: LangCode;
  topic: string;
  childFriendlySummary: string;
  detailedExplanation: string;
  examples: { target: string; en: string }[];
  goldenRule: string;
}

export const TUTOR_KNOWLEDGE_BASE: TutorKnowledgeEntry[] = [
  // French Entries
  {
    courseCode: 'fr',
    keywords: ['tu', 'vous', 'formal', 'polite', 'informal', 'address', 'courtesy', 'plait', 'plaît'],
    topic: 'Polite Address: Tu vs. Vous',
    childFriendlySummary:
      'Think of "Vous" as wearing a formal suit for respect, and "Tu" as wearing your cozy pajamas around friends!',
    detailedExplanation:
      'Use "Vous" with shopkeepers, elders, waiters, and people you meet for the first time. Use "Tu" with children, family members, and close friends. That is why we say "S’il vous plaît" in a restaurant, but "S’il te plaît" to a friend.',
    examples: [
      { target: "S'il vous plaît", en: 'Please (polite/formal)' },
      { target: "S'il te plaît", en: 'Please (friendly/informal)' },
      { target: 'Comment allez-vous ?', en: 'How are you? (formal)' },
      { target: 'Comment vas-tu ?', en: 'How are you? (friendly)' },
    ],
    goldenRule: 'When in doubt, always use "Vous" — French speakers will appreciate your politeness!',
  },
  {
    courseCode: 'fr',
    keywords: ['un', 'une', 'gender', 'masculine', 'feminine', 'articles', 'le', 'la'],
    topic: 'French Genders: Un vs. Une',
    childFriendlySummary:
      'In French, every noun belongs to a team: the "Un" team (boys) or the "Une" team (girls)!',
    detailedExplanation:
      '"Un" is used for masculine words (un café, un croissant, un ami), and "Une" is used for feminine words (une table, une pomme, une amie). Words ending in -tion, -ée, or -ette are almost always feminine.',
    examples: [
      { target: 'Un café', en: 'A coffee (masculine)' },
      { target: 'Une table', en: 'A table (feminine)' },
      { target: 'La gare', en: 'The train station (feminine)' },
      { target: 'Le métro', en: 'The subway (masculine)' },
    ],
    goldenRule: 'Always learn new French words together with "un" or "une" so gender becomes second nature.',
  },
  {
    courseCode: 'fr',
    keywords: ['voudrais', 'veux', 'order', 'cafe', 'café', 'water', 'please', 'polite'],
    topic: 'Ordering Like a Local: Je voudrais',
    childFriendlySummary:
      'Saying "Je veux" is like a demanding shout. "Je voudrais" is a warm, polite smile!',
    detailedExplanation:
      'In French cafés and bakeries, never say "Je veux" (I want). Always use "Je voudrais" (I would like) followed by your order, and finish with "s’il vous plaît".',
    examples: [
      { target: "Je voudrais un café, s'il vous plaît", en: 'I would like a coffee, please' },
      { target: "Je voudrais de l'eau", en: 'I would like some water' },
      { target: "L'addition, s'il vous plaît", en: 'The bill, please' },
    ],
    goldenRule: 'Master "Je voudrais..." and you will always receive warm service in France.',
  },
  {
    courseCode: 'fr',
    keywords: ['metier', 'profession', 'job', 'engineer', 'ingenieur', 'ingénieur', 'suis'],
    topic: 'Professions without Articles',
    childFriendlySummary:
      'In French, your job is part of who you are, so you drop the word "a" or "an"!',
    detailedExplanation:
      'Unlike English ("I am an engineer"), French drops the article after the verb être: "Je suis ingénieur", "Je suis médecin". Only add "un/une" if you describe yourself with an adjective ("Je suis un bon ingénieur").',
    examples: [
      { target: 'Je suis ingénieur', en: 'I am an engineer' },
      { target: 'Je suis professeur', en: 'I am a teacher' },
      { target: 'Je suis médecin', en: 'I am a doctor' },
    ],
    goldenRule: 'After "Je suis", jump straight to your profession without "un" or "une".',
  },
  {
    courseCode: 'fr',
    keywords: ['mal', 'tete', 'tête', 'pain', 'sick', 'doctor', 'hurt', 'pharmacy'],
    topic: 'Expressing Pain: Avoir mal à...',
    childFriendlySummary:
      'To say where it hurts, French says "I have hurt at the..." instead of "my head hurts"!',
    detailedExplanation:
      'Use "J’ai mal à..." followed by the body part. Remember: à + le becomes "au" (J’ai mal au ventre), and à + la stays "à la" (J’ai mal à la tête).',
    examples: [
      { target: "J'ai mal à la tête", en: 'I have a headache' },
      { target: "J'ai mal au ventre", en: 'I have a stomach ache' },
    ],
    goldenRule: 'Formula: "J’ai mal" + à la / au / aux + body part.',
  },

  // German Entries
  {
    courseCode: 'de',
    keywords: ['du', 'sie', 'formal', 'polite', 'informal', 'address', 'courtesy'],
    topic: 'German Courtesy: Du vs. Sie',
    childFriendlySummary:
      '"Sie" with a capital S is for respect, while "du" is for your buddies and family.',
    detailedExplanation:
      'Always use "Sie" with adults you do not know well, in shops, at the doctor, and at work. Use "du" with children, pets, close friends, and relatives.',
    examples: [
      { target: 'Wie heißen Sie?', en: 'What is your name? (formal)' },
      { target: 'Wie heißt du?', en: 'What is your name? (informal)' },
      { target: 'Können Sie mir helfen?', en: 'Can you help me? (formal)' },
    ],
    goldenRule: 'Capitalize "Sie" in writing to distinguish it from "sie" (she/they).',
  },
  {
    courseCode: 'de',
    keywords: ['der', 'die', 'das', 'gender', 'articles', 'masculine', 'feminine', 'neuter'],
    topic: 'The Three Genders: Der, Die, Das',
    childFriendlySummary:
      'German has three noun families: blue (der/masculine), red (die/feminine), and green (das/neuter)!',
    detailedExplanation:
      'Unlike English, every German noun has a gender: der Schlüssel (masculine), die Rechnung (feminine), das Zimmer (neuter). All nouns must always be capitalized in German!',
    examples: [
      { target: 'Der Bahnhof', en: 'The train station (masculine)' },
      { target: 'Die Apotheke', en: 'The pharmacy (feminine)' },
      { target: 'Das Wasser', en: 'The water (neuter)' },
    ],
    goldenRule: 'Never learn a German noun alone; always memorize it with its article (der/die/das).',
  },
  {
    courseCode: 'de',
    keywords: ['kaffee', 'einen', 'akkusativ', 'accusative', 'case', 'order', 'ein', 'eine'],
    topic: 'The Accusative Mystery: Einen Kaffee',
    childFriendlySummary:
      'When a masculine noun becomes the object you are ordering, "der" turns into "den" and "ein" turns into "einen"!',
    detailedExplanation:
      '"Kaffee" is masculine (der Kaffee). When you order one, it receives the action of your order: "Ich möchte einen Kaffee, bitte!". Neuter (ein Wasser) and feminine (eine Suppe) stay unchanged.',
    examples: [
      { target: 'Einen Kaffee, bitte', en: 'A coffee, please (masculine accusative)' },
      { target: 'Ein Wasser, bitte', en: 'A water, please (neuter stays ein)' },
      { target: 'Eine Rechnung, bitte', en: 'A bill, please (feminine stays eine)' },
    ],
    goldenRule: 'Only masculine nouns change their article in the accusative case (der -> den, ein -> einen).',
  },
  {
    courseCode: 'de',
    keywords: ['uhr', 'uhrzeit', 'time', 'spät', 'spat', 'wieviel'],
    topic: 'Telling Time: Es ist... Uhr',
    childFriendlySummary:
      'In German, you sandwich the word "Uhr" (o’clock) right between the hour and the minutes!',
    detailedExplanation:
      'To say 8:00, say "Es ist acht Uhr". To say 8:15, say "Es ist acht Uhr fünfzehn". Remember that "Uhr" means the clock or o’clock, while "Stunde" is a duration of 60 minutes.',
    examples: [
      { target: 'Wie spät ist es?', en: 'What time is it?' },
      { target: 'Es ist acht Uhr', en: "It is eight o'clock" },
      { target: 'Um zehn Uhr fünfzehn', en: 'At ten fifteen' },
    ],
    goldenRule: '"Wie spät ist es?" literally means "How late is it?".',
  },
  {
    courseCode: 'de',
    keywords: ['color', 'farbe', 'gender', 'geschlecht', 'chromatic', 'blau', 'rot', 'grün'],
    topic: 'Visual Chromatic Gender: Cobalt Blue, Rose Crimson & Sage Emerald',
    childFriendlySummary:
      'ORRALI uses smart colors so you never have to memorize der/die/das lists: Blue is Masculine, Rose is Feminine, and Green is Neuter!',
    detailedExplanation:
      'Whenever you see word tiles, anatomy pills, or lexicon cards: Cobalt Blue = Der (Masculine), Rose Crimson = Die (Feminine), and Sage Emerald = Das (Neuter). Your visual memory anchors the gender effortlessly!',
    examples: [
      { target: 'der Kaffee', en: 'The coffee (Cobalt Blue -> Masculine)' },
      { target: 'die Fahrkarte', en: 'The ticket (Rose Crimson -> Feminine)' },
      { target: 'das Museum', en: 'The museum (Sage Emerald -> Neuter)' },
    ],
    goldenRule: 'Blue for der, Rose for die, Sage Green for das.',
  },
  {
    courseCode: 'fr',
    keywords: ['color', 'couleur', 'gender', 'genre', 'chromatic', 'bleu', 'rose', 'masculin', 'féminin'],
    topic: 'Visual Chromatic Gender: Cobalt Blue & Rose Crimson',
    childFriendlySummary:
      'ORRALI color-codes nouns and articles: Cobalt Blue for masculine (le/un) and Rose Crimson for feminine (la/une)!',
    detailedExplanation:
      'Look at the subtle colored dots on word tiles and lexicon cards: Cobalt Blue words are Masculine, and Rose Crimson words are Feminine. Your eyes learn agreements naturally!',
    examples: [
      { target: 'le café / un croissant', en: 'The coffee / a croissant (Cobalt Blue -> Masculine)' },
      { target: 'la gare / une chambre', en: 'The station / a room (Rose Crimson -> Feminine)' },
    ],
    goldenRule: 'Cobalt Blue is Le/Un (Masc); Rose Crimson is La/Une (Fem).',
  },
  {
    courseCode: 'es',
    keywords: ['color', 'genero', 'género', 'chromatic', 'azul', 'rosa', 'masculino', 'femenino'],
    topic: 'Visual Chromatic Gender: Cobalt Blue & Rose Crimson',
    childFriendlySummary:
      'ORRALI color-codes Spanish nouns: Cobalt Blue for masculine (el/un) and Rose Crimson for feminine (la/una)!',
    detailedExplanation:
      'In Spanish word tiles, anatomy pills, and flashcards: Cobalt Blue words are Masculine, and Rose Crimson words are Feminine. You will instinctively match "el" or "la" without second-guessing!',
    examples: [
      { target: 'el museo / un café', en: 'The museum / a coffee (Cobalt Blue -> Masculine)' },
      { target: 'la tortilla / una cuenta', en: 'The tortilla / a bill (Rose Crimson -> Feminine)' },
    ],
    goldenRule: 'Cobalt Blue is El/Un (Masc); Rose Crimson is La/Una (Fem).',
  },
  {
    courseCode: 'es',
    keywords: ['ser', 'estar', 'diferencia', 'cuando', 'estoy', 'soy'],
    topic: 'Ser vs. Estar: Permanent Traits vs. Location & States',
    childFriendlySummary:
      'Use "ser" for who you are and permanent qualities; use "estar" for where you are and temporary moods!',
    detailedExplanation:
      'Think of SER for identity and origins: "Soy Carlos", "Es inteligente". Think of ESTAR for location and states: "Estoy cansado", "El hotel está cerca".',
    examples: [
      { target: 'Soy estudiante', en: 'I am a student (identity -> ser)' },
      { target: 'Estoy en Madrid', en: 'I am in Madrid (location -> estar)' },
    ],
    goldenRule: 'DOCTOR uses SER (Description, Origin, Characteristic); PLACE uses ESTAR (Position, Location, Condition).',
  },
  {
    courseCode: 'es',
    keywords: ['gustar', 'gusta', 'gustan', 'encantar', 'encanta', 'me'],
    topic: 'How to use "Gustar" & "Encantar"',
    childFriendlySummary:
      'In Spanish, you don’t like things — things please you! So the ending depends on the thing you like.',
    detailedExplanation:
      'Say "Me gusta el café" (One thing pleases me). For plural items, say "Me gustan las tapas" (Plural items please me). Never say "Yo gusto".',
    examples: [
      { target: 'Me gusta la música', en: 'I like music (singular -> gusta)' },
      { target: 'Me gustan las tapas', en: 'I like tapas (plural -> gustan)' },
    ],
    goldenRule: 'Singular item = "gusta", plural items = "gustan".',
  },
  {
    courseCode: 'es',
    keywords: ['por', 'para', 'diferencia', 'motivo', 'destino'],
    topic: 'Por vs. Para: Reason vs. Destination',
    childFriendlySummary:
      '"Para" looks forward to your goal or recipient. "Por" looks backward to the cause or exchange!',
    detailedExplanation:
      'Use "para" for goals, destinations, and deadlines ("Para mañana", "Para ti"). Use "por" for causes, exchanges, and gratitude ("Por favor", "Gracias por la ayuda").',
    examples: [
      { target: 'Este regalo es para ti', en: 'This gift is for you (recipient -> para)' },
      { target: 'Gracias por tu ayuda', en: 'Thank you for your help (cause -> por)' },
    ],
    goldenRule: 'PARA points toward the goal; POR explains the reason why.',
  },
  {
    courseCode: 'es',
    keywords: ['pasado', 'ayer', 'preterito', 'pretérito', 'viaje', 'visite'],
    topic: 'The Past: Pretérito Indefinido',
    childFriendlySummary:
      'Use the pretérito to talk about actions that finished in the past, like yesterday’s adventures!',
    detailedExplanation:
      'For regular -ar verbs, use endings: -é, -aste, -ó ("viajé"). For -er/-ir verbs, use: -í, -iste, -ió ("aprendí"). Time markers like "ayer" and "el año pasado" signal this past tense.',
    examples: [
      { target: 'Ayer viajé a Madrid', en: 'Yesterday I traveled to Madrid' },
      { target: 'Aprendí mucho', en: 'I learned a lot' },
    ],
    goldenRule: 'Actions finished at a specific point in the past use the Pretérito Indefinido.',
  },
  {
    courseCode: 'es',
    keywords: ['subjuntivo', 'ojala', 'ojalá', 'deseo', 'duda', 'espero'],
    topic: 'When to use the Subjunctive (El Subjuntivo)',
    childFriendlySummary:
      'The subjunctive is the mood of wishes, hopes, and doubts rather than plain facts!',
    detailedExplanation:
      'Whenever you express desires or uncertainty ("Espero que...", "Ojalá..."), Spanish switches to the subjunctive: "Espero que tengas un buen día", "Ojalá tengamos suerte".',
    examples: [
      { target: '¡Ojalá tengamos buen tiempo!', en: 'Hopefully we have good weather!' },
      { target: 'Es necesario que salgamos', en: 'It is necessary that we leave' },
    ],
    goldenRule: 'Wishes, emotions, doubts, and "Ojalá" always trigger the subjunctive.',
  },
];

/**
 * Intelligent query matching for the contextual AI tutor.
 */
export function askTutor(query: string, courseCode: LangCode): TutorExplanation {
  const normQuery = query.toLowerCase();

  // Search knowledge base entries matching course and keywords
  const courseEntries = TUTOR_KNOWLEDGE_BASE.filter((e) => e.courseCode === courseCode);
  const queryTokens = normQuery.split(/\s+/).map((w) => w.replace(/[.,!?¿¡;:"']/g, ''));

  let bestMatch: TutorKnowledgeEntry | null = null;
  let highestScore = 0;

  for (const entry of courseEntries) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (
        queryTokens.includes(kw) ||
        normQuery.includes(` ${kw} `) ||
        normQuery.startsWith(`${kw} `) ||
        normQuery.endsWith(` ${kw}`)
      ) {
        score += kw.length;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && highestScore > 0) {
    return {
      topic: bestMatch.topic,
      childFriendlySummary: bestMatch.childFriendlySummary,
      detailedExplanation: bestMatch.detailedExplanation,
      examples: bestMatch.examples,
      goldenRule: bestMatch.goldenRule,
    };
  }

  // Encouraging course-specific fallback
  if (courseCode === 'fr') {
    return {
      topic: 'French Learning Tip',
      childFriendlySummary:
        'You are building a real language foundation step-by-step. Don’t worry about perfection — focus on rhythm and confidence!',
      detailedExplanation:
        'In French, listening to the melodic flow and liaisons (connecting final consonants to vowels) will make you sound natural quickly. Speak out loud every day!',
      examples: [
        { target: 'Bonjour', en: 'Hello' },
        { target: "S'il vous plaît", en: 'Please' },
        { target: 'Merci beaucoup', en: 'Thank you very much' },
      ],
      goldenRule: 'Consistency beats intensity: 5 minutes every day creates true fluency.',
    };
  } else if (courseCode === 'es') {
    return {
      topic: 'Spanish Learning Tip',
      childFriendlySummary:
        'Spanish vowels are always pure and clear (a, e, i, o, u). Master "ser" vs "estar" and everyday courtesy to build natural conversational confidence!',
      detailedExplanation:
        'Spanish is very phonetic: words are almost always pronounced exactly as written. Focus on the distinction between "ser" (identity) and "estar" (states and locations), and practice greeting people warmly!',
      examples: [
        { target: '¡Hola! ¿Cómo estás?', en: 'Hello! How are you?' },
        { target: 'Por favor y gracias', en: 'Please and thank you' },
        { target: 'Un placer conocerte', en: 'A pleasure to meet you' },
      ],
      goldenRule: 'Listen to the pure vowel sounds and speak out loud with confidence.',
    };
  } else {
    return {
      topic: 'German Learning Tip',
      childFriendlySummary:
        'You are building a real language foundation step-by-step. Don’t worry about perfection — focus on rhythm and confidence!',
      detailedExplanation:
        'In German, pronouncing words clearly and paying attention to capitalized nouns and compound words will make your meaning crystal clear.',
      examples: [
        { target: 'Guten Tag', en: 'Good day' },
        { target: 'Bitte', en: 'Please' },
        { target: 'Vielen Dank', en: 'Thank you very much' },
      ],
      goldenRule: 'Consistency beats intensity: 5 minutes every day creates true fluency.',
    };
  }
}
