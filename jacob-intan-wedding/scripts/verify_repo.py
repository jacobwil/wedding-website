#!/usr/bin/env python3
"""Dependency-free repository integrity check, including WebP derivative hashes."""
from pathlib import Path
from html.parser import HTMLParser
import hashlib
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
EXPECTED_TABS = ['Home', 'RSVP', 'Story', 'Where to Stay', 'Schedule', 'Registry', 'Travel', 'Q & A']

class PageLinks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.hrefs = []
        self.ids = set()
        self.names = []
        self.record = False
        self.motion_set = None
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'html': self.motion_set = a.get('data-motion-set')
        if a.get('id'): self.ids.add(a['id'])
        if tag == 'a' and 'nav-link' in a.get('class', '').split():
            self.hrefs.append(a.get('href'))
            self.record = True
            self.names.append('')
    def handle_data(self, data):
        if self.record: self.names[-1] += data
    def handle_endtag(self, tag):
        if tag == 'a': self.record = False


def verify():
    failures = []
    def check(value, message):
        if not value: failures.append(message)

    required = ['index.html','wedding-limited-v5-style.html','wedding-mixed-v4-style.html','script.js', 'styles.css', 'AGENTS.md','PROJECT_HISTORY.md','manifest.json','docs/asset-inventory.json']
    for name in required: check((ROOT/name).is_file(), f'Missing: {name}')
    if (ROOT/'index.html').exists() and (ROOT/'wedding-limited-v5-style.html').exists():
        check((ROOT/'index.html').read_bytes() == (ROOT/'wedding-limited-v5-style.html').read_bytes(), 'Default must match limited reference page')
    for html, mode in [('index.html','limited'),('wedding-limited-v5-style.html','limited'),('wedding-mixed-v4-style.html','mixed')]:
        if not (ROOT/html).exists(): continue
        p = PageLinks(); p.feed((ROOT/html).read_text(encoding='utf-8'))
        check(p.motion_set == mode, f'{html}: wrong motion set')
        check([x.strip() for x in p.names] == EXPECTED_TABS, f'{html}: navigation labels/order incorrect: {p.names}')
        check(len(p.hrefs)==8 and all(h and h[0]=='#' and h[1:] in p.ids for h in p.hrefs), f'{html}: missing section anchor')
        for asset in ['styles.css', 'script.js']:
            check(asset in (ROOT/html).read_text(encoding='utf-8'), f'{html}: missing {asset} reference')
    manifest = json.loads((ROOT/'manifest.json').read_text())
    inventory = json.loads((ROOT/'docs'/'asset-inventory.json').read_text())
    check(len(manifest['items']) == 24, 'Expected 24 postcard designs')
    check(len(inventory['postcards']) == 24, 'Expected 24 fingerprinted designs')
    check(len(set(x['file'] for x in manifest['items'])) == 24, 'Art IDs must be distinct')
    for item in inventory['postcards']:
        for key in ('web_large','web_medium','web_thumb'):
            entry = item[key]; f = ROOT/entry['path']
            check(f.is_file(), f'Missing {entry["path"]}')
            if f.is_file():
                data=f.read_bytes()
                check(hashlib.sha256(data).hexdigest() == entry['sha256'], f'Checksum mismatch: {entry["path"]}')
                check(len(data) == entry['size_bytes'], f'Size mismatch: {entry["path"]}')
    check((ROOT/'experiments'/'original-17-options'/'index.html').is_file(), 'Missing 17-option motion lab')
    check((ROOT/'experiments'/'hybrids-11-13'/'index.html').is_file(), 'Missing hybrid motion lab')
    check((ROOT/'originals'/'README.md').is_file(), 'Missing originals provenance instructions')
    if failures:
        for fail in failures: print('FAIL:',fail)
        sys.exit(1)
    print('PASS: three HTML entries, correct preferred/default mode, all eight links,')
    print('      24 distinct designs, 72 fingerprint-verified WebP derivatives,')
    print('      both historic labs, docs and original-source placeholders.')

if __name__=='__main__': verify()
