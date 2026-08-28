/* ============================================================
   08 · METALS — the timeline.

   Pure maths: master progress in, a plain description of the frame out.
   Nothing here touches the DOM. Same split and the same easing vocabulary
   as the other chapters.
   ============================================================ */
window.CD = window.CD || {};

CD.metalsTimeline = (function () {
  'use strict';

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function range(p, a, b) { return b === a ? (p >= b ? 1 : 0) : clamp01((p - a) / (b - a)); }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeIn(t) { return t * t * t; }
  function easeIO(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function band(p, w) {
    var v = easeOut(range(p, w.inA, w.inB));
    return w.outA == null ? v : v * (1 - easeIn(range(p, w.outA, w.outB)));
  }

  function stagger(vin, k) { return easeOut(clamp01((vin - k) / (1 - k))); }

  /* a panel's leading edge, walked through its stop list. The wipe itself
     uses an in-out ease so the metal arrives with weight rather than
     sliding at a constant rate. */
  function edgeAt(stops, p) {
    if (p <= stops[0].p) return stops[0].e;
    for (var i = 1; i < stops.length; i++) {
      if (p <= stops[i].p) {
        return lerp(stops[i - 1].e, stops[i].e, easeIO(range(p, stops[i - 1].p, stops[i].p)));
      }
    }
    return stops[stops.length - 1].e;
  }

  function createState(cfg) {
    var st = {
      intro:     { v: 0, y: 0, lines: [0, 0] },
      scenes:    [],
      rings:     [],
      pt:        { e: 0 },
      yg:        { e: 0 },
      statement: { v: 0, y: 0 },
      drain:     0
    };
    var i;
    for (i = 0; i < cfg.beats.scenes.length; i++) st.scenes.push({ vin: 0, vout: 0, v: 0 });
    for (i = 0; i < cfg.rings.length; i++) st.rings.push({ x: 0, y: 0, w: 10, r: 0, o: 0, s: 1 });
    return st;
  }

  function frame(cfg, p, narrow, st) {
    var B = cfg.beats, i;

    /* --- opening --- */
    var introIn  = easeOut(range(p, B.intro.inA, B.intro.inB));
    var introOut = easeIn(range(p, B.intro.outA, B.intro.outB));
    st.intro.v = introIn * (1 - introOut);
    st.intro.y = -introOut * 8;
    for (i = 0; i < st.intro.lines.length; i++) st.intro.lines[i] = stagger(introIn, i * 0.22);

    /* --- the three materials --- */
    for (i = 0; i < st.scenes.length; i++) {
      var w = B.scenes[i], sc = st.scenes[i];
      sc.vin  = easeOut(range(p, w.inA, w.inB));
      sc.vout = easeIn(range(p, w.outA, w.outB));
      sc.v    = sc.vin * (1 - sc.vout);
    }

    /* --- the ground --- */
    st.pt.e = edgeAt(cfg.wipe.pt, p);
    st.yg.e = edgeAt(cfg.wipe.yg, p);

    /* --- the rings ---
       A ring belongs to its scene and to nothing else: it rises with the
       metal it is made of and leaves with it. */
    for (i = 0; i < st.rings.length; i++) {
      var def = cfg.rings[i], sv = st.scenes[i].v, o = st.rings[i];
      var pose = narrow ? cfg.mobile.ring : def;
      o.x = pose.x;
      o.y = pose.y + (1 - sv) * 3;
      o.w = pose.w;
      o.r = pose.r == null ? 0 : pose.r * sv;
      o.s = 0.94 + 0.06 * smooth(sv);
      o.o = sv;
    }

    /* --- closing line, and the room draining back to ink --- */
    st.statement.v = band(p, B.statement);
    st.statement.y = (1 - easeOut(range(p, B.statement.inA, B.statement.inB))) * 24;
    st.drain = easeIO(range(p, B.drain.inA, B.drain.inB));

    return st;
  }

  return {
    createState: createState, frame: frame, edgeAt: edgeAt,
    stagger: stagger, band: band,
    clamp01: clamp01, range: range, lerp: lerp,
    easeIn: easeIn, easeOut: easeOut, easeIO: easeIO, smooth: smooth
  };
})();
