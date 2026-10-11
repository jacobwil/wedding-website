# Project history and design decisions

This document preserves the evolution of the wedding website and, especially, **what the user explicitly liked and disliked**. It is a chronological product record, not a list of requirements invented by the assistant. Numbers such as easing curves, percentages, times, and pixel offsets are marked as *implementation choices* when the user did not personally specify them.

## Background and source images (before the site)

1. The artwork consists of postcards **Jacob and Intan exchanged over their relationship**. They are personally meaningful keepsakes, rather than generic stock decorations.
2. The user supplied scanned postcards and asked for each postcard to be cropped into an individual image. The assistant's first crops were **not truly full original resolution**, as demonstrated by a magnified side-by-side comparison. **Disliked:** silent resolution loss, downsampling during ingest, and misleading claims about fidelity.
3. To preserve the originals during transfer, the user uploaded an `input.zip` containing the source images. The user asked for programmatic extraction and objective comparison of original versus processed output. Quality was to be verified, not guessed.
4. After faithful high-resolution crops, the user rejected **wastefully enormous output files**. The preference is perceptually insignificant lossy compression, not uncompressed/lossless files merely for the sake of a quality claim.
5. A web-specific asset set was requested, with flexible format and compression decisions delegated to the implementer: load quickly and look good, displayed no larger than a normal physical postcard, including Retina displays. The resulting asset inventory has 24 named cards, including `unsent_` distinctions, with 480px thumbnail and 1200px large WebP versions (an intermediate 960px tier was added later).
6. **Archival caveat:** The original unscaled JPEG scans and full-resolution JPEG crops from the earlier workflow are **not currently available in this handoff's accessible inputs**. The included WebP files are derivatives (not originals) and must never be represented as source-resolution files. See `docs/IMAGE_PROVENANCE.md` and `originals/README.md`.

## Landing-page concept and baseline content

7. The user presented a **rough proof of concept**, not a final design. The defining artwork: postcards that fade in and appear to be dropped onto a table, with a subtle air-cushioned settling effect. The user suggested researching real-world physics if useful, but always prioritized how it feels visually.
8. **Matte-black background** throughout. Postcards behind, not blocking, the content.
9. Main announcement, originally specified literally as: **“Jacob and Intan are getting married”**, **“Jakarta”**, **“July 3, 2027.”** The implementation may set the names and phrase typographically, but these facts are the source of truth.
10. Rounded top navigation inspired by the supplied ChatGPT UI screenshot: a semi-transparent container with pill-shaped individual buttons and active states, **not a two-way switch or segmented toggle**. Exact order: **Home / RSVP / Story / Where to Stay / Schedule / Registry / Travel / Q & A**.
11. Main text and navigation need semi-transparent dark backdrops so off-white text stays legible above postcards; visual emphasis should remain on the message and links.
12. The user explicitly clarified the hierarchy: **“The animation should be subtle. This is a cute background under a wedding webpage. These are postcards we've exchanged over our relationship. It's not the main part of the webpage but it is the art. It's the distinctive bit.”** This remains the most important creative directive.

## Prototype (v1)

13. Initial implementation used subdued cards around the sides, first-load single-shot falling/settling animation, no hover looping, matte black, translucent rounded navigation, centered announcement. This met the initial preference for unobtrusiveness.
14. Responsive desktop/tablet/mobile layouts and lightweight WebP images were introduced. All eight nav links went to placeholder sections. **Unfinished:** RSVP is not a real submission system and most content remains placeholder.
15. The user responded that this was a **strong start** and requested substantially different postcard sizing and continuous behavior (v2).

## v2 — bigger cards, continuous tabletop, layering and parallax

16. **Card size:** Up to physical postcard size on a large desktop. On a **13-inch MacBook Air**, approximately **¾ of physical size**; the implementation interpreted a 6×4-in card as ~576 CSS px full-size and ~432px long edge at a 1280px viewport. This dimensional model was suggested by the assistant, not a user-specified CSS measurement.
17. **Continuous drops**, not a one-off intro. The user's metaphor: standing above a table and dropping one postcard every few seconds. The webpage should begin with **at least one card on each side already settling** and then continue receiving new cards.
18. The postcard deck should be **shuffled per page load** so each visit looks different; assets should be loaded incrementally for speed. Do not preload every full-resolution source unnecessarily.
19. New arrivals should **usually alternate sides** but not predictably always alternate. Implementation used 80% preference; this probability is an implementation choice.
20. Landing coordinates should be somewhat randomized but **prefer currently blank table space** until roughly **70% coverage** (the 70% target *was user suggested*), then allow natural overlap.
21. Over time, old cards should be reused: fully obscured lower-layer cards become eligible for future drops; partially visible old cards should fade out **one card before being reused**. The system should avoid visible duplicate copies of one physical postcard.
22. On scroll, the card table/background should move **slower than foreground content**, and new drops should reach newly visible empty areas. The table should not simply vanish far above the viewport or abandon all earlier art. The 18% parallax coefficient is an assistant implementation choice.
23. The falling/settling itself should stay restrained, despite the continuous sequence.

## v3 — opacity and the first “jerk” report

24. User: **“The animation is great up until the end when the cards jerk. Just have the initial smooth animation stop and the card halt where it lay.”** This is a specific rejection of visible end-frame correction or snap.
25. User: **“Also, make the postcards turn entirely opaque, going from translucent to opaque as they stop moving.”** Final opacity **must be 1**, not 0.88–0.96.
26. A CSS animation cleanup fix was attempted. **It did not resolve the perceived jerk.** The following discussion diagnosed movement near the end as the probable culprit; the problem was not merely opacity or a mismatched final declaration.
27. The user requested a detailed numbered explanation of each phase. The assistant identified a phase-3 overshoot, followed by a phase-4 corrective movement/rotation and class teardown. **Disliked:** the card visibly walking/reversing at the end; the user explicitly suspected phase 4.

## First animation lab — 17 options

28. The user requested a separate **replayable animation carousel**, with many choices and a description at the bottom, to evaluate the motion outside the wedding page. This became the 17-option standalone lab, retained in `experiments/original-17-options/`.
29. Two user-mandated studies: (a) skip phase 4 completely and turn opaque after phase 3; (b) finish x/y/orientation first and then **shrink toward the center by ~1–2%**, suggesting air escaping. More alternatives were invited.
30. The lab compared uninterrupted deceleration, edge-first contact, gravity, perspective, flutter, drift, compression, and other subtle approaches. A replay button, speed adjustment and image switching improved comparability. This was a **design experiment**, not a request to ship all 17 styles.
31. User explicitly liked **option 11's way of moving around** (**“Gravity, no bounce”**) and **option 13's settle** (**“Perspective only”**). The assistant was asked to propose combinations and make a new carousel.

## Second animation lab — options 11 + 13

32. A focused hybrid carousel was built (retained in `experiments/hybrids-11-13/`): 01 and 02 were original 11 and 13 references; options **03–10** blended gravity-style travel with perspective flattening and different timings/strengths.
33. User: **“all of 4-10 are great! I like them all.”** This *was* positive feedback on these hybrids within the isolated comparison lab.
34. The user requested at least one representative of each general style in the *wedding page*, shuffled from drop to drop, with varied **entry angles**. The resulting broad v4-style implementation used seven profiles, including soft hybrid, longer exhale, hold/flatten, drift, compression, micro-tilt and curved travel.

## v4/v5 — broad mix felt excessive; narrow the pool

35. The user then revised the preference: **“too far. Just mix literally 4, 5, and 6 with different angles.”** This supersedes the earlier broad-mix request for the preferred default. User intended exactly the *hybrid lab* options:
    - **04 Softer direct hybrid**
    - **05 Longer perspective exhale**
    - **06 Hold then flatten**
36. A v5-style site was produced with just those three profiles and different approach angles/drift. But it still felt wrong.
37. User: **“this has the same problem as v4. It feels like the cards walk too far. Wobble back and forth. I want you to carefully reassess the entire codepath that does the animation and look for unintended behavior. Try to simulate and evaluate it in your controlled environment.”** Important: user feedback identified an actual software bug, not a desire to simply reduce all motion to zero.

## v6 — root-cause audit and verified correction

38. The animation code was audited and tested in a controlled Chromium browser. A key defect was found: intermediate keyframes omitted the `z` (rotation) value, and the helper defaulted it to **0°**. A card with a non-zero resting angle therefore rotated **toward 0° mid-flight and then back to the resting angle** — precisely the unwanted wobble.
39. In “Hold then flatten,” two keyframes meant to hold the same pose were separately randomized, also causing unintended movement. Fix: derive/retain one identical contact pose for the held interval.
40. Corrected frames consistently preserve absolute resting `z`, monotonically approach the final location, and perform only perspective/scale flattening after position/rotation finish. Final inline pose/opacity are committed **before WAAPI animation teardown** so animation cleanup causes no jump.
41. A recycling issue was also fixed: inline opacity could override a CSS retirement fade. This is a separate regression risk.
42. The user was offered v6 after browser and regression tests. Treat the repaired transforms and browser-driven testing as part of the design contract.

## Dual HTML comparison, then v7/v8 approach direction changes

43. User requested **two launchable HTML files in one ZIP**: one broad **v4-style** seven-profile mix and one limited **v5-style** three-profile mix, **both using the v6 bug fixes**. They were meant for a direct A/B comparison; both entry points are still included in this repository.
44. User then chose: **“limited motion works better.”** This is the strongest explicit endorsement of the limited set as the production default.
45. The user asked for **slightly more variation in travel direction**, but not more wobbling. v7 varied horizontal approaches up to about ±13px without reversing. The three landing styles stayed unchanged.
46. User then asked: **“let them come in from the sides, below, etc. Random directions. But try to make sure the first two cards come from and move in directions not too similar to each other.”** This produced v8, the current baseline.
47. **v8 implementation choices:** approach from eight compass sectors (N/NE/E/SE/S/SW/W/NW); a local 27–37 CSS px starting distance (not off-screen fly-ins); ±8° sector jitter; first pair constrained to at least ~127° separation despite jitter. The exact numeric bounds are assistant-selected to implement the user's desired variety and distinct initial pair.
48. The **settling phase stays identical** to the preferred profiles 04–06: position/rotation finish before subtle flattening to full opacity, no late correction, and no snap. The postcard placement shuffle, recycling, size, parallax, and content layout remain.
49. Latest response was positive and the user decided to hand off to a proper coding agent. **Current user request:** a repo-ready package with `AGENTS.md`, a full decision history, and high-resolution originals (which are currently missing from the available file set).

## Local workspace review setup — October 7, 2026

50. The user imported this handoff into the local `wedding-website/` workspace and explicitly confirmed the **v5 limited animation model** for now. This retains profiles 04, 05, and 06 with the later settling fixes and eight-direction approaches already present in `index.html`.
51. The user requested a stable `serve/` folder for review through an existing Caddy server managed elsewhere on the machine. The workspace-level folder uses relative symlinks to the canonical page and public runtime assets, so source edits appear on reload without an export step. Caddy configuration remains user-managed.

## Quiet settling refinement — October 8, 2026

52. The user reported that the final phase again surfaced prior complaints: visibly distinct animation phases and an overemphasized final drop as the air escapes. The explicit direction is to stop **really smoothly** and make that release **almost imperceptible**. This supersedes the earlier decision to retain the v8 settling curves unchanged; the preferred pool remains profiles 04, 05, and 06.
53. Audit found separate per-segment easing curves with mismatched travel velocities at contact, and a late scale increase in profile 05 (1.012 to 1.015) before flattening. The limited pool now samples a continuous quintic curve with zero endpoint velocity/acceleration, monotonic translation/yaw/scale/tilt, and full opacity at contact. Remaining scale release was reduced from 0.8–1.5% to 0.04–0.05%, with only 0.08–0.10° residual tilt. Numerical values and sampling density are implementation choices. Profile 06 still holds its exact contact pose, then releases by a barely visible amount. Entry distances/directions, placement, recycling, parallax, durations, and the historical mixed comparison retain their existing behavior.
54. Repository/asset checks and 432 actual JavaScript motion-builder cases passed in the system JavaScriptCore engine, including positive/negative resting angles, eight directions, hold continuity, monotonic scale/tilt, and bounded speed changes at initial and later arrival durations. Browser regression assertions were extended to measure velocity continuity and subpixel final release on a large postcard, with a larger desktop viewport added. Browser execution remains unverified locally: Playwright is unavailable, dependency download is network-blocked, and Chromium startup is denied by the sandbox.
55. The user requested Git tracking after `git status` reported no repository. The whole workspace, supplied original crops, starter archive, and review symlinks are captured in a separate `.git-data/` repository because this session cannot create the root `.git`. A one-time `.git` pointer created by the user enables ordinary Git commands. Baseline and animation-refinement commits preserve the imported runtime and the new changes separately.

## Separate photo library — October 8, 2026

56. The user supplied `Wedding_Photos_18_Archival_and_Web.zip` with 18 photo compositions, mostly photobooth photos of the couple, and requested them shuffled into the background while stored separately so the photo/postcard ratio can be adjusted. Only photo IDs **2, 6, 9, 13, and 18** are approved for use now.
57. Imported all provided masters and the original scan byte-for-byte into private `originals/photos/`. Only the selected photos' existing WebP display/thumbnail files are included in public `photos/`, with their full aspect ratios and printed borders retained. Their runtime catalog is separate from postcard metadata. `background-config.js` controls photo arrival share; **20% photos / 80% postcards is an initial implementation choice**, not a user-specified ratio.
58. The runtime shuffles each collection independently and chooses the arrival category by the configured share. It caches lookahead so retirement and the subsequent drop agree, and avoids immediate repeats on collection reshuffles. The same quiet v5 animations, sizing, placement, recycling, parallax, and reduced-motion support apply to photos. Asset checks cover the ten selected web derivatives and 19 unchanged archival images; seeded deck checks cover ratios, independent shuffle cycles, approved IDs, and lookahead stability.
59. The user additionally requires the first three arrivals on every page load to be postcards, followed by one photo, while the identities of all four remain random. This opening sequence takes precedence over the photo-share setting; the configured ratio applies only to subsequent random arrivals. Repeated lookahead must not advance the opening counter. Tests cover this sequence under multiple shares and 40 different page-load seeds.

## Mobile performance audit — October 8, 2026

60. The user reported occasional mobile scroll lag and requested inspection and
    applied improvements. Placement/retirement calculations now cache rotated
    screen-space geometry and scroll offsets, preserving the scoring and
    coverage math. Supporting browsers use native scroll timelines at the
    existing 18% ratio; the passive frame-batched fallback remains. Height-only
    mobile toolbar resizes no longer reshape all cards. Mobile blur radii were
    reduced while retaining translucent panels. Reduced motion now also
    disables parallax. These are implementation choices for the requested
    optimization, not new user-approved motion profiles.
61. Paired 6× CPU-throttled mobile Chromium measurements with 22 cards reduced
    placement median from 28.0ms to 0.8ms and p95 from 32.1ms to 3.2ms; native
    tabletop scroll style writes fell from 118 to zero over 120 frames.
    Real-asset browser tests cover native/fallback/reduced paths, resizing,
    page-height changes, retirement and navigation. Existing motion tests pass
    at mobile, laptop and larger desktop sizes; 40,000 coverage samples match
    the original equation. Physical-phone/Safari performance is not measured.
    See `docs/PERFORMANCE.md` for the method, evidence and reproduction steps.

## Markdown authoring and static generation — October 11, 2026

62. The user likes the visual direction and asked for simple Markdown content
    authoring with optional inline HTML, upper-level file inclusion, and static
    generation suitable for eventual Cloudflare Pages or similar. Python was
    initially preferred, with openness to another toolset.
63. After comparing a small Python builder, Pelican, and Eleventy, the user
    clarified that nearly all non-Markdown authoring will be left to the agent
    and authorized choosing the most pleasant human workflow. Eleventy was
    selected for established native build/watch/template tooling. The user
    approved execution, installed Node 24, and requested pauses only for needed
    human actions beyond the agent's access.
64. Eight Markdown blocks now assemble through a master `content/page.md` and
    native Eleventy collection into the existing limited HTML. Shared facts
    live in YAML, optional snippets use Nunjucks includes, and raw HTML remains
    supported. Home and Story retain dedicated templates. Builds produce
    synchronized tracked entry points; the existing Caddy symlinks stay intact.
    `make export` creates a separate public-only static folder. Placeholder
    copy, RSVP status, and motion/art behavior remain as before.
65. Content tests cover rendering/includes, validation, freshness, stable output,
    public export, native watch, last-good output, and recovery. Browser checks
    compare the original site at phone, laptop, and larger desktop sizes and
    exercise longer Markdown/HTML. The new long-table fixture identified a
    mobile grid-sizing issue; panels now allow shrinking so tables scroll inside
    them. This is a content-layout fix, not a change to animation direction.

66. Final checks pass after a clean locked dependency installation: content and
    watch tests, repository/assets, decks/opening sequence, placement geometry,
    motion curves, original-layout comparisons, rendered motion, and performance.
    Long content renders without page overflow at phone/laptop/large desktop.
    Original screenshots match apart from six one-channel-level background edge
    rounding pixels on the larger capture; text and geometry match exactly.
    Direct file export and existing Caddy HTTP bytes are verified. The user
    launched a dedicated Chromium outside the agent's macOS sandbox for CDP
    testing. Native Node watch avoids an optional FSEvents addon that initialized
    inside the sandbox without delivering file changes. No hosting change occurred.

## Intan's landing sketch — October 11, 2026

67. New user-directed mockup follows `AGENT-INBOX/Intan Idea 1 20261011.HEIC`:
    memorabilia now span the full width. The fixed cursive “We're getting” sits
    beside Closer, Sweeter, Luckier, Wilder moving upward through the viewport.
    The changing word has an additional italic slant. This explicitly supersedes
    the previous hero text container and two-card initial composition, while
    retaining the approved limited motion for subsequent arrivals.
68. The user requested work on a new rollback branch and confirmed putting the
    mockup directly on sitedev, formal wedding script, and a compact “Wilder”
    repeat-visit hero. Branch: `design/intan-landing`, previous version: `4143106`.
    Great Vibes is self-hosted with its OFL license. No remote font requests.
69. First normal visit has a four-viewport sticky hero. A non-sliding three-day
    cookie selects a one-screen repeat visit; completing the scroll and remaining
    idle for 30 seconds begins a fading word change every three seconds. Activity
    restores the scroll-selected word. Hidden/offscreen/reduced-motion views do
    not cycle. Navigation remains available to skip ahead.
70. Opening experiments compare balanced eight items (default), airy six, and
    coverage-selected loose eight. Balanced placement spreads items into jittered
    regions; all select fresh shuffled assets and rapidly fade at rest before the
    existing arrivals begin. Subsequent placement uses the full viewport.
71. Mobile navigation becomes one dropdown pill with quick 160ms opening,
    keyboard/focus support, Escape/outside closure, and a deliberately half-visible
    next row when a short viewport requires scrolling. Later content panels and
    wedding facts remain. This is a requested mockup, awaiting the couple’s
    visual feedback rather than recording approval of the finished design.

72. The user requested a small bottom-right replay icon for review, possibly
    temporary. It reloads the full opening and initial pile, preserves any pile
    comparison choice, and respects reduced motion.

## Opening scroll performance — October 11, 2026

73. The user reported frame drops on an iPhone 16 Pro with iOS 27 and clarified
    that they occur while scrolling through the opening words. The request was
    for substantial performance improvement while retaining the mockup.
74. Heading transforms now use native CSS scroll timelines where supported,
    with JavaScript responsible for word/idle state and a matching fallback.
    Scroll visibility no longer reads layout, idle activity avoids repeated timer
    replacement, and a ResizeObserver handles actual stage size changes rather
    than responding to every mobile toolbar resize.
75. Mobile removes backdrop blur and per-card filters, uses darker translucent
    panel fills and a painted 9% dimming overlay, and simplifies paper shadows.
    Background artwork selects existing smaller derivatives under a two-pixel
    density budget; foreground story artwork and source images are unchanged.
    Mobile retains up to 16 non-retiring cards with graceful oldest-card fades.
    Approved arrivals are unchanged; resting transforms become equivalent 2D
    rotations with actual runtime matrix continuity tested before cancellation.
76. A seeded DPR-3 Chromium comparison at 402×874/6× CPU throttling eliminates
    472 headline style writes, reduces intro main-thread task time from 85.06ms
    to 48.25ms, and reduces referenced-art RGBA estimates from 19.71 to 4.75MiB
    initially and 71.81 to 9.64MiB after a 20-arrival stress case. These measure
    browser work/pixel budgets, not physical-iPhone FPS or total process memory.
    Safari WebDriver could not start in this environment; phone review remains
    the authoritative smoothness check. Full motion, content and performance
    regressions pass; the landing suite covers native/fallback intermediate
    positions and preserved idle/repeat behavior.

## Mobile menu refinement — October 11, 2026

77. The user disliked the initial mobile dropdown appearance and requested a
    more professional treatment. The new iteration uses a wider matte-charcoal
    surface, larger warm serif labels, subtle dividers, and a small current-section
    checkmark. The trigger drops the tiny extra “Menu” label in favor of a clean
    SVG chevron and current section. This records an iteration for review, not
    approval of the new appearance.
78. The 160ms opening, all eight links, keyboard/Escape/outside closure and
    performance safeguards remain. Short-view height now accounts only for
    leading padding when clipping, so the bottom edge bisects an actual text
    label. Browser checks measure text bounds for this hint and verify the
    menu at 320px, 390px, 402px and short landscape widths; desktop navigation
    retains its presentation.

## Priority order for future creative choices

1. Wedding information and legibility > postcards as decoration > interesting animation technique.
2. **Subtle and smooth** > physics-like theatrics or conspicuous “wobble.” The card should never walk back toward a rest point after overshooting it.
3. **Limited profiles 04–06** are preferred; the seven-profile version is a comparison/reference only. Experiment-lab approval of 04–10 does *not* override the later narrow-pool preference.
4. **Varied direction** of approach (sides and below too) is desirable, with deliberately contrasting directions for the initial two cards, provided the travel remains short and calm.
5. Fully opaque resting postcards; semi-transparent legibility overlays; matte black base; rounded pill nav.
6. Preserve originals, quality and bandwidth. Full-resolution source media and web-ready derivatives serve different purposes.

## Not yet decided

Real copy/photography for the non-home tabs; exact venue and accommodations; RSVP service, data privacy and invitation flows; registry links; domain/hosting; final typography and visual polish; whether to adjust timings and coverage for mobile; analytics and consent. Do not invent these details.
