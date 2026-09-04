# Study Helper

A small vocab memorization app. No build step, no dependencies — plain HTML/CSS/JS.

## Run it

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Modes

- **Flashcards** — flip a card, rate yourself "Got it" / "Missed it". Keyboard: space flips, ← missed, → got it. Finish a deck to review just the missed cards.
- **Matching** — click a term and its definition to clear the board (6 pairs at a time), against a timer. A mismatch counts as a miss for both words.
- **Learn** — Quizlet-style: introduces 3 words at a time, then drills each with multiple choice followed by typing. Missed words are re-queued within the batch, and your most-missed words lead the next session.
- **Conjugate** — Spanish verb practice, on its own verb sets (regular, stem-changing, irregular yo, the big irregulars, reflexive, plus verbs you add). Pick a tense and either drill one form at a time or fill in a whole conjugation table. Answers accept a leading subject pronoun, and an accent-only slip counts as right with the accented form shown. Verbs you miss come up more often.
- **Progress** — most-missed words across all modes, with accuracy and the mode each word is toughest in, plus the verb forms Conjugate keeps catching you on.
- **Words** — add, delete, or bulk-import words (`term - definition` per line, or tab-separated).

All words and stats are saved in the browser's localStorage. Comes preloaded with 20 sample vocab words.

## Adding a tense

Tenses live in `TENSES` in `js/conjugation.js`. Present, imperfect and future ship;
adding another is one entry:

- `base` — `'stem'` for endings on the stem, `'infinitive'` for future-style tenses.
- `endings` — per verb type (`ar`/`er`/`ir`), or a single `all` list.
- `stemChange` — `null`, or `{ forms: [...pronoun ids] }`, optionally narrowed with
  `only: 'ir'` for tenses where only `-ir` verbs change.

Verbs that break the pattern carry it themselves: `forms: { <tense>: [...six forms] }`
or `forms: { <tense>: { yo: '...' } }` for a single person, and `stems: { <tense>: '...' }`
for an irregular base. Reflexive pronouns are never written into `forms` — the engine
prefixes them.
