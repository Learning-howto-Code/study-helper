// Small shared helpers.

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sample(arr, n) {
  return shuffle(arr).slice(0, n);
}

// Drops accents and the tilde so typed answers do not hinge on them:
// "senor" passes for "señor", "practico" for "practicó".
function foldAccents(s) {
  return String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .normalize('NFC');
}

// Comparison key for a typed answer: case, spacing and accents ignored.
function normAnswer(s) {
  return foldAccents(String(s)).trim().toLowerCase().replace(/\s+/g, ' ');
}
