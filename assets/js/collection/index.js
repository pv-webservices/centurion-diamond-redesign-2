/* ============================================================
   04 · THE COLLECTION — orchestrator.

   Desktop: one pinned ScrollTrigger turns vertical scroll into travel along
   a horizontal rail, exactly as the hero, the Sparkle section and Anatomy of
   Brilliance turn it into their own timelines. Same shape, same Lenis, same
   ScrollTrigger — nothing new is introduced.

   Narrow viewports keep that rail. A phone gets a different composition of
   the same idea, not a different idea: one piece large in the frame with a
   slice of its neighbour, on CD.collection.mobileRail's falloff. Only a
   phone held sideways — no vertical room for a piece, its plate and the
   controls — falls back to the column. Reduced motion drops the motion
   entirely.
   ============================================================ */
window.CD = window.CD || {};

CD.initCollection = function initCollection() {
  'use strict';

  var root = document.getElementById('collection');
  if (!root || typeof gsap === 'undefined' || !CD.collection) return;

  var cfg = CD.collection;
  var T = CD.collectionTimeline;
  var V = CD.collectionVisual;
  var el = V.mount(root);
  if (!el.stage || !el.slots.length) return;

  var n = el.slots.length;
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var narrow  = window.matchMedia(cfg.narrowAt).matches;
  var stacked = window.matchMedia(cfg.stackAt).matches;

  /* The rail runs on both, on its own falloff each. Everything else about
     the chapter — beats, hold, aperture, finale — is shared, so the two
     compositions can never tell a different story. */
  var runCfg = (narrow && !stacked)
    ? Object.assign({}, cfg, { rail: cfg.mobileRail })
    : cfg;

  /* ---------- the metal selector ----------
     Editorial, not a filter widget. Choosing a family dims what does not
     belong to it rather than removing anything, and travels to the first
     piece in that family — dimming alone reads as broken when the family
     holds one piece and that piece is nowhere near the viewport.

     Counts come from the markup, so they can never disagree with the
     catalogue, and nothing here implies anything about availability. */
  function initMetals() {
    if (!el.metals) return;
    var btns = Array.prototype.slice.call(el.metals.querySelectorAll('[data-metal]'));

    var families = {};
    el.slots.forEach(function (sl, i) {
      if (!sl.metal) return;
      (families[sl.metal] = families[sl.metal] || []).push(i);
    });
    var total = el.slots.filter(function (sl) { return !!sl.metal; }).length;

    btns.forEach(function (b) {
      var m = b.getAttribute('data-metal');
      var count = m === 'all' ? total : (families[m] || []).length;
      var tag = document.createElement('s');
      tag.className = 'coll__metalsN';
      tag.textContent = count;
      b.appendChild(tag);

      b.addEventListener('click', function () {
        el.filter = (m === 'all' || m === el.filter) ? '' : m;
        btns.forEach(function (o) {
          var on = el.filter ? o.getAttribute('data-metal') === el.filter
                             : o.getAttribute('data-metal') === 'all';
          o.setAttribute('aria-pressed', String(on));
        });
        root.setAttribute('data-filter', el.filter);

        var fam = el.filter ? families[el.filter] : null;
        if (stacked || REDUCED) {
          if (fam) el.slots[fam[0]].el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        if (fam) {
          var from = state.active, near = fam[0];
          fam.forEach(function (i) {
            if (Math.abs(i - from) < Math.abs(near - from)) near = i;
          });
          goTo(near);
        }
        V.render(el, T.frame(runCfg, last, n, state), runCfg);
      });
    });
  }

  /* ---------- reduced motion ----------
     Everything in document flow, every specification legible, no pin. */
  if (REDUCED) {
    root.classList.add('is-reduced');
    el.stage.style.setProperty('--ground', 'rgb(243,240,233)');
    initMetals();
    return;
  }

  /* ---------- landscape phone: a vertical column, scrubbed plate by plate ---------- */
  if (stacked) {
    root.classList.add('is-stacked');
    el.stage.style.setProperty('--ground', 'rgb(243,240,233)');

    el.slots.forEach(function (sl) {
      var stone = sl.el.querySelector('.cl__stone');
      if (stone) {
        gsap.fromTo(stone,
          { scale: 0.92, yPercent: 4 },
          { scale: 1, yPercent: -4, ease: 'none',
            scrollTrigger: { trigger: sl.el, start: 'top bottom', end: 'bottom top', scrub: true } });
      }
      gsap.fromTo(sl.el, { opacity: 0.15 }, {
        opacity: 1, duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: sl.el, start: 'top 84%', once: true }
      });
      if (sl.plate) {
        gsap.fromTo(sl.lines, { opacity: 0, y: 16 }, {
          opacity: 1, y: 0, duration: 0.8, stagger: 0.09, ease: 'power3.out',
          scrollTrigger: { trigger: sl.plate, start: 'top 90%', once: true }
        });
      }
    });
    initMetals();
    ScrollTrigger.refresh();
    return;
  }

  /* ---------- the pinned gallery: desktop and portrait mobile alike ---------- */
  var state = T.createState(runCfg, n);
  var last = 0;
  var trigger = null;

  /* The controls move the page rather than holding a slider state of their
     own, so the gallery only ever has one source of truth. */
  function goTo(i) {
    if (!trigger) return;
    i = Math.max(0, Math.min(n - 1, i));
    var p = T.progressForSlot(runCfg, i, n);
    var y = trigger.start + (trigger.end - trigger.start) * p;
    if (window.lenis) window.lenis.scrollTo(y, { duration: 1.1 });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  }

  trigger = ScrollTrigger.create({
    trigger: root,
    start: 'top top',
    end: 'bottom bottom',
    pin: el.stage,
    pinSpacing: false,
    anticipatePin: 1,
    onUpdate: function (self) {
      last = self.progress;
      V.render(el, T.frame(runCfg, last, n, state), runCfg);
    }
  });

  /* ---------- the small directional controls ---------- */
  var prev = root.querySelector('[data-coll-prev]');
  var next = root.querySelector('[data-coll-next]');
  if (prev) prev.addEventListener('click', function () { goTo(state.active - 1); });
  if (next) next.addEventListener('click', function () { goTo(state.active + 1); });

  initMetals();

  // paint the opening frame so nothing shows in an untimed state
  V.render(el, T.frame(runCfg, 0, n, state), runCfg);
  ScrollTrigger.refresh();
};
