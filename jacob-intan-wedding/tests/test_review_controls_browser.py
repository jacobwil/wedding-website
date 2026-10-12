"""Check scroll-earned arrivals and the typography popup on the live review site."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import open_browser, close_browser

URL = 'https://sitedev.saola-mountain.ts.net/'
OUT = Path(__file__).resolve().parents[1] / '.build/landing'
OUT.mkdir(parents=True, exist_ok=True)
FONTS = [('syne','Syne',700),('aboreto','Aboreto',400),('fraunces','Fraunces',700),
         ('prata','Prata',400),('playfair','Playfair Display',400)]


def move(page, y):
    page.evaluate('(y)=>scrollTo({top:y,behavior:"instant"})',y)
    page.wait_for_timeout(70)
    page.clock.run_for(100)


with sync_playwright() as p:
    browser = open_browser(p)
    for width,height in [(320,568),(390,844),(1280,800),(1920,1080)]:
        ctx = browser.new_context(viewport={'width':width,'height':height})
        page = ctx.new_page()
        errors=[]
        failed=[]
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.on('response',lambda response:failed.append(response.url) if response.status>=400 else None)
        page.clock.install(time=1000)
        page.clock.pause_at(2000)
        page.goto(URL+'?intro=replay',wait_until='networkidle')
        page.wait_for_timeout(1300)
        original = page.locator('.postcard').evaluate_all('els=>els.map(e=>e.dataset.card)')
        end = page.locator('#home').evaluate('e=>e.offsetTop+e.offsetHeight')
        page.clock.run_for(45000)
        assert page.locator('.postcard').evaluate_all('els=>els.map(e=>e.dataset.card)') == original
        move(page,end-height)
        page.clock.run_for(45000)
        assert page.locator('.postcard').evaluate_all('els=>els.map(e=>e.dataset.card)') == original
        move(page,end+5)
        page.clock.run_for(3000)
        first = page.locator('.postcard').evaluate_all('els=>els.map(e=>e.dataset.card)')
        assert set(first)-set(original),'No new item when reaching content'
        page.clock.run_for(45000)
        assert page.locator('.postcard').evaluate_all('els=>els.map(e=>e.dataset.card)') == first,'Idle arrivals continued'
        move(page,end+height*.5)
        page.clock.run_for(3000)
        second = page.locator('.postcard').evaluate_all('els=>els.map(e=>e.dataset.card)')
        assert set(second)-set(first),'No new item after more content scrolling'
        move(page,0)
        page.clock.run_for(45000)
        assert page.locator('.postcard').evaluate_all('els=>els.map(e=>e.dataset.card)') == second,'Returned opening gained items'
        gear=page.locator('.font-toggle')
        gear.click()
        assert page.locator('#font-panel').is_visible()
        assert page.locator('#headline-font').evaluate('e=>e===document.activeElement')
        for key,family,weight in FONTS:
            page.select_option('#headline-font',key)
            page.evaluate('document.fonts.ready')
            assert page.evaluate('([f,w])=>document.fonts.check(`${w} 40px "${f}"`)',[family,weight])
            assert page.locator('.landing-title').evaluate('(e)=>getComputedStyle(e).fontWeight') == str(weight)
            assert page.locator('.landing-title').evaluate('(e)=>getComputedStyle(e).fontFamily').startswith('"'+family+'"') or page.locator('.landing-title').evaluate('(e)=>getComputedStyle(e).fontFamily').startswith(family)
            fit=page.evaluate('''() => {
              const width=e=>{const r=document.createRange();r.selectNodeContents(e);return r.getBoundingClientRect().width;};
              const prefix=document.querySelector('.landing-prefix');
              const prefixWidths=[...prefix.childNodes].filter(n=>n.nodeType===3).map(width);
              return {prefixFits:Math.max(...prefixWidths)<=prefix.clientWidth,
                wordsFit:[...document.querySelectorAll('.landing-word')].every(e=>width(e)<=e.clientWidth),
                overflow:document.documentElement.scrollWidth>innerWidth};
            }''')
            assert fit['prefixFits'] and fit['wordsFit'] and not fit['overflow'],(width,key,fit)
            if width in [390,1280]:
                page.screenshot(path=str(OUT/f'font-{key}-{width}.png'))
        for key,family in [('poppins','Poppins'),('zilla','Zilla Slab')]:
            page.select_option('#body-font',key)
            page.evaluate('document.fonts.ready')
            assert page.evaluate('(f)=>document.fonts.check(`400 18px "${f}"`)',family)
            actual=page.locator('#rsvp .section-card p:not(.eyebrow)').first.evaluate('e=>getComputedStyle(e).fontFamily')
            assert family in actual,actual
        page.keyboard.press('Escape')
        assert page.locator('#font-panel').is_hidden()
        assert gear.evaluate('e=>e===document.activeElement')
        gear.click()
        page.mouse.click(5,height-5)
        assert page.locator('#font-panel').is_hidden()
        page.reload(wait_until='networkidle')
        assert page.locator('#headline-font').input_value()=='playfair'
        assert page.locator('#body-font').input_value()=='zilla'
        gear.click()
        page.locator('.font-reset').click()
        assert page.locator('#headline-font').input_value()==page.locator('#body-font').input_value()==''
        page.keyboard.press('Escape')
        assert not errors,errors
        assert not failed,failed
        ctx.close()
        print(f'PASS {width}x{height}: opening held, scroll arrivals, font choices/fit/storage/popup')
    for reduced in [False,True]:
        ctx=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce' if reduced else 'no-preference')
        ctx.add_cookies([{'name':'wedding_intro_seen','value':'1','url':URL}])
        page=ctx.new_page()
        page.clock.install(time=1000);page.clock.pause_at(2000)
        page.goto(URL,wait_until='networkidle')
        opening=page.locator('.postcard').evaluate_all('els=>els.map(e=>e.dataset.card)')
        page.clock.run_for(45000)
        assert page.locator('.postcard').evaluate_all('els=>els.map(e=>e.dataset.card)')==opening
        move(page,2000);page.clock.run_for(45000)
        if reduced:
            assert page.locator('.postcard').evaluate_all('els=>els.map(e=>e.dataset.card)')==opening
            assert page.locator('.postcard').evaluate_all('els=>els.every(e=>e.getAnimations().length===0)')
        else:
            assert set(page.locator('.postcard').evaluate_all('els=>els.map(e=>e.dataset.card)'))-set(opening)
        ctx.close()
    close_browser(browser)
print('PASS repeat and reduced-motion arrivals')
