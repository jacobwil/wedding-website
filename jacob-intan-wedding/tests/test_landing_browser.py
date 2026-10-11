"""Verify Intan's landing with real review assets and a controlled browser clock."""
import hashlib
import json
import time
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import open_browser, close_browser

ROOT = Path(__file__).resolve().parents[1]
URL = 'https://sitedev.saola-mountain.ts.net/'
ARTIFACTS = ROOT / '.build/landing'
ARTIFACTS.mkdir(parents=True, exist_ok=True)
results = []


def matrix(page, selector):
    return page.locator(selector).evaluate("e => new DOMMatrix(getComputedStyle(e).transform).m42")


def move(page, y):
    page.evaluate('(top) => scrollTo({top,behavior:"instant"})', y)
    page.wait_for_timeout(100)


with sync_playwright() as p:
    browser = open_browser(p)
    compositions = []
    for w,h in [(390,844),(1280,800),(1920,1080)]:
        context = browser.new_context(viewport={'width':w,'height':h})
        context.add_init_script('''window.__openingFrames=[]; const originalAnimate=Element.prototype.animate; Element.prototype.animate=function(frames,options){ if(this.classList.contains('postcard')) window.__openingFrames.push(frames); return originalAnimate.call(this,frames,options); };''')
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        # Pause time before initialization: verify both the opening and idle thresholds.
        page.clock.install(time=1000)
        page.clock.pause_at(2000)
        page.goto(URL, wait_until='networkidle')
        page.evaluate('document.fonts.ready')
        travel = page.evaluate('window.weddingLanding.travel')
        assert abs(travel-3*h) < 1
        assert page.locator('.postcard').count() == 8
        assert page.locator('.postcard[data-kind="photo"]').count() >= 1
        assert page.locator('.postcard').evaluate_all('els => new Set(els.map(e=>e.dataset.card)).size') == 8
        assert page.locator('.postcard').evaluate_all('els => els.every(e=>e.dataset.motionProfile === "opening-fade")')
        animations = page.evaluate('window.__openingFrames')
        assert all(frames[0]['transform'] == frames[-1]['transform'] for frames in animations)
        page.wait_for_timeout(1300)
        assert page.locator('.postcard').evaluate_all('els => els.every(e=>getComputedStyle(e).opacity === "1" && e.getAnimations().length === 0)')
        positions = page.locator('.postcard').evaluate_all('els=>els.map(e=>({x:parseFloat(e.style.left)+parseFloat(e.style.width)/2,y:parseFloat(e.style.top)+parseFloat(e.style.height)/2,id:e.dataset.card}))')
        assert min(c['x'] for c in positions) < w*.3 and max(c['x'] for c in positions) > w*.7
        assert any(w*.3<c['x']<w*.7 for c in positions) or w<=650
        compositions.append(positions)
        assert page.evaluate('document.fonts.check(\'100px "Great Vibes"\')')
        assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
        prefix = page.locator('.landing-prefix').bounding_box()
        page.screenshot(path=str(ARTIFACTS / f'closer-{w}.png'))
        for index in range(4):
            move(page,index*h)
            page.clock.run_for(50)
            assert abs(matrix(page,'.postcard-plane')) < .1
            assert abs(matrix(page,f'.landing-word:nth-child({index+1})')) < 1
            assert abs(page.locator('.landing-prefix').bounding_box()['y']-prefix['y']) < 1
            assert page.locator('.header').bounding_box()['y'] >= 0
            page.screenshot(path=str(ARTIFACTS / f'word-{index}-{w}.png'))
        move(page,travel+500);page.clock.run_for(50)
        assert abs(matrix(page,'.postcard-plane')+90) < .1
        move(page,travel);page.clock.run_for(50)
        page.clock.run_for(29000)
        assert not page.locator('.landing-hero').evaluate("e=>e.classList.contains('is-cycling')")
        page.clock.run_for(1100)
        assert page.locator('.landing-hero').evaluate("e=>e.classList.contains('is-cycling')")
        page.clock.run_for(500)
        assert page.locator('.landing-progress i.is-current').evaluate('e=>[...e.parentNode.children].indexOf(e)') == 0
        for index in [1,2,3,0]:
            page.clock.run_for(3000)
            assert page.locator('.landing-progress i.is-current').evaluate('e=>[...e.parentNode.children].indexOf(e)') == index
        page.mouse.move(20,20);page.clock.run_for(50)
        assert not page.locator('.landing-hero').evaluate("e=>e.classList.contains('is-cycling')")
        assert abs(matrix(page,'.landing-word:last-child')) < 1
        if w == 390:
            toggle=page.locator('.nav-toggle')
            assert toggle.is_visible() and toggle.get_attribute('aria-expanded') == 'false'
            assert page.locator('.nav-links').evaluate('e=>e.inert')
            toggle.click();page.clock.run_for(200)
            assert toggle.get_attribute('aria-expanded') == 'true'
            assert page.locator('.nav-link').count() == 8
            page.screenshot(path=str(ARTIFACTS/'mobile-menu.png'))
            page.keyboard.press('Escape');assert toggle.get_attribute('aria-expanded') == 'false'
            for link in page.locator('.nav-link').all():
                toggle.click();page.clock.run_for(200)
                target=link.get_attribute('href');link.click();page.clock.run_for(1000)
                assert page.evaluate('location.hash') == target
                assert toggle.get_attribute('aria-expanded') == 'false'
            # A short mobile landscape viewport intentionally shows half a row.
            page.set_viewport_size({'width':650,'height':390});page.clock.run_for(100)
            toggle.click();page.clock.run_for(200)
            menu=page.locator('.nav-links')
            dimensions=menu.evaluate('e=>({h:e.clientHeight,scroll:e.scrollHeight,top:e.getBoundingClientRect().top})')
            assert dimensions['scroll'] > dimensions['h']
            assert abs(((dimensions['h']-16)%48)-24) < 2, dimensions
            assert dimensions['top']+dimensions['h'] < 390
            menu.evaluate('e=>e.scrollTop=e.scrollHeight');page.clock.run_for(50)
            assert page.locator('.nav-link').last.is_visible()
            page.screenshot(path=str(ARTIFACTS/'mobile-menu-scroll.png'))
        cookie=next(c for c in context.cookies() if c['name']=='wedding_intro_seen')
        assert cookie['secure'] and cookie['sameSite']=='Lax'
        assert abs(cookie['expires']-time.time()-259200)<120, cookie
        # A reload receives the compact hero and doesn't extend cookie expiry.
        page.goto(URL,wait_until='networkidle');page.clock.run_for(1300)
        assert page.evaluate('window.weddingLanding.travel') == 0
        assert abs(matrix(page,'.landing-word:last-child')) < 1
        cookie2=next(c for c in context.cookies() if c['name']=='wedding_intro_seen')
        assert cookie2['expires']==cookie['expires']
        page.screenshot(path=str(ARTIFACTS/f'return-{w}.png'))
        page.clock.run_for(31000)
        assert page.locator('.landing-hero').evaluate("e=>e.classList.contains('is-cycling')")
        assert page.locator('.landing-progress i.is-current').evaluate('e=>[...e.parentNode.children].indexOf(e)') == 0
        assert not errors, errors
        context.close()
        results.append(f'{w}x{h}: opening, fixed prefix/table, four words, parallax after intro, idle threshold/cycle/reset, return cookie, navigation')
        print('PASS',results[-1])
    assert compositions[0] != compositions[1]
    # Same viewport on consecutive loads must actually reshuffle the pile.
    context=browser.new_context(viewport={'width':1280,'height':800})
    page=context.new_page();page.goto(URL+'?intro=replay',wait_until='networkidle')
    first=page.locator('.postcard').evaluate_all('els=>els.map(e=>({id:e.dataset.card,x:e.style.left,y:e.style.top}))')
    page.reload(wait_until='networkidle')
    second=page.locator('.postcard').evaluate_all('els=>els.map(e=>({id:e.dataset.card,x:e.style.left,y:e.style.top}))')
    assert first != second
    for option,count in [('airy',6),('loose',8)]:
        page.goto(URL+'?intro=replay&pile='+option,wait_until='networkidle')
        assert page.locator('.postcard').count()==count
        assert page.evaluate('window.weddingLanding.travel')==2400
    # Changing reduced motion halfway through the intro remains on the hero.
    page.goto(URL+'?intro=replay',wait_until='networkidle');move(page,1200)
    page.emulate_media(reduced_motion='reduce');page.wait_for_timeout(100)
    assert page.evaluate('window.weddingLanding.travel')==0
    assert page.evaluate('scrollY')==0
    context.close()
    # Expiration reenables the intro; reduced-motion bypasses it and stays still.
    for reduced in [False,True]:
        context=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce' if reduced else 'no-preference')
        context.add_cookies([{'name':'wedding_intro_seen','value':'1','url':URL,'expires':1}])
        page=context.new_page();page.goto(URL,wait_until='networkidle')
        assert page.evaluate('window.weddingLanding.travel') == (0 if reduced else 2532)
        if reduced:
            assert page.locator('.postcard').count()==8
            assert page.locator('.postcard').evaluate_all('els=>els.every(e=>e.getAnimations().length===0)')
            page.clock.install();page.clock.fast_forward(45000)
            assert not page.locator('.landing-hero').evaluate("e=>e.classList.contains('is-cycling')")
            move(page,500);assert abs(matrix(page,'.postcard-plane'))<.1
        context.close()
    close_browser(browser)
results.append('expired cookie replays; reduced motion uses a static one-screen Wilder and eight static items')
(ARTIFACTS/'results.json').write_text(json.dumps({'checks':results,'sha256':{name:hashlib.sha256((ROOT/name).read_bytes()).hexdigest() for name in ['index.html','styles.css','script.js']}},indent=2)+'\n')
print('ALL LANDING CHECKS PASSED')
