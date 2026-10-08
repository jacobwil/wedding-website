#!/usr/bin/env python3
"""Safely copy user-supplied original scans/crops from a ZIP, without image transformation."""
import argparse
from pathlib import Path, PurePosixPath
from zipfile import ZipFile
import shutil

ROOT = Path(__file__).resolve().parents[1]
ALLOWED = {'.jpg', '.jpeg', '.png', '.tif', '.tiff', '.heic', '.heif'}
MAX_UNCOMPRESSED = 2_000_000_000


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('archive', type=Path)
    parser.add_argument('--kind', choices=['scans', 'cropped'], required=True)
    args = parser.parse_args()
    dest = ROOT / 'originals' / ('scans' if args.kind == 'scans' else 'cropped-full-resolution')
    if not args.archive.is_file():
        parser.error(f'Archive not found: {args.archive}')
    imported = 0
    names = set()
    with ZipFile(args.archive) as zipfile:
        images = []
        total = 0
        for member in zipfile.infolist():
            if member.is_dir():
                continue
            name = PurePosixPath(member.filename.replace('\\', '/'))
            if name.is_absolute() or '..' in name.parts or not name.name:
                raise ValueError(f'Unsafe path in archive: {member.filename!r}')
            if name.suffix.lower() not in ALLOWED:
                continue
            # Reject symlink entries rather than following them.
            if (member.external_attr >> 16) & 0o170000 == 0o120000:
                raise ValueError(f'Symlink entry disallowed: {member.filename!r}')
            # Drop only the archive's common top folder if it has one? No: preserve
            # complete relative names/structure for traceability.
            if name.as_posix().lower() in names:
                raise ValueError(f'Case-insensitive duplicate member: {name}')
            names.add(name.as_posix().lower())
            total += member.file_size
            if total > MAX_UNCOMPRESSED:
                raise ValueError('Archive exceeds 2 GB uncompressed safety limit; inspect and import manually.')
            images.append((member, name))
        if not images:
            raise ValueError('No supported images found in ZIP.')
        # Fail before writing if any target already exists; do not clobber original bytes.
        targets = [(member, dest.joinpath(*name.parts)) for member, name in images]
        for member, target in targets:
            if target.exists():
                raise FileExistsError(f'Original exists (not overwriting): {target}')
        for member, target in targets:
            target.parent.mkdir(parents=True, exist_ok=True)
            with zipfile.open(member, 'r') as source, target.open('xb') as sink:
                shutil.copyfileobj(source, sink, 1024 * 1024)
            imported += 1
    print(f'Imported {imported} unmodified image files to {dest.relative_to(ROOT)}')
    print('Source authenticity and original scan resolution are NOT verified by this tool.')


if __name__ == '__main__':
    main()
