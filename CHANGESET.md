# Revision summary

## Main shift

This revision keeps the split interface and adds a tighter purpose boundary for the participant-facing tool.

## New elements

- `lib/purpose.js`
- participant voice controls in `public/index.html` and `public/app.js`
- optional context-note flow from the participant UI to the prompt

## Main changes

1. The participant view now has optional browser voice input and spoken replies.
2. The participant view now accepts an optional user-provided context note.
3. The backend now routes brief openings and unrelated task requests before generation.
4. Task requests wrapped in emotional language are still redirected rather than completed.
5. The research console now exposes the purpose route in diagnostics and supports context-note testing.
6. The deterministic artifact audit now checks purpose-routing behavior as well as boundary handling.
