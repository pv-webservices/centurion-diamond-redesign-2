/* ============================================================
   09 · DISPLAY — orchestrator.

   One pinned ScrollTrigger produces a single master progress value; the
   timeline turns it into a frame and the renderer writes it. Same shape as
   every other chapter on the page.

   Metals above drains to ink and Exclusivity below opens on it, so this
   chapter can take the page's one chromatic room without either seam
   having to negotiate a colour.
   ============================================================ */
window.CD = window.CD || {};

CD.initDisplay = function initDisplay() {
  'use strict';

  var root = document.getElementById('display');
  if (!root || typeof gsap === 'undefined' || !CD.display) return;

  var cfg = CD.display;
  var T = CD.displayTimeline;
  var V = CD.displayVisual;
  var el = V.mount(root);
  if (!el.stage) return;

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Keep the progress renderer tied to the single CSS brand token. */
  var brandRgb = getComputedStyle(document.documentElement).getPropertyValue('--brand-blush-rgb').trim().split(',');
  if (brandRgb.length === 3) cfg.room.tint = [Number(brandRgb[0]), Number(brandRgb[1]), Number(brandRgb[2])];

  /* ---------- reduced motion: no pin, no light ----------
     The chapter becomes the case, its two photographs and its copy in
     document order, on a still, softly blush-lit ground. */
  if (REDUCED) {
    root.classList.add('is-reduced');
    el.stage.style.backgroundColor = 'rgb(55,39,42)';
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
