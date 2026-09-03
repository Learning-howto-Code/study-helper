// Learn mode: introduces words in small batches, then drills each word
// with multiple choice and typing until it is answered correctly.
// Missed words are re-queued within the batch; most-missed words lead
// the next session.
//
// Words that pass the first drill are not retired outright. They go into
// a review pool and get woven back into later batches at growing gaps,
// so earlier words stay fresh while new ones come in. A word is only
// mastered after it survives REVIEWS_TO_RETIRE spaced reviews; missing a
// review sends it back to the start of the review ladder.

const Learn = {
  BATCH_SIZE: 3,
  REVIEWS_TO_RETIRE: 2,
  // Tasks to answer before review N comes due. Last value repeats.
  REVIEW_GAPS: [4, 10],
  // Shorter gap after a blown review, so the word comes back quickly.
  RELEARN_GAP: 3,
  container: null,
  s: null, // session state
  _t: null, // pending auto-advance timeout

  enter(container) {
    this.container = container;
    if (!Store.words.length) {
      this.container.innerHTML = '<div class="empty">No words yet. Add some in the Words tab.</div>';
      return;
    }
    if (!this.s) this.renderStart();
    else this.renderCurrent();
  },

  exit() {
    clearTimeout(this._t);
  },

  reset() {
    clearTimeout(this._t);
    this.s = null;
  },

  renderStart() {
    this.container.innerHTML = `
      <section class="mode">
        <div class="learn-card">
          <span class="chip">Learn</span>
          <h2>Learn ${Store.words.length} words</h2>
          <p class="lead">Words come ${this.BATCH_SIZE} at a time, then get drilled with
          multiple choice and typing. Miss one and it comes back around.
          Words you already got right keep resurfacing at wider gaps, so nothing
          fades while you learn the rest. Your most-missed words lead the session.</p>
          <div class="controls"><button class="btn btn-primary" id="learn-primary">Start</button></div>
        </div>
      </section>`;
    this.container.querySelector('#learn-primary').onclick = () => this.startSession();
  },

  startSession() {
    const ordered = Store.words.slice().sort((a, b) => Stats.totalMisses(b.id) - Stats.totalMisses(a.id));
    this.s = {
      order: ordered.map(w => w.id),
      // id -> { reviews, due } for words awaiting their next spaced review.
      learned: new Map(),
      // Words that cleared every review. These are the mastered ones.
      retired: new Set(),
      missed: new Set(),
      taskCount: 0,
      batch: null,
    };
    this.nextBatch();
  },

  // Words not yet seen in this session.
  freshIds() {
    return this.s.order.filter(id =>
      !this.s.retired.has(id) && !this.s.learned.has(id) && Store.getWord(id));
  },

  // Words in the review pool, soonest due first.
  pendingReviewIds() {
    return Array.from(this.s.learned.keys())
      .filter(id => Store.getWord(id))
      .sort((a, b) => this.s.learned.get(a).due - this.s.learned.get(b).due);
  },

  reviewKind(reviews) {
    return reviews === 0 ? 'mc' : 'written';
  },

  nextBatch() {
    const fresh = this.freshIds();
    if (fresh.length) {
      const ids = fresh.slice(0, this.BATCH_SIZE);
      this.s.batch = { ids, introI: 0, queue: [], phase: 'intro' };
      this.renderIntro();
      return;
    }
    // No new words left: run down the review pool, due or not.
    const pending = this.pendingReviewIds();
    if (!pending.length) return this.renderComplete();
    this.s.batch = {
      ids: [],
      introI: 0,
      phase: 'drill',
      queue: pending.map(id => ({ id, kind: this.reviewKind(this.s.learned.get(id).reviews), review: true })),
    };
    this.renderTask();
  },

  header() {
    // Words deleted mid-session drop out of the denominator.
    const total = this.s.order.filter(id => this.s.retired.has(id) || Store.getWord(id)).length;
    const done = this.s.retired.size;
    const reviewing = this.s.learned.size;
    const pct = total ? Math.round((done / total) * 100) : 0;
    return `
      <p class="progress-label">${done} of ${total} mastered${reviewing ? ` &middot; ${reviewing} in review` : ''}</p>
      <div class="bar"><i style="width:${pct}%"></i></div>`;
  },

  renderIntro() {
    const b = this.s.batch;
    const w = Store.getWord(b.ids[b.introI]);
    if (!w) return this.introNext();
    this.container.innerHTML = `
      <section class="mode">
        ${this.header()}
        <div class="learn-card">
          <span class="chip">New word ${b.introI + 1} of ${b.ids.length}</span>
          <p class="term">${esc(w.term)}</p>
          <p class="def">${esc(w.def)}</p>
          <div class="controls">
            <input class="text-input" id="learn-input" autocomplete="off"
              placeholder="Type the term to continue&hellip;">
          </div>
          <div class="controls"><button class="btn btn-primary" id="learn-primary">Next</button></div>
          <p id="learn-note"></p>
        </div>
      </section>`;
    const input = this.container.querySelector('#learn-input');
    input.focus();
    const norm = s => s.trim().toLowerCase().replace(/\s+/g, ' ');
    const submit = () => {
      if (norm(input.value) === norm(w.term)) {
        input.disabled = true;
        input.classList.add('input-right');
        this._t = setTimeout(() => this.introNext(), 350);
      } else {
        input.classList.add('input-wrong');
        this.container.querySelector('#learn-note').innerHTML =
          '<span class="note-wrong">Type the word shown above to continue.</span>';
        input.select();
      }
    };
    this.container.querySelector('#learn-primary').onclick = submit;
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !input.disabled) submit();
    });
    input.addEventListener('input', () => input.classList.remove('input-wrong'));
  },

  introNext() {
    const b = this.s.batch;
    b.introI++;
    if (b.introI >= b.ids.length) {
      b.phase = 'drill';
      b.queue = shuffle(b.ids).map(id => ({ id, kind: 'mc' }));
      this.injectDueReviews();
      this.renderTask();
    } else {
      this.renderIntro();
    }
  },

  // Weave any now-due review words into the running queue, just behind the
  // current task so they land between the new words rather than after them.
  injectDueReviews() {
    const b = this.s.batch;
    if (!b) return;
    const queued = new Set(b.queue.map(x => x.id));
    for (const id of this.pendingReviewIds()) {
      const rec = this.s.learned.get(id);
      if (rec.due > this.s.taskCount || queued.has(id)) continue;
      const pos = Math.min(1 + Math.floor(Math.random() * 2), b.queue.length);
      b.queue.splice(pos, 0, { id, kind: this.reviewKind(rec.reviews), review: true });
      queued.add(id);
    }
  },

  renderTask() {
    const b = this.s.batch;
    const t = b.queue[0];
    if (!t) return this.renderBatchDone();
    if (!Store.getWord(t.id)) {
      b.queue.shift();
      this.s.learned.delete(t.id);
      return this.renderTask();
    }
    if (t.kind === 'mc') this.renderMC(t);
    else this.renderWritten(t);
  },

  renderMC(t) {
    const w = Store.getWord(t.id);
    const normDef = s => s.trim().toLowerCase();
    const seenDefs = new Set([normDef(w.def)]);
    const pool = Store.words.filter(x => {
      if (x.id === w.id || seenDefs.has(normDef(x.def))) return false;
      seenDefs.add(normDef(x.def));
      return true;
    });
    const others = sample(pool, 3).map(x => ({ text: x.def, correct: false }));
    const options = shuffle([{ text: w.def, correct: true }, ...others]);
    this.container.innerHTML = `
      <section class="mode">
        ${this.header()}
        <div class="learn-card">
          <span class="chip">${t.review ? 'Review &middot; choose the definition' : 'Choose the definition'}</span>
          <p class="term">${esc(w.term)}</p>
          <div id="learn-opts">
            ${options.map((o, i) => `<button class="opt" data-i="${i}">${esc(o.text)}</button>`).join('')}
          </div>
          <div class="controls" id="learn-after"></div>
        </div>
      </section>`;
    const btns = Array.from(this.container.querySelectorAll('.opt'));
    btns.forEach((btn, i) => {
      btn.onclick = () => {
        btns.forEach(x => x.disabled = true);
        const rightBtn = btns[options.findIndex(x => x.correct)];
        rightBtn.classList.add('right');
        if (options[i].correct) {
          Stats.record(w.id, 'learn', true);
          this._t = setTimeout(() => this.completeTask(t, true), 700);
        } else {
          btn.classList.add('wrong');
          Stats.record(w.id, 'learn', false);
          this.s.missed.add(w.id);
          this.container.querySelector('#learn-after').innerHTML =
            '<button class="btn btn-primary" id="learn-primary">Continue</button>';
          this.container.querySelector('#learn-primary').onclick = () => this.completeTask(t, false);
        }
      };
    });
  },

  renderWritten(t) {
    const w = Store.getWord(t.id);
    this.container.innerHTML = `
      <section class="mode">
        ${this.header()}
        <div class="learn-card">
          <span class="chip">${t.review ? 'Review &middot; type the term' : 'Type the term'}</span>
          <p class="def">${esc(w.def)}</p>
          <div class="controls">
            <input class="text-input" id="learn-input" autocomplete="off" placeholder="Type the term&hellip;">
          </div>
          <div class="controls" id="learn-after">
            <button class="btn btn-primary" id="learn-primary">Check</button>
          </div>
          <p id="learn-note"></p>
        </div>
      </section>`;
    const input = this.container.querySelector('#learn-input');
    input.focus();
    const norm = s => s.trim().toLowerCase().replace(/\s+/g, ' ');
    const check = () => {
      input.disabled = true;
      if (norm(input.value) === norm(w.term)) {
        Stats.record(w.id, 'learn', true);
        input.classList.add('input-right');
        this.container.querySelector('#learn-note').innerHTML = '<span class="note-right">Correct.</span>';
        this.container.querySelector('#learn-after').innerHTML = '';
        this._t = setTimeout(() => this.completeTask(t, true), 700);
      } else {
        input.classList.add('input-wrong');
        this.container.querySelector('#learn-note').innerHTML =
          `<span class="note-wrong">Answer: <strong>${esc(w.term)}</strong></span>`;
        this.container.querySelector('#learn-after').innerHTML = `
          <button class="btn btn-primary" id="learn-primary">Continue</button>
          <button class="btn btn-quiet" id="learn-override">I was right</button>`;
        this.container.querySelector('#learn-primary').onclick = () => {
          Stats.record(w.id, 'learn', false);
          this.s.missed.add(w.id);
          this.completeTask(t, false);
        };
        this.container.querySelector('#learn-override').onclick = () => {
          Stats.record(w.id, 'learn', true);
          this.completeTask(t, true);
        };
      }
    };
    this.container.querySelector('#learn-primary').onclick = check;
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !input.disabled) check();
    });
  },

  completeTask(t, correct) {
    const b = this.s.batch;
    b.queue.shift();
    this.s.taskCount++;
    if (t.review) this.completeReview(t, correct);
    else this.completeDrill(t, correct);
    this.injectDueReviews();
    if (!b.queue.length) this.renderBatchDone();
    else this.renderTask();
  },

  completeDrill(t, correct) {
    const b = this.s.batch;
    if (!correct) return this.requeue(t);
    if (t.kind === 'mc') {
      b.queue.push({ id: t.id, kind: 'written' });
    } else {
      // First pass done. Into the review pool rather than straight to mastered.
      this.s.learned.set(t.id, { reviews: 0, due: this.s.taskCount + this.REVIEW_GAPS[0] });
    }
  },

  completeReview(t, correct) {
    const rec = this.s.learned.get(t.id);
    if (!rec) return; // word was deleted or already retired
    if (!correct) {
      // Back to the bottom of the ladder, and back around soon.
      rec.reviews = 0;
      rec.due = this.s.taskCount + this.RELEARN_GAP;
      return this.requeue(t);
    }
    rec.reviews++;
    if (rec.reviews >= this.REVIEWS_TO_RETIRE) {
      this.s.learned.delete(t.id);
      this.s.retired.add(t.id);
    } else {
      const gap = this.REVIEW_GAPS[Math.min(rec.reviews, this.REVIEW_GAPS.length - 1)];
      rec.due = this.s.taskCount + gap;
    }
  },

  // Re-queue the same task a couple of positions later.
  requeue(t) {
    const b = this.s.batch;
    const pos = Math.min(2, b.queue.length);
    b.queue.splice(pos, 0, { id: t.id, kind: t.kind, review: t.review });
  },

  renderBatchDone() {
    const fresh = this.freshIds().length;
    const reviewing = this.pendingReviewIds().length;
    if (!fresh && !reviewing) return this.renderComplete();
    const bits = [];
    if (fresh) bits.push(`${fresh} new to go`);
    if (reviewing) bits.push(`${reviewing} coming back for review`);
    this.container.innerHTML = `
      <section class="mode">
        ${this.header()}
        <div class="learn-card">
          <span class="chip">Checkpoint</span>
          <h2>${fresh ? 'Batch complete' : 'New words done'}</h2>
          <p class="lead">${this.s.retired.size} of ${this.s.order.length} words mastered. ${bits.join(', ')}.</p>
          <div class="controls"><button class="btn btn-primary" id="learn-primary">Keep going</button></div>
        </div>
      </section>`;
    this.container.querySelector('#learn-primary').onclick = () => this.nextBatch();
  },

  renderComplete() {
    const missed = Array.from(this.s.missed).map(id => Store.getWord(id)).filter(Boolean);
    this.container.innerHTML = `
      <section class="mode">
        ${this.header()}
        <div class="learn-card">
          <span class="chip">Done</span>
          <h2>Session complete</h2>
          <p class="lead">All ${this.s.retired.size} words mastered this round.</p>
          ${missed.length ? `<p class="lead">Tripped you up: ${missed.map(w => `<strong>${esc(w.term)}</strong>`).join(', ')}.
            They lead the next session.</p>` : ''}
          <div class="controls"><button class="btn btn-primary" id="learn-primary">Start a new session</button></div>
        </div>
      </section>`;
    this.container.querySelector('#learn-primary').onclick = () => this.startSession();
  },

  renderCurrent() {
    const b = this.s && this.s.batch;
    if (!b) return this.renderStart();
    if (b.phase === 'intro' && b.introI < b.ids.length) return this.renderIntro();
    return this.renderTask();
  },

  onKey(e) {
    if (e.key === 'Enter') {
      const btn = this.container && this.container.querySelector('#learn-primary');
      if (btn) {
        e.preventDefault();
        btn.click();
      }
    }
  },
};
