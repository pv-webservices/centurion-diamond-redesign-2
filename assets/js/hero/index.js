/* ============================================================
   Hero orchestrator — From Innovation to Brilliance.

   One pinned ScrollTrigger produces a single master progress value, and that
   value is the only thing the timelines share (stage / narrative / rail /
   header) — they never talk to each other, which keeps the cuts and the type
   exactly in step. A ticker drives what lives between scroll events: glints,
   parallax and the laser's sparks.
   ============================================================ */
window.CD = window.CD || {};

CD.initHero = function initHero() {
  'use strict';

  var section = document.getElementById('hero');
  if (!section || typeof gsap === 'undefined') return;

  var T = CD.heroTimeline;
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* reduced motion: no pin, no scrub — the closing frame stands as the hero */
  if (REDUCED) {
    section.classList.add('is-reduced');
    ScrollTrigger.refresh();
    return;
  }

  var S = CD.heroStage.init(section, T);
  var N = CD.heroNarrative.init(section, T);
  var P = CD.heroProgress.init(section, T);
  var H = CD.heroHeader.init(document.getElementById('hdr'));
  var K = CD.heroSparks.init(section.querySelector('[data-hx-sparks]'));

  function render(p, past) {
    S.update(p);
    N.update(p);
    if (P) P.update(p);
    if (H) H.update(p, past);
  }

  // the living layer only runs while the stage is pinned on screen
  var live = true;

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    pin: section.querySelector('.hx__stage'),
    pinSpacing: false,
    anticipatePin: 1,
    onUpdate: function (self) { render(self.progress, self.progress >= 1); },
    onRefresh: function (self) { render(self.progress, self.progress >= 1); },
    onToggle: function (self) { live = self.isActive || self.progress < 1; }
  });

  gsap.ticker.add(function (time) {
    if (!live) return;
    var pt = S.tick(time);
    if (K) K.tick(time, pt, S.laserIntensity());
  });

  // paint the opening frame before the reveal runs over it
  render(0, false);

  /* opening reveal — runs once, independent of scroll */
  var intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
  intro.fromTo('[data-hx-bars] i', { scaleY: 1 }, { scaleY: 0, duration: 1.7, ease: 'expo.inOut' }, 0)
       .fromTo('[data-hx-scene="origin"] img', { scale: 1.1, opacity: 0 },
                                               { scale: 1, opacity: 1, duration: 2.4 }, 0.1)
       .fromTo('.hx__intro .hx__eyebrow', { opacity: 0, x: -18 }, { opacity: 1, x: 0, duration: 1.2 }, 0.55)
       .fromTo('.hx__intro .hx-ln > span', { yPercent: 112 }, { yPercent: 0, duration: 1.5, stagger: 0.14 }, 0.6)
       .fromTo('.hx__intro .hx__lede', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.3 }, 0.95)
       .fromTo('[data-hx-rail]', { opacity: 0 }, { opacity: 1, duration: 1.2 }, 1.1)
       .fromTo({ v: 0 }, { v: 0 }, { v: 1, duration: 1, onUpdate: function () {
          if (P) P.revealHint(this.targets()[0].v);
        } }, 1.3);
};
