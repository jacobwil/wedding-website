# Mobile scrolling performance — October 8, 2026

The user reported occasional mobile scroll lag and requested an audit and fixes.
The limited v5 landing profiles, durations, entry vectors, image tiers, shuffled
opening sequence, placement scoring and 18% parallax ratio are retained.

## Changes

- Coverage calculations previously read `scrollY` and recomputed sine/cosine
  for every sample in each of 52 candidate placements. They now snapshot the
  scroll offset and rectangle geometry once per operation, and reuse the
  viewport's sampling grid. Retirement coverage uses the same optimization.
- Supporting browsers use a native root scroll timeline for the tabletop.
  JavaScript updates its endpoint when the body border box or viewport changes,
  including content/padding changes. Other browsers retain the passive,
  frame-batched handler. See [MDN's root scroll timeline documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timeline/scroll).
- Mobile height-only resizes no longer rewrite every card's position,
  dimensions and image `sizes`. Width/orientation changes still reflow cards.
- Mobile navigation blur is 12px instead of 22px; announcement and section
  panels use 8px instead of 21px/16px. Translucency and legibility are retained;
  desktop styling is unchanged.
- Reduced motion disables scrolling parallax as well as landing animations
  and timed drops. The previous implementation still moved the background.

## Paired measurements

The same seeded headless Chromium scenario loaded real public image bytes at
390×844, DPR 3, with 6× CPU throttling. Normal-motion scenarios had 22 active
cards. Placement measures 60 selections; scrolling moves down and back up
over 120 animation frames. These numbers are one paired run, not thresholds.

| Measurement | Before | After |
| --- | ---: | ---: |
| Placement median, native-capable browser | 28.0ms | 0.8ms |
| Placement p95, native-capable browser | 32.1ms | 3.2ms |
| Tabletop inline style writes during scrolling | 118 | 0 |
| Scroll main-thread task time, total | 229ms | 174ms |
| Fallback placement median | 24.7ms | 1.2ms |
| Reduced-motion tabletop style writes during scrolling | 118 | 0 |

The largest measured gain is removing repeated browser-property reads from
placement loops. The native path also eliminates scroll-handler transform
writes. The fallback still writes at most once per animation frame.

## Verification and limits

- Repository checks passed, including unchanged web/archival image fingerprints
  and identical canonical/named limited HTML.
- Deck checks passed for ratios, opening order, independent shuffle cycles
  and stable reuse previews.
- 40,000 rotated-rectangle samples matched the original coverage equation.
- Motion curves passed 432 cases; Chromium rendering/cleanup passed at
  1280×800, 1920×1080 and 390×844, including static reduced motion and the
  historical seven-profile comparison.
- Real-asset browser checks passed native, forced fallback and reduced-motion
  scrolling, toolbar/orientation resizing, page-height/padding changes,
  retirement fades, live motion-preference changes and all eight nav links.
- Mobile screenshots retained readable text and the composition. Existing
  Caddy HTTP responses for HTML, JavaScript and CSS matched source bytes.

Headless emulation does not measure a phone's GPU, Safari or thermal behavior;
the timing reduction is not a physical-device FPS guarantee. A device review
should include continued scrolling after enough arrivals to build the table.

Run `python3 tests/test_performance_browser.py` with Playwright and Chromium.
Set `CHROMIUM_PATH` to an existing browser when needed. The suite routes only
the public `serve/` tree in-process, so it needs no temporary preview server.
`--screenshots /tmp/wedding-perf-review` saves an optional mobile screenshot.
For a paired baseline, put the old runtime in `/tmp/wedding-script-before.js`
and `/tmp/wedding-styles-before.css`, then run with `--baseline`. Baseline mode
prints diagnostic timings without requiring the new behaviors.
