# Hotone GitHub Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with verification checkpoints.

**Goal:** Run real Hotone catalog refreshes through free GitHub Actions, auto-merge validated update PRs, and publish every `master` revision to GitHub Pages with rollback tags.

**Architecture:** Keep synchronization, validation, and deployment in separate workflows. The sync workflow downloads and validates generated data before creating and auto-merging one squash PR; the Pages workflow deploys pushes and successful sync workflow completions, and supports manual deployment of a prior tag. Vite will use the repository project base path and resolve catalog data relative to that base.

**Tech Stack:** GitHub Actions, Node.js 24, Python 3.11, npm, Vite, React, Vitest, `actions/upload-pages-artifact`, `actions/deploy-pages`, and `peter-evans/create-pull-request`.

---

## File Map

- Modify `vite.config.ts`: use `/ampero-fx/` only in GitHub Actions production builds.
- Modify `src/lib/hotone/load.ts`: resolve the generated JSON below Vite's base URL.
- Modify `src/lib/hotone/load.test.ts`: assert the loader requests the catalog endpoint.
- Replace `.github/workflows/sync-hotone-manuals.yml`: install supported runtimes, validate generated data, create the update PR, and auto-merge it.
- Create `.github/workflows/ci.yml`: validate normal pull requests targeting `master`.
- Create `.github/workflows/deploy-pages.yml`: build and deploy Pages, including manual ref selection and deployment tags.
- Keep `docs/superpowers/specs/2026-09-12-hotone-github-automation-design.md` and this plan as implementation documentation.

## Task 1: Make the Vite Build Work Under Project Pages

**Files:**
- Modify `vite.config.ts:4-18`.
- Modify `src/lib/hotone/load.ts:25-27`.
- Test `src/lib/hotone/load.test.ts:4-24`.

- [ ] **Step 1: Add a failing URL assertion to the loader test.**

 Capture the URL passed to the injected fetch implementation and assert that it
 uses a project Pages base URL. The test remains independent of the network:

```ts
import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => vi.unstubAllEnvs());

it('loads unified catalog items with pedalboards', async () => {
  vi.stubEnv('BASE_URL', '/ampero-fx/');
  let requestedUrl = '';
  const fetchImpl = async (input: RequestInfo | URL) => {
    requestedUrl = String(input);
    return Response.json([
      {
        title: 'Black Tail',
        description: 'Based on legendary ProCo™ The Rat* distortion (early LM308 OP- amp version)',
        category: 'drives',
        subtype: 'distortion',
        pedalboards: ['Ampero Mini', 'Ampero II Stomp'],
      },
    ]);
  };

  await expect(loadHotoneEffects(fetchImpl)).resolves.toHaveLength(1);
  expect(requestedUrl).toBe('/ampero-fx/data/hotone-effects.json');
});
```

- [ ] **Step 2: Run the focused loader test.**

Run: `npm test -- src/lib/hotone/load.test.ts`

Expected: FAIL because the existing implementation requests `/data/` without
the configured project base path.

- [ ] **Step 3: Configure Vite's production base path.**

Add this property to the object passed to `defineConfig` in `vite.config.ts`:

```ts
base: process.env.GITHUB_ACTIONS === 'true' ? '/ampero-fx/' : '/',
```

This keeps local development at `/` while GitHub Actions builds assets for the
project Pages URL.

- [ ] **Step 4: Resolve catalog data relative to the base path.**

Replace the root-relative fetch in `src/lib/hotone/load.ts` with:

```ts
const response = await fetchImpl(`${import.meta.env.BASE_URL}data/hotone-effects.json`);
```

`BASE_URL` ends in `/`, so the generated URL is `/ampero-fx/data/hotone-effects.json`
on Pages and `/data/hotone-effects.json` locally.

- [ ] **Step 5: Run focused tests and a production build.**

Run: `npm test -- src/lib/hotone/load.test.ts`

Expected: PASS.

Run: `npm run build`

Expected: Vite completes successfully and writes the site to `build/`.

## Task 2: Add PR Validation and Automatic Hotone Sync

**Files:**
- Create `.github/workflows/ci.yml`.
- Replace `.github/workflows/sync-hotone-manuals.yml`.

- [ ] **Step 1: Create the pull-request validation workflow.**

Create `.github/workflows/ci.yml` with this complete workflow:

```yaml
name: Validate

on:
  pull_request:
    branches: [master]
  workflow_dispatch:

permissions:
  contents: read

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: npm ci
      - run: python -m pip install -r requirements.txt
      - run: npm test
      - run: npm run build
```

- [ ] **Step 2: Replace the sync workflow runtime setup.**

Use `node-version: 24` instead of the missing `.nvmrc`, keep Python 3.11, and
add serialized concurrency:

```yaml
concurrency:
  group: hotone-sync
  cancel-in-progress: false
```

- [ ] **Step 3: Make synchronization validate generated output.**

The sync job must run these commands in order after dependency installation:

```yaml
- run: npm run sync:hotone
- run: npm test
- run: npm run build
```

Any API, PDF, extraction, test, or build failure must stop the job before a PR
can be merged.

- [ ] **Step 4: Create or update the single synchronization PR.**

Configure `peter-evans/create-pull-request@v7` with the default token, the
`hotone/manual-sync` branch, `master` as base, and the generated data in the
commit. Capture its `pull-request-number` output.

- [ ] **Step 5: Auto-merge the validated PR.**

Add a conditional shell step using the preflight-validated PR number:

```yaml
- name: Auto-merge catalog update
  if: steps.create-pr.outputs.pull-request-number != ''
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    PR_NUMBER: ${{ steps.create-pr.outputs.pull-request-number }}
  run: gh pr merge "$PR_NUMBER" --repo "${{ github.repository }}" --squash --delete-branch
```

The merge is performed only after `npm test` and `npm run build` succeed. The
resulting squash commit preserves each catalog update as a reviewable PR in
the repository history.

- [ ] **Step 6: Run local workflow syntax and application checks.**

Run: `npm test`

Expected: all Vitest tests pass.

Run: `npm run build`

Expected: the production bundle is created in `build/`.

## Task 3: Deploy and Version GitHub Pages

**Files:**
- Create `.github/workflows/deploy-pages.yml`.

- [ ] **Step 1: Create the Pages workflow triggers and permissions.**

Use this complete trigger and permission configuration:

```yaml
name: Deploy GitHub Pages

on:
  push:
    branches: [master]
  workflow_run:
    workflows: ['Sync Hotone manuals']
    types: [completed]
    branches: [master]
  workflow_dispatch:
    inputs:
      ref:
        description: Branch or pages-* tag to deploy
        required: false
        default: master
        type: string

permissions:
  contents: write
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false
```

- [ ] **Step 2: Gate workflow-run deployments on successful synchronization.**

Set the deploy job condition to allow pushes and manual dispatches, but only a
successful sync workflow completion:

```yaml
if: github.event_name != 'workflow_run' || github.event.workflow_run.conclusion == 'success'
```

- [ ] **Step 3: Check out the correct revision.**

Use a normal checkout for push/workflow-run events and a second conditional
checkout for manual rollback dispatches:

```yaml
- name: Check out current branch
  if: github.event_name != 'workflow_dispatch'
  uses: actions/checkout@v4
  with:
    ref: ${{ github.event_name == 'workflow_run' && 'master' || github.ref }}

- name: Check out requested revision
  if: github.event_name == 'workflow_dispatch'
  uses: actions/checkout@v4
  with:
    ref: ${{ inputs.ref }}
```

- [ ] **Step 4: Build and deploy the Pages artifact.**

After setup-node 24 and `npm ci`, use these steps:

```yaml
- run: npm run build
- uses: actions/configure-pages@v5
- uses: actions/upload-pages-artifact@v3
  with:
    path: build
- name: Deploy to GitHub Pages
  id: deployment
  uses: actions/deploy-pages@v4
```

Set the job environment to `github-pages` and its URL to
`${{ steps.deployment.outputs.page_url }}`.

- [ ] **Step 5: Tag each deployed commit.**

After the deploy action succeeds, add an annotated immutable deployment tag:

```yaml
- name: Tag deployed revision
  env:
    TAG_NAME: pages-${{ github.run_number }}
  run: |
    git tag -a "$TAG_NAME" -m "Deploy GitHub Pages $TAG_NAME" HEAD
    git push origin "$TAG_NAME"
```

The run number makes each tag unique, including reruns. A previous `pages-*`
tag can be supplied to `workflow_dispatch` to redeploy that exact revision.

## Task 4: Verify the Full Automation Contract

**Files:**
- Verify `.github/workflows/ci.yml`.
- Verify `.github/workflows/sync-hotone-manuals.yml`.
- Verify `.github/workflows/deploy-pages.yml`.
- Verify `vite.config.ts` and `src/lib/hotone/load.ts`.

- [ ] **Step 1: Run the complete local test suite.**

Run: `npm test`

Expected: Vitest exits with status 0.

- [ ] **Step 2: Run the complete production build.**

Run: `npm run build`

Expected: Vite exits with status 0 and `build/index.html` exists.

- [ ] **Step 3: Inspect the generated Pages paths.**

Run: `GITHUB_ACTIONS=true npm run build`

Expected: built asset references begin with `/ampero-fx/`, and the built
application requests `/ampero-fx/data/hotone-effects.json`.

- [ ] **Step 4: Validate the workflow files without network mutation.**

Parse each YAML file with Ruby's standard YAML parser if available, or inspect
the files and use GitHub's workflow editor after pushing. Confirm the workflow
names match exactly between `sync-hotone-manuals.yml` and the `workflow_run`
trigger.

- [ ] **Step 5: Install Pages source configuration once.**

In repository settings, set Pages source to **GitHub Actions**. Confirm the
`github-pages` environment is available to the deploy workflow.

- [ ] **Step 6: Push the completed repository state and observe Actions.**

Push the intended catalog implementation and workflow files to `master`. Confirm
the deploy workflow completes and exposes the site at:

`https://eber404.github.io/ampero-fx/`

- [ ] **Step 7: Exercise a real sync run.**

Dispatch `Sync Hotone manuals` manually. Confirm it either reports no manifest
change or creates `hotone/manual-sync`, passes tests/build, auto-merges the PR,
starts the Pages deployment through `workflow_run`, and creates a new
`pages-*` tag.

- [ ] **Step 8: Exercise rollback readiness.**

Dispatch `Deploy GitHub Pages` with the previous `pages-*` tag as `ref`. Confirm
the workflow builds and publishes that revision, then creates a new deployment
tag without mutating the previous tag.

## Self-Review Checklist

- Every design requirement has a corresponding workflow or source change.
- No `.nvmrc` dependency remains in Actions.
- The generated catalog is validated before automatic merge.
- The Pages workflow handles both ordinary pushes and `GITHUB_TOKEN`-created
  sync merges.
- Deployment tags identify the exact checked-out revision.
- Manual dispatch supports rollback without force-pushing tags.
- Local tests and builds do not require Hotone network access unless the sync
  command itself is explicitly run.
