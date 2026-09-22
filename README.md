# Recipe Lookup

A static, read-only recipe finder for deciding whether a grocery-store
discount is worth buying: pick one or more ingredients and see which recipes
use any of them. No accounts, no backend, no build step.

Full requirements and design rationale are in [`recipe-app-brief.md`](recipe-app-brief.md).

## Running locally

Plain HTML/CSS/JS — no dependencies, no build step.

```
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

## Adding or editing recipes

Edit `recipes.json` directly — it's an array of:

```json
{
  "id": "chicken-curry",
  "name": "Chicken Curry",
  "ingredients": ["chicken thighs", "onion", "garlic", "coconut milk", "curry powder"]
}
```

- `id`: lowercase, hyphenated, stable. Also determines the photo path — no
  separate `photo` field.
- `ingredients`: exactly as they should be displayed to the user. The
  selectable ingredient list is derived automatically from this file; there's
  nothing else to keep in sync.

## Adding photos

Drop a square JPEG at `photos/<recipe-id>.jpg` (roughly 1000×1000px,
~80–85% quality). The filename must match the recipe's `id` exactly. No code
changes needed.

The repo currently ships placeholder photos (a distinct flat color + label
per recipe) so each card/modal can be visually verified before real photos
are available.

## Deployment

Static files at the repo root are served directly via GitHub Pages from the
`main` branch — no build output to publish.
