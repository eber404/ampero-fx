# Hotone GitHub Automation Design

## Goal

Run the existing Hotone manual synchronizer on GitHub Actions at no additional
cost, merge verified catalog updates automatically, and publish the resulting
Vite application on GitHub Pages. Every published revision must remain
identifiable and manually deployable for rollback.

## Context and Constraints

- Repository: `eber404/ampero-fx`.
- Default branch: `master`.
- The repository is public, so GitHub Actions and Pages fit the free usage
  model.
- The existing sync command is `npm run sync:hotone`.
- Generated runtime data is stored in `public/data/`.
- The project Pages URL is expected to be
  `https://eber404.github.io/ampero-fx/`.
- The current working tree contains the catalog implementation and sync files
  that are not yet on the remote default branch.

## Architecture

### Synchronization workflow

`.github/workflows/sync-hotone-manuals.yml` will run on a daily schedule and
through `workflow_dispatch`.

The workflow will:

1. Check out `master`.
2. Install Node.js 24, npm dependencies, Python 3.11, and `requirements.txt`.
3. Run `npm run sync:hotone`.
4. Run `npm test` and `npm run build` against the generated data.
5. Create or update one PR using `peter-evans/create-pull-request`.
6. Auto-merge that PR with squash after the pre-merge validation succeeds.

The workflow will use explicit `contents: write` and `pull-requests: write`
permissions. It will keep the generated JSON changes in the PR so the PR
itself is the audit trail for each catalog update. If the Hotone manifest has
not changed, the sync command will make no PR.

Because actions performed with the default `GITHUB_TOKEN` do not reliably
trigger a new push workflow, the Pages workflow will also listen for the
completion of this trusted synchronization workflow.

### Validation workflow

`.github/workflows/ci.yml` will run tests and a production build for pull
requests targeting `master`. The synchronization workflow will run the same
checks itself before auto-merging because a PR created by `GITHUB_TOKEN` may
not receive a separate `pull_request` event.

### Pages deployment workflow

`.github/workflows/deploy-pages.yml` will deploy the application using the
official Pages artifact actions. It will run for:

- pushes to `master`;
- successful completion of the synchronization workflow on `master`;
- manual dispatch with a selectable branch or tag ref for rollback.

The deployment will:

1. Check out the selected revision.
2. Install dependencies.
3. Run `npm run build`.
4. Upload `build/` as the Pages artifact.
5. Deploy it with `actions/deploy-pages`.
6. Create an immutable tag named `pages-<workflow-run-number>` pointing to
   the deployed commit.

The deployment job will declare `pages: write`, `id-token: write`, and
`contents: write` permissions. A Pages concurrency group will prevent two
deployments from racing while retaining the newest requested deployment.

## GitHub Pages Compatibility

Vite will use `/ampero-fx/` as its production base path. Catalog loading will
resolve `data/hotone-effects.json` relative to `import.meta.env.BASE_URL`
instead of assuming the domain root. Local development will continue to work
with the same base configuration.

Pages must be enabled once in repository settings with **Source: GitHub
Actions**. No external hosting, paid service, or repository secret is
required.

## Rollback

Each deployment tag identifies the exact source revision used to generate the
Pages artifact. To roll back, the deploy workflow can be manually dispatched
with a previous `pages-*` tag. To make the rollback permanent in the source,
the corresponding catalog commit can also be reverted on `master`, which will
produce a new normal deployment and preserve the complete history.

## Failure Handling

- A failed API request, PDF download, extraction, test, or build stops the
  synchronization workflow before any PR merge.
- A failed Pages build or deployment leaves the previous Pages deployment in
  place.
- Download retries remain handled by the existing sync implementation.
- Workflow concurrency prevents overlapping sync jobs from updating the same
  PR simultaneously.
- The generated manifest remains the change detector and is written only after
  the complete catalog is successfully generated.

## Verification

Local verification will run:

```bash
npm test
npm run build
```

The first real synchronization may additionally require network access and
the Python dependency installation:

```bash
python3 -m pip install -r requirements.txt
npm run sync:hotone
```

The initial deployment will be verified from the Pages URL and by confirming
that the published application loads its catalog JSON under `/ampero-fx/`.
