# Animation contract (as of v8)

## Preferred motion profiles

Current production choice is the **limited three-profile set** selected via `data-motion-set="limited"`:

- **04 · Softer direct hybrid:** restrained gravity-like approach followed by subtle 3D flattening.
- **05 · Longer perspective exhale:** the arrival occurs earlier, leaving more time for a slow flattening/scale release.
- **06 · Hold then flatten:** brief immobile contact phase, then the final tilt and opacity finish.

These are numbered from the **11+13 hybrid carousel**, not from the earlier 17-option carousel. See `experiments/hybrids-11-13/index.html` for the original named studies; the shipped website adds varied final rotation and entry vector without changing their general settle. The seven-profile comparison is retained, but was judged too busy as a site background.

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

## Regression testing

`python3 tests/test_motion_browser.py` samples keyframes and actual rendered DOM matrices with several positive/negative resting angles and all compass entry sectors, tests the initial pair direction separation, verifies no transform snap on cleanup, and checks page load/reduced motion. Run after **any** change to `pose()`, `K()`, profile builders, profile selection, entry vector generation, retirement CSS or resize/parallax behavior. Static checks: `python3 scripts/verify_repo.py`.

## Rejected behaviors

- Small overshoot followed by a corrective move (earlier “phase 4” in the first v3 drop).
- Implicit reset of yaw to 0° in intermediate frames and return to a nonzero resting angle (v4/v5 bug).
- Independently randomized poses inside a supposedly stationary hold.
- Broad multi-style animation mix as the *preferred* live background. This remains a historical comparison, not a mandate to delete it.
- Card motion that dominates the landing message or looks like a digital wobble rather than paper settling.
