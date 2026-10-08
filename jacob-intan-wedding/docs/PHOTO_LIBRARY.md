# Photo library and background ratio

The couple supplied `Wedding_Photos_18_Archival_and_Web.zip`. Only photos
**2, 6, 9, 13, and 18** are enabled in the background. Their composition,
printed borders, and aspect ratios are preserved.

## Adjust the mix

Edit `photoShare` in `background-config.js`:

```js
window.WEDDING_BACKGROUND = {
  photoShare: 0.20
};
```

`0.20` means approximately 20% photo arrivals and 80% postcard arrivals.
Every load starts with **three randomly chosen postcards, then one randomly
chosen photo**. The first four identities shuffle on each load; this opening
sequence applies regardless of the configured ratio. The share controls all
subsequent arrivals: use `0` for later postcards only, `0.5` for an even mix,
or `1` for later photos only.
This controls arrival frequency; narrow photo strips naturally occupy less
background area than wider postcards. Refresh the review page after changing
the setting.

Both collections shuffle independently without repeating an image before
its collection is exhausted. Each reshuffle avoids repeating its previous
last image. The next chosen image is cached so the existing retirement fade
and subsequent arrival always refer to the same image. Photos use the same
limited motion, placement, parallax, sizing, and reduced-motion behavior as
postcards. `data-kind="photo|postcard"` identifies the collection in the DOM.

## Files and preservation

- `photos/display/` and `photos/thumbnails/`: only the five selected photos,
  copied from the supplied 1200px/480px WebP derivatives without recompression.
  They contain no EXIF or XMP chunks.
- `photos/catalog.js`: selected photo metadata, separate from the postcard
  list in `script.js`.
- `originals/photos/masters/`: all 18 provided JPEG masters, preserved exactly.
- `originals/photos/sources/`: the provided original scan, preserved exactly.
- `originals/photos/manifest.json`, `README.md`, and `quality_report.csv`:
  original archive documentation, copied without changes.
- `docs/photo-inventory.json`: actual dimensions and SHA-256 fingerprints for
  the imported photos and originals.

The uploaded ZIP and archival files are outside `serve/`. Only `photos/` and
`background-config.js` are linked into the stable review root, alongside the
existing postcard web assets. Unselected photo derivatives were not imported.

The import can be reproduced from the source directory with:

```sh
python3 scripts/import_photos.py ../Wedding_Photos_18_Archival_and_Web.zip --ids 2 6 9 13 18
```

Existing originals must match the archive bytes; they are never overwritten.
Generated catalog/inventory files may be rebuilt. Run these checks after a
catalog or ratio change:

```sh
python3 scripts/verify_repo.py
python3 tests/test_background_deck.py
python3 tests/test_motion_curves.py
```
