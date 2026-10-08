/* Focused motion experiments: hybrid variants that mix option 11's travel with option 13's settle.
   Like the earlier lab, all landings use the Web Animations API and the exact last transform
   is committed to inline style BEFORE the animation is cancelled. */
(() => {
  'use strict';
  const ART = [
  {
    "id": "geometric_stained_glass_heart",
    "label": "Geometric stained glass heart",
    "src": "assets/geometric_stained_glass_heart.webp",
    "w": 1200,
    "h": 988
  },
  {
    "id": "japanese_cherry_blossoms_landscape",
    "label": "Japanese cherry blossoms landscape",
    "src": "assets/japanese_cherry_blossoms_landscape.webp",
    "w": 746,
    "h": 1200
  },
  {
    "id": "london_skyline_yellow",
    "label": "London skyline yellow",
    "src": "assets/london_skyline_yellow.webp",
    "w": 1200,
    "h": 962
  },
  {
    "id": "love_sculpture_in_park",
    "label": "Love sculpture in park",
    "src": "assets/love_sculpture_in_park.webp",
    "w": 1200,
    "h": 863
  },
  {
    "id": "monet_water_lilies_bridge",
    "label": "Monet water lilies bridge",
    "src": "assets/monet_water_lilies_bridge.webp",
    "w": 886,
    "h": 1200
  },
  {
    "id": "person_at_desk_blue_room",
    "label": "Person at desk blue room",
    "src": "assets/person_at_desk_blue_room.webp",
    "w": 892,
    "h": 1200
  },
  {
    "id": "pink_lip_print",
    "label": "Pink lip print",
    "src": "assets/pink_lip_print.webp",
    "w": 1200,
    "h": 859
  },
  {
    "id": "pointillist_studio_three_figures",
    "label": "Pointillist studio three figures",
    "src": "assets/pointillist_studio_three_figures.webp",
    "w": 1200,
    "h": 869
  },
  {
    "id": "portrait_colorful_striped_dress",
    "label": "Portrait colorful striped dress",
    "src": "assets/portrait_colorful_striped_dress.webp",
    "w": 895,
    "h": 1200
  },
  {
    "id": "purple_abstract_graffiti",
    "label": "Purple abstract graffiti",
    "src": "assets/purple_abstract_graffiti.webp",
    "w": 1200,
    "h": 859
  },
  {
    "id": "seated_white_sculpture",
    "label": "Seated white sculpture",
    "src": "assets/seated_white_sculpture.webp",
    "w": 900,
    "h": 1200
  },
  {
    "id": "sleeping_cats_red_background",
    "label": "Sleeping cats red background",
    "src": "assets/sleeping_cats_red_background.webp",
    "w": 1200,
    "h": 840
  },
  {
    "id": "smiling_man_mosaic_portrait",
    "label": "Smiling man mosaic portrait",
    "src": "assets/smiling_man_mosaic_portrait.webp",
    "w": 856,
    "h": 1200
  },
  {
    "id": "soto_ayam_ambengan_food_illustration",
    "label": "Soto ayam ambengan food illustration",
    "src": "assets/soto_ayam_ambengan_food_illustration.webp",
    "w": 1200,
    "h": 847
  },
  {
    "id": "street_parade_striped_costume",
    "label": "Street parade striped costume",
    "src": "assets/street_parade_striped_costume.webp",
    "w": 710,
    "h": 1200
  },
  {
    "id": "unsent_acrobat_backbend_ink_wash",
    "label": "Acrobat backbend ink wash",
    "src": "assets/unsent_acrobat_backbend_ink_wash.webp",
    "w": 1200,
    "h": 903
  },
  {
    "id": "unsent_bainbridge_island_orcas",
    "label": "Bainbridge island orcas",
    "src": "assets/unsent_bainbridge_island_orcas.webp",
    "w": 845,
    "h": 1200
  },
  {
    "id": "unsent_colorful_concentric_circles",
    "label": "Colorful concentric circles",
    "src": "assets/unsent_colorful_concentric_circles.webp",
    "w": 1200,
    "h": 901
  },
  {
    "id": "unsent_japanese_cherry_blossoms_landscape",
    "label": "Japanese cherry blossoms landscape",
    "src": "assets/unsent_japanese_cherry_blossoms_landscape.webp",
    "w": 801,
    "h": 1200
  },
  {
    "id": "unsent_la_pecora_bianca_restaurant",
    "label": "La pecora bianca restaurant",
    "src": "assets/unsent_la_pecora_bianca_restaurant.webp",
    "w": 880,
    "h": 1200
  },
  {
    "id": "unsent_moomins_darling_beloved",
    "label": "Moomins darling beloved",
    "src": "assets/unsent_moomins_darling_beloved.webp",
    "w": 846,
    "h": 1200
  },
  {
    "id": "unsent_seattle_space_needle_monorail",
    "label": "Seattle space needle monorail",
    "src": "assets/unsent_seattle_space_needle_monorail.webp",
    "w": 791,
    "h": 1200
  },
  {
    "id": "vintage_valentine_greetings",
    "label": "Vintage valentine greetings",
    "src": "assets/vintage_valentine_greetings.webp",
    "w": 773,
    "h": 1200
  },
  {
    "id": "woman_and_baby_indoors",
    "label": "Woman and baby indoors",
    "src": "assets/woman_and_baby_indoors.webp",
    "w": 1180,
    "h": 1200
  }
];
  const BASE = -4.25;
  const pose = ({x=0,y=0,z=BASE,rx=0,ry=0,s=1,sx=1,sy=1,skew=0}={}) =>
    `translate3d(${x}px,${y}px,0px) rotate(${z}deg) rotateX(${rx}deg) rotateY(${ry}deg) skewX(${skew}deg) scale(${(s*sx).toFixed(5)},${(s*sy).toFixed(5)})`;
  const K = (offset,opacity,geom={},easing='linear') => ({offset,opacity,transform:pose(geom),easing});
  const out = 'cubic-bezier(.12,.65,.28,1)';
  const gently = 'cubic-bezier(.22,.65,.35,1)';
  const gravA = 'cubic-bezier(.42,0,.82,.35)';
  const gravB = 'cubic-bezier(.42,0,.85,.46)';
  const settle = 'cubic-bezier(.18,.72,.28,1)';
  const softSettle = 'cubic-bezier(.22,.78,.34,1)';

  const options = [
    {
      name:'Gravity, no bounce · reference',tag:'REFERENCE 11',duration:1850,
      summary:'The original option 11. It carries the slight hover-then-drop motion you liked, and stops completely once it arrives.',
      flight:'Starts slowly, then accelerates through the last 10 px of descent, like a light object finally losing lift.',
      landing:'All motion ends at 68%. The card then holds absolutely still while opacity moves from 84% to 100%.',
      note:'This is the travel reference: no settling motion after contact.',
      frames:[K(0,.18,{x:3,y:-25,z:-3,rx:3,s:1.007},gravA),K(.3,.46,{x:2.5,y:-21,z:-3.3,rx:2.5,s:1.006},gravB),K(.68,.84,{},'linear'),K(1,1)]
    },
    {
      name:'Perspective only · reference',tag:'REFERENCE 13',duration:1650,
      summary:'The original option 13. It barely travels at all, but the final flattening / depth release is very clean.',
      flight:'At the exact landing coordinates throughout. A 2.6% scale and 4° tilt imply a small change in depth.',
      landing:'The depth cues reduce smoothly to zero while the image becomes opaque.',
      note:'This is the settling reference: the arrival feeling comes from flattening rather than x/y correction.',
      frames:[K(0,.12,{rx:4,s:1.026},out),K(.46,.62,{rx:2,s:1.014},out),K(.76,.89,{rx:.45,s:1.003},out),K(1,1)]
    },
    {
      name:'Direct hybrid',tag:'11 PATH + 13 END',duration:1860,
      summary:'The most literal fusion: option 11’s path, then option 13’s clean perspective settle once the card has arrived.',
      flight:'Uses the same slight hover and gravity-led descent as option 11.',
      landing:'At 68%, x/y and rotation are finished. From there, only a 1.7° tilt and 1.2% depth scale flatten out while opacity rises to 100%.',
      note:'This is the baseline hybrid and probably the clearest answer to your request.',
      frames:[K(0,.18,{x:3,y:-25,z:-3,rx:3,s:1.012},gravA),K(.3,.46,{x:2.5,y:-21,z:-3.3,rx:2.5,s:1.01},gravB),K(.68,.84,{rx:1.7,s:1.012},settle),K(1,1)]
    },
    {
      name:'Softer direct hybrid',tag:'QUIETER LANDING',duration:2010,
      summary:'Same concept as the direct hybrid, but the settle is more gradual and less perceptible.',
      flight:'The 11-style path remains intact, though the final approach is slightly less abrupt.',
      landing:'After contact, only a small 1.2° perspective flattening and 0.8% scale release remain.',
      note:'A good option if you want the combination but with less visible “action” at the end.',
      frames:[K(0,.17,{x:3,y:-25,z:-3,rx:3.2,s:1.011},gravA),K(.32,.48,{x:2.4,y:-20,z:-3.35,rx:2.45,s:1.009},gravB),K(.7,.85,{rx:1.2,s:1.008},softSettle),K(1,1)]
    },
    {
      name:'Longer perspective exhale',tag:'MORE OF 13',duration:2140,
      summary:'Keeps 11’s travel, but extends 13’s flattening phase so the ending feels more like the card is gently exhaling onto the table.',
      flight:'A recognizable 11-style descent with small early hover and increasing commitment near the bottom.',
      landing:'The last 42% is devoted to a smooth flattening from 2.2° tilt and 1.5% scale down to perfectly flat.',
      note:'This emphasizes the settle you liked in 13 more strongly than the direct hybrid does.',
      frames:[K(0,.17,{x:3,y:-25,z:-3,rx:3,s:1.013},gravA),K(.26,.39,{x:2.8,y:-22,z:-3.25,rx:2.65,s:1.012},gravB),K(.58,.79,{rx:2.2,s:1.015},settle),K(1,1)]
    },
    {
      name:'Hold then flatten',tag:'CLEAR CONTACT',duration:1930,
      summary:'The card lands with 11’s motion, pauses for a beat, then performs 13’s settling flatten.',
      flight:'The travel is pure option 11 through arrival.',
      landing:'At 64% it has already reached the destination. It holds there momentarily, then uses only perspective flattening and opacity to finish.',
      note:'This makes the phases easier to read: arrival first, settle second.',
      frames:[K(0,.18,{x:3,y:-25,z:-3,rx:3,s:1.011},gravA),K(.32,.49,{x:2.4,y:-20.5,z:-3.3,rx:2.3,s:1.008},gravB),K(.64,.80,{rx:1.5,s:1.01},'linear'),K(.78,.86,{rx:1.5,s:1.01},'linear'),K(1,1,{},settle)]
    },
    {
      name:'Drifted hybrid',tag:'A TOUCH MORE TRAVEL',duration:1960,
      summary:'Option 11’s gravity-like movement, but with a little more sideways drift before the same clean 13-style flattening.',
      flight:'Begins a bit farther right and curves back in while descending, still with the late-drop feel of option 11.',
      landing:'Once placed, the only remaining motion is a 1.4° flattening and 1.0% scale release.',
      note:'If you liked 11 because it moved around a bit more, this may be closer to that feeling.',
      frames:[K(0,.16,{x:7,y:-27,z:-2.85,rx:3.2,s:1.012},gently),K(.34,.47,{x:4,y:-20,z:-3.4,rx:2.4,s:1.009},gravB),K(.69,.84,{rx:1.4,s:1.01},settle),K(1,1)]
    },
    {
      name:'Compressed settle hybrid',tag:'13 + PAPER RELEASE',duration:1890,
      summary:'After the 11-style path finishes, the card settles like 13 but also sheds a tiny amount of width, as if air is leaving underneath.',
      flight:'The descent follows option 11’s logic: slight hover, then a more decisive last part of the drop.',
      landing:'No x/y change after contact. The card flattens from 1.3° tilt while width eases from 101.0% to 100.0% and opacity reaches full.',
      note:'This adds a paper-release accent without reintroducing a corrective repositioning.',
      frames:[K(0,.18,{x:3,y:-25,z:-3,rx:3,sx:1.016,sy:1.008},gravA),K(.3,.46,{x:2.5,y:-21,z:-3.3,rx:2.4,sx:1.013,sy:1.006},gravB),K(.68,.84,{rx:1.3,sx:1.01,sy:1.002},settle),K(1,1)]
    },
    {
      name:'Micro-tilt settle',tag:'MINIMALIST HYBRID',duration:1780,
      summary:'A restrained version of the hybrid: the path still feels like 11, but the settling is barely-there 13.',
      flight:'The route and timing are recognizably option 11, just slightly tightened.',
      landing:'After arrival, only a 0.8° flattening and 0.5% scale release remain.',
      note:'This is for maximum subtlety: enough life to feel physical, but unlikely to call attention to itself.',
      frames:[K(0,.19,{x:2.5,y:-24,z:-3.05,rx:2.8,s:1.009},gravA),K(.32,.49,{x:2.1,y:-20,z:-3.32,rx:2.15,s:1.007},gravB),K(.7,.86,{rx:.8,s:1.005},softSettle),K(1,1)]
    },
    {
      name:'Curved travel + perspective settle',tag:'ARC + FLATTEN',duration:2080,
      summary:'A slightly more graceful version: it keeps the “losing lift” idea of 11, but arrives along a shallow arc before using 13’s settle.',
      flight:'Starts a little farther right and higher, then curves in smoothly, with no rebound or correction.',
      landing:'By 72%, the card is exactly placed. The remaining motion is only depth flattening from 1.6° and 1.1% scale.',
      note:'This is the most atmospheric of the hybrids, if you want the background art to feel poetic rather than literal.',
      frames:[K(0,.15,{x:9,y:-28,z:-2.7,rx:3.5,s:1.012},'cubic-bezier(.38,.25,.52,.75)'),K(.36,.48,{x:5,y:-18,z:-3.5,rx:2.25,s:1.009},out),K(.72,.84,{rx:1.6,s:1.011},settle),K(1,1)]
    }
  ];

  const $ = id => document.getElementById(id);
  const card = $('sample-card');
  const img = $('card-image');
  const strip = $('option-strip');
  const progress = $('progress-bar');
  const stage = $('stage');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let selected = 0, artIndex = 3, speed = 1, autoplay = false;
  let animation = null, progressAnimation = null, autoTimer = null, generation = 0;

  function formatIndex(n,total) { return `${String(n+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`; }
  function setStageCardSize() {
    const art = ART[artIndex];
    const longEdge = Math.min(435, stage.clientWidth * .65, stage.clientHeight * .79);
    const edge = Math.max(art.w,art.h);
    card.style.width = `${Math.round(longEdge * art.w/edge)}px`;
    card.style.height = `${Math.round(longEdge * art.h/edge)}px`;
  }
  function updateCopy() {
    const choice = options[selected];
    $('option-counter').innerHTML = `${formatIndex(selected,options.length)} <span>${choice.tag}</span>`;
    $('option-title').textContent = choice.name;
    $('option-summary').textContent = choice.summary;
    $('option-flight').textContent = choice.flight;
    $('option-landing').textContent = choice.landing;
    $('option-note').textContent = choice.note;
    $('time-label').textContent = `${(choice.duration / speed / 1000).toFixed(2)} S / ${speed === .5 ? 'SLOW' : speed === 1.5 ? 'FAST' : 'NORMAL'}`;
    [...strip.children].forEach((button,i) => {
      button.setAttribute('aria-current', i === selected ? 'true' : 'false');
      button.tabIndex = i === selected ? 0 : -1;
    });
    const current = strip.children[selected];
    if (current) {
      if (current.offsetLeft < strip.scrollLeft) strip.scrollLeft = current.offsetLeft;
      if (current.offsetLeft + current.offsetWidth > strip.scrollLeft + strip.clientWidth) strip.scrollLeft = current.offsetLeft + current.offsetWidth - strip.clientWidth;
    }
  }
  function stop() {
    generation++;
    clearTimeout(autoTimer);
    autoTimer=null;
    if (animation) {animation.cancel();animation=null;}
    if (progressAnimation) {progressAnimation.cancel();progressAnimation=null;}
  }
  function scheduleNext() {
    clearTimeout(autoTimer);
    if (autoplay && !document.hidden && !reduced.matches) {
      autoTimer = setTimeout(() => choose((selected + 1) % options.length),2100);
    }
  }
  async function replay() {
    stop();
    const token = generation;
    const choice = options[selected];
    const artwork = ART[artIndex];
    setStageCardSize();
    $('art-label').textContent = `${formatIndex(artIndex,ART.length)}`;
    $('time-label').textContent = `${(choice.duration / speed / 1000).toFixed(2)} S / ${speed === .5 ? 'SLOW' : speed === 1.5 ? 'FAST' : 'NORMAL'}`;
    card.style.opacity = '0';
    card.style.transform = choice.frames[0].transform;
    progress.style.transform = 'scaleX(0)';
    if (img.getAttribute('src') !== artwork.src) img.src = artwork.src;
    img.alt = `Postcard: ${artwork.label}`;
    img.width = artwork.w;
    img.height = artwork.h;
    $('stage-status').textContent = 'PREPARING';
    try { await img.decode(); } catch (_) {}
    if (token !== generation) return;

    const last = choice.frames[choice.frames.length - 1];
    if (reduced.matches) {
      card.style.opacity = String(last.opacity);
      card.style.transform = last.transform;
      progress.style.transform = 'scaleX(1)';
      $('stage-status').textContent = 'STATIC · REDUCED MOTION';
      return;
    }
    const ms = Math.round(choice.duration / speed);
    card.style.opacity = String(choice.frames[0].opacity);
    animation = card.animate(choice.frames,{duration:ms,fill:'both',easing:'linear'});
    progressAnimation = progress.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:ms,fill:'forwards',easing:'linear'});
    $('stage-status').textContent = 'IN MOTION';
    const current = animation;
    current.finished.then(() => {
      if (token !== generation || animation !== current) return;
      card.style.opacity = String(last.opacity);
      card.style.transform = last.transform;
      current.cancel();
      animation = null;
      progress.style.transform = 'scaleX(1)';
      if (progressAnimation) { progressAnimation.cancel(); progressAnimation=null; }
      $('stage-status').textContent = 'AT REST';
      scheduleNext();
    }).catch(() => {});
  }
  function choose(index) {
    selected = (index + options.length) % options.length;
    updateCopy();
    replay();
  }
  options.forEach((choice,i) => {
    const button = document.createElement('button');
    button.type='button';
    button.innerHTML = `<span class="strip-num">${String(i+1).padStart(2,'0')}</span><span class="strip-name"></span>`;
    button.querySelector('.strip-name').textContent=choice.name.replace(' · reference','');
    button.setAttribute('aria-label',`Option ${i+1}: ${choice.name}`);
    button.addEventListener('click', () => choose(i));
    strip.append(button);
  });

  $('prev').addEventListener('click', () => choose(selected - 1));
  $('next').addEventListener('click', () => choose(selected + 1));
  $('replay').addEventListener('click', replay);
  $('change-art').addEventListener('click', () => {artIndex = (artIndex + 1) % ART.length;replay();});
  document.querySelectorAll('[data-speed]').forEach(button => button.addEventListener('click', () => {
    speed = Number(button.dataset.speed);
    document.querySelectorAll('[data-speed]').forEach(b => {b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',b===button?'true':'false');});
    replay();
  }));
  $('autoplay').addEventListener('click', () => {
    autoplay = !autoplay;
    $('autoplay').setAttribute('aria-pressed',String(autoplay));
    clearTimeout(autoTimer);
    if (autoplay && !animation) scheduleNext();
  });
  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
    if (event.key === 'ArrowLeft') {event.preventDefault();choose(selected-1);}
    if (event.key === 'ArrowRight') {event.preventDefault();choose(selected+1);}
    if (event.code === 'Space' && event.target.tagName !== 'BUTTON') {event.preventDefault();replay();}
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {clearTimeout(autoTimer);autoTimer=null;}
    else if (autoplay && !animation) scheduleNext();
  });
  reduced.addEventListener('change',replay);
  window.addEventListener('resize',setStageCardSize,{passive:true});

  updateCopy();
  replay();
})();
