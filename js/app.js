// App shell: tab switching and keyboard delegation.

const Views = {
  flashcards: Flashcards,
  matching: Matching,
  learn: Learn,
  conjugate: Conjugate,
  progress: Progress,
  words: WordsView,
};

let active = null;

// Called when the active set changes: any half-finished session belongs to
// the old set, so drop it. Conjugate has no reset — it runs off its own verb
// sets, so switching vocabulary decks leaves it alone.
function resetSessions() {
  Object.values(Views).forEach(v => { if (v.reset) v.reset(); });
}

function updateDeckChip() {
  const chip = document.getElementById('deck-chip');
  const deck = Store.activeDeck();
  if (chip) chip.textContent = deck ? deck.name : '';
}

function showView(name) {
  if (active && active.exit) active.exit();
  active = Views[name];
  document.querySelectorAll('.tab').forEach(t =>
    t.classList.toggle('active', t.dataset.view === name));
  updateDeckChip();
  const main = document.getElementById('view');
  main.innerHTML = '';
  active.enter(main);
}

document.addEventListener('DOMContentLoaded', () => {
  Store.load();
  Stats.load();
  VerbStore.load();
  ConjStats.load();
  document.querySelectorAll('.tab').forEach(t =>
    t.addEventListener('click', () => showView(t.dataset.view)));
  document.addEventListener('keydown', e => {
    if (e.target && /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(e.target.tagName)) return;
    if (active && active.onKey) active.onKey(e);
  });
  showView('flashcards');
});
