import { LangCode } from '../types';
import { WritingChallenge, WritingPromptFormat } from './types';

export const WRITING_CHALLENGES_CATALOG: WritingChallenge[] = [
  // ------------------------------------------------------------------------
  // 1. FRENCH: Hotel Reservation Confirmation Reply (email_reply)
  // ------------------------------------------------------------------------
  {
    id: 'fr_write_01_hotel_reply',
    languageId: 'fr',
    format: 'email_reply',
    level: 'A2',
    title: 'Confirmation de Réservation d’Hôtel',
    subtitle: 'Reply to hotel reception, confirm your arrival time, and request parking',
    scenario:
      'You received a reservation confirmation from Hôtel de la Paix in Lyon. Reply to confirm your check-in time and ask about parking.',
    incomingMessage: {
      sender: 'Hôtel de la Paix <reception@hoteldelapaix.fr>',
      text: 'Bonjour, nous avons bien enregistré votre réservation pour ce vendredi. Merci de nous indiquer votre heure approximative d’arrivée.',
      translation:
        'Hello, we have confirmed your reservation for this Friday. Please let us know your approximate arrival time.',
    },
    instructions: [
      'Remerciez l’hôtel pour la confirmation',
      'Indiquez votre heure d’arrivée (ex: 18h30 ou 19h00)',
      'Demandez si le parking de l’hôtel est disponible',
      'Terminez par une formule de politesse formelle (Cordialement)',
    ],
    minimumWords: 15,
    requiredKeywords: ['merci', 'arrive', 'parking', 'cordialement'],
    suggestedExpressions: [
      { phrase: 'Merci pour la confirmation', translation: 'Thank you for the confirmation' },
      { phrase: 'Je prévois d’arriver vers 19h00', translation: 'I plan to arrive around 7:00 PM' },
      { phrase: 'Est-il possible de réserver une place de parking ?', translation: 'Is it possible to reserve a parking spot ?' },
      { phrase: 'Cordialement', translation: 'Warm regards / Sincerely' },
    ],
    idealReference:
      'Bonjour, merci pour votre confirmation. Je prévois d’arriver vers 19h00 ce vendredi. Pourriez-vous me dire si le parking est disponible ? Cordialement.',
    naturalAlternative:
      'Bonjour, je vous remercie pour cette confirmation. Nous arriverons vers 19h. Disposez-vous d’un parking privé pour notre véhicule ? Bien cordialement.',
    grammarRule:
      'In formal email correspondence, use the polite pronoun "vous" and conclude with standard closings like "Cordialement" or "Bien cordialement".',
    vocabularyRecommendation:
      'Instead of simply saying "Est-ce qu’il y a du parking ?", native speakers prefer "Disposez-vous d’un parking privé ?".',
    followUpExercise: {
      prompt: 'Write one formal sentence requesting a late check-out on Sunday.',
      targetHint: 'Serait-il possible de bénéficier d’un départ tardif dimanche ?',
    },
  },

  // ------------------------------------------------------------------------
  // 2. FRENCH: Weekend Description (paragraph_description)
  // ------------------------------------------------------------------------
  {
    id: 'fr_write_02_weekend_desc',
    languageId: 'fr',
    format: 'paragraph_description',
    level: 'B1',
    title: 'Raconter son Week-end',
    subtitle: 'Describe activities, cultural visits, and food enjoyed over the weekend',
    scenario:
      'Write a short paragraph describing what you did last weekend, using the Passé Composé tense correctly.',
    instructions: [
      'Mentionnez au moins deux activités réalisées (ex: musée, promenade, restaurant)',
      'Utilisez le passé composé avec les bons auxiliaires (être / avoir)',
      'Donnez votre impression générale sur le week-end',
    ],
    minimumWords: 20,
    requiredKeywords: ['weekend', 'suis', 'visite', 'mange'],
    suggestedExpressions: [
      { phrase: 'Ce week-end, je suis allé...', translation: 'This weekend, I went...' },
      { phrase: 'J’ai visité une exposition intéressante', translation: 'I visited an interesting exhibition' },
      { phrase: 'C’était une expérience formidable', translation: 'It was a wonderful experience' },
    ],
    idealReference:
      'Ce week-end, je suis allé au musée avec des amis. Samedi soir, nous avons mangé dans un excellent restaurant de quartier. C’était un week-end très reposant.',
    naturalAlternative:
      'Ce week-end était très agréable : je suis allé me promener dans le vieux quartier et j’ai découvert une superbe galerie d’art.',
    grammarRule:
      'Movement verbs (aller, venir, partir, sortir) require the auxiliary "être" in the Passé Composé: "je suis allé", not "j’ai allé".',
    vocabularyRecommendation:
      'Elevate your descriptions by using "agréable", "enrichissant", or "dépaysant" instead of just "très bon".',
    followUpExercise: {
      prompt: 'Write one sentence stating that you stayed home Sunday evening.',
      targetHint: 'Dimanche soir, je suis resté à la maison pour me reposer.',
    },
  },

  // ------------------------------------------------------------------------
  // 3. GERMAN: WhatsApp Message to Colleague (short_message)
  // ------------------------------------------------------------------------
  {
    id: 'de_write_01_colleague_msg',
    languageId: 'de',
    format: 'short_message',
    level: 'A2',
    title: 'Mittagessen mit Kollegen',
    subtitle: 'Propose a quick lunch break and coordinate a meeting point',
    scenario:
      'Your colleague Lukas sent you a quick message on Teams/WhatsApp asking if you have time for lunch.',
    incomingMessage: {
      sender: 'Lukas (Kollege)',
      text: 'Hallo ! Hast du heute Zeit für die Mittagspause ? Ich habe Lust auf italienisches Essen.',
      translation: 'Hello! Do you have time for lunch today? I feel like having Italian food.',
    },
    instructions: [
      'Bestätigen Sie, dass Sie Zeit haben',
      'Schlagen Sie eine Uhrzeit vor (z. B. 12:30 Uhr)',
      'Nennen Sie den Treffpunkt am Haupteingang',
    ],
    minimumWords: 12,
    requiredKeywords: ['zeit', 'uhr', 'treffen', 'eingang'],
    suggestedExpressions: [
      { phrase: 'Ja, gerne ! Ich habe Zeit.', translation: 'Yes, gladly! I have time.' },
      { phrase: 'Treffen wir uns um 12:30 Uhr ?', translation: 'Shall we meet at 12:30 ?' },
      { phrase: 'Am Haupteingang', translation: 'At the main entrance' },
    ],
    idealReference:
      'Hallo Lukas ! Ja gerne, ich habe Zeit. Treffen wir uns um 12:30 Uhr am Haupteingang ? Bis gleich !',
    naturalAlternative:
      'Klar, gerne ! Klingt super. Passt dir 12:30 Uhr am Haupteingang ? Freue mich !',
    grammarRule:
      'Time prepositions: clock times use "um" ("um 12:30 Uhr"), while days use "am" ("am Montag").',
    vocabularyRecommendation:
      'Informal collegial chats often use "Klingt super !" (Sounds great!) or "Passt dir das ?" (Does that suit you?).',
    followUpExercise: {
      prompt: 'Write one short German message saying you will be 5 minutes late.',
      targetHint: 'Ich verspäte mich leider um 5 Minuten, bis gleich !',
    },
  },

  // ------------------------------------------------------------------------
  // 4. GERMAN: Technical Roadblock Summary (professional_summary)
  // ------------------------------------------------------------------------
  {
    id: 'de_write_02_tech_issue',
    languageId: 'de',
    format: 'professional_summary',
    level: 'B1',
    title: 'Technischer Statusbericht',
    subtitle: 'Report a software blocker concisely and propose a resolution',
    scenario:
      'You are updating your project manager about an unexpected database connectivity delay.',
    instructions: [
      'Erklären Sie die technische Ursache sachlich',
      'Verwenden Sie eine Nebensatzkonstruktion mit "weil" oder "dass" mit korrekter Verbstellung',
      'Schlagen Sie eine Lösung oder einen Zeitplan vor',
    ],
    minimumWords: 18,
    requiredKeywords: ['problem', 'datenbank', 'weil', 'losung'],
    suggestedExpressions: [
      { phrase: 'Wir haben ein Problem identifiziert', translation: 'We have identified a problem' },
      { phrase: '...weil die Verbindung verzögert ist', translation: '...because the connection is delayed' },
      { phrase: 'Als Lösung schlage ich vor...', translation: 'As a solution I propose...' },
    ],
    idealReference:
      'Guten Tag, wir haben ein Problem mit der Datenbank, weil die Verbindung unterbrochen ist. Als Lösung schlage ich einen Neustart des Servers vor.',
    naturalAlternative:
      'Kurzes Update : Der API-Sync verzögert sich, weil die Schnittstelle noch getestet werden muss. Wir stellen heute Nachmittag einen Hotfix bereit.',
    grammarRule:
      'In subordinate clauses introduced by "weil" or "dass", the finite verb moves to the very end: "weil die Verbindung unterbrochen ist".',
    vocabularyRecommendation:
      'In professional German software contexts, use "bereitstellen" (to deploy/provide) and "beheben" (to fix a defect).',
    followUpExercise: {
      prompt: 'Write one subordinate clause with "weil" explaining that tests are running.',
      targetHint: '...weil alle automatisierten Tests derzeit erfolgreich laufen.',
    },
  },

  // ------------------------------------------------------------------------
  // 5. SPANISH: Email Appointment Confirmation (email_reply)
  // ------------------------------------------------------------------------
  {
    id: 'es_write_01_appointment',
    languageId: 'es',
    format: 'email_reply',
    level: 'A2',
    title: 'Confirmación de Cita',
    subtitle: 'Reply to confirm an appointment and ask what documents are required',
    scenario:
      'You received an email from the language advisory center in Madrid confirming your placement appointment.',
    incomingMessage: {
      sender: 'Centro de Idiomas <info@centrodelenguas.es>',
      text: 'Estimado/a estudiante, le confirmamos su cita de asesoramiento para el próximo martes a las 10:00.',
      translation:
        'Dear student, we confirm your advisory appointment for next Tuesday at 10:00.',
    },
    instructions: [
      'Agradezca la confirmación de la cita',
      'Confirme su asistencia el próximo martes',
      'Pregunte qué documentos debe llevar',
      'Use una despedida formal (Un cordial saludo)',
    ],
    minimumWords: 15,
    requiredKeywords: ['gracias', 'cita', 'martes', 'documentos', 'saludo'],
    suggestedExpressions: [
      { phrase: 'Muchas gracias por la confirmación', translation: 'Thank you very much for the confirmation' },
      { phrase: 'Confirmo mi asistencia para el martes', translation: 'I confirm my attendance for Tuesday' },
      { phrase: '¿Qué documentos necesito llevar ?', translation: 'What documents do I need to bring ?' },
      { phrase: 'Un cordial saludo', translation: 'Warm regards' },
    ],
    idealReference:
      'Estimados señores : muchas gracias por la confirmación de la cita. Confirmo mi asistencia para el martes. ¿Qué documentos debo llevar ? Un cordial saludo.',
    naturalAlternative:
      'Agradezco la confirmación. Estaré allí el martes a las diez. ¿Es necesario aportar algún documento de identidad ? Saludos cordiales.',
    grammarRule:
      'Expressions of gratitude take "por" rather than "para": "muchas gracias por su ayuda", never "gracias para".',
    vocabularyRecommendation:
      '"Aportar" or "presentar" is more natural in formal administration contexts than just "traer".',
    followUpExercise: {
      prompt: 'Write one Spanish sentence saying you will arrive 10 minutes early.',
      targetHint: 'Llegaré con diez minutos de antelación para completar el formulario.',
    },
  },

  // ------------------------------------------------------------------------
  // 6. SPANISH: Expressing an Opinion (opinion)
  // ------------------------------------------------------------------------
  {
    id: 'es_write_02_opinion',
    languageId: 'es',
    format: 'opinion',
    level: 'B1',
    title: 'Expresar una Opinión',
    subtitle: 'State your perspective on cultural travel and language immersion',
    scenario:
      'Write a brief paragraph sharing your view on why living or traveling in a country accelerates language learning.',
    instructions: [
      'Inicie con una frase de opinión (En mi opinión / Creo que)',
      'Mencione la práctica diaria con nativos',
      'Concluya con una recomendación',
    ],
    minimumWords: 18,
    requiredKeywords: ['opinion', 'idioma', 'practicar', 'importante'],
    suggestedExpressions: [
      { phrase: 'En mi opinión...', translation: 'In my opinion...' },
      { phrase: 'Es fundamental practicar todos los días', translation: 'It is essential to practice every day' },
      { phrase: 'Hablar con personas locales', translation: 'Speaking with local people' },
    ],
    idealReference:
      'En mi opinión, viajar es la mejor manera de aprender un idioma porque permite practicar todos los días con personas nativas. Es muy importante tener paciencia.',
    naturalAlternative:
      'Desde mi punto de vista, la inmersión cultural acelera el aprendizaje. Hablar a diario con hablantes nativos aporta una fluidez que los libros no pueden dar.',
    grammarRule:
      'Expressions of opinion like "Creo que..." take the indicative when affirmative: "Creo que es importante", but subjunctive when negated: "No creo que sea suficiente".',
    vocabularyRecommendation:
      'Use "Desde mi punto de vista" or "A mi parecer" as sophisticated alternatives to "En mi opinión".',
    followUpExercise: {
      prompt: 'Write one sentence using "Desde mi punto de vista".',
      targetHint: 'Desde mi punto de vista, la constancia diaria es la clave del éxito.',
    },
  },
];

export function getWritingChallengesByLanguage(languageId: LangCode): WritingChallenge[] {
  return WRITING_CHALLENGES_CATALOG.filter((c) => c.languageId === languageId);
}

export function getWritingChallengeById(id: string): WritingChallenge | undefined {
  return WRITING_CHALLENGES_CATALOG.find((c) => c.id === id);
}

export function getWritingChallengesByFormat(
  languageId: LangCode,
  format: WritingPromptFormat
): WritingChallenge[] {
  return WRITING_CHALLENGES_CATALOG.filter(
    (c) => c.languageId === languageId && c.format === format
  );
}
