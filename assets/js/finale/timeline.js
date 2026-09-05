/* ============================================================
   11 · RETAIL FINALE — pure progress-to-state calculation.
   The frame and its nested objects are allocated once and reused.
   ============================================================ */
window.CD = window.CD || {};

CD.finaleTimeline = (function () {
  'use strict';

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function range(p, a, b) { return clamp01((p - a) / (b - a)); }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function poseInto(keys, p, out) {
    var last = keys.length - 1, a, b, t, i;
    if (p <= keys[0].p) { a = b = keys[0]; t = 0; }
    else if (p >= keys[last].p) { a = b = keys[last]; t = 0; }
    else {
      for (i = 1; i <= last; i++) if (p <= keys[i].p) break;
      a = keys[i - 1]; b = keys[i]; t = smooth(range(p, a.p, b.p));
    }
    out.y = lerp(a.y, b.y, t);
    out.s = lerp(a.s, b.s, t);
    out.o = lerp(a.o, b.o, t);
    out.crisp = lerp(a.crisp, b.crisp, t);
  }

  function createState(cfg) {
    var st = {
      glow: 0,
      case: { y: 0, s: 1, o: 0, crisp: 0 },
      rings: [],
      copy: { v: 0, y: 24 }
    };
    for (var i = 0; i < cfg.rings.length; i++) st.rings.push({ x: 0, y: 0, s: 1, r: 0, o: 0 });
    return st;
  }

  function frame(cfg, p, narrow, st) {
    st.glow = easeOut(range(p, cfg.beats.room.inA, cfg.beats.room.inB));
    poseInto(cfg.casePoses, p, st.case);
    if (narrow) st.case.s *= cfg.mobile.caseScale;

    for (var i = 0; i < cfg.rings.length; i++) {
      var src = cfg.rings[i], dst = st.rings[i];
      var t = smooth(range(p, src.inA, src.inB));
      var path = narrow ? cfg.mobile.pathScale : 1;
      var arc = Math.sin(Math.PI * t) * (i % 2 ? -4.5 : 4.5) * path;
      dst.x = lerp(src.x * path, src.tx, t) + arc;
      dst.y = lerp(src.y * path, src.ty, t) - Math.sin(Math.PI * t) * 8 * path;
      dst.r = lerp(src.r, src.tr, t);
      dst.s = lerp(src.s * (narrow ? cfg.mobile.ringScale : 1), narrow ? .18 : .21, t);
      /* Hold full presence until the ring is already inside the photograph;
         the case layer occludes it first, then this finishes the conceal. */
      dst.o = easeOut(range(p, src.inA - .055, src.inA + .015)) * (1 - smooth(range(t, .91, 1)));
    }

    var cv = easeOut(range(p, cfg.beats.copy.inA, cfg.beats.copy.inB));
    st.copy.v = cv;
    st.copy.y = (1 - cv) * 24;
    return st;
  }

  return { createState: createState, frame: frame };
})();
