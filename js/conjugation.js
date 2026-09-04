// Spanish conjugation data and engine.
//
// A verb is stored once, in VERBS, and sets reference verbs by infinitive so
// the same verb can sit in several sets without its forms drifting apart.
//
// Conjugating goes: a per-verb override wins, otherwise the form is built from
// a base (the stem, or the whole infinitive for tenses like the future) plus
// the tense's ending for that person. Stem changes hit the base only in the
// persons the tense asks for. Adding a tense is a TENSES entry plus, for the
// handful of verbs that need it, a `forms` or `stems` line on the verb.

// `subjects` are the subject pronouns an answer may be prefixed with; they are
// matched without accents, so "el" and "él" both count.
const PRONOUNS = [
  { id: 'yo', label: 'yo', refl: 'me', subjects: ['yo'] },
  { id: 'tu', label: 'tú', refl: 'te', subjects: ['tú'] },
  {
    id: 'el', label: 'él / ella / Ud.', refl: 'se',
    subjects: ['él', 'ella', 'usted', 'ud.', 'ud'],
  },
  { id: 'nosotros', label: 'nosotros', refl: 'nos', subjects: ['nosotros', 'nosotras'] },
  { id: 'vosotros', label: 'vosotros', refl: 'os', subjects: ['vosotros', 'vosotras'] },
  {
    id: 'ellos', label: 'ellos / ellas / Uds.', refl: 'se',
    subjects: ['ellos', 'ellas', 'ustedes', 'uds.', 'uds'],
  },
];

const PRONOUN_INDEX = {};
PRONOUNS.forEach((p, i) => { PRONOUN_INDEX[p.id] = i; });

// Persons a "boot" stem change reaches: everything but nosotros/vosotros.
const BOOT = ['yo', 'tu', 'el', 'ellos'];

const TENSES = [
  {
    id: 'present',
    name: 'Present',
    spanish: 'Presente',
    note: 'Stem changes and irregular yo forms live here.',
    base: 'stem',
    stemChange: { forms: BOOT },
    endings: {
      ar: ['o', 'as', 'a', 'amos', 'áis', 'an'],
      er: ['o', 'es', 'e', 'emos', 'éis', 'en'],
      ir: ['o', 'es', 'e', 'imos', 'ís', 'en'],
    },
  },
  {
    id: 'imperfect',
    name: 'Imperfect',
    spanish: 'Imperfecto',
    note: 'No stem changes at all — only ser, ir and ver are irregular.',
    base: 'stem',
    stemChange: null,
    endings: {
      ar: ['aba', 'abas', 'aba', 'ábamos', 'abais', 'aban'],
      er: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
      ir: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
    },
  },
  {
    id: 'future',
    name: 'Future',
    spanish: 'Futuro',
    note: 'Endings go on the whole infinitive; a dozen verbs use a short stem.',
    base: 'infinitive',
    stemChange: null,
    endings: { all: ['é', 'ás', 'á', 'emos', 'éis', 'án'] },
  },
];

function getTense(id) {
  return TENSES.find(t => t.id === id) || TENSES[0];
}

// inf:   infinitive, including the -se of a reflexive verb.
// gloss: English meaning.
// stem:  'e>ie' | 'o>ue' | 'e>i' | 'u>ue', applied in the persons a tense names.
// forms: per-tense overrides — all six as an array, or { pronounId: form }.
//        Reflexive pronouns are never written here; they get prefixed after.
// stems: per-tense replacement base for infinitive-based tenses.
// tags:  shown as a hint chip while practising.
const VERBS = [
  // --- regular ---
  { inf: 'hablar', gloss: 'to speak' },
  { inf: 'trabajar', gloss: 'to work' },
  { inf: 'estudiar', gloss: 'to study' },
  { inf: 'cantar', gloss: 'to sing' },
  { inf: 'nadar', gloss: 'to swim' },
  { inf: 'comprar', gloss: 'to buy' },
  { inf: 'escuchar', gloss: 'to listen' },
  { inf: 'tomar', gloss: 'to take, to drink' },
  { inf: 'llevar', gloss: 'to carry, to wear' },
  { inf: 'comer', gloss: 'to eat' },
  { inf: 'beber', gloss: 'to drink' },
  { inf: 'aprender', gloss: 'to learn' },
  { inf: 'correr', gloss: 'to run' },
  { inf: 'comprender', gloss: 'to understand' },
  { inf: 'leer', gloss: 'to read' },
  { inf: 'deber', gloss: 'should, ought to' },
  { inf: 'vivir', gloss: 'to live' },
  { inf: 'escribir', gloss: 'to write' },
  { inf: 'abrir', gloss: 'to open' },
  { inf: 'recibir', gloss: 'to receive' },
  { inf: 'subir', gloss: 'to go up' },

  // --- stem-changing ---
  { inf: 'pensar', gloss: 'to think', stem: 'e>ie', tags: ['e>ie'] },
  { inf: 'empezar', gloss: 'to start, to begin', stem: 'e>ie', tags: ['e>ie'] },
  { inf: 'comenzar', gloss: 'to start, to begin', stem: 'e>ie', tags: ['e>ie'] },
  { inf: 'cerrar', gloss: 'to close', stem: 'e>ie', tags: ['e>ie'] },
  { inf: 'entender', gloss: 'to understand', stem: 'e>ie', tags: ['e>ie'] },
  { inf: 'perder', gloss: 'to lose', stem: 'e>ie', tags: ['e>ie'] },
  { inf: 'preferir', gloss: 'to prefer', stem: 'e>ie', tags: ['e>ie'] },
  { inf: 'querer', gloss: 'to want', stem: 'e>ie', tags: ['e>ie'], stems: { future: 'querr' } },
  { inf: 'almorzar', gloss: 'to have lunch', stem: 'o>ue', tags: ['o>ue'] },
  { inf: 'contar', gloss: 'to count; to tell', stem: 'o>ue', tags: ['o>ue'] },
  { inf: 'dormir', gloss: 'to sleep', stem: 'o>ue', tags: ['o>ue'] },
  { inf: 'encontrar', gloss: 'to find', stem: 'o>ue', tags: ['o>ue'] },
  { inf: 'mostrar', gloss: 'to show', stem: 'o>ue', tags: ['o>ue'] },
  { inf: 'poder', gloss: 'to be able to', stem: 'o>ue', tags: ['o>ue'], stems: { future: 'podr' } },
  { inf: 'recordar', gloss: 'to remember', stem: 'o>ue', tags: ['o>ue'] },
  { inf: 'volver', gloss: 'to return', stem: 'o>ue', tags: ['o>ue'] },
  { inf: 'pedir', gloss: 'to ask for', stem: 'e>i', tags: ['e>i'] },
  { inf: 'repetir', gloss: 'to repeat', stem: 'e>i', tags: ['e>i'] },
  { inf: 'servir', gloss: 'to serve', stem: 'e>i', tags: ['e>i'] },
  {
    inf: 'seguir', gloss: 'to follow, to continue', stem: 'e>i',
    tags: ['e>i', 'yo'], forms: { present: { yo: 'sigo' } },
  },
  { inf: 'jugar', gloss: 'to play', stem: 'u>ue', tags: ['u>ue'] },

  // --- irregular yo ---
  {
    inf: 'dar', gloss: 'to give', tags: ['yo'],
    forms: { present: ['doy', 'das', 'da', 'damos', 'dais', 'dan'] },
  },
  { inf: 'conocer', gloss: 'to know (a person, a place)', tags: ['yo'], forms: { present: { yo: 'conozco' } } },
  {
    inf: 'saber', gloss: 'to know (a fact)', tags: ['yo'],
    forms: { present: { yo: 'sé' } }, stems: { future: 'sabr' },
  },
  { inf: 'salir', gloss: 'to leave, to go out', tags: ['yo'], forms: { present: { yo: 'salgo' } }, stems: { future: 'saldr' } },
  { inf: 'hacer', gloss: 'to do, to make', tags: ['yo'], forms: { present: { yo: 'hago' } }, stems: { future: 'har' } },
  { inf: 'poner', gloss: 'to put, to place', tags: ['yo'], forms: { present: { yo: 'pongo' } }, stems: { future: 'pondr' } },
  { inf: 'suponer', gloss: 'to suppose', tags: ['yo'], forms: { present: { yo: 'supongo' } }, stems: { future: 'supondr' } },
  { inf: 'caer', gloss: 'to fall', tags: ['yo'], forms: { present: { yo: 'caigo' } } },
  { inf: 'traer', gloss: 'to bring', tags: ['yo'], forms: { present: { yo: 'traigo' } } },
  { inf: 'traducir', gloss: 'to translate', tags: ['yo'], forms: { present: { yo: 'traduzco' } } },
  { inf: 'conducir', gloss: 'to drive', tags: ['yo'], forms: { present: { yo: 'conduzco' } } },
  { inf: 'parecer', gloss: 'to seem', tags: ['yo'], forms: { present: { yo: 'parezco' } } },
  {
    inf: 'tener', gloss: 'to have', stem: 'e>ie', tags: ['e>ie', 'yo'],
    forms: { present: { yo: 'tengo' } }, stems: { future: 'tendr' },
  },
  {
    inf: 'obtener', gloss: 'to obtain, to get', stem: 'e>ie', tags: ['e>ie', 'yo'],
    forms: { present: { yo: 'obtengo' } }, stems: { future: 'obtendr' },
  },
  {
    inf: 'venir', gloss: 'to come', stem: 'e>ie', tags: ['e>ie', 'yo'],
    forms: { present: { yo: 'vengo' } }, stems: { future: 'vendr' },
  },
  {
    inf: 'decir', gloss: 'to say, to tell', stem: 'e>i', tags: ['e>i', 'yo'],
    forms: { present: { yo: 'digo' } }, stems: { future: 'dir' },
  },

  // --- fully irregular ---
  {
    inf: 'ser', gloss: 'to be (description, origin, time)', tags: ['irregular'],
    forms: {
      present: ['soy', 'eres', 'es', 'somos', 'sois', 'son'],
      imperfect: ['era', 'eras', 'era', 'éramos', 'erais', 'eran'],
    },
  },
  {
    inf: 'estar', gloss: 'to be (location, feelings)', tags: ['irregular'],
    forms: { present: ['estoy', 'estás', 'está', 'estamos', 'estáis', 'están'] },
  },
  {
    inf: 'ir', gloss: 'to go', tags: ['irregular'],
    forms: {
      present: ['voy', 'vas', 'va', 'vamos', 'vais', 'van'],
      imperfect: ['iba', 'ibas', 'iba', 'íbamos', 'ibais', 'iban'],
    },
  },
  {
    inf: 'ver', gloss: 'to see', tags: ['irregular'],
    forms: {
      present: ['veo', 'ves', 've', 'vemos', 'veis', 'ven'],
      imperfect: ['veía', 'veías', 'veía', 'veíamos', 'veíais', 'veían'],
    },
  },
  {
    inf: 'oír', gloss: 'to hear', tags: ['irregular'],
    forms: { present: ['oigo', 'oyes', 'oye', 'oímos', 'oís', 'oyen'] },
    stems: { future: 'oir' },
  },

  // --- reflexive ---
  { inf: 'llamarse', gloss: 'to be called, to be named' },
  { inf: 'levantarse', gloss: 'to get up' },
  { inf: 'ducharse', gloss: 'to take a shower' },
  { inf: 'bañarse', gloss: 'to take a bath' },
  { inf: 'afeitarse', gloss: 'to shave' },
  { inf: 'maquillarse', gloss: 'to put on make-up' },
  { inf: 'peinarse', gloss: "to comb one's hair" },
  { inf: 'lavarse', gloss: 'to wash (oneself)' },
  { inf: 'secarse', gloss: 'to dry (oneself)' },
  { inf: 'quedarse', gloss: 'to stay' },
  { inf: 'quitarse', gloss: 'to take off (clothing)' },
  { inf: 'enojarse', gloss: 'to get angry' },
  { inf: 'preocuparse', gloss: 'to worry' },
  { inf: 'despertarse', gloss: 'to wake up', stem: 'e>ie', tags: ['e>ie'] },
  { inf: 'sentarse', gloss: 'to sit down', stem: 'e>ie', tags: ['e>ie'] },
  { inf: 'sentirse', gloss: 'to feel', stem: 'e>ie', tags: ['e>ie'] },
  { inf: 'acostarse', gloss: 'to go to bed', stem: 'o>ue', tags: ['o>ue'] },
  { inf: 'dormirse', gloss: 'to fall asleep', stem: 'o>ue', tags: ['o>ue'] },
  { inf: 'probarse', gloss: 'to try on', stem: 'o>ue', tags: ['o>ue'] },
  { inf: 'acordarse', gloss: 'to remember', stem: 'o>ue', tags: ['o>ue'] },
  { inf: 'vestirse', gloss: 'to get dressed', stem: 'e>i', tags: ['e>i'] },
  {
    inf: 'ponerse', gloss: 'to put on (clothing)', tags: ['yo'],
    forms: { present: { yo: 'pongo' } }, stems: { future: 'pondr' },
  },
  {
    inf: 'irse', gloss: 'to go away, to leave', tags: ['irregular'],
    forms: {
      present: ['voy', 'vas', 'va', 'vamos', 'vais', 'van'],
      imperfect: ['iba', 'ibas', 'iba', 'íbamos', 'ibais', 'iban'],
    },
  },
];

const VERB_BY_INF = {};
VERBS.forEach(v => { VERB_BY_INF[v.inf] = v; });

const VERB_SETS = [
  {
    id: 'regular',
    name: 'Regular verbs',
    note: 'Plain -ar, -er and -ir endings, no surprises.',
    infs: ['hablar', 'trabajar', 'estudiar', 'cantar', 'nadar', 'comprar', 'escuchar',
      'tomar', 'llevar', 'comer', 'beber', 'aprender', 'correr', 'comprender', 'leer',
      'deber', 'vivir', 'escribir', 'abrir', 'recibir', 'subir'],
  },
  {
    id: 'stem',
    name: 'Stem-changing verbs',
    note: 'The boot pattern: e>ie, o>ue, e>i and u>ue.',
    infs: ['pensar', 'empezar', 'comenzar', 'cerrar', 'entender', 'perder', 'preferir',
      'querer', 'almorzar', 'contar', 'dormir', 'encontrar', 'mostrar', 'poder',
      'recordar', 'volver', 'pedir', 'repetir', 'servir', 'seguir', 'jugar'],
  },
  {
    id: 'yo',
    name: 'Irregular yo forms',
    note: 'Regular everywhere except the yo form.',
    infs: ['dar', 'conocer', 'saber', 'salir', 'hacer', 'poner', 'suponer', 'caer',
      'traer', 'traducir', 'conducir', 'parecer', 'tener', 'obtener', 'venir', 'decir',
      'seguir'],
  },
  {
    id: 'irregular',
    name: 'The big irregulars',
    note: 'ser, estar, ir and friends — worth knowing cold.',
    infs: ['ser', 'estar', 'ir', 'ver', 'oír', 'tener', 'hacer', 'decir', 'venir',
      'poder', 'querer', 'saber', 'dar'],
  },
  {
    id: 'reflexive',
    name: 'Reflexive verbs',
    note: 'Daily-routine verbs that need me / te / se in front.',
    infs: ['llamarse', 'levantarse', 'ducharse', 'bañarse', 'afeitarse', 'maquillarse',
      'peinarse', 'lavarse', 'secarse', 'quedarse', 'quitarse', 'enojarse',
      'preocuparse', 'despertarse', 'sentarse', 'sentirse', 'acostarse', 'dormirse',
      'probarse', 'acordarse', 'vestirse', 'ponerse', 'irse'],
  },
];

const Conjugator = {
  // Splits an infinitive into the pieces the engine needs. A trailing -se only
  // counts as reflexive when what is left is still a real infinitive.
  parse(inf) {
    const refl = /(ar|er|ir|ír)se$/.test(inf);
    const core = refl ? inf.slice(0, -2) : inf;
    return {
      refl,
      core,
      type: this.deaccent(core.slice(-2)),
      stem: core.slice(0, -2),
    };
  },

  // Strips vowel accents. The tilde is left in place, since ñ is its own
  // letter and dropping it would make "senor" pass for "señor".
  deaccent(s) {
    return String(s)
      .normalize('NFD')
      .replace(/[̀-̂̄-ͯ]/g, '')
      .normalize('NFC');
  },

  // Replaces the last occurrence of the changing vowel, which is the stressed
  // one in every verb that takes a stem change.
  applyStemChange(stem, spec) {
    const parts = String(spec).split('>');
    const from = parts[0], to = parts[1];
    const i = stem.lastIndexOf(from);
    return i < 0 ? stem : stem.slice(0, i) + to + stem.slice(i + from.length);
  },

  // One conjugated form, reflexive pronoun included.
  form(verb, tenseId, pronounId) {
    const tense = getTense(tenseId);
    const p = this.parse(verb.inf);
    const i = PRONOUN_INDEX[pronounId];
    const override = verb.forms && verb.forms[tenseId];
    let word = null;

    if (Array.isArray(override)) word = override[i];
    else if (override && override[pronounId]) word = override[pronounId];

    if (!word) {
      let base;
      if (tense.base === 'infinitive') {
        base = (verb.stems && verb.stems[tenseId]) || p.core;
      } else {
        base = p.stem;
        const sc = tense.stemChange;
        if (sc && verb.stem && sc.forms.indexOf(pronounId) !== -1 &&
            (!sc.only || sc.only === p.type)) {
          base = this.applyStemChange(base, verb.stem);
        }
      }
      const endings = tense.endings[p.type] || tense.endings.all;
      word = base + endings[i];
    }
    return p.refl ? PRONOUNS[i].refl + ' ' + word : word;
  },

  table(verb, tenseId) {
    return PRONOUNS.map(p => ({ pronoun: p, form: this.form(verb, tenseId, p.id) }));
  },

  // 'right' | 'accent' (right letters, wrong accents) | 'wrong'.
  // A leading subject pronoun is allowed, so "yo hablo" passes for "hablo".
  check(given, expected, pronoun) {
    const norm = s => String(s).trim().toLowerCase().replace(/\s+/g, ' ');
    let g = norm(given);
    if (!g) return 'wrong';
    const bare = this.deaccent(g);
    const subjects = (pronoun.subjects || []).map(x => this.deaccent(norm(x)))
      .sort((a, b) => b.length - a.length);
    for (const s of subjects) {
      if (bare.indexOf(s + ' ') === 0 && g.length > s.length + 1) {
        g = g.slice(s.length + 1);
        break;
      }
    }
    const e = norm(expected);
    if (g === e) return 'right';
    if (this.deaccent(g) === this.deaccent(e)) return 'accent';
    return 'wrong';
  },
};

// Which verbs trip you up, per tense. Kept apart from vocabulary stats since
// the ids here are infinitives, not word ids.
const ConjStats = {
  KEY: 'studyhelper.conjstats.v1',
  data: {},

  load() {
    try {
      this.data = JSON.parse(localStorage.getItem(this.KEY)) || {};
    } catch (e) {
      this.data = {};
    }
  },

  save() {
    try { localStorage.setItem(this.KEY, JSON.stringify(this.data)); } catch (e) {}
  },

  key(inf, tenseId) { return tenseId + '|' + inf; },

  record(inf, tenseId, correct) {
    const k = this.key(inf, tenseId);
    const s = this.data[k] || (this.data[k] = { hits: 0, misses: 0 });
    if (correct) s.hits++;
    else s.misses++;
    this.save();
  },

  get(inf, tenseId) {
    return this.data[this.key(inf, tenseId)] || { hits: 0, misses: 0 };
  },

  misses(inf, tenseId) { return this.get(inf, tenseId).misses; },

  reset() {
    this.data = {};
    this.save();
  },
};

// Verb-set choice and practice options, persisted so the mode reopens where
// you left it. Custom verbs are regular or stem-changing only; anything with
// irregular forms belongs in VERBS.
const VerbStore = {
  KEY: 'studyhelper.verbsets.v1',
  setId: 'regular',
  tenseId: 'present',
  drill: 'quiz',
  vosotros: false,
  custom: [],

  load() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(this.KEY)); } catch (e) {}
    if (d && typeof d === 'object') {
      this.custom = Array.isArray(d.custom) ? d.custom : [];
      this.tenseId = TENSES.some(t => t.id === d.tenseId) ? d.tenseId : 'present';
      this.drill = d.drill === 'table' ? 'table' : 'quiz';
      this.vosotros = !!d.vosotros;
      this.setId = this.sets().some(s => s.id === d.setId) ? d.setId : 'regular';
    }
  },

  save() {
    try {
      localStorage.setItem(this.KEY, JSON.stringify({
        setId: this.setId,
        tenseId: this.tenseId,
        drill: this.drill,
        vosotros: this.vosotros,
        custom: this.custom,
      }));
    } catch (e) {}
  },

  sets() {
    const all = VERB_SETS.map(s => ({ id: s.id, name: s.name, note: s.note }));
    all.push({ id: 'all', name: 'Everything', note: 'Every verb in every set.' });
    if (this.custom.length) {
      all.push({ id: 'custom', name: 'My verbs', note: 'Verbs you added yourself.' });
    }
    return all;
  },

  activeSet() {
    const sets = this.sets();
    return sets.find(s => s.id === this.setId) || sets[0];
  },

  // Verb objects for a set id, custom verbs included.
  verbs(setId) {
    const id = setId || this.setId;
    if (id === 'custom') return this.custom.slice();
    if (id === 'all') {
      const seen = new Set();
      return VERBS.concat(this.custom).filter(v => {
        if (seen.has(v.inf)) return false;
        seen.add(v.inf);
        return true;
      });
    }
    const set = VERB_SETS.find(s => s.id === id);
    if (!set) return [];
    return set.infs.map(inf => VERB_BY_INF[inf]).filter(Boolean);
  },

  activeVerbs() { return this.verbs(this.setId); },

  pronouns() {
    return this.vosotros ? PRONOUNS : PRONOUNS.filter(p => p.id !== 'vosotros');
  },

  set(field, value) {
    this[field] = value;
    this.save();
  },

  addCustom(inf, gloss, stem) {
    const clean = String(inf).trim().toLowerCase();
    if (!/(ar|er|ir|ír)(se)?$/.test(clean)) {
      return { ok: false, why: 'A verb has to end in -ar, -er or -ir.' };
    }
    if (this.custom.some(v => v.inf === clean) || VERB_BY_INF[clean]) {
      return { ok: false, why: 'That verb is already in a set.' };
    }
    const v = { inf: clean, gloss: String(gloss).trim() || clean, custom: true };
    if (stem) {
      v.stem = stem;
      v.tags = [stem];
    }
    this.custom.push(v);
    this.setId = 'custom';
    this.save();
    return { ok: true, verb: v };
  },

  removeCustom(inf) {
    this.custom = this.custom.filter(v => v.inf !== inf);
    if (this.setId === 'custom' && !this.custom.length) this.setId = 'regular';
    this.save();
  },
};
