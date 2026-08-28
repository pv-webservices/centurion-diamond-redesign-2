/* ============================================================
   04 · THE COLLECTION — the timeline.

   Pure maths: master progress in, a description of the frame out. No DOM.
   `frame()` writes into a state object built once at mount, so scrubbing
   the gallery allocates nothing — same contract as the pillars timeline.
   ============================================================ */
window.CD = window.CD || {};

CD.collectionTimeline = (function () {
  'use strict';

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function range(p, a, b) { return b === a ? (p >= b ? 1 : 0) : clamp01((p - a) / (b - a)); }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeIn(t) { return t * t * t; }
  function easeIO(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function band(p, w) {
    var v = easeOut(range(p, w.inA, w.inB));
    return w.outA == null ? v : v * (1 - easeIn(range(p, w.outA, w.outB)));
  }

  function stagger(v, k) { return easeOut(clamp01((v - k) / (1 - k))); }

  function rampAt(stops, p) {
    for (var i = 1; i < stops.length; i++) {
      if (p <= stops[i].p || i === stops.length - 1) {
        var a = stops[i - 1], b = stops[i], t = range(p, a.p, b.p);
        return 'rgb(' + Math.round(lerp(a.c[0], b.c[0], t)) + ','
                      + Math.round(lerp(a.c[1], b.c[1], t)) + ','
                      + Math.round(lerp(a.c[2], b.c[2], t)) + ')';
      }
    }
    return 'rgb(243,240,233)';
  }

  /* Where the statement holds the rail. Derived from the rail window so the
     pause always lands exactly on slot `holdAt` — hardcoding it drifts the
     moment the rail is retimed or a slot is added. */
  function holdWindow(B, n) {
    var r = B.rail;
    var moving = (r.outB - r.inA) - r.holdSpan;
    var at = n > 1 ? r.holdAt / (n - 1) : 0;
    var a = r.inA + at * moving;
    return { a: a, b: a + r.holdSpan, span: r.holdSpan };
  }

  /* progress -> position along the rail, in slots, with that hold */
  function railAt(p, B, n) {
    var r = B.rail, h = holdWindow(B, n);
    var moving = (r.outB - r.inA) - r.holdSpan;
    if (moving <= 0) return 0;
    var t;
    if (p <= h.a)      t = p - r.inA;
    else if (p < h.b)  t = h.a - r.inA;
    else               t = (p - r.inA) - r.holdSpan;
    return clamp01(t / moving) * (n - 1);
  }

  /* the inverse of railAt, for the directional controls */
  function progressForSlot(cfg, i, n) {
    var B = cfg.beats, r = B.rail;
    var moving = (r.outB - r.inA) - r.holdSpan;
    var t = n > 1 ? clamp01(i / (n - 1)) : 0;
    var p = r.inA + t * moving;
    /* the hold slot itself lands where the statement begins; everything
       after it sits on the far side of the pause */
    if (i > r.holdAt) p += r.holdSpan;
    return clamp01(p);
  }

  function createState(cfg, n) {
    var st = {
      ground: '', iris: cfg.iris.from,
      intro:  { v: 0, y: 0, lines: [0, 0], eyebrow: 0, lede: 0 },
      rail:   { pos: 0, y: 0, scale: 1 },
      slots:  [],
      stmt:   { v: 0, lines: [0, 0, 0] },
      nav:    { v: 0, bar: 0, index: 0 },
      metals: { v: 0 },
      finale: { v: 0, stone: 0, lines: [0, 0], cta: 0 },
      handoff: 0,
      active: 0
    };
    for (var i = 0; i < n; i++) {
      st.slots.push({ d: 0, scale: 1, opacity: 1, y: 0, rot: 0, z: 0, plate: 0, near: 0 });
    }
    return st;
  }

  function frame(cfg, p, n, st) {
    var B = cfg.beats, R = cfg.rail, i;

    st.ground = rampAt(cfg.bgStops, p);
    st.iris = lerp(cfg.iris.from, cfg.iris.to, easeIO(range(p, B.aperture.inA, B.aperture.inB)));

    /* --- opening --- */
    var iIn = easeOut(range(p, B.intro.inA, B.intro.inB));
    var iOut = easeIn(range(p, B.intro.outA, B.intro.outB));
    st.intro.v = iIn * (1 - iOut);
    st.intro.y = -iOut * 9;
    st.intro.eyebrow = stagger(iIn, 0);
    st.intro.lines[0] = stagger(iIn, 0.14);
    st.intro.lines[1] = stagger(iIn, 0.28);
    st.intro.lede = stagger(iIn, 0.46);

    /* --- the rail --- */
    var pos = railAt(p, B, n);
    st.rail.pos = pos;
    /* While the opening type holds the frame the rail sits lower and recedes,
       so the first stone reads as emerging beneath the title. The recession is
       applied per slot, not to the rail: the rail is eleven slots wide, and
       scaling it would swing its far-off centre across the viewport. */
    st.rail.y = st.intro.v * (R.introDrop == null ? 11 : R.introDrop);
    st.active = Math.max(0, Math.min(n - 1, Math.round(pos)));

    for (i = 0; i < n; i++) {
      var s = st.slots[i];
      var d = i - pos;
      var ad = Math.abs(d);
      var a1 = ad > 1 ? 1 : ad;                       // 0..1 for the first slot out
      var a2 = ad < 1 ? 0 : (ad > 2 ? 1 : ad - 1);    // 0..1 for the second
      s.d = d;
      s.scale   = ad <= 1 ? lerp(1, R.scale.at1, a1)   : lerp(R.scale.at1, R.scale.at2, a2);
      s.opacity = ad <= 1 ? lerp(1, R.opacity.at1, a1) : lerp(R.opacity.at1, R.opacity.at2, a2);
      if (ad > 2) s.opacity *= Math.max(0, 1 - (ad - 2));
      s.y   = ad * R.drop;
      s.rot = -d * R.tilt;
      s.z   = 100 - Math.round(Math.min(ad, 9) * 10);
      s.near  = clamp01(1 - ad / R.plate);
      s.plate = easeOut(s.near);
      /* the catalogue plate belongs to the gallery, not to the title card */
      s.plate *= (1 - st.intro.v) * (1 - st.intro.v);
      s.scale *= 1 - 0.10 * st.intro.v;
      s.opacity *= 1 - 0.50 * st.intro.v;
    }

    /* --- the statement, locked to the rail's hold --- */
    var h = holdWindow(B, n);
    var sIn  = easeOut(range(p, h.a, h.a + h.span * 0.30));
    var sOut = easeIn(range(p, h.a + h.span * 0.70, h.b));
    st.stmt.v = sIn * (1 - sOut);
    for (i = 0; i < 3; i++) st.stmt.lines[i] = stagger(sIn, i * 0.20);

    for (i = 0; i < n; i++) st.slots[i].opacity *= (1 - 0.90 * st.stmt.v);

    /* --- navigation --- */
    st.nav.v = band(p, B.nav);
    st.nav.bar = n > 1 ? clamp01(pos / (n - 1)) : 0;
    st.nav.index = st.active;

    st.metals.v = band(p, B.metals);

    /* --- final moment --- */
    var fIn = easeOut(range(p, B.finale.inA, B.finale.inB));
    st.finale.v = fIn;
    st.finale.stone = easeOut(range(p, B.finale.inA, B.finale.inA + 0.045));
    st.finale.lines[0] = stagger(fIn, 0.18);
    st.finale.lines[1] = stagger(fIn, 0.42);
    st.finale.cta = stagger(fIn, 0.66);

    /* the light goes out of the room and the type lifts away with it, so the
       pinned stage's last frame is the ink the Worn section opens on */
    st.handoff = easeOut(range(p, B.handoff.inA, B.handoff.inB));

    /* the rail clears as the hero takes the centre */
    var clear = easeIn(range(p, B.nav.outA, B.nav.outB));
    for (i = 0; i < n; i++) {
      st.slots[i].opacity *= (1 - clear);
      st.slots[i].scale = lerp(st.slots[i].scale, st.slots[i].scale * 0.9, clear);
    }

    return st;
  }

  return {
    createState: createState, frame: frame,
    railAt: railAt, holdWindow: holdWindow, stagger: stagger,
    progressForSlot: progressForSlot,
    clamp01: clamp01, range: range, lerp: lerp,
    easeIn: easeIn, easeOut: easeOut, easeIO: easeIO
  };
})();
