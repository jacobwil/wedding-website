# Original-resolution postcard sources — NOT INCLUDED YET

The earlier workflow used an `input.zip` of full-resolution scans and full-resolution cropped JPEGs. Those original files are not available in the current project runtime. The included `images/*.webp` are 1200px-long-edge **web derivatives**, not original masters.

Place scans in `scans/` and unscaled cropped JPEGs in `cropped-full-resolution/`. Do not resave originals while importing. `scripts/import_originals.py` safely copies JPEG/TIFF/PNG input files out of a ZIP to one of these directories, preserving names; it does not perform cropping, resizing, encoding, EXIF stripping, or authenticity validation.

When publishing the site, **exclude this entire `originals/` directory** from publicly hosted files; originals can contain postal addresses/private messages and may be much larger than web imagery. Consider storing originals in private archival storage or Git LFS rather than a public Git repository.
