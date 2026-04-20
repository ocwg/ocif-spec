import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const manifestPath = join(__dirname, '../versions.json')

// Read versions manifest produced by scripts/build.js.
if (!existsSync(manifestPath)) {
  throw new Error(`versions.json not found at ${manifestPath}. Run 'node scripts/build.js' first.`)
}
const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
const versions = manifest.versions
const latest = manifest.latest

export default {
  title: 'OCIF',
  description:
    'Open Canvas Interchange Format — the interoperability standard for infinite canvas applications',

  base: '/',
  cleanUrls: true,

  head: [
    ['link', { rel: 'icon', href: 'https://canvasprotocol.org/favicon.ico' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'OCIF Specification' }],
    [
      'meta',
      {
        property: 'og:description',
        content:
          'Open Canvas Interchange Format — the interoperability standard for infinite canvas applications',
      },
    ],
  ],

  themeConfig: {
    siteTitle: 'OCIF Spec',

    nav: [
      { text: '← canvasprotocol.org', link: 'https://canvasprotocol.org', noIcon: true },
      {
        text: latest,
        items: versions.map((v) => ({
          text: v === latest ? `${v} (latest)` : v,
          link: `/${v}/`,
          activeMatch: `^/${v}/`,
        })),
      },
    ],

    outline: {
      level: [2, 3],
      label: 'On this page',
    },

    editLink: {
      pattern: 'https://github.com/ocwg/ocif-spec/edit/main/spec/:path',
      text: 'Edit this page on GitHub',
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/ocwg/ocif-spec' }],

    footer: {
      message:
        'Licensed under <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.',
      copyright: 'Copyright © 2024–2026 Open Canvas Working Group',
    },

    search: {
      provider: 'local',
    },
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
  },
}
