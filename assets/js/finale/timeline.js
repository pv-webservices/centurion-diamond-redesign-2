/* ============================================================
   08 · CENTURION AT RETAIL — pure progress-to-state calculations.
   The returned state is allocated once and reused on every scroll frame.
   ============================================================ */
window.CD = window.CD || {};

CD.finaleTimeline = (function () {
  'use strict';

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function range(p, a, b) { return b === a ? (p >= b ? 1 : 0) : clamp01((p - a) / (b - a)); }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function mappedTime(points, p) {
    var last = points.length - 1;
    if (p <= points[0].p) return points[0].t;
    if (p >= points[last].p) return points[last].t;
    for (var i = 1; i <= last; i++) {
      if (p <= points[i].p) {
        var a = points[i - 1], b = points[i];
        return lerp(a.t, b.t, range(p, a.p, b.p));
      }
    }
    return 1;
  }

  function createState() {
    return {
      frame: 0,
      media: { v: 0, scale: 1.03 },
      vig: 1,
      blush: 0,
      sweep: { v: 0, x: -70 },
      copy: { scrim: 0, eyebrow: 0, lines: [0, 0, 0], body: 0, cta: 0 },
      progress: 0
    };
  }

  function frame(cfg, p, frameCount, st) {
    p = clamp01(p);
    st.frame = Math.round(mappedTime(cfg.videoMap, p) * (frameCount - 1));

    st.media.v = easeOut(range(p, cfg.media.reveal.inA, cfg.media.reveal.inB));
    st.media.scale = 1.03
      - 0.02 * easeOut(range(p, cfg.media.firstSettle.inA, cfg.media.firstSettle.inB))
      - 0.01 * smooth(range(p, cfg.media.finalSettle.inA, cfg.media.finalSettle.inB));

    st.copy.scrim = smooth(range(p, cfg.copy.scrim.inA, cfg.copy.scrim.inB));
    st.copy.eyebrow = easeOut(range(p, cfg.copy.eyebrow.inA, cfg.copy.eyebrow.inB));
    for (var i = 0; i < st.copy.lines.length; i++) {
      st.copy.lines[i] = easeOut(range(p, cfg.copy.lines[i].inA, cfg.copy.lines[i].inB));
    }
    st.copy.body = easeOut(range(p, cfg.copy.body.inA, cfg.copy.body.inB));
    st.copy.cta = easeOut(range(p, cfg.copy.cta.inA, cfg.copy.cta.inB));

    var sw = cfg.media.sweep;
    st.sweep.v = p <= sw.peak
      ? smooth(range(p, sw.inA, sw.peak))
      : 1 - smooth(range(p, sw.peak, sw.outB));
    st.sweep.x = -70 + 140 * smooth(range(p, sw.inA, sw.outB));
    st.blush = 0.18 * easeOut(range(p, 0.02, 0.18)) + 0.34 * st.sweep.v;
    st.vig = 0.92 - 0.20 * easeOut(range(p, 0.00, 0.28)) + 0.16 * st.copy.scrim;
    st.progress = p;
    return st;
  }

  return { createState: createState, frame: frame, clamp01: clamp01 };
})();
