/* ============================================================
   08 · CENTURION AT RETAIL — one master ScrollTrigger.
   Scroll is the only clock: progress maps to a source frame in both
   directions, and decoded assets are drawn only when the image changes.
   ============================================================ */
window.CD = window.CD || {};

CD.initFinale = function initFinale() {
  'use strict';
  var root = document.getElementById('retail-showcase');
  if (!root || typeof gsap === 'undefined' || !CD.finale || !CD.finaleFrames) return;

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
  var state = T.createState();
  var progress = 0;
  var raf = 0;
  var frames;

  function render() {
    raf = 0;
    V.render(el, T.frame(cfg, progress, frames.count(), state), frames);
  }

  function scheduleRender() {
    if (!raf) raf = window.requestAnimationFrame(render);
  }

  frames = CD.finaleFrames.create(cfg, narrow, scheduleRender);
  V.resize(el, frames.set(), narrow);
  render();

  var observer = null;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      frames.start();
      scheduleRender();
      observer.disconnect();
    }, { rootMargin: cfg.preload.rootMargin });
    observer.observe(root);
  } else {
    frames.start();
  }

  /* overlaps Experience by a viewport (sections.css): hidden until its pin
     takes over, so the two stages meet on one shared black frame */
  function live(self) { root.classList.toggle('is-live', self.scroll() >= self.start - 2); }

  ScrollTrigger.create({
    trigger: root,
    start: 'top top',
    end: 'bottom bottom',
    pin: el.stage,
    pinSpacing: false,
    anticipatePin: 1,
    onEnter: function () { frames.start(); },
    onEnterBack: function () { frames.start(); },
    onToggle: live,
    onRefresh: live,
    onUpdate: function (self) {
      live(self);
      progress = self.progress;
      scheduleRender();
    }
  });

  var resizeRaf = 0;
  window.addEventListener('resize', function () {
    if (resizeRaf) return;
    resizeRaf = window.requestAnimationFrame(function () {
      resizeRaf = 0;
      narrow = window.matchMedia('(max-width:900px)').matches;
      frames.select(narrow);
      V.resize(el, frames.set(), narrow);
      scheduleRender();
    });
  }, { passive: true });

  window.addEventListener('pagehide', function () {
    if (observer) observer.disconnect();
    frames.destroy();
  }, { once: true });
};
