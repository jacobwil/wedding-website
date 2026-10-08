# Architecture and handoff notes

## Static runtime

- `index.html` is a copy of `wedding-limited-v5-style.html` (preferred). `wedding-mixed-v4-style.html` is a reference. Both include one `script.js` and `styles.css` at repo root.
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
7. The fixed background plane translates at `scrollY * 0.18` to provide parallax behind independently scrolling content. Position candidates are based on the visible window.

## Fragility and known tradeoffs

- **Motion defaults:** `pose()` defaults omitted rotation `z` to 0. This caused a prior real-world regression. Confirm every contact-phase keyframe explicitly preserves `finalDeg`.
- **WAAPI cleanup:** Commit exactly the computed final pose before cancellation; do not alter the transform during cleanup. The last interpolation and the at-rest CSS must agree.
- **Retirement opacity:** CSS retirement transition needs to win over a previously set inline opacity. Keep the tested workaround.
- **Randomness:** Failing cases can be difficult to reproduce unless an agent introduces seeded RNG in tests or injects explicit approach vectors. Use deterministic sampled tests in addition to manual randomized viewing.
- **Performance:** Candidate scoring and full-coverage checks are CPU-side; monitor lower-powered phones. The current 24-card pool and low per-drop frequency are modest but not a proven bound for every device. Avoid unnecessary perpetual requestAnimationFrame loops.
- **Source artwork:** Large WebP derivatives were produced from earlier full-res cropped JPEGs, but source JPEGs are missing from this handoff. The WebP `images/` directory is *not* archival source.
- **Content readiness:** Placeholder sections are navigable but incomplete, and no real RSVP backend exists. Treat this as a design prototype, not a completed publicly launchable wedding site.

## Proposed evolution (requires user approval)

Improve content authoring and semantics, add real event details, consider a well-scoped RSVP backend with privacy/security review, add deployment pipeline and accessibility regression coverage. Avoid a broad visual redesign or introducing physics oscillation without a specifically approved motion sample.

## Test environment note

The handoff was checked via Playwright `page.set_content` with scripts and CSS injected, because this execution environment's Chromium policy blocks direct `file://` navigation (`ERR_BLOCKED_BY_ADMINISTRATOR`). Repository integrity, motion and computed-transform continuity tests pass; the next coding agent should additionally run a normal local static-server visual smoke test to verify actual asset loading and final styling.
