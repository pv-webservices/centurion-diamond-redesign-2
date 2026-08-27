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

    document.querySelectorAll('a, button, .card, .cap__toggle').forEach(function (el) {
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

  /* ---------------------------------------------- 100 tick ring */
  function buildHeroRing() {
    var g = document.getElementById('ringTicks');
    if (!g) return;
    var cx = 200, cy = 200, r1 = 196;
    for (var i = 0; i < 100; i++) {
      var major = i % 10 === 0;
      var a = (i / 100) * Math.PI * 2 - Math.PI / 2;
      var r0 = major ? 176 : 186;
      var ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      ln.setAttribute('x1', (cx + Math.cos(a) * r0).toFixed(2));
      ln.setAttribute('y1', (cy + Math.sin(a) * r0).toFixed(2));
      ln.setAttribute('x2', (cx + Math.cos(a) * r1).toFixed(2));
      ln.setAttribute('y2', (cy + Math.sin(a) * r1).toFixed(2));
      if (major) ln.setAttribute('class', 'tk-major');
      g.appendChild(ln);
    }
  }

  /* ---------------------------------------------- split the headline into chars */
  function splitHeadline() {
    var out = [];
    document.querySelectorAll('[data-split-chars]').forEach(function (el) {
      var text = el.textContent;
      el.textContent = '';
      var line = [];
      text.split('').forEach(function (c) {
        var sp = document.createElement('span');
        sp.className = 'ch';
        sp.textContent = c === ' ' ? ' ' : c;
        el.appendChild(sp);
        line.push(sp);
      });
      out.push(line);
    });
    return out;
  }

  /* ---------------------------------------------- hero entrance */
  function heroIn() {
    var h1 = document.getElementById('heroH1');
    var jewel = document.getElementById('heroJewel');
    var ring = document.getElementById('heroRing');
    var bg = document.getElementById('heroBg');
    var lines = splitHeadline();

    if (REDUCED) return;

    var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    tl.fromTo(bg, { scale: 1.16, opacity: 0 },
                  { scale: 1, opacity: 1, duration: 2.2, ease: 'expo.out' }, 0)
      .fromTo('.hero__logo', { opacity: 0, y: 18 },
                             { opacity: 1, y: 0, duration: 0.9 }, 0.12);

    // each line's characters rise on a stagger
    lines.forEach(function (chars, i) {
      tl.fromTo(chars,
        { yPercent: 116, opacity: 0, rotate: 4 },
        { yPercent: 0, opacity: 1, rotate: 0, duration: 1.05, stagger: 0.026 },
        0.22 + i * 0.14);
    });

    tl.fromTo(jewel, { opacity: 0, scale: 0.78, rotate: -14 },
                     { opacity: 1, scale: 1, rotate: 0, duration: 1.5, ease: 'expo.out' }, 0.3)
      .fromTo(ring, { opacity: 0, rotate: -40 }, { opacity: 1, rotate: 0, duration: 1.8 }, 0.5)
      .fromTo('[data-h="1"]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9 }, 0.72)
      .fromTo('[data-h="2"]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9 }, 0.82)
      .fromTo('[data-h="3"]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8 }, 0.92)
      .fromTo('[data-h="4"]', { opacity: 0 }, { opacity: 1, duration: 0.8 }, 1.0)
      .fromTo('.hdr, .rail', { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0.42)
      .add(function () { if (h1) h1.classList.add('is-sweep'); }, 0.95);

    gsap.to(ring, { rotate: 360, duration: 200, ease: 'none', repeat: -1 });

    // scroll-out: ground pushes back, jewel recedes, type lifts
    gsap.to(bg, {
      scale: 1.14, yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.hero__jewel', {
      yPercent: -14, scale: 0.86, opacity: 0, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 34%', scrub: true }
    });
    gsap.to('.hero__type', {
      yPercent: -20, opacity: 0, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 46%', scrub: true }
    });
    gsap.to('.hero__scroll', {
      opacity: 0, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '18% top', scrub: true }
    });
  }

  /* ---------------------------------------------- pointer: jewel tilt + ground drift */
  function initHeroPointer() {
    var hero = document.getElementById('hero');
    var tilt = document.getElementById('jewelTilt');
    var bg = document.getElementById('heroBg');
    if (!hero || !tilt) return;

    var COARSE = window.matchMedia('(hover: none)').matches;

    if (REDUCED) return;

    if (COARSE) {
      // touch: the jewel breathes on its own, and answers a tap
      gsap.to(tilt, {
        rotationY: 10, rotationX: -6, duration: 5.5,
        ease: 'sine.inOut', yoyo: true, repeat: -1
      });
      hero.addEventListener('touchstart', function (e) {
        var t = e.touches[0];
        var r = tilt.getBoundingClientRect();
        var dx = (t.clientX - (r.left + r.width / 2)) / r.width;
        var dy = (t.clientY - (r.top + r.height / 2)) / r.height;
        gsap.to(tilt, {
          rotationY: dx * 26, rotationX: -dy * 26, scale: 1.05,
          duration: 0.5, ease: 'power3.out',
          onComplete: function () {
            gsap.to(tilt, { scale: 1, duration: 0.9, ease: 'elastic.out(1,0.5)' });
          }
        });
      }, { passive: true });
      return;
    }

    var ry = gsap.quickTo(tilt, 'rotationY', { duration: 0.9, ease: 'power3' });
    var rx = gsap.quickTo(tilt, 'rotationX', { duration: 0.9, ease: 'power3' });
    var bx = gsap.quickTo(bg, 'xPercent', { duration: 1.5, ease: 'power3' });
    var by = gsap.quickTo(bg, 'yPercent', { duration: 1.5, ease: 'power3' });

    hero.addEventListener('pointermove', function (e) {
      var w = window.innerWidth, h = window.innerHeight;
      var dx = (e.clientX / w) - 0.5;
      var dy = (e.clientY / h) - 0.5;
      ry(dx * 30); rx(-dy * 26);
      bx(-dx * 2.4); by(-dy * 2.4);
    }, { passive: true });

    hero.addEventListener('pointerleave', function () {
      ry(0); rx(0); bx(0); by(0);
    });

    tilt.addEventListener('pointerenter', function () {
      gsap.to(tilt, { scale: 1.045, duration: 0.7, ease: 'power3.out' });
    });
    tilt.addEventListener('pointerleave', function () {
      gsap.to(tilt, { scale: 1, duration: 0.9, ease: 'power3.out' });
    });
  }

  /* ---------------------------------------------- magnetic buttons */
  function initMagnetic() {
    document.querySelectorAll('[data-mag]').forEach(function (el) {
      // touch feedback everywhere
      el.addEventListener('touchstart', function () { el.classList.add('is-tap'); }, { passive: true });
      el.addEventListener('touchend', function () {
        setTimeout(function () { el.classList.remove('is-tap'); }, 260);
      }, { passive: true });

      if (REDUCED || window.matchMedia('(hover: none)').matches) return;

      var x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
      var y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        x((e.clientX - (r.left + r.width / 2)) * 0.32);
        y((e.clientY - (r.top + r.height / 2)) * 0.42);
      });
      el.addEventListener('pointerleave', function () { x(0); y(0); });
    });
  }


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

  /* ---------------------------------------------- header capsules */
  function initHeader() {
    var hdr = document.getElementById('hdr');
    var cap = document.querySelector('.cap--nav');
    var btn = document.getElementById('navToggle');
    var sheet = document.getElementById('navSheet');
    if (!hdr) return;

    // tighten + auto-hide on scroll direction
    var last = 0;
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: function (self) {
        var y = self.scroll();
        hdr.classList.toggle('is-tight', y > 80);
        if (y < 120) { hdr.classList.remove('is-hidden'); last = y; return; }
        if (sheet && sheet.classList.contains('is-open')) return;
        if (Math.abs(y - last) < 12) return;
        hdr.classList.toggle('is-hidden', y > last);
        last = y;
      }
    });

    if (!btn || !sheet || !cap) return;

    function setMenu(open) {
      cap.dataset.open = String(open);
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
    buildHeroRing();
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
    initHeroPointer();
    initMagnetic();
    ScrollTrigger.refresh();
  }

  window.addEventListener('load', function () {
    runPreloader(function () { heroIn(); });
    start();
  });

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { ScrollTrigger.refresh(); }, 220);
  });
})();
