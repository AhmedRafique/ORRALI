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
  {
    id: 'roleplay-es-tapas',
    courseCode: 'es',
    title: 'Tapas en la Taberna Madrileña',
    role: 'Waiter at a lively tavern in central Madrid',
    personaName: 'Mateo',
    avatar: '🥘',
    contextObjective: 'Order delicious tapas and ask for the check in Spanish.',
    initialGreeting: {
      target: '¡Buenas tardes! Bienvenidos a la taberna. ¿Qué les pongo para beber y picar?',
      en: 'Good afternoon! Welcome to the tavern. What can I get you to drink and snack on?',
    },
    suggestedReplies: [
      '¡Buenas tardes! Un café con leche y una tortilla española, por favor.',
      'Buenas tardes. ¿Tiene una mesa para dos?',
    ],
  },
];

function containsAny(text: string, keywords: string[]): boolean {
  const norm = text.toLowerCase();
  return keywords.some((kw) => norm.includes(kw));
}

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
      const isOrderIntent = containsAny(normUser, [
        'cafe',
        'café',
        'croissant',
        'voudrais',
        'prends',
        'bonjour',
        'table',
        'eau',
        'the',
        'thé',
        'pain',
        'plaît',
        'plait',
        'merci',
      ]);

      if (!isOrderIntent) {
        return {
          reply: {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            speakerName: 'Pierre',
            avatar: '☕',
            target: "Pardon ? Je n'ai pas bien compris votre commande. Que désirez-vous boire ou manger ?",
            en: "Pardon? I didn't quite catch your order. What would you like to drink or eat?",
            feedback: "Try ordering in French, for example: 'Un café et un croissant, s'il vous plaît.'",
            timestamp: Date.now(),
          },
          isCompleted: false,
          earnedXp: 0,
          intentMet: false,
          suggestedNextReplies: [
            "Un café et un croissant, s'il vous plaît.",
            "Bonjour, je voudrais un café, s'il vous plaît.",
          ],
        };
      }

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
      const isBillIntent = containsAny(normUser, [
        'addition',
        'payer',
        'combien',
        'compte',
        'regler',
        'régler',
        'merci',
        'plaît',
        'plait',
      ]);

      if (!isBillIntent) {
        return {
          reply: {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            speakerName: 'Pierre',
            avatar: '☕',
            target: "Désolé, je n'ai pas compris. Désirez-vous l'addition ?",
            en: "Sorry, I didn't understand. Would you like the bill?",
            feedback: "Ask for the check: 'L'addition, s'il vous plaît.'",
            timestamp: Date.now(),
          },
          isCompleted: false,
          earnedXp: 0,
          intentMet: false,
          suggestedNextReplies: ["L'addition, s'il vous plaît."],
        };
      }

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
      const isPayIntent = containsAny(normUser, [
        'carte',
        'espece',
        'espèces',
        'billet',
        'euros',
        'merci',
        'payer',
        'regler',
        'voila',
        'voilà',
      ]);

      if (!isPayIntent) {
        return {
          reply: {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            speakerName: 'Pierre',
            avatar: '☕',
            target: "Comment souhaitez-vous régler ? Par carte ou en espèces ?",
            en: "How would you like to pay? By card or in cash?",
            feedback: "Specify payment: 'Par carte, s'il vous plaît.'",
            timestamp: Date.now(),
          },
          isCompleted: false,
          earnedXp: 0,
          intentMet: false,
          suggestedNextReplies: ['Par carte bancaire, s’il vous plaît.'],
        };
      }

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
      const isTrainIntent = containsAny(normUser, [
        'ticket',
        'fahrkarte',
        'berlin',
        'munchen',
        'münchen',
        'zug',
        'nach',
        'mochte',
        'möchte',
        'bitte',
        'wann',
        'guten tag',
      ]);

      if (!isTrainIntent) {
        return {
          reply: {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            speakerName: 'Hans',
            avatar: '🚆',
            target: 'Entschuldigung, wohin möchten Sie reisen?',
            en: 'Excuse me, where would you like to travel?',
            feedback: "Say your destination: 'Eine Fahrkarte nach München, bitte.'",
            timestamp: Date.now(),
          },
          isCompleted: false,
          earnedXp: 0,
          intentMet: false,
          suggestedNextReplies: ['Guten Tag, eine Fahrkarte nach München bitte.'],
        };
      }

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
      const isPaymentIntent = containsAny(normUser, [
        'karte',
        'bar',
        'gleis',
        'vielen dank',
        'danke',
        'zahlung',
        'euro',
        'bitte',
      ]);

      if (!isPaymentIntent) {
        return {
          reply: {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            speakerName: 'Hans',
            avatar: '🚆',
            target: 'Möchten Sie bar oder mit Karte zahlen?',
            en: 'Would you like to pay cash or with card?',
            feedback: "Specify payment in German: 'Mit Karte, bitte.' or 'Kann ich mit Karte zahlen?'",
            timestamp: Date.now(),
          },
          isCompleted: false,
          earnedXp: 0,
          intentMet: false,
          suggestedNextReplies: [
            'Kann ich mit Karte zahlen? Vielen Dank!',
            'Mit Karte bitte. Wo ist Gleis vier?',
          ],
        };
      }

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
        intentMet: true,
        suggestedNextReplies: [],
      };
    }
  }

  // 3. French Hotel Reception Roleplay
  if (scenarioId === 'roleplay-fr-hotel') {
    if (turnIndex === 0) {
      const isCheckInIntent = containsAny(normUser, [
        'reservation',
        'réservation',
        'chambre',
        'bonjour',
        'nom',
        'arrive',
        'arrivée',
        'cle',
        'clé',
        'soir',
      ]);

      if (!isCheckInIntent) {
        return {
          reply: {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            speakerName: 'Claire',
            avatar: '🛎️',
            target: 'Bonjour ! Avez-vous une réservation à votre nom ?',
            en: 'Hello! Do you have a reservation under your name?',
            feedback: "Announce your check-in: 'Bonjour, j’ai une réservation au nom de...'",
            timestamp: Date.now(),
          },
          isCompleted: false,
          earnedXp: 0,
          intentMet: false,
          suggestedNextReplies: ['Bonjour, j’ai une réservation pour une chambre.'],
        };
      }

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
        intentMet: true,
        suggestedNextReplies: [
          'Quel est le mot de passe du Wi-Fi ?',
          'À quelle heure est le petit-déjeuner ? Merci beaucoup !',
        ],
      };
    } else {
      const isQuestionIntent = containsAny(normUser, [
        'wifi',
        'wi-fi',
        'dejeuner',
        'déjeuner',
        'heure',
        'merci',
        'code',
        'mot de passe',
        'ascenseur',
        'plaît',
        'plait',
      ]);

      if (!isQuestionIntent) {
        return {
          reply: {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            speakerName: 'Claire',
            avatar: '🛎️',
            target: 'Avez-vous besoin du mot de passe Wi-Fi ou de l’heure du petit-déjeuner ?',
            en: 'Do you need the Wi-Fi password or breakfast hours?',
            feedback: "Ask about amenities: 'Quel est le mot de passe du Wi-Fi ?'",
            timestamp: Date.now(),
          },
          isCompleted: false,
          earnedXp: 0,
          intentMet: false,
          suggestedNextReplies: ['Quel est le mot de passe du Wi-Fi ?'],
        };
      }

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
        intentMet: true,
        suggestedNextReplies: [],
      };
    }
  }

  // 4. German Bakery Roleplay (roleplay-de-bakery)
  if (scenarioId === 'roleplay-de-bakery') {
    if (turnIndex === 0) {
      const isBakeryIntent = containsAny(normUser, [
        'brot',
        'brötchen',
        'brotchen',
        'croissant',
        'kuchen',
        'bitte',
        'nehmen',
        'zwei',
        'eins',
        'mochte',
        'möchte',
        'guten morgen',
        'guten tag',
        'hallo',
      ]);

      if (!isBakeryIntent) {
        return {
          reply: {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            speakerName: 'Frau Schmidt',
            avatar: '🥨',
            target: 'Guten Tag! Was darf es für Sie sein? Frische Brötchen oder Brot?',
            en: 'Good day! What can I get for you? Fresh rolls or bread?',
            feedback: "Order in German: 'Ich möchte zwei Brötchen, bitte.'",
            timestamp: Date.now(),
          },
          isCompleted: false,
          earnedXp: 0,
          intentMet: false,
          suggestedNextReplies: ['Guten Tag! Ich möchte zwei Brötchen bitte.'],
        };
      }

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
        intentMet: true,
        suggestedNextReplies: [
          'Nein danke, das ist alles. Wie viel kostet das?',
          'Ja gerne! Was kostet das zusammen?',
        ],
      };
    } else {
      const isPayIntent = containsAny(normUser, [
        'kostet',
        'preis',
        'zahlen',
        'danke',
        'auf wiedersehen',
        'schönen tag',
        'tschüss',
        'euro',
        'alles',
      ]);

      if (!isPayIntent) {
        return {
          reply: {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            speakerName: 'Frau Schmidt',
            avatar: '🥨',
            target: 'Möchten Sie wissen, wie viel das kostet?',
            en: 'Would you like to know how much that costs?',
            feedback: "Ask for the total: 'Wie viel kostet das zusammen?'",
            timestamp: Date.now(),
          },
          isCompleted: false,
          earnedXp: 0,
          intentMet: false,
          suggestedNextReplies: ['Wie viel kostet das zusammen?'],
        };
      }

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
        intentMet: true,
        suggestedNextReplies: [],
      };
    }
  }

  // 5. Spanish Tapas Bar Roleplay (roleplay-es-tapas)
  if (turnIndex === 0) {
    const isTapasIntent = containsAny(normUser, [
      'cafe',
      'café',
      'tortilla',
      'tapas',
      'cerveza',
      'agua',
      'jamon',
      'jamón',
      'buenas',
      'hola',
      'por favor',
      'mesa',
    ]);

    if (!isTapasIntent) {
      return {
        reply: {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          speakerName: 'Mateo',
          avatar: '🥘',
          target: '¿Qué le pongo de comer o beber?',
          en: 'What can I get you to eat or drink?',
          feedback: "Try ordering tapas or drinks in Spanish: 'Un café con leche y una tortilla, por favor.'",
          timestamp: Date.now(),
        },
        isCompleted: false,
        earnedXp: 0,
        intentMet: false,
        suggestedNextReplies: [
          '¡Buenas tardes! Un café con leche y una tortilla española, por favor.',
        ],
      };
    }

    return {
      reply: {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        speakerName: 'Mateo',
        avatar: '🥘',
        target:
          '¡Excelente elección! La tortilla está recién hecha y el café sale enseguida. ¿Les apetece probar también unas aceitunas o jamón ibérico?',
        en: 'Excellent choice! The tortilla is freshly made and the coffee is on its way. Would you also like to try some olives or Iberian ham?',
        feedback:
          "¡Muy bien! Ordering with 'por favor' and naming tapas shows great cultural confidence.",
        timestamp: Date.now(),
      },
      isCompleted: false,
      intentMet: true,
      suggestedNextReplies: [
        'La cuenta, por favor.',
        'Estupendo, muchas gracias. ¿Me trae la cuenta, por favor?',
      ],
    };
  } else {
    const isPayIntent = containsAny(normUser, [
      'cuenta',
      'pagar',
      'tarjeta',
      'efectivo',
      'cuanto',
      'cuánto',
      'gracias',
      'por favor',
    ]);

    if (!isPayIntent) {
      return {
        reply: {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          speakerName: 'Mateo',
          avatar: '🥘',
          target: '¿Desean pedir la cuenta o algo más?',
          en: 'Would you like to ask for the bill or anything else?',
          feedback: "Ask for the check in Spanish: 'La cuenta, por favor.'",
          timestamp: Date.now(),
        },
        isCompleted: false,
        earnedXp: 0,
        intentMet: false,
        suggestedNextReplies: ['La cuenta, por favor.'],
      };
    }

    return {
      reply: {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        speakerName: 'Mateo',
        avatar: '🥘',
        target:
          'Aquí tienen la cuenta. Son seis euros con cincuenta céntimos. Pueden pagar en efectivo o con tarjeta. ¡Muchas gracias y que disfruten de Madrid!',
        en: 'Here is your check. It is six euros and fifty cents. You can pay with cash or card. Thank you very much and enjoy Madrid!',
        feedback:
          '¡Fantástico! You successfully navigated a friendly Spanish tapas bar interaction from greeting to payment.',
        timestamp: Date.now(),
      },
      isCompleted: true,
      earnedXp: 20,
      intentMet: true,
      suggestedNextReplies: [],
    };
  }
}
