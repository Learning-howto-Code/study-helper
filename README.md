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
- **Progress** — most-missed words across all modes, with accuracy and the mode each word is toughest in.
- **Words** — add, delete, or bulk-import words (`term - definition` per line, or tab-separated).

All words and stats are saved in the browser's localStorage. Comes preloaded with 20 sample vocab words.
