// Flashcard mode: flip, then rate yourself. Misses feed the stats.

const Flashcards = {
  container: null,
  deck: [], i: 0, flipped: false, missedIds: [], got: 0, done: false,

  enter(container) {
    this.container = container;
    // Keep mid-deck progress across tab switches; render() shows the
    // finished screen when done.
    if (this.deck.length) this.render();
    else this.start();
  },

  start(ids) {
    const words = ids
      ? ids.map(id => Store.getWord(id)).filter(Boolean)
      : Store.words.slice();
    if (!words.length) {
      this.container.innerHTML = '<div class="empty">No words yet. Add some in the Words tab.</div>';
      this.deck = [];
      this.done = true;
      return;
    }
    this.deck = shuffle(words);
    this.i = 0;
    this.flipped = false;
    this.missedIds = [];
    this.got = 0;
    this.done = false;
    this.render();
  },

  card() { return this.deck[this.i]; },

  render() {
    if (this.done) return this.renderDone();
    const w = this.card();
    this.container.innerHTML = `
      <section class="mode">
        <p class="progress-label">${this.i + 1} / ${this.deck.length}</p>
        <div class="flashcard${this.flipped ? ' flipped' : ''}" id="fc-card">
          <div class="flashcard-inner">
            <div class="face front">
              <span class="term">${esc(w.term)}</span>
              <span class="hint">click to flip</span>
            </div>
            <div class="face back"><span class="def">${esc(w.def)}</span></div>
          </div>
        </div>
        <div class="controls" id="fc-controls"></div>
        <p class="keys-hint">space flips &middot; &larr; missed it &middot; &rarr; got it</p>
      </section>`;
    this.container.querySelector('#fc-card').onclick = () => this.flip();
    this.renderControls();
  },

  renderControls() {
    const c = this.container.querySelector('#fc-controls');
    if (!c) return;
    if (this.flipped) {
      c.innerHTML = `
        <button class="btn btn-wrong" id="fc-miss">Missed it</button>
        <button class="btn btn-right" id="fc-got">Got it</button>`;
      c.querySelector('#fc-miss').onclick = () => this.answer(false);
      c.querySelector('#fc-got').onclick = () => this.answer(true);
    } else {
      c.innerHTML = '<button class="btn" id="fc-flip">Flip</button>';
      c.querySelector('#fc-flip').onclick = () => this.flip();
    }
  },

  flip() {
    if (this.done) return;
    this.flipped = !this.flipped;
    const card = this.container.querySelector('#fc-card');
    if (card) card.classList.toggle('flipped', this.flipped);
    this.renderControls();
  },

  answer(correct) {
    if (this.done || !this.flipped) return;
    const w = this.card();
    if (Store.getWord(w.id)) Stats.record(w.id, 'flashcards', correct);
    if (correct) this.got++;
    else this.missedIds.push(w.id);
    this.i++;
    this.flipped = false;
    if (this.i >= this.deck.length) this.done = true;
    this.render();
  },

  renderDone() {
    const missed = this.missedIds.map(id => Store.getWord(id)).filter(Boolean);
    this.container.innerHTML = `
      <section class="mode">
        <div class="learn-card">
          <span class="chip">Flashcards</span>
          <h2>Deck finished</h2>
          <p class="lead">${this.got} of ${this.deck.length} right.</p>
          ${missed.length ? `<p class="lead">Missed: ${missed.map(w => `<strong>${esc(w.term)}</strong>`).join(', ')}.</p>` : ''}
          <div class="controls">
            ${missed.length ? '<button class="btn btn-primary" id="fc-review">Review missed</button>' : ''}
            <button class="btn" id="fc-restart">Study again</button>
          </div>
        </div>
      </section>`;
    const r = this.container.querySelector('#fc-review');
    if (r) r.onclick = () => this.start(this.missedIds.slice());
    this.container.querySelector('#fc-restart').onclick = () => this.start();
  },

  onKey(e) {
    if (this.done) return;
    if (e.code === 'Space') {
      e.preventDefault();
      this.flip();
    } else if (e.key === 'ArrowLeft') {
      this.answer(false);
    } else if (e.key === 'ArrowRight') {
      this.answer(true);
    }
  },
};
