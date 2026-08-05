# AGENTS.md

## Repository Overview

This repository is a Vite + React app that presents a searchable catalog of Hotone Ampero-family effects.

The main job of the codebase is to ingest official Hotone manuals and effect lists, normalize them into a unified dataset, and expose that dataset in the UI with pedalboard coverage metadata.

## Core Concepts

- `public/data/hotone-effects.json` is the runtime source of truth for the app.
- `public/data/hotone-manual-manifest.json` tracks the latest manual/effect-list sources used to generate the catalog.
- `src/lib/manual/*` contains reusable PDF parsing, categorization, and search logic.
- `src/lib/hotone/*` contains Hotone-specific API discovery, sync, merge, and load helpers.

## Working Rules

- Prefer the smallest correct change.
- Keep parsing and UI concerns separate.
- Preserve generated JSON schemas unless a change is required by the sync pipeline.
- Avoid broad refactors when a local fix is enough.

## Verification

Use these commands to verify changes:

```bash
npm test
npm run build
npm run test:e2e
```

For sync/data changes, also run:

```bash
npm run sync:hotone
```

## Environment Notes

- Use Node.js 24 via the repo's `.nvmrc`.
- Python dependencies from `requirements.txt` are required for PDF extraction.
- The sync job downloads official Hotone PDFs and can be network-sensitive.

## Practical Guidance

- When adjusting catalog behavior, update tests for the parser, merge logic, and UI search if the data shape changes.
- When changing generated data, make sure the sync pipeline still produces stable `hotone-effects.json` output.
- If you add a new source format, keep the extraction code focused and add a direct test for that PDF shape.
