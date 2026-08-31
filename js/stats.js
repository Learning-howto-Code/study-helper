// Miss/hit tracking across all modes, persisted to localStorage.

const Stats = {
  KEY: 'studyhelper.stats.v1',
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

  // mode: 'flashcards' | 'matching' | 'learn'
  record(id, mode, correct) {
    const s = this.data[id] || (this.data[id] = { misses: {}, hits: {} });
    const bucket = correct ? s.hits : s.misses;
    bucket[mode] = (bucket[mode] || 0) + 1;
    this.save();
  },

  _sum(obj) {
    let n = 0;
    for (const k of Object.keys(obj || {})) n += obj[k];
    return n;
  },

  totalMisses(id) { return this.data[id] ? this._sum(this.data[id].misses) : 0; },
  totalHits(id) { return this.data[id] ? this._sum(this.data[id].hits) : 0; },
  missesByMode(id) { return (this.data[id] && this.data[id].misses) || {}; },

  deleteWord(id) {
    if (this.data[id]) {
      delete this.data[id];
      this.save();
    }
  },

  reset() {
    this.data = {};
    this.save();
  },
};
