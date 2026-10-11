# Animation contract (limited v5 model, refined October 8, 2026)

## Preferred motion profiles

Current production choice is the **limited three-profile set** selected via `data-motion-set="limited"`:

- **04 · Softer direct hybrid:** restrained gravity-like approach followed by subtle 3D flattening.
- **05 · Longer perspective exhale:** the arrival occurs earlier, leaving more time for a slow flattening/scale release.
- **06 · Hold then flatten:** brief immobile contact phase, then the final tilt and opacity finish.

These are numbered from the **11+13 hybrid carousel**, not from the earlier 17-option carousel. See `experiments/hybrids-11-13/index.html` for the original named studies; the shipped website adds varied final rotation and entry vector and refines how the three styles finish. The seven-profile comparison is retained, but was judged too busy as a site background.

The October 8 review rejected visible phase changes and an emphasized final air-release drop. The limited profiles now share a sampled quintic approach with zero endpoint velocity and acceleration, so they decelerate into contact without restarting easing. Their existing contact timings and the exact hold in profile 06 remain. Opacity reaches 1 at contact; the remaining release is only 0.04–0.05% scale and 0.08–0.10° tilt. These numerical bounds are implementation choices intended to make that release almost imperceptible. Scale must decrease monotonically: the old profile 05 enlarged briefly before shrinking, which accentuated the final drop.

## October 11 landing mockup exception

The canonical page now has eight opening items that fade in at their final
resting transforms: 420ms fade, 85ms stagger, no travel or flattening during
this pile reveal. Selection remains three random postcards then one random
photo before the configured mix. Placement is stratified across the full width
with jitter. Later arrivals use the unchanged limited profiles below.
The two-card directional opening remains on the historical mixed comparison.

The table stays fixed for the three-screen scroll through Closer, Sweeter,
Luckier and Wilder; its existing 18% parallax starts after this opening.
Repeat visits within three days start at Wilder with no extended scroll.
Reduced motion has no scroll sequence, fades, cycling or parallax.
See `LANDING_MOCKUP.md` and `tests/test_landing_browser.py`.

## Position, direction, rotation

- Choose landing position on left/right with coverage-aware scoring, independently of incoming travel vector.
- Choose a random resting rotation (currently about ±7.5°) independent of incoming direction.
- Choose one of eight approach vectors (card starts above/below/left/right or diagonally), length 27–37 CSS px with jitter ±8° about sector center.
- For the first two cards, choose sector centers at least 135° apart. With independent ±8° jitter this ensures at least 127° actual separation. Thereafter choose freely.
- Translational x/y offsets must converge monotonically toward zero. Rotation must converge monotonically toward that card's final resting `z`, **never via 0° unless 0° is itself the destination**.
- As soon as translation reaches the landing point, subsequent keyframes keep exact x=y=0 while perspective (rotateX/Y) and slight scale release finish.

## Opacity, end state, clean-up

- Postcards are translucent while arriving, and finish **exactly at opacity 1**.
- Final `transform` is the exact chosen resting transform: translate(0,0), `rotate(finalDeg)`, zero perspective tilt, scale 1. There is no after-contact corrective yaw or sideways movement.
- Before WAAPI cancellation, write the final `transform`/`opacity` inline. The computed matrix must match before and after teardown within browser precision.
- A fully obscured postcard may be removed. A still-visible card should smoothly fade out before reuse; don't allow existing inline opacity to block `.is-retiring`.
- For reduced motion, no falling/fading loop is shown; the cards are statically arranged.
- Parallax remains exactly 18% of page scrolling in normal mode, with a native
  root scroll timeline where supported and a frame-batched JavaScript fallback.
  Reduced-motion mode also disables parallax. Mobile toolbar height changes
  must not reshape the card composition; orientation/width changes still do.

## Regression testing

`python3 tests/test_motion_curves.py` runs the same numerical curve assertions using Node.js or macOS JavaScriptCore, without Playwright dependencies. This provides repeatable curve verification when browser execution is unavailable, but does not replace rendered regression checks.

`python3 tests/test_motion_browser.py` samples keyframes and actual rendered DOM matrices with several positive/negative resting angles and all compass entry sectors, tests the initial pair direction separation, verifies no transform snap on cleanup, and checks page load/reduced motion. It also bounds approach speed changes and requires the final release to move the bounds of a large desktop postcard by less than half a CSS pixel. Run after **any** change to `pose()`, `K()`, profile builders, profile selection, entry vector generation, retirement CSS or resize/parallax behavior. Static checks: `python3 scripts/verify_repo.py`.

`python3 tests/test_performance_browser.py` additionally checks real image
loading, native and fallback parallax, fully static reduced motion, stable
mobile height-only resizing, orientation and page-height changes, and retirement.
`python3 tests/test_placement_geometry.py` compares cached coverage calculations
with the original rotated-rectangle equation across 40,000 samples.

## Rejected behaviors

- Small overshoot followed by a corrective move (earlier “phase 4” in the first v3 drop).
- Implicit reset of yaw to 0° in intermediate frames and return to a nonzero resting angle (v4/v5 bug).
- Independently randomized poses inside a supposedly stationary hold.
- Distinct easing stages with an abrupt stop, a late scale increase, or a conspicuous final flattening/shrink.
- Broad multi-style animation mix as the *preferred* live background. This remains a historical comparison, not a mandate to delete it.
- Card motion that dominates the landing message or looks like a digital wobble rather than paper settling.
