#!/usr/bin/env node
/**
 * Fictitious club data for the manual's screenshots, loaded into the local Realtime Database
 * emulator (never into the real project). Dates are computed from today so the screens always
 * show a live weekend. Every person is invented except the site owner (the admin account).
 *
 * Usage: node docs/manuel/scripts/seed.mjs [http://127.0.0.1:9000] [namespace]
 */
const DB = process.argv[2] ?? 'http://127.0.0.1:9000';
const NS = process.argv[3] ?? 'demo-blanmont';

// ── Dates (Europe/Brussels) ─────────────────────────────────────────────────
const tz = 'Europe/Brussels';
const isoDay = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(d); // YYYY-MM-DD
const today = new Date(isoDay(new Date()) + 'T12:00:00Z');
const addDays = (d, n) => new Date(d.getTime() + n * 86400000);
const dow = today.getUTCDay(); // 0 = Sunday
const nextSat = addDays(today, (6 - dow + 7) % 7);
const nextSun = addDays(nextSat, 1);
const lastMonday = addDays(today, -((dow + 6) % 7));
const year = today.getUTCFullYear();
const frDate = (d) => isoDay(d).split('-').reverse().join('/');
const at = (d, hhmm) => new Date(isoDay(d) + 'T' + hhmm + ':00Z').toISOString();

// Deterministic pseudo-random numbers, so two runs give the same screens.
let seed = 42;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const pick = (a) => a[Math.floor(rnd() * a.length)];

// ── Members ─────────────────────────────────────────────────────────────────
const people = [
  ['m-nicolas', 'Nicolas Bruyère', ['Admin'], 'A', 'nicolas@exemple.be'],
  ['m-paul', 'Paul Hermans', ['Président'], 'B', 'paul.hermans@exemple.be'],
  ['m-anne', 'Anne Dumont', ['Trésorier'], 'BC', 'anne.dumont@exemple.be'],
  ['m-sophie', 'Sophie Martin', ['Secrétaire'], 'C', 'sophie.martin@exemple.be'],
  ['m-marc', 'Marc Lambert', ['Capitaine de Route'], 'A', 'marc.lambert@exemple.be'],
  ['m-luc', 'Luc Vandenberghe', ['Capitaine de Route', 'Traceur'], 'B', 'luc.vandenberghe@exemple.be'],
  ['m-julie', 'Julie Renard', ['Member'], 'B', 'julie.renard@exemple.be'],
  ['m-thomas', 'Thomas Leclercq', ['Member'], 'A', 'thomas.leclercq@exemple.be'],
  ['m-claire', 'Claire Dubois', ['Member'], 'BC', 'claire.dubois@exemple.be'],
  ['m-olivier', 'Olivier Mertens', ['Member'], 'B', 'olivier.mertens@exemple.be'],
  ['m-isabelle', 'Isabelle Collard', ['Member'], 'C', 'isabelle.collard@exemple.be'],
  ['m-pierre', 'Pierre Gilson', ['Member', 'Resp. section VTT'], 'VTT', 'pierre.gilson@exemple.be'],
  ['m-francois', 'François Delvaux', ['Member'], 'A', 'francois.delvaux@exemple.be'],
  ['m-nathalie', 'Nathalie Pirson', ['Member'], 'BC', 'nathalie.pirson@exemple.be'],
  ['m-jean', 'Jean-Marie Lejeune', ['Member'], 'C', 'jeanmarie.lejeune@exemple.be'],
  ['m-david', 'David Wauters', ['Member'], 'B', 'david.wauters@exemple.be'],
  ['m-caroline', 'Caroline Henrard', ['Member'], 'VTT', 'caroline.henrard@exemple.be'],
  ['m-eric', 'Éric Bastin', ['Member'], 'A', 'eric.bastin@exemple.be'],
  ['m-martine', 'Martine Goffin', ['Member'], 'C', 'martine.goffin@exemple.be'],
  ['m-vincent', 'Vincent Lambotte', ['Member'], 'B', 'vincent.lambotte@exemple.be'],
  ['m-laurence', 'Laurence Thiry', ['Member'], 'BC', 'laurence.thiry@exemple.be'],
  ['m-xavier', 'Xavier Deprez', ['Member'], 'A', 'xavier.deprez@exemple.be'],
  ['m-helene', 'Hélène Masson', ['Member'], 'C', 'helene.masson@exemple.be'],
  ['m-bruno', 'Bruno Gérard', ['Member'], 'VTT', 'bruno.gerard@exemple.be'],
];
const relations = ['Épouse', 'Époux', 'Parent', 'Enfant', 'Ami'];
const firstNames = ['Marie', 'Alain', 'Christine', 'Philippe', 'Véronique', 'Michel', 'Sylvie'];
const members = {};
people.forEach(([id, name, role, group, email], i) => {
  const status = i % 7 === 3 ? 'pending' : i % 11 === 5 ? 'exempt' : 'paid';
  members[id] = {
    name,
    role,
    bio: i < 6 ? 'Au club depuis ' + (2008 + i) + '. Toujours partant pour les sorties du samedi.' : '',
    photoUrl: '/images/default-avatar.svg',
    email,
    phone: `+32 47${i % 10} ${String(10 + i).padStart(2, '0')} ${String(20 + i * 3).padStart(2, '0')} ${String(30 + i).padStart(2, '0')}`,
    preferredGroup: group,
    cotisation2026Status: status,
    ...(status === 'paid' ? { cotisation2026PaidAt: `${year}-0${1 + (i % 3)}-${String(10 + i).padStart(2, '0')}` } : {}),
    ffbcLicenseNumber: i % 4 === 2 ? '' : `FFBC-${year}-${String(4100 + i * 37)}`,
    ...(i % 3 === 0 ? { stravaId: String(12000000 + i * 4217) } : {}),
    iceContactName: `${pick(firstNames)} ${name.split(' ').slice(-1)[0]}`,
    iceContactPhone: `+32 49${i % 10} ${String(40 + i).padStart(2, '0')} ${String(11 + i).padStart(2, '0')} ${String(60 + i).padStart(2, '0')}`,
    iceRelationship: pick(relations),
  };
});
const ids = Object.keys(members);

// ── Calendar: every Saturday of the current year (+ some Sundays) ────────────
// Kept inside the current year: Statistiques opens on the most recent year found in the data,
// and the Carré Vert counts the possible squares from this calendar.
const villages = [
  ['Blanmont', 'Place de la Féchère'],
  ['Walhain', 'Place de Walhain'],
  ['Perbais', 'Église de Perbais'],
  ['Mont-Saint-Guibert', 'Place communale'],
  ['Corbais', 'Rue de la Station'],
  ['Gentinnes', 'Mémorial Kongolo'],
];
const calendar = {};
const pastSaturdays = [];
const firstW = -Math.floor((nextSat - new Date(Date.UTC(year, 0, 1))) / (7 * 86400000));
for (let w = firstW; w <= 10; w++) {
  const d = addDays(nextSat, w * 7);
  if (d.getUTCFullYear() !== year) break;
  const [loc, addr] = w % 3 === 0 ? villages[0] : villages[Math.abs(w) % villages.length];
  const key = `event_${isoDay(d).replaceAll('-', '')}`;
  calendar[key] = {
    isoDate: isoDay(d),
    location: loc,
    address: addr,
    departure: '13h00',
    distances: pick(['60-75', '70-90', '75-95', '80-100']),
    group: 'Tous groupes',
    remarks: w === 0 ? 'Prévoir des garde-boue et un éclairage arrière.' : '',
    alternative: w === 0 ? 'Parcours court de 55 km en cas de pluie.' : '',
    gpxUrl: w % 2 === 0 ? 'https://www.komoot.com/fr-fr/tour/1234567' : '',
    createdAt: at(addDays(today, -60), '09:00'),
  };
  if (w < 0) pastSaturdays.push([key, d]);
  if (w % 4 === 1) {
    const s = addDays(d, 1);
    calendar[`event_${isoDay(s).replaceAll('-', '')}`] = {
      isoDate: isoDay(s), location: 'Blanmont', address: 'Place de la Féchère', departure: '09h00',
      distances: '45-60', group: 'VTT', remarks: 'Sortie VTT, chemins de campagne.', alternative: '', gpxUrl: '',
      createdAt: at(addDays(today, -60), '09:00'),
    };
  }
}

// ── Attendance + leaderboard (Carré Vert) for the past rides of this year ────
const attendance = {};
const leaderboard = {};
ids.forEach((id) => (leaderboard[id] = { name: members[id].name, group: members[id].preferredGroup, rides: 0, dates: [], createdAt: `${year}-01-02T08:00:00.000Z` }));
for (let w = 1; w <= 40; w++) {
  const d = addDays(nextSat, -7 * w);
  if (d.getUTCFullYear() !== year) break;
  const key = `event_${isoDay(d).replaceAll('-', '')}`;
  const present = {};
  ids.forEach((id, i) => {
    const assiduity = 0.25 + ((i * 37) % 70) / 100; // 25 % … 95 %
    if (rnd() < assiduity) {
      present[id] = { memberId: id, name: members[id].name, group: members[id].preferredGroup, markedAt: at(d, '12:52') };
      leaderboard[id].dates.push(frDate(d));
    }
  });
  attendance[key] = { eventId: key, isoDate: isoDay(d), updatedAt: at(d, '13:05'), members: present };
}
ids.forEach((id) => {
  leaderboard[id].rides = leaderboard[id].dates.length;
  leaderboard[id].updatedAt = new Date().toISOString();
});

// ── Weekend poll ────────────────────────────────────────────────────────────
const pollId = `poll_${isoDay(nextSat).replaceAll('-', '')}`;
const prevPollId = `poll_${isoDay(addDays(nextSat, -7)).replaceAll('-', '')}`;
const polls = {
  [pollId]: {
    id: pollId,
    title: `Sortie du Weekend - ${isoDay(nextSat)} (Blanmont)`,
    weekendIsoDate: isoDay(nextSat),
    description: 'Sortie officielle du club au départ de Blanmont (Place de la Féchère).\nIndiquez vos disponibilités et votre groupe de niveau pour les sorties de ce weekend.',
    status: 'active',
    createdAt: at(lastMonday, '06:00'),
    customQuestions: [{ id: 'q-1', title: 'Pause café à mi-parcours ?', options: ['Oui', 'Non', 'Peu importe'], allowMultiple: false }],
  },
  [prevPollId]: {
    id: prevPollId,
    title: `Sortie du Weekend - ${isoDay(addDays(nextSat, -7))} (Blanmont)`,
    weekendIsoDate: isoDay(addDays(nextSat, -7)),
    description: 'Sortie officielle du club au départ de Blanmont.',
    status: 'closed',
    createdAt: at(addDays(lastMonday, -7), '06:00'),
    closedAt: at(addDays(nextSat, -8), '18:00'),
  },
};
const groupChoice = { A: 'Groupe A', B: 'Groupe B', BC: 'Groupe BC', C: 'Groupe C', VTT: 'Groupe VTT' };
const slotsPool = [['samedi-matin'], ['samedi-matin', 'dimanche-matin'], ['samedi-apres-midi'], ['dimanche-matin'], ['samedi-matin']];
const pollResponses = { [pollId]: {}, [prevPollId]: {} };
ids.slice(0, 19).forEach((id, i) => {
  const absent = i % 9 === 8;
  const g = members[id].preferredGroup;
  pollResponses[pollId][id] = {
    id, pollId, memberId: id, memberName: members[id].name,
    ...(absent ? {} : { slots: g === 'VTT' ? ['dimanche-matin'] : slotsPool[i % slotsPool.length], groupChoice: groupChoice[g] }),
    ...(g === 'B' && !absent ? { groupVariant: i % 2 ? 'plus' : 'moins' } : {}),
    ...(absent ? {} : { customAnswers: { 'q-1': pick(['Oui', 'Oui', 'Non', 'Peu importe']) } }),
    ...(i === 2 ? { comment: 'Je pars avec le GR3, retour vers 12h30.' } : {}),
    updatedAt: at(addDays(lastMonday, 1 + (i % 4)), `${String(8 + (i % 12)).padStart(2, '0')}:1${i % 6}`),
  };
});
ids.slice(2, 16).forEach((id, i) => {
  pollResponses[prevPollId][id] = { id, pollId: prevPollId, memberId: id, memberName: members[id].name, slots: ['samedi-matin'], groupChoice: groupChoice[members[id].preferredGroup], updatedAt: at(addDays(lastMonday, -5), '19:00') };
});

// ── Traces ──────────────────────────────────────────────────────────────────
const traces = {
  trace_01: { name: 'Boucle de l’Orne et de la Thyle', distance: 72.4, elevation: 610, surface: 'Road', quality: 5, rating: '⭐⭐⭐⭐⭐', direction: 'South-West', start: 'Blanmont', end: 'Blanmont', description: 'Classique du club par Villers-la-Ville et les côtes de la Thyle.', mapUrl: 'https://www.komoot.com/fr-fr/tour/1000001', gpxUrl: 'https://example.org/orne-thyle.gpx', photoUrl: '/images/IMG_7627.JPG', status: 'Done', lastDone: isoDay(addDays(today, -21)), createdAt: `${year}-02-10T10:00:00.000Z` },
  trace_02: { name: 'Grand tour de Gembloux', distance: 88.1, elevation: 740, surface: 'Road', quality: 4, rating: '⭐⭐⭐⭐', direction: 'South-East', start: 'Blanmont', end: 'Blanmont', description: 'Par Ernage, Gembloux et le retour par Walhain.', mapUrl: 'https://www.komoot.com/fr-fr/tour/1000002', gpxUrl: 'https://example.org/gembloux.gpx', photoUrl: '/images/IMG_5777.JPG', status: 'Done', lastDone: isoDay(addDays(today, -35)), createdAt: `${year}-03-02T10:00:00.000Z` },
  trace_03: { name: 'Vallée de la Dyle', distance: 64.0, elevation: 520, surface: 'Road', quality: 4, rating: '⭐⭐⭐⭐', direction: 'North', start: 'Blanmont', end: 'Blanmont', description: 'Mont-Saint-Guibert, Ottignies et le retour par Corbais.', mapUrl: 'https://www.komoot.com/fr-fr/tour/1000003', gpxUrl: 'https://example.org/dyle.gpx', photoUrl: '/images/home-hero.jpg', status: 'Done', lastDone: isoDay(addDays(today, -49)), createdAt: `${year}-03-20T10:00:00.000Z` },
  trace_04: { name: 'Hesbaye et Perwez', distance: 96.5, elevation: 690, surface: 'Road', quality: 3, rating: '⭐⭐⭐', direction: 'East', start: 'Blanmont', end: 'Blanmont', description: 'Longue sortie plate vers Perwez et Grand-Leez.', mapUrl: 'https://www.komoot.com/fr-fr/tour/1000004', gpxUrl: 'https://example.org/perwez.gpx', photoUrl: '/images/IMG_8019.JPG', status: 'Done', lastDone: isoDay(addDays(today, -63)), createdAt: `${year}-04-12T10:00:00.000Z` },
  trace_05: { name: 'Chemins de Gentinnes (VTT)', distance: 38.2, elevation: 430, surface: 'VTT', quality: 4, rating: '⭐⭐⭐⭐', direction: 'South', start: 'Blanmont', end: 'Blanmont', description: 'Sentiers et chemins agricoles, boue garantie en hiver.', mapUrl: 'https://www.komoot.com/fr-fr/tour/1000005', gpxUrl: 'https://example.org/gentinnes.gpx', photoUrl: '', status: 'Done', lastDone: isoDay(addDays(today, -14)), createdAt: `${year}-05-03T10:00:00.000Z` },
  trace_06: { name: 'Gravel du Bois de Buis', distance: 52.7, elevation: 480, surface: 'Gravel', quality: 3, rating: '⭐⭐⭐', direction: 'North-West', start: 'Blanmont', end: 'Blanmont', description: 'Mélange de routes calmes et de chemins stabilisés.', mapUrl: 'https://www.komoot.com/fr-fr/tour/1000006', gpxUrl: 'https://example.org/bois-de-buis.gpx', photoUrl: '', status: 'Done', lastDone: isoDay(addDays(today, -70)), createdAt: `${year}-06-15T10:00:00.000Z` },
};
const feedback = {
  fb_1: { traceId: 'trace_01', comment: 'Superbe parcours, revêtement correct.', rating: 5, memberName: 'Julie Renard', memberId: 'm-julie', createdAt: at(addDays(today, -20), '15:00') },
  fb_2: { traceId: 'trace_02', comment: 'Un peu long en hiver.', rating: 4, memberName: 'Claire Dubois', memberId: 'm-claire', createdAt: at(addDays(today, -34), '16:00') },
  fb_3: { traceId: 'trace_03', comment: 'Attention aux travaux à Ottignies.', rating: 4, memberName: 'Olivier Mertens', memberId: 'm-olivier', createdAt: at(addDays(today, -48), '17:00') },
};
const rideId = `ride_${isoDay(nextSat).replaceAll('-', '')}`;
const saturdayRides = { [rideId]: { id: rideId, date: isoDay(nextSat), status: 'Voting', candidateTraceIds: ['trace_01', 'trace_02', 'trace_03'], createdAt: at(lastMonday, '10:00') } };
const votes = {};
ids.slice(0, 11).forEach((id, i) => (votes[`vote_${i}`] = { id: `vote_${i}`, rideId, memberId: id, traceId: ['trace_01', 'trace_02', 'trace_03'][i % 3], createdAt: at(addDays(lastMonday, 1), '20:00') }));

// ── Event reviews (debrief of last Saturday) ────────────────────────────────
const [lastKey] = pastSaturdays[pastSaturdays.length - 1];
const eventReviews = {
  [lastKey]: {
    'm-julie': { id: 'm-julie', eventId: lastKey, memberId: 'm-julie', memberName: 'Julie Renard', memberGroup: 'Groupe B', rating: 5, comment: 'Très bonne ambiance, allure bien tenue.', effort: 'modere', pace: 'parfait', roadCondition: 'bonne', weatherEncountered: 'froid', createdAt: at(addDays(nextSat, -7), '17:00') },
    'm-olivier': { id: 'm-olivier', eventId: lastKey, memberId: 'm-olivier', memberName: 'Olivier Mertens', memberGroup: 'Groupe B', rating: 4, comment: 'Routes grasses après Perbais.', effort: 'soutenu', pace: 'parfait', roadCondition: 'degradee', weatherEncountered: 'vent', createdAt: at(addDays(nextSat, -7), '18:30') },
  },
};

// ── Blog ────────────────────────────────────────────────────────────────────
const blog = {
  post_1: { title: 'Assemblée générale : le bilan de la saison', slug: 'assemblee-generale-le-bilan-de-la-saison', excerpt: 'Kilomètres, Carré Vert et projets : ce qu’il faut retenir de l’assemblée du club.', content: '<h2>Une belle saison</h2><p>Merci à toutes et tous pour votre présence aux sorties du samedi.</p><ul><li>Plus de 40 sorties organisées</li><li>Un nouveau groupe VTT</li></ul><p>Rendez-vous au départ samedi prochain.</p>', coverImage: '/images/IMG_5777.JPG', author: 'Paul Hermans', authorAvatar: '/images/default-avatar.svg', publishedAt: at(addDays(today, -3), '18:00'), category: 'Vie du club', isPublished: true },
  post_2: { title: 'Les nouveaux maillots arrivent', slug: 'les-nouveaux-maillots-arrivent', excerpt: 'La commande groupée est ouverte jusqu’à mi-décembre. Tailles et paiement : mode d’emploi.', content: '<p>La commande groupée des maillots est ouverte. Commandez depuis la boutique du club et payez par virement avec la communication structurée.</p>', coverImage: '/images/IMG_8019.JPG', author: 'Anne Dumont', authorAvatar: '/images/default-avatar.svg', publishedAt: at(addDays(today, -10), '09:30'), category: 'Équipement', isPublished: true },
  post_3: { title: 'Récit : la boucle de l’Orne sous le soleil', slug: 'recit-la-boucle-de-lorne-sous-le-soleil', excerpt: 'Trente cyclistes au départ de la Féchère pour la classique du club.', content: '<p>Trente cyclistes au départ, trois groupes et une pause café à Villers-la-Ville.</p>', coverImage: '/images/IMG_7627.JPG', author: 'Marc Lambert', authorAvatar: '/images/default-avatar.svg', publishedAt: at(addDays(today, -24), '20:00'), category: 'Récits de sortie', isPublished: true },
  post_4: { title: 'Rouler en hiver : nos conseils sécurité', slug: 'rouler-en-hiver-nos-conseils-securite', excerpt: 'Éclairage, vêtements, distances : les rappels des capitaines de route.', content: '<p>Éclairage avant et arrière obligatoires dès la tombée du jour.</p>', coverImage: '/images/home-hero.jpg', author: 'Luc Vandenberghe', authorAvatar: '/images/default-avatar.svg', publishedAt: at(addDays(today, -40), '12:00'), category: 'Sécurité', isPublished: true },
};

// ── Galleries ───────────────────────────────────────────────────────────────
const covers = ['/images/IMG_5777.JPG', '/images/IMG_7627.JPG', '/images/IMG_8019.JPG', '/images/home-hero.jpg'];
const galleries = {};
[
  ['Sortie de rentrée', 'Sorties', true, true],
  ['Week-end dans les Ardennes', 'Ardennes & Stages', true, false],
  ['Souper du club', 'Événements', false, false],
  ['Boucle de l’Orne', 'Sorties', false, false],
  ['Présentation des maillots', 'Équipements', false, true],
  ['Sortie VTT de Gentinnes', 'Sorties', false, false],
].forEach(([title, category, featured, isPublic], i) => {
  galleries[`album_${year}_${i + 1}`] = {
    title: `${title} · Saison ${year}`, description: 'Les photos de la journée, partagées par les membres.', year, category,
    coverUrl: covers[i % covers.length], externalAlbumUrl: 'https://photos.app.goo.gl/exemple', photoCount: 12 + i * 7,
    featured, isPublic, createdAt: at(addDays(today, -10 - i * 18), '10:00'), images: [covers[i % 4], covers[(i + 1) % 4], covers[(i + 2) % 4]],
  };
});

// ── Home banner and groups ──────────────────────────────────────────────────
const heroSettings = {
  badge: 'Peloton CC Saint-Martin · Blanmont',
  slides: [
    { id: 'slide_1', url: '/images/home-hero.jpg', alt: 'Le peloton au départ de Blanmont', position: 'center 30%' },
    { id: 'slide_2', url: '/images/IMG_8019.JPG', alt: 'Sortie du samedi', position: 'center center' },
  ],
  cards: [
    { id: 'card-1', icon: 'pin', label: 'Rassemblement', value: 'Place de Blanmont', detail: '' },
    { id: 'card-2', icon: 'calendar', label: 'Samedi', value: '13h00', detail: '· Route' },
    { id: 'card-3', icon: 'calendar', label: 'Dimanche', value: '9h00', detail: '· Route & VTT' },
    { id: 'card-4', icon: 'group', label: 'Allures', value: 'GR1 à GR4 & VTT', detail: '' },
  ],
  updatedAt: at(addDays(today, -30), '09:00'),
};
const groupSettings = {
  groups: [
    { code: 'A', label: 'GR1' },
    { code: 'B', label: 'GR2' },
    { code: 'BC', label: 'GR3' },
    { code: 'C', label: 'GR4' },
    { code: 'VTT', label: 'VTT' },
  ],
  updatedAt: at(addDays(today, -20), '10:00'),
};

// ── Trial requests ──────────────────────────────────────────────────────────
const trial = {
  trial_1: { name: 'Antoine Lemaire', email: 'antoine.lemaire@exemple.be', phone: '+32 478 11 22 33', preferredGroup: 'B', bikeType: 'Route', experienceLevel: 'Intermédiaire', firstRideDate: isoDay(nextSat), message: 'Je roule seul depuis deux ans, environ 3 000 km par an. J’aimerais découvrir le club.', status: 'pending', createdAt: at(addDays(today, -1), '21:14') },
  trial_2: { name: 'Camille Noël', email: 'camille.noel@exemple.be', phone: '+32 471 44 55 66', preferredGroup: 'C', bikeType: 'VAE', experienceLevel: 'Débutant', message: 'Vélo électrique, est-ce possible avec vous ?', status: 'pending', createdAt: at(addDays(today, -2), '10:02') },
  trial_3: { name: 'Romain Fontaine', email: 'romain.fontaine@exemple.be', phone: '+32 475 77 88 99', preferredGroup: 'A', bikeType: 'Route', experienceLevel: 'Confirmé', status: 'ride_1', mentorCaptainId: 'm-marc', mentorCaptainName: 'Marc Lambert', contactedAt: at(addDays(today, -12), '18:00'), adminNotes: 'Bon niveau, à revoir avec le GR1.', createdAt: at(addDays(today, -15), '08:40') },
  trial_4: { name: 'Elise Moreau', email: 'elise.moreau@exemple.be', phone: '+32 476 12 98 34', preferredGroup: 'BC', bikeType: 'Gravel', experienceLevel: 'Intermédiaire', status: 'contacted', mentorCaptainId: 'm-luc', mentorCaptainName: 'Luc Vandenberghe', contactedAt: at(addDays(today, -4), '19:30'), createdAt: at(addDays(today, -6), '12:00') },
  trial_5: { name: 'Hugo Lambert', email: 'hugo.lambert@exemple.be', phone: '+32 470 65 43 21', preferredGroup: 'B', bikeType: 'Route', experienceLevel: 'Intermédiaire', status: 'converted', mentorCaptainName: 'Marc Lambert', createdAt: at(addDays(today, -60), '09:00') },
};

// ── Equipment, campaign, orders, bank ───────────────────────────────────────
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const stock = (arr) => Object.fromEntries(sizes.map((s, i) => [s, arr[i]]));
const equipment = {
  MaiCXPRO: { name: 'Maillot Manche courte CX PRO Homme', category: 'Maillot', description: 'Maillot manche courte CX PRO, coupe ajustée.', price: 83, sizes, stock: stock([0, 1, 3, 2, 1, 0]), imageUrl: '/images/equipment/MaiCXPRO.jpg', gallery: [], isAvailable: true, order: 1, gobikReference: 'SHORT SLEEVE JERSEY CX PRO MEN CUSTOM', productCode: 'MaiCXPRO', cut: 'Slim fit' },
  MaiManLonHO: { name: 'Maillot Manche longue HYDER Homme', category: 'Maillot', description: 'Maillot manche longue HYDER modèle Homme.', price: 83, sizes, stock: stock([0, 0, 1, 0, 0, 0]), imageUrl: '/images/equipment/MaiManLonHO.jpg', gallery: [], isAvailable: true, order: 2, gobikReference: 'LONG SLEEVE JERSEY HYDER MEN CUSTOM', productCode: 'MaiManLonHO', cut: 'Regular fit' },
  VesteHO: { name: 'Veste Homme', category: 'Veste', description: 'Veste thermique modèle Homme.', price: 105, sizes, stock: stock([0, 0, 0, 1, 0, 0]), imageUrl: '/images/equipment/VesteHO.jpg', gallery: [], isAvailable: true, order: 3, gobikReference: 'JACKET MIST MEN CUSTOM', productCode: 'VesteHO', cut: 'Regular fit' },
  CuiCouHo: { name: 'Cuissard court Homme', category: 'Short', description: 'Cuissard à bretelles, peau longue distance.', price: 95, sizes, stock: stock([0, 2, 2, 1, 0, 0]), imageUrl: '/images/equipment/CuiCouHo.jpg', gallery: [], isAvailable: true, order: 4, gobikReference: 'BIB SHORTS LIMITED MEN', productCode: 'CuiCouHo', cut: 'Standard' },
  CoupeVent: { name: 'Coupe-vent', category: 'Veste', description: 'Coupe-vent léger et compressible.', price: 60, sizes, stock: stock([0, 1, 1, 1, 1, 0]), imageUrl: '/images/equipment/CoupeVent.jpg', gallery: [], isAvailable: true, order: 5, gobikReference: 'WINDBREAKER PLUS MEN', productCode: 'CoupeVent', cut: 'Standard' },
  Chaussettes: { name: 'Chaussettes du club', category: 'Accessoire', description: 'Chaussettes mi-hautes aux couleurs du club.', price: 12, sizes: ['S', 'M', 'L'], stock: { S: 4, M: 6, L: 3 }, imageUrl: '/images/equipment/Chaussettes.jpg', gallery: [], isAvailable: false, order: 6, productCode: 'Chaussettes', cut: 'Standard' },
};

// Belgian structured communication: 10 digits + mod 97 check (97 when 0).
const ogm = (n) => {
  const base = String(n).padStart(10, '0');
  const check = Number(BigInt(base) % 97n) || 97;
  return base + String(check).padStart(2, '0');
};
const campaignId = `campaign_${year}_maillots`;
const campaigns = {
  [campaignId]: { id: campaignId, title: `Maillots ${year + 1}`, equipmentIds: ['MaiCXPRO', 'MaiManLonHO', 'CuiCouHo'], closesAt: at(addDays(today, 16), '19:00'), status: 'open', extraStock: { MaiCXPRO: { M: 2, L: 2 }, CuiCouHo: { M: 1 } }, createdAt: at(addDays(today, -12), '09:00') },
  [`campaign_${year}_vestes`]: { id: `campaign_${year}_vestes`, title: `Vestes d’hiver ${year}`, equipmentIds: ['VesteHO'], closesAt: at(addDays(today, -40), '19:00'), status: 'received', supplierOrderedAt: at(addDays(today, -38), '10:00'), receivedAt: at(addDays(today, -9), '16:00'), createdAt: at(addDays(today, -70), '09:00') },
};
const orders = {};
const bank = {};
let counter = 1000000130;
const mkOrder = (key, who, items, extra) => {
  const ref = ogm(++counter);
  const total = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
  orders[key] = { id: key, memberId: who, memberName: members[who].name, memberEmail: members[who].email, memberPhone: members[who].phone, items, totalPrice: total, paymentReference: ref, createdAt: at(addDays(today, -8), '20:10'), ...extra };
  return { ref, total };
};
const it = (id, size, quantity = 1) => ({ equipmentId: id, equipmentName: equipment[id].name, size, quantity, unitPrice: equipment[id].price });
const o1 = mkOrder('order_001', 'm-julie', [it('MaiCXPRO', 'S'), it('CuiCouHo', 'S')], { status: 'paid', source: 'campaign', campaignId, paidAt: isoDay(addDays(today, -5)), bankTransactionId: 'a1b2c3d4e5f607182930' });
mkOrder('order_002', 'm-thomas', [it('MaiCXPRO', 'L')], { status: 'pending', source: 'campaign', campaignId });
const o3 = mkOrder('order_003', 'm-claire', [it('MaiManLonHO', 'M')], { status: 'pending', source: 'campaign', campaignId });
mkOrder('order_004', 'm-olivier', [it('MaiCXPRO', 'M'), it('MaiManLonHO', 'M')], { status: 'paid', source: 'campaign', campaignId, paidAt: isoDay(addDays(today, -3)) });
mkOrder('order_005', 'm-david', [it('CoupeVent', 'L')], { status: 'delivered', source: 'stock', paidAt: isoDay(addDays(today, -20)), deliveredAt: at(addDays(today, -14), '13:10') });
const o6 = mkOrder('order_006', 'm-nathalie', [it('VesteHO', 'S')], { status: 'paid', source: 'campaign', campaignId: `campaign_${year}_vestes`, paidAt: isoDay(addDays(today, -50)) });
mkOrder('order_007', 'm-francois', [it('CuiCouHo', 'M')], { status: 'cancelled', source: 'stock', cancelledAt: at(addDays(today, -6), '09:00') });
mkOrder('order_008', 'm-vincent', [it('MaiCXPRO', 'XL')], { status: 'pending', source: 'stock' });
const fmt = (r) => `+++${r.slice(0, 3)}/${r.slice(3, 7)}/${r.slice(7)}+++`;
bank['a1b2c3d4e5f607182930'] = { id: 'a1b2c3d4e5f607182930', importedAt: at(addDays(today, -4), '08:00'), valueDate: isoDay(addDays(today, -5)), amountCents: o1.total * 100, counterpartyName: 'JULIE RENARD', counterpartyIbanLast4: '4417', communication: fmt(o1.ref), reference: o1.ref, status: 'matched', orderId: 'order_001' };
bank['b2c3d4e5f60718293a4b'] = { id: 'b2c3d4e5f60718293a4b', importedAt: at(addDays(today, -4), '08:00'), valueDate: isoDay(addDays(today, -4)), amountCents: 7000, counterpartyName: 'CLAIRE DUBOIS', counterpartyIbanLast4: '7061', communication: fmt(o3.ref), reference: o3.ref, status: 'unmatched', reason: 'amount-mismatch' };
bank['c3d4e5f60718293a4b5c'] = { id: 'c3d4e5f60718293a4b5c', importedAt: at(addDays(today, -4), '08:00'), valueDate: isoDay(addDays(today, -6)), amountCents: 8300, counterpartyName: 'T. LECLERCQ', counterpartyIbanLast4: '1290', communication: 'Maillot Thomas taille L', status: 'unmatched', reason: 'no-reference' };
bank['d4e5f60718293a4b5c6d'] = { id: 'd4e5f60718293a4b5c6d', importedAt: at(addDays(today, -4), '08:00'), valueDate: isoDay(addDays(today, -6)), amountCents: 4500, counterpartyName: 'COTISATION G. MARTIN', counterpartyIbanLast4: '5512', communication: 'Cotisation 2027', status: 'ignored', reason: 'no-reference' };
bank['e5f60718293a4b5c6d7e'] = { id: 'e5f60718293a4b5c6d7e', importedAt: at(addDays(today, -52), '08:00'), valueDate: isoDay(addDays(today, -50)), amountCents: o6.total * 100, counterpartyName: 'NATHALIE PIRSON', counterpartyIbanLast4: '8800', communication: fmt(o6.ref), reference: o6.ref, status: 'matched', orderId: 'order_006' };

// ── Activity log (current month, UTC) ───────────────────────────────────────
const ym = new Date().toISOString().slice(0, 7);
const logs = {};
const now = Date.now();
const logEvents = [
  ['auth', 'auth:login_success', 'Connexion réussie : Anne Dumont', 'info', 'm-anne', 0.2],
  ['participation', 'participation:weekend_poll_answered', 'Réponse au sondage du weekend : Julie Renard', 'info', 'm-julie', 0.5],
  ['navigation', 'traces:gpx_download', 'Téléchargement GPX : Boucle de l’Orne et de la Thyle', 'info', null, 1.1],
  ['admin', 'admin:attendance_marked', 'Présence pointée : Thomas Leclercq', 'info', 'm-marc', 2.3],
  ['security', 'security:unauthorized_admin_api', 'Accès refusé à une API d’administration', 'security', null, 3.4],
  ['auth', 'auth:login_failure', 'Échec de connexion (identifiants invalides)', 'warn', null, 4.0],
  ['participation', 'participation:saturday_vote', 'Vote pour le parcours du samedi : Olivier Mertens', 'info', 'm-olivier', 5.2],
  ['navigation', 'page:view', 'Consultation : Calendrier des sorties', 'info', null, 6.1],
  ['auth', 'auth:activation_requested', 'Demande d’activation de compte : Camille Noël', 'info', null, 7.5],
  ['admin', 'admin:attendance_removed', 'Présence retirée : David Wauters', 'warn', 'm-luc', 9.0],
  ['navigation', 'traces:map_click', 'Ouverture de la carte : Vallée de la Dyle', 'info', null, 11.2],
  ['auth', 'auth:logout', 'Déconnexion : Sophie Martin', 'info', 'm-sophie', 13.0],
  ['participation', 'participation:event_review_submitted', 'Avis sur la sortie : Julie Renard', 'info', 'm-julie', 20.5],
  ['navigation', 'calendar:subscribe_click', 'Abonnement au calendrier (.ics)', 'info', null, 26.0],
  ['security', 'security:forbidden_admin_api', 'Accès interdit à une section (rôle insuffisant)', 'security', 'm-julie', 30.0],
];
logEvents.forEach(([category, action, title, severity, who, hoursAgo], i) => {
  const ts = Math.max(now - hoursAgo * 3600000, Date.parse(ym + '-01T00:30:00Z') + i * 60000);
  const key = `log_${ts}_${(1000 + i).toString(36)}`;
  logs[key] = {
    id: key, timestamp: new Date(ts).toISOString(), timestampMs: ts, yearMonth: ym, category, action, title, severity,
    user: who ? { isAuthenticated: true, userId: who, userName: members[who].name, userEmail: members[who].email, role: members[who].role } : { isAuthenticated: false, visitorId: `anon_${(7777 + i * 13).toString(36)}` },
    context: { path: pick(['/', '/calendrier', '/traces', '/sondage', '/admin/pointage-express']), referrer: '', userAgent: 'Mozilla/5.0', deviceType: i % 3 === 0 ? 'mobile' : 'desktop', ip: `81.244.${10 + i}.xxx` },
    metadata: {},
    review: { status: i === 4 ? 'flagged' : i % 4 === 1 ? 'reviewed' : 'unreviewed', ...(i % 4 === 1 ? { reviewedBy: 'Nicolas Bruyère', reviewedAt: new Date(ts + 3600000).toISOString() } : {}) },
  };
});

// ── Assemble and load ───────────────────────────────────────────────────────
const data = {
  members,
  'calendar-events': calendar,
  attendance,
  leaderboard,
  'weekend-polls': polls,
  'weekend-poll-responses': pollResponses,
  traces,
  feedback,
  'saturday-rides': saturdayRides,
  votes,
  'event-reviews': eventReviews,
  blog,
  galleries,
  'hero-settings': heroSettings,
  'group-settings': groupSettings,
  'trial-requests': trial,
  equipment,
  'equipment-campaigns': campaigns,
  'equipment-orders': orders,
  'bank-transactions': bank,
  counters: { 'payment-reference': counter },
  settings: { payment: { beneficiary: 'CC Saint-Martin Blanmont', iban: 'BE68539007547034', bic: 'GKCCBEBB', updatedAt: at(addDays(today, -26), '09:00') } },
  'visual-feedback-settings': { enabled: false, audience: 'admins', updatedAt: at(addDays(today, -1), '09:00'), updatedBy: 'm-nicolas' },
  'activity-logs': { [ym]: logs },
};

const res = await fetch(`${DB}/.json?ns=${NS}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'content-type': 'application/json' } });
if (!res.ok) {
  console.error('Seed failed', res.status, await res.text());
  process.exit(1);
}
// Exit explicitly: the emulator keeps the HTTP connection alive, which would hold Node open.
console.log(`Seeded ${NS}: ${ids.length} members, ${Object.keys(calendar).length} rides, poll ${pollId} (weekend ${isoDay(nextSat)}), ${Object.keys(orders).length} orders.`);
process.exit(0);
