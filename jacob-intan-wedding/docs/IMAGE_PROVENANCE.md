# Artwork inventory, resolution and provenance

## What is included

There are **24 distinct postcard designs**, each preserved as three separately encoded WebP derivatives in the site root:

- `thumbnails/` — longest side around **480 px**, used for smaller presentation.
- `medium/` — longest side around **960 px**, optimized for regular/Retina website display.
- `images/` — longest side up to **1200 px**, the **highest resolution available in this handoff**, intended for near-full postcard display on Retina screens. Some portrait images have a shorter native-width dimension.

They are referenced in `manifest.json`, and `docs/asset-inventory.json` contains exact pixel dimensions, sizes and SHA-256 fingerprints for each derivative. The initial image workflow verified perceptual quality against *resized originals*, not against bit-for-bit source pixels. The 1200px WebP assets are **lossy and resized**. They must not be described as original full-resolution JPEGs.

## What is missing

The earlier image-preparation conversation referenced an uploaded **`input.zip` containing full-resolution scans**, followed by full-resolution cropped JPEGs. Neither that original ZIP nor the original-size JPEG crop archive is present among the currently accessible project files. Earlier assistant responses stated that high-resolution sources were kept, but this handoff can only attest to the files actually available now. The image source archive is not reconstructable from these WebP assets.

To fully satisfy an archival handoff, obtain those original files and preserve them at:

- `originals/scans/` — raw user-provided scan bytes, ideally preserving the `input.zip` original somewhere outside the repository as well.
- `originals/cropped-full-resolution/` — full-resolution JPEG crops produced from the scans without resizing.

Use `python3 scripts/import_originals.py path/to/input.zip --kind scans` (or `--kind cropped` for the crop archive), which copies files without re-encoding. The import tool does **not** prove whether the files are the highest resolution or faithfully cropped; compare file dimensions/contents with the actual source scan when available. Do not upscale, sharpen or relabel WebP derivatives to fake the missing masters.

## Publishing and privacy

The separately supplied `Wedding_Photos_18_Archival_and_Web.zip` adds a photo
library. All 18 provided photo masters and the original scan are preserved
byte-for-byte in `originals/photos/`. Only photo IDs 2, 6, 9, 13, and 18 have
public web derivatives in `photos/`, copied without re-encoding. This archive
does not supply the missing original postcard scans. See `PHOTO_LIBRARY.md`
and `photo-inventory.json` for the photo import and checksums.

These are personal postcards exchanged over a relationship. Some original scans may show writing, names, postal addresses or identifying marks; inspect before making originals publicly accessible. The website should serve **only the web derivatives**, not files from `originals/`. Keep source media out of a publicly served directory when deploying; a repository root used as static document root would expose `originals/` if filled and left within that root. Use a deploy allowlist or move archival files to private storage before launch.

User-provided images may include copyright-bearing postcard artwork; the repo should remain private by default unless sharing rights are confirmed.
