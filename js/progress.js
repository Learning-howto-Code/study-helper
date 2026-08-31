// Progress view: most-missed words across every mode.

const MODE_LABELS = { flashcards: 'Flashcards', matching: 'Matching', learn: 'Learn' };

const Progress = {
  container: null,
  _armTimer: null,

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
          <h2>Progress</h2>
          <div class="empty">Nothing tracked yet &mdash; run through a mode first.</div>
        </div>`;
      return;
    }

    const top = rows.filter(r => r.misses > 0).slice(0, 5);
    this.container.innerHTML = `
      <div class="pane">
        <h2>Progress</h2>
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
      </div>`;

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

  toughest(id) {
    const per = Stats.missesByMode(id);
    let best = null;
    for (const mode of Object.keys(per)) {
      if (per[mode] > 0 && (!best || per[mode] > per[best])) best = mode;
    }
    return best ? MODE_LABELS[best] : '&mdash;';
  },
};
