"""Check cached coverage geometry against the original rotated-rectangle math."""
import json
from pathlib import Path

from js_runtime import evaluate

source = (Path(__file__).resolve().parents[1] / 'script.js').read_text()
geometry = source[source.index('  function screenBounds('):source.index('  function cellsFor(')]
program = geometry + '''
let seed=123456789;
const random=(a,b)=>a+((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296)*(b-a);
const reference=(card,x,y,shift)=>{
  const dx=x-card.x-card.w/2, dy=y+shift-card.y-card.h/2;
  const ca=Math.cos(card.angle), sa=Math.sin(card.angle);
  return Math.abs(dx*ca+dy*sa)<=card.w/2 && Math.abs(-dx*sa+dy*ca)<=card.h/2;
};
let cases=0;
for(const shift of [0,180,432,900]) for(let i=0;i<100;i++) {
  const card={x:random(-200,1920),y:random(-200,2000),w:random(40,576),
    h:random(40,576),angle:random(-Math.PI,Math.PI)};
  const bounds=screenBounds(card,shift);
  for(let j=0;j<100;j++) {
    const x=card.x+random(-card.w,2*card.w), y=card.y-shift+random(-card.h,2*card.h);
    if(contains(bounds,x,y)!==reference(card,x,y,shift))
      throw new Error('cached geometry changed coverage');
    cases++;
  }
}
JSON.stringify({cases});
'''
result = json.loads(evaluate(program))
print(f"PASS: {result['cases']} rotated coverage samples match the original geometry across scroll offsets.")
