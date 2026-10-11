# AGENTS.md — Jacob & Intan wedding website

You are working on a real wedding website, not an abstract animation demo. Read `README.md`, `PROJECT_HISTORY.md`, and `docs/ANIMATION_CONTRACT.md` before changing postcard behavior. `PROJECT_HISTORY.md` records the couple's design decisions and negative feedback; treat that history as product requirements, not merely past suggestions.

## Product direction and nonnegotiables

- Wedding: **Jacob and Intan**, **Jakarta**, **July 3, 2027**. Preserve these facts unless the user changes them.
- Navigation, in this order: **Home, RSVP, Story, Where to Stay, Schedule, Registry, Travel, Q & A**.
- The postcards are real relationship memorabilia and the site's distinctive visual art, **not its primary content**. A legible announcement and navigable content must dominate the composition. Matte-black table, semi-transparent rounded navigation (individual pill buttons, **not** a segmented toggle/switch), translucent/blurred content panels, warm-white type. The new hero has no text container, and mobile navigation collapses to a dropdown pill.
- Current preferred default: `index.html` / `wedding-limited-v5-style.html`. Only three motion profiles: **04 Softer direct hybrid**, **05 Longer perspective exhale**, **06 Hold then flatten**. `wedding-mixed-v4-style.html` is a historical seven-profile comparison, **not** the preferred default. Do not blend profiles 7–10 back into the default without direction from the user.
- Cards enter from randomly chosen local compass directions (including from below, sides, diagonals), with little travel: currently 27–37 CSS px and up to ±8° angular jitter around eight sectors. The first two choose deliberately distinct directions (at least 127° apart after jitter). Variation should be present but *barely noticeable*.
- A card should fade from translucent to **fully opaque** as it comes to rest, stop translation before its final flattening, then hold its final pose exactly. **No bounce, no corrective movement, no yaw reversal, no snap when an animation class or Web Animation is removed.**
- October 8 refinement: no conspicuous phase boundaries or emphasized air-release drop. The limited profiles use a continuous decelerating approach; remaining flattening is only 0.04–0.05% scale and 0.08–0.10° tilt. Scale must never grow before the final shrink. Preserve the exact hold in profile 06 and make its subsequent release almost imperceptible.
- **October 11 landing mockup supersedes the previous top layout/opening:** follow `docs/LANDING_MOCKUP.md` and Intan’s supplied sketch. The canonical page uses a full-width pile of eight items fading at rest, a panel-free script headline, a three-day scroll intro, and a mobile dropdown pill. Later arrivals retain the limited 04–06 profiles and all their invariants. The historical mixed entry keeps its original opening.
- Historical opening: two cards already settling at first paint, one on each side; incremental shuffled arrivals thereafter, usually alternating sides; coverage-aware placement with ~70% target; recycling/retirement of old cards; subtle slower-than-content parallax; `prefers-reduced-motion` support. Keep these behaviors for the historical comparison; the new canonical opening is the explicit exception.
- Desktop sizing target: roughly ¾ of a physical postcard on a 13-inch MacBook Air at a ~1280px viewport (~432px long edge); max about 576 CSS px on sufficiently wide desktop. Avoid giant images or unnecessary large downloads.
- Do not silently redefine explicit preferences by attempting to make the motion “more physical.” The previous team introduced unwanted overshoot and wobble for that reason.

## Repo entry points

- `content/sections/*.md`: editable prose and YAML front matter; `content/page.md` assembles the eight sections and supplies navigation order. Shared facts live in `content/_data/site.yaml`. Read `docs/EDITING_CONTENT.md` for authoring.
- `templates/`, `eleventy.config.js`, `scripts/build*.mjs`: Eleventy authoring/build code. Generated runtime stays plain HTML/CSS/JS.
- `index.html`: generated canonical version, byte-identical to `wedding-limited-v5-style.html` (limited 3-profile, eight-direction approach with quiet settling). Do not edit either generated entry by hand.
- `wedding-limited-v5-style.html`: named comparison copy of canonical site.
- `wedding-mixed-v4-style.html`: secondary reference, 7 styles. The two pages share `script.js` and `styles.css`, selecting their profile pool through `<html data-motion-set="limited|mixed">`.
- `script.js`: random deck, card placement/coverage, WAAPI motion profiles, retirement, parallax, responsive layout, navigation state.
- `styles.css`: layout, hero, cards and readability.
- `images/`, `medium/`, `thumbnails/`: **web derivatives**, not archival originals.
- `photos/`: separate public photo catalog and derivatives. Only photo IDs **2, 6, 9, 13, 18** are approved. Every load must begin with three random postcards followed by one random photo. `background-config.js` sets `photoShare` for subsequent arrivals (initially 0.20); photos and postcards must shuffle independently, with stable lookahead for recycling. Keep original masters in `originals/photos/` outside the review root. See `docs/PHOTO_LIBRARY.md`.
- `manifest.json`, `docs/asset-inventory.json`: art IDs/dimensions and image inventory.
- `experiments/`: complete standalone historic animation carousels, for comparison; not production code.
- `originals/`: source-media destination. See `originals/README.md` BEFORE importing or modifying photos.

## Critical animation implementation invariants

1. A pose's `z` is its absolute CSS `rotate()` angle. Every keyframe must explicitly retain `finalDeg` once landing rotation is reached. Missing `z` defaults to **0°**, a previously confirmed defect that made cards rotate toward zero and back. Do not repeat it.
2. At or before the last settling phase, translation coordinates **must become exactly (0,0)**; they must remain there to the final pose. The last two keyframes also keep `z === finalDeg`. For “hold then flatten,” the *entire* transform must be identical across the hold keyframes—derive once, don't make two separate `random()` calls.
3. Interpolate toward the final resting angle without crossing and correcting. Check cases for positive and negative rest rotations and from every entry sector.
4. Final inline `opacity` and `transform` must be committed **before** cancelling the Web Animation; compare `getComputedStyle` transform before and after cancellation. This prevents a visible end-frame jump.
5. Retirement/fade must operate even when animation has set inline opacity. If an inline `opacity:1` is left behind, a later CSS `.is-retiring { opacity:0 }` rule may not take effect. Regression-test recycling independently.
6. Distinguish local approach vector from the final card rotation and the placement side. They are independent random variables.
7. Keep reduced-motion mode entirely static, not just slower.

## Working method

- Make small, reviewable changes. The user approved Eleventy for Markdown authoring on October 11, 2026, and expects the agent to handle nearly all non-Markdown code. Preserve the existing plain static runtime and direct `file://` support. Do not add a client framework without explicit direction.
- After content/template changes, run `make build` and `make check`; keep both generated limited HTML files tracked. Run `make test-content` for build/inclusion changes and the browser suites for changed rendered structure or styling. `make export` produces only allowlisted public files in `dist/`; never deploy the workspace or serve its internal sources.
- Keep `serve/` symlinks intact. Content needs a build or native watcher before appearing on reload. `make watch` starts no server. Node 24, pinned npm dependencies, and `package-lock.json` define the build environment.
- For animation changes: change only the requested dimension (e.g. approach direction, not settling) and run `python3 scripts/verify_repo.py` plus the browser regression test, `python3 tests/test_motion_browser.py`. Chromium/Playwright setup is in `README.md`.
- Test at 1280×800 (~13-inch MBA CSS viewport), at least one larger desktop size, and ~390×844 mobile. Validate no text overflow, navigation, image loading, no console errors, correct reduced-motion behavior, no unintended yaw backtracking, and no jump after WAAPI teardown.
- Browser timing and seeded/randomized motion cases matter more than checking keyframes by inspection alone. Inspect `data-motion-profile`, `data-entry-direction`, and rendered `DOMMatrix` when debugging.
- If you change the canonical page, keep its named limited copy in sync or explicitly document divergence. Never inadvertently promote the broad experimental mix as canonical.
- User-owned source scans are irreplaceable. **Never upscale web derivatives and pass them off as originals.** Never overwrite or modify files in `originals/`; only create derived files elsewhere. Strip GPS/EXIF from *public derivatives* if a source file contains location metadata, without modifying the original.
- Do not commit real RSVP data, guest PII, credentials, tokens or unreviewed analytics/tracking. RSVP interactions are currently placeholders; do not imply a backend exists.
- Before a significant visual direction change, check `PROJECT_HISTORY.md` for already-rejected styles. Update that file when the user explicitly approves or rejects a design.

## Handoff priorities

1. Import the actual original JPEG scan/crop archive(s) when provided: this handoff does **not** contain them. See `originals/README.md` and `docs/IMAGE_PROVENANCE.md`.
2. Keep refining the preferred limited site, replacing placeholder content with confirmed real details (RSVP, story, accommodations, schedule, registry, travel, FAQ).
3. Decide with the couple how to implement secure RSVP submission and guest privacy, hosting, accessibility, and maintenance; none are resolved here.
4. Keep the motion subtle. A technically clever effect that attracts attention away from the wedding content is a regression.
