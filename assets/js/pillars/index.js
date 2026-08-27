/* ============================================================
   03 · ANATOMY OF BRILLIANCE — orchestrator.

   One pinned ScrollTrigger produces a single master progress value; the
   timeline turns it into a frame and the renderer writes it. Same shape as
   the hero and the Sparkle section, so all three behave alike and share the
   page's one Lenis/GSAP setup.
   ============================================================ */
window.CD = window.CD || {};

CD.initPillars = function initPillars() {
  'use strict';

  var root = document.getElementById('anatomy');
  if (!root || typeof gsap === 'undefined' || !CD.pillars) return;

  var cfg = CD.pillars;
  var T = CD.pillarsTimeline;
  var V = CD.pillarsVisual;
  var el = V.mount(root);
  if (!el.stage) return;

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- reduced motion: no pin, no scrub ----------
     The chapter becomes an ordinary bright editorial run — every benefit in
     document order, the stone kept, nothing hidden behind animation. */
  if (REDUCED) {
    root.classList.add('is-reduced');
    el.stage.style.backgroundColor = 'rgb(243,241,238)';
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

  /* narrow/wide changes the composition, so re-read it on resize. main.js
     already debounces ScrollTrigger.refresh() on the same event. */
  window.addEventListener('resize', function () {
    narrow = window.matchMedia('(max-width: 900px)').matches;
  }, { passive: true });

  // paint the opening frame so nothing shows in an untimed state
  V.render(el, T.frame(cfg, 0, narrow, state));
};
