// Conjugate mode: drill Spanish verb forms in a chosen tense.
//
// Two drills share one session shape. "One form at a time" asks for a single
// person; "Full table" asks for every person of one verb. Verbs you miss are
// weighted to come up more often, per tense, so stem changes you keep blowing
// stay in rotation.

const Conjugate = {
  QUIZ_LENGTH: 12,
  TABLE_COUNT: 5,
  container: null,
  s: null,          // session state
  _t: null,         // pending auto-advance timeout
  customOpen: false, // the add-your-own panel stays open across re-renders
  notice: '',

  enter(container) {
    this.container = container;
    if (!this.s) this.startSession();
    this.render();
  },

  exit() {
    clearTimeout(this._t);
  },

  // --- session ---

  // Missed verbs get a heavier weight, capped so one bad verb cannot take
  // over the whole session.
  weight(verb, tenseId) {
    return 1 + Math.min(ConjStats.misses(verb.inf, tenseId), 4) * 1.5;
  },

  pickVerb(verbs, tenseId, avoid) {
    const pool = verbs.length > 1 ? verbs.filter(v => v.inf !== avoid) : verbs;
    const weights = pool.map(v => this.weight(v, tenseId));
    let r = Math.random() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < pool.length; i++) {
      r -= weights[i];
      if (r <= 0) return pool[i];
    }
    return pool[pool.length - 1];
  },

  // tasks: [{ inf, pronounId }] for the quiz, [{ inf }] for the table drill.
  buildTasks() {
    const verbs = VerbStore.activeVerbs();
    if (!verbs.length) return [];
    const tenseId = VerbStore.tenseId;
    const people = VerbStore.pronouns();
    const tasks = [];
    let last = null;
    const n = VerbStore.drill === 'table'
      ? Math.min(this.TABLE_COUNT, verbs.length)
      : this.QUIZ_LENGTH;
    for (let i = 0; i < n; i++) {
      const v = this.pickVerb(verbs, tenseId, last);
      last = v.inf;
      tasks.push(VerbStore.drill === 'table'
        ? { inf: v.inf }
        : { inf: v.inf, pronounId: people[Math.floor(Math.random() * people.length)].id });
    }
    return tasks;
  },

  startSession(tasks) {
    clearTimeout(this._t);
    this.s = {
      drill: VerbStore.drill,
      tenseId: VerbStore.tenseId,
      tasks: tasks && tasks.length ? tasks : this.buildTasks(),
      i: 0,
      right: 0,
      missed: [],     // tasks answered wrong, for "practise the misses"
      graded: null,   // result of the current task once checked
    };
  },

  // Options changed under us, so the running session no longer matches.
  restart() {
    this.startSession();
    this.render();
    this.notice = '';
  },

  verb(inf) {
    return VerbStore.activeVerbs().find(v => v.inf === inf) ||
      VERB_BY_INF[inf] ||
      VerbStore.custom.find(v => v.inf === inf);
  },

  task() {
    return this.s.tasks[this.s.i];
  },

  // --- render ---

  render() {
    const bar = this.optionsBar();
    if (!VerbStore.activeVerbs().length) {
      this.container.innerHTML = `<section class="mode">${bar}
        <div class="empty">This set has no verbs yet. Add one below the options.</div>
        ${this.customPanel()}</section>`;
      this.wireOptions();
      return;
    }
    if (this.s.i >= this.s.tasks.length) return this.renderDone();
    if (this.s.drill === 'table') this.renderTable();
    else this.renderQuiz();
  },

  optionsBar() {
    const sets = VerbStore.sets();
    const tense = getTense(VerbStore.tenseId);
    return `
      <div class="deck-bar conj-bar">
        <label class="deck-label" for="conj-set">Verbs</label>
        <select class="select grow" id="conj-set">
          ${sets.map(s => `<option value="${esc(s.id)}"${s.id === VerbStore.setId ? ' selected' : ''}>
            ${esc(s.name)} (${VerbStore.verbs(s.id).length})</option>`).join('')}
        </select>
        <label class="deck-label" for="conj-tense">Tense</label>
        <select class="select" id="conj-tense">
          ${TENSES.map(t => `<option value="${esc(t.id)}"${t.id === VerbStore.tenseId ? ' selected' : ''}>
            ${esc(t.name)}</option>`).join('')}
        </select>
        <select class="select" id="conj-drill">
          <option value="quiz"${VerbStore.drill === 'quiz' ? ' selected' : ''}>One form at a time</option>
          <option value="table"${VerbStore.drill === 'table' ? ' selected' : ''}>Full table</option>
        </select>
        <label class="check"><input type="checkbox" id="conj-vosotros"${
          VerbStore.vosotros ? ' checked' : ''}> vosotros</label>
      </div>
      <p class="conj-note">${esc(tense.spanish)} &middot; ${esc(tense.note)}</p>`;
  },

  header() {
    const total = this.s.tasks.length;
    const pct = total ? Math.round((this.s.i / total) * 100) : 0;
    return `
      <p class="progress-label">${Math.min(this.s.i + 1, total)} / ${total}
        &middot; ${this.s.right} right</p>
      <div class="bar"><i style="width:${pct}%"></i></div>`;
  },

  tagChips(verb) {
    if (!verb.tags || !verb.tags.length) return '';
    return `<span class="tags">${verb.tags.map(t =>
      `<span class="tag">${esc(t)}</span>`).join('')}</span>`;
  },

  renderQuiz() {
    const t = this.task();
    const v = this.verb(t.inf);
    if (!v) { this.s.i++; return this.render(); }
    const pronoun = PRONOUNS[PRONOUN_INDEX[t.pronounId]];
    this.container.innerHTML = `
      <section class="mode">
        ${this.optionsBar()}
        ${this.header()}
        <div class="learn-card">
          <span class="chip">${esc(getTense(this.s.tenseId).name)}</span>
          <p class="term">${esc(v.inf)}</p>
          <p class="def">${esc(v.gloss)}</p>
          ${this.tagChips(v)}
          <p class="conj-prompt">${esc(pronoun.label)} &hellip;</p>
          <div class="controls">
            <input class="text-input" id="conj-input" autocomplete="off"
              autocapitalize="off" spellcheck="false" placeholder="the ${esc(pronoun.label)} form&hellip;">
          </div>
          <div class="controls" id="conj-after">
            <button class="btn btn-primary" id="conj-primary">Check</button>
          </div>
          <p id="conj-note"></p>
        </div>
        ${this.customPanel()}
      </section>`;
    this.wireOptions();

    const input = this.container.querySelector('#conj-input');
    input.focus();
    const expected = Conjugator.form(v, this.s.tenseId, t.pronounId);
    const check = () => {
      const verdict = Conjugator.check(input.value, expected, pronoun);
      input.disabled = true;
      const note = this.container.querySelector('#conj-note');
      const after = this.container.querySelector('#conj-after');
      if (verdict === 'right') {
        input.classList.add('input-right');
        note.innerHTML = '<span class="note-right">Correct.</span>';
        after.innerHTML = '';
        this.score(t, v, true);
        this._t = setTimeout(() => this.advance(), 650);
        return;
      }
      if (verdict === 'accent') {
        input.classList.add('input-right');
        note.innerHTML = `<span class="note-right">Right &mdash; mind the accent:
          <strong>${esc(expected)}</strong></span>`;
        after.innerHTML = '<button class="btn btn-primary" id="conj-primary">Continue</button>';
        this.score(t, v, true);
        this.container.querySelector('#conj-primary').onclick = () => this.advance();
        return;
      }
      input.classList.add('input-wrong');
      note.innerHTML = `<span class="note-wrong">Answer: <strong>${esc(expected)}</strong></span>`;
      after.innerHTML = `
        <button class="btn btn-primary" id="conj-primary">Continue</button>
        <button class="btn btn-quiet" id="conj-override">I was right</button>`;
      this.score(t, v, false);
      this.container.querySelector('#conj-primary').onclick = () => this.advance();
      this.container.querySelector('#conj-override').onclick = () => {
        this.unscore(t, v);
        this.advance();
      };
    };
    this.container.querySelector('#conj-primary').onclick = check;
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !input.disabled) check();
    });
    input.addEventListener('input', () => input.classList.remove('input-wrong'));
  },

  renderTable() {
    const t = this.task();
    const v = this.verb(t.inf);
    if (!v) { this.s.i++; return this.render(); }
    const people = VerbStore.pronouns();
    this.container.innerHTML = `
      <section class="mode">
        ${this.optionsBar()}
        ${this.header()}
        <div class="learn-card">
          <span class="chip">${esc(getTense(this.s.tenseId).name)} &middot; full table</span>
          <p class="term">${esc(v.inf)}</p>
          <p class="def">${esc(v.gloss)}</p>
          ${this.tagChips(v)}
          <div class="conj-table">
            ${people.map(p => `
              <div class="conj-row">
                <label class="conj-person" for="cj-${esc(p.id)}">${esc(p.label)}</label>
                <input class="text-input" id="cj-${esc(p.id)}" data-p="${esc(p.id)}"
                  autocomplete="off" autocapitalize="off" spellcheck="false">
                <span class="conj-answer" data-a="${esc(p.id)}"></span>
              </div>`).join('')}
          </div>
          <div class="controls" id="conj-after">
            <button class="btn btn-primary" id="conj-primary">Check table</button>
          </div>
          <p id="conj-note"></p>
        </div>
        ${this.customPanel()}
      </section>`;
    this.wireOptions();

    const inputs = Array.from(this.container.querySelectorAll('[data-p]'));
    inputs[0].focus();
    // Enter walks down the table, and checks once you are on the last row.
    inputs.forEach((input, idx) => {
      input.addEventListener('keydown', e => {
        if (e.key !== 'Enter' || input.disabled) return;
        if (idx < inputs.length - 1) inputs[idx + 1].focus();
        else check();
      });
      input.addEventListener('input', () => input.classList.remove('input-wrong'));
    });

    const check = () => {
      let allRight = true;
      inputs.forEach(input => {
        const p = PRONOUNS[PRONOUN_INDEX[input.dataset.p]];
        const expected = Conjugator.form(v, this.s.tenseId, p.id);
        const verdict = Conjugator.check(input.value, expected, p);
        input.disabled = true;
        const slot = this.container.querySelector(`[data-a="${p.id}"]`);
        if (verdict === 'right') {
          input.classList.add('input-right');
        } else if (verdict === 'accent') {
          input.classList.add('input-right');
          slot.innerHTML = `<span class="note-right">${esc(expected)} (accent)</span>`;
        } else {
          allRight = false;
          input.classList.add('input-wrong');
          slot.innerHTML = `<span class="note-wrong">${esc(expected)}</span>`;
        }
      });
      this.score(t, v, allRight);
      this.container.querySelector('#conj-note').innerHTML = allRight
        ? '<span class="note-right">Whole table right.</span>'
        : '<span class="note-wrong">Corrections are on the right.</span>';
      const after = this.container.querySelector('#conj-after');
      after.innerHTML = '<button class="btn btn-primary" id="conj-primary">Continue</button>';
      this.container.querySelector('#conj-primary').onclick = () => this.advance();
    };
    this.container.querySelector('#conj-primary').onclick = check;
  },

  score(t, v, correct) {
    if (this.s.graded) return;
    this.s.graded = { correct };
    ConjStats.record(v.inf, this.s.tenseId, correct);
    if (correct) this.s.right++;
    else this.s.missed.push(t);
  },

  // "I was right" after a wrong verdict: undo the miss that was just recorded.
  unscore(t, v) {
    if (!this.s.graded || this.s.graded.correct) return;
    this.s.graded = { correct: true };
    ConjStats.record(v.inf, this.s.tenseId, true);
    const rec = ConjStats.get(v.inf, this.s.tenseId);
    if (rec.misses > 0) {
      rec.misses--;
      ConjStats.save();
    }
    this.s.missed.pop();
    this.s.right++;
  },

  advance() {
    clearTimeout(this._t);
    this.s.i++;
    this.s.graded = null;
    this.render();
  },

  renderDone() {
    const total = this.s.tasks.length;
    const pct = total ? Math.round((this.s.right / total) * 100) : 0;
    const missedNames = [];
    this.s.missed.forEach(t => {
      if (missedNames.indexOf(t.inf) === -1) missedNames.push(t.inf);
    });
    const tough = this.toughest();
    this.container.innerHTML = `
      <section class="mode">
        ${this.optionsBar()}
        <div class="learn-card">
          <span class="chip">Done</span>
          <h2>${this.s.right} of ${total} right</h2>
          <p class="lead">${pct}% in the ${esc(getTense(this.s.tenseId).name.toLowerCase())}.</p>
          ${missedNames.length ? `<p class="lead">Missed:
            ${missedNames.map(i => `<strong>${esc(i)}</strong>`).join(', ')}.</p>` : ''}
          ${tough.length ? `<p class="lead">Toughest so far:
            ${tough.map(x => `<span class="misschip">${esc(x.inf)} &times;${x.misses}</span>`).join(' ')}</p>` : ''}
          <div class="controls">
            ${this.s.missed.length ? '<button class="btn btn-primary" id="conj-redo">Practise the misses</button>' : ''}
            <button class="btn${this.s.missed.length ? '' : ' btn-primary'}" id="conj-primary">New round</button>
          </div>
        </div>
        ${this.customPanel()}
        ${this.referencePanel()}
      </section>`;
    this.wireOptions();
    const redo = this.container.querySelector('#conj-redo');
    if (redo) {
      const tasks = this.s.missed.slice();
      redo.onclick = () => { this.startSession(tasks); this.render(); };
    }
    this.container.querySelector('#conj-primary').onclick = () => {
      this.startSession();
      this.render();
    };
  },

  // Most-missed verbs of the active set in this tense.
  toughest() {
    return VerbStore.activeVerbs()
      .map(v => ({ inf: v.inf, misses: ConjStats.misses(v.inf, this.s.tenseId) }))
      .filter(x => x.misses > 0)
      .sort((a, b) => b.misses - a.misses)
      .slice(0, 5);
  },

  // --- panels shown on the summary screen ---

  referencePanel() {
    const tense = getTense(VerbStore.tenseId);
    const people = VerbStore.pronouns();
    return `
      <details class="import conj-ref">
        <summary>Conjugation table &mdash; ${esc(VerbStore.activeSet().name)}, ${esc(tense.name.toLowerCase())}</summary>
        <table class="table">
          <thead><tr><th>Verb</th>${people.map(p =>
            `<th>${esc(p.label)}</th>`).join('')}</tr></thead>
          <tbody>
            ${VerbStore.activeVerbs().map(v => `
              <tr>
                <td class="term-cell">${esc(v.inf)}</td>
                ${people.map(p => `<td>${esc(Conjugator.form(v, tense.id, p.id))}</td>`).join('')}
              </tr>`).join('')}
          </tbody>
        </table>
      </details>`;
  },

  customPanel() {
    return `
      <details class="import" id="cv-panel"${this.customOpen ? ' open' : ''}>
        <summary>Add your own verbs</summary>
        <p class="lead">Regular and stem-changing verbs only &mdash; the engine builds every
        tense from the infinitive. A verb with irregular forms belongs in a built-in set.</p>
        <div class="add-row">
          <input class="text-input" id="cv-inf" placeholder="infinitive, e.g. bailar" autocomplete="off">
          <input class="text-input grow" id="cv-gloss" placeholder="meaning" autocomplete="off">
          <select class="select" id="cv-stem">
            <option value="">no stem change</option>
            <option value="e>ie">e &rarr; ie</option>
            <option value="o>ue">o &rarr; ue</option>
            <option value="e>i">e &rarr; i</option>
            <option value="u>ue">u &rarr; ue</option>
          </select>
          <button class="btn" id="cv-add">Add verb</button>
        </div>
        <p id="cv-note">${this.notice ? `<span class="note-right">${esc(this.notice)}</span>` : ''}</p>
        ${VerbStore.custom.length ? `
          <div class="word-list">
            ${VerbStore.custom.map(v => `
              <div class="word-row">
                <span class="t">${esc(v.inf)}</span>
                <span class="d">${esc(v.gloss)}${v.stem ? ` &middot; ${esc(v.stem)}` : ''}</span>
                <button class="x-btn" data-cv="${esc(v.inf)}" title="Delete">&times;</button>
              </div>`).join('')}
          </div>` : ''}
      </details>`;
  },

  // --- wiring ---

  wireOptions() {
    const q = sel => this.container.querySelector(sel);

    const setSel = q('#conj-set');
    if (setSel) setSel.onchange = e => { VerbStore.set('setId', e.target.value); this.restart(); };

    const tenseSel = q('#conj-tense');
    if (tenseSel) tenseSel.onchange = e => { VerbStore.set('tenseId', e.target.value); this.restart(); };

    const drillSel = q('#conj-drill');
    if (drillSel) drillSel.onchange = e => { VerbStore.set('drill', e.target.value); this.restart(); };

    const vos = q('#conj-vosotros');
    if (vos) vos.onchange = e => { VerbStore.set('vosotros', e.target.checked); this.restart(); };

    const panel = q('#cv-panel');
    if (panel) panel.ontoggle = () => { this.customOpen = panel.open; };

    const addBtn = q('#cv-add');
    if (addBtn) {
      const add = () => {
        const res = VerbStore.addCustom(q('#cv-inf').value, q('#cv-gloss').value, q('#cv-stem').value);
        if (!res.ok) {
          q('#cv-note').innerHTML = `<span class="note-wrong">${esc(res.why)}</span>`;
          return;
        }
        this.customOpen = true;
        this.notice = `Added ${res.verb.inf} to “My verbs”.`;
        this.restart();
      };
      addBtn.onclick = add;
      q('#cv-gloss').addEventListener('keydown', e => { if (e.key === 'Enter') add(); });
    }

    this.container.querySelectorAll('[data-cv]').forEach(b => {
      b.onclick = () => {
        VerbStore.removeCustom(b.dataset.cv);
        this.customOpen = true;
        this.notice = `Removed ${b.dataset.cv}.`;
        this.restart();
      };
    });
  },

  onKey(e) {
    if (e.key !== 'Enter') return;
    const btn = this.container && this.container.querySelector('#conj-primary');
    if (btn) {
      e.preventDefault();
      btn.click();
    }
  },
};
