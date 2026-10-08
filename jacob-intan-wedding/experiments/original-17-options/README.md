# Postcard motion studies

Standalone interactive carousel containing **17 postcard landing animations** for Jacob and Intan's wedding website.

Open `index.html` in a modern browser. There is no build step or server dependency.

- The first option is a reference version of the existing v3 motion.
- Option 02, **Stop at touchdown**, keeps the movement through phase 3, holds that exact pose through phase 4, and fades from 88% to 100% opacity.
- Option 03, **Air-out shrink · 1.8%**, reaches final x/y/rotation at 72%; the last phase changes only uniform scale from 101.8% to 100% and opacity to 100%.
- Options 04–17 explore monotonic deceleration, perspective tilt, air drift, gravity/contact, early flutter, slow fading, and anisotropic compression.

Every option uses the same artwork and stable anchor point until you press “Different postcard.” Navigation is by on-screen arrows, numbered tab-strip, or keyboard arrow keys; Space replays. Playback speed is adjustable, and auto-advance is opt-in. Users with `prefers-reduced-motion` see each final pose without autoplay.

Technically, each transform is committed as the resting style before cancelling its Web Animations API timeline. This avoids the end-of-animation transform reset/class-removal problem observed in the original implementation. The v3 reference preserves the *animated correction* so it can be distinguished from a browser cleanup artifact.

All 24 medium-resolution WebP postcards are included and load on demand. The original complete wedding website is not changed.
