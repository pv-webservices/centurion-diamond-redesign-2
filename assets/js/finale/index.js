/* ============================================================
   11 · RETAIL FINALE — one master ScrollTrigger, matching every chapter.
   ============================================================ */
window.CD = window.CD || {};

CD.initFinale = function initFinale() {
  'use strict';
  var root = document.getElementById('contact');
  if (!root || typeof gsap === 'undefined' || !CD.finale) return;

  var cfg = CD.finale;
  var T = CD.finaleTimeline;
  var V = CD.finaleVisual;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    root.classList.add('is-reduced');
    return;
  }

  var el = V.mount(root);
  var narrow = window.matchMedia('(max-width:900px)').matches;
  var state = T.createState(cfg);

  ScrollTrigger.create({
    trigger: root,
    start: 'top top',
    end: 'bottom bottom',
    pin: el.stage,
    pinSpacing: false,
    anticipatePin: 1,
    onUpdate: function (self) { V.render(el, T.frame(cfg, self.progress, narrow, state)); }
  });

  window.addEventListener('resize', function () {
    narrow = window.matchMedia('(max-width:900px)').matches;
  }, { passive: true });

  V.render(el, T.frame(cfg, 0, narrow, state));
};
