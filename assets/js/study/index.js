/* ============================================================
   04 · A STUDY IN LIGHT — orchestrator.

   One pinned ScrollTrigger produces a single master progress value; the
   timeline turns it into a frame, the renderer writes it, and the same
   value drives the clip's playhead. Same shape as the hero, the Sparkle
   section and Anatomy of Brilliance, so all four share the page's one
   Lenis/GSAP setup and never open a scroll listener of their own.

   The chapter inherits the exact frame Anatomy of Brilliance closes on —
   one hairline across ink — and opens by parting it. The section overlaps
   Anatomy by a viewport (sections.css), so this pin starts the moment that
   one ends; the stage stays hidden until then (`is-live`).
   ============================================================ */
window.CD = window.CD || {};

CD.initStudy = function initStudy() {
  'use strict';

  var root = document.getElementById('study');
  if (!root || typeof gsap === 'undefined' || !CD.study) return;

  var cfg = CD.study;
  var T = CD.studyTimeline;
  var V = CD.studyVisual;
  var el = V.mount(root, cfg);
  if (!el.stage || !el.video) return;

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  CD.studyVideo.init(el.video, root);

  /* ---------- reduced motion: no pin, no scrub ----------
     The chapter becomes an ordinary dark editorial run — the clip parked on
     one representative frame, every line in document order, nothing hidden
     behind animation. */
  if (REDUCED) {
    root.classList.add('is-reduced');
    CD.studyVideo.staticFrame(cfg.staticAt);
    return;
  }

  /* Narrow-and-tall viewports letterbox the clip instead of cropping it:
     the stone spans nearly the full width of a 16:9 frame, so a portrait
     cover-crop would show the middle third of it and nothing else. */
  function isNarrow() {
    return window.innerWidth <= 900 && window.innerHeight > window.innerWidth * 0.9;
  }

  var narrow = isNarrow();
  var state  = T.createState(cfg);   // reused every frame — no per-frame garbage

  root.classList.toggle('is-contain', narrow);
  V.measure(el, narrow);

  /* The opening that used to dwell on shut shutters now plays briskly: the
     first OPEN_AT of the scroll covers the timeline up to OPEN_TO, where the
     aperture is open and the first statement arrives. */
  var OPEN_AT = 0.065, OPEN_TO = 0.14;
  function inner(p) {
    return p <= OPEN_AT ? p / OPEN_AT * OPEN_TO
                        : OPEN_TO + (p - OPEN_AT) / (1 - OPEN_AT) * (1 - OPEN_TO);
  }
  function live(self) { root.classList.toggle('is-live', self.scroll() >= self.start - 2); }

  ScrollTrigger.create({
    trigger: root,
    start: 'top top',
    end: 'bottom bottom',
    pin: el.stage,
    pinSpacing: false,
    anticipatePin: 1,
    onToggle: live,
    onRefresh: live,
    onUpdate: function (self) {
      live(self);
      var f = T.frame(cfg, inner(self.progress), narrow, el.vp, state);
      V.render(el, f);
      CD.studyVideo.setTime(f.time);
    }
  });

  // the decoder runs off the ticker, decoupled from the scroll event rate
  gsap.ticker.add(CD.studyVideo.tick);

  /* Composition and the hairline's pixel offset both depend on the
     viewport, so re-read them on resize. main.js already debounces
     ScrollTrigger.refresh() on the same event. */
  window.addEventListener('resize', function () {
    narrow = isNarrow();
    root.classList.toggle('is-contain', narrow);
    V.measure(el, narrow);
  }, { passive: true });

  // paint the opening frame so nothing shows in an untimed state
  V.render(el, T.frame(cfg, 0, narrow, el.vp, state));
};
