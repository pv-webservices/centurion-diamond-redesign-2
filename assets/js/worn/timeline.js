/* ============================================================
   07 · WORN — the timeline.

   Pure maths: master progress in, a plain description of the frame out.
   Nothing here touches the DOM. Same split as Anatomy of Brilliance and
   A Study in Light, and the same easing vocabulary.

   `frame()` writes into a state object built once at mount rather than
   returning a fresh one; this runs on every scroll frame.
   ============================================================ */
window.CD = window.CD || {};

CD.wornTimeline = (function () {
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

  function rampAt(stops, p) {
    for (var i = 1; i < stops.length; i++) {
      if (p <= stops[i].p || i === stops.length - 1) {
        var a = stops[i - 1], b = stops[i], t = range(p, a.p, b.p);
        return 'rgb(' + Math.round(lerp(a.c[0], b.c[0], t)) + ','
                      + Math.round(lerp(a.c[1], b.c[1], t)) + ','
                      + Math.round(lerp(a.c[2], b.c[2], t)) + ')';
      }
    }
    return 'rgb(10,10,11)';
  }

  /* a scalar ramp across a { p, v } stop list */
  function valueAt(stops, p) {
    for (var i = 1; i < stops.length; i++) {
      if (p <= stops[i].p || i === stops.length - 1) {
        var a = stops[i - 1], b = stops[i];
        return lerp(a.v, b.v, smooth(range(p, a.p, b.p)));
      }
    }
    return stops[stops.length - 1].v;
  }

  function createState(cfg) {
    var st = {
      ground: '',
      colour: 0,
      intro:  { v: 0, y: 0, lines: [0, 0] },
      scenes: [],
      gather: { v: 0, y: 0, lines: [0, 0] },
      rule:   { v: 0, w: 0 },
      plates: []
    };
    var i;
    for (i = 0; i < cfg.beats.scenes.length; i++) st.scenes.push({ vin: 0, vout: 0, v: 0 });
    for (i = 0; i < cfg.plates.length; i++) {
      /* `k` and `enter` are only written on narrow viewports; the renderer
         reads them only there too */
      st.plates.push({ x: 0, y: 0, w: 10, r: 0, o: 0, z: 1, s: 1, k: 0, enter: '' });
    }
    st.narrow = false;
    return st;
  }

  /* Where a plate sits this frame.

     A plate lives on one axis: `home` when it is resting, `feat` when its
     scene holds the frame. It arrives at `in` by scaling up out of its home
     pose, so nothing ever flies in from off-screen — the chapter reads as a
     contact sheet being laid down, not as objects being thrown around. */
  function plateInto(cfg, def, sc, p, gatherV, narrow, mob, idx, o) {
    var appear = easeOut(range(p, def.in, def.in + 0.06));
    var feat = def.feat && sc ? sc.v : 0;                   // 0..1 toward `feat`
    var home = narrow ? mobileHome(mob, idx) : def.home;
    var to   = def.feat ? (narrow ? mob.feat[def.role] : def.feat) : home;

    var t = feat * feat * (3 - 2 * feat);                   // smoothstep the swap
    o.x = lerp(home.x, to.x, t);
    o.y = lerp(home.y, to.y, t);
    o.w = lerp(home.w, to.w, t);
    o.r = lerp(home.r, to.r, t);

    /* A plate is present for its own moment and for the gather, and for
       nothing in between. Leaving them resting behind the copy was the
       obvious idea and the wrong one — a red plate at 30% still fights a
       paragraph. It keeps travelling toward `home` as it goes, so a slow
       scroll still shows it settling into the place the gather finds it. */
    o.o = appear * Math.max(t, gatherV);
    o.s = 0.90 + 0.10 * appear;
    o.z = def.feat && t > 0.02 ? 3 : 1;
    return o;
  }

  /* Where a plate sits this frame on a phone.

     A sequence, not a spread: the plate owns the frame for its own window
     and is gone outside it. `k` is the entrance's own 0..1, which the
     renderer turns into whichever gesture the plate asked for. */
  function mobilePlateInto(def, p, o) {
    var w = def.win;
    var vin  = easeOut(range(p, w.inA, w.inB));
    var vout = w.outA == null ? 0 : easeIn(range(p, w.outA, w.outB));
    var v = vin * (1 - vout);

    o.x = def.pose.x;
    o.y = def.pose.y - vout * 4;
    o.w = def.pose.w;
    o.r = def.pose.r;
    o.o = v;
    /* the brief's base move, under every entrance: 1.08 settling to 1.00,
       and the last plate keeps pushing rather than settling */
    o.s = def.enter === 'push' ? 1.00 + 0.11 * (1 - vin)
                               : 1.08 - 0.08 * vin + vout * 0.03;
    o.z = 2;
    o.k = vin;
    o.enter = def.enter;
    return o;
  }

  function frame(cfg, p, narrow, st) {
    /* Narrow viewports run the chapter as a sequence on their own beats —
       see CD.worn.mobile. Everything below is written against `B`, so the
       two compositions share one shape and cannot drift. */
    var mob = narrow && cfg.mobile && cfg.mobile.beats ? cfg.mobile : null;
    var B = mob ? mob.beats : cfg.beats, i;
    st.narrow = !!mob;

    st.ground = rampAt(cfg.bgStops, p);
    st.colour = valueAt(mob ? mob.colour : cfg.colour, p);

    /* --- opening --- */
    var introIn  = easeOut(range(p, B.intro.inA, B.intro.inB));
    var introOut = easeIn(range(p, B.intro.outA, B.intro.outB));
    st.intro.v = introIn * (1 - introOut);
    st.intro.y = -introOut * 8;
    for (i = 0; i < st.intro.lines.length; i++) {
      st.intro.lines[i] = stagger(introIn, i * 0.22);
    }

    /* --- the two moments --- */
    for (i = 0; i < st.scenes.length; i++) {
      var w = B.scenes[i], sc = st.scenes[i];
      sc.vin  = easeOut(range(p, w.inA, w.inB));
      sc.vout = easeIn(range(p, w.outA, w.outB));
      sc.v    = sc.vin * (1 - sc.vout);
    }

    /* --- the spread --- */
    var gIn  = easeOut(range(p, B.gather.inA, B.gather.inB));
    var gOut = easeIn(range(p, B.gather.outA, B.gather.outB));
    st.gather.v = gIn * (1 - gOut);
    st.gather.y = (1 - gIn) * 26 - gOut * 18;
    for (i = 0; i < st.gather.lines.length; i++) {
      st.gather.lines[i] = stagger(gIn, i * 0.26);
    }

    st.rule.v = band(p, B.rule);
    st.rule.w = easeOut(range(p, B.rule.inA, B.rule.inB));

    /* --- the plates ---
       The gather's own presence is what brings them up, read from the beat
       rather than re-derived, so the two can never drift apart. */
    for (i = 0; i < st.plates.length; i++) {
      if (mob) { mobilePlateInto(mob.plates[i], p, st.plates[i]); continue; }
      var def = cfg.plates[i];
      plateInto(cfg, def, def.scene >= 0 ? st.scenes[def.scene] : null,
                p, gIn * (1 - gOut * 0.55), narrow, cfg.mobile, i, st.plates[i]);
    }

    return st;
  }

  return {
    createState: createState, frame: frame,
    stagger: stagger, band: band, valueAt: valueAt,
    clamp01: clamp01, range: range, lerp: lerp,
    easeIn: easeIn, easeOut: easeOut, smooth: smooth
  };
})();
