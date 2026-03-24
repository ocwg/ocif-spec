---
name: prepare-new-version
description: Prepare a new draft version of the OCIF spec. Copies the current released version to a draft directory, opens a PR, and after merge creates the long-running draft branch for iteration.
disable-model-invocation: true
argument-hint: [version e.g. v0.8.0]
---

# Prepare New OCIF Version

Prepare a new draft version **$ARGUMENTS** of the OCIF specification.

Work through each phase **in order**. Confirm with the user before proceeding to the next phase.

## Phase 1: Pre-flight Checks

1. Confirm the version argument was provided (e.g. `v0.8.0`). If not, ask.
2. Verify the current branch is `main` and it's clean (no uncommitted changes).
3. Determine the **current released version** by reading `./VERSION`.
4. Verify the draft directory does NOT already exist at `spec/$ARGUMENTS-draft/`. If it does, stop and ask.
5. Summarize what you found and confirm with the user before proceeding.

## Phase 2: Create Draft Directory and Open PR

1. Create a branch for this work:
   ```
   git checkout -b prepare-$ARGUMENTS-draft
   ```
2. Copy the current released version directory to the new draft:
   ```
   cp -r spec/<current-version> spec/$ARGUMENTS-draft
   ```
3. Update version references inside `spec/$ARGUMENTS-draft/` — replace the old version string with `$ARGUMENTS` in:
   - `spec.md` (the OCIF URI, title, known versions list, etc.)
   - `schema.json`
   - `how-to-spec.md`
   - Any other files in the directory that reference the old version
4. Run the pre-commit linter on changed files:
   ```
   python3 .github/workflows/file_format.py spec/$ARGUMENTS-draft/spec.md
   ```
5. Stage and commit:
   ```
   Init $ARGUMENTS-draft with <current-version> content
   ```
6. Push the branch and open a PR against `main`:
   - Title: `Init $ARGUMENTS-draft`
   - Body should note which version was copied from
7. Tell the user to review and merge the PR. **Do not merge automatically.**

## Phase 3: Create Draft Branch

**Only proceed once the user confirms the PR has been merged.**

1. Switch to main and pull:
   ```
   git checkout main && git pull origin main
   ```
2. Create and push the long-running draft branch:
   ```
   git branch $ARGUMENTS-draft
   git push -u origin $ARGUMENTS-draft
   ```

## Phase 4: Next Steps

Tell the user:

- The draft directory `spec/$ARGUMENTS-draft/` now exists on both `main` and the `$ARGUMENTS-draft` branch.
- To iterate on the new version, create PRs against the `$ARGUMENTS-draft` branch. Each PR will show a small, focused diff.
- When the draft is ready to release, run `/release $ARGUMENTS` to create the release PR against `main`.
