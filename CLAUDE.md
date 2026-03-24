# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OCIF (Open Canvas Interchange Format) is an interchange file format for canvas-based applications. This repo contains the specification (Markdown + JSON schemas), not application code. Current version: v0.7.0.

## Linting

The only automated check is a file format validator run via pre-commit:

```bash
python3 .github/workflows/file_format.py <file>
```

This strips trailing whitespace, normalizes to LF line endings, removes BOM, and ensures a final newline. CI runs this on all text files via `pre-commit/action@v3.0.1`.

## Repository Structure

- `spec/v0.7.0/` — Current released spec (`spec.md`, `schema.json`, `extensions/*.json`)
- `spec/v0.1/` through `spec/v0.6/` — Historical versions (do not modify)
- `VERSION` — Single line with current released version (e.g., `v0.7.0`)
- `public/_redirects` — Line 2 points https://spec.canvasprotocol.org to the current version
- `catalog.md` — Registry of known extensions
- `cookbook.md` — Usage guide with examples
- `design/` — Goals, requirements, design decisions, ADRs
- `.claude/skills/` — Release automation skills

## Versioning and Release Workflow

Each version lives in its own directory (`spec/vX.X.X/`). Draft versions use `spec/vX.X.X-draft/` and iterate on a long-running `vX.X.X-draft` branch.

Two skills automate the lifecycle:
- `/prepare-new-version vX.X.X` — Copies current release to a draft dir, opens a PR to main, then creates the draft branch after merge
- `/release vX.X.X` — Renames draft dir to final, updates all version pointers (VERSION, _redirects, README, cookbook, catalog, examples), opens release PR from draft branch to main, tags after merge

When updating version pointers, replace the old version in all files **outside** `/spec` — never modify previous version directories.

## Spec Editing Conventions

From `how-to-spec.md`:
- Property tables: columns are Property, JSON Type, OCIF Type, Required, Contents, Default
- `**required**` is bold in tables; other values are not
- JSON types in backtick monospace; OCIF types linked to their definition
- Examples start with `**Example:**`
- Each extension section should end with `JSON schema: [name.json](extensions/name.json)`
- Unresolved TODOs use `- [ ] @@ description` — search for `@@` before releasing

## Extension Naming

All built-in extensions follow `@ocif/foo-bar` mapping to `extensions/foo-bar.json`. There are no `-node` or `-rel` suffixes in v0.7.0+.
