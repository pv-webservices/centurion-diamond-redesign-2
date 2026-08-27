/* ============================================================
   Header timeline — the header lives over the cinematic stage, so it is
   nudged by hero progress rather than being restyled into a solid navbar.
   ============================================================ */
window.CD = window.CD || {};

CD.heroHeader = (function () {
  'use strict';
  var el = null, reduced = false;

  function init(node) {
    el = node;
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return api;
  }

  /* p = hero progress 0..1 ; past = true once the hero has been scrolled past */
  function update(p, past) {
    if (!el || reduced) return;
    // recede slightly through the narrative, return for the closing frame
    var dim = p < 0.88 ? Math.min(1, p / 0.3) : Math.max(0, (1 - p) / 0.12);
    el.style.setProperty('--hdr-dim', (1 - dim * 0.42).toFixed(3));
    el.style.setProperty('--hdr-y', (-dim * 6).toFixed(2) + 'px');
    el.classList.toggle('is-past', !!past);
  }

  var api = { init: init, update: update };
  return api;
})();
