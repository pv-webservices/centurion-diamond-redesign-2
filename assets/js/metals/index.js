/* ============================================================
   08 · METALS — orchestrator.

   One pinned ScrollTrigger produces a single master progress value; the
   timeline turns it into a frame and the renderer writes it. Same shape as
   every other chapter on the page.

   Worn above ends on ink and this stage opens on it — no panel has wiped in
   yet, so the opening frame is simply the page's own ground. It drains back
   to the same ink for Display below.
   ============================================================ */
window.CD = window.CD || {};

CD.initMetals = function initMetals() {
  'use strict';

  var root = document.getElementById('metals');
  if (!root || typeof gsap === 'undefined' || !CD.metals) return;

  var cfg = CD.metals;
  var T = CD.metalsTimeline;
  var V = CD.metalsVisual;
  var el = V.mount(root);
  if (!el.stage) return;

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- reduced motion: no pin, no wipe ----------
     The chapter becomes three material entries in document order, each with
     its swatch, its ring and its paragraph. */
  if (REDUCED) {
    root.classList.add('is-reduced');
    return;
  }

  var narrow = window.matchMedia('(max-width: 900px)').matches;
  var state  = T.createState(cfg);   // reused every frame — no per-frame garbage

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

  // paint the opening frame so nothing shows in an untimed state
  V.render(el, T.frame(cfg, 0, narrow, state));
};
