# Ampero FX Catalog

Searchable catalog of Hotone Ampero effects, built with Vite and React.

Live site: https://eber404.github.io/ampero-fx/

The site lists every effect found in the official Hotone manuals and effect lists, and shows which pedalboards support each one. The data comes from published PDFs, not from hand-written lists.

## How the data gets here

1. A scheduled job looks up the current manuals and effect lists on Hotone's support pages.
2. It downloads the PDFs for each Ampero-family product and extracts the effect tables.
3. Effects are categorized, then merged across products so one row can list several pedalboards.
4. The result is written to `public/data/hotone-effects.json`, with sources recorded in `public/data/hotone-manual-manifest.json`.
5. The browser reads that JSON at runtime. Nothing is fetched from Hotone at page load.

The job runs daily at 07:00 UTC. When the output changes it opens a pull request on `hotone/manual-sync` instead of pushing to `master` directly. Merging that PR triggers a Pages deploy.

## Layout

| Path | What lives there |
| --- | --- |
| `src/App.tsx` | Catalog UI and search |
| `src/lib/manual/` | PDF extraction, parsing, categorization, filtering |
| `src/lib/hotone/` | API discovery, sync, merge, catalog loading |
| `scripts/sync-hotone-manuals.ts` | Sync entry point |
| `scripts/extract-manual.ts` | Single-manual extraction for debugging |
| `public/data/` | Generated JSON consumed by the app |

## Running it

Requires Node.js 24 and Python 3.11 with `requirements.txt` installed for PDF parsing.

```bash
npm install
npm run dev          # local dev server
npm test             # unit tests
npm run build        # production build into build/
npm run test:e2e     # Playwright tests
npm run sync:hotone  # refresh public/data from Hotone
```

`npm run sync:hotone` hits Hotone's servers and can be slow. It needs network access and Python.

## Deployment

`.github/workflows/deploy-pages.yml` builds the app and publishes `build/` to GitHub Pages on every push to `master`, after a successful manual sync, or on demand through `workflow_dispatch` (optionally from a `pages-*` tag). Each deploy is tagged `pages-<run number>`.

Vite sets `base` to `/ampero-fx/` when running in GitHub Actions, so asset URLs resolve under the project path. Local builds use `/`.

## Adding a product or manual format

Manual shapes differ between products. If a new PDF doesn't parse, add a fixture and a test in `src/lib/manual/` next to the existing ones before touching the parser. Changing the JSON shape means updating the merge and load tests as well.
