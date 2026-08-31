// Words view: manage the vocab list.

const WordsView = {
  container: null,
  notice: '',

  enter(container) {
    this.container = container;
    this.render();
  },

  render() {
    const words = Store.words;
    this.container.innerHTML = `
      <div class="pane">
        <h2>Words <span class="count">${words.length}</span></h2>
        <div class="add-row">
          <input class="text-input" id="w-term" placeholder="term" autocomplete="off">
          <input class="text-input grow" id="w-def" placeholder="definition" autocomplete="off">
          <button class="btn btn-primary" id="w-add">Add</button>
        </div>
        <details class="import">
          <summary>Import a list</summary>
          <p class="lead">One word per line: <code>term - definition</code> (or tab-separated).</p>
          <textarea id="w-import" placeholder="ephemeral - lasting a very short time"></textarea>
          <div class="controls left"><button class="btn" id="w-import-btn">Import</button></div>
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

    const termIn = this.container.querySelector('#w-term');
    const defIn = this.container.querySelector('#w-def');
    const add = () => {
      const term = termIn.value.trim(), def = defIn.value.trim();
      if (!term || !def) return;
      Store.addWord(term, def);
      this.notice = `Added “${term}”.`;
      this.render();
      this.container.querySelector('#w-term').focus();
    };
    this.container.querySelector('#w-add').onclick = add;
    defIn.addEventListener('keydown', e => {
      if (e.key === 'Enter') add();
    });

    this.container.querySelector('#w-import-btn').onclick = () => {
      const res = Store.importText(this.container.querySelector('#w-import').value);
      this.notice = `Imported ${res.added} word${res.added === 1 ? '' : 's'}` +
        (res.skipped ? ` (${res.skipped} line${res.skipped === 1 ? '' : 's'} skipped)` : '') + '.';
      this.render();
    };

    this.container.querySelectorAll('.x-btn').forEach(b => {
      b.onclick = () => {
        Store.removeWord(b.dataset.id);
        Stats.deleteWord(b.dataset.id);
        this.render();
      };
    });

    this.container.querySelector('#w-samples').onclick = () => {
      const n = Store.restoreSamples();
      this.notice = n ? `Restored ${n} sample words.` : 'Sample words already in the list.';
      this.render();
    };
  },
};
