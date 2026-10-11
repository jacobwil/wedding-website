"""Render the standalone export and longer Markdown content, without a web server.

Optional --baseline-ref compares the original design with exact reduced-motion
geometry and screenshots. Evidence remains private in .build/browser/.
"""
import argparse
import hashlib
from io import BytesIO
import json
import mimetypes
from pathlib import Path
import shutil
import subprocess
import tempfile
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright
from PIL import Image, ImageChops
from browser_support import open_browser, close_browser

BASE = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--baseline-ref')
args = parser.parse_args()
output = BASE / '.build/browser'
output.mkdir(parents=True, exist_ok=True)
results_file = output / 'results.json'
results_file.unlink(missing_ok=True)
assert (BASE / 'dist/index.html').is_file(), 'Run make export before this browser check.'


def baseline_bytes(name):
    return subprocess.check_output(['git', 'show', f'{args.baseline_ref}:jacob-intan-wedding/{name}'], cwd=BASE)


baseline = {name: baseline_bytes(name) for name in ['index.html', 'styles.css', 'script.js']} if args.baseline_ref else {}
report = {'baseline_ref': args.baseline_ref, 'checks': [], 'sha256': {
    name: hashlib.sha256((BASE / name).read_bytes()).hexdigest()
    for name in ['index.html', 'wedding-limited-v5-style.html', 'styles.css', 'script.js']
}}


def render(browser, root, width, height, reduced=True, overrides=None, capture=None):
    context = browser.new_context(viewport={'width': width, 'height': height},
                                  reduced_motion='reduce' if reduced else 'no-preference')
    context.add_init_script('''let seed=123456789;
      Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);''')
    errors = []
    missing = []

    def route_public(route):
        name = urlparse(route.request.url).path.lstrip('/') or 'index.html'
        file = root / name
        if '..' in Path(name).parts or not file.is_file():
            missing.append(name)
            route.fulfill(status=404, body='Not found')
            return
        route.fulfill(body=(overrides or {}).get(name, file.read_bytes()),
                      content_type=mimetypes.guess_type(name)[0] or 'application/octet-stream')

    context.route('**/*', route_public)
    page = context.new_page()
    page.on('pageerror', lambda error: errors.append(str(error)))
    try:
        page.goto('http://wedding-export.test/', wait_until='networkidle')
        page.locator('.story-postcards').scroll_into_view_if_needed()
        page.wait_for_function('[...document.querySelectorAll("img")].every(i=>i.complete && i.naturalWidth>0)')
        page.evaluate('window.scrollTo({top:0,behavior:"instant"})')
        page.wait_for_timeout(150 if reduced else 1800)
        assert not errors, errors
        assert not missing, missing
        assert not page.evaluate('document.documentElement.scrollWidth > innerWidth'), (width, height, page.evaluate('''[...document.querySelectorAll('main *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,12).map(e=>({tag:e.tagName,class:e.className,width:e.getBoundingClientRect().width}))'''))
        assert page.locator('.nav-link').count() == 8
        if reduced:
            assert page.evaluate('[...document.querySelectorAll(".postcard")].every(c=>c.getAnimations().length===0 && getComputedStyle(c).opacity==="1")')
        geometry = page.locator('main,main section,.section-card,.announcement,.footer').evaluate_all('''els=>els.map(e=>({
          tag:e.tagName,id:e.id,class:e.className,text:e.textContent.replace(/\\s+/g," ").trim(),
          box:JSON.parse(JSON.stringify(e.getBoundingClientRect()))}))''')
        pixels = page.screenshot(path=str(output / capture), full_page=True) if capture else None
        return geometry, pixels
    finally:
        context.close()


with sync_playwright() as p:
    browser = open_browser(p)
    for width, height in [(390, 844), (1280, 800), (1920, 1080)]:
        current = render(browser, BASE / 'dist', width, height, capture=f'current-{width}.png')
        if baseline:
            original = render(browser, BASE / 'dist', width, height, overrides=baseline, capture=f'baseline-{width}.png')
            assert current[0] == original[0], f'Baseline layout/text changed at {width}px'
            before = Image.open(BytesIO(original[1])).convert('RGB')
            after = Image.open(BytesIO(current[1])).convert('RGB')
            assert before.size == after.size
            difference = ImageChops.difference(before, after)
            # Chromium can round a handful of background-card edge pixels by
            # one channel level between captures. Reject any larger change.
            changed = before.width * before.height - difference.point(lambda value: 255 if value else 0).convert('L').histogram()[0]
            max_channel_change = max(high for low, high in difference.getextrema())
            assert max_channel_change <= 1 and changed <= max(1, before.width * before.height // 1000000), f'Baseline screenshot changed at {width}px: {changed} pixels, max channel change {max_channel_change}; inspect .build/browser/'
            print(f'PASS {width}x{height}: exact baseline layout/copy; screenshot matches ({changed} pixels with at most one channel level of rounding).')
        render(browser, BASE / 'dist', width, height, reduced=False)
        report['checks'].append(f'export {width}x{height}, normal/reduced, real images, no overflow/errors')

    with tempfile.TemporaryDirectory(prefix='wedding-content-browser-') as directory:
        fixture = Path(directory)
        shutil.copytree(BASE / 'dist', fixture, dirs_exist_ok=True)
        for name in ['content', 'templates', 'scripts']:
            shutil.copytree(BASE / name, fixture / name)
        for name in ['eleventy.config.js', 'package.json', 'docs/photo-inventory.json']:
            target = fixture / name
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(BASE / name, target)
        (fixture / 'node_modules').symlink_to(BASE / 'node_modules', target_is_directory=True)
        rich_copy = '''

### Planning your visit

This longer paragraph tests the reading width and panel height. ''' + ('More details will be shared here. ' * 30) + '''

- A useful item with **emphasis**
- A second item with [a long link](https://example.com/a-long-path-for-layout-checking)

| Event | Time | Notes |
| --- | --- | --- |
| A longer event name | To come | More information will be shared here |
| Another event | To come | Details to follow |

> A short quotation can sit comfortably inside the same panel.

<details><summary>A question written directly in HTML</summary><p>Its answer appears here.</p></details>
'''
        for section in ['rsvp', 'story', 'travel', 'questions']:
            file = fixture / f'content/sections/{section}.md'
            file.write_text(file.read_text() + rich_copy)
        node = shutil.which('node')
        if not node and Path('/opt/homebrew/opt/node@24/bin/node').is_file():
            node = '/opt/homebrew/opt/node@24/bin/node'
        assert node, 'Node is needed to build the longer-content browser fixture.'
        subprocess.run([node, 'scripts/build.mjs', '--export'], cwd=fixture, check=True)
        for width, height in [(390, 844), (1280, 800), (1920, 1080)]:
            render(browser, fixture / 'dist', width, height, capture=f'long-content-{width}.png')
            report['checks'].append(f'long Markdown/HTML at {width}x{height}, no overflow/errors')
            print(f'PASS {width}x{height}: longer Markdown, headings, lists, tables, links, and HTML render correctly.')
    close_browser(browser)

results_file.write_text(json.dumps(report, indent=2) + '\n')
print('PASS: standalone public export, all viewports, normal/reduced motion, and long content. Evidence: .build/browser/results.json')
