/* Postcards and selected photos on a virtual table. Gentle hybrid landing motions.
   No dependencies; works from file:// as well as a web host. */
(() => {
  const plane = document.getElementById('postcard-plane');
  const ART = [{"id":"geometric_stained_glass_heart","thumb":"thumbnails/geometric_stained_glass_heart.webp","tw":480,"mid":"medium/geometric_stained_glass_heart.webp","mw":960,"full":"images/geometric_stained_glass_heart.webp","fw":1200,"width":1200,"height":988},{"id":"japanese_cherry_blossoms_landscape","thumb":"thumbnails/japanese_cherry_blossoms_landscape.webp","tw":299,"mid":"medium/japanese_cherry_blossoms_landscape.webp","mw":597,"full":"images/japanese_cherry_blossoms_landscape.webp","fw":746,"width":746,"height":1200},{"id":"london_skyline_yellow","thumb":"thumbnails/london_skyline_yellow.webp","tw":480,"mid":"medium/london_skyline_yellow.webp","mw":960,"full":"images/london_skyline_yellow.webp","fw":1200,"width":1200,"height":962},{"id":"love_sculpture_in_park","thumb":"thumbnails/love_sculpture_in_park.webp","tw":480,"mid":"medium/love_sculpture_in_park.webp","mw":960,"full":"images/love_sculpture_in_park.webp","fw":1200,"width":1200,"height":863},{"id":"monet_water_lilies_bridge","thumb":"thumbnails/monet_water_lilies_bridge.webp","tw":354,"mid":"medium/monet_water_lilies_bridge.webp","mw":709,"full":"images/monet_water_lilies_bridge.webp","fw":886,"width":886,"height":1200},{"id":"person_at_desk_blue_room","thumb":"thumbnails/person_at_desk_blue_room.webp","tw":357,"mid":"medium/person_at_desk_blue_room.webp","mw":714,"full":"images/person_at_desk_blue_room.webp","fw":892,"width":892,"height":1200},{"id":"pink_lip_print","thumb":"thumbnails/pink_lip_print.webp","tw":480,"mid":"medium/pink_lip_print.webp","mw":960,"full":"images/pink_lip_print.webp","fw":1200,"width":1200,"height":859},{"id":"pointillist_studio_three_figures","thumb":"thumbnails/pointillist_studio_three_figures.webp","tw":480,"mid":"medium/pointillist_studio_three_figures.webp","mw":960,"full":"images/pointillist_studio_three_figures.webp","fw":1200,"width":1200,"height":869},{"id":"portrait_colorful_striped_dress","thumb":"thumbnails/portrait_colorful_striped_dress.webp","tw":358,"mid":"medium/portrait_colorful_striped_dress.webp","mw":716,"full":"images/portrait_colorful_striped_dress.webp","fw":895,"width":895,"height":1200},{"id":"purple_abstract_graffiti","thumb":"thumbnails/purple_abstract_graffiti.webp","tw":480,"mid":"medium/purple_abstract_graffiti.webp","mw":960,"full":"images/purple_abstract_graffiti.webp","fw":1200,"width":1200,"height":859},{"id":"seated_white_sculpture","thumb":"thumbnails/seated_white_sculpture.webp","tw":360,"mid":"medium/seated_white_sculpture.webp","mw":720,"full":"images/seated_white_sculpture.webp","fw":900,"width":900,"height":1200},{"id":"sleeping_cats_red_background","thumb":"thumbnails/sleeping_cats_red_background.webp","tw":480,"mid":"medium/sleeping_cats_red_background.webp","mw":960,"full":"images/sleeping_cats_red_background.webp","fw":1200,"width":1200,"height":840},{"id":"smiling_man_mosaic_portrait","thumb":"thumbnails/smiling_man_mosaic_portrait.webp","tw":342,"mid":"medium/smiling_man_mosaic_portrait.webp","mw":685,"full":"images/smiling_man_mosaic_portrait.webp","fw":856,"width":856,"height":1200},{"id":"soto_ayam_ambengan_food_illustration","thumb":"thumbnails/soto_ayam_ambengan_food_illustration.webp","tw":480,"mid":"medium/soto_ayam_ambengan_food_illustration.webp","mw":960,"full":"images/soto_ayam_ambengan_food_illustration.webp","fw":1200,"width":1200,"height":847},{"id":"street_parade_striped_costume","thumb":"thumbnails/street_parade_striped_costume.webp","tw":284,"mid":"medium/street_parade_striped_costume.webp","mw":568,"full":"images/street_parade_striped_costume.webp","fw":710,"width":710,"height":1200},{"id":"unsent_acrobat_backbend_ink_wash","thumb":"thumbnails/unsent_acrobat_backbend_ink_wash.webp","tw":480,"mid":"medium/unsent_acrobat_backbend_ink_wash.webp","mw":960,"full":"images/unsent_acrobat_backbend_ink_wash.webp","fw":1200,"width":1200,"height":903},{"id":"unsent_bainbridge_island_orcas","thumb":"thumbnails/unsent_bainbridge_island_orcas.webp","tw":338,"mid":"medium/unsent_bainbridge_island_orcas.webp","mw":676,"full":"images/unsent_bainbridge_island_orcas.webp","fw":845,"width":845,"height":1200},{"id":"unsent_colorful_concentric_circles","thumb":"thumbnails/unsent_colorful_concentric_circles.webp","tw":480,"mid":"medium/unsent_colorful_concentric_circles.webp","mw":960,"full":"images/unsent_colorful_concentric_circles.webp","fw":1200,"width":1200,"height":901},{"id":"unsent_japanese_cherry_blossoms_landscape","thumb":"thumbnails/unsent_japanese_cherry_blossoms_landscape.webp","tw":320,"mid":"medium/unsent_japanese_cherry_blossoms_landscape.webp","mw":641,"full":"images/unsent_japanese_cherry_blossoms_landscape.webp","fw":801,"width":801,"height":1200},{"id":"unsent_la_pecora_bianca_restaurant","thumb":"thumbnails/unsent_la_pecora_bianca_restaurant.webp","tw":352,"mid":"medium/unsent_la_pecora_bianca_restaurant.webp","mw":704,"full":"images/unsent_la_pecora_bianca_restaurant.webp","fw":880,"width":880,"height":1200},{"id":"unsent_moomins_darling_beloved","thumb":"thumbnails/unsent_moomins_darling_beloved.webp","tw":338,"mid":"medium/unsent_moomins_darling_beloved.webp","mw":677,"full":"images/unsent_moomins_darling_beloved.webp","fw":846,"width":846,"height":1200},{"id":"unsent_seattle_space_needle_monorail","thumb":"thumbnails/unsent_seattle_space_needle_monorail.webp","tw":316,"mid":"medium/unsent_seattle_space_needle_monorail.webp","mw":633,"full":"images/unsent_seattle_space_needle_monorail.webp","fw":791,"width":791,"height":1200},{"id":"vintage_valentine_greetings","thumb":"thumbnails/vintage_valentine_greetings.webp","tw":309,"mid":"medium/vintage_valentine_greetings.webp","mw":618,"full":"images/vintage_valentine_greetings.webp","fw":773,"width":773,"height":1200},{"id":"woman_and_baby_indoors","thumb":"thumbnails/woman_and_baby_indoors.webp","tw":472,"mid":"medium/woman_and_baby_indoors.webp","mw":944,"full":"images/woman_and_baby_indoors.webp","fw":1180,"width":1180,"height":1200}];
  const PHOTOS = window.WEDDING_PHOTOS || [];
  const requestedPhotoShare = Number((window.WEDDING_BACKGROUND || {}).photoShare ?? .20);
  const PHOTO_SHARE = PHOTOS.length && Number.isFinite(requestedPhotoShare)
    ? Math.max(0, Math.min(1, requestedPhotoShare)) : 0;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
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

  const offset = () => window.scrollY * PARALLAX;
  const syncParallax = () => {
    scrollFrame = null;
    plane.style.transform = `translate3d(0,${-offset().toFixed(2)}px,0)`;
  };
  window.addEventListener('scroll', () => {
    if (scrollFrame == null) scrollFrame = requestAnimationFrame(syncParallax);
  }, {passive: true});
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
  function contains(card, x, screenY) {
    if (card.retiring) return false;
    const dx = x - card.x - card.w / 2;
    const dy = screenY + offset() - card.y - card.h / 2;
    const ca = Math.cos(card.angle), sa = Math.sin(card.angle);
    return Math.abs(dx * ca + dy * sa) <= card.w / 2 &&
           Math.abs(-dx * sa + dy * ca) <= card.h / 2;
  }
  function cellsFor(side) {
    const x0 = side === 'left' ? 0 : viewport.w * .62;
    const x1 = side === 'left' ? viewport.w * .38 : viewport.w;
    const points = [];
    for (let iy = 0; iy < 20; iy++) {
      for (let ix = 0; ix < 16; ix++) {
        points.push({x:x0 + (ix+.5)*(x1-x0)/16, y:(iy+.5)*viewport.h/20});
      }
    }
    return points;
  }
  function chooseSide() {
    const opposite = lastSide === 'left' ? 'right' : 'left';
    return Math.random() < .80 ? opposite : lastSide;
  }
  function choosePosition(art, side, initial = false) {
    const {w,h} = sizeOf(art);
    const pts = cellsFor(side);
    const visible = [...active.values()].filter(c => !c.retiring);
    const filled = pts.map(p => visible.some(c => contains(c,p.x,p.y)));
    const coverage = filled.filter(Boolean).length / pts.length;
    const catchingUp = Math.abs(scrollY - lastDropScroll) > viewport.h * .25;
    let best = null;
    for (let i = 0; i < 52; i++) {
      const nearX = -w * .28;
      const farX = Math.min(viewport.w * .33, viewport.w * .5 - w * .42);
      const leftX = random(nearX, Math.max(nearX+10,farX));
      const x = side === 'left' ? leftX : viewport.w - w - leftX;
      const minY = -h * .20;
      const maxY = viewport.h - h * .78;
      const sy = initial
        ? random(viewport.h * (side === 'left' ? .10 : .43) - h*.35,
                 viewport.h * (side === 'left' ? .43 : .79) - h*.45)
        : random(minY, Math.max(minY+5,maxY));
      const angle = random(-7.5,7.5) * Math.PI / 180;
      const candidate = {x,y:sy+offset(),w,h,angle,retiring:false};
      let newly = 0, projected = 0, bottomNew = 0;
      for (let j = 0; j < pts.length; j++) {
        const p = pts[j];
        if (!contains(candidate,p.x,p.y)) continue;
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
    card.node.remove();
    if (active.get(card.art.id) === card) active.delete(card.art.id);
  }
  function completelyCovered(card) {
    const above = [...active.values()].filter(c => c.serial > card.serial && !c.retiring);
    if (!above.length) return false;
    for (let iy = 0; iy < 9; iy++) for (let ix = 0; ix < 9; ix++) {
      const lx = (ix+.5)/9*card.w - card.w/2;
      const ly = (iy+.5)/9*card.h - card.h/2;
      const x = card.x + card.w/2 + lx*Math.cos(card.angle) - ly*Math.sin(card.angle);
      const worldY = card.y + card.h/2 + lx*Math.sin(card.angle) + ly*Math.cos(card.angle);
      const p = {x,y:worldY-offset()};
      if (!above.some(c => contains(c,p.x,p.y))) return false;
    }
    return true;
  }
  function pruneHidden() {
    for (const card of [...active.values()]) {
      if (card.retiring || card.isAnimating) continue;
      const screenY = card.y - offset();
      if (completelyCovered(card) || screenY + card.h < -viewport.h*.9 || screenY > viewport.h*1.9) {
        remove(card);
      }
    }
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
      card.node.style.transform = finalFrame.transform;
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
      card.node.style.transform = finalFrame.transform;
      try { anim.cancel(); } catch (_) {}
      card.animation = null;
      card.isAnimating = false;
    }).catch(() => {});
  }

  function drop(art, side, initial = false) {
    const old = active.get(art.id);
    if (old) remove(old);
    const geometry = choosePosition(art,side,initial);
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
    img.sizes = `${Math.ceil(geometry.w)}px`;
    img.srcset = [[art.thumb, art.tw], [art.mid, art.mw], [art.full, art.fw]]
      .filter(([src]) => src).map(([src, width]) => `${src} ${width}w`).join(', ');
    img.src = art.thumb;
    node.append(img);
    plane.append(node);
    const card = {...geometry,art,node,serial:++serial,retiring:false,isAnimating:false,side,profileId:profile.id,animation:null};
    active.set(art.id,card);
    lastSide = side;
    lastDropScroll = scrollY;
    animateLanding(card, profile, initial);
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
      if (card.animation) { try { card.animation.cancel(); } catch (_) {} card.animation = null; }
      card.isAnimating = false;
      card.node.style.opacity = '1';
      card.node.style.transform = pose({z: card.angle * 180 / Math.PI});
    }
    if (!reduced.matches) schedule(2400);
  });
  let resizeFrame;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      const before=viewport;viewport={w:innerWidth,h:innerHeight};
      for (const c of active.values()) {
        const screenY = c.y - offset();
        const side=c.node.dataset.side;
        const leftMargin=side==='left' ? c.x : before.w-c.x-c.w;
        const dims=sizeOf(c.art);
        c.x=side==='left' ? leftMargin*viewport.w/before.w : viewport.w-dims.w-leftMargin*viewport.w/before.w;
        c.y=screenY*viewport.h/before.h+offset();
        c.w=dims.w;c.h=dims.h;
        c.node.style.left=`${c.x}px`;c.node.style.top=`${c.y}px`;
        c.node.style.width=`${c.w}px`;c.node.style.height=`${c.h}px`;
        c.node.querySelector('img').sizes=`${Math.ceil(c.w)}px`;
      }
      syncParallax();
    });
  }, {passive:true});
  start();

  const links = [...document.querySelectorAll('.nav-link')];
  const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  const setActive = id => {
    for (const link of links) {
      const selected = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', selected);
      if (selected) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  };
  links.forEach(link => link.addEventListener('click', () => setActive(link.hash.slice(1))));
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
