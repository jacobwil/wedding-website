/* Intan's scroll opening. No dependency, no server-side visit tracking. */
(() => {
  const hero = document.querySelector('.landing-hero');
  if (!hero) return;
  const introMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const words = [...hero.querySelectorAll('.landing-word')];
  const dots = [...hero.querySelectorAll('.landing-progress i')];
  const label = hero.querySelector('.landing-scroll-label');
  const cookieName = 'wedding_intro_seen';
  let recent = false;
  try { recent = document.cookie.split(';').some(value => value.trim().startsWith(`${cookieName}=`)); } catch (_) { /* file:// and storage-blocked browsers still work. */ }
  const review = new URLSearchParams(location.search);
  const replay = document.querySelector('.landing-replay');
  if (replay) {
    const target = new URL(location.href);
    target.searchParams.set('intro', 'replay');
    target.hash = 'home';
    replay.href = target.href;
    replay.addEventListener('click', event => {
      if (location.href !== target.href || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      // Clicking again at the same URL must reload rather than just follow its hash.
      event.preventDefault();
      history.scrollRestoration = 'manual';
      scrollTo({top:0,behavior:'instant'});
      location.reload();
    });
  }
  let long = (!recent || review.get('intro') === 'replay') && !introMotion.matches && (!location.hash || location.hash === '#home');
  const state = window.weddingLanding = { fullWidth:true, travel:0, openingCount:review.get('pile') === 'airy' ? 6 : 8, openingLayout:review.get('pile') === 'loose' ? 'loose' : 'balanced' };
  const nativeWords = CSS.supports('animation-timeline: scroll(root block)') && CSS.supports('animation-range: 0px 1px');
  let height = innerHeight, heroTop = 0, viewportWidth = innerWidth, frame = null, idleTimer = null, cycleTimer = null, fadingTimer = null;
  let lastActivity = performance.now();
  let complete = !long, index = long ? 0 : 3, cycling = false, lastProgress = null;
  // Non-sliding expiry: a return visit doesn't extend the three-day window.
  if (!recent && !introMotion.matches) {
    try { document.cookie = `${cookieName}=1; Max-Age=259200; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`; } catch (_) {}
  }
  function configure(measuredHeight) {
    hero.classList.toggle('is-long-intro', long);
    height = measuredHeight ?? hero.querySelector('.landing-stage').getBoundingClientRect().height;
    heroTop = hero.offsetTop;
    state.travel = long ? height * 3 : 0;
    state.nativeWords = nativeWords && long;
    hero.classList.toggle('has-native-words', state.nativeWords);
    hero.style.setProperty('--intro-height', `${height}px`);
    hero.style.setProperty('--intro-travel', `${state.travel}px`);
    document.dispatchEvent(new Event('wedding:landing-layout'));
  }
  function showScroll() {
    const progress = long ? Math.min(3, Math.max(0, (scrollY - heroTop) / height)) : 3;
    if (lastProgress === progress) return;
    lastProgress = progress;
    const nextIndex = Math.round(progress);
    if (!state.nativeWords) {
      for (let i=0; i<words.length; i++) {
        words[i].style.transform = `translate3d(0,${(i-progress)*height}px,0) skewX(-7deg)`;
      }
    }
    if (nextIndex !== index || !dots[nextIndex].classList.contains('is-current')) {
      dots.forEach((dot,i) => dot.classList.toggle('is-current', i === nextIndex));
    }
    index = nextIndex;
    const finished = progress >= 2.995;
    const nextLabel = finished ? 'The details' : 'A little closer';
    if (label.textContent !== nextLabel) label.textContent = nextLabel;
    if (finished && !complete) { complete = true; armIdle(); }
    if (!finished) complete = false;
  }
  function visible() {
    return !document.hidden && scrollY >= heroTop && scrollY <= heroTop + state.travel + height * .2;
  }
  function stopCycle() {
    clearTimeout(cycleTimer); clearTimeout(fadingTimer);
    cycleTimer = fadingTimer = null; cycling = false;
    hero.classList.remove('is-cycling');
    words.forEach(word => { word.style.removeProperty('opacity'); word.style.removeProperty('transform'); });
    lastProgress = null;
  }
  function cycle() {
    if (!complete || !visible() || introMotion.matches) { stopCycle(); return; }
    const current = words[index];
    current.style.opacity = '0';
    fadingTimer = setTimeout(() => {
      index = (index + 1) % words.length;
      words.forEach((word,i) => {
        word.style.transform = `translate3d(0,${i === index ? 0 : height}px,0) skewX(-7deg)`;
        word.style.opacity = '0';
      });
      requestAnimationFrame(() => requestAnimationFrame(() => { words[index].style.opacity = '1'; }));
      dots.forEach((dot,i) => dot.classList.toggle('is-current', i === index));
    }, 350);
    cycleTimer = setTimeout(cycle, 3000);
  }
  function armIdle() {
    if (!complete || introMotion.matches || !visible()) { clearTimeout(idleTimer); idleTimer=null; return; }
    if (idleTimer != null || cycling) return;
    const remaining = Math.max(0, 30000 - (performance.now() - lastActivity));
    idleTimer = setTimeout(() => {
      idleTimer=null;
      if (performance.now() - lastActivity < 30000) { armIdle(); return; }
      if (!complete || !visible() || introMotion.matches) return;
      words.forEach((word,i) => { word.style.transform = `translate3d(0,${i === index ? 0 : height}px,0) skewX(-7deg)`; word.style.opacity = i === index ? '1' : '0'; });
      cycling = true; hero.classList.add('is-cycling'); cycle();
    }, remaining);
  }
  function interaction() {
    lastActivity = performance.now();
    if (cycling) { stopCycle(); showScroll(); }
    armIdle();
  }
  addEventListener('scroll', () => {
    lastActivity = performance.now();
    if (frame == null) frame = requestAnimationFrame(() => {
      frame=null;
      if (cycling) stopCycle();
      showScroll(); armIdle();
    });
  }, {passive:true});
  for (const type of ['pointerdown','pointermove','keydown','wheel','touchstart']) addEventListener(type, interaction, {passive:true});
  document.addEventListener('visibilitychange', () => { stopCycle(); showScroll(); interaction(); });
  if ('ResizeObserver' in window) {
    new ResizeObserver(entries => {
      const nextHeight = entries[0].borderBoxSize?.[0]?.blockSize ?? entries[0].contentRect.height;
      if (nextHeight === height && innerWidth === viewportWidth) return;
      viewportWidth = innerWidth;
      configure(nextHeight); stopCycle(); showScroll(); interaction();
    }).observe(hero.querySelector('.landing-stage'));
  } else {
    addEventListener('resize', () => { configure(); stopCycle(); showScroll(); interaction(); }, {passive:true});
  }
  introMotion.addEventListener('change', () => {
    const previousTravel = state.travel;
    const previousScroll = scrollY;
    if (introMotion.matches) long = false;
    configure(); stopCycle(); showScroll(); armIdle();
    // Preserve the content position when the long opening is removed.
    if (previousTravel) scrollTo({top:Math.max(0,previousScroll-previousTravel),behavior:'instant'});
  });
  configure(); showScroll(); armIdle();
})();

/* Postcards and selected photos on a virtual table. Gentle hybrid landing motions.
   No dependencies; works from file:// as well as a web host. */
(() => {
  const plane = document.getElementById('postcard-plane');
  const ART = [{"id":"geometric_stained_glass_heart","thumb":"thumbnails/geometric_stained_glass_heart.webp","tw":480,"mid":"medium/geometric_stained_glass_heart.webp","mw":960,"full":"images/geometric_stained_glass_heart.webp","fw":1200,"width":1200,"height":988},{"id":"japanese_cherry_blossoms_landscape","thumb":"thumbnails/japanese_cherry_blossoms_landscape.webp","tw":299,"mid":"medium/japanese_cherry_blossoms_landscape.webp","mw":597,"full":"images/japanese_cherry_blossoms_landscape.webp","fw":746,"width":746,"height":1200},{"id":"london_skyline_yellow","thumb":"thumbnails/london_skyline_yellow.webp","tw":480,"mid":"medium/london_skyline_yellow.webp","mw":960,"full":"images/london_skyline_yellow.webp","fw":1200,"width":1200,"height":962},{"id":"love_sculpture_in_park","thumb":"thumbnails/love_sculpture_in_park.webp","tw":480,"mid":"medium/love_sculpture_in_park.webp","mw":960,"full":"images/love_sculpture_in_park.webp","fw":1200,"width":1200,"height":863},{"id":"monet_water_lilies_bridge","thumb":"thumbnails/monet_water_lilies_bridge.webp","tw":354,"mid":"medium/monet_water_lilies_bridge.webp","mw":709,"full":"images/monet_water_lilies_bridge.webp","fw":886,"width":886,"height":1200},{"id":"person_at_desk_blue_room","thumb":"thumbnails/person_at_desk_blue_room.webp","tw":357,"mid":"medium/person_at_desk_blue_room.webp","mw":714,"full":"images/person_at_desk_blue_room.webp","fw":892,"width":892,"height":1200},{"id":"pink_lip_print","thumb":"thumbnails/pink_lip_print.webp","tw":480,"mid":"medium/pink_lip_print.webp","mw":960,"full":"images/pink_lip_print.webp","fw":1200,"width":1200,"height":859},{"id":"pointillist_studio_three_figures","thumb":"thumbnails/pointillist_studio_three_figures.webp","tw":480,"mid":"medium/pointillist_studio_three_figures.webp","mw":960,"full":"images/pointillist_studio_three_figures.webp","fw":1200,"width":1200,"height":869},{"id":"portrait_colorful_striped_dress","thumb":"thumbnails/portrait_colorful_striped_dress.webp","tw":358,"mid":"medium/portrait_colorful_striped_dress.webp","mw":716,"full":"images/portrait_colorful_striped_dress.webp","fw":895,"width":895,"height":1200},{"id":"purple_abstract_graffiti","thumb":"thumbnails/purple_abstract_graffiti.webp","tw":480,"mid":"medium/purple_abstract_graffiti.webp","mw":960,"full":"images/purple_abstract_graffiti.webp","fw":1200,"width":1200,"height":859},{"id":"seated_white_sculpture","thumb":"thumbnails/seated_white_sculpture.webp","tw":360,"mid":"medium/seated_white_sculpture.webp","mw":720,"full":"images/seated_white_sculpture.webp","fw":900,"width":900,"height":1200},{"id":"sleeping_cats_red_background","thumb":"thumbnails/sleeping_cats_red_background.webp","tw":480,"mid":"medium/sleeping_cats_red_background.webp","mw":960,"full":"images/sleeping_cats_red_background.webp","fw":1200,"width":1200,"height":840},{"id":"smiling_man_mosaic_portrait","thumb":"thumbnails/smiling_man_mosaic_portrait.webp","tw":342,"mid":"medium/smiling_man_mosaic_portrait.webp","mw":685,"full":"images/smiling_man_mosaic_portrait.webp","fw":856,"width":856,"height":1200},{"id":"soto_ayam_ambengan_food_illustration","thumb":"thumbnails/soto_ayam_ambengan_food_illustration.webp","tw":480,"mid":"medium/soto_ayam_ambengan_food_illustration.webp","mw":960,"full":"images/soto_ayam_ambengan_food_illustration.webp","fw":1200,"width":1200,"height":847},{"id":"street_parade_striped_costume","thumb":"thumbnails/street_parade_striped_costume.webp","tw":284,"mid":"medium/street_parade_striped_costume.webp","mw":568,"full":"images/street_parade_striped_costume.webp","fw":710,"width":710,"height":1200},{"id":"unsent_acrobat_backbend_ink_wash","thumb":"thumbnails/unsent_acrobat_backbend_ink_wash.webp","tw":480,"mid":"medium/unsent_acrobat_backbend_ink_wash.webp","mw":960,"full":"images/unsent_acrobat_backbend_ink_wash.webp","fw":1200,"width":1200,"height":903},{"id":"unsent_bainbridge_island_orcas","thumb":"thumbnails/unsent_bainbridge_island_orcas.webp","tw":338,"mid":"medium/unsent_bainbridge_island_orcas.webp","mw":676,"full":"images/unsent_bainbridge_island_orcas.webp","fw":845,"width":845,"height":1200},{"id":"unsent_colorful_concentric_circles","thumb":"thumbnails/unsent_colorful_concentric_circles.webp","tw":480,"mid":"medium/unsent_colorful_concentric_circles.webp","mw":960,"full":"images/unsent_colorful_concentric_circles.webp","fw":1200,"width":1200,"height":901},{"id":"unsent_japanese_cherry_blossoms_landscape","thumb":"thumbnails/unsent_japanese_cherry_blossoms_landscape.webp","tw":320,"mid":"medium/unsent_japanese_cherry_blossoms_landscape.webp","mw":641,"full":"images/unsent_japanese_cherry_blossoms_landscape.webp","fw":801,"width":801,"height":1200},{"id":"unsent_la_pecora_bianca_restaurant","thumb":"thumbnails/unsent_la_pecora_bianca_restaurant.webp","tw":352,"mid":"medium/unsent_la_pecora_bianca_restaurant.webp","mw":704,"full":"images/unsent_la_pecora_bianca_restaurant.webp","fw":880,"width":880,"height":1200},{"id":"unsent_moomins_darling_beloved","thumb":"thumbnails/unsent_moomins_darling_beloved.webp","tw":338,"mid":"medium/unsent_moomins_darling_beloved.webp","mw":677,"full":"images/unsent_moomins_darling_beloved.webp","fw":846,"width":846,"height":1200},{"id":"unsent_seattle_space_needle_monorail","thumb":"thumbnails/unsent_seattle_space_needle_monorail.webp","tw":316,"mid":"medium/unsent_seattle_space_needle_monorail.webp","mw":633,"full":"images/unsent_seattle_space_needle_monorail.webp","fw":791,"width":791,"height":1200},{"id":"vintage_valentine_greetings","thumb":"thumbnails/vintage_valentine_greetings.webp","tw":309,"mid":"medium/vintage_valentine_greetings.webp","mw":618,"full":"images/vintage_valentine_greetings.webp","fw":773,"width":773,"height":1200},{"id":"woman_and_baby_indoors","thumb":"thumbnails/woman_and_baby_indoors.webp","tw":472,"mid":"medium/woman_and_baby_indoors.webp","mw":944,"full":"images/woman_and_baby_indoors.webp","fw":1180,"width":1180,"height":1200}];
  const PHOTOS = window.WEDDING_PHOTOS || [];
  const requestedPhotoShare = Number((window.WEDDING_BACKGROUND || {}).photoShare ?? .20);
  const PHOTO_SHARE = PHOTOS.length && Number.isFinite(requestedPhotoShare)
    ? Math.max(0, Math.min(1, requestedPhotoShare)) : 0;
  const restPose = degrees => `rotate(${degrees.toFixed(3)}deg)`;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const landing = window.weddingLanding;
  const fullWidth = Boolean(landing?.fullWidth);
  const PARALLAX = 0.18;
  const COVERAGE_TARGET = 0.70;
  const random = (a, b) => a + Math.random() * (b - a);
  const shuffle = items => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  const choose = items => items[Math.floor(Math.random() * items.length)];
  const pose = ({x=0,y=0,z=0,rx=0,ry=0,s=1,sx=1,sy=1,skew=0}={}) =>
    `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(${z.toFixed(3)}deg) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) skewX(${skew.toFixed(3)}deg) scale(${(s*sx).toFixed(5)},${(s*sy).toFixed(5)})`;
  const K = (offset, opacity, geom={}, easing='linear') => ({offset, opacity, transform:pose(geom), easing});
  const easeOut = 'cubic-bezier(.12,.65,.28,1)';
  const gently = 'cubic-bezier(.22,.65,.35,1)';
  const gravA = 'cubic-bezier(.42,0,.82,.35)';
  const gravB = 'cubic-bezier(.42,0,.85,.46)';
  const settle = 'cubic-bezier(.18,.72,.28,1)';
  const softSettle = 'cubic-bezier(.22,.78,.34,1)';

  // The original options 4, 5 and 6, re-based around each card's actual
  // resting angle. Every contact/hold keyframe explicitly retains finalDeg;
  // omitted transform values MUST NOT reset the card toward zero rotation.
  const MOTION_PROFILES = [
    {
      id:'soft-hybrid', label:'04 · Softer direct hybrid', baseDuration:[1860,2060],
      build:(finalDeg, seed) => [
        K(0,.17,{x:3*seed.side,y:-25,z:finalDeg+1.25*seed.turn,rx:3.2,s:1.011},gravA),
        K(.32,.48,{x:2.4*seed.side,y:-20,z:finalDeg+.90*seed.turn,rx:2.45,s:1.009},gravB),
        K(.70,.85,{z:finalDeg,rx:1.2,s:1.008},softSettle),
        K(1,1,{z:finalDeg})
      ]
    },
    {
      id:'long-exhale', label:'05 · Longer perspective exhale', baseDuration:[2050,2250],
      build:(finalDeg, seed) => [
        K(0,.17,{x:3*seed.side,y:-25,z:finalDeg+1.25*seed.turn,rx:3,s:1.013},gravA),
        K(.26,.39,{x:2.8*seed.side,y:-22,z:finalDeg+1.0*seed.turn,rx:2.65,s:1.012},gravB),
        K(.58,.79,{z:finalDeg,rx:2.2,s:1.015},settle),
        K(1,1,{z:finalDeg})
      ]
    },
    {
      id:'hold-flatten', label:'06 · Hold then flatten', baseDuration:[1880,2060],
      build:(finalDeg, seed) => [
        K(0,.18,{x:3*seed.side,y:-25,z:finalDeg+1.25*seed.turn,rx:3,s:1.011},gravA),
        K(.32,.49,{x:2.4*seed.side,y:-20.5,z:finalDeg+.95*seed.turn,rx:2.3,s:1.008},gravB),
        K(.64,.80,{z:finalDeg,rx:1.5,s:1.01},'linear'),
        K(.78,.86,{z:finalDeg,rx:1.5,s:1.01},'linear'),
        K(1,1,{z:finalDeg},settle)
      ]
    }
  ];

  const ADDITIONAL_MOTION_PROFILES = [
{
      // Hybrid study 07: a little more sideways drift during the approach.
      id:'drifted', label:'07 · Drifted hybrid', baseDuration:[1900,2100],
      build:(finalDeg, seed) => [
        K(0,.16,{x:8*seed.side,y:-27,z:finalDeg+1.25*seed.turn,rx:3.2,s:1.012},gently),
        K(.34,.47,{x:4*seed.side,y:-20,z:finalDeg+.85*seed.turn,rx:2.4,s:1.009},gravB),
        K(.69,.84,{z:finalDeg,rx:1.4,s:1.01},settle),
        K(1,1,{z:finalDeg})
      ]
    },
    {
      // Hybrid study 08: a slight horizontal paper-release compression.
      id:'compressed', label:'08 · Compressed settle', baseDuration:[1860,2020],
      build:(finalDeg, seed) => [
        K(0,.18,{x:3*seed.side,y:-25,z:finalDeg+1.25*seed.turn,rx:3,sx:1.016,sy:1.008},gravA),
        K(.30,.46,{x:2.5*seed.side,y:-21,z:finalDeg+.85*seed.turn,rx:2.4,sx:1.013,sy:1.006},gravB),
        K(.68,.84,{z:finalDeg,rx:1.3,sx:1.01,sy:1.002},settle),
        K(1,1,{z:finalDeg})
      ]
    },
    {
      // Hybrid study 09: almost invisible final perspective release.
      id:'micro-tilt', label:'09 · Micro-tilt settle', baseDuration:[1750,1920],
      build:(finalDeg, seed) => [
        K(0,.19,{x:2.5*seed.side,y:-24,z:finalDeg+1.15*seed.turn,rx:2.8,s:1.009},gravA),
        K(.32,.49,{x:2*seed.side,y:-20,z:finalDeg+.75*seed.turn,rx:2.1,s:1.007},gravB),
        K(.70,.86,{z:finalDeg,rx:.8,s:1.005},softSettle),
        K(1,1,{z:finalDeg})
      ]
    },
    {
      // Hybrid study 10: curved approach followed by flat perspective settle.
      id:'curved-arc', label:'10 · Curved travel + perspective settle', baseDuration:[1980,2180],
      build:(finalDeg, seed) => [
        K(0,.15,{x:9*seed.side,y:-28,z:finalDeg+1.4*seed.turn,rx:3.5,s:1.012},'cubic-bezier(.38,.25,.52,.75)'),
        K(.36,.48,{x:5*seed.side,y:-18,z:finalDeg+.9*seed.turn,rx:2.25,s:1.009},easeOut),
        K(.72,.84,{z:finalDeg,rx:1.6,s:1.011},settle),
        K(1,1,{z:finalDeg})
      ]
    }
  ];
  // Sample one continuous curve instead of restarting easing at each phase.
  // The quintic has zero velocity and acceleration at both ends, so contact
  // flows into a stationary pose. Only a subpixel release remains afterward.
  const smoothProgress = t => {
    t = Math.max(0, Math.min(1, t));
    return t * t * t * (10 + t * (-15 + 6 * t));
  };
  const quietLanding = (profile, {contactAt, releaseAt=contactAt, opacity=.17,
    tilt=3, scale=.011, restTilt=.08, restScale=.0004}) => ({
    ...profile, contactAt, releaseAt,
    build:(finalDeg, seed) => {
      const times = [...new Set([
        ...Array.from({length:121}, (_, i) => i / 120), contactAt, releaseAt
      ])].sort((a, b) => a - b);
      return times.map(t => {
        const approach = smoothProgress(t / contactAt);
        const release = smoothProgress((t - releaseAt) / (1 - releaseAt));
        const remaining = 1 - approach;
        return K(t, opacity + (1 - opacity) * approach, {
          x:seed.approachX * remaining,
          y:seed.approachY * remaining,
          z:finalDeg + 1.25 * seed.turn * remaining,
          rx:(tilt - restTilt) * remaining + restTilt * (1 - release),
          s:1 + (scale - restScale) * remaining + restScale * (1 - release)
        });
      });
    }
  });
  const DIRECTIONAL_LIMITED_PROFILES = [
    quietLanding(MOTION_PROFILES[0], {contactAt:.70, tilt:3.2}),
    quietLanding(MOTION_PROFILES[1], {contactAt:.58, scale:.013, restTilt:.10, restScale:.0005}),
    quietLanding(MOTION_PROFILES[2], {contactAt:.64, releaseAt:.78, opacity:.18})
  ];
  const SELECTED_MOTION_PROFILES = document.documentElement.dataset.motionSet === 'mixed'
    ? [...MOTION_PROFILES, ...ADDITIONAL_MOTION_PROFILES]
    : DIRECTIONAL_LIMITED_PROFILES;

  let deck = shuffle(ART);
  let nextIndex = 0;
  let photoDeck = shuffle(PHOTOS);
  let photoIndex = 0;
  let pendingArt = null;
  let arrivalCount = 0;
  let active = new Map();
  let lastSide = 'right';
  let lastProfileId = null;
  const FIRST_ENTRY_SEPARATION = 135 * Math.PI / 180;
  const ENTRY_JITTER = 8 * Math.PI / 180;
  const ENTRY_SECTORS = [
    {name:'right', angle:0},
    {name:'lower-right', angle:Math.PI/4},
    {name:'below', angle:Math.PI/2},
    {name:'lower-left', angle:3*Math.PI/4},
    {name:'left', angle:Math.PI},
    {name:'upper-left', angle:5*Math.PI/4},
    {name:'above', angle:3*Math.PI/2},
    {name:'upper-right', angle:7*Math.PI/4}
  ];
  let firstEntryAngle = null;
  let timer = null;
  let scrollFrame = null;
  let viewport = {w: innerWidth, h: innerHeight};
  let lastDropScroll = 0;
  let serial = 0;
  const coverageCells = new Map();

  const nativeParallax = window.CSS && CSS.supports('animation-timeline: scroll(root block)');
  plane.classList.toggle('has-scroll-timeline', Boolean(nativeParallax));
  const offset = () => reduced.matches ? 0 : Math.max(0, window.scrollY - (landing?.travel || 0)) * PARALLAX;
  const syncParallax = () => {
    scrollFrame = null;
    if (nativeParallax) {
      // Resolve the endpoint only when page/viewport dimensions change.
      // The browser then tracks scrolling without a JS callback every frame.
      const root = document.documentElement;
      const start = landing?.travel || 0;
      if (plane.style.getPropertyValue('--parallax-start') !== `${start}px`) plane.style.setProperty('--parallax-start', `${start}px`);
      const end = `${-(Math.max(0, root.scrollHeight - root.clientHeight - start) * PARALLAX).toFixed(2)}px`;
      if (plane.style.getPropertyValue('--parallax-end') !== end) plane.style.setProperty('--parallax-end', end);
    } else {
      plane.style.transform = `translate3d(0,${-offset().toFixed(2)}px,0)`;
    }
  };
  if (nativeParallax && 'ResizeObserver' in window) {
    new ResizeObserver(() => {
      if (scrollFrame == null) scrollFrame = requestAnimationFrame(syncParallax);
    }).observe(document.body, {box:'border-box'});
  } else if (!nativeParallax) {
    window.addEventListener('scroll', () => {
      if (!reduced.matches && !document.hidden && scrollFrame == null) scrollFrame = requestAnimationFrame(syncParallax);
    }, {passive: true});
  }
  document.addEventListener('wedding:landing-layout', syncParallax);
  syncParallax();

  function ensureDeck() {
    // Cache the next arrival so retirement previews and the actual drop agree.
    if (pendingArt) return;
    const usePhoto = PHOTOS.length > 0 && (arrivalCount < 4
      ? arrivalCount === 3
      : PHOTO_SHARE > 0 && (PHOTO_SHARE === 1 || Math.random() < PHOTO_SHARE));
    let pool = usePhoto ? photoDeck : deck;
    let index = usePhoto ? photoIndex : nextIndex;
    if (index === pool.length) {
      const previous = pool[pool.length - 1];
      pool = shuffle(usePhoto ? PHOTOS : ART);
      if (pool.length > 1 && pool[0].id === previous.id) [pool[0], pool[1]] = [pool[1], pool[0]];
      index = 0;
    }
    pendingArt = pool[index++];
    if (usePhoto) {
      photoDeck = pool;
      photoIndex = index;
    } else {
      deck = pool;
      nextIndex = index;
    }
  }
  function nextArt() { ensureDeck(); const art = pendingArt; pendingArt = null; arrivalCount++; return art; }
  function peekArt() { ensureDeck(); return pendingArt; }

  function chooseMotionProfile() {
    const pool = lastProfileId ? SELECTED_MOTION_PROFILES.filter(p => p.id !== lastProfileId) : SELECTED_MOTION_PROFILES;
    const profile = choose(pool.length ? pool : SELECTED_MOTION_PROFILES);
    lastProfileId = profile.id;
    return profile;
  }

  function sizeOf(art) {
    const longEdge = viewport.w <= 650
      ? Math.min(292, Math.max(215, viewport.w * .69))
      : Math.min(576, Math.max(340, viewport.w * .3375));
    const edge = Math.max(art.width, art.height);
    return {w: longEdge * art.width / edge, h: longEdge * art.height / edge};
  }
  function screenBounds(card, shift) {
    return {cx:card.x + card.w / 2, cy:card.y + card.h / 2 - shift,
      ca:Math.cos(card.angle), sa:Math.sin(card.angle), hw:card.w / 2, hh:card.h / 2};
  }
  function contains(bounds, x, screenY) {
    const dx = x - bounds.cx, dy = screenY - bounds.cy;
    return Math.abs(dx * bounds.ca + dy * bounds.sa) <= bounds.hw &&
           Math.abs(-dx * bounds.sa + dy * bounds.ca) <= bounds.hh;
  }
  function cellsFor(side) {
    const key = fullWidth ? 'all' : side;
    if (coverageCells.has(key)) return coverageCells.get(key);
    const x0 = fullWidth ? 0 : side === 'left' ? 0 : viewport.w * .62;
    const x1 = fullWidth ? viewport.w : side === 'left' ? viewport.w * .38 : viewport.w;
    const points = [];
    for (let iy = 0; iy < 20; iy++) {
      for (let ix = 0; ix < 16; ix++) {
        points.push({x:x0 + (ix+.5)*(x1-x0)/16, y:(iy+.5)*viewport.h/20});
      }
    }
    coverageCells.set(key, points);
    return points;
  }
  function chooseSide() {
    const opposite = lastSide === 'left' ? 'right' : 'left';
    return Math.random() < .80 ? opposite : lastSide;
  }
  function choosePosition(art, side, initial = false, slot = null) {
    const {w,h} = sizeOf(art);
    const shift = offset();
    const pts = cellsFor(side);
    const visible = [...active.values()].filter(c => !c.retiring).map(c => screenBounds(c, shift));
    const filled = pts.map(p => visible.some(c => contains(c,p.x,p.y)));
    const coverage = filled.filter(Boolean).length / pts.length;
    const catchingUp = Math.abs(scrollY - lastDropScroll) > viewport.h * .25;
    let best = null;
    for (let i = 0; i < 52; i++) {
      const nearX = -w * .28;
      const farX = Math.min(viewport.w * .33, viewport.w * .5 - w * .42);
      const leftX = random(nearX, Math.max(nearX+10,farX));
      let x = fullWidth ? random(-w*.16, viewport.w-w*.84) : side === 'left' ? leftX : viewport.w - w - leftX;
      const minY = -h * .20;
      const maxY = viewport.h - h * .78;
      let sy = initial
        ? random(viewport.h * (side === 'left' ? .10 : .43) - h*.35,
                 viewport.h * (side === 'left' ? .43 : .79) - h*.45)
        : random(minY, Math.max(minY+5,maxY));
      if (fullWidth && slot != null && landing.openingLayout === 'balanced') {
        const columns = viewport.w <= 650 ? 2 : landing.openingCount === 6 ? 3 : 4;
        const rows = landing.openingCount / columns;
        x = ((slot % columns + .5) / columns) * viewport.w - w / 2 + random(-.06,.06)*viewport.w;
        sy = ((Math.floor(slot / columns) + .5) / rows) * viewport.h - h / 2 + random(-.04,.04)*viewport.h;
      }
      const angle = random(-7.5,7.5) * Math.PI / 180;
      const candidate = {x,y:sy+shift,w,h,angle,retiring:false};
      const bounds = screenBounds(candidate, shift);
      let newly = 0, projected = 0, bottomNew = 0;
      for (let j = 0; j < pts.length; j++) {
        const p = pts[j];
        if (!contains(bounds,p.x,p.y)) continue;
        projected++;
        if (!filled[j]) { newly++; if (p.y > viewport.h*.63) bottomNew++; }
      }
      const score = coverage < COVERAGE_TARGET
        ? newly * 1.6 + projected * .17 + (catchingUp ? bottomNew * .35 : 0) + random(0,22)
        : projected * .26 + (projected-newly)*.22 + newly * .25 + random(0,28);
      if (!best || score > best.score) best = {...candidate,score};
    }
    return best;
  }

  function remove(card) {
    if (card.animation) { try { card.animation.cancel(); } catch (_) {} }
    clearTimeout(card.budgetTimer);
    card.node.remove();
    if (active.get(card.art.id) === card) active.delete(card.art.id);
  }
  function completelyCovered(card) {
    const shift = offset();
    const above = [...active.values()].filter(c => c.serial > card.serial && !c.retiring)
      .map(c => screenBounds(c, shift));
    if (!above.length) return false;
    const bounds = screenBounds(card, shift);
    for (let iy = 0; iy < 9; iy++) for (let ix = 0; ix < 9; ix++) {
      const lx = (ix+.5)/9*card.w - card.w/2;
      const ly = (iy+.5)/9*card.h - card.h/2;
      const x = bounds.cx + lx*bounds.ca - ly*bounds.sa;
      const y = bounds.cy + lx*bounds.sa + ly*bounds.ca;
      if (!above.some(c => contains(c,x,y))) return false;
    }
    return true;
  }
  function trimBudget() {
    if (!fullWidth || viewport.w > 760) return;
    const live = [...active.values()].filter(card => !card.retiring);
    let excess = live.length - 16;
    for (const card of live) {
      if (excess <= 0) break;
      if (card.isAnimating) continue;
      card.retiring = true;
      card.node.classList.add('is-retiring');
      card.node.style.opacity = '0';
      card.budgetTimer = setTimeout(() => remove(card), 1100);
      excess--;
    }
  }
  function pruneHidden() {
    const shift = offset();
    for (const card of [...active.values()]) {
      if (card.retiring || card.isAnimating) continue;
      const screenY = card.y - shift;
      if (completelyCovered(card) || screenY + card.h < -viewport.h*.9 || screenY > viewport.h*1.9) {
        remove(card);
      }
    }
    trimBudget();
  }
  function prepareNextReuse() {
    const next = peekArt();
    if (!next) return;
    const previous = active.get(next.id);
    if (!previous) return;
    if (completelyCovered(previous)) { remove(previous); return; }
    previous.retiring = true;
    previous.node.classList.add('is-retiring');
    // Opacity is inline after the Web Animations cleanup, so the CSS class
    // cannot override it. Transition the inline value explicitly instead.
    previous.node.style.opacity = '0';
  }

  function circularSeparation(a, b) {
    return Math.abs(Math.atan2(Math.sin(a-b), Math.cos(a-b)));
  }

  function chooseEntryVector(awayFromAngle = null) {
    // A local approach from any compass direction, not a screen-edge fly-in.
    // The entry distance stays close to the v7 fall (27–37 CSS pixels).
    // Constrain only the initial pair: candidate bin centers must be at least
    // 135° apart, so the ±8° jitter still guarantees >=127° separation.
    const sectors = awayFromAngle == null ? ENTRY_SECTORS
      : ENTRY_SECTORS.filter(s => circularSeparation(s.angle, awayFromAngle) >= FIRST_ENTRY_SEPARATION);
    const sector = choose(sectors);
    const angle = sector.angle + random(-ENTRY_JITTER, ENTRY_JITTER);
    const distance = random(27,37);
    return {angle, name:sector.name,
      x:distance * Math.cos(angle), y:distance * Math.sin(angle)};
  }

  function animateLanding(card, profile, initial = false) {
    const finalDeg = card.angle * 180 / Math.PI;
    const limited = document.documentElement.dataset.motionSet !== 'mixed';
    const approach = limited ? chooseEntryVector(initial ? firstEntryAngle : null) : null;
    if (limited && initial && firstEntryAngle === null) firstEntryAngle = approach.angle;
    const seed = {
      side: Math.random() < .5 ? -1 : 1,
      turn: Math.random() < .5 ? -1 : 1,
      approachX: approach ? approach.x : 0,
      approachY: approach ? approach.y : 0
    };
    if (approach) {
      card.node.dataset.entryDirection = approach.name;
      card.node.dataset.entryAngle = String(approach.angle);
      card.node.dataset.entryX = approach.x.toFixed(2);
      card.node.dataset.entryY = approach.y.toFixed(2);
    }
    const frames = profile.build(finalDeg, seed);
    const durationRange = initial ? [Math.max(900, profile.baseDuration[0] * .68), Math.max(1100, profile.baseDuration[1] * .72)] : profile.baseDuration;
    const ms = Math.round(random(durationRange[0], durationRange[1]));
    const finalFrame = frames[frames.length - 1];

    card.node.dataset.motionProfile = profile.id;
    if (reduced.matches) {
      card.node.style.opacity = String(finalFrame.opacity);
      card.node.style.transform = restPose(finalDeg);
      card.isAnimating = false;
      return;
    }

    card.node.style.opacity = String(frames[0].opacity);
    card.node.style.transform = frames[0].transform;
    card.isAnimating = true;
    const anim = card.node.animate(frames, {duration:ms, fill:'both', easing:'linear'});
    card.animation = anim;
    anim.finished.then(() => {
      if (card.animation !== anim) return;
      card.node.style.opacity = String(finalFrame.opacity);
      card.node.style.transform = restPose(finalDeg);
      try { anim.cancel(); } catch (_) {}
      card.animation = null;
      card.isAnimating = false;
      trimBudget();
    }).catch(() => {});
  }

  function setImageSource(img, art, width) {
    const tiers = [[art.thumb, art.tw], [art.mid, art.mw], [art.full, art.fw]].filter(([src]) => src);
    img.sizes = `${Math.ceil(width)}px`;
    if (fullWidth && viewport.w <= 760) {
      // Decorative art has a density budget; foreground story images stay untouched.
      const budget = width * Math.min(devicePixelRatio || 1, 2);
      const tier = tiers.filter(([,pixels]) => pixels <= budget).at(-1) || tiers[0];
      img.removeAttribute('srcset');
      if (img.getAttribute('src') !== tier[0]) img.src = tier[0];
    } else {
      img.srcset = tiers.map(([src,pixels]) => `${src} ${pixels}w`).join(', ');
      img.src = art.thumb;
    }
  }
  function drop(art, side, initial = false, slot = null) {
    const old = active.get(art.id);
    if (old) remove(old);
    const geometry = choosePosition(art,side,initial,slot);
    const profile = chooseMotionProfile();
    const node = document.createElement('figure');
    node.className = 'postcard';
    node.dataset.card = art.id;
    node.dataset.kind = art.kind || 'postcard';
    node.dataset.side = side;
    node.style.left = `${geometry.x}px`;
    node.style.top = `${geometry.y}px`;
    node.style.width = `${geometry.w}px`;
    node.style.height = `${geometry.h}px`;
    const img = document.createElement('img');
    img.alt = '';
    img.decoding = 'async';
    img.loading = 'eager';
    img.width = art.width;
    img.height = art.height;
    setImageSource(img, art, geometry.w);
    node.append(img);
    plane.append(node);
    const card = {...geometry,art,node,serial:++serial,retiring:false,isAnimating:false,side,profileId:profile.id,animation:null};
    active.set(art.id,card);
    lastSide = side;
    lastDropScroll = scrollY;
    if (fullWidth && slot != null) {
      const transform = restPose(card.angle * 180 / Math.PI);
      node.dataset.motionProfile = 'opening-fade';
      node.style.transform = transform;
      if (!reduced.matches) {
        card.isAnimating = true;
        const animation = node.animate([{opacity:0,transform},{opacity:1,transform}],
          {duration:420,delay:slot*85,fill:'both',easing:'ease-out'});
        card.animation = animation;
        animation.finished.then(() => {
          if (card.animation !== animation) return;
          node.style.opacity='1'; node.style.transform=transform;
          animation.cancel(); card.animation=null; card.isAnimating=false; trimBudget();
        }).catch(() => {});
      }
    } else animateLanding(card, profile, initial);
    return card;
  }
  function step() {
    timer = null;
    if (document.hidden || reduced.matches) return;
    drop(nextArt(),chooseSide());
    pruneHidden();
    prepareNextReuse();
    schedule();
  }
  function schedule(delay = random(2800,4400)) {
    clearTimeout(timer);
    if (!document.hidden && !reduced.matches) timer = setTimeout(step,delay);
  }
  function start() {
    if (fullWidth) {
      for (let i=0;i<landing.openingCount;i++) drop(nextArt(),i%2 ? 'right' : 'left',true,i);
      if (!reduced.matches) { prepareNextReuse(); schedule(2800); }
      return;
    }
    drop(nextArt(),'left',true);
    drop(nextArt(),'right',true);
    if (reduced.matches) {
      for (let i=0;i<4;i++) drop(nextArt(),chooseSide());
    } else {
      prepareNextReuse();
      schedule(random(2300,3300));
    }
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {clearTimeout(timer);timer=null;}
    else {syncParallax();schedule(1800);}
  });
  reduced.addEventListener('change', () => {
    clearTimeout(timer);timer=null;
    for (const card of active.values()) {
      if (reduced.matches) {
        clearTimeout(card.budgetTimer);
        card.retiring = false;
        card.node.classList.remove('is-retiring');
      }
      if (card.animation) { try { card.animation.cancel(); } catch (_) {} card.animation = null; }
      card.isAnimating = false;
      card.node.style.opacity = '1';
      card.node.style.transform = restPose(card.angle * 180 / Math.PI);
    }
    syncParallax();
    if (!reduced.matches) schedule(2400);
  });
  let resizeFrame;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      const next = {w:innerWidth,h:innerHeight};
      // Mobile browser chrome/keyboard changes height during scrolling. Keep
      // the decorative composition stable; reflow it on a real width change.
      if (next.w === viewport.w && (next.h === viewport.h || next.w <= 650)) {
        syncParallax();
        return;
      }
      const before=viewport;viewport=next;
      coverageCells.clear();
      const shift = offset();
      for (const c of active.values()) {
        const screenY = c.y - shift;
        const side=c.node.dataset.side;
        const leftMargin=side==='left' ? c.x : before.w-c.x-c.w;
        const dims=sizeOf(c.art);
        c.x=fullWidth ? (c.x+c.w/2)*viewport.w/before.w-dims.w/2 : side==='left' ? leftMargin*viewport.w/before.w : viewport.w-dims.w-leftMargin*viewport.w/before.w;
        c.y=screenY*viewport.h/before.h+shift;
        c.w=dims.w;c.h=dims.h;
        c.node.style.left=`${c.x}px`;c.node.style.top=`${c.y}px`;
        c.node.style.width=`${c.w}px`;c.node.style.height=`${c.h}px`;
        setImageSource(c.node.querySelector('img'), c.art, c.w);
      }
      syncParallax();
      trimBudget();
    });
  }, {passive:true});
  start();

  const links = [...document.querySelectorAll('.nav-link')];
  const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  const setActive = id => {
    const current = document.querySelector('.nav-current');
    const text = links.find(link => link.hash === `#${id}`)?.textContent || 'Home';
    if (current && current.textContent !== text) current.textContent = text;
    for (const link of links) {
      const selected = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', selected);
      if (selected) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  };
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  const menu = document.querySelector('.nav-links');
  const mobile = matchMedia('(max-width: 760px)');
  function setMenu(open, focus = false) {
    if (!toggle) return;
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    menu.inert = mobile.matches && !open;
    if (open) { fitMenu(); if (focus) links[0].focus(); }
  }
  function fitMenu() {
    if (!toggle || !mobile.matches || toggle.getAttribute('aria-expanded') !== 'true') return;
    const top = toggle.getBoundingClientRect().bottom + 10;
    const available = Math.max(70, (visualViewport?.height || innerHeight) - top - 16);
    const row = 48;
    // A half-row is intentionally visible when the list must scroll.
    const height = available < row*8+18 ? Math.min(available, (Math.max(1,Math.floor((available-18)/row-.5))+.5)*row+18) : row*8+18;
    menu.style.setProperty('--menu-height', `${height}px`);
  }
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  toggle?.addEventListener('keydown', event => { if (event.key === 'ArrowDown') { event.preventDefault(); setMenu(true,true); } });
  links.forEach(link => link.addEventListener('click', () => {
    setActive(link.hash.slice(1)); setMenu(false);
    // Move focus to destination rather than retaining it in the hidden menu.
    if (toggle && mobile.matches) {
      const section = document.querySelector(link.hash);
      section?.setAttribute('tabindex','-1'); section?.focus({preventScroll:true});
    }
  }));
  document.addEventListener('pointerdown', event => { if (!nav.contains(event.target)) setMenu(false); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); } });
  mobile.addEventListener('change', () => setMenu(false));
  addEventListener('resize', fitMenu, {passive:true});
  visualViewport?.addEventListener('resize', fitMenu);
  setMenu(false);
  if ('IntersectionObserver' in window) {
    const ratios = new Map();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => ratios.set(entry.target.id, entry.intersectionRatio));
      let best = null;
      for (const section of sections) {
        const ratio = ratios.get(section.id) || 0;
        if (!best || ratio > best.ratio) best = {id:section.id,ratio};
      }
      if (best && best.ratio > 0) setActive(best.id);
    },{threshold:[0,.1,.25,.5,.75],rootMargin:'-14% 0px -25% 0px'});
    sections.forEach(section => observer.observe(section));
  }
})();
