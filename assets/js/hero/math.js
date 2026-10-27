/* ============================================================
   Shared progress maths for the hero timelines.
   Every hero module maps one master progress value (0..1) through these,
   so a window in scenes.js means the same thing everywhere.
   ============================================================ */
window.CD = window.CD || {};

CD.heroMath = (function () {
  'use strict';

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  /* where p sits inside the window a..b, as 0..1 */
  function range(p, a, b) { return b === a ? (p >= b ? 1 : 0) : clamp01((p - a) / (b - a)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  // luxury-commercial easing: quick settle, no bounce
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeIn(t) { return t * t * t; }
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  /* 0 at both ends, 1 at the middle — for flashes and sweeps that peak mid-window */
  function bell(t) { return Math.sin(clamp01(t) * Math.PI); }

  return {
    clamp01: clamp01, range: range, lerp: lerp,
    easeOut: easeOut, easeIn: easeIn, easeInOut: easeInOut, bell: bell
  };
})();
