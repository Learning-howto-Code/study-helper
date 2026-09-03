// Words view: pick the active set, and manage the words inside it.

const WordsView = {
  container: null,
  notice: '',
  renaming: false,
  deleteArmed: false,
  _armTimer: null,

  enter(container) {
    this.container = container;
    this.render();
  },

  exit() {
    clearTimeout(this._armTimer);
    this.renaming = false;
    this.deleteArmed = false;
  },

  // Switching sets invalidates any in-progress flashcard/learn session.
  switchTo(id) {
    if (!Store.setActive(id)) return;
    resetSessions();
    this.renaming = false;
    this.deleteArmed = false;
  },

  render() {
    const words = Store.words;
    const deck = Store.activeDeck();
    this.container.innerHTML = `
      <div class="pane">
        <div class="deck-bar">
          ${this.renaming ? `
            <input class="text-input grow" id="deck-name" value="${esc(deck.name)}" autocomplete="off">
            <button class="btn btn-primary" id="deck-save">Save</button>
            <button class="btn btn-quiet" id="deck-cancel">Cancel</button>
          ` : `
            <label class="deck-label" for="deck-select">Studying</label>
            <select class="select grow" id="deck-select">
              ${Store.decks.map(d => `
                <option value="${esc(d.id)}"${d.id === Store.activeId ? ' selected' : ''}>
                  ${esc(d.name)} (${Store.deckCount(d.id)})
                </option>`).join('')}
            </select>
            <button class="btn" id="deck-rename">Rename</button>
            <button class="btn${this.deleteArmed ? ' btn-wrong' : ''}" id="deck-delete">${
              this.deleteArmed ? 'Click again to delete' : 'Delete set'}</button>
          `}
        </div>
        <div class="add-row">
          <input class="text-input grow" id="deck-new-name" placeholder="new set name" autocomplete="off">
          <button class="btn" id="deck-new">Create set</button>
        </div>

        <h2>${esc(deck.name)} <span class="count">${words.length}</span></h2>
        <div class="add-row">
          <input class="text-input" id="w-term" placeholder="term" autocomplete="off">
          <input class="text-input grow" id="w-def" placeholder="definition" autocomplete="off">
          <button class="btn btn-primary" id="w-add">Add</button>
        </div>
        <details class="import">
          <summary>Import a list</summary>
          <p class="lead">One word per line: <code>term - definition</code> (or tab-separated).
          Leave the name blank to import into <strong>${esc(deck.name)}</strong>.</p>
          <input class="text-input grow" id="w-import-name" placeholder="import as a new set (optional)" autocomplete="off">
          <textarea id="w-import" placeholder="ephemeral - lasting a very short time"></textarea>
          <div class="controls left"><button class="btn" id="w-import-btn">Import</button></div>
        </details>
        <details class="import">
          <summary>Card sets</summary>
          <p class="lead">Each one is added as its own set, kept separate from your words.</p>
          <div class="set-list">
            ${PRESET_SETS.map(s => `
              <div class="set-row">
                <span class="t">${esc(s.name)} <span class="count">${s.words.length}</span></span>
                <span class="d">${esc(s.note || '')}</span>
                <button class="btn" data-set="${esc(s.id)}">Add as set</button>
              </div>`).join('')}
          </div>
        </details>
        ${this.notice ? `<p class="notice">${esc(this.notice)}</p>` : ''}
        <div class="word-list">
          ${words.map(w => `
            <div class="word-row">
              <span class="t">${esc(w.term)}</span>
              <span class="d">${esc(w.def)}</span>
              <button class="x-btn" data-id="${esc(w.id)}" title="Delete">&times;</button>
            </div>`).join('')}
        </div>
        <div class="controls left">
          <button class="btn btn-quiet" id="w-samples">Restore sample words</button>
        </div>
      </div>`;
    this.notice = '';
    updateDeckChip();
    this.wireDeckBar();
    this.wireWords();
  },

  wireDeckBar() {
    const q = sel => this.container.querySelector(sel);

    if (this.renaming) {
      const input = q('#deck-name');
      const save = () => {
        Store.renameDeck(Store.activeId, input.value);
        this.renaming = false;
        this.render();
      };
      q('#deck-save').onclick = save;
      q('#deck-cancel').onclick = () => { this.renaming = false; this.render(); };
      input.addEventListener('keydown', e => { if (e.key === 'Enter') save(); });
      input.focus();
    } else {
      q('#deck-select').onchange = e => {
        this.switchTo(e.target.value);
        this.render();
      };
      q('#deck-rename').onclick = () => { this.renaming = true; this.render(); };

      const del = q('#deck-delete');
      del.onclick = () => {
        if (this.deleteArmed) {
          clearTimeout(this._armTimer);
          const name = Store.activeDeck().name;
          Store.removeDeck(Store.activeId).forEach(id => Stats.deleteWord(id));
          resetSessions();
          this.deleteArmed = false;
          this.notice = `Deleted “${name}”.`;
          this.render();
        } else {
          this.deleteArmed = true;
          del.classList.add('btn-wrong');
          del.textContent = 'Click again to delete';
          this._armTimer = setTimeout(() => {
            this.deleteArmed = false;
            del.classList.remove('btn-wrong');
            del.textContent = 'Delete set';
          }, 3000);
        }
      };
    }

    const nameIn = q('#deck-new-name');
    const create = () => {
      const name = nameIn.value.trim();
      if (!name) return;
      Store.addDeck(name);
      resetSessions();
      this.notice = `Created “${name}”. It is now the set you are studying.`;
      this.render();
    };
    q('#deck-new').onclick = create;
    nameIn.addEventListener('keydown', e => { if (e.key === 'Enter') create(); });
  },

  wireWords() {
    const q = sel => this.container.querySelector(sel);
    const termIn = q('#w-term');
    const defIn = q('#w-def');
    const add = () => {
      const term = termIn.value.trim(), def = defIn.value.trim();
      if (!term || !def) return;
      Store.addWord(term, def);
      this.notice = `Added “${term}”.`;
      this.render();
      this.container.querySelector('#w-term').focus();
    };
    q('#w-add').onclick = add;
    defIn.addEventListener('keydown', e => { if (e.key === 'Enter') add(); });

    q('#w-import-btn').onclick = () => {
      const text = q('#w-import').value;
      const newName = q('#w-import-name').value.trim();
      let deckId = Store.activeId;
      if (newName) {
        deckId = Store.addDeck(newName).id;
        resetSessions();
      }
      const res = Store.importText(text, deckId);
      if (newName && !res.added) Store.removeDeck(deckId);
      const where = newName && res.added ? ` into “${newName}”` : '';
      this.notice = `Imported ${res.added} word${res.added === 1 ? '' : 's'}${where}` +
        (res.skipped ? ` (${res.skipped} line${res.skipped === 1 ? '' : 's'} skipped)` : '') + '.';
      this.render();
    };

    this.container.querySelectorAll('[data-set]').forEach(b => {
      b.onclick = () => {
        const set = Store.getSet(b.dataset.set);
        const res = Store.addSet(b.dataset.set);
        resetSessions();
        this.notice = !res.existed
          ? `Added “${set.name}” as its own set with ${res.added} words.`
          : res.added
            ? `Filled in ${res.added} missing word${res.added === 1 ? '' : 's'} in “${set.name}”.`
            : `“${set.name}” is already a set — switched to it.`;
        this.render();
      };
    });

    this.container.querySelectorAll('.x-btn').forEach(b => {
      b.onclick = () => {
        Store.removeWord(b.dataset.id);
        Stats.deleteWord(b.dataset.id);
        this.render();
      };
    });

    q('#w-samples').onclick = () => {
      const res = Store.restoreSamples();
      resetSessions();
      this.notice = res.added
        ? `Restored ${res.added} sample words into “${res.deck.name}”.`
        : `“${res.deck.name}” already has every sample word — switched to it.`;
      this.render();
    };
  },
};
