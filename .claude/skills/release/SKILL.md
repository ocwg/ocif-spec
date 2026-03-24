---
name: release
description: Release a new version of the OCIF spec. Creates a release PR that renames the draft directory, updates version pointers, and after merge handles tagging and announcements.
disable-model-invocation: true
argument-hint: [version e.g. v0.7.0]
---

# OCIF Spec Release

Release version **$ARGUMENTS** of the OCIF specification.

This skill creates a PR against `main` that renames the draft directory and updates all version pointers. That PR is the reviewable release diff — it shows exactly what changed between the previous version and this one. Merging the PR is the release.

Work through each phase **in order**. Confirm with the user before proceeding to the next phase. If something fails or looks wrong, stop and ask.

## Phase 1: Pre-flight Checks

1. Confirm the version argument was provided (e.g. `v0.7.0`). If not, ask.
2. Switch to the existing draft branch and pull latest:
   ```
   git checkout $ARGUMENTS-draft && git pull origin $ARGUMENTS-draft
   ```
   If the branch doesn't exist, stop and ask.
3. Verify the draft directory exists at `spec/$ARGUMENTS-draft/`.
4. Check for any `@@ ` issue markers in `spec/$ARGUMENTS-draft/spec.md` — these are unresolved TODOs that should be fixed before release. Report any found and ask whether to proceed.
5. Run the pre-commit linter: `python3 .github/workflows/file_format.py spec/$ARGUMENTS-draft/spec.md` and fix any issues.
6. Summarize what you found and confirm with the user before proceeding.

## Phase 2: Finalize the Spec Directory

1. Rename the draft directory: `git mv spec/$ARGUMENTS-draft spec/$ARGUMENTS`
2. Inside `spec/$ARGUMENTS/`, search for references to the old draft path (`$ARGUMENTS-draft`) and update them to `$ARGUMENTS`.
3. Inside `spec/$ARGUMENTS/spec.md`, verify the version URI is correct (e.g. `https://canvasprotocol.org/ocif/$ARGUMENTS`). Update if it still says "draft".

## Phase 3: Update Version Pointers

Determine the **previous released version** by reading `./VERSION`. Then:

1. **`./VERSION`**: Update to `$ARGUMENTS`.

2. **`public/_redirects`**: Update line 2 to point to the new version:
   ```
   / https://github.com/ocwg/spec/blob/main/spec/$ARGUMENTS/spec.md 302
   ```

3. **Global find-and-replace**: Outside the `/spec` directory, replace the previous version string with the new version in:
   - `cookbook.md`
   - `catalog.md`
   - `README.md`
   - `example/` files
   - Any other files referencing the old version

   Show the user what will change before making edits.

4. **README.md**: Verify the release process link in the README still points to a valid `how-to-spec.md`.

## Phase 4: Commit and Open PR

1. Stage all changes and create a single commit:
   ```
   Release OCIF $ARGUMENTS
   ```
2. Push the branch:
   ```
   git push origin $ARGUMENTS-draft
   ```
3. Open a PR from `$ARGUMENTS-draft` against `main`:
   - Title: `Release OCIF $ARGUMENTS`
   - Body should summarize key changes from the changelog in the spec
   - This PR shows the full diff between the previous version and the new one

4. Tell the user to review and merge the PR. **Do not merge automatically.**

## Phase 5: After Merge — Tag

Once the user confirms the PR has been merged:

1. Switch to main and pull:
   ```
   git checkout main && git pull origin main
   ```
2. Create and push the git tag:
   ```
   git tag $ARGUMENTS
   git push origin $ARGUMENTS
   ```

## Phase 6: Announcements (guided, not automated)

Tell the user about the remaining manual steps. Do NOT perform these automatically — just provide the checklist and offer to help draft content.

### Website
- [ ] Update [canvasprotocol.org](https://github.com/ocwg/canvasprotocol.org/blob/main/index.html) to list the new version

### GitHub Discussions
- [ ] Create announcement post in [GitHub Discussions](https://github.com/orgs/ocwg/discussions) (Announcements category)
  - Title: "OCIF $ARGUMENTS is released"
  - Include: version, status, key changes, call to action for implementers
  - Reference: [v0.5 announcement](https://github.com/orgs/ocwg/discussions/57)

### Email (Buttondown)
- [ ] Draft email via [Buttondown](https://buttondown.com/ocwg)
  - Subject: "OCIF $ARGUMENTS is released"
  - Include TL;DR, link to Discussion post, link to https://spec.canvasprotocol.org
  - Review [past announcements](https://buttondown.com/ocwg/archive/) for tone

### Discord & Social
- [ ] Post in OCWG Discord #general — link to Discussion + brief summary
- [ ] Post to Twitter and Bluesky — link to Discussion + spec URL

### Post-release
- [ ] Run `/prepare-new-version` to set up the next draft
- [ ] Monitor GitHub Discussions and Discord for feedback

Offer to help draft the announcement text based on the changelog in the spec.
