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

## Opening-word scroll audit — October 11, 2026

The user reported frame drops specifically during the opening word scroll on
an iPhone 16 Pro running iOS 27. The primary change moves the four heading
transforms from JavaScript to native CSS scroll timelines, retaining the exact
travel and a JavaScript fallback. WebKit documents compositor-thread scroll
animations in [Safari 26.4 and later](https://webkit.org/blog/17862/webkit-features-for-safari-26-4/).
JavaScript handles index, completion and idle state; it no longer reads the hero
bounds during scrolling or rewrites transforms in the native path. Actual stage
size changes use ResizeObserver; visual-toolbar changes that leave `svh`
unchanged cause no reconfiguration. Idle activity updates one timestamp rather
than replacing a 30-second timeout for every pointer/scroll event.

The mobile rendering changes target both initial load and ongoing GPU pressure:

- No navigation/content backdrop blur on mobile. Slightly darker translucent
  backgrounds preserve contrast. [WebKit explains the additional passes used by
  backdrop filtering](https://webkit.org/blog/3632/introducing-backdrop-filters/).
- No mobile per-card saturation/brightness filter. A painted 9% black overlay
  retains dimming without filter surfaces; colors are slightly less desaturated.
  Paper shadows use a smaller kernel. Desktop styling retains its filters/blur.
- At rest cards use a 2D rotation equivalent to their final 3D pose, while all
  approved landing keyframes, durations, tilt and direction selection remain.
  Actual runtime cancellation tests compare all 16 DOMMatrix components across
  20 later arrivals per native/fallback case and find no discontinuity.
- Decorative mobile art uses the highest existing tier at or below a two-device-
  pixel budget, with the smallest tier as a floor. This caps background density,
  not text or foreground story quality. No derivatives or originals were edited.
- Mobile maintains 16 non-retiring items. Older settled items fade for 1.05s and
  are removed; landings are never interrupted to meet the limit. In-flight and
  fading items can briefly exceed the count. Desktop has no new count limit.

### Paired landing evidence

A seeded Chromium run at 402×874, DPR 3, uses real review assets and 6× CPU
throttling. After the eight-item opening it adds 20 arrivals, waits for settling
and retirement, then scrolls through the opening and back over 120 frames.
The baseline is commit `0441878`, immediately before this performance work.

| Measurement | Before | After |
| --- | ---: | ---: |
| Heading inline style writes during intro scroll | 472 | 0 |
| Hero bounds reads during measured scroll | 3 | 0 |
| Main-thread task time, total across scroll | 85.06ms | 48.25ms |
| Style recalculations | 237 | 128 |
| Referenced opening art RGBA estimate | 19.71MiB | 4.75MiB |
| Referenced retained art RGBA estimate | 71.81MiB | 9.64MiB |
| Retained cards after stress settling | 27 | 16 |
| Filtered cards on mobile | 27 | 0 |
| Resting cards using 3D transform syntax | 27 | 0 |

RGBA estimates use the actual pixel dimensions of each referenced source image
multiplied by four bytes. `naturalWidth` is unsuitable here because responsive
`srcset` returns density-corrected intrinsic sizes. These estimates describe an
image pixel budget, not measured process memory, GPU backing memory or cache
retention. Timing is one paired run, not a guarantee for a particular device.

Reproduce using the already-running external Chromium:

```sh
CHROMIUM_CDP_URL=http://127.0.0.1:9222 python tests/benchmark_landing_browser.py --baseline
CHROMIUM_CDP_URL=http://127.0.0.1:9222 python tests/benchmark_landing_browser.py
```

Private reports are in `.build/landing/performance-{before,after}.json`.
`make test-browser` covers content, curves/rendering, parallax, actual runtime
3D-to-2D cleanup, retirement and resizing; `make test-landing` covers native and
forced-fallback intermediate word positions, all viewports, 30-second idle,
three-second cycles, three-day return behavior, and static reduced motion.

Safari 27.0.1 is installed locally, but its WebDriver exited without creating a
session; no Safari or physical-iPhone performance result is claimed. The changes
are live on the existing review endpoint for the user's device check.
