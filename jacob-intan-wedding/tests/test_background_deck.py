"""Check weighted photo/postcard selection, shuffled cycles, and reuse previews."""
import json
from pathlib import Path
from js_runtime import evaluate

ROOT = Path(__file__).resolve().parents[1]
source = (ROOT / 'script.js').read_text()
configuration = (ROOT / 'background-config.js').read_text()
catalog = (ROOT / 'photos/catalog.js').read_text()
declarations = source[source.index('  const ART ='):source.index('  const reduced =')]
helpers = source[source.index('  const random ='):source.index('  const pose =')]
state = source[source.index('  let deck ='):source.index('  let active =')]
selection = source[source.index('  function ensureDeck()'):source.index('  function chooseMotionProfile()')]
program = 'const window={};\n' + configuration + catalog + '''
const photos=window.WEDDING_PHOTOS;
const configuredShare=window.WEDDING_BACKGROUND.photoShare;
const approved=[2,6,9,13,18];
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
assert(JSON.stringify(photos.map(p=>p.photoId))===JSON.stringify(approved),'unapproved photo catalog');
function checkShare(share,count,expected,withPhotos=true,initialSeed=123456789) {
  let seed=initialSeed;
  Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  const window={WEDDING_BACKGROUND:{photoShare:share},WEDDING_PHOTOS:withPhotos?photos:[]};
''' + declarations + helpers + state + selection + '''
  const groups={photo:[],postcard:[]};
  let previous=null, laterPhotos=0;
  const opening=[];
  for(let i=0;i<count;i++) {
    const preview=peekArt();
    assert(preview===peekArt() && preview===peekArt(),'reuse preview changed upcoming card');
    const art=nextArt();
    assert(art===preview,'actual drop differs from retirement preview');
    assert(art.id!==previous,'immediate repeat at shuffle boundary');
    previous=art.id;
    const kind=art.kind||'postcard';
    assert(kind==='photo'||kind==='postcard','unknown collection');
    if(kind==='photo')assert(approved.includes(art.photoId),'unapproved photo selected');
    groups[kind].push(art.id);
    if(i<4)opening.push({id:art.id,kind});
    else if(kind==='photo')laterPhotos++;
  }
  assert(JSON.stringify(opening.map(a=>a.kind))===JSON.stringify(withPhotos
    ? ['postcard','postcard','postcard','photo'] : ['postcard','postcard','postcard','postcard']),
    'opening must be three postcards followed by a photo');
  for(const [kind,size] of [['postcard',24],['photo',5]]) {
    const items=groups[kind];
    for(let i=0;i<items.length;i+=size) {
      const cycle=items.slice(i,i+size);
      assert(new Set(cycle).size===cycle.length,'repeat before '+kind+' deck exhausted');
    }
  }
  const actual=count>4?laterPhotos/(count-4):null;
  if(count>4)assert(Math.abs(actual-expected)<.025,'photo share differs from configured ratio: '+actual);
  if(expected===0)assert(laterPhotos===0,'later photos at zero ratio');
  if(expected===1)assert(laterPhotos===count-4,'later postcards at full photo ratio');
  return {share,count,photos:groups.photo.length,postcards:groups.postcard.length,actual,opening};
}
const results=[
  checkShare(0,240,0), checkShare(1,100,1),
  checkShare(.2,10000,.2), checkShare(.5,10000,.5),
  checkShare(configuredShare,10000,configuredShare),
  checkShare(-1,240,0), checkShare(2,100,1),
  checkShare('invalid',240,0), checkShare(1,240,0,false)
];
const openings=Array.from({length:40},(_,i)=>checkShare(.2,4,.2,true,i+1).opening);
assert(new Set(openings.map(a=>a.slice(0,3).map(p=>p.id).join(','))).size>20,'initial postcards are not shuffled per load');
assert(new Set(openings.map(a=>a[3].id)).size===5,'initial photo does not vary across approved photos');
JSON.stringify(results);
'''
results = json.loads(evaluate(program))
for result in results:
    print(f"PASS share={result['share']}: {result['photos']} photos / {result['postcards']} postcards; stable preview, complete shuffled cycles, no immediate repeat")
print('PASS: 40 page-load seeds start with three random postcards and one random photo; all five approved photos appear as the fourth image.')
print('ALL BACKGROUND DECK CHECKS PASSED')
