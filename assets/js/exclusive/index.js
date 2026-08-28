/* ============================================================
   10 · EXCLUSIVITY — orchestrator.

   One pinned ScrollTrigger produces a single master progress value; the
   timeline turns it into a frame and the renderer writes it. Same shape as
   every other chapter on the page.

   Display above falls back to ink and the CTA section below is already
   ink, so both seams hold without doing anything.
   ============================================================ */
window.CD = window.CD || {};

CD.initExclusive = function initExclusive() {
  'use strict';

  var root = document.getElementById('exclusive');
  if (!root || typeof gsap === 'undefined' || !CD.exclusive) return;

  var cfg = CD.exclusive;
  var T = CD.exclusiveTimeline;
  var V = CD.exclusiveVisual;
  var el = V.mount(root);
  if (!el.stage) return;

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- reduced motion: no pin ----------
     The chapter becomes the three figures, the two claims and the call in
     document order, with the button in the flow where it cannot be missed. */
  if (REDUCED) {
    root.classList.add('is-reduced');
    return;
  }

  var narrow = window.matchMedia('(max-width: 900px)').matches;
  var state  = T.createState(cfg);

  ScrollTrigger.create({
    trigger: root,
    start: 'top top',
    end: 'bottom bottom',
    pin: el.stage,
    pinSpacing: false,
    anticipatePin: 1,
    onUpdate: function (self) {
      V.render(el, T.frame(cfg, self.progress, narrow, state));
    }
  });

  window.addEventListener('resize', function () {
    narrow = window.matchMedia('(max-width: 900px)').matches;
  }, { passive: true });

  V.render(el, T.frame(cfg, 0, narrow, state));
};
