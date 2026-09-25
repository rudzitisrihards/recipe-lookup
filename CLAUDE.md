# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, read-only recipe lookup tool for a two-person household: search/select
ingredients, see which recipes use all of them (AND matching), tap through to a
recipe's photo + ingredient list. No backend, no accounts, no state persistence.
Full requirements and rationale live in `recipe-app-brief.md` — read it before
making product decisions; it explicitly lists what's out of scope (pantry
tracking, cooking instructions, auth) and why several
implementation choices were made (e.g. `visualViewport` sizing, modal-as-overlay
not route).

## Commands

Plain HTML/CSS/JS, no build step, no package.json, no test suite.

Run locally:
```
python3 -m http.server 8000
```
then open `http://localhost:8000/`.

## Architecture

Three files at the repo root, no modules/bundler:

- `index.html` — static shell: ingredient panel, results panel (both card grid
  and chip list markup present at all times), modal markup.
- `styles.css` — one stylesheet, one breakpoint (768px) switches between the
  mobile stacked layout and desktop two-column layout. Both `.results-cards`
  (desktop) and `.results-chips` (mobile) are always rendered by JS; CSS
  `display` toggles which one is visible per breakpoint — there's no separate
  mobile/desktop render path in JS.
- `app.js` — single IIFE, no dependencies. Key points:
  - `recipes.json` is fetched once; `deriveFlatIngredients()` computes the
    deduplicated, sorted ingredient list a single time at load. Search
    filtering re-filters this cached array — it must never re-derive it from
    `recipes` on each keystroke.
  - Search text (`searchInput.value`) and selection (`selectedIngredients`
    Set) are deliberately independent state — neither handler touches the
    other's state.
  - `--app-vh` (set from `window.visualViewport`, not `100vh`) drives `.app`'s
    height so the mobile layout shrinks correctly when the iOS keyboard opens.
    This is load-bearing for the mobile keyboard behavior described in the
    brief; don't replace it with a plain viewport unit.
  - The recipe detail modal is a hide/show overlay (`hidden` attribute), never
    a route — closing it must never lose search text, selection, or scroll
    position in the panel underneath.

### Data model (`recipes.json`)

Array of `{ id, name, ingredients[] }`. `id` is a lowercase-hyphenated slug and
is also the source of truth for the photo path — always `photos/<id>.jpg`,
never a stored field. There is no `photo` field and no ingredients-list file;
both must be derivable from `recipes.json` alone. See `recipe-app-brief.md`
for the full schema and scale assumptions (~10 recipes, ~50 ingredients max).

### `recipes-source.md` ↔ `recipes.json`

`recipes-source.md` is the human-edited source of truth; the user adds and
edits recipes there by hand and asks Claude to implement them. The two files
must always describe the same recipes, in the same order, with identical names
and ingredient lists:

- When the user edits `recipes-source.md`, regenerate the affected entries in
  `recipes.json` (id derived from the heading per the rules at the top of
  that file).
- When any recipe change is requested directly (rename, add/remove
  ingredient, new recipe), apply it to **both** files in the same change.
- Renaming a recipe changes its id, so also `git mv` its photo to match.
- A new recipe has no photo yet; flag which `photos/<id>.jpg` files are
  missing so the user can add them.
- Keep ingredient wording consistent with existing ingredients (see the
  dedup note in `recipes-source.md`) and point out near-duplicates rather
  than silently merging them.

### Photos

`photos/<id>.jpg`, square, ~1000×1000. Current photos are temporary
stand-ins; the user will replace them manually with their own photos of each
dish — a content-only swap, no code changes required. Renaming a recipe's `id`
means renaming its photo file to match.

## Deployment

Target is GitHub Pages serving directly from the repo root on `main` — no
build output directory, no deploy branch.
