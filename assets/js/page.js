/* ============================================================
   CENTURION DIAMOND — inner pages: shared motion.
   Called from main.js once the page's one Lenis/GSAP setup is running,
   so the inner pages scroll, reveal and count exactly like the homepage.
     - the ink curtain that lifts on arrival and falls before leaving
     - headline lines rising out of their masks ([data-lines])
     - the 100-tick facet ring ([data-ring100]) lighting up in view
     - the header firming up once content passes under it
   Page-specific behaviour hangs off CD.pageInits (locator, contact form).
   ============================================================ */
window.CD = window.CD || {};
CD.pageInits = CD.pageInits || [];

CD.initPage = function initPage() {
  'use strict';
  if (!document.body.classList.contains('pg')) return;

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var curtain = document.getElementById('pgCurtain');
  var hdr = document.getElementById('hdr');

  /* ---------- the 100-tick ring ---------- */
  var NS = 'http://www.w3.org/2000/svg';
  function buildRing(svg) {
    var base = document.createElementNS(NS, 'circle');
    base.setAttribute('class', 'ring100__base');
    base.setAttribute('cx', 200); base.setAttribute('cy', 200); base.setAttribute('r', 196);
    svg.appendChild(base);
    var ticks = [];
    for (var i = 0; i < 100; i++) {
      var a = i / 100 * Math.PI * 2 - Math.PI / 2, long = i % 10 === 0;
      var r1 = long ? 174 : 183, l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', (200 + Math.cos(a) * r1).toFixed(2)); l.setAttribute('y1', (200 + Math.sin(a) * r1).toFixed(2));
      l.setAttribute('x2', (200 + Math.cos(a) * 193).toFixed(2)); l.setAttribute('y2', (200 + Math.sin(a) * 193).toFixed(2));
      if (long) l.setAttribute('class', 'is-long');
      svg.appendChild(l); ticks.push(l);
    }
    return ticks;
  }
  function lightRing(ticks, delay) {
    if (REDUCED) { ticks.forEach(function (t) { t.classList.add('is-lit'); }); return; }
    var o = { n: 0 };
    gsap.to(o, { n: ticks.length, duration: 2.2, delay: delay || 0, ease: 'power2.inOut', onUpdate: function () {
      var n = Math.round(o.n);
      for (var i = 0; i < ticks.length; i++) ticks[i].classList.toggle('is-lit', i < n);
    } });
  }
  var rings = Array.prototype.map.call(document.querySelectorAll('[data-ring100]'), function (svg) {
    svg.setAttribute('viewBox', '0 0 400 400');
    return { svg: svg, ticks: buildRing(svg), hero: !!svg.closest('.pg-hero') };
  });
  rings.forEach(function (r) {
    if (r.hero) return;                                   // lit with the hero entrance
    ScrollTrigger.create({ trigger: r.svg, start: 'top 85%', once: true, onEnter: function () { lightRing(r.ticks); } });
  });

  /* ---------- headline lines ---------- */
  function linesIn(scope, delay) {
    var spans = scope.querySelectorAll('.pg-ln > span');
    if (!spans.length) return;
    if (REDUCED) { gsap.set(spans, { yPercent: 0, y: 0 }); return; }
    gsap.fromTo(spans, { y: 0, yPercent: 110 }, { yPercent: 0, duration: 1.25, ease: 'expo.out', stagger: 0.11, delay: delay || 0 });
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-lines]'), function (block) {
    if (block.closest('.pg-hero')) return;
    ScrollTrigger.create({ trigger: block, start: 'top 86%', once: true, onEnter: function () { linesIn(block); } });
  });

  /* ---------- arrival: curtain lifts, the hero composes ---------- */
  var hero = document.querySelector('.pg-hero');
  function heroIn() {
    if (!hero) return;
    linesIn(hero, 0.05);
    rings.forEach(function (r) { if (r.hero) { lightRing(r.ticks, 0.2); r.svg.classList.add('is-turning'); } });
    if (REDUCED) return;
    gsap.from(hero.querySelectorAll('[data-hero-fade]'), { opacity: 0, y: 22, duration: 1.1, ease: 'expo.out', stagger: 0.09, delay: 0.35 });
    gsap.from(hero.querySelectorAll('.pg-hero__visual img'), { opacity: 0, scale: 0.9, rotate: -6, duration: 1.6, ease: 'expo.out', delay: 0.15 });
  }
  if (curtain) curtain.classList.add('is-driven');
  if (curtain && !REDUCED) {
    var line = curtain.querySelector('.pg-curtain__line');
    gsap.timeline({ onComplete: function () { curtain.style.visibility = 'hidden'; } })
      .to(line, { scaleX: 1, duration: 0.5, ease: 'power2.inOut' })
      .to(line, { opacity: 0, duration: 0.25 }, '+=0.05')
      .to(curtain, { scaleY: 0, duration: 0.85, ease: 'expo.inOut' }, '-=0.15')
      .add(heroIn, '-=0.45');
  } else {
    if (curtain) curtain.style.visibility = 'hidden';
    heroIn();
  }

  /* ---------- leaving: the curtain falls before the next page ---------- */
  function isInternalPage(a) {
    if (!a || a.target || a.hasAttribute('download') || a.origin !== location.origin) return false;
    if (a.pathname === location.pathname && a.hash) return false;      // in-page anchor
    return /(\.html|\/)$/.test(a.pathname);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!curtain || REDUCED || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || !isInternalPage(a)) return;
    e.preventDefault();
    var href = a.href;
    curtain.style.visibility = 'visible';
    curtain.style.transformOrigin = 'bottom center';
    gsap.fromTo(curtain, { scaleY: 0 }, { scaleY: 1, duration: 0.6, ease: 'expo.inOut', onComplete: function () { location.href = href; } });
  });
  /* coming back through the history cache must not land on a closed curtain */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted && curtain) { gsap.set(curtain, { scaleY: 0 }); curtain.style.visibility = 'hidden'; }
  });

  /* ---------- header: solid once the hero has passed under it ---------- */
  if (hdr) {
    var solid = function () { hdr.classList.toggle('is-solid', window.scrollY > 60); };
    if (window.lenis) window.lenis.on('scroll', solid);
    window.addEventListener('scroll', solid, { passive: true });
    solid();
  }

  CD.pageInits.forEach(function (fn) { fn(); });
};
