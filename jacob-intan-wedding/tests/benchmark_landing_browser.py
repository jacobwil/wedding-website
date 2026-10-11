"""Paired landing render benchmark; desktop Chromium evidence, not iPhone FPS."""
import argparse,json,mimetypes,subprocess
from PIL import Image
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
from browser_support import open_browser,close_browser
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('--baseline',action='store_true');parser.add_argument('--baseline-ref',default='0441878');args=parser.parse_args()
def runtime(name):
 if args.baseline:
  return subprocess.check_output(['git','show',f'{args.baseline_ref}:jacob-intan-wedding/{name}'],cwd=ROOT.parent,text=True)
 return (ROOT/name).read_text()
script=runtime('script.js');style=runtime('styles.css')
script=script.replace('  start();','  window.__renderDebug={drop,nextArt,pruneHidden,stop:()=>clearTimeout(timer)};\n  start();')
def route(r):
 name=urlparse(r.request.url).path.lstrip('/') or 'index.html';file=ROOT.parent/'serve'/name
 if not file.is_file():r.fulfill(status=404);return
 data=script.encode() if name=='script.js' else style.encode() if name=='styles.css' else file.read_bytes()
 r.fulfill(body=data,content_type=mimetypes.guess_type(name)[0] or 'application/octet-stream')
with sync_playwright() as p:
 b=open_browser(p);c=b.new_context(viewport={'width':402,'height':874},device_scale_factor=3,is_mobile=True,has_touch=True)
 c.route('**/*',route);c.add_init_script('''let seed=123456789; Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 window.__boundsReads=0;const rect=Element.prototype.getBoundingClientRect;Element.prototype.getBoundingClientRect=function(){window.__boundsReads++;return rect.call(this)};''')
 page=c.new_page();cdp=c.new_cdp_session(page);page.goto('http://wedding.test/?intro=replay',wait_until='networkidle');page.evaluate('document.fonts.ready');page.evaluate('window.__renderDebug.stop()');page.wait_for_timeout(1200)
 def decodedPixels():
  total=0
  for src in page.locator('.postcard img').evaluate_all('els=>els.map(e=>e.currentSrc)'):
   with Image.open(ROOT/urlparse(src).path.lstrip('/')) as img: total+=img.width*img.height
  return total
 initialPixels=decodedPixels()
 page.evaluate('''() => { const d=window.__renderDebug; for(let i=0;i<20;i++){d.drop(d.nextArt(),i%2?'right':'left');d.pruneHidden()}d.stop(); }''');page.wait_for_timeout(4800)
 cdp.send('Emulation.setCPUThrottlingRate',{'rate':6});cdp.send('Performance.enable');before={m['name']:m['value'] for m in cdp.send('Performance.getMetrics')['metrics']}
 scroll=page.evaluate('''async () => {
 const words=[...document.querySelectorAll('.landing-word')];let writes=0;
 const observer=new MutationObserver(entries=>writes+=entries.length);words.forEach(e=>observer.observe(e,{attributes:true,attributeFilter:['style']}));
 window.__boundsReads=0;const travel=window.weddingLanding.travel;
 for(let i=0;i<120;i++){scrollTo({top:travel*(i<60?i/60:(120-i)/60),behavior:'instant'});await new Promise(requestAnimationFrame)}
 await new Promise(resolve=>setTimeout(resolve,100));observer.disconnect();return {wordStyleWrites:writes,boundsReads:window.__boundsReads}; }''')
 after={m['name']:m['value'] for m in cdp.send('Performance.getMetrics')['metrics']};cdp.send('Emulation.setCPUThrottlingRate',{'rate':1})
 result={'baseline':args.baseline,'intro':scroll,'metrics':{k:round((after[k]-before[k])*(1000 if k.endswith('Duration') else 1),2) for k in ['TaskDuration','ScriptDuration','LayoutCount','RecalcStyleCount']},'cards':page.locator('.postcard').count(),'initialDecodedMiB':round(initialPixels*4/1024**2,2),'retainedDecodedMiB':round(decodedPixels()*4/1024**2,2),'filteredCards':page.locator('.postcard').evaluate_all('els=>els.filter(e=>getComputedStyle(e).filter !== "none").length'),'resting3DCards':page.locator('.postcard').evaluate_all('els=>els.filter(e=>e.style.transform.includes("translate3d")).length')}
 if not args.baseline:
  assert scroll['wordStyleWrites']==0,scroll
  assert scroll['boundsReads']==0,scroll
  assert result['cards']<=16,result
 print(json.dumps(result,indent=2));out=ROOT/'.build/landing';out.mkdir(exist_ok=True,parents=True);(out/('performance-before.json' if args.baseline else 'performance-after.json')).write_text(json.dumps(result,indent=2)+'\n');c.close();close_browser(b)
