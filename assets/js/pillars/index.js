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
  var photos = root.querySelector(".plr__photos");
  photos.replaceChildren();
  cfg.shapes.items.forEach(function(shape){var img=CD.shapePicture(shape,"plr__shape-photo");img.setAttribute("data-plr-photo", "");photos.appendChild(img);});
  root.querySelector(".plr__shape-list").textContent=cfg.shapes.items.map(function(s){return s.name;}).join(" / ");
  var T = CD.pillarsTimeline;
  var V = CD.pillarsVisual;
  var F = CD.pillarsFamily;
  var el = V.mount(root);
  var fam = F.mount(root);
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

  /* The pin is shared: the four benefits play over the first FAMILY_AT of it
     (their timeline still runs 0..0.80, where its scenes end), then the dark
     family finale owns the rest. */
  var FAMILY_AT = 0.651, BENEFITS_END = 0.80;
  function paint(p) {
    var fp = T.range(p, FAMILY_AT, 1);
    var f = T.frame(cfg, Math.min(p / FAMILY_AT, 1) * BENEFITS_END, narrow, state);
    if (fp > 0) f.ground = F.ground(fp);
    V.render(el, f);
    F.render(fam, fp, narrow);
  }

  ScrollTrigger.create({
    trigger: root,
    start: 'top top',
    end: 'bottom bottom',
    pin: el.stage,
    pinSpacing: false,
    anticipatePin: 1,
    onUpdate: function (self) { paint(self.progress); }
  });

  /* narrow/wide changes the composition, so re-read it on resize. main.js
     already debounces ScrollTrigger.refresh() on the same event. */
  window.addEventListener('resize', function () {
    narrow = window.matchMedia('(max-width: 900px)').matches;
  }, { passive: true });

  // paint the opening frame so nothing shows in an untimed state
  paint(0);
};
