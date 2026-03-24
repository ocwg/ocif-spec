#!/usr/bin/env node
/**
 * Pre-build script: reads versioned spec.md files from ../spec/vX.Y.Z/,
 * processes them (image URL rewriting, TOC stripping), and writes them into
 * the spec-site directory as VitePress source pages.
 *
 * Also writes versions.json, which config.js reads to build the version
 * switcher nav dropdown.
 *
 * Run via: npm run build  (called automatically before vitepress build)
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SITE_DIR = join(__dirname, '..')
const SPEC_DIR = join(__dirname, '../../spec')

const REPO = 'ocwg/ocif-spec'
const RAW_BASE = `https://raw.githubusercontent.com/${REPO}/main`
const GH_BASE = `https://github.com/${REPO}/blob/main`

/**
 * Sort version directory names: non-drafts newest-first, drafts last.
 */
function sortVersions(names) {
  return [...names].sort((a, b) => {
    const aDraft = a.includes('draft')
    const bDraft = b.includes('draft')
    if (aDraft !== bDraft) return aDraft ? 1 : -1
    return b.localeCompare(a, undefined, { numeric: true })
  })
}

/**
 * Rewrite relative image URLs to the raw GitHub CDN so they render in the
 * built site. Absolute URLs are left alone.
 */
function rewriteImages(markdown, version) {
  const rawBase = `${RAW_BASE}/spec/${version}`
  return markdown.replace(
    /!\[([^\]]*)\]\((?!https?:\/\/)([^)#][^)]*)\)/g,
    (_, alt, src) => `![${alt}](${rawBase}/${src})`,
  )
}

/**
 * Rewrite relative doc-links to the GitHub HTML viewer, since we only
 * include spec.md — not sibling files like extensions/ or design/.
 */
function rewriteDocLinks(markdown, version) {
  const ghBase = `${GH_BASE}/spec/${version}`
  return markdown.replace(
    /\[([^\]]+)\]\((?!https?:\/\/)(?!#)([^)]+)\)/g,
    (_, text, href) => `[${text}](${ghBase}/${href})`,
  )
}

/**
 * Strip the manually-maintained TOC block. VitePress renders its own
 * right-sidebar outline from the headings automatically.
 */
function stripManualTOC(markdown) {
  markdown = markdown.replace(/<!--\s*TOC\s*-->[\s\S]*?<!--\s*\/TOC\s*-->/gi, '')
  markdown = markdown.replace(
    /(?:#{1,4}\s+Table of Contents\n)((?:\s*[-*+]\s+.*\n?)+)/gi,
    '',
  )
  return markdown
}

function main() {
  const allEntries = readdirSync(SPEC_DIR)
  const versionDirs = sortVersions(
    allEntries.filter((name) => {
      try {
        return statSync(join(SPEC_DIR, name)).isDirectory()
      } catch {
        return false
      }
    }),
  )

  console.log('Spec versions found:', versionDirs.join(', '))

  const built = []

  for (const version of versionDirs) {
    const specPath = join(SPEC_DIR, version, 'spec.md')
    let specMd
    try {
      specMd = readFileSync(specPath, 'utf-8')
    } catch {
      console.warn(`  ⚠ No spec.md in ${version}/ — skipping`)
      continue
    }

    specMd = rewriteImages(specMd, version)
    specMd = rewriteDocLinks(specMd, version)
    specMd = stripManualTOC(specMd)

    const outDir = join(SITE_DIR, version)
    mkdirSync(outDir, { recursive: true })
    writeFileSync(join(outDir, 'index.md'), specMd, 'utf-8')
    console.log(`  ✓ ${version}/index.md`)
    built.push(version)
  }

  const latest = built.find((v) => !v.includes('draft')) ?? built[0]

  writeFileSync(
    join(SITE_DIR, 'versions.json'),
    JSON.stringify({ versions: built, latest }, null, 2),
    'utf-8',
  )
  console.log(`\nversions.json written — latest: ${latest}`)

  // Root index.md: redirect to latest version at runtime.
  writeFileSync(
    join(SITE_DIR, 'index.md'),
    `---
layout: page
title: OCIF Specification
---

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vitepress'
const router = useRouter()
onMounted(() => router.go('/${latest}/'))
<\/script>

<noscript><meta http-equiv="refresh" content="0; url=/${latest}/" /></noscript>

Redirecting to the [latest OCIF specification (${latest})](/${latest}/)…
`,
    'utf-8',
  )
  console.log(`index.md written — redirects to /${latest}/`)
}

main()
