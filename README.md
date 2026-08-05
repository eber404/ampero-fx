# Ampero FX Catalog

Hotone/Ampero effect catalog built as a Vite + React single-page app.

It aggregates effect definitions from official Hotone manuals and effect lists, normalizes them into a unified JSON catalog, and renders a searchable browser UI with supported pedalboard tags.

## What it includes

- `src/App.tsx`: catalog UI and search experience
- `src/lib/hotone/*`: Hotone API discovery, manual sync, merge, and catalog loading
- `src/lib/manual/*`: PDF extraction, parsing, categorization, and filtering helpers
- `scripts/sync-hotone-manuals.ts`: baseline refresh job for `public/data/`
- `.github/workflows/sync-hotone-manuals.yml`: scheduled GitHub Actions refresh

## Data flow

1. Discover official Hotone support manuals and effect lists.
2. Download the latest PDFs for each supported Ampero-family product.
3. Extract effect rows from the PDFs and categorize them.
4. Merge duplicate effects across pedalboards.
5. Publish `public/data/hotone-effects.json` and `public/data/hotone-manual-manifest.json`.
6. Load the generated catalog in the browser.

## Development

Requirements:

- Node.js 24+
- Python 3.11+ with `requirements.txt` installed for PDF parsing

Common commands:

```bash
npm install
npm run dev
npm test
npm run build
npm run test:e2e
npm run sync:hotone
```

## Notes

- The app reads from `public/data/hotone-effects.json` at runtime.
- The sync pipeline depends on official Hotone-hosted PDFs and may take a while to refresh.
- Keep generated data and parsing rules in sync when adding support for new manual formats.
