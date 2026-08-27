/* ============================================================
   03 · ANATOMY OF BRILLIANCE — the timeline.

   Pure maths: master progress in, a plain description of the frame out.
   Nothing here touches the DOM, so the choreography can be reasoned about
   (and retimed) without thinking about rendering at all.

   `frame()` writes into a state object built once at mount rather than
   returning a fresh one — this runs on every scroll frame, and the rest of
   the page's scroll handlers allocate nothing either.
   ============================================================ */
window.CD = window.CD || {};

CD.pillarsTimeline = (function () {
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

  /* colour ramp across a stop list */
  function rampAt(stops, p) {
    for (var i = 1; i < stops.length; i++) {
      if (p <= stops[i].p || i === stops.length - 1) {
        var a = stops[i - 1], b = stops[i], t = range(p, a.p, b.p);
        return 'rgb(' + Math.round(lerp(a.c[0], b.c[0], t)) + ','
                      + Math.round(lerp(a.c[1], b.c[1], t)) + ','
                      + Math.round(lerp(a.c[2], b.c[2], t)) + ')';
      }
    }
    return 'rgb(243,241,238)';
  }

  /* the scene window split evenly — scene i owns [s0, s0+span) and is fully
     gone by the time i+1 begins, so only one benefit ever holds the frame */
  function sceneBands(win, n) {
    var span = (win.outB - win.inA) / n, out = [];
    for (var i = 0; i < n; i++) {
      var s0 = win.inA + i * span;
      out.push({ inA: s0, inB: s0 + span * 0.40, outA: s0 + span * 0.76, outB: s0 + span });
    }
    return out;
  }

  /* stone pose, lerped through the keyframe list, written into `o` */
  function poseInto(keys, p, o) {
    var last = keys.length - 1, a, b, t, i;
    if (p <= keys[0].p)    { a = b = keys[0];    t = 0; }
    else if (p >= keys[last].p) { a = b = keys[last]; t = 0; }
    else {
      for (i = 1; i <= last; i++) if (p <= keys[i].p) break;
      a = keys[i - 1]; b = keys[i]; t = smooth(range(p, a.p, b.p));
    }
    o.x = lerp(a.x, b.x, t);
    o.y = lerp(a.y, b.y, t);
    o.s = lerp(a.s, b.s, t);
    o.r = lerp(a.r, b.r, t);
    o.o = lerp(a.o, b.o, t);
    /* the sheen is an event, not a crossfade: it sweeps once across the leg
       that LEAVES a marked pose, which puts it inside that scene's dwell */
    o.sh = a.sh ? Math.sin(Math.PI * t) * a.sh : 0;
    o.shT = t;
    return o;
  }

  /* the mutable frame, built once */
  function createState(cfg) {
    var n = cfg.scenes.length, i;
    var st = {
      bands:  sceneBands(cfg.beats.scenes, n),
      ground: '',
      sweep:  { v: 0, x: 0 },
      intro:  { v: 0, y: 0, lines: [0, 0] },
      scenes: [],
      stone:  { x: 0, y: 0, s: 1, r: 0, o: 0, sh: 0, shT: 0 },
      words:  [],
      beam:   { v: 0, x: 0 },
      iris:   cfg.iris.from,
      seal:   0
    };
    for (i = 0; i < n; i++) st.scenes.push({ motion: cfg.scenes[i].motion, vin: 0, vout: 0, v: 0 });
    for (i = 0; i < 3; i++) st.words.push({ v: 0, y: 0 });
    return st;
  }

  /* one frame of the chapter */
  function frame(cfg, p, narrow, st) {
    var B = cfg.beats, i;

    st.ground = rampAt(cfg.bgStops, p);

    st.sweep.v = band(p, B.sweep);
    st.sweep.x = -62 + 168 * easeOut(range(p, B.sweep.inA, B.sweep.outB));

    var introIn  = easeOut(range(p, B.intro.inA, B.intro.inB));
    var introOut = easeIn(range(p, B.intro.outA, B.intro.outB));
    st.intro.v = introIn * (1 - introOut);
    st.intro.y = -introOut * 11;
    for (i = 0; i < st.intro.lines.length; i++) {
      var d = i * 0.24;
      st.intro.lines[i] = easeOut(clamp01((introIn - d) / (1 - d)));
    }

    for (i = 0; i < st.scenes.length; i++) {
      var w = st.bands[i], sc = st.scenes[i];
      sc.vin  = easeOut(range(p, w.inA, w.inB));
      sc.vout = easeIn(range(p, w.outA, w.outB));
      sc.v    = sc.vin * (1 - sc.vout);
    }

    poseInto(cfg.stone, p, st.stone);
    if (narrow) {
      /* one column: no lateral drift, and the stone sits below the type */
      var m = cfg.mobileStone;
      st.stone.x = m.x;
      st.stone.y = st.stone.y * m.yScale + m.yBase;
      st.stone.s = st.stone.s * m.sScale;
      st.stone.r = st.stone.r * 0.5;
    }

    /* one statement at a time, each clearing before the next arrives — the
       last one clears too, so the beam and the aperture play against the
       stone alone */
    var span = (B.final.outB - B.final.inA) / st.words.length;
    for (i = 0; i < st.words.length; i++) {
      var s0 = B.final.inA + i * span;
      var v  = easeOut(range(p, s0, s0 + span * 0.44));
      var o  = easeIn(range(p, s0 + span * 0.66, s0 + span * 0.98));
      st.words[i].v = v * (1 - o);
      st.words[i].y = (1 - v) * 46 + o * -36;
    }

    st.beam.v = band(p, B.beam);
    st.beam.x = -48 + 96 * easeIO(range(p, B.beam.inA, B.beam.outB));

    /* the close is a scaling aperture, not a page fade; `seal` only finishes
       the last few per-cent once the hole is already tiny */
    st.iris = lerp(cfg.iris.from, cfg.iris.to, easeIO(range(p, B.aperture.inA, B.aperture.inB)));
    st.seal = easeIn(range(p, B.seal.inA, B.seal.inB));

    return st;
  }

  return {
    createState: createState, frame: frame,
    stagger: stagger, sceneBands: sceneBands,
    clamp01: clamp01, range: range, lerp: lerp,
    easeIn: easeIn, easeOut: easeOut, easeIO: easeIO, smooth: smooth
  };
})();
