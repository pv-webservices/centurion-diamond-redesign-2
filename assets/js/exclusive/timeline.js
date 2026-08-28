/* ============================================================
   10 · EXCLUSIVITY — the timeline.

   Pure maths: master progress in, a plain description of the frame out.
   Nothing here touches the DOM.
   ============================================================ */
window.CD = window.CD || {};

CD.exclusiveTimeline = (function () {
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

  function createState(cfg) {
    var st = {
      intro:  { v: 0, y: 0, lines: [0, 0] },
      rows:   [],
      ledger: { v: 1, y: 0 },
      claims: [],
      close:  { v: 0, y: 0, lines: [0, 0], cta: 0 }
    };
    var i;
    for (i = 0; i < cfg.beats.rows.length; i++) st.rows.push({ v: 0, rule: 0 });
    for (i = 0; i < cfg.beats.claims.length; i++) st.claims.push({ v: 0, vin: 0, vout: 0 });
    return st;
  }

  function frame(cfg, p, narrow, st) {
    var B = cfg.beats, i;

    var introIn  = easeOut(range(p, B.intro.inA, B.intro.inB));
    var introOut = easeIn(range(p, B.intro.outA, B.intro.outB));
    st.intro.v = introIn * (1 - introOut);
    st.intro.y = -introOut * 8;
    for (i = 0; i < st.intro.lines.length; i++) st.intro.lines[i] = stagger(introIn, i * 0.22);

    /* --- the ledger ---
       Rows arrive and hold. `revealed` is their running total, which is
       also what re-centres the block: half a row of lift for every row
       still to come, so the stack never grows off the bottom of the frame. */
    var revealed = 0;
    for (i = 0; i < st.rows.length; i++) {
      var w = B.rows[i], r = st.rows[i];
      r.v = easeOut(range(p, w.inA, w.inB));
      r.rule = easeOut(range(p, w.inA, w.inB + 0.02));
      revealed += r.v;
    }
    var lo = narrow ? B.ledgerOutNarrow : B.ledgerOut;
    var out = easeIn(range(p, lo.inA, lo.inB));
    st.ledger.v = 1 - out;
    st.ledger.y = (st.rows.length - revealed) * (cfg.rowHeight / 2) - out * 6;

    /* --- the case for stocking --- */
    for (i = 0; i < st.claims.length; i++) {
      var c = B.claims[i], cl = st.claims[i];
      cl.vin  = easeOut(range(p, c.inA, c.inB));
      cl.vout = easeIn(range(p, c.outA, c.outB));
      cl.v    = cl.vin * (1 - cl.vout);
    }

    /* --- the last frame --- */
    var closeIn = easeOut(range(p, B.close.inA, B.close.inB));
    st.close.v = closeIn;
    st.close.y = (1 - closeIn) * 22;
    for (i = 0; i < st.close.lines.length; i++) st.close.lines[i] = stagger(closeIn, i * 0.24);
    st.close.cta = stagger(closeIn, 0.46);

    return st;
  }

  return {
    createState: createState, frame: frame,
    stagger: stagger, band: band,
    clamp01: clamp01, range: range, lerp: lerp,
    easeIn: easeIn, easeOut: easeOut, smooth: smooth
  };
})();
