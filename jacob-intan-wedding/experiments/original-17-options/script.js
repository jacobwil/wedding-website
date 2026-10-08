/* Side-by-side-in-time motion experiments. All landings are Web Animations API sequences,
   and the exact last transform is committed to inline style BEFORE the animation is cancelled.
   No class teardown or transform reset at the end of a fall. */
(() => {
  'use strict';
  const ART = [{"id":"geometric_stained_glass_heart","label":"Geometric stained glass heart","src":"assets/geometric_stained_glass_heart.webp","w":1200,"h":988},{"id":"japanese_cherry_blossoms_landscape","label":"Japanese cherry blossoms landscape","src":"assets/japanese_cherry_blossoms_landscape.webp","w":746,"h":1200},{"id":"london_skyline_yellow","label":"London skyline yellow","src":"assets/london_skyline_yellow.webp","w":1200,"h":962},{"id":"love_sculpture_in_park","label":"Love sculpture in park","src":"assets/love_sculpture_in_park.webp","w":1200,"h":863},{"id":"monet_water_lilies_bridge","label":"Monet water lilies bridge","src":"assets/monet_water_lilies_bridge.webp","w":886,"h":1200},{"id":"person_at_desk_blue_room","label":"Person at desk blue room","src":"assets/person_at_desk_blue_room.webp","w":892,"h":1200},{"id":"pink_lip_print","label":"Pink lip print","src":"assets/pink_lip_print.webp","w":1200,"h":859},{"id":"pointillist_studio_three_figures","label":"Pointillist studio three figures","src":"assets/pointillist_studio_three_figures.webp","w":1200,"h":869},{"id":"portrait_colorful_striped_dress","label":"Portrait colorful striped dress","src":"assets/portrait_colorful_striped_dress.webp","w":895,"h":1200},{"id":"purple_abstract_graffiti","label":"Purple abstract graffiti","src":"assets/purple_abstract_graffiti.webp","w":1200,"h":859},{"id":"seated_white_sculpture","label":"Seated white sculpture","src":"assets/seated_white_sculpture.webp","w":900,"h":1200},{"id":"sleeping_cats_red_background","label":"Sleeping cats red background","src":"assets/sleeping_cats_red_background.webp","w":1200,"h":840},{"id":"smiling_man_mosaic_portrait","label":"Smiling man mosaic portrait","src":"assets/smiling_man_mosaic_portrait.webp","w":856,"h":1200},{"id":"soto_ayam_ambengan_food_illustration","label":"Soto ayam ambengan food illustration","src":"assets/soto_ayam_ambengan_food_illustration.webp","w":1200,"h":847},{"id":"street_parade_striped_costume","label":"Street parade striped costume","src":"assets/street_parade_striped_costume.webp","w":710,"h":1200},{"id":"unsent_acrobat_backbend_ink_wash","label":"Acrobat backbend ink wash","src":"assets/unsent_acrobat_backbend_ink_wash.webp","w":1200,"h":903},{"id":"unsent_bainbridge_island_orcas","label":"Bainbridge island orcas","src":"assets/unsent_bainbridge_island_orcas.webp","w":845,"h":1200},{"id":"unsent_colorful_concentric_circles","label":"Colorful concentric circles","src":"assets/unsent_colorful_concentric_circles.webp","w":1200,"h":901},{"id":"unsent_japanese_cherry_blossoms_landscape","label":"Japanese cherry blossoms landscape","src":"assets/unsent_japanese_cherry_blossoms_landscape.webp","w":801,"h":1200},{"id":"unsent_la_pecora_bianca_restaurant","label":"La pecora bianca restaurant","src":"assets/unsent_la_pecora_bianca_restaurant.webp","w":880,"h":1200},{"id":"unsent_moomins_darling_beloved","label":"Moomins darling beloved","src":"assets/unsent_moomins_darling_beloved.webp","w":846,"h":1200},{"id":"unsent_seattle_space_needle_monorail","label":"Seattle space needle monorail","src":"assets/unsent_seattle_space_needle_monorail.webp","w":791,"h":1200},{"id":"vintage_valentine_greetings","label":"Vintage valentine greetings","src":"assets/vintage_valentine_greetings.webp","w":773,"h":1200},{"id":"woman_and_baby_indoors","label":"Woman and baby indoors","src":"assets/woman_and_baby_indoors.webp","w":1180,"h":1200}];
  const BASE = -4.25; // Fixed final rotation: isolates animation differences across options.
  const pose = ({x=0,y=0,z=BASE,rx=0,ry=0,s=1,sx=1,sy=1,skew=0}={}) =>
    `translate3d(${x}px,${y}px,0px) rotate(${z}deg) rotateX(${rx}deg) rotateY(${ry}deg) skewX(${skew}deg) scale(${(s*sx).toFixed(5)},${(s*sy).toFixed(5)})`;
  const K = (offset,opacity,geom={},easing='linear') => ({offset,opacity,transform:pose(geom),easing});
  const ease = 'cubic-bezier(.19,.7,.25,1)';
  const out = 'cubic-bezier(.12,.65,.28,1)';
  const gently = 'cubic-bezier(.22,.65,.35,1)';

  const options = [
    {
      name:'Current v3 · reference',tag:'THE REFERENCE',duration:1770,
      summary:'The current wedding-site motion: the card passes its final pose, then makes a tiny corrective move back.',
      flight:'It drops 29 px, yaws into place, tilts in 3D, and becomes mostly opaque by 72%.',
      landing:'At 72%, it is 1 px left and 1 px low, tilted −0.45° and rotated 0.35° too far. It then moves back and flattens.',
      note:'This final directional reversal is the suspected jerk. Here it is shown without any animation-class removal.',
      frames:[K(0,.18,{x:8,y:-29,z:-1.8,rx:5,s:1.012},ease),K(.34,.54,{x:2,y:-10,z:-3.3,rx:2.2,s:1.007},ease),K(.72,.88,{x:-1,y:1,z:BASE-.35,rx:-.45,s:1.002},ease),K(1,1)]
    },
    {
      name:'Stop at touchdown',tag:'YOUR IDEA A',duration:1770,
      summary:'Keep everything through phase 3, delete the corrective movement in phase 4, and finish fading to full opacity.',
      flight:'Same entrance and phase-3 overshoot as v3, so the first 72% is directly comparable.',
      landing:'The card freezes in its phase-3 pose at 72%. Only opacity changes from 88% to 100%. No last repositioning.',
      note:'Exactly your first requested option. The tiny 1 px / 0.35° overshoot becomes the resting pose.',
      frames:[K(0,.18,{x:8,y:-29,z:-1.8,rx:5,s:1.012},ease),K(.34,.54,{x:2,y:-10,z:-3.3,rx:2.2,s:1.007},ease),K(.72,.88,{x:-1,y:1,z:BASE-.35,rx:-.45,s:1.002},'linear'),K(1,1,{x:-1,y:1,z:BASE-.35,rx:-.45,s:1.002})]
    },
    {
      name:'Air-out shrink · 1.8%',tag:'YOUR IDEA B',duration:1810,
      summary:'The postcard is already at its exact final x, y and angle before the last phase; it only shrinks toward its center by 1.8%.',
      flight:'A familiar descending movement and rotational arrival, with scale still at 101.8% when the card reaches the table.',
      landing:'The x/y coordinates and orientation remain fixed from 72% onward; scale eases from 101.8% to 100%, while opacity reaches 100%.',
      note:'Exactly your second requested option. It reads as trapped air escaping beneath a flexible sheet, without a bounce.',
      frames:[K(0,.18,{x:8,y:-29,z:-1.8,rx:5,s:1.032},ease),K(.34,.55,{x:2,y:-10,z:-3.3,rx:2.2,s:1.025},ease),K(.72,.90,{s:1.018},'cubic-bezier(.15,.7,.3,1)'),K(1,1)]
    },
    {
      name:'Uninterrupted ease-out',tag:'NO OVERSHOOT',duration:1800,
      summary:'One smooth deceleration straight into the final resting transform, with no bounce, overshoot, or change of direction.',
      flight:'A 26 px descent with gently diminishing horizontal drift, tilt and rotation.',
      landing:'Every component approaches its destination monotonically. Opacity rises continuously to 100%.',
      note:'The simplest physically suggestive alternative, and the cleanest test of whether the reversal is the issue.',
      frames:[K(0,.18,{x:7,y:-26,z:-2,rx:4.5,s:1.011},out),K(.3,.54,{x:3,y:-12,z:-3.15,rx:2.2,s:1.005},out),K(.7,.87,{x:.7,y:-2.5,z:-4.05,rx:.45,s:1.001},out),K(1,1)]
    },
    {
      name:'Feather-soft arrival',tag:'SLOW & SOFT',duration:2350,
      summary:'A longer, quieter drift that seems to lose momentum gradually rather than make visible contact.',
      flight:'Starts 20 px high, with only 1.5° of extra yaw and a slow atmospheric descent.',
      landing:'The last 30% completes a very small, unidirectional flattening. No reversal.',
      note:'Less literal contact physics; more graceful background texture. Intentionally barely noticeable.',
      frames:[K(0,.10,{x:5,y:-20,z:-2.75,rx:2.4,s:1.008},gently),K(.42,.54,{x:2.2,y:-8.5,z:-3.65,rx:1.1,s:1.004},out),K(.76,.88,{x:.4,y:-1.7,z:-4.1,rx:.3,s:1.001},out),K(1,1)]
    },
    {
      name:'Edge-first laydown',tag:'PAPER TILT',duration:1830,
      summary:'The postcard looks as though one edge reaches the table a moment before the rest.',
      flight:'It falls with an 8° forward tilt in perspective and a small horizontal drift.',
      landing:'X and Y finish at 75%; the remaining movement is only the top edge flattening from 1.4° to 0°.',
      note:'A very subtle hinge-like effect. This has continued angular motion, but no position correction.',
      frames:[K(0,.22,{x:5,y:-23,z:-3,rx:8,s:1.01},out),K(.4,.6,{x:2,y:-9,z:-3.75,rx:4.5,s:1.004},out),K(.75,.91,{rx:1.4},'cubic-bezier(.24,.8,.38,1)'),K(1,1)]
    },
    {
      name:'Corner-first laydown',tag:'ASYMMETRIC CONTACT',duration:1920,
      summary:'A slight two-axis tilt makes it seem that a corner, not a whole edge, touches down first.',
      flight:'The card turns in X and Y perspective by a few degrees while descending.',
      landing:'Position and rotation are settled at 76%. A tiny residual 3D tilt levels out without reversing.',
      note:'More organic than edge-first, but perspective changes are slightly more perceptible.',
      frames:[K(0,.20,{x:-7,y:-25,z:-2.7,rx:6.4,ry:-5.3,s:1.008},gently),K(.42,.61,{x:-3,y:-11,z:-3.65,rx:3.6,ry:-2.8,s:1.003},out),K(.76,.91,{rx:.9,ry:-.8},out),K(1,1)]
    },
    {
      name:'Float, then land',tag:'SLOW AIRBORNE',duration:2100,
      summary:'The first half hangs gently in the air; the second half completes a soft, clean landing.',
      flight:'An initially slow descent from −27 px accelerates slightly before slowing again near contact.',
      landing:'No overshoot. Rotation, tilt and opacity all converge at the stationary resting position.',
      note:'Suggests air resistance before contact, without invoking a visible bounce.',
      frames:[K(0,.11,{x:7,y:-27,z:-2.7,rx:4,s:1.01},'cubic-bezier(.4,0,.65,.55)'),K(.42,.44,{x:4,y:-21,z:-3.3,rx:2.9,s:1.007},'cubic-bezier(.14,.7,.3,1)'),K(.78,.89,{x:.6,y:-2.6,z:-4.12,rx:.35,s:1.001},out),K(1,1)]
    },
    {
      name:'Lateral air drift',tag:'SIDEWAYS DRIFT',duration:2020,
      summary:'The card slides through the air on a shallow diagonal, then quietly sticks where it lands.',
      flight:'It begins 15 px to one side and 24 px high; both offsets shrink steadily.',
      landing:'The lateral movement fades to zero without a sliding correction after contact.',
      note:'Looks hand-dropped rather than perfectly vertical. No bounce of any kind.',
      frames:[K(0,.18,{x:15,y:-24,z:-1.95,rx:3.4,s:1.009},out),K(.37,.56,{x:8,y:-14,z:-3.15,rx:1.9,s:1.005},gently),K(.74,.9,{x:2,y:-3,z:-4.03,rx:.4,s:1.001},out),K(1,1)]
    },
    {
      name:'Barely there',tag:'MINIMUM MOTION',duration:1450,
      summary:'Almost an opacity transition: just a few pixels of descent and a fractional degree of rotation.',
      flight:'Starts 8 px above the table and 0.45° off-axis, already 25% opaque.',
      landing:'Everything approaches its destination continuously; its opacity gently catches up.',
      note:'The most unobtrusive option for a background that should never compete with the wedding content.',
      frames:[K(0,.25,{x:2,y:-8,z:BASE+.45,rx:.9,s:1.003},out),K(.66,.8,{x:.35,y:-1.5,z:BASE+.1,rx:.15,s:1.0004},out),K(1,1)]
    },
    {
      name:'Gravity, no bounce',tag:'CONTACT & HOLD',duration:1850,
      summary:'A gentle acceleration toward the table, followed by a complete stop and a final opacity fade.',
      flight:'Starts slowly, then accelerates through the last 10 px of descent, like a very light object finally losing lift.',
      landing:'All movement ends at 68%. The card then holds absolutely still while opacity moves from 84% to 100%.',
      note:'A useful control case: no visual settling once physical contact happens.',
      frames:[K(0,.18,{x:3,y:-25,z:-3,rx:3,s:1.007},'cubic-bezier(.42,0,.82,.35)'),K(.3,.46,{x:2.5,y:-21,z:-3.3,rx:2.5,s:1.006},'cubic-bezier(.42,0,.85,.46)'),K(.68,.84,{},'linear'),K(1,1)]
    },
    {
      name:'Airborne paper flutter',tag:'EARLY FLUTTER',duration:2200,
      summary:'A little irregular movement in the air, but the last quarter of the animation is entirely free of oscillation.',
      flight:'The card drifts 7 px to the right, then returns toward its final alignment while still airborne.',
      landing:'At 76% it is already stationary; only the final opacity fade continues.',
      note:'Keeps a personality-filled flutter while moving any directional changes far away from touchdown.',
      frames:[K(0,.10,{x:-4,y:-30,z:-2.6,rx:5,s:1.012},gently),K(.26,.43,{x:7,y:-21,z:-3.15,rx:3.5,s:1.008},gently),K(.5,.69,{x:3,y:-10,z:-3.9,rx:1.3,s:1.004},out),K(.76,.92,{},'linear'),K(1,1)]
    },
    {
      name:'Perspective only',tag:'STAYS PUT',duration:1650,
      summary:'No x/y travel. The postcard simply feels a little closer to the viewer, then becomes flat on the tabletop.',
      flight:'At the exact landing coordinates throughout. A 2.6% scale and 4° tilt imply a small change in depth.',
      landing:'The depth cues reduce smoothly to zero while the image becomes opaque.',
      note:'A useful extreme: removes positional movement entirely while retaining a physical suggestion of height.',
      frames:[K(0,.12,{rx:4,s:1.026},out),K(.46,.62,{rx:2,s:1.014},out),K(.76,.89,{rx:.45,s:1.003},out),K(1,1)]
    },
    {
      name:'Land early, fade late',tag:'LONG OPACITY TAIL',duration:1820,
      summary:'The motion finishes well before the postcard reaches full opacity, emphasizing permanence over momentum.',
      flight:'A conventional 22 px descent with small yaw and tilt; movement is complete at 55%.',
      landing:'For the remaining 45%, the postcard does not move at all; opacity rises from 68% to 100%.',
      note:'Like your “no phase 4” suggestion, but with an even longer motionless finish.',
      frames:[K(0,.16,{x:7,y:-22,z:-2.15,rx:3.3,s:1.01},out),K(.32,.49,{x:2.2,y:-8,z:-3.65,rx:1.15,s:1.004},out),K(.55,.68,{},'linear'),K(1,1)]
    },
    {
      name:'Delayed flattening',tag:'SEPARATE THE AXES',duration:1910,
      summary:'The center of the card stops moving before the card itself finishes flattening.',
      flight:'The card drifts downward and reaches its exact x/y and rotation at 68%.',
      landing:'Only its 2° forward tilt gradually flattens over the final third; there is no x/y motion or rotational recoil.',
      note:'A stronger expression of air escaping beneath the paper, without the shrink of option 03.',
      frames:[K(0,.16,{x:5,y:-24,z:-2.2,rx:6.5,s:1.008},out),K(.4,.54,{x:2,y:-10,z:-3.55,rx:3.5,s:1.003},out),K(.68,.87,{rx:2},'cubic-bezier(.12,.7,.28,1)'),K(1,1)]
    },
    {
      name:'Lengthwise compression',tag:'PAPER RELEASE',duration:1800,
      summary:'A one-axis variation on the air-out shrink: the postcard loses 1.6% in width and only 0.5% in height.',
      flight:'The card descends to the correct position and orientation by 70%, still slightly stretched along its long axis.',
      landing:'It compresses toward its center from 101.6% width / 100.5% height to natural size, while turning opaque.',
      note:'More directional than a uniform shrink; a subtle alternative if the air-out version feels too digital.',
      frames:[K(0,.18,{x:8,y:-27,z:-2,rx:4,sx:1.027,sy:1.014},ease),K(.36,.56,{x:3,y:-9,z:-3.4,rx:1.8,sx:1.022,sy:1.009},ease),K(.7,.89,{sx:1.016,sy:1.005},out),K(1,1)]
    },
    {
      name:'Shallow curved descent',tag:'ONE SMOOTH ARC',duration:2100,
      summary:'A modest diagonal arc instead of a straight drop: it curves gently into the resting point and never retraces.',
      flight:'The trajectory changes from 10 px right / 27 px high to 1 px right / 3 px high, while its perspective tilt decreases.',
      landing:'The curve straightens as it arrives. It ends at exactly the resting transform, with no rebound.',
      note:'Hints at a light sheet drifting on air; compare with the more linear lateral-drift option.',
      frames:[K(0,.14,{x:10,y:-27,z:-2,rx:4,s:1.01},'cubic-bezier(.38,.25,.52,.75)'),K(.3,.46,{x:9,y:-17,z:-3,rx:2.6,s:1.006},out),K(.67,.82,{x:3,y:-5,z:-3.85,rx:.8,s:1.002},out),K(1,1)]
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
    // Hide the old card until the next image has decoded. Each animation uses the same artwork unless changed explicitly.
    card.style.opacity = '0';
    card.style.transform = choice.frames[0].transform;
    progress.style.transform = 'scaleX(0)';
    if (img.getAttribute('src') !== artwork.src) img.src = artwork.src;
    img.alt = `Postcard: ${artwork.label}`;
    img.width = artwork.w;
    img.height = artwork.h;
    $('stage-status').textContent = 'PREPARING';
    try { await img.decode(); } catch (_) { /* Leave the image element to render normally if decode is unavailable. */ }
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
      // Exactly commit the last animated pose, then cancel: no change of geometry on cleanup.
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
