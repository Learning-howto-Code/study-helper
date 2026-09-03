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


function makeId(prefix) {
  return (prefix || 'w') + Math.random().toString(36).slice(2, 10);
}

// Words live in decks ("sets"). Only the active deck is studied, so
// Store.words is the active deck's words — every mode reads that.
const Store = {
  KEY: 'studyhelper.decks.v3',
  V2_KEY: 'studyhelper.decks.v2',
  V1_KEY: 'studyhelper.words.v1',
  decks: [],
  allWords: [],
  activeId: null,

  get words() {
    return this.allWords.filter(w => w.deckId === this.activeId);
  },

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d && Array.isArray(d.decks) && d.decks.length && Array.isArray(d.words)) {
          this.decks = d.decks;
          this.allWords = d.words;
          this.activeId = this.decks.some(x => x.id === d.activeId)
            ? d.activeId : this.decks[0].id;
          return;
        }
      }
    } catch (e) { /* fall through */ }
    this.migrateOrSeed();
    this.save();
  },

  _read(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  // Earlier versions kept every word in one pile: v1 as a flat list, v2 as a
  // single migrated deck. Both get split here so each ready-made set — and the
  // sample words — land in a set of their own, with word ids kept so stats
  // survive the move.
  migrateOrSeed() {
    const v2 = this._read(this.V2_KEY);
    let decks, words, wantActive = null;

    if (v2 && Array.isArray(v2.decks) && v2.decks.length && Array.isArray(v2.words)) {
      decks = v2.decks.map(d => ({ ...d }));
      words = v2.words.map(w => ({ ...w }));
      wantActive = v2.activeId;
    } else {
      const v1 = this._read(this.V1_KEY);
      const legacy = { id: makeId('d'), name: 'My words' };
      decks = [legacy];
      words = (Array.isArray(v1) && v1.length ? v1 : DEFAULT_WORDS).map(w => ({
        id: w.id || makeId(),
        deckId: legacy.id,
        term: w.term,
        def: w.def,
      }));
    }

    this.decks = decks;
    this.allWords = words;
    this.splitPresets();

    this.activeId = this.decks.some(d => d.id === wantActive && this.deckCount(d.id))
      ? wantActive
      : (this.decks.find(d => this.deckCount(d.id)) || this.decks[0]).id;
  },

  // Moves words that belong to a ready-made set out of mixed decks. Preset
  // decks and empty leftovers are left alone / dropped.
  splitPresets() {
    const owner = new Map();
    PRESET_SETS.forEach(s => {
      s.words.forEach(w => owner.set(w.term.trim().toLowerCase(), { id: s.id, name: s.name }));
    });
    DEFAULT_WORDS.forEach(w => {
      const k = w.term.trim().toLowerCase();
      if (!owner.has(k)) owner.set(k, { id: 'samples', name: 'Sample words' });
    });

    const deckFor = presetId => {
      let d = this.decks.find(x => x.presetId === presetId);
      if (!d) {
        const meta = presetId === 'samples'
          ? { name: 'Sample words' }
          : PRESET_SETS.find(s => s.id === presetId);
        d = { id: makeId('d'), name: meta.name, presetId };
        this.decks.push(d);
      }
      return d;
    };

    const mixed = new Set(this.decks.filter(d => !d.presetId).map(d => d.id));
    this.allWords.forEach(w => {
      if (!mixed.has(w.deckId)) return;
      const target = owner.get(String(w.term).trim().toLowerCase());
      if (target) w.deckId = deckFor(target.id).id;
    });

    // Drop mixed decks left with nothing in them, but never all of them.
    const kept = this.decks.filter(d => d.presetId || this.deckCount(d.id) > 0);
    this.decks = kept.length ? kept : [{ id: makeId('d'), name: 'My words' }];
  },

  save() {
    try {
      localStorage.setItem(this.KEY, JSON.stringify({
        decks: this.decks,
        words: this.allWords,
        activeId: this.activeId,
      }));
    } catch (e) {}
  },

  // --- decks ---

  activeDeck() {
    return this.decks.find(d => d.id === this.activeId) || null;
  },

  deckCount(id) {
    return this.allWords.filter(w => w.deckId === id).length;
  },

  setActive(id) {
    if (!this.decks.some(d => d.id === id)) return false;
    this.activeId = id;
    this.save();
    return true;
  },

  addDeck(name, presetId) {
    const deck = { id: makeId('d'), name: String(name).trim() || 'Untitled set' };
    if (presetId) deck.presetId = presetId;
    this.decks.push(deck);
    this.activeId = deck.id;
    this.save();
    return deck;
  },

  renameDeck(id, name) {
    const deck = this.decks.find(d => d.id === id);
    if (!deck) return;
    deck.name = String(name).trim() || deck.name;
    this.save();
  },

  // Removes a deck and its words. Returns the removed word ids so the
  // caller can clear their stats. Never leaves zero decks.
  removeDeck(id) {
    if (!this.decks.some(d => d.id === id)) return [];
    const ids = this.allWords.filter(w => w.deckId === id).map(w => w.id);
    this.allWords = this.allWords.filter(w => w.deckId !== id);
    this.decks = this.decks.filter(d => d.id !== id);
    if (!this.decks.length) {
      const deck = { id: makeId('d'), name: 'My words' };
      this.decks.push(deck);
    }
    if (this.activeId === id) this.activeId = this.decks[0].id;
    this.save();
    return ids;
  },

  // --- words (all scoped to the active deck) ---

  getWord(id) {
    return this.allWords.find(w => w.id === id);
  },

  hasTerm(term, deckId) {
    const t = term.trim().toLowerCase();
    const deck = deckId || this.activeId;
    return this.allWords.some(w =>
      w.deckId === deck && w.term.trim().toLowerCase() === t);
  },

  addWord(term, def) {
    const w = { id: makeId(), deckId: this.activeId, term: term.trim(), def: def.trim() };
    this.allWords.push(w);
    this.save();
    return w;
  },

  removeWord(id) {
    this.allWords = this.allWords.filter(w => w.id !== id);
    this.save();
  },

  // Accepts "term - definition" (also – or —) or tab-separated lines.
  // Imports into deckId, defaulting to the active deck.
  importText(text, deckId) {
    const deck = deckId || this.activeId;
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
      if (!term || !def || this.hasTerm(term, deck)) { skipped++; return; }
      this.allWords.push({ id: makeId(), deckId: deck, term, def });
      added++;
    });
    if (added) this.save();
    return { added, skipped };
  },

  getSet(id) {
    return PRESET_SETS.find(s => s.id === id);
  },

  // Fills a preset's deck, creating it if needed and switching to it. An
  // existing deck is topped up with whatever words it is missing — a migrated
  // one only holds the words you already had.
  _fillPreset(presetId, name, words) {
    const existed = this.decks.some(d => d.presetId === presetId);
    const deck = existed
      ? this.decks.find(d => d.presetId === presetId)
      : this.addDeck(name, presetId);
    let added = 0;
    words.forEach(w => {
      if (this.hasTerm(w.term, deck.id)) return;
      this.allWords.push({ id: makeId(), deckId: deck.id, term: w.term, def: w.def });
      added++;
    });
    this.setActive(deck.id);
    this.save();
    return { added, existed, deck };
  },

  // Each preset becomes its own deck, never merged into your words.
  addSet(id) {
    const set = this.getSet(id);
    if (!set) return { added: 0, existed: false, deck: null };
    return this._fillPreset(id, set.name, set.words);
  },

  // Sample words get their own deck too.
  restoreSamples() {
    return this._fillPreset('samples', 'Sample words', DEFAULT_WORDS);
  },
};
