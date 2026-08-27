/* ============================================================
   CENTURION DIAMOND — motion system
   GSAP + ScrollTrigger + Lenis
   ============================================================ */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MOBILE  = window.matchMedia('(max-width: 900px)').matches;

  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);

  document.getElementById('yr').textContent = new Date().getFullYear();

  /* ---------------------------------------------- smooth scroll */
  var lenis = null;
  function initSmoothScroll() {
    if (REDUCED || typeof Lenis === 'undefined') return;
    lenis = new Lenis({
      duration: 1.15,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      touchMultiplier: 1.7
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    window.lenis = lenis;

    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var t = document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        lenis.scrollTo(t, { offset: 0, duration: 1.4 });
      });
    });
  }

  /* ---------------------------------------------- custom cursor */
  function initCursor() {
    if (REDUCED || MOBILE || window.matchMedia('(hover: none)').matches) return;
    var cur = document.getElementById('cur');
    var x = gsap.quickTo(cur, 'x', { duration: 0.42, ease: 'power3' });
    var y = gsap.quickTo(cur, 'y', { duration: 0.42, ease: 'power3' });
    window.addEventListener('mousemove', function (e) {
      document.body.classList.add('has-cursor');
      x(e.clientX); y(e.clientY);
    }, { passive: true });

    document.querySelectorAll('a, button, .card').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        gsap.to(cur, { scale: 1.9, rotate: 45, duration: 0.5, ease: 'power3' });
      });
      el.addEventListener('mouseleave', function () {
        gsap.to(cur, { scale: 1, rotate: 0, duration: 0.5, ease: 'power3' });
      });
    });
  }

  /* ---------------------------------------------- facet diagram */
  function buildFacets() {
    var old = document.getElementById('fOld');
    var neu = document.getElementById('fNew');
    if (!old || !neu) return;
    var cx = 100, cy = 100, rIn = 44, rOut = 78;
    function spoke(i, total, group) {
      var a = (i / total) * Math.PI * 2 - Math.PI / 2;
      var ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      ln.setAttribute('x1', (cx + Math.cos(a) * rIn).toFixed(2));
      ln.setAttribute('y1', (cy + Math.sin(a) * rIn).toFixed(2));
      ln.setAttribute('x2', (cx + Math.cos(a) * rOut).toFixed(2));
      ln.setAttribute('y2', (cy + Math.sin(a) * rOut).toFixed(2));
      group.appendChild(ln);
    }
    // 57 baseline spokes, then 43 more interleaved => 100
    for (var i = 0; i < 57; i++) spoke(i + 0.5, 57, old);
    for (var j = 0; j < 43; j++) spoke(j, 43, neu);
  }

  /* ---------------------------------------------- preloader
     Deliberately brief. The old build showed ~5s of black before the hero
     appeared, which read as a broken page rather than a considered intro. */
  function runPreloader(done) {
    var pre = document.getElementById('pre');
    var num = document.getElementById('preNum');
    var bar = document.getElementById('preBar');
    var curtain = document.getElementById('curtain');

    if (REDUCED) {
      gsap.set([pre, curtain], { display: 'none' });
      done(); return;
    }

    document.body.classList.add('is-locked');
    var counter = { v: 0 };
    var tl = gsap.timeline({
      onComplete: function () {
        document.body.classList.remove('is-locked');
        gsap.set([pre, curtain], { display: 'none' });
      }
    });

    tl.to(bar, { scaleX: 1, duration: 1.05, ease: 'power2.inOut' }, 0)
      .to(counter, {
        v: 100, duration: 1.05, ease: 'power2.inOut',
        onUpdate: function () {
          num.textContent = String(Math.round(counter.v)).padStart(2, '0');
        }
      }, 0)
      .to('.pre__inner', { opacity: 0, y: -14, duration: 0.4, ease: 'power2.in' }, 1.08)
      .to(pre, { yPercent: -100, duration: 0.8, ease: 'expo.inOut' }, 1.2)
      .to(curtain, { yPercent: -100, duration: 0.8, ease: 'expo.inOut' }, 1.28)
      // hero starts while the curtain is still lifting — no dead black frame
      .add(done, 1.34);
  }

  /* hero lives in assets/js/hero/* — see CD.initHero */

  /* ---------------------------------------------- generic reveals */
  function initReveals() {
    var map = {
      up:    { opacity: 1, y: 0 },
      fade:  { opacity: 1 },
      left:  { opacity: 1, x: 0 },
      right: { opacity: 1, x: 0 },
      scale: { opacity: 1, scale: 1 },
      clip:  { clipPath: 'inset(0 0 0% 0)' }
    };
    // group siblings so they stagger together
    var groups = new Map();
    document.querySelectorAll('[data-anim]').forEach(function (el) {
      var p = el.parentElement;
      if (!groups.has(p)) groups.set(p, []);
      groups.get(p).push(el);
    });

    groups.forEach(function (els) {
      els.forEach(function (el, i) {
        var kind = el.getAttribute('data-anim');
        var to = Object.assign({
          duration: kind === 'clip' ? 1.25 : 1.05,
          ease: kind === 'clip' ? 'expo.inOut' : 'expo.out',
          delay: Math.min(i * 0.09, 0.45),
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        }, map[kind] || map.up);
        gsap.to(el, to);
      });
    });
  }

  /* ---------------------------------------------- word-split manifesto */
  function initSplit() {
    var el = document.querySelector('[data-split]');
    if (!el) return;
    if (REDUCED || !window.SplitText) { gsap.set(el, { opacity: 1 }); return; }

    var split = new SplitText(el, { type: 'words' });
    gsap.set(split.words, { opacity: 0.12 });
    gsap.to(split.words, {
      opacity: 1, stagger: 0.08, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 52%', scrub: 0.8 }
    });
  }

  /* ---------------------------------------------- pinned proof: 57 -> 100 */
  function initProof() {
    var stage = document.getElementById('proofStage');
    var count = document.getElementById('facetCount');
    var neu = document.getElementById('fNew');
    if (!stage || !count) return;

    // draw-on effect via dash offset (line length = rOut - rIn = 34 user units)
    var LEN = 34;
    var lines = neu ? neu.querySelectorAll('line') : [];
    gsap.set(lines, { strokeDasharray: LEN, strokeDashoffset: LEN, opacity: 1 });

    if (REDUCED) { count.textContent = '100'; gsap.set(lines, { strokeDashoffset: 0 }); return; }

    var o = { v: 57 };
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage, start: 'top top', end: '+=140%',
        pin: true, scrub: 0.9, anticipatePin: 1
      }
    });

    // counter duration matches the staggered draw so both land together
    var DRAW = 0.5 + lines.length * 0.014;
    tl.to(o, {
      v: 100, duration: DRAW, ease: 'none',
      onUpdate: function () { count.textContent = Math.round(o.v); }
    }, 0)
      .to(lines, { strokeDashoffset: 0, stagger: { each: 0.014, from: 'random' }, ease: 'none' }, 0)
      .to('#facetDiagram', { rotate: 22, ease: 'none' }, 0);
  }

  /* ---------------------------------------------- ghost text drift */
  function initGhost() {
    if (REDUCED) return;
    document.querySelectorAll('[data-ghost]').forEach(function (g, i) {
      gsap.fromTo(g,
        { xPercent: i % 2 ? 12 : -12 },
        {
          xPercent: i % 2 ? -12 : 12, ease: 'none',
          scrollTrigger: { trigger: g.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
        });
    });
  }

  /* ---------------------------------------------- marquee */
  function initMarquee() {
    var track = document.getElementById('marq');
    if (!track || REDUCED) return;
    var half = track.scrollWidth / 2;

    gsap.to(track, { x: -half, duration: 26, ease: 'none', repeat: -1 });
    // scroll velocity nudges the marquee
    gsap.to(track, {
      x: '-=' + half * 0.55, ease: 'none',
      scrollTrigger: { trigger: track.closest('.marq'), start: 'top bottom', end: 'bottom top', scrub: 1 }
    });
  }

  /* ---------------------------------------------- image parallax */
  function initParallax() {
    if (REDUCED) return;
    document.querySelectorAll('[data-parallax]').forEach(function (img) {
      gsap.fromTo(img, { yPercent: -8, scale: 1.14 }, {
        yPercent: 8, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  /* ---------------------------------------------- stat counters */
  function initCounters() {
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      if (REDUCED) { el.textContent = target; return; }
      var o = { v: 0 };
      gsap.to(o, {
        v: target, duration: 2.1, ease: 'power2.out',
        onUpdate: function () { el.textContent = Math.round(o.v); },
        scrollTrigger: { trigger: el, start: 'top 86%', once: true }
      });
    });
  }

  /* ---------------------------------------------- video: play only in view */
  function initVideos() {
    document.querySelectorAll('video').forEach(function (v) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            if (v.preload === 'none') v.preload = 'auto';
            var p = v.play();
            if (p && p.catch) p.catch(function () {});
          } else { v.pause(); }
        });
      }, { threshold: 0.12 });
      io.observe(v);
    });
  }

  /* ---------------------------------------------- header menu
     Only the menu lives here — the header's progress-driven dimming is owned
     by CD.heroHeader so the two never fight over the same element. */
  function initHeader() {
    var btn = document.getElementById('navToggle');
    var sheet = document.getElementById('navSheet');
    if (!btn || !sheet) return;

    function setMenu(open) {
      btn.setAttribute('aria-expanded', String(open));
      sheet.classList.toggle('is-open', open);
      sheet.setAttribute('aria-hidden', String(!open));
      document.body.classList.toggle('is-locked', open);
      if (lenis) open ? lenis.stop() : lenis.start();
    }
    btn.addEventListener('click', function () {
      setMenu(sheet.getAttribute('aria-hidden') === 'true');
    });
    sheet.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sheet.classList.contains('is-open')) setMenu(false);
    });
  }

  /* ---------------------------------------------- boot */
  function start() {
    buildFacets();
    initSmoothScroll();
    initCursor();
    initReveals();
    initSplit();
    initProof();
    initGhost();
    initMarquee();
    initParallax();
    initCounters();
    initVideos();
    initHeader();
    ScrollTrigger.refresh();
  }

  window.addEventListener('load', function () {
    runPreloader(function () { if (window.CD && CD.initHero) CD.initHero(); });
    start();
  });

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { ScrollTrigger.refresh(); }, 220);
  });
})();
