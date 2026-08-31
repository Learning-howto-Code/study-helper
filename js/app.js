// App shell: tab switching and keyboard delegation.

const Views = {
  flashcards: Flashcards,
  matching: Matching,
  learn: Learn,
  progress: Progress,
  words: WordsView,
};

let active = null;

function showView(name) {
  if (active && active.exit) active.exit();
  active = Views[name];
  document.querySelectorAll('.tab').forEach(t =>
    t.classList.toggle('active', t.dataset.view === name));
  const main = document.getElementById('view');
  main.innerHTML = '';
  active.enter(main);
}

document.addEventListener('DOMContentLoaded', () => {
  Store.load();
  Stats.load();
  document.querySelectorAll('.tab').forEach(t =>
    t.addEventListener('click', () => showView(t.dataset.view)));
  document.addEventListener('keydown', e => {
    if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (active && active.onKey) active.onKey(e);
  });
  showView('flashcards');
});
