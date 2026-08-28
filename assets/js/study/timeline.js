/* ============================================================
   04 · A STUDY IN LIGHT — the timeline.

   Pure maths: master progress in, a plain description of the frame out.
   Nothing here touches the DOM, so the choreography can be retimed without
   thinking about rendering at all — same split as Anatomy of Brilliance.

   `frame()` writes into a state object built once at mount rather than
   returning a fresh one; this runs on every scroll frame.
   ============================================================ */
window.CD = window.CD || {};

CD.studyTimeline = (function () {
  'use strict';

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function range(p, a, b) { return b === a ? (p >= b ? 1 : 0) : clamp01((p - a) / (b - a)); }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeIn(t) { return t * t * t; }
  function easeIO(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* a windowed value: eases in over [inA,inB], out over [outA,outB] */
  function band(p, w) {
    var v = easeOut(range(p, w.inA, w.inB));
    return w.outA == null ? v : v * (1 - easeIn(range(p, w.outA, w.outB)));
  }

  /* one element's share of a scene's entrance, k = its place in the stagger */
  function stagger(vin, k) { return easeOut(clamp01((vin - k) / (1 - k))); }

  /* generic keyframe walk — returns [a, b, t] for progress p */
  function seek(keys, p, out) {
    var last = keys.length - 1, i;
    if (p <= keys[0].p)         { out[0] = out[1] = keys[0];    out[2] = 0; return out; }
    if (p >= keys[last].p)      { out[0] = out[1] = keys[last]; out[2] = 0; return out; }
    for (i = 1; i <= last; i++) if (p <= keys[i].p) break;
    out[0] = keys[i - 1]; out[1] = keys[i];
    out[2] = smooth(range(p, keys[i - 1].p, keys[i].p));
    return out;
  }

  /* scroll progress to the clip's own playhead, in seconds */
  function clipTime(keys, p, scratch) {
    var k = seek(keys, p, scratch);
    return lerp(k[0].t, k[1].t, k[2]);
  }

  /* the mutable frame, built once */
  function createState(cfg) {
    var st = {
      intro:  { v: 0, y: 0 },
      scenes: [],
      /* the aperture */
      sh:     { t: 0.5, b: 0.5, l: 0, r: 0 },
      /* the subject, re-centred on whatever the aperture leaves open */
      media:  { x: 0, s: 1, o: 0, br: 0.3, ct: 1.3 },
      edge:   { o: 0, w: 0, y: 0.5 },
      beam:   { v: 0, x: 0 },
      optics: { v: 0, x: 0, s: 1, rule: 0, points: 0, reticle: 0, facets: 0, spin: 0 },
      exit:   { v: 0, x: 0, y: 0, w: 1 },
      time:   0,
      _k:     [null, null, 0]
    };
    for (var i = 0; i < cfg.beats.scenes.length; i++) {
      st.scenes.push({ vin: 0, vout: 0, v: 0 });
    }
    return st;
  }

  /* One frame of the chapter. `vp` carries the stage's measurements — the
     aperture is described in fractions, but fitting the frame to whatever
     it leaves open needs pixels. */
  function frame(cfg, p, narrow, vp, st) {
    var B = cfg.beats, i;

    /* ---------- copy ---------- */
    st.intro.v = band(p, B.intro);
    st.intro.y = -easeIn(range(p, B.intro.outA, B.intro.outB)) * 3.2;   // vh

    for (i = 0; i < st.scenes.length; i++) {
      var w = B.scenes[i], sc = st.scenes[i];
      sc.vin  = easeOut(range(p, w.inA, w.inB));
      sc.vout = easeIn(range(p, w.outA, w.outB));
      sc.v    = sc.vin * (1 - sc.vout);
    }

    /* ---------- the aperture ---------- */
    var k = seek(cfg.stage, p, st._k), a = k[0], b = k[1], t = k[2];
    var tb = lerp(a.tb, b.tb, t);
    var sl = lerp(a.sl, b.sl, t);
    var sr = lerp(a.sr, b.sr, t);

    if (narrow) {
      /* one centred column: no side shutters, a shallower letterbox so the
         band of light stays large. A shut aperture stays shut. */
      var n = cfg.narrowStage;
      sl = sr = 0;
      if (tb < n.shut) tb *= n.tbScale;
    }

    st.sh.t = st.sh.b = tb;
    st.sh.l = sl;
    st.sh.r = sr;

    /* ---------- the subject ----------
       The frame is fitted to *cover the open window*, not the viewport:
       when the aperture narrows to make room for type, the frame comes
       with it, so the stone stays whole instead of being cropped to
       whatever happens to fall inside. `s` from the keyframes is headroom
       on top of that fit — 1.00 is exact, above it crops in for presence.

       The window's centre has moved by (sl - sr) / 2 of the stage width;
       the frame follows it. Coverage then holds by construction, so no
       un-painted edge is ever exposed. */
    var winW = (1 - sl - sr) * vp.w;
    var winH = (1 - 2 * tb)  * vp.h;
    var fit  = narrow ? cfg.narrowStage.zoom             // width-fitted, never cropped tall
                      : Math.max(winW / vp.fw, winH / vp.fh);

    st.media.x  = (sl - sr) * 50;                     // vw
    st.media.s  = fit * lerp(a.s,  b.s,  t);
    st.media.o  = lerp(a.o,  b.o,  t);
    st.media.br = lerp(a.br, b.br, t);
    st.media.ct = lerp(a.ct, b.ct, t);

    /* ---------- the aperture's hairline ---------- */
    var E = B.edge;
    var eOpen   = easeOut(range(p, E.open[0],   E.open[1]));
    var eSettle = easeOut(range(p, E.settle[0], E.settle[1]));
    var eClose  = easeIn (range(p, E.close[0],  E.close[1]));
    var eGone   = easeIn (range(p, E.gone[0],   E.gone[1]));
    st.edge.w = eOpen;
    /* The hairline marks the edge of the light, which is the aperture on a
       wide viewport and the letterboxed band on a narrow one — otherwise it
       would draw a line across empty ink where the clip does not reach. */
    st.edge.y = narrow
      ? Math.max(tb, 0.5 - (vp.fh * st.media.s) / 2 / vp.h)
      : tb;
    st.edge.o = clamp01(eOpen * lerp(1, 0.26, eSettle) + eClose * 0.92) * (1 - eGone);

    /* ---------- light crossing the stone ---------- */
    st.beam.v = band(p, B.beam);
    st.beam.x = -46 + 92 * easeIO(range(p, B.beam.inA, B.beam.outB));

    /* ---------- optical traces ----------
       They ride the same offset as the frame, so a reticle stays on the
       stone rather than on the viewport. */
    var O = cfg.optics;
    st.optics.rule    = band(p, O.rule);
    st.optics.points  = band(p, O.points);
    st.optics.reticle = band(p, O.reticle);
    st.optics.facets  = band(p, O.facets);
    st.optics.v = Math.max(st.optics.rule, st.optics.points,
                           st.optics.reticle, st.optics.facets);
    st.optics.x = st.media.x;
    st.optics.s = st.media.s;
    st.optics.spin = range(p, O.reticle.inA, O.facets.outB) * 26;   // degrees

    /* ---------- the handoff into the marquee ----------
       The two shutter edges have already met in the middle; this is that
       line leaving — down to the foot of the stage, then left, which is the
       direction the marquee below is already travelling. */
    var X = B.exit;
    /* it does not fade out — the last frame of the section is this line
       sitting on the marquee's own rule, and the two then travel up the
       page together, which is the whole handoff */
    st.exit.v = easeOut(range(p, X.on[0], X.on[1])) * (1 - easeIn(range(p, X.off[0], X.off[1])) * 0.30);
    st.exit.y = 49.5 * easeIO(range(p, X.drop[0], X.drop[1]));         // vh — the stage's foot,
                                                                     //      which is the marquee's rule
    st.exit.x = -38 * easeIn(range(p, X.run[0], X.run[1]));          // vw
    st.exit.w = lerp(1, 0.42, easeIn(range(p, X.run[0], X.run[1])));

    /* ---------- the clip ---------- */
    st.time = clipTime(cfg.clip, p, st._k);

    return st;
  }

  return {
    createState: createState, frame: frame, clipTime: clipTime,
    stagger: stagger, band: band,
    clamp01: clamp01, range: range, lerp: lerp,
    easeIn: easeIn, easeOut: easeOut, easeIO: easeIO, smooth: smooth
  };
})();
