// Progress view: most-missed words across every mode, plus the verb forms
// Conjugate mode keeps tripping you up.

const MODE_LABELS = { flashcards: 'Flashcards', matching: 'Matching', learn: 'Learn' };

const Progress = {
  container: null,
  _armTimer: null,
  _verbArmTimer: null,

  enter(container) {
    this.container = container;
    this.render();
  },

  render() {
    const rows = Store.words
      .map(w => {
        const misses = Stats.totalMisses(w.id);
        const hits = Stats.totalHits(w.id);
        return { w, misses, hits, attempts: misses + hits };
      })
      .filter(r => r.attempts > 0)
      .sort((a, b) => b.misses - a.misses || a.hits - b.hits);

    if (!rows.length) {
      this.container.innerHTML = `
        <div class="pane">
          <h2>Progress <span class="count">${esc(Store.activeDeck().name)}</span></h2>
          <div class="empty">Nothing tracked yet &mdash; run through a mode first.</div>
          ${this.verbSection()}
        </div>`;
      this.wireVerbReset();
      return;
    }

    const top = rows.filter(r => r.misses > 0).slice(0, 5);
    this.container.innerHTML = `
      <div class="pane">
        <h2>Progress <span class="count">${esc(Store.activeDeck().name)}</span></h2>
        ${top.length ? `
          <p class="section-label">Most missed</p>
          <div class="chips">
            ${top.map(r => `<span class="misschip">${esc(r.w.term)} &times;${r.misses}</span>`).join('')}
          </div>` : '<p class="lead">No misses yet &mdash; nice.</p>'}
        <table class="table">
          <thead><tr><th>Word</th><th>Missed</th><th>Accuracy</th><th>Toughest mode</th></tr></thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                <td class="term-cell">${esc(r.w.term)}</td>
                <td>${r.misses}</td>
                <td>${Math.round((r.hits / r.attempts) * 100)}%</td>
                <td>${this.toughest(r.w.id)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
        <div class="controls left">
          <button class="btn" id="stats-reset">Reset all stats</button>
        </div>
        ${this.verbSection()}
      </div>`;
    this.wireVerbReset();

    const btn = this.container.querySelector('#stats-reset');
    btn.onclick = () => {
      if (btn.dataset.armed) {
        clearTimeout(this._armTimer);
        Stats.reset();
        this.render();
      } else {
        btn.dataset.armed = '1';
        btn.classList.add('btn-wrong');
        btn.textContent = 'Click again to reset';
        this._armTimer = setTimeout(() => {
          delete btn.dataset.armed;
          btn.classList.remove('btn-wrong');
          btn.textContent = 'Reset all stats';
        }, 3000);
      }
    };
  },

  // Verb forms missed in Conjugate mode, grouped by tense. Verbs live outside
  // the word decks, so this section ignores the active deck.
  verbRows() {
    const out = [];
    TENSES.forEach(t => {
      Object.keys(ConjStats.data).forEach(key => {
        const i = key.indexOf('|');
        if (key.slice(0, i) !== t.id) return;
        const rec = ConjStats.data[key];
        const attempts = rec.hits + rec.misses;
        if (!attempts) return;
        out.push({ tense: t, inf: key.slice(i + 1), misses: rec.misses, attempts });
      });
    });
    return out.sort((a, b) => b.misses - a.misses || a.attempts - b.attempts);
  },

  verbSection() {
    const rows = this.verbRows();
    if (!rows.length) return '';
    const missed = rows.filter(r => r.misses > 0);
    return `
      <p class="section-label">Conjugation</p>
      ${missed.length ? `
        <div class="chips">
          ${missed.slice(0, 8).map(r =>
            `<span class="misschip">${esc(r.inf)} &middot; ${esc(r.tense.name.toLowerCase())} &times;${r.misses}</span>`).join('')}
        </div>` : '<p class="lead">No verb forms missed yet.</p>'}
      <table class="table">
        <thead><tr><th>Verb</th><th>Tense</th><th>Missed</th><th>Accuracy</th></tr></thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              <td class="term-cell">${esc(r.inf)}</td>
              <td>${esc(r.tense.name)}</td>
              <td>${r.misses}</td>
              <td>${Math.round(((r.attempts - r.misses) / r.attempts) * 100)}%</td>
            </tr>`).join('')}
        </tbody>
      </table>
      <div class="controls left">
        <button class="btn" id="conj-stats-reset">Reset conjugation stats</button>
      </div>`;
  },

  wireVerbReset() {
    const btn = this.container.querySelector('#conj-stats-reset');
    if (!btn) return;
    btn.onclick = () => {
      if (btn.dataset.armed) {
        clearTimeout(this._verbArmTimer);
        ConjStats.reset();
        this.render();
      } else {
        btn.dataset.armed = '1';
        btn.classList.add('btn-wrong');
        btn.textContent = 'Click again to reset';
        this._verbArmTimer = setTimeout(() => {
          delete btn.dataset.armed;
          btn.classList.remove('btn-wrong');
          btn.textContent = 'Reset conjugation stats';
        }, 3000);
      }
    };
  },

  toughest(id) {
    const per = Stats.missesByMode(id);
    let best = null;
    for (const mode of Object.keys(per)) {
      if (per[mode] > 0 && (!best || per[mode] > per[best])) best = mode;
    }
    return best ? MODE_LABELS[best] : '&mdash;';
  },
};
