# Jacob & Intan wedding website workspace

The imported project lives in `jacob-intan-wedding/`. Its
[project history](jacob-intan-wedding/PROJECT_HISTORY.md) and
[animation contract](jacob-intan-wedding/docs/ANIMATION_CONTRACT.md) preserve
the design decisions from the handoff.

## Current status

- Wedding: Jacob and Intan, Jakarta, July 3, 2027.
- Confirmed direction: **v5 limited motion**, using only profiles 04, 05, and 06,
  with the handoff's repaired settling behavior and short approaches from eight
  directions. `index.html` already selects this version.
- Plain HTML, CSS, and JavaScript; no build step. The 24 postcards have three
  web image tiers.
- Navigation and section placeholders are present. Real event copy and RSVP
  submission remain unfinished.

## Live review folder

Point the existing Caddy site's static root at:

```text
/Users/server/Documents/wedding-website/serve
```

`serve/` contains relative symlinks to the canonical HTML, shared JavaScript and
CSS, manifest, and web image directories in `jacob-intan-wedding/`. Source edits
are available on the next reload; there is no export step or watcher to run.
The historical mixed version, experiments, original artwork, and project
documentation are outside this folder.

For an optional local preview, run from `jacob-intan-wedding/`:

```sh
make serve
# http://127.0.0.1:8000/
```

Caddy is managed separately by the user.

## Persistent tailnet endpoint

The homelab Caddy container now serves the review folder persistently at local
`http://127.0.0.1:18114`. Its read-only parent-workspace bind preserves the
relative symlinks, so source edits appear on the next request. The intended
HTTPS URL is <https://sitedev.saola-mountain.ts.net> (`svc:sitedev`), available
to clients admitted by Tailscale permissions, without application auth or a
Tabula entry. Caddy was deployed and verified on 2026-10-07; privileged Serve
activation and tailnet browser confirmation remain pending. See
[homelab operation notes](/Users/server/homelab/docs/sitedev.md) for the exact
operator command, recovery, and deployment evidence.
