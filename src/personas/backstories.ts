import { getRelationshipTier } from './emotionEngine';

export type TierKey = 'acquaintance' | 'regular' | 'confidant' | 'partner';

export function tierNumberToKey(tierNumber: number): TierKey {
  if (tierNumber >= 4) return 'partner';
  if (tierNumber === 3) return 'confidant';
  if (tierNumber === 2) return 'regular';
  return 'acquaintance';
}

export interface UnlockedAnecdote {
  tierRequired: TierKey;
  title: string;
  story: string;
}

export interface CharacterBackstory {
  characterId: string;
  originCity: string;
  passions: string[];
  favoriteSpot: string;
  secretTip: string;
  greetings: Record<TierKey, { target: string; en: string }>;
  anecdotes: UnlockedAnecdote[];
}

export const CHARACTER_BACKSTORIES: Record<string, CharacterBackstory> = {
  // --- FRENCH PERSONAS ---
  pierre: {
    characterId: 'pierre',
    originCity: 'Paris (Montmartre)',
    passions: ['Traditional Roasting', 'Bistro Philosophy', 'Accordion Jazz'],
    favoriteSpot: 'Le Comptoir des Abbesses, a quiet morning terrace off Rue Lepic',
    secretTip: 'Never order café au lait after noon; Parisians only take un express or un noisette.',
    greetings: {
      acquaintance: { target: 'Bonjour ! Bienvenue à notre table.', en: 'Hello! Welcome to our table.' },
      regular: { target: 'Ah, te revoilà ! Ton café habituel ?', en: 'Ah, there you are! Your usual coffee?' },
      confidant: { target: 'Mon ami ! Viens t’asseoir, j’ai une anecdote incroyable à te raconter.', en: 'My friend! Come sit, I have an incredible story to share with you.' },
      partner: { target: 'Te voir illumine toujours ma journée ! La maison t’offre son meilleur cru.', en: 'Seeing you always lights up my day! The house offers you its finest reserve.' },
    },
    anecdotes: [
      {
        tierRequired: 'acquaintance',
        title: 'The Secret of Good Roast',
        story: 'Pierre learned the craft of roasting beans from his grandfather in an old subterranean cellar behind Sacré-Cœur.',
      },
      {
        tierRequired: 'regular',
        title: 'The Legendary Rainstorm of 2018',
        story: 'During a sudden cloudburst, thirty strangers crammed into his tiny bistro. Instead of closing, Pierre served free hot chocolate and sparked five lifelong marriages.',
      },
      {
        tierRequired: 'confidant',
        title: 'The Midnight Recipe',
        story: 'Pierre confesses that his secret tarte Tatin recipe relies on salted Guérande butter caramelized with a drop of 12-year-old Calvados.',
      },
      {
        tierRequired: 'partner',
        title: 'A Key to the Cellar',
        story: 'You are now an honorary patron of Le Café des Rêves. Pierre considers you family and always reserves his sunniest alcove table for you.',
      },
    ],
  },
  claire: {
    characterId: 'claire',
    originCity: 'Lyon (Part-Dieu)',
    passions: ['High-Speed Rail Logistics', 'Historic Architecture', 'Traboules Walks'],
    favoriteSpot: 'The rooftop terrace overlooking the Rhône from Fourvière Hill',
    secretTip: 'When transferring in Lyon, use the underground traboule passages on rainy days.',
    greetings: {
      acquaintance: { target: 'Bonjour, présentez votre titre de transport s’il vous plaît.', en: 'Hello, please present your travel ticket.' },
      regular: { target: 'Toujours en voyage ? La voie 3 est libre pour ton train.', en: 'Traveling again? Track 3 is clear for your train.' },
      confidant: { target: 'Je t’ai réservé la meilleure place côté fenêtre, profite du paysage !', en: 'I saved you the best window seat, enjoy the scenery!' },
      partner: { target: 'Chaque voyage commence mieux quand tu es à bord. Bienvenue chez toi !', en: 'Every journey starts better when you are aboard. Welcome home!' },
    },
    anecdotes: [
      {
        tierRequired: 'acquaintance',
        title: 'Precision on the Rails',
        story: 'Claire has managed train departures for over a decade with a 99.4% punctuality record.',
      },
      {
        tierRequired: 'regular',
        title: 'The Lyon Traboules Shortcut',
        story: 'She knows every hidden Renaissance corridor in Old Lyon and can traverse the city center without touching a drop of rain.',
      },
      {
        tierRequired: 'confidant',
        title: 'The Mystery Letter of TGV 612',
        story: 'She once found a handwritten love letter left on a high-speed train and tracked down the recipient in Marseille within 24 hours.',
      },
      {
        tierRequired: 'partner',
        title: 'Master Conductor Alliance',
        story: 'Claire presents you with a golden station whistle, honoring your reliability and mutual trust across all European rail corridors.',
      },
    ],
  },
  antoine: {
    characterId: 'antoine',
    originCity: 'Bordeaux & Paris (Station F)',
    passions: ['Venture Architecture', 'Ethical AI', 'Philosophy of Language'],
    favoriteSpot: 'A canal-side coworking barge along Bassin de la Villette',
    secretTip: 'In French business debates, acknowledging the counterargument first earns instant respect.',
    greetings: {
      acquaintance: { target: 'Salut ! Prêt pour notre séance de remue-méninges ?', en: 'Hi! Ready for our brainstorming session?' },
      regular: { target: 'Ça avance vite ! Regarde ce nouveau prototype.', en: 'Making quick progress! Check out this new prototype.' },
      confidant: { target: 'Je te fais confiance pour challenger ma stratégie sans langue de bois.', en: 'I trust you to challenge my strategy without beating around the bush.' },
      partner: { target: 'On forme un binôme invincible ! Quel est notre prochain défi ?', en: 'We make an invincible team! What is our next challenge?' },
    },
    anecdotes: [
      {
        tierRequired: 'acquaintance',
        title: 'The First Pitch',
        story: 'Antoine launched his first open-source project from his Bordeaux student dorm using a repurposed microwave transformer as a server power supply.',
      },
      {
        tierRequired: 'regular',
        title: 'The Debate Protocol',
        story: 'He believes the best ideas emerge when two respectful minds disagree sharply with structured rhetoric.',
      },
      {
        tierRequired: 'confidant',
        title: 'The Unreleased Patent',
        story: 'He shares his dream of creating decentralised digital commons that protect cultural languages from algorithmic flattening.',
      },
      {
        tierRequired: 'partner',
        title: 'Co-Founder Camaraderie',
        story: 'Antoine considers you his foremost sounding board and strategic collaborator across all ventures.',
      },
    ],
  },

  // --- GERMAN PERSONAS ---
  julia: {
    characterId: 'julia',
    originCity: 'Berlin (Mitte)',
    passions: ['Bauhaus Architecture', 'Urban Ecology', 'Analogue Photography'],
    favoriteSpot: 'The rooftop garden of a repurposed warehouse in Kreuzberg',
    secretTip: 'The best way to explore Berlin is on a single-speed bike along the former Spree canal paths.',
    greetings: {
      acquaintance: { target: 'Guten Tag ! Womit kann ich dir heute weiterhelfen ?', en: 'Good day! How can I help you today?' },
      regular: { target: 'Schön, dich wiederzusehen ! Hast du die neue Ausstellung gesehen ?', en: 'Great to see you again! Did you see the new exhibition?' },
      confidant: { target: 'Komm mit, ich zeige dir einen geheimen Innenhof mitten im Viertel.', en: 'Come with me, I will show you a secret courtyard in the middle of the district.' },
      partner: { target: 'Mit dir hat Berlin einfach die beste Energie ! Auf das nächste Projekt !', en: 'Berlin simply has the best energy with you! Here’s to the next project!' },
    },
    anecdotes: [
      {
        tierRequired: 'acquaintance',
        title: 'Lines and Concrete',
        story: 'Julia studied sustainable architecture at the Bauhaus-Universität in Weimar before moving to Berlin.',
      },
      {
        tierRequired: 'regular',
        title: 'The Secret Greenhouses',
        story: 'She designed a community rooftop garden that feeds over forty families while insulating the building naturally.',
      },
      {
        tierRequired: 'confidant',
        title: 'Darkroom Stories',
        story: 'She still develops 35mm black-and-white film by hand every Sunday night with classical music in the background.',
      },
      {
        tierRequired: 'partner',
        title: 'Urban Architect Bond',
        story: 'Julia considers you her ultimate creative confidant and companion for city exploration.',
      },
    ],
  },
  hans: {
    characterId: 'hans',
    originCity: 'Munich (Schwabing)',
    passions: ['Precision Engineering', 'Alpine Climbing', 'Classic Mechanics'],
    favoriteSpot: 'A wooden alpine hut near Lake Tegernsee with freshly tapped wheat beer',
    secretTip: 'In Bavaria, say Servus for both greeting and goodbye among trusted equals.',
    greetings: {
      acquaintance: { target: 'Servus ! Alles in bester Ordnung bei dir ?', en: 'Servus! Everything in top order with you?' },
      regular: { target: 'Grias di ! Schau dir dieses solide Getriebe an.', en: 'Greetings! Check out this solid gearbox.' },
      confidant: { target: 'Auf dich ist immer Verlass, mein Freund ! Setz dich zu mir.', en: 'You can always be counted on, my friend! Sit down with me.' },
      partner: { target: 'Eine Freundschaft wie aus Kruppstahl gefertigt ! Willkommen, Kamerad !', en: 'A friendship forged like Krupp steel! Welcome, comrade!' },
    },
    anecdotes: [
      {
        tierRequired: 'acquaintance',
        title: 'Master Craftsman Roots',
        story: 'Hans spent seven years as a journeyman carpenter and mechanic traveling across central Europe with a traditional rucksack.',
      },
      {
        tierRequired: 'regular',
        title: 'The Storm on the Zugspitze',
        story: 'He once guided three stranded hikers down a jagged Bavarian peak during a surprise snowstorm using only a compass and hand-drawn map.',
      },
      {
        tierRequired: 'confidant',
        title: 'The Restored 1968 Roadster',
        story: 'He spent twelve years restoring an antique Bavarian roadster down to the original brass washers and carburettor screws.',
      },
      {
        tierRequired: 'partner',
        title: 'Alpine Summit Alliance',
        story: 'Hans gives you his grandfather’s vintage mountaineering carabiner as a symbol of unbreakable trust.',
      },
    ],
  },
  frau_schmidt: {
    characterId: 'frau_schmidt',
    originCity: 'Hamburg (Speicherstadt)',
    passions: ['Maritime History', 'Antique Books', 'Orchard Gardening'],
    favoriteSpot: 'An old teahouse overlooking the historic brick warehouse canals of Hamburg',
    secretTip: 'A true Northern German greeting is always Moin, morning, noon, and midnight.',
    greetings: {
      acquaintance: { target: 'Moin moin ! Wie kann ich Ihnen behilflich sein ?', en: 'Moin moin! How may I be of service to you?' },
      regular: { target: 'Moin ! Schön, dass du dir wieder Zeit für unsere Geschichten nimmst.', en: 'Moin! Wonderful that you take time for our stories again.' },
      confidant: { target: 'Komm herein und nimm dir einen heißen Tee. Ich habe ein altes Buch für dich.', en: 'Come in and take some hot tea. I have an old book for you.' },
      partner: { target: 'Du bist für mich wie die eigene Familie geworden. Sei von Herzen gegrüßt !', en: 'You have become like family to me. Be warmly embraced from the heart!' },
    },
    anecdotes: [
      {
        tierRequired: 'acquaintance',
        title: 'Guardian of the Archives',
        story: 'Frau Schmidt preserved centuries of maritime logs in the Speicherstadt through generations of storms and high tides.',
      },
      {
        tierRequired: 'regular',
        title: 'The Secret Spice Trade Route',
        story: 'She reveals that the red brick warehouses stored cardamom and Ceylon cinnamon that shaped Hamburg’s famous pastries.',
      },
      {
        tierRequired: 'confidant',
        title: 'Letters from the Lighthouse',
        story: 'She shares handwritten letters exchanged between sea captains and their families across the North Sea in 1923.',
      },
      {
        tierRequired: 'partner',
        title: 'The Family Heirlooms',
        story: 'Frau Schmidt trusts you with her most precious handwritten recipe journal, passed down across four generations.',
      },
    ],
  },

  // --- SPANISH PERSONAS ---
  mateo: {
    characterId: 'mateo',
    originCity: 'Seville (Triana)',
    passions: ['Flamenco Guitar', 'Artisan Tapas', 'Old Barrio Legends'],
    favoriteSpot: 'A tiled courtyard lined with orange trees near the Guadalquivir river',
    secretTip: 'Tapas are meant to be shared standing up at the bar while chatting with the cook.',
    greetings: {
      acquaintance: { target: '¡Hola, qué tal ! Bienvenido a nuestra casa.', en: 'Hello, how are you! Welcome to our home.' },
      regular: { target: '¡Hombre, qué alegría verte ! Te he preparado unas aceitunas aliñadas.', en: 'Hey man, what joy to see you! I prepared seasoned olives for you.' },
      confidant: { target: '¡Pasa hasta la cocina, hermano ! Esta noche tocamos unas bulerías.', en: 'Come right into the kitchen, brother! Tonight we play some bulerías.' },
      partner: { target: '¡Tú eres de mi sangre ya ! La guitarra y la mesa siempre tienen tu sitio.', en: 'You are like my own blood now! The guitar and table always have your spot.' },
    },
    anecdotes: [
      {
        tierRequired: 'acquaintance',
        title: 'Strings of Triana',
        story: 'Mateo built his first Spanish cedar guitar by hand under the guidance of a master luthier in Seville.',
      },
      {
        tierRequired: 'regular',
        title: 'The Secret of Salmorejo',
        story: 'He insists that genuine Andalusian salmorejo needs day-old sourdough bread, ripe vine tomatoes, and unpasteurized virgin olive oil.',
      },
      {
        tierRequired: 'confidant',
        title: 'The Moonlit Plaza Concert',
        story: 'He tells of a night in Cordoba when five guitarists played impromptu flamenco under the Roman bridge until sunrise.',
      },
      {
        tierRequired: 'partner',
        title: 'Honorary Triana Family',
        story: 'Mateo hangs your caricature among the hall of fame portraits above his family tapas counter.',
      },
    ],
  },
  lucia: {
    characterId: 'lucia',
    originCity: 'Madrid (Malasaña)',
    passions: ['Investigative Journalism', 'Boutique Books', 'Urban Murals'],
    favoriteSpot: 'A bohemian café with sun-drenched marble tables in Plaza del Dos de Mayo',
    secretTip: 'In Madrid, lunch starts after 14:30 and dinner rarely begins before 21:30.',
    greetings: {
      acquaintance: { target: '¡Hola ! ¿Qué tal va tu día por Madrid ?', en: 'Hello! How is your day in Madrid going?' },
      regular: { target: '¡Qué bueno verte ! Tengo una historia fascinante que contarte.', en: 'So good to see you! I have a fascinating story to tell you.' },
      confidant: { target: 'Contigo puedo hablar de todo sin filtros. ¿Nos tomamos un café largo ?', en: 'With you I can speak about everything with zero filters. Shall we get a long coffee?' },
      partner: { target: '¡Mi cómplice favorita de la ciudad ! Nada se nos escapa juntos.', en: 'My favorite city partner in crime! Nothing gets past us when we’re together.' },
    },
    anecdotes: [
      {
        tierRequired: 'acquaintance',
        title: 'The Reporter’s Notebook',
        story: 'Lucía has documented street art, underground cultural movements, and urban history across Spain.',
      },
      {
        tierRequired: 'regular',
        title: 'The Midnight Print Run',
        story: 'She once printed an independent cultural manifesto on a vintage 1950s Heidelberg press overnight in Lavapiés.',
      },
      {
        tierRequired: 'confidant',
        title: 'The Vanished Painter',
        story: 'She spent three months solving the mystery of an anonymous muralist whose poignant artwork appeared across Madrid metro stations.',
      },
      {
        tierRequired: 'partner',
        title: 'Press Pass of Trust',
        story: 'Lucía dedicates the prologue of her debut novel to you, acknowledging your shared courage and clarity.',
      },
    ],
  },
  carlos: {
    characterId: 'carlos',
    originCity: 'Barcelona (Gràcia)',
    passions: ['Modernist Architecture', 'Decentralised Tech', 'Mediterranean Sailing'],
    favoriteSpot: 'A rooftop terrace in Gràcia overlooking Gaudí’s Sagrada Família spires',
    secretTip: 'To experience Barcelona authentically, spend an evening in the peaceful pedestrian plazas of Gràcia.',
    greetings: {
      acquaintance: { target: '¡Hola ! ¿En qué proyecto andas trabajando últimamente ?', en: 'Hello! What project have you been working on lately?' },
      regular: { target: '¡Qué tal, amigo ! Me alegro de coincidir contigo otra vez.', en: 'How’s it going, friend! Glad to cross paths with you again.' },
      confidant: { target: 'Tienes una visión muy clara, siempre aprendo algo nuevo cuando charlamos.', en: 'You have such clear vision, I always learn something new when we chat.' },
      partner: { target: '¡Esta conexión vale oro ! Amigos y aliados para siempre en cualquier rincón del mundo.', en: 'This connection is pure gold! Friends and allies forever in any corner of the world.' },
    },
    anecdotes: [
      {
        tierRequired: 'acquaintance',
        title: 'Code and Sea Salt',
        story: 'Carlos combines his passion for distributed systems with weekend regatta sailing along the Costa Brava.',
      },
      {
        tierRequired: 'regular',
        title: 'The Modernist Hacker Space',
        story: 'He helped convert an abandoned textile mill into a thriving creative laboratory where artists and programmers collaborate.',
      },
      {
        tierRequired: 'confidant',
        title: 'The Mediterranean Crossing',
        story: 'He once navigated a small sailboat from Barcelona to Menorca during a sudden squall using celestial navigation.',
      },
      {
        tierRequired: 'partner',
        title: 'Lifelong Fellowship',
        story: 'Carlos gives you a bronze nautical compass, a token of lifelong collaboration and steady heading through any storm.',
      },
    ],
  },
};

export function getCharacterBackstory(characterId: string): CharacterBackstory | undefined {
  return CHARACTER_BACKSTORIES[characterId];
}

export function getUnlockedAnecdotes(
  characterId: string,
  relationshipLevel: number
): UnlockedAnecdote[] {
  const backstory = CHARACTER_BACKSTORIES[characterId];
  if (!backstory) return [];

  const tierObj = getRelationshipTier(relationshipLevel);
  const currentKey = tierNumberToKey(tierObj.tier);
  const tierOrder: TierKey[] = ['acquaintance', 'regular', 'confidant', 'partner'];
  const userTierIdx = tierOrder.indexOf(currentKey);

  return backstory.anecdotes.filter((a) => {
    const requiredIdx = tierOrder.indexOf(a.tierRequired);
    return requiredIdx <= userTierIdx;
  });
}

export function getCharacterGreeting(
  characterId: string,
  relationshipLevel: number
): { target: string; en: string } {
  const backstory = CHARACTER_BACKSTORIES[characterId];
  if (!backstory) return { target: 'Bonjour !', en: 'Hello!' };

  const tierObj = getRelationshipTier(relationshipLevel);
  const currentKey = tierNumberToKey(tierObj.tier);
  return backstory.greetings[currentKey];
}
