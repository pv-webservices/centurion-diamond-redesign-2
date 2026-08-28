/* ============================================================
   07 · WORN — orchestrator.

   One pinned ScrollTrigger produces a single master progress value; the
   timeline turns it into a frame and the renderer writes it. Same shape as
   the hero, the Sparkle section, Anatomy of Brilliance, A Study in Light
   and the Collection, so all six share the page's one Lenis/GSAP setup.

   Both ends of the chapter are the page's ink — the Collection above hands
   off to it and the Metals chapter below opens on it — so neither seam
   needs anything but holding the colour.
   ============================================================ */
window.CD = window.CD || {};

CD.initWorn = function initWorn() {
  'use strict';

  var root = document.getElementById('worn');
  if (!root || typeof gsap === 'undefined' || !CD.worn) return;

  var cfg = CD.worn;
  var T = CD.wornTimeline;
  var V = CD.wornVisual;
  var el = V.mount(root);
  if (!el.stage) return;

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- reduced motion: no pin, no scrub ----------
     The chapter becomes an ordinary editorial run — every photograph at its
     natural size, in colour, in document order, with the copy beside it. */
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

  /* narrow/wide changes the plate composition, so re-read it on resize.
     main.js already debounces ScrollTrigger.refresh() on the same event. */
  window.addEventListener('resize', function () {
    narrow = window.matchMedia('(max-width: 900px)').matches;
  }, { passive: true });

  // paint the opening frame so nothing shows in an untimed state
  V.render(el, T.frame(cfg, 0, narrow, state));
};
