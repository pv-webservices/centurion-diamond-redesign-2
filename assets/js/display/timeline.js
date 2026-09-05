/* ============================================================
   09 · DISPLAY — the timeline.

   Pure maths: master progress in, a plain description of the frame out.
   Nothing here touches the DOM.
   ============================================================ */
window.CD = window.CD || {};

CD.displayTimeline = (function () {
  'use strict';

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function range(p, a, b) { return b === a ? (p >= b ? 1 : 0) : clamp01((p - a) / (b - a)); }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeIn(t) { return t * t * t; }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function band(p, w) {
    var v = easeOut(range(p, w.inA, w.inB));
    return w.outA == null ? v : v * (1 - easeIn(range(p, w.outA, w.outB)));
  }

  function stagger(vin, k) { return easeOut(clamp01((vin - k) / (1 - k))); }

  /* The wall: the room's one tint, mixed over the page's ink by the
     fraction the stop list asks for. Keeping it a single hue is what makes
     the colour a one-line decision — see `room` in scenes.js. */
  var INK = [10, 10, 11];
  function wallAt(room, p) {
    var stops = room.stops, k = stops[stops.length - 1].k, i;
    for (i = 1; i < stops.length; i++) {
      if (p <= stops[i].p || i === stops.length - 1) {
        k = lerp(stops[i - 1].k, stops[i].k, range(p, stops[i - 1].p, stops[i].p));
        break;
      }
    }
    return 'rgb(' + Math.round(lerp(INK[0], room.tint[0], k)) + ','
                  + Math.round(lerp(INK[1], room.tint[1], k)) + ','
                  + Math.round(lerp(INK[2], room.tint[2], k)) + ')';
  }

  /* walk a keyframe list of arbitrary numeric fields, smoothstepped */
  function poseInto(keys, p, fields, o) {
    var last = keys.length - 1, a, b, t, i, f;
    if (p <= keys[0].p)         { a = b = keys[0];    t = 0; }
    else if (p >= keys[last].p) { a = b = keys[last]; t = 0; }
    else {
      for (i = 1; i <= last; i++) if (p <= keys[i].p) break;
      a = keys[i - 1]; b = keys[i]; t = smooth(range(p, a.p, b.p));
    }
    for (f = 0; f < fields.length; f++) {
      o[fields[f]] = lerp(a[fields[f]], b[fields[f]], t);
    }
    return o;
  }

  var CASE_FIELDS = ['x', 'y', 'w', 'o'];
  var GLOW_FIELDS = ['s', 'v'];

  function createState(cfg) {
    var st = {
      ground: '',
      glow:   { s: 0.1, v: 0 },
      intro:  { v: 0, y: 0, lines: [0, 0] },
      scenes: [],
      cases:  []
    };
    var i;
    for (i = 0; i < cfg.beats.scenes.length; i++) st.scenes.push({ vin: 0, vout: 0, v: 0 });
    /* `k` and `push` are written on narrow viewports only, and read there only */
    for (i = 0; i < cfg.cases.length; i++) st.cases.push({ x: 0, y: 0, w: 20, o: 0, k: 1, push: 1 });
    st.narrow = false;
    return st;
  }

  function frame(cfg, p, narrow, st) {
    var B = cfg.beats, i;

    st.ground = wallAt(cfg.room, p);
    poseInto(cfg.glow, p, GLOW_FIELDS, st.glow);

    var introIn  = easeOut(range(p, B.intro.inA, B.intro.inB));
    var introOut = easeIn(range(p, B.intro.outA, B.intro.outB));
    st.intro.v = introIn * (1 - introOut);
    st.intro.y = -introOut * 8;
    for (i = 0; i < st.intro.lines.length; i++) st.intro.lines[i] = stagger(introIn, i * 0.22);

    for (i = 0; i < st.scenes.length; i++) {
      var w = B.scenes[i], sc = st.scenes[i];
      sc.vin  = easeOut(range(p, w.inA, w.inB));
      sc.vout = easeIn(range(p, w.outA, w.outB));
      sc.v    = sc.vin * (1 - sc.vout);
    }

    st.narrow = !!narrow;
    for (i = 0; i < st.cases.length; i++) {
      var c = st.cases[i];
      poseInto(cfg.cases[i].poses, p, CASE_FIELDS, c);
      if (narrow && cfg.cases.length > 1) {
        /* one case at a time, large, alternating with the copy — then the
           two together for the closing frame */
        var m = cfg.mobile;
        var pairV = smooth(range(p, m.pairAt.inA, m.pairAt.inB));
        var solo = m[cfg.cases[i].key];
        var side = i === 0 ? -1 : 1;
        c.x = lerp(solo.x, side * m.pair.x, pairV);
        c.y = lerp(solo.y, m.pair.y + side * m.pair.step, pairV);
        c.w = lerp(solo.w, m.pair.w, pairV);
        /* the first case hands the frame over rather than sitting behind
           the second, and comes back for the pair */
        if (i === 0) {
          var gone = smooth(range(p, m.swap.inA, m.swap.inB));
          c.o *= Math.max(1 - gone, pairV);
        }
        var k = easeOut(range(p, cfg.cases[i].in, cfg.cases[i].in + m.reveal));
        c.k = k;
        c.push = lerp(m.push.from, m.push.to, smooth(k)) + m.push.pair * pairV;
      } else if (narrow) {
        var one = cfg.mobile.a;
        c.x = one.x; c.y = one.y; c.w = one.w;
        c.k = easeOut(range(p, cfg.cases[i].in, cfg.cases[i].in + cfg.mobile.reveal));
        c.push = lerp(cfg.mobile.push.from, cfg.mobile.push.to, smooth(c.k));
      }
    }

    return st;
  }

  return {
    createState: createState, frame: frame, poseInto: poseInto, wallAt: wallAt,
    stagger: stagger, band: band,
    clamp01: clamp01, range: range, lerp: lerp,
    easeIn: easeIn, easeOut: easeOut, smooth: smooth
  };
})();
