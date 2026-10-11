# Architecture and handoff notes

## Static runtime

- Eleventy generates `index.html` and `wedding-limited-v5-style.html` from the same rendered bytes. `wedding-mixed-v4-style.html` remains a historical reference. All share the plain static runtime at repo root.
- `<html data-motion-set="limited">` selects three preferred profiles. `data-motion-set="mixed"` selects the seven-profile comparison. Avoid maintaining near-duplicate JS files or changing both experiences inadvertently.
- The `ART` list is currently embedded in `script.js`. `manifest.json` separately documents all 24 postcard assets, intrinsic dimensions and three WebP quality/size levels. A future refactor can generate the JS metadata from this manifest if parity is tested.
- Approved photos have a separate `photos/catalog.js`, two WebP tiers, and private masters in `originals/photos/`. `background-config.js` controls the photo share after the opening three postcards and one photo. All three main HTML entries load configuration and photo catalog before `script.js`, retaining direct `file://` support.
- There is no bundler, app framework, backend, signup flow, or analytics. Direct `file://` browsing should continue to work.

## Key runtime stages

1. Shuffle postcard and photo decks independently (Fisher–Yates) at load and upon each collection's exhaustion. Do not immediately repeat the last item across a reshuffle. Begin with three random postcards and one random photo, then choose the collection by the configured photo share. Cache the next chosen item so retirement previews do not reroll or advance the opening sequence.
2. On startup place one card on each side, randomly selecting distinct limited-entry sectors (when in limited mode). Later schedule drops ~2.8–4.4 seconds apart (roughly implementation-defined, and intentionally uneven).
3. Choose a side with a bias toward alternation, score candidate positions using sampled screen-space coverage, prefer uncovered space up to a 70% target.
4. Construct a positioned `<figure>` with an `<img srcset>` from the available tiers (postcards: 480/960/1200; photos: 480/1200 longest-side families). Preserve the image's full aspect ratio. Lazy-by-creation means absent cards are not requested up front.
5. Generate per-card keyframes from a selected profile with a final rotation specific to that card. For limited mode, add an independent approach vector from eight compass directions. Apply WAAPI; commit final inline pose/opacity then cancel animation.
6. Periodically remove fully obscured or far-offscreen cards. If the next card's art ID is still visible, begin fading the existing copy one drop interval earlier.
7. The fixed background plane translates at `scrollY * 0.18` to provide parallax behind independently scrolling content. Supported browsers use a CSS root scroll timeline with an endpoint updated on body/viewport size changes; other browsers retain a passive, frame-batched scroll handler. Reduced-motion mode has no parallax. Position candidates are based on the visible window.

## Fragility and known tradeoffs

- **Motion defaults:** `pose()` defaults omitted rotation `z` to 0. This caused a prior real-world regression. Confirm every contact-phase keyframe explicitly preserves `finalDeg`.
- **WAAPI cleanup:** Commit exactly the computed final pose before cancellation; do not alter the transform during cleanup. The last interpolation and the at-rest CSS must agree.
- **Retirement opacity:** CSS retirement transition needs to win over a previously set inline opacity. Keep the tested workaround.
- **Randomness:** Failing cases can be difficult to reproduce unless an agent introduces seeded RNG in tests or injects explicit approach vectors. Use deterministic sampled tests in addition to manual randomized viewing.
- **Performance:** Candidate scoring caches each rectangle's trigonometry and screen-space center per operation, reads the scroll offset once, and reuses coverage cells until viewport geometry changes. Mobile height-only resizes from browser chrome/keyboard do not reposition or resize every card; width changes still reflow the composition. Mobile panels retain blur with smaller radii. See `PERFORMANCE.md` for the paired browser measurements and remaining device verification.
- **Source artwork:** Large WebP derivatives were produced from earlier full-res cropped JPEGs, but source JPEGs are missing from this handoff. The WebP `images/` directory is *not* archival source.
- **Content readiness:** Placeholder sections are navigable but incomplete, and no real RSVP backend exists. Treat this as a design prototype, not a completed publicly launchable wedding site.

## Markdown authoring and Eleventy builds

The user approved the content migration on October 11, 2026, choosing an
established generator and leaving nearly all non-Markdown authoring to the agent.
See `EDITING_CONTENT.md` for the human workflow.

- Each `content/sections/*.md` is a native Eleventy Markdown template. Directory
  data sets `permalink: false`, `layout: false`, and a collection tag, so the
  blocks render for collection use without publishing separate pages.
- The YAML front matter supplies IDs, titles, eyebrows, navigation labels, and
  optional `panel: home|story`. Standard panels are the default.
- Nunjucks preprocesses bodies and includes before markdown-it converts them to
  HTML with raw HTML enabled. Templates insert already-rendered block HTML into
  the original panel structure; they never wrap unrendered Markdown in a div.
- `content/page.md` uses a Nunjucks engine override to assemble the collection
  without a second Markdown pass. Its `sections` list drives both page and nav
  order. Home and Story retain their specialized DOM and decoration.
- Native YAML global data provides `site`; its quoted ISO date is formatted in
  UTC consistently for announcement, footer, schedule, and metadata. Extra
  prose snippets live under `content/snippets/`, watched but never published.
- `scripts/build.mjs` invokes Eleventy build/watch. `build-support.mjs` validates
  metadata, static include chains, output IDs/references, and export contents.
  Successful builds synchronize both tracked entry points via atomic writes.
  Failed content edits retain the last good review HTML and previous export.
- Native watch performs full builds. Generated root HTML and `.build/` are not
  input templates; snippet and template changes invalidate correctly.
  Chokidar uses Node's watcher instead of the optional FSEvents addon, which
  did not deliver file changes inside this macOS sandbox after a clean install.
- Builds stage in `.build/site`. Review mode writes root HTML; check mode only
  compares it; export mode replaces `dist/` with fresh real files. Eleventy's
  passthrough copying uses explicit runtime/image inventory paths, including
  the five approved photos. `content/_data/publicAssets.json` may list new files
  only from `content-images/`; link that public directory into `serve/` if used.
- `serve/` remains the existing Caddy root. Authoring files require a build;
  generated runtime files appear on reload through the unchanged symlinks.
  A future Pages build uses Node 24, `npm ci --include=dev && npm run export`, output `dist`.

## Future work

Add real event details, choose RSVP submission, and connect the static export
to hosting when requested. Avoid a broad visual redesign or introducing physics
oscillation without a specifically approved motion sample.

## Test environment note

The motion suite uses Playwright `page.set_content` with scripts/CSS injected.
The performance suite additionally loads the complete public review tree with
real image bytes via Playwright routing. Both pass in local headless Chromium,
including mobile and desktop motion/cleanup checks. `CHROMIUM_PATH` can point
to an existing cached browser if its version differs from Playwright's default.
Headless mobile emulation is not a physical-device GPU or Safari performance test.
