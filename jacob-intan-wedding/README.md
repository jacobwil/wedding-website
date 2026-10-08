# Jacob & Intan — wedding website

A static, responsive wedding website prototype for **Jakarta · July 3, 2027**. The art direction is a matte-black table receiving gently settling postcards exchanged over the relationship. The cards are a distinctive, unobtrusive background beneath readable wedding content.

## Open it

No build system or dependencies are required to view the site. The stable Caddy review root is `/Users/server/Documents/wedding-website/serve` (the sibling `../serve/` folder). Its relative symlinks follow changes to the canonical source and web assets immediately on reload, without copying files or running a build. The review folder serves the preferred **v5 limited motion** model; the mixed comparison remains in the source directory.

Open `index.html` directly, or run a local review server from this directory:

```sh
make serve
# open http://127.0.0.1:8000/
```

| File | Purpose |
| --- | --- |
| `index.html` | **Preferred current version**: three motion profiles, eight entry directions, and almost imperceptible final settling |
| `wedding-limited-v5-style.html` | Identical named entry point for the preferred version |
| `wedding-mixed-v4-style.html` | Seven-profile alternative retained for comparison; not the default |
| `script.js` / `styles.css` | Shared runtime and styling |
| `experiments/original-17-options/index.html` | First standalone animation carousel (17 studies) |
| `experiments/hybrids-11-13/index.html` | Focused hybrid-motion carousel |
| `PROJECT_HISTORY.md` | User decisions, likes/dislikes, rejected approaches and version history |
| `AGENTS.md` | Implementation instructions and regression traps for coding agents |
| `docs/ANIMATION_CONTRACT.md` | Motion behavior and invariant checks |
| `docs/ARCHITECTURE.md` | Code organization and current technical limitations |
| `docs/IMAGE_PROVENANCE.md` | Source/derivative distinction and image-transfer status |
| `originals/` | Reserved for original scans and unscaled crops **not yet available** |

## Current behavior

- Two postcards are present on load, one per side, with deliberately different approach directions.
- Subsequent postcards arrive on a randomized interval, shuffled through all 24 designs.
- The side selection prefers alternation (~80%), and placement favors uncovered space until around 70% coverage before accepting more overlap.
- Postcards retire/recycle as appropriate, avoiding two visible instances of the same design.
- The backdrop follows scrolling at a fraction of the foreground scroll movement (currently 18%).
- Desktop postcards reach approximately 432 CSS px on a ~1280 px wide laptop viewport and top out around 576 CSS px on wider desktops. Smaller screen rules apply on phones.
- The preferred motion pool contains only 04 Softer direct hybrid, 05 Longer perspective exhale and 06 Hold then flatten, in mixed order, with no immediate repeat of a profile.
- The approach begins 27–37 CSS px away from rest along any of eight compass directions, jittered by ±8°. Initial two directions are at least 127° apart after jitter.
- Cards become fully opaque and stop with no corrective bounce, yaw reversal or transform jump on cleanup. Reduced-motion users see a static composition.
- The limited profiles decelerate smoothly into contact, where opacity is already 1. Final flattening is only 0.04–0.05% scale and 0.08–0.10° tilt, without the former changes in easing or late scale growth.

## Development and checks

The project intentionally remains plain HTML/CSS/JavaScript, using the Web Animations API (WAAPI). This allows direct local preview and straightforward deployment to any static web host. The other sections currently have **editable placeholder copy** and RSVP does **not** submit data.

Static repository and image checks (Python standard library only):

```sh
python3 scripts/verify_repo.py
```

Motion-curve checks use Node.js when available, or the built-in JavaScriptCore
engine on macOS. They run the browser suite's keyframe checks without extra
Python dependencies:

```sh
python3 tests/test_motion_curves.py
```

These checks cover 432 direction/rotation/profile cases, smooth speed changes,
monotonic scale and tilt, and the exact hold. They supplement the browser suite;
they cannot verify rendered layout, image loading, or animation cleanup.

Browser animation regression tests use Playwright for Python and Chromium:

```sh
python3 -m pip install -r requirements-dev.txt
python3 -m playwright install chromium
python3 tests/test_motion_browser.py
```

If Chromium is installed by the operating system and Playwright-managed Chromium is unavailable, set `CHROMIUM_PATH=/path/to/chromium` before the test. The test covers the limited and mixed entry points, desktop/mobile/reduced-motion, sampled keyframe paths, initial direction separation and cleanup continuity. It does not replace manual visual review on the target laptop.

To import the true original archive once it is supplied (copies bytes; never resizes or recompresses):

```sh
python3 scripts/import_originals.py /path/to/input.zip --kind scans
# If there is a separate archive of original-size cropped JPEGs:
python3 scripts/import_originals.py /path/to/cropped-jpegs.zip --kind cropped
```

See `originals/README.md` before importing. Original files are missing from the accessible inputs in this handoff; **`images/` is not an original-source archive**.

## Handoff priorities

1. Obtain original-resolution scan/crop archives for preservation; do not extrapolate missing resolution from WebP assets.
2. Replace placeholder RSVP, Story, Where to Stay, Schedule, Registry, Travel and FAQ content with real, approved details.
3. Choose hosting and a privacy-conscious RSVP service with confirmed guest-data requirements.
4. Preserve the currently preferred limited animation character unless the couple requests changes. In particular, read `PROJECT_HISTORY.md` before making an animation change.

## Asset rights and privacy

The postcards are user-provided personal artwork/images, not a general-purpose public image library. Keep this repository private by default, confirm permissions before public redistribution, and inspect original scans for postal addresses or other personal details before publishing. No explicit license grant is implied by this bundle.
