# Intan’s landing mockup

This mockup follows the original HEIC sketch preserved in the private workspace
`AGENT-INBOX/`. The user requested the existing review endpoint and a separate
branch: `design/intan-landing`. Previous working version: `4143106`.

## Review

- Default: https://sitedev.saola-mountain.ts.net/
- Replay the full scroll, even if its three-day cookie exists:
  https://sitedev.saola-mountain.ts.net/?intro=replay
- Airier six-item pile:
  https://sitedev.saola-mountain.ts.net/?intro=replay&pile=airy
- Looser coverage-selected eight-item pile:
  https://sitedev.saola-mountain.ts.net/?intro=replay&pile=loose

The replay parameter is only an explicit review override. Normal visits use a
cookie named `wedding_intro_seen` with `Max-Age=259200`, `SameSite=Lax`, and
`Secure` on HTTPS. Its expiry is not extended by return visits. Blocking cookies
means the full introduction may play on each load. Direct `file://` viewing still
works with no storage dependency. Hash links to later sections bypass the long
opening to reach their content immediately.

A small replay icon is fixed in the bottom-right corner as a temporary review
control. It reloads the full opening and reshuffles the initial pile, preserving
the current pile option. It leaves the three-day cookie expiry unchanged and
respects reduced motion.

## Composition and behavior

The viewport holds “We're getting” in formal Great Vibes lettering on the left,
with Closer, Sweeter, Luckier, Wilder on the right. Words follow the scroll
vertically through native CSS scroll timelines when supported, with the same
JavaScript fallback on older browsers; an additional seven-degree slant distinguishes the changing word.
The table and fixed phrase do not move during those three screens of travel.
After Wilder, the hero scrolls away and the existing 18% background parallax
begins. The navbar remains fixed. The top has no translucent text panel;
headline shadows use 25% black. Names, wedding announcement, city and date
remain below the script in the same viewport.

The chosen opening distributes eight shuffled items over four columns/two rows
on desktop and two columns/four rows on mobile, with position and rotation
jitter. Each fades for 420ms with an 85ms stagger at its final resting transform.
After 2.8 seconds, regular gentle arrivals begin. The existing independently
shuffled postcard/photo decks, opening three-postcard/one-photo selection,
retirement and limited 04–06 motion remain. Mobile now limits non-retiring
items to 16, committing flat 2D resting transforms and smaller decorative image
tiers. Mobile panels use darker translucency instead of background blur; see
`PERFORMANCE.md` for the October 11 audit. The airy option has six items;
loose uses ordinary coverage scoring instead of the initial strata. All are
compositions made from real approved artwork, not new generated placeholders.

At scroll completion, 30 seconds without pointer, touch, keyboard or scroll
activity begins fade replacements every three seconds. Cycling only runs while
the hero is visible and the document is foregrounded. Activity restores the
scroll-selected word and resets the idle delay. Repeat visitors get a one-screen
Wilder opening with the same idle behavior. Reduced motion has a single static
Wilder hero and eight static items, with no fade, cycle or parallax.

Mobile uses one navigation pill with a clean SVG chevron and current-section
label. The wider matte-charcoal dropdown uses warm serif labels, subtle dividers
and a small checkmark for the current section, without background blur. It
opens in 160ms, preserves the
eight labels/order, closes after selection or outside press, supports keyboard
navigation/Escape, and removes hidden links from the focus order. If scrolling
is needed, menu height is set to full rows plus half of the next row, bisecting
its label to hint at continuation.

## Implementation and verification

Source lives in `templates/panels/home.njk`, `templates/page.njk`, `styles.css`,
and `script.js`. The font and license are explicitly included in the public
export; `serve/fonts/` contains individual runtime links, keeping font source
notes and the original sketch private. Generated limited HTML entries remain
identical. No Caddy or Tailscale configuration change is needed.

Run `make build`, `make check`, `make test-content`, and `make test-browser`.
Run `CHROMIUM_CDP_URL=http://127.0.0.1:9222 make test-landing` to verify the exact
review endpoint with a fresh browser context. Landing screenshots and the
artifact-hashed report are kept in `.build/landing/`, outside public hosting.
The migration’s old screenshot-equality test is intentionally inappropriate
for this requested visual redesign; motion/asset/content invariants still apply.

To restore the prior design after saving current work, switch back to the prior
branch or restore the site’s runtime/templates/build support from `4143106`
and run `make build`. The existing Caddy root follows source edits on reload.

Verified October 11, 2026: phone 390×844, laptop 1280×800, desktop 1920×1080;
all four scroll stops, fixed prefix/table, first-visit and compact idle cycles,
three-day cookie expiry without extension, expired-cookie replay, shuffled
compositions and both alternatives, static/live reduced motion, all eight mobile
links, Escape/inert state, and partial-row scrolling. Standalone `file://` export
also passes font/image/menu loading at 320×568. Content/watch/export tests,
40,000 geometry samples, independent decks, 432 motion-builder cases and
rendered motion/performance suites pass. Exact HTTPS HTML/CSS/JS/font/license
bytes match source; internal sketch, Markdown and font notes return 404.
