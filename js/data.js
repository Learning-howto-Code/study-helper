// Word list storage, persisted to localStorage.

const DEFAULT_WORDS = [
  { term: 'ubiquitous', def: 'present or found everywhere' },
  { term: 'ephemeral', def: 'lasting a very short time' },
  { term: 'candor', def: 'honest, direct speech' },
  { term: 'pragmatic', def: 'practical rather than idealistic' },
  { term: 'ambivalent', def: 'having mixed feelings' },
  { term: 'tenacious', def: 'persistent; refusing to let go' },
  { term: 'lucid', def: 'clear and easy to understand' },
  { term: 'alacrity', def: 'cheerful willingness; eagerness' },
  { term: 'convoluted', def: 'complicated and hard to follow' },
  { term: 'eloquent', def: 'fluent and persuasive with words' },
  { term: 'frugal', def: 'careful with money; thrifty' },
  { term: 'gregarious', def: 'sociable; enjoys company' },
  { term: 'hackneyed', def: 'overused and unoriginal' },
  { term: 'immutable', def: 'unchanging; unable to be changed' },
  { term: 'juxtapose', def: 'to place side by side for contrast' },
  { term: 'lament', def: 'to mourn or express sorrow' },
  { term: 'meticulous', def: 'extremely careful about detail' },
  { term: 'novice', def: 'a beginner' },
  { term: 'obsolete', def: 'no longer in use; outdated' },
  { term: 'reticent', def: 'reserved; reluctant to speak' },
];

// Ready-made card sets. Terms are the answer side you have to produce, so
// Spanish is the term and the English gloss is the definition.
const PRESET_SETS = [
  {
    id: 'es-presente',
    name: 'Spanish present tense verbs',
    note: 'Irregular yo, stem-changing, reflexive, and extra verbs.',
    words: [
      // Irregular yo forms
      { term: 'dar', def: 'to give' },
      { term: 'conocer', def: 'to know (a person, a place)' },
      { term: 'saber', def: 'to know (a fact, information)' },
      { term: 'ir', def: 'to go' },
      { term: 'salir', def: 'to leave, to go out' },
      { term: 'tener', def: 'to have' },
      { term: 'ser', def: 'to be (description, personality, time, date)' },
      { term: 'estar', def: 'to be (location, feelings)' },
      { term: 'hacer', def: 'to do, to make' },
      { term: 'poner', def: 'to put, to place' },
      { term: 'ver', def: 'to see' },
      { term: 'caer', def: 'to fall' },
      { term: 'traer', def: 'to bring' },
      { term: 'seguir', def: 'to follow, to continue' },
      { term: 'oír', def: 'to hear' },
      { term: 'decir', def: 'to say, to tell' },
      { term: 'venir', def: 'to come' },
      { term: 'traducir', def: 'to translate' },
      { term: 'conducir', def: 'to drive' },
      { term: 'parecer', def: 'to seem' },
      { term: 'obtener', def: 'to obtain, to get' },
      // Stem-changing verbs
      { term: 'empezar', def: 'to start, to begin' },
      { term: 'comenzar', def: 'to start, to begin (second verb)' },
      { term: 'cerrar', def: 'to close, to shut' },
      { term: 'entender', def: 'to understand' },
      { term: 'pensar', def: 'to think' },
      { term: 'perder', def: 'to lose' },
      { term: 'preferir', def: 'to prefer' },
      { term: 'querer', def: 'to want' },
      { term: 'almorzar', def: 'to have lunch' },
      { term: 'contar', def: 'to count; to tell (a joke or story)' },
      { term: 'dormir', def: 'to sleep' },
      { term: 'aprender', def: 'to learn' },
      { term: 'encontrar', def: 'to find' },
      { term: 'mostrar', def: 'to show' },
      { term: 'poder', def: 'to be able to' },
      { term: 'recordar', def: 'to remember' },
      { term: 'pedir', def: 'to ask for' },
      { term: 'repetir', def: 'to repeat' },
      // Reflexive verbs
      { term: 'llamarse', def: 'to be called, to be named' },
      { term: 'acordarse (de)', def: 'to remember' },
      { term: 'acostarse', def: 'to go to bed' },
      { term: 'afeitarse', def: 'to shave' },
      { term: 'bañarse', def: 'to take a bath' },
      { term: 'cepillarse el pelo', def: "to brush one's hair" },
      { term: 'cepillarse los dientes', def: "to brush one's teeth" },
      { term: 'despertarse', def: 'to wake up' },
      { term: 'dormirse', def: 'to go to sleep, to fall asleep' },
      { term: 'ducharse', def: 'to take a shower' },
      { term: 'enojarse (con)', def: 'to get angry (with)' },
      { term: 'irse', def: 'to go away, to leave' },
      { term: 'lavarse la cara', def: "to wash one's face" },
      { term: 'lavarse las manos', def: "to wash one's hands" },
      { term: 'levantarse', def: 'to get up' },
      { term: 'maquillarse', def: 'to put on make-up' },
      { term: 'peinarse', def: "to comb one's hair" },
      { term: 'ponerse', def: 'to put on (clothing)' },
      { term: 'ponerse + adjetivo', def: 'to become + adjective' },
      { term: 'preocuparse (por)', def: 'to worry (about)' },
      { term: 'probarse', def: 'to try on' },
      { term: 'quedarse', def: 'to stay' },
      { term: 'quitarse', def: 'to take off' },
      { term: 'secarse', def: 'to dry (oneself)' },
      { term: 'sentarse', def: 'to sit down' },
      { term: 'sentirse', def: 'to feel' },
      // Additional verbs
      { term: 'suponer', def: 'to suppose' },
      { term: 'volver', def: 'to return' },
      { term: 'andar en patineta', def: 'to skateboard' },
      { term: 'bucear', def: 'to scuba dive' },
      { term: 'escalar montañas', def: 'to climb mountains' },
      { term: 'escribir una carta', def: 'to write a letter' },
      { term: 'esquiar', def: 'to ski' },
      { term: 'ganar', def: 'to win' },
      { term: 'ir de excursión', def: 'to go on a hike' },
      { term: 'nadar', def: 'to swim' },
      { term: 'pasear', def: 'to take a walk' },
      { term: 'patinar', def: 'to skate' },
      { term: 'practicar deportes', def: 'to play sports' },
      { term: 'tomar el sol', def: 'to sunbathe' },
      { term: 'ver películas', def: 'to watch movies' },
      { term: 'visitar monumentos', def: 'to visit monuments' },
      { term: 'deber', def: 'should, ought to' },
    ],
  },
];

function makeId() {
  return 'w' + Math.random().toString(36).slice(2, 10);
}

const Store = {
  KEY: 'studyhelper.words.v1',
  words: [],

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          this.words = parsed;
          return;
        }
      }
    } catch (e) { /* fall through to defaults */ }
    this.words = DEFAULT_WORDS.map(w => ({ id: makeId(), ...w }));
    this.save();
  },

  save() {
    try { localStorage.setItem(this.KEY, JSON.stringify(this.words)); } catch (e) {}
  },

  getWord(id) {
    return this.words.find(w => w.id === id);
  },

  hasTerm(term) {
    const t = term.trim().toLowerCase();
    return this.words.some(w => w.term.trim().toLowerCase() === t);
  },

  addWord(term, def) {
    const w = { id: makeId(), term: term.trim(), def: def.trim() };
    this.words.push(w);
    this.save();
    return w;
  },

  removeWord(id) {
    this.words = this.words.filter(w => w.id !== id);
    this.save();
  },

  // Accepts "term - definition" (also – or —) or tab-separated lines.
  importText(text) {
    let added = 0, skipped = 0;
    String(text).split(/\r?\n/).forEach(line => {
      const l = line.trim();
      if (!l) return;
      let parts = null;
      if (l.includes('\t')) {
        const i = l.indexOf('\t');
        parts = [l.slice(0, i), l.slice(i + 1)];
      } else {
        const m = l.match(/^(.+?)\s+[-–—]\s+(.+)$/);
        if (m) parts = [m[1], m[2]];
      }
      if (!parts) { skipped++; return; }
      const term = parts[0].trim(), def = parts[1].trim();
      if (!term || !def || this.hasTerm(term)) { skipped++; return; }
      this.words.push({ id: makeId(), term, def });
      added++;
    });
    if (added) this.save();
    return { added, skipped };
  },

  getSet(id) {
    return PRESET_SETS.find(s => s.id === id);
  },

  // Adds a preset set's words, skipping terms already in the list.
  addSet(id) {
    const set = this.getSet(id);
    if (!set) return { added: 0, skipped: 0 };
    let added = 0, skipped = 0;
    set.words.forEach(w => {
      if (this.hasTerm(w.term)) { skipped++; return; }
      this.words.push({ id: makeId(), ...w });
      added++;
    });
    if (added) this.save();
    return { added, skipped };
  },

  restoreSamples() {
    let added = 0;
    DEFAULT_WORDS.forEach(d => {
      if (!this.hasTerm(d.term)) {
        this.words.push({ id: makeId(), ...d });
        added++;
      }
    });
    if (added) this.save();
    return added;
  },
};
