#!/usr/bin/env python3
"""Preserve photo masters and copy only selected, metadata-free web derivatives."""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]


def fingerprint(data):
    return {'size_bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}


def webp_dimensions(data):
    if data[:4] != b'RIFF' or data[8:12] != b'WEBP':
        raise ValueError('Expected a WebP derivative')
    dimensions = None
    offset = 12
    while offset + 8 <= len(data):
        kind = data[offset:offset + 4]
        size = int.from_bytes(data[offset + 4:offset + 8], 'little')
        chunk = data[offset + 8:offset + 8 + size]
        if len(chunk) != size:
            raise ValueError('Truncated WebP chunk')
        if kind in (b'EXIF', b'XMP '):
            raise ValueError('Public derivatives must omit EXIF/XMP metadata')
        if kind == b'VP8 ' and chunk[3:6] == b'\x9d\x01\x2a':
            dimensions = (int.from_bytes(chunk[6:8], 'little') & 0x3fff,
                          int.from_bytes(chunk[8:10], 'little') & 0x3fff)
        elif kind == b'VP8L' and chunk[0] == 0x2f:
            bits = int.from_bytes(chunk[1:5], 'little')
            dimensions = ((bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1)
        elif kind == b'VP8X':
            dimensions = (int.from_bytes(chunk[4:7], 'little') + 1,
                          int.from_bytes(chunk[7:10], 'little') + 1)
        offset += 8 + size + (size % 2)
    if not dimensions or not all(dimensions):
        raise ValueError('Missing WebP dimensions')
    return dimensions


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('archive', type=Path)
    parser.add_argument('--ids', nargs='+', type=int, default=[2, 6, 9, 13, 18])
    args = parser.parse_args()
    selected = sorted(set(args.ids))
    planned = {}
    catalog = []
    originals = []
    photos = []
    with ZipFile(args.archive) as archive:
        def read(name):
            path = PurePosixPath(name)
            if path.is_absolute() or '..' in path.parts or '\\' in name:
                raise ValueError(f'Unsafe archive path: {name}')
            member = archive.getinfo(name)
            if (member.external_attr >> 16) & 0o170000 == 0o120000:
                raise ValueError(f'Archive symlink: {name}')
            return archive.read(member)

        manifest = json.loads(read('manifest.json'))
        by_id = {item['id']: item for item in manifest}
        if len(by_id) != len(manifest) or not set(selected) <= by_id.keys():
            raise ValueError('Duplicate or missing photo IDs')
        # These remain private. Copy bytes; never resize or re-encode masters.
        archival_names = [item['master'] for item in manifest]
        archival_names += [name for name in archive.namelist()
                           if name.startswith('sources/') and not name.endswith('/')]
        for name in archival_names:
            if not name.startswith(('masters/', 'sources/')):
                raise ValueError(f'Unexpected archival path: {name}')
            data = read(name)
            dest = ROOT / 'originals' / 'photos' / name
            planned[dest] = data
            originals.append({'path': dest.relative_to(ROOT).as_posix(), **fingerprint(data)})
        for name in ('manifest.json', 'README.md', 'quality_report.csv'):
            planned[ROOT / 'originals' / 'photos' / name] = read(name)
        for photo_id in selected:
            item = by_id[photo_id]
            tiers = {}
            for key, folder in [('thumbnail', 'thumbnails'), ('display', 'display')]:
                data = read(item[key])
                width, height = webp_dimensions(data)
                dest = ROOT / 'photos' / folder / PurePosixPath(item[key]).name
                planned[dest] = data
                tiers[key] = {'path': dest.relative_to(ROOT).as_posix(),
                              'width': width, 'height': height, **fingerprint(data)}
            thumb, display = tiers['thumbnail'], tiers['display']
            runtime = {'id': f'photo-{photo_id:02}', 'photoId': photo_id, 'kind': 'photo',
                       'thumb': thumb['path'], 'tw': thumb['width'],
                       'full': display['path'], 'fw': display['width'],
                       'width': display['width'], 'height': display['height']}
            catalog.append(runtime)
            photos.append({'photo_id': photo_id, 'runtime': runtime, **tiers})
        planned[ROOT / 'photos' / 'catalog.js'] = (
            '// Selected photo derivatives; regenerate with scripts/import_photos.py.\n'
            'window.WEDDING_PHOTOS = ' + json.dumps(catalog, indent=2) + ';\n').encode()
        inventory = {'archive': args.archive.name, **fingerprint(args.archive.read_bytes()),
                     'selected_ids': selected, 'photos': photos, 'originals': originals}
        planned[ROOT / 'docs' / 'photo-inventory.json'] = (
            json.dumps(inventory, indent=2) + '\n').encode()
        generated = {ROOT / 'photos' / 'catalog.js', ROOT / 'docs' / 'photo-inventory.json'}
        # Check every destination first. Existing originals are never replaced.
        for dest, data in planned.items():
            if dest.exists() and dest not in generated and dest.read_bytes() != data:
                raise FileExistsError(f'Existing file differs; refusing to overwrite: {dest}')
        for dest, data in planned.items():
            if not dest.exists():
                dest.parent.mkdir(parents=True, exist_ok=True)
                with dest.open('xb') as output:
                    output.write(data)
            elif dest in generated and dest.read_bytes() != data:
                dest.write_bytes(data)
    print(f'Preserved {len(originals)} original images byte-for-byte outside the review root.')
    print(f'Imported web derivatives for photos {selected}; no resizing or recompression.')


if __name__ == '__main__':
    main()
