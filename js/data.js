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
