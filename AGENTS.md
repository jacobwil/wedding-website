# Wedding website workspace

The site source is in `jacob-intan-wedding/`. Read and follow that directory's
`AGENTS.md`, `README.md`, `PROJECT_HISTORY.md`, and `docs/ANIMATION_CONTRACT.md`
before changing the site. The history contains the couple's approved direction
and rejected animation behavior.

The user confirmed the **v5 limited animation model**, with only profiles
04 Softer direct hybrid, 05 Longer perspective exhale, and 06 Hold then flatten.
Keep `index.html` and `wedding-limited-v5-style.html` synchronized.

`serve/` is the stable review root for the user's existing Caddy server. Its
relative symlinks point into the source directory, so edits appear on reload
without a build or copy step. Edit the source files rather than replacing the
links. Link any new public runtime files into `serve/` when needed; new files
inside its linked image directories are available automatically. Keep source
archives, originals, experiments, internal documentation, and guest data out
of this review root.

## Persistent tailnet review hosting

Homelab ingress Caddy serves `serve/` on loopback port 18114 with a read-only
workspace bind preserving its relative symlinks. The intended persistent HTTPS
endpoint is `https://sitedev.saola-mountain.ts.net` (`svc:sitedev`). The user
explicitly requested no application auth, no extra security protection, and
no Tabula entry; applicable Tailscale permissions control access. Source edits
appear on the next request without a build or copy. Do not run a temporary
preview server to provide this endpoint.

On 2026-10-07 Caddy was deployed and verified healthy; HTML, CSS, JavaScript,
manifest and all image tiers matched source bytes over HTTP. Privileged
Tailscale Serve activation remains pending because `server` was denied by the
daemon. The activation command, lifecycle and current evidence are recorded
in `/Users/server/homelab/docs/sitedev.md`; read that before hosting changes.
Keep guest data and internal files out of `serve/` and its public targets.
