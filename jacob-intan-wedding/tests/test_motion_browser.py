from pathlib import Path
import os
import math
from playwright.sync_api import sync_playwright

BASE = Path(__file__).resolve().parents[1]
SCRIPT = (BASE/'script.js').read_text()
STYLE = (BASE/'styles.css').read_text()
assert all((BASE/n).exists() for n in ['index.html','wedding-limited-v5-style.html','wedding-mixed-v4-style.html'])
JS = r'''async () => {
  const {profiles, chooseEntryVector, circularSeparation} = window.__motionDebug;
  const parse = (f) => ({
    x:+f.transform.match(/translate3d\((-?[\d.]+)px/)[1],
    y:+f.transform.match(/translate3d\(-?[\d.]+px,(-?[\d.]+)px/)[1],
    z:+f.transform.match(/\brotate\((-?[\d.]+)deg\)/)[1],
    tilt:+f.transform.match(/rotateX\((-?[\d.]+)deg\)/)[1],
    scale:+f.transform.match(/scale\(([\d.]+)/)[1],
    opacity:f.opacity,
  });
  const mono = a => a.slice(1).every((v,i) => v >= a[i]-1e-7);
  const errors = [], signatures = new Set(), profilesSeen = new Set();
  let minSep=360;
  for(let i=0; i<1200; i++) {
    const a=chooseEntryVector(), b=chooseEntryVector(a.angle);
    const sep=circularSeparation(a.angle,b.angle)*180/Math.PI;
    minSep=Math.min(minSep,sep);
    signatures.add(a.name); signatures.add(b.name);
    if(sep<126.99) errors.push({reason:'too-similar initial directions',a,b,sep});
    const mag=Math.hypot(a.x,a.y);
    if (mag < 26.999 || mag >=37.0001) errors.push({reason:'distance outside local travel band',a,mag});
  }
  let cases=0, maxSpeedStep=0, maxRestScale=0, maxRestTilt=0;
  for(const p of profiles) {
    profilesSeen.add(p.id);
    for(let direction=0;direction<8;direction++) {
      for(const jitter of [-8,0,8]) for(const target of [-7.4,0,7.4]) for(const turn of [-1,1]) {
        const radians=(direction*45+jitter)*Math.PI/180;
        const x=33*Math.cos(radians), y=33*Math.sin(radians);
        const frames=p.build(target,{side:1,turn,approachX:x,approachY:y});
        const poses=frames.map(parse), xs=poses.map(p=>p.x), ys=poses.map(p=>p.y);
        const progX=xs.map(v=>Math.abs(v)),progY=ys.map(v=>Math.abs(v));
        const yaw=poses.map(p=>Math.abs(p.z-target));
        const held=frames.filter(f=>f.offset>=p.contactAt && f.offset<=p.releaseAt);
        const error = (!mono(progX.map(v=>-v)) || !mono(progY.map(v=>-v)) || !mono(yaw.map(v=>-v)) ||
          !mono(poses.map(p=>-p.scale)) || !mono(poses.map(p=>-p.tilt)) ||
          !mono(poses.map(p=>p.opacity)) || poses.at(-1).opacity!==1 ||
          Math.abs(poses.at(-1).x)>1e-5 || Math.abs(poses.at(-1).y)>1e-5 ||
          poses.at(-2).x!==0 || poses.at(-2).y!==0 ||
          Math.abs(poses.at(-1).z-target)>1e-4 || Math.abs(poses.at(-2).z-target)>1e-4 ||
          (p.id==='hold-flatten' && (held.length<2 || held.some(f=>f.transform!==held[0].transform))));
        if(error) errors.push({reason:'keyframe reversal/hold mismatch',profile:p.id,x,y,target,turn,frames});
        const contact=parse(frames.find(f=>f.offset===p.contactAt));
        maxRestScale=Math.max(maxRestScale,contact.scale-1);
        maxRestTilt=Math.max(maxRestTilt,contact.tilt);
        if(contact.scale>1.00051 || contact.tilt>.101 || contact.opacity!==1)
          errors.push({reason:'conspicuous contact release',profile:p.id,contact});
        // Check the shortest first-paint timing as well as a later arrival.
        for(const duration of [p.baseDuration[0]*.68,p.baseDuration[1]]) {
          const speeds=poses.slice(1).map((v,i)=>Math.hypot(v.x-poses[i].x,v.y-poses[i].y)/((frames[i+1].offset-frames[i].offset)*duration));
          const step=Math.max(...speeds.slice(1).map((v,i)=>Math.abs(v-speeds[i])));
          maxSpeedStep=Math.max(maxSpeedStep,step);
          if(step>.012) errors.push({reason:'approach changes speed abruptly',profile:p.id,duration,step});
        }
        cases++;
      }
    }
  }
  const rendered=[];
  for(const p of profiles) for(const degrees of [0,45,90,135,180,225,270,315]) {
    const angle=(degrees+4)*Math.PI/180;
    const x=33*Math.cos(angle), y=33*Math.sin(angle), finalDeg=-6.4;
    const frames=p.build(finalDeg,{side:1,turn:1,approachX:x,approachY:y});
    const node=document.createElement('div');
    node.className='postcard';
    node.style.cssText='position:absolute;left:0;top:0;width:576px;height:480px;';
    document.getElementById('postcard-plane').append(node);
    const a=node.animate(frames,{duration:2000,easing:'linear',fill:'both'});
    a.pause();
    const series=[];
    for(let t=0;t<=2000;t+=8){
      a.currentTime=t;
      const matrix=new DOMMatrix(getComputedStyle(node).transform);
      const z=Math.atan2(matrix.m12,matrix.m11)*180/Math.PI;
      series.push({x:matrix.m41,y:matrix.m42,z});
    }
    const btrack=(key,base) => Math.max(0,...series.slice(1).map((v,i)=>Math.abs(v[key]-base)-Math.abs(series[i][key]-base)));
    const xb=btrack('x',0),yb=btrack('y',0),zb=btrack('z',finalDeg);
    const speeds=series.slice(1).map((v,i)=>Math.hypot(v.x-series[i].x,v.y-series[i].y)/8);
    const speedStep=Math.max(...speeds.slice(1).map((v,i)=>Math.abs(v-speeds[i])));
    // A former phase boundary changed travel speed abruptly by >.05 px/ms.
    if(speedStep>.007) errors.push({reason:'abrupt approach speed change',profile:p.id,degrees,speedStep});
    a.currentTime=p.contactAt*2000;
    const contact=node.getBoundingClientRect();
    a.currentTime=2000;
    const rest=node.getBoundingClientRect();
    const finalRelease=Math.max(...['left','right','top','bottom'].map(edge=>Math.abs(contact[edge]-rest[edge])));
    if(finalRelease>.5) errors.push({reason:'final flattening exceeds half a CSS pixel',profile:p.id,degrees,finalRelease});
    const before=getComputedStyle(node).transform;
    node.style.transform=frames.at(-1).transform;
    node.style.opacity='1';
    a.cancel();
    const after=getComputedStyle(node).transform;
    if(xb>.1||yb>.1||zb>.15||before!==after) errors.push({reason:'rendered movement or cleanup jump',profile:p.id,degrees,xb,yb,zb,afterMatches:before===after});
    rendered.push({profile:p.id,degrees,xb:+xb.toFixed(4),yb:+yb.toFixed(4),zb:+zb.toFixed(4),speedStep,finalRelease,cleanupMatches:before===after});
    node.remove();
  }
  return {names:[...signatures].sort(),minSep,profileNames:[...profilesSeen],cases,maxSpeedStep,maxRestScale,maxRestTilt,renderedCount:rendered.length,errors:errors.slice(0,8)};
}'''

with sync_playwright() as p:
    launch_args = {'headless': True, 'args':['--no-sandbox', '--disable-dev-shm-usage']}
    chromium_path = os.environ.get('CHROMIUM_PATH')
    if chromium_path: launch_args['executable_path'] = chromium_path
    browser=p.chromium.launch(**launch_args)
    for mode,width,height,reduced in [('limited',1280,800,False),('limited',1920,1080,False),('limited',390,844,False),('limited',1280,800,True),('mixed',1280,800,False)]:
        page=browser.new_page(viewport={'width':width,'height':height}, reduced_motion='reduce' if reduced else 'no-preference')
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        html=(BASE/f'wedding-{mode}-v{5 if mode=="limited" else 4}-style.html').read_text()
        html=html.replace('<link rel="stylesheet" href="styles.css">','').replace('<script defer src="script.js"></script>','')
        page.set_content(html)
        page.add_style_tag(content=STYLE)
        injected=SCRIPT.replace('  let deck = shuffle(ART);','  window.__motionDebug={profiles:SELECTED_MOTION_PROFILES,chooseEntryVector,circularSeparation};\n  let deck = shuffle(ART);')
        page.add_script_tag(content=injected)
        page.wait_for_timeout(1400 if not reduced else 100)
        assert not errors,errors
        basics=page.evaluate('''() => ({count:document.querySelectorAll('.postcard').length,
          nav:document.querySelectorAll('.nav-link').length,
          overflow:document.documentElement.scrollWidth>innerWidth,
          entries:[...document.querySelectorAll('.postcard')].slice(0,2).map(c=>({label:c.dataset.entryDirection,angle:Number(c.dataset.entryAngle),x:Number(c.dataset.entryX),y:Number(c.dataset.entryY)})),
          static:[...document.querySelectorAll('.postcard')].every(c=>getComputedStyle(c).opacity==='1' && c.getAnimations().length===0)})''')
        assert basics['count']>=2 and basics['nav']==8 and not basics['overflow'],basics
        if reduced: assert basics['static'],basics
        if mode=='limited':
            entries=basics['entries']
            diff=abs(math.atan2(math.sin(entries[0]['angle']-entries[1]['angle']), math.cos(entries[0]['angle']-entries[1]['angle'])))*180/math.pi
            assert diff>126.9,(entries,diff)
            checks=page.evaluate(JS)
            assert not checks['errors'],checks['errors']
            assert len(checks['profileNames'])==3,checks
            assert len(checks['names'])==8,checks
            print(f"PASS limited {width}x{height} reduced={reduced}: first-pair={diff:.1f}°, {checks['cases']} keyframe combos, {checks['renderedCount']} rendered motions; 8 approach directions; min sampled pair separation={checks['minSep']:.1f}°; no bounce/snap; JS errors=0")
        else:
            profiles=page.evaluate('''() => window.__motionDebug.profiles.map(p=>p.id)''')
            assert len(profiles)==7,profiles
            print('PASS broad comparison unchanged: seven profiles; no JS errors')
        page.close()
    browser.close()
print('ALL CHECKS PASSED')
