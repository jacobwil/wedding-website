"""Exercise real assets, scrolling, resizing and recycling without a preview server.

Use --baseline with /tmp/wedding-{script,styles}-before.* for a paired benchmark.
Timings are diagnostic; correctness assertions do not depend on machine speed.
"""
import argparse
import json
import mimetypes
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright
from browser_support import open_browser, close_browser

BASE = Path(__file__).resolve().parents[1]
REVIEW = BASE.parent / 'serve'
parser = argparse.ArgumentParser()
parser.add_argument('--baseline', action='store_true')
parser.add_argument('--screenshots', type=Path)
args = parser.parse_args()
script = (Path('/tmp/wedding-script-before.js') if args.baseline else BASE / 'script.js').read_text()
style = (Path('/tmp/wedding-styles-before.css') if args.baseline else BASE / 'styles.css').read_text()
script = script.replace('  start();', '''
  window.__performanceDebug = {
    drop, nextArt, choosePosition, pruneHidden, prepareNextReuse,
    cards: () => [...active.values()], stop: () => clearTimeout(timer),
    retireTop: () => {
      const card = [...active.values()].reduce((a,b) => a.serial > b.serial ? a : b);
      pendingArt = card.art; prepareNextReuse(); return card.art.id;
    }
  };
  start();''')


def route_public(route):
    path = urlparse(route.request.url).path.lstrip('/') or 'index.html'
    public = REVIEW / path
    # Only the existing public review tree, including its runtime symlinks.
    if '..' in Path(path).parts or not public.is_file():
        route.fulfill(status=404, body='Not found')
        return
    if path == 'script.js':
        body = script.encode()
    elif path == 'styles.css':
        body = style.encode()
    else:
        body = public.read_bytes()
    route.fulfill(body=body, content_type=mimetypes.guess_type(path)[0] or 'application/octet-stream')


with sync_playwright() as p:
    browser = open_browser(p)
    for mode in ['native', 'fallback', 'reduced']:
        context = browser.new_context(viewport={'width': 390, 'height': 844},
                                      device_scale_factor=3, is_mobile=True, has_touch=True,
                                      reduced_motion='reduce' if mode == 'reduced' else 'no-preference')
        context.route('**/*', route_public)
        context.add_init_script('''
          let seed = 123456789;
          Math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
        ''')
        if mode == 'fallback':
            context.add_init_script('''
              const supports = CSS.supports.bind(CSS);
              CSS.supports = (...args) => args[0] === 'animation-timeline: scroll(root block)' ? false : supports(...args);
            ''')
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto('http://wedding.test/', wait_until='networkidle')
        page.evaluate('window.__performanceDebug.stop()')
        page.wait_for_timeout(1800)
        page.evaluate('''() => {
          const d = window.__performanceDebug;
          if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
            for (let i = 0; i < 20; i++) { d.drop(d.nextArt(), i % 2 ? 'right' : 'left'); d.pruneHidden(); }
          }
          d.stop();
        }''')
        page.wait_for_timeout(2400)
        assert page.evaluate("[...document.querySelectorAll('.postcard img')].every(i => i.complete && i.naturalWidth > 0)")
        assert not page.evaluate('document.documentElement.scrollWidth > innerWidth')
        if args.screenshots and mode == 'native':
            args.screenshots.mkdir(parents=True, exist_ok=True)
            page.screenshot(path=str(args.screenshots / ('before.png' if args.baseline else 'after.png')))

        cdp = context.new_cdp_session(page)
        cdp.send('Emulation.setCPUThrottlingRate', {'rate': 6})
        placement = page.evaluate('''() => {
          const d = window.__performanceDebug, art = d.cards()[0].art, times = [];
          for (let i = 0; i < 60; i++) {
            const start = performance.now();
            d.choosePosition(art, i % 2 ? 'right' : 'left');
            times.push(performance.now() - start);
          }
          times.sort((a,b) => a-b);
          return {cards:d.cards().length, medianMs:times[30], p95Ms:times[57]};
        }''')
        cdp.send('Performance.enable')
        before = {m['name']: m['value'] for m in cdp.send('Performance.getMetrics')['metrics']}
        scroll = page.evaluate('''async () => {
          const plane = document.getElementById('postcard-plane');
          let styleWrites = 0;
          const observer = new MutationObserver(entries => styleWrites += entries.length);
          observer.observe(plane, {attributes:true, attributeFilter:['style']});
          const max = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          for (let i = 0; i < 120; i++) {
            window.scrollTo({top:max * (i < 60 ? i/60 : (120-i)/60), behavior:'instant'});
            await new Promise(requestAnimationFrame);
          }
          await new Promise(resolve => setTimeout(resolve, 100));
          observer.disconnect();
          return {styleWrites, native:plane.classList.contains('has-scroll-timeline')};
        }''')
        after = {m['name']: m['value'] for m in cdp.send('Performance.getMetrics')['metrics']}
        metrics = {name: round((after[name] - before[name]) * (1000 if name.endswith('Duration') else 1), 2)
                   for name in ['TaskDuration', 'ScriptDuration', 'LayoutCount', 'RecalcStyleCount']}
        print(json.dumps({'baseline': args.baseline, 'mode': mode, 'placement': placement,
                          'scroll': scroll, 'scrollMetrics': metrics}))
        cdp.send('Emulation.setCPUThrottlingRate', {'rate': 1})
        if not args.baseline:
            if mode in ['native', 'reduced']:
                assert scroll['styleWrites'] == 0, scroll
            if mode == 'native':
                assert scroll['native'], scroll
            if mode == 'fallback':
                assert not scroll['native'], scroll

        # The same 18% world-space position at several scroll depths.
        for top in [0, 900, 2400]:
            page.evaluate('(top) => scrollTo({top, behavior:"instant"})', top)
            page.wait_for_timeout(100)
            position = page.evaluate('''() => ({scrollY,
              y:new DOMMatrix(getComputedStyle(document.getElementById('postcard-plane')).transform).m42})''')
            expected = 0 if mode == 'reduced' and not args.baseline else -position['scrollY'] * .18
            assert abs(position['y'] - expected) < .1, (mode, position, expected)

        if not args.baseline:
            geometry = page.evaluate("window.__performanceDebug.cards().map(c => [c.x,c.y,c.w,c.h])")
            page.set_viewport_size({'width': 390, 'height': 760})
            page.wait_for_timeout(150)
            assert geometry == page.evaluate("window.__performanceDebug.cards().map(c => [c.x,c.y,c.w,c.h])")
            page.evaluate("document.body.style.paddingBottom = '200px'")
            page.wait_for_timeout(150)
            position = page.evaluate('''() => ({scrollY,
              y:new DOMMatrix(getComputedStyle(document.getElementById('postcard-plane')).transform).m42})''')
            assert abs(position['y'] - (0 if mode == 'reduced' else -position['scrollY'] * .18)) < .1, position
            page.set_viewport_size({'width': 650, 'height': 390})
            page.wait_for_timeout(150)
            assert geometry != page.evaluate("window.__performanceDebug.cards().map(c => [c.x,c.y,c.w,c.h])")
            assert not page.evaluate('document.documentElement.scrollWidth > innerWidth')
            if mode != 'reduced':
                retiring_id = page.evaluate('window.__performanceDebug.retireTop()')
                page.wait_for_timeout(1200)
                assert page.evaluate("id => getComputedStyle(window.__performanceDebug.cards().find(c => c.art.id === id).node).opacity === '0'", retiring_id)
                page.emulate_media(reduced_motion='reduce')
                page.wait_for_timeout(100)
                assert page.evaluate("[...document.querySelectorAll('.postcard')].every(c => c.getAnimations().length === 0 && getComputedStyle(c).opacity === '1')")
                assert page.evaluate("new DOMMatrix(getComputedStyle(document.getElementById('postcard-plane')).transform).m42 === 0")
            for link in page.locator('.nav-link').all():
                target = link.get_attribute('href')
                link.click()
                page.wait_for_timeout(50)
                assert page.evaluate('location.hash') == target
                assert page.locator(target).is_visible()
        assert not errors, errors
        context.close()
    close_browser(browser)
print('PASS: real public assets and scroll benchmark' if args.baseline else
      'PASS: native/fallback/reduced parallax, toolbar/orientation/content resize, image loading, retirement and live reduced motion')
