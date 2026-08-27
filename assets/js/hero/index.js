/* ============================================================
   Hero orchestrator.

   One pinned ScrollTrigger produces a single master progress value.
   That value is the only thing shared between the four timelines
   (video / narrative / header / progress) — they never talk to each other,
   which is what keeps the video scrub and the typography exactly in step.
   ============================================================ */
window.CD = window.CD || {};

CD.initHero = function initHero() {
  'use strict';

  var section = document.getElementById('chero');
  if (!section || typeof gsap === 'undefined') return;

  var stage = section.querySelector('.chero__stage');
  var video = section.querySelector('[data-hero-video]');
  var narrativeRoot = section.querySelector('[data-hero-narrative]');
  var progressRoot = section.querySelector('[data-hero-progress]');
  var header = document.getElementById('hdr');

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var V = CD.heroVideo.init(video);
  var N = CD.heroNarrative.build(narrativeRoot, CD.heroScenes, CD.heroCta);
  var H = CD.heroHeader.init(header);
  var P = CD.heroProgress.init(progressRoot, CD.heroScenes.length);

  /* ---------- reduced motion: no pin, no scrub, stable frame ---------- */
  if (REDUCED) {
    section.classList.add('is-reduced');
    CD.heroVideo.staticFrame(0.62);
    if (P) P.update(1);
    return;
  }

  var progress = 0;

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    pin: stage,
    pinSpacing: false,
    anticipatePin: 1,
    onUpdate: function (self) {
      progress = self.progress;
      if (N) N.update(progress);
      if (H) H.update(progress, self.progress >= 1);
      if (P) P.update(progress);
      CD.heroVideo.setProgress(progress);
    }
  });

  // the decoder is driven from the ticker, decoupled from scroll event rate
  gsap.ticker.add(CD.heroVideo.tick);

  // opening reveal — runs once, independent of scroll
  var intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
  intro.fromTo('.chero__media', { scale: 1.12, opacity: 0 },
                                { scale: 1, opacity: 1, duration: 1.9 }, 0)
       .fromTo('.chero__vig',   { opacity: 0 }, { opacity: 1, duration: 1.4 }, 0.2)
       .fromTo('[data-hero-hint]', { opacity: 0, y: 12 },
                                   { opacity: 1, y: 0, duration: 0.9 }, 0.85)
       .fromTo('[data-hero-progress]', { opacity: 0 }, { opacity: 1, duration: 0.9 }, 0.95);

  // paint the first frame of the narrative immediately
  if (N) N.update(0);
  if (P) P.update(0);
};
