// Matching mode: click a term and its definition to clear the board.
// A mismatch counts as a miss for both words involved.

const Matching = {
  container: null,
  tiles: [], btnEls: [], sel: null, matched: 0, misses: 0, pairCount: 0,
  startTime: null, timerInt: null, locked: false,

  enter(container) {
    this.container = container;
    this.start();
  },

  exit() {
    clearInterval(this.timerInt);
  },

  start() {
    clearInterval(this.timerInt);
    const words = Store.words;
    if (words.length < 2) {
      this.container.innerHTML = '<div class="empty">Matching needs at least 2 words. Add more in the Words tab.</div>';
      return;
    }
    const pairs = sample(words, Math.min(6, words.length));
    this.pairCount = pairs.length;
    this.tiles = shuffle(pairs.flatMap(w => [
      { id: w.id, text: w.term, side: 'term' },
      { id: w.id, text: w.def, side: 'def' },
    ]));
    this.sel = null;
    this.matched = 0;
    this.misses = 0;
    this.startTime = null;
    this.locked = false;
    this.render();
  },

  render() {
    this.container.innerHTML = `
      <section class="mode">
        <p class="match-status">
          <span id="match-pairs">0 / ${this.pairCount} pairs</span> &middot;
          <span id="match-misses">0 misses</span> &middot;
          <span id="match-time">0.0s</span>
        </p>
        <div class="match-grid">
          ${this.tiles.map((t, i) =>
            `<button class="tile side-${t.side}" data-i="${i}">${esc(t.text)}</button>`).join('')}
        </div>
        <div class="controls"><button class="btn btn-quiet" id="match-new">New board</button></div>
      </section>`;
    this.btnEls = Array.from(this.container.querySelectorAll('.tile'));
    this.btnEls.forEach((b, i) => b.onclick = () => this.clickTile(i));
    this.container.querySelector('#match-new').onclick = () => this.start();
  },

  startTimer() {
    this.startTime = Date.now();
    const label = this.container.querySelector('#match-time');
    this.timerInt = setInterval(() => {
      if (label) label.textContent = ((Date.now() - this.startTime) / 1000).toFixed(1) + 's';
    }, 100);
  },

  clickTile(i) {
    if (this.locked) return;
    const t = this.tiles[i];
    const btn = this.btnEls[i];
    if (btn.classList.contains('matched')) return;
    if (!this.startTime) this.startTimer();

    if (this.sel === null) {
      this.sel = i;
      btn.classList.add('selected');
      return;
    }
    if (this.sel === i) {
      this.sel = null;
      btn.classList.remove('selected');
      return;
    }

    const first = this.tiles[this.sel];
    const firstBtn = this.btnEls[this.sel];
    firstBtn.classList.remove('selected');
    this.sel = null;

    if (first.id === t.id) {
      firstBtn.classList.add('matched');
      btn.classList.add('matched');
      Stats.record(t.id, 'matching', true);
      this.matched++;
      this.updateStatus();
      if (this.matched === this.pairCount) this.finish();
    } else {
      this.misses++;
      Stats.record(first.id, 'matching', false);
      Stats.record(t.id, 'matching', false);
      this.updateStatus();
      this.locked = true;
      firstBtn.classList.add('wrong');
      btn.classList.add('wrong');
      setTimeout(() => {
        firstBtn.classList.remove('wrong');
        btn.classList.remove('wrong');
        this.locked = false;
      }, 450);
    }
  },

  updateStatus() {
    const p = this.container.querySelector('#match-pairs');
    const m = this.container.querySelector('#match-misses');
    if (p) p.textContent = `${this.matched} / ${this.pairCount} pairs`;
    if (m) m.textContent = `${this.misses} ${this.misses === 1 ? 'miss' : 'misses'}`;
  },

  finish() {
    clearInterval(this.timerInt);
    const secs = ((Date.now() - this.startTime) / 1000).toFixed(1);
    this.container.innerHTML = `
      <section class="mode">
        <div class="learn-card">
          <span class="chip">Matching</span>
          <h2>Board cleared</h2>
          <p class="lead">${this.pairCount} pairs in ${secs}s with
          ${this.misses} ${this.misses === 1 ? 'miss' : 'misses'}.</p>
          <div class="controls"><button class="btn btn-primary" id="match-again">Play again</button></div>
        </div>
      </section>`;
    this.container.querySelector('#match-again').onclick = () => this.start();
  },
};
