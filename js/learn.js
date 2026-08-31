// Learn mode: introduces words in small batches, then drills each word
// with multiple choice and typing until it is answered correctly.
// Missed words are re-queued within the batch; most-missed words lead
// the next session.

const Learn = {
  BATCH_SIZE: 3,
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

  renderStart() {
    this.container.innerHTML = `
      <section class="mode">
        <div class="learn-card">
          <span class="chip">Learn</span>
          <h2>Learn ${Store.words.length} words</h2>
          <p class="lead">Words come ${this.BATCH_SIZE} at a time, then get drilled with
          multiple choice and typing. Miss one and it comes back around.
          Your most-missed words lead the session.</p>
          <div class="controls"><button class="btn btn-primary" id="learn-primary">Start</button></div>
        </div>
      </section>`;
    this.container.querySelector('#learn-primary').onclick = () => this.startSession();
  },

  startSession() {
    const ordered = Store.words.slice().sort((a, b) => Stats.totalMisses(b.id) - Stats.totalMisses(a.id));
    this.s = {
      order: ordered.map(w => w.id),
      done: new Set(),
      missed: new Set(),
      batch: null,
    };
    this.nextBatch();
  },

  nextBatch() {
    const remaining = this.s.order.filter(id => !this.s.done.has(id) && Store.getWord(id));
    if (!remaining.length) return this.renderComplete();
    const ids = remaining.slice(0, this.BATCH_SIZE);
    this.s.batch = { ids, introI: 0, queue: [], phase: 'intro' };
    this.renderIntro();
  },

  header() {
    const total = this.s.order.length;
    const done = this.s.done.size;
    const pct = total ? Math.round((done / total) * 100) : 0;
    return `
      <p class="progress-label">${done} of ${total} mastered</p>
      <div class="bar"><i style="width:${pct}%"></i></div>`;
  },

  renderIntro() {
    const b = this.s.batch;
    const w = Store.getWord(b.ids[b.introI]);
    this.container.innerHTML = `
      <section class="mode">
        ${this.header()}
        <div class="learn-card">
          <span class="chip">New word ${b.introI + 1} of ${b.ids.length}</span>
          <p class="term">${esc(w.term)}</p>
          <p class="def">${esc(w.def)}</p>
          <div class="controls"><button class="btn btn-primary" id="learn-primary">Next</button></div>
        </div>
      </section>`;
    this.container.querySelector('#learn-primary').onclick = () => this.introNext();
  },

  introNext() {
    const b = this.s.batch;
    b.introI++;
    if (b.introI >= b.ids.length) {
      b.phase = 'drill';
      b.queue = shuffle(b.ids).map(id => ({ id, kind: 'mc' }));
      this.renderTask();
    } else {
      this.renderIntro();
    }
  },

  renderTask() {
    const b = this.s.batch;
    const t = b.queue[0];
    if (!t) return this.renderBatchDone();
    if (!Store.getWord(t.id)) {
      b.queue.shift();
      return this.renderTask();
    }
    if (t.kind === 'mc') this.renderMC(t);
    else this.renderWritten(t);
  },

  renderMC(t) {
    const w = Store.getWord(t.id);
    const others = sample(Store.words.filter(x => x.id !== w.id), 3)
      .map(x => ({ text: x.def, correct: false }));
    const options = shuffle([{ text: w.def, correct: true }, ...others]);
    this.container.innerHTML = `
      <section class="mode">
        ${this.header()}
        <div class="learn-card">
          <span class="chip">Choose the definition</span>
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
          <span class="chip">Type the term</span>
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
    if (correct) {
      if (t.kind === 'mc') b.queue.push({ id: t.id, kind: 'written' });
      else this.s.done.add(t.id);
    } else {
      // Re-queue the same task a couple of positions later.
      const pos = Math.min(2, b.queue.length);
      b.queue.splice(pos, 0, { id: t.id, kind: t.kind });
    }
    if (!b.queue.length) this.renderBatchDone();
    else this.renderTask();
  },

  renderBatchDone() {
    const remaining = this.s.order.filter(id => !this.s.done.has(id) && Store.getWord(id)).length;
    if (!remaining) return this.renderComplete();
    this.container.innerHTML = `
      <section class="mode">
        ${this.header()}
        <div class="learn-card">
          <span class="chip">Checkpoint</span>
          <h2>Batch complete</h2>
          <p class="lead">${this.s.done.size} of ${this.s.order.length} words mastered. ${remaining} to go.</p>
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
          <p class="lead">All ${this.s.order.length} words mastered this round.</p>
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
