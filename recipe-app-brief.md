# Recipe Finder Web App — Build Brief

## Purpose

A two-person household tool. One partner does grocery shopping and reacts to
in-store discounts; she needs to know which recipes use a given ingredient
(or combination of ingredients) before deciding whether a discount is worth
buying. No accounts, no backend, no state tracking — this is a read-only
lookup tool over a fixed set of recipes.

Explicitly out of scope, do not build: pantry/inventory tracking, ingredient
"owned/needed" status, cooking instructions, user accounts or auth.

## Tech constraints

- Static site only: plain HTML/CSS/JS (or a framework that compiles to
  static output, if preferred) — no server, no database, no build-time
  secrets. Must be deployable as-is to GitHub Pages.
- No backend calls at runtime. All data comes from a local `recipes.json`
  file loaded client-side.
- Must work well in desktop browsers and in Safari on iOS, including when
  added to the iOS home screen (i.e. behaves like a standalone app: no
  reliance on browser chrome, correct viewport handling).

## Data model

Single file: `recipes.json`, an array of recipe objects:

```json
[
  {
    "id": "chicken-curry",
    "name": "Chicken Curry",
    "ingredients": ["chicken thighs", "onion", "garlic", "coconut milk", "curry powder"]
  }
]
```

- `id`: lowercase, hyphenated slug. Stable identifier. Also used, by
  convention, as the recipe's photo filename — see Photos below. No
  separate `photo` field; the path is always derived as `photos/<id>.jpg`.
- `name`: free-text display name.
- `ingredients`: array of ingredient strings, exactly as they should appear
  to the user. No instructions field — intentionally omitted.

Scale assumptions: at most ~50 distinct ingredients across all recipes, at
most ~10 recipes total, typically 5–15 ingredients per recipe.

### Deriving the ingredient list

The flat, deduplicated ingredient list used for selection is **not** stored
separately — it must be computed at load time by collecting every string
across all recipes' `ingredients` arrays and deduplicating. This keeps it
permanently in sync with the recipe data; there is no manual list to
maintain.

Do this dedup once when `recipes.json` loads, not on every keystroke.
Search/filter interactions should filter the already-computed flat list,
not re-derive it.

No ingredient categorization or grouping — flat alphabetical list only.

## Layout: two breakpoints, one codebase

Responsive layout with a breakpoint between a "desktop" (wide) and "mobile"
(narrow) presentation. Not two separate apps — one CSS/layout system that
adapts.

### Desktop (wide viewport)

Two-column split-screen:

- **Left column**: ingredient search + selection (see "Ingredient selection"
  below).
- **Right column**: matching recipe results as cards — square photo, recipe
  name, and ingredient count (e.g. "5 ingredients"). Updates live as
  selections change. With no ingredients selected, shows **all** recipes
  (browse mode) rather than an empty state — desktop users can browse the
  full recipe set without selecting anything. Clicking a card opens the
  recipe detail modal (see "Recipe detail modal").

### Mobile (narrow viewport, e.g. iPhone widths)

Stacked, flexible-height sections, not two independent scrolling columns:

- **Top**: search input, pinned to the very top of the section (see
  "Keyboard handling" below for why this matters).
- **Below the input**: filtered ingredient list, scrollable within the
  remaining space.
- **Bottom**: results section, pinned to the bottom, showing matching
  recipes as **one-line chips** (name only, no photo). Empty until at
  least one ingredient is selected — unlike desktop, there is no browse-all
  mode on mobile. This section has flexible height that grows upward as
  match count increases (typically 0–3 chips, max ~10) — it should never
  dominate the screen given the low expected match counts. Tapping a chip
  opens the recipe detail modal.

## Ingredient selection

- **Multi-select**: tapping/clicking an ingredient selects it; selected
  ingredients are visually distinguished (e.g. highlighted state in the
  list). Tapping again deselects.
- **Matching logic**: AND across all selected ingredients — a recipe matches
  only if it contains *every* currently selected ingredient.
- **Search**: a text input at the top of the ingredient section. Live
  filter on every keystroke (no debounce needed at this data scale) —
  filters the ingredient list to items whose text **contains** the search
  string (not just starts-with), case-insensitive.
- **Clearing search text**: rely on native OS/browser input clear behavior
  (e.g. the OS keyboard's clear affordance). Do not build a custom clear
  control for the text itself.
- **Clearing selections**: a separate, explicit "clear selected" control —
  an icon-only button positioned to the right of the search input. This
  clears the selected-ingredients set only; it must never affect the
  search text. This is a two-person internal tool, so the icon does not
  need an accompanying text label.
- Selecting/deselecting ingredients must never reset or interfere with the
  current search text, and vice versa — these two pieces of state are
  independent.

## Keyboard handling (mobile-specific)

When the search input is focused on iOS Safari, the on-screen keyboard
covers roughly half the viewport. The layout must account for this
explicitly:

- The search input must remain visible above the keyboard at all times —
  it is pinned to the top of the section, so this should hold naturally.
- The filtered ingredient list, rendered directly below the input, must be
  sized against the **actual visible viewport** (i.e. accounting for the
  keyboard), not a fixed height or plain `100vh`, which does not shrink
  for the keyboard on iOS Safari. Use `window.visualViewport` (or
  equivalent) to size this list dynamically so filtered items remain
  visible and tappable between the input and the keyboard, without
  requiring the keyboard to be dismissed first.
- Tapping a filtered ingredient list item selects it immediately via a
  normal tap/click handler. No special handling is needed to make
  selection work while the input still has focus — a plain tap on a list
  item is expected to also blur the input and dismiss the keyboard
  naturally. **This dismiss-on-tap behavior is intentional and desired —
  do not add custom focus-retention logic (e.g. preventing blur on
  mousedown/touchstart) to keep the keyboard open across multiple
  selections.** After each selection, the keyboard dismissing and the
  layout reflowing (results chips reappearing, ingredient list resizing
  back to its non-keyboard height) is the intended behavior, and also
  serves as visible confirmation that the tap registered. If the user
  wants to select another ingredient, tapping the search field again to
  reopen the keyboard is expected and fine.
- The bottom results/chips section may be pushed out of view or need to
  collapse while the keyboard is open, since input + filtered list +
  results + keyboard may not all fit simultaneously. Exact behavior here
  should be verified on an actual iOS device once built and adjusted as
  needed — this is expected to need on-device iteration, not something
  fully solvable from layout code alone.

## Recipe detail modal

- Triggered by: clicking a recipe card (desktop) or tapping a recipe chip
  (mobile). Same modal component on both breakpoints, just two entry
  points.
- Contents: square recipe photo and the full ingredient list for that
  recipe.
- Must be a **modal overlay**, not a page navigation / route change. The
  underlying screen (search text, selected ingredients, scroll position,
  current results) must remain completely intact and immediately visible
  when the modal is closed — this is a hard requirement, not a nice-to-
  have. Do not implement this as a separate page/route even with state
  preservation logic; use an in-place overlay so there is nothing to
  preserve or restore.
- Standard close affordances: close button (X), tap/click outside the
  modal, and on mobile ideally a swipe-down-to-close gesture if
  straightforward to implement.

## Photos

- Format: square JPEGs, 1000×1000px, roughly 80–85% quality (expect
  ~100–300KB per file).
- Filename convention: `photos/<recipe-id>.jpg` — always derived from the
  recipe's `id`, never a separately stored field.
- **Build-phase placeholders**: during initial development, before real
  photos are supplied, use distinct placeholder images per recipe (e.g.
  different flat colors or a visible "PLACEHOLDER" label baked into each
  image) rather than one single shared dummy image — this makes it
  possible to visually verify each card/modal is pulling the correct
  photo for its recipe rather than all accidentally rendering the same
  file. Real photos will be dropped into `photos/` afterward, named to
  match each recipe's `id`, with no code changes required.

## Hosting / deployment

- Target: GitHub Pages, serving static files directly from a repo branch.
- No build step required if written in plain HTML/CSS/JS. If a framework
  requiring a build step is used, ensure the build output is what gets
  deployed (e.g. via a `/docs` folder or a dedicated deploy branch) and
  document the build command clearly.
- Repo structure should be straightforward: source files at the root (or
  in `/docs`), a `photos/` folder, and `recipes.json` — all easily hand-
  editable directly in the repo without any admin UI, since recipes will
  be added/edited by directly editing the JSON file.

## Build sequencing preference

Build and verify the layout and interaction logic first using placeholder
photos and a small set of sample recipes (enough to test multi-select, AND
matching, search filtering, and the modal) before real recipe data and
photos are finalized. Real content is a drop-in replacement at the end,
not a dependency for getting the app working end to end.
