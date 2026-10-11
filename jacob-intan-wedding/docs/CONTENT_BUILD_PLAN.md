# Markdown authoring and static build

Status: implemented and verified on October 11, 2026, following user approval.
No public deployment is part of this migration.

## Selected approach and options considered

Use **Eleventy with Nunjucks and Markdown**. The user expects to leave nearly
all non-Markdown authoring to the agent, so built-in build/watch tooling is more
useful here than matching the user's Python preference. Eleventy adds no client
framework: visitors receive the existing plain HTML, CSS, JavaScript, and images.

| Option | Benefit | Tradeoff |
| --- | --- | --- |
| **Eleventy — selected** | Established Markdown/template tooling, native build/watch, static asset copying | Agent maintains Node/npm configuration |
| **Pelican** | Established Python generator with Markdown and Jinja templates | Article/page conventions add configuration for eight blocks composed into one page |
| **Small Python builder** | Familiar language and precise HTML control | Project would own more build/watch/inclusion machinery |

These are project-specific judgments. Eleventy gives the human the same small
Markdown editing surface while leaving more infrastructure to an established
project. Python remains in use for existing verification tools.

## Human editing structure

```text
content/
  page.md                    # Approved section order and inclusion loop
  _data/site.yaml            # Shared names, city, date, browser-title suffix
  _data/publicAssets.json    # Agent-maintained extra public image allowlist
  sections/
    home.md
    rsvp.md
    story.md
    stay.md
    schedule.md
    registry.md
    travel.md
    questions.md
  snippets/                  # Optional Markdown/HTML includes
templates/
  page.njk                   # Existing document, tabletop, nav, main, footer
  panels/standard.njk         # Existing content panel
  panels/home.njk             # Existing announcement typography
  panels/story.njk            # Existing story layout and postcard strip
```

Ordinary authoring happens in one section file. YAML front matter supplies its
labels, and the body contains Markdown plus optional HTML. Home retains a single
announcement paragraph; all other blocks can have longer prose, lists, headings,
tables, links, and HTML. Existing copy and wedding facts are carried over.

Example section:

```markdown
---
id: rsvp
title: RSVP
nav: RSVP
eyebrow: "01 / CELEBRATE WITH US"
---

We can’t wait to celebrate together.

<p class="muted">RSVP details will be added here.</p>
```

`content/page.md` is the upper-level file. Its ordered `sections` list supplies
both navigation and panel order. A short Nunjucks include loop inserts each
rendered section into its selected template. This implements the requested
upper-level composition without a custom Markdown inclusion language.

Inside a body, `{% include "snippets/arrival.md" %}` includes a smaller file
before Markdown conversion. The snippet can contain Markdown, HTML, or nested
includes and needs no section metadata. Missing files and static include cycles
produce file-specific errors. To show template syntax literally in code fences,
use Nunjucks raw/endraw tags as documented in the editing guide.

Raw HTML is enabled. Markdown is rendered before insertion into layout wrappers;
HTML inside an HTML block follows normal Markdown HTML-block rules. Dedicated
Home and Story templates preserve the original DOM and decoration.

## Build and review workflow

Node 24 and locked npm dependencies define the build environment. The everyday
commands are `make build`, `make watch`, and `make export`. On a fresh checkout,
`make setup` installs dependencies. The Makefile handles this Mac's keg-only Node
path, so the author need not set PATH for each terminal.

Eleventy treats sections as native templates with `permalink: false` and no
layout, rendering them for collection use without publishing separate pages.
The master uses a Nunjucks engine override to avoid a second Markdown pass over
assembled HTML. Native watch rebuilds after Markdown, settings, snippet, and
template changes; it starts no server. Browser refresh is manual.

Local builds update both tracked HTML entry points from the same bytes, leaving
all `serve/` links unchanged. A bad edit preserves the last good page; correction
and save recover the watcher. Direct file browsing continues to work after build.
`make check` fails when tracked generated HTML is stale. Generated HTML is never
edited by hand.

## Export and future hosting

`make export` builds a fresh `dist/` without changing tracked review HTML. It
contains real files: the two limited HTML entries, shared CSS/JS/config, manifest,
photo catalog, 72 postcard derivatives, and ten approved photo derivatives.
The current export has 89 files.

Passthrough copying is driven by explicit public inventories. Content source,
templates, tooling, documentation, archives, originals, experiments, mixed
comparison HTML, and guest data are excluded. A fresh staging directory prevents
removed assets lingering in the output. New content images must be registered
by the agent in the public image allowlist and exposed through the review links.

A future Cloudflare Pages project uses root `jacob-intan-wedding`, build command
`npm ci --include=dev && npm run export`, output `dist`, and Node 24. The same folder can be used
by another static host. Actual deployment and RSVP submission are separate tasks.
No Caddy configuration or tailnet hosting change is needed for this migration.

## Execution and acceptance

1. Preserve a baseline of DOM, visible copy, runtime assets, and rendering.
2. Extract all eight content blocks and the current document into Markdown and
   specialized templates, preserving IDs, classes, script order, and asset URLs.
3. Configure native assembly, includes, Markdown/HTML, and metadata validation.
4. Add build/watch/check/export commands, synchronized HTML, and public packaging.
5. Check rendering and existing motion/performance behavior, document the editing
   workflow and source/output distinction, then commit the migration.

Acceptance requires:

- Markdown editing and HTML passthrough for each block, one location for shared
  facts, understandable page assembly, optional nested snippets, and useful errors.
- Deterministic builds, matching limited HTML files, freshness checks, unchanged
  review links, watch invalidation/recovery, and preservation of prior successful
  output after invalid content.
- Matching original copy, DOM, navigation, accessibility references, and layout at
  390×844, 1280×800, and 1920×1080. Screenshot comparison allows only a handful of
  one-channel-level Chromium rounding pixels, with exact layout/text comparison.
- Longer Markdown/HTML, lists, headings, tables, and links without page overflow.
  Tables may scroll inside their panels on narrow screens.
- Repository/assets, deck, geometry, motion-curve, rendered motion, and performance
  regressions passing. Normal and reduced-motion modes and real images are covered.
- An independent, symlink-free, public-only export, with no stale or internal files.
- A short editing guide usable without reading the site's code.

The v5 profiles 04–06, quiet settling, postcard/photo opening sequence, shuffled
collections, retirement, parallax, image tiers, and reduced-motion behavior are
preservation requirements. This migration does not invent event details or an
RSVP backend.

## Verification — October 11, 2026

- Clean locked npm installation, content tests, and generated-HTML freshness pass.
  Watch tests include direct prose, nested snippets, settings, templates, failed
  edits, recovery, and absence of generated-file rebuild loops. Node's watcher
  is used instead of the optional macOS FSEvents addon, which did not deliver
  changes inside this sandbox after a clean install.
- Original DOM, visible text, and layout match at all three target sizes.
  Phone/laptop screenshots match exactly; the larger screenshot differed by six
  background edge pixels at one channel level, within the explicit rounding bound.
  Longer prose, tables, lists, links, subheadings, and raw HTML pass at all sizes.
- Rendered motion checks pass for normal and reduced motion, all eight directions,
  positive/negative resting rotations, exact holds, opacity, and WAAPI cleanup.
  Existing native/fallback/reduced performance and navigation checks pass.
- Repository/image integrity, independent background decks and opening sequence,
  40,000 placement samples, and 432 actual JavaScript curve cases pass.
- The 89-file export contains real public files only and works independently via
  routed HTTP and direct file browsing. Caddy's 88 existing review files match
  source bytes; symlinks, original media, and animation JavaScript are unchanged.
- Private browser evidence with current runtime hashes, screenshots, and suite
  output is retained under `.build/browser/` and excluded from review/export/Git.

Chromium was launched by the user outside the macOS agent sandbox and accessed
through loopback CDP for browser tests. No review/hosting configuration changed.

## Primary references

- [Eleventy Markdown](https://www.11ty.dev/docs/languages/markdown/)
- [Collections](https://www.11ty.dev/docs/collections/)
- [Permalinks and non-published fragments](https://www.11ty.dev/docs/permalinks/)
- [Nunjucks templates](https://www.11ty.dev/docs/languages/nunjucks/)
- [Watch without a server](https://www.11ty.dev/docs/watch-serve/)
- [Build events](https://www.11ty.dev/docs/events/)
- [Public asset copying](https://www.11ty.dev/docs/copy/)
- [Pelican content](https://docs.getpelican.com/en/latest/content.html)
- [Cloudflare Pages build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
