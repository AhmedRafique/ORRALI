import { RoleplayMessage, RoleplayScenario, RoleplayTurnResult } from '../types';

export const ROLEPLAY_SCENARIOS: RoleplayScenario[] = [
  {
    id: 'roleplay-fr-cafe',
    courseCode: 'fr',
    title: 'Au Café de Paris',
    role: 'Server at a traditional Parisian bistro',
    personaName: 'Pierre',
    avatar: '☕',
    contextObjective: 'Order your drink politely, request the bill, and pay.',
    initialGreeting: {
      target: 'Bonjour ! Bienvenue au Café de Paris. Vous désirez ?',
      en: 'Hello! Welcome to Café de Paris. What would you like?',
    },
    suggestedReplies: [
      "Bonjour, un café s'il vous plaît.",
      "Je voudrais un café au lait et de l'eau, s'il vous plaît.",
    ],
  },
  {
    id: 'roleplay-fr-hotel',
    courseCode: 'fr',
    title: 'À la Réception de l’Hôtel',
    role: 'Front desk concierge',
    personaName: 'Claire',
    avatar: '🛎️',
    contextObjective: 'Check into your room and ask for the Wi-Fi password.',
    initialGreeting: {
      target: 'Bonjour monsieur ! Bienvenue à l’Hôtel des Arts. Avez-vous une réservation ?',
      en: 'Hello! Welcome to Hôtel des Arts. Do you have a reservation?',
    },
    suggestedReplies: [
      "Bonjour ! J'ai une réservation au nom d'Ahmed.",
      "Bonjour, j'ai une réservation pour deux personnes.",
    ],
  },
  {
    id: 'roleplay-de-station',
    courseCode: 'de',
    title: 'Am Hauptbahnhof',
    role: 'Ticket service agent in Berlin',
    personaName: 'Hans',
    avatar: '🚆',
    contextObjective: 'Book a train ticket to Munich, confirm platform, and pay.',
    initialGreeting: {
      target: 'Guten Tag! Willkommen am Hauptbahnhof. Wie kann ich Ihnen helfen?',
      en: 'Good day! Welcome to the Central Station. How can I help you?',
    },
    suggestedReplies: [
      'Guten Tag, eine Fahrkarte nach München bitte.',
      'Hallo! Wann fährt der nächste Zug nach München?',
    ],
  },
  {
    id: 'roleplay-de-bakery',
    courseCode: 'de',
    title: 'In der Bäckerei',
    role: 'Baker at a German neighborhood bakery',
    personaName: 'Frau Schmidt',
    avatar: '🥨',
    contextObjective: 'Order fresh bread and pastries and ask for the price.',
    initialGreeting: {
      target: 'Guten Morgen! Was darf es denn für Sie sein?',
      en: 'Good morning! What can I get for you today?',
    },
    suggestedReplies: [
      'Guten Morgen! Zwei Brötchen und ein Croissant bitte.',
      'Ich möchte ein Brot, bitte.',
    ],
  },
];

/**
 * Multi-turn conversational evaluation engine for roleplay simulations.
 */
export function evaluateRoleplayTurn(
  scenarioId: string,
  turnIndex: number,
  userMessage: string
): RoleplayTurnResult {
  const normUser = userMessage.toLowerCase().trim();

  // 1. French Café Roleplay
  if (scenarioId === 'roleplay-fr-cafe') {
    if (turnIndex === 0) {
      return {
        reply: {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          speakerName: 'Pierre',
          avatar: '☕',
          target:
            "Très bien, je vous apporte ça immédiatement ! ... Et voilà pour vous. Vous désirez autre chose ou l'addition ?",
          en: "Very well, right away! ... And here you are. Anything else, or the bill?",
          feedback:
            "Great order! Polite courtesy phrases like 's'il vous plaît' or 'je voudrais' make interactions effortless.",
          timestamp: Date.now(),
        },
        isCompleted: false,
        suggestedNextReplies: [
          "L'addition, s'il vous plaît.",
          "C'est délicieux ! L'addition, s'il vous plaît.",
        ],
      };
    } else if (turnIndex === 1) {
      return {
        reply: {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          speakerName: 'Pierre',
          avatar: '☕',
          target:
            "Voici votre addition. Ça fait trois euros cinquante, s'il vous plaît. Vous réglez comment ?",
          en: "Here is your bill. That will be three euros fifty, please. How are you paying?",
          feedback:
            "Spot on! In France, waiters wait for you to ask before bringing the check.",
          timestamp: Date.now(),
        },
        isCompleted: false,
        suggestedNextReplies: [
          'Je peux payer par carte ? Merci beaucoup !',
          'Par carte bancaire, s’il vous plaît.',
        ],
      };
    } else {
      return {
        reply: {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          speakerName: 'Pierre',
          avatar: '☕',
          target:
            'Paiement accepté sans contact. Merci beaucoup pour votre visite et passez une excellente journée !',
          en: 'Contactless payment accepted. Thank you very much for your visit and have a wonderful day!',
          feedback:
            'Mission accomplished! You completed a full authentic café interaction in French.',
          timestamp: Date.now(),
        },
        isCompleted: true,
        earnedXp: 20,
        suggestedNextReplies: [],
      };
    }
  }

  // 2. German Train Station Roleplay
  if (scenarioId === 'roleplay-de-station') {
    if (turnIndex === 0) {
      return {
        reply: {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          speakerName: 'Hans',
          avatar: '🚆',
          target:
            'Sehr gerne! Der nächste ICE nach München fährt um zehn Uhr fünfzehn von Gleis vier. Zahlen Sie bar oder mit Karte?',
          en: 'Gladly! The next ICE train to Munich leaves at 10:15 from platform 4. Are you paying cash or card?',
          feedback:
            "Clear request! Notice how 'nach München' is used for cities without articles.",
          timestamp: Date.now(),
        },
        isCompleted: false,
        suggestedNextReplies: [
          'Kann ich mit Karte zahlen? Vielen Dank!',
          'Mit Karte bitte. Wo ist Gleis vier?',
        ],
      };
    } else {
      return {
        reply: {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          speakerName: 'Hans',
          avatar: '🚆',
          target:
            'Hier ist Ihre Fahrkarte und die Quittung. Gleis vier ist direkt geradeaus. Gute Reise nach München!',
          en: 'Here is your ticket and receipt. Platform 4 is straight ahead. Safe travels to Munich!',
          feedback:
            'Wunderbar! You successfully purchased a train ticket and navigated the central station.',
          timestamp: Date.now(),
        },
        isCompleted: true,
        earnedXp: 20,
        suggestedNextReplies: [],
      };
    }
  }

  // 3. French Hotel Reception Roleplay
  if (scenarioId === 'roleplay-fr-hotel') {
    if (turnIndex === 0) {
      return {
        reply: {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          speakerName: 'Claire',
          avatar: '🛎️',
          target:
            'Parfait, votre chambre 304 est prête au troisième étage. Voici votre clé. Avez-vous des questions ?',
          en: 'Perfect, room 304 on the third floor is ready. Here is your key. Any questions?',
          feedback:
            "Excellent introduction! Stating 'au nom de...' is the customary way to announce your booking.",
          timestamp: Date.now(),
        },
        isCompleted: false,
        suggestedNextReplies: [
          'Quel est le mot de passe du Wi-Fi ?',
          'À quelle heure est le petit-déjeuner ? Merci beaucoup !',
        ],
      };
    } else {
      return {
        reply: {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          speakerName: 'Claire',
          avatar: '🛎️',
          target:
            "Le mot de passe Wi-Fi est 'ORRALI2026' et le petit-déjeuner est servi de sept heures à dix heures. Bon séjour parmi nous !",
          en: "The Wi-Fi password is 'ORRALI2026' and breakfast is served from 7 to 10 AM. Enjoy your stay!",
          feedback:
            'Formidable! You smoothly checked in and obtained all vital hotel amenities in French.',
          timestamp: Date.now(),
        },
        isCompleted: true,
        earnedXp: 20,
        suggestedNextReplies: [],
      };
    }
  }

  // 4. German Bakery Roleplay (roleplay-de-bakery)
  if (turnIndex === 0) {
    return {
      reply: {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        speakerName: 'Frau Schmidt',
        avatar: '🥨',
        target:
          'Sehr gerne! Die Brötchen sind noch ganz warm aus dem Ofen. Möchten Sie noch ein Stück Kuchen dazu?',
        en: 'Gladly! The rolls are still warm from the oven. Would you like a slice of cake with that?',
        feedback:
          "Very authentic! In Germany, bread rolls are 'Brötchen' (or 'Semmeln' in the south).",
        timestamp: Date.now(),
      },
      isCompleted: false,
      suggestedNextReplies: [
        'Nein danke, das ist alles. Wie viel kostet das?',
        'Ja gerne! Was kostet das zusammen?',
      ],
    };
  } else {
    return {
      reply: {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        speakerName: 'Frau Schmidt',
        avatar: '🥨',
        target:
          'Das macht zusammen zwei Euro achtzig. Vielen Dank für Ihren Einkauf und einen schönen Tag noch!',
        en: 'That makes two euros eighty altogether. Thank you for your purchase and have a wonderful day!',
        feedback:
          'Perfekt! You completed a lively German bakery transaction with natural politeness.',
        timestamp: Date.now(),
      },
      isCompleted: true,
      earnedXp: 20,
      suggestedNextReplies: [],
    };
  }
}
