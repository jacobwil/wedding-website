# Jacob & Intan wedding website workspace

The imported project lives in `jacob-intan-wedding/`. Its
[project history](jacob-intan-wedding/PROJECT_HISTORY.md) and
[animation contract](jacob-intan-wedding/docs/ANIMATION_CONTRACT.md) preserve
the design decisions from the handoff.

## Current status

- Intan’s landing mockup is on `design/intan-landing`; [replay the opening](https://sitedev.saola-mountain.ts.net/?intro=replay) and see [the mockup notes](jacob-intan-wedding/docs/LANDING_MOCKUP.md).
- Wedding: Jacob and Intan, Jakarta, July 3, 2027.
- Confirmed direction: **v5 limited motion**, using only profiles 04, 05, and 06,
  with short approaches from eight directions. The October 8 refinement smooths
  the stop and reduces the final flattening to almost imperceptible motion.
  `index.html` selects this version.
- Markdown sections assembled with Eleventy; the public runtime remains plain
  HTML, CSS, and JavaScript. The 24 postcards have three web image tiers.
- Selected photo IDs 2, 6, 9, 13, and 18 have a separate photo library. Adjust
  `photoShare` in `jacob-intan-wedding/background-config.js` (initially 0.20)
  for arrivals after the opening three random postcards and one random photo.
- Navigation and section placeholders are present. Real event copy and RSVP
  submission remain unfinished.

## Live review folder

Point the existing Caddy site's static root at:

```text
/Users/server/Documents/wedding-website/serve
```

`serve/` contains relative symlinks to the canonical HTML, shared JavaScript and
CSS, manifest, and web image directories in `jacob-intan-wedding/`. Run
`make build` there after Markdown/template edits, or leave `make watch` running.
Generated HTML and runtime asset changes are available on the next reload
without copying into `serve/`.
The historical mixed version, experiments, original artwork, and project
documentation are outside this folder.

For an optional local preview, run from `jacob-intan-wedding/`:

```sh
make serve
# http://127.0.0.1:8000/
```

Caddy is managed separately by the user.

## Editing and static export

Start with [the editing guide](jacob-intan-wedding/docs/EDITING_CONTENT.md).
Ordinary copy lives in `jacob-intan-wedding/content/sections/*.md`; shared facts
live in its `content/_data/site.yaml`. Node 24 and `make setup` install locked
Eleventy dependencies on a fresh checkout. `make export` creates a public-only
`dist/` for future Cloudflare Pages or another static host.

## Git history

The original site is preserved on `main`; the landing mockup uses `design/intan-landing`, including supplied original crops and the
review symlinks. Git metadata lives in `.git-data/`, which is ignored. Local
development artifacts and credentials are ignored; source artwork is tracked.

The agent's sandbox cannot create the root `.git` pointer. To enable ordinary
`git status`, `git diff`, and `git commit`, run this once from the workspace in
your terminal (only while `.git` is absent):

```sh
printf 'gitdir: .git-data\n' > .git
```

Until that pointer exists, commands work with the explicit repository path:

```sh
git --git-dir=.git-data --work-tree=. status
```

## Persistent tailnet endpoint

The homelab Caddy container now serves the review folder persistently at local
`http://127.0.0.1:18114`. Its read-only parent-workspace bind preserves the
relative symlinks, so source edits appear on the next request. The verified
HTTPS URL is <https://sitedev.saola-mountain.ts.net> (`svc:sitedev`), available
to clients admitted by Tailscale permissions, without application auth or a
Tabula entry. Caddy was deployed and verified on 2026-10-07; the HTTPS endpoint and tailnet browser rendering were verified on October 11, 2026. See
[homelab operation notes](/Users/server/homelab/docs/sitedev.md) for the exact
operator command, recovery, and deployment evidence.
