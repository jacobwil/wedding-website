# Jacob & Intan — wedding website

A static, responsive wedding website prototype for **Jakarta · July 3, 2027**. The art direction is a matte-black table receiving gently settling postcards exchanged over the relationship. The cards are a distinctive, unobtrusive background beneath readable wedding content.

## Open it

No dependencies are required to view the generated HTML. Authoring uses
Eleventy: edit Markdown in `content/sections/`, then run `make build` or leave
`make watch` running. The stable Caddy review root is
`/Users/server/Documents/wedding-website/serve` (the sibling `../serve/`). Its
relative symlinks follow generated HTML and web assets on reload without copying.
The review folder serves **v5 limited motion**; the mixed comparison remains in
the source directory.

See [Editing the content](docs/EDITING_CONTENT.md). After installing Node 24,
`make setup` installs the pinned, locked npm dependencies on a fresh checkout.
The existing Mac's Homebrew Node path is handled by the Makefile.

```sh
make build   # Regenerate both limited HTML files
make watch   # Rebuild on save; reload the existing review page
make export  # Produce a self-contained public dist/ for future hosting
make check   # Detect stale generated HTML
```

Open `index.html` directly, or run a local review server from this directory:

```sh
make serve
# open http://127.0.0.1:8000/
```

| File | Purpose |
| --- | --- |
| `content/sections/*.md` | Editable prose and section labels, with Markdown and HTML support |
| `content/_data/site.yaml` | Shared names, date, city, and browser-title suffix |
| `content/page.md` | Page order and section inclusion; navigation uses the same order |
| `templates/` / `eleventy.config.js` | Existing presentation and static build configuration |
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

The canonical landing page now follows Intan’s October 11 sketch: a full-width
pile beneath formal cursive “We’re getting Closer / Sweeter / Luckier / Wilder.”
The phrase and table stay fixed during the first-visit scroll. Supporting
browsers animate the words through native CSS scroll timelines; older browsers
use the equivalent fallback. A three-day cookie
shortens repeat visits to “Wilder”; after completion, 30 seconds of inactivity
starts three-second fading replacements while the hero is visible. Reduced
motion uses a static one-screen opening. Mobile navigation opens from one pill.
See [Landing mockup](docs/LANDING_MOCKUP.md) for comparison links and rollback.

- Eight items rapidly fade into a shuffled, distributed initial pile. The first three selected are postcards, the fourth a photo; the configured mix supplies the remaining four. The historical mixed page keeps the previous two-card opening.
- The opening pile stays unchanged while the hero is visible. Subsequent cards arrive as you scroll through the content below it, with a gentle minimum interval and no continuous idle loop. The historical mixed page keeps its timer loop. Collections of 24 postcards and five approved photos shuffle independently.
- The side selection prefers alternation (~80%), and placement favors uncovered space until around 70% coverage before accepting more overlap.
- Postcards retire/recycle as appropriate, avoiding two visible instances of the same design. Mobile limits non-retiring background items to 16 and uses smaller decorative image tiers; the initial eight-item pile stays intact.
- The backdrop follows scrolling at 18% of the foreground movement, using a native scroll timeline where supported and a passive, frame-batched fallback elsewhere. Reduced-motion compositions remain static while scrolling.
- Desktop postcards reach approximately 432 CSS px on a ~1280 px wide laptop viewport and top out around 576 CSS px on wider desktops. Smaller screen rules apply on phones.
- The preferred motion pool contains only 04 Softer direct hybrid, 05 Longer perspective exhale and 06 Hold then flatten, in mixed order, with no immediate repeat of a profile.
- The approach begins 27–37 CSS px away from rest along any of eight compass directions, jittered by ±8°. Initial two directions are at least 127° apart after jitter.
- Cards become fully opaque and stop with no corrective bounce, yaw reversal or transform jump on cleanup. Reduced-motion users see a static composition.
- The limited profiles decelerate smoothly into contact, where opacity is already 1. Final flattening is only 0.04–0.05% scale and 0.08–0.10° tilt, without the former changes in easing or late scale growth.

## Photos and background mix

Photos **2, 6, 9, 13, and 18** from the uploaded photo archive are included.
Their public WebP files are stored separately in `photos/`; archival masters
and the source scan are preserved in `originals/photos/` outside the review root.

Change `photoShare` in [`background-config.js`](background-config.js) to adjust
the ratio after the opening sequence. Every load starts with three randomly
chosen postcards followed by one randomly chosen photo. The starting value
is `0.20`: approximately one photo per five later arrivals. The mix is
independent of each collection's size. See
[`docs/PHOTO_LIBRARY.md`](docs/PHOTO_LIBRARY.md) for imports and preservation.

## Development and checks

The generated runtime remains plain HTML/CSS/JavaScript, using WAAPI. Eleventy
runs only during authoring/builds; it adds no client framework or running server.
Sections still have placeholder copy and RSVP does **not** submit data.

Content/build tests use Node's built-in runner and isolated temporary fixtures:

```sh
make test-content
make check
```

They check Markdown/HTML, nested includes, errors and recovery, shared facts,
watch invalidation, deterministic output, and independent public-only export.

Static repository and image checks (Python standard library only):

```sh
python3 scripts/verify_repo.py
python3 tests/test_background_deck.py
python3 tests/test_placement_geometry.py
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
python3 tests/test_performance_browser.py
```

If Chromium is installed by the operating system and Playwright-managed Chromium is unavailable, set `CHROMIUM_PATH=/path/to/chromium` before the test. The test covers the limited and mixed entry points, desktop/mobile/reduced-motion, sampled keyframe paths, initial direction separation and cleanup continuity. It does not replace manual visual review on the target laptop.

`make test-browser` runs content/export, motion, and performance browser checks,
using the workspace virtual environment when available. `make test-landing` checks the landing sequence and cookie against the existing Caddy endpoint; it needs tailnet access. A compatible cached
Chromium on this Mac is detected if Playwright's expected binary is missing.
For the migration's original-design comparison, `make test-migration-browser`
also checks geometry and screenshots against commit `b2fc2ae`; this special check
is not intended after deliberate copy/design changes.

If macOS denies launching Chromium inside the agent sandbox, start a dedicated
browser in a regular Terminal with remote debugging on loopback port 9222 and
a separate profile, then run:

```sh
CHROMIUM_CDP_URL=http://127.0.0.1:9222 make test-browser
```

The tests create/close their own browser contexts and leave that external browser
running. Content screenshots and the artifact-hashed result are in private
`.build/browser/`, outside both the review root and export.

The October 11 opening-scroll audit adds native word timelines, equivalent 2D
resting card poses and lower mobile rendering/image costs. See
[performance evidence and limits](docs/PERFORMANCE.md).

The performance browser test loads the actual public review assets through
Playwright routing, without a preview server. It checks native/fallback/reduced
parallax, mobile toolbar and orientation resizes, image loading, retirement, and
live reduced-motion changes, and prints a seeded benchmark with 6× CPU throttling.
See [`docs/PERFORMANCE.md`](docs/PERFORMANCE.md) for measurements and limits.

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
