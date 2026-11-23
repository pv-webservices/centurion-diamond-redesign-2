/* ============================================================
   03 · LIGHT PERFORMANCE — one pinned stage, one progress value.
   Same shape as the Journey, The Cut and Anatomy: a single ScrollTrigger
   produces p (0..1) and render(p) is a pure function of it, so scrolling
   back reverses exactly. Four beats:
     01 the claim     — the 100-facet Round arrives, its ring of 100 lights
     02 20% brighter  — the count runs, the stone flares
     03 measured      — GSI's Light Analysis: the average diamond stops at
                        Good, the Centurion runs on to Excellent
     04 certified     — the GSI report lands
   The section overlaps The Cut by a viewport (light.css) and opens and
   closes on ink, so both hand-offs are seamless.
   ============================================================ */
window.CD = window.CD || {};

CD.light = {
  ticks: 100,
  /* [inA, inB, outA, outB] windows on the section's progress */
  sweep: [0.00, 0.04, 0.06, 0.12],
  copies: [[0.05, 0.12, 0.24, 0.29], [0.30, 0.35, 0.47, 0.52], [0.54, 0.59, 0.72, 0.77], [0.79, 0.84, 0.95, 0.99]],
  stone: { inA: 0.03, inB: 0.15, flareA: 0.30, flareB: 0.44, outA: 0.49, outB: 0.57 },
  litA: 0.04, litB: 0.30,
  count: [0.31, 0.43],
  chart: [0.52, 0.60, 0.74, 0.79],
  rows: [0.58, 0.71],                  // the three rows draw one after another
  avgAt: 0.375, cenAt: 0.965,          // Good, Excellent (scale midpoints)
  docs: [[0.78, 0.87], [0.81, 0.90]],  // folder, then the grading page
  docsOut: [0.95, 0.99],
  beats: [0.29, 0.52, 0.77],           // rail: where each step hands over
  rail: [0.04, 0.95]
};

CD.initLight = function initLight() {
  'use strict';
  var root = document.getElementById('light');
  if (!root || typeof gsap === 'undefined' || root.dataset.mounted) return;
  root.dataset.mounted = 'true';

  var cfg = CD.light;
  var q = function (s) { return root.querySelector(s); };
  var all = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };
  var el = {
    stage: q('.lpt__stage'), sweep: q('[data-lpt-sweep]'), stone: q('[data-lpt-stone]'),
    img: q('[data-lpt-img]'), glow: q('[data-lpt-glow]'), rays: q('[data-lpt-rays]'), flare: q('[data-lpt-flare]'),
    ring: q('[data-lpt-ring]'), copies: all('[data-lpt-copy]'), count: q('[data-lpt-count]'),
    chart: q('[data-lpt-chart]'), rows: all('[data-lpt-row]'), docs: all('[data-lpt-doc]'),
    steps: all('[data-lpt-step]'), rail: q('[data-lpt-rail]')
  };
  el.lines = el.copies.map(function (c) { return Array.prototype.slice.call(c.querySelectorAll('.lpt__ln > span')); });

  /* the ring: 100 marks, every tenth longer */
  var ns = 'http://www.w3.org/2000/svg', ticks = [], group = q('[data-lpt-ticks]');
  for (var i = 0; i < cfg.ticks; i++) {
    var a = i / cfg.ticks * Math.PI * 2 - Math.PI / 2, long = i % 10 === 0;
    var r1 = long ? 174 : 182, line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', (200 + Math.cos(a) * r1).toFixed(2)); line.setAttribute('y1', (200 + Math.sin(a) * r1).toFixed(2));
    line.setAttribute('x2', (200 + Math.cos(a) * 192).toFixed(2)); line.setAttribute('y2', (200 + Math.sin(a) * 192).toFixed(2));
    if (long) line.setAttribute('class', 'is-long');
    group.appendChild(line); ticks.push(line);
  }

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('is-reduced');
    ticks.forEach(function (t) { t.classList.add('is-lit'); });
    el.rows.forEach(function (r) { r.style.setProperty('--avg', cfg.avgAt); r.style.setProperty('--cen', cfg.cenAt); });
    return;
  }

  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var range = function (p, a, b) { return clamp((p - a) / (b - a)); };
  var smooth = function (t) { return t * t * (3 - 2 * t); };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  var band = function (p, w) { return smooth(range(p, w[0], w[1])) * (1 - smooth(range(p, w[2], w[3]))); };
  var show = function (node, v) { node.style.opacity = v.toFixed(3); node.style.visibility = v < 0.005 ? 'hidden' : 'visible'; };
  var lit = -1, lastCount = '';

  function renderCopies(p) {
    el.copies.forEach(function (node, k) {
      var w = cfg.copies[k], vin = easeOut(range(p, w[0], w[1])), vout = smooth(range(p, w[2], w[3]));
      show(node, vin * (1 - vout));
      node.style.transform = 'translate3d(0,' + (-vout * 26).toFixed(1) + 'px,0)';
      /* the title lines rise out of their own masks, one after another */
      el.lines[k].forEach(function (ln, j) {
        var t = easeOut(range(p, w[0] + j * 0.012, w[1] + j * 0.012));
        ln.style.transform = 'translate3d(0,' + ((1 - t) * 108).toFixed(1) + '%,0)';
      });
    });
  }

  function renderStone(p) {
    var S = cfg.stone;
    var enter = easeOut(range(p, S.inA, S.inB)), flare = smooth(range(p, S.flareA, S.flareB)), out = smooth(range(p, S.outA, S.outB));
    var pulse = Math.sin(flare * Math.PI);                      // peaks mid-flare
    show(el.stone, enter * (1 - out));
    el.stone.style.transform = 'translate(-50%,-50%) scale(' + (0.84 + enter * 0.16 + flare * 0.04 - out * 0.12).toFixed(4) +
      ') rotate(' + ((1 - enter) * -10 + p * 14).toFixed(2) + 'deg)';
    el.img.style.filter = 'brightness(' + (0.82 + enter * 0.18 + flare * 0.22).toFixed(3) + ') contrast(' + (1 + flare * 0.08).toFixed(3) + ')';
    el.glow.style.opacity = (0.35 + enter * 0.35 + flare * 0.3).toFixed(3);
    el.rays.style.opacity = (enter * 0.1 + flare * 0.38 + pulse * 0.12).toFixed(3);
    el.rays.style.transform = 'rotate(' + (p * 120).toFixed(2) + 'deg) scale(' + (0.9 + flare * 0.25).toFixed(3) + ')';
    el.flare.style.opacity = pulse.toFixed(3);
    el.flare.style.setProperty('--fx', (-120 + flare * 240).toFixed(1) + '%');   // band inside the stone's circle
    el.ring.style.transform = 'rotate(' + (p * -40).toFixed(2) + 'deg)';

    var n = Math.round(smooth(range(p, cfg.litA, cfg.litB)) * cfg.ticks);
    if (n !== lit) { for (var t = 0; t < ticks.length; t++) ticks[t].classList.toggle('is-lit', t < n); lit = n; }

    var c = String(Math.round(easeOut(range(p, cfg.count[0], cfg.count[1])) * 20));
    if (c !== lastCount) { el.count.textContent = c; lastCount = c; }
  }

  function renderChart(p) {
    var w = cfg.chart, vin = easeOut(range(p, w[0], w[1])), vout = smooth(range(p, w[2], w[3]));
    show(el.chart, vin * (1 - vout));
    el.chart.style.transform = 'translate(-50%,-50%) perspective(1400px) translate3d(0,' + ((1 - vin) * 70 - vout * 40).toFixed(1) +
      'px,0) rotateX(' + ((1 - vin) * 16).toFixed(2) + 'deg) scale(' + (0.94 + vin * 0.06).toFixed(4) + ')';
    var span = (cfg.rows[1] - cfg.rows[0]) / el.rows.length;
    el.rows.forEach(function (r, k) {
      var a = cfg.rows[0] + k * span * 0.7, t = easeOut(range(p, a, a + span * 1.6));
      /* both markers set off together; the average stops at Good, the Centurion runs on */
      r.style.setProperty('--avg', (Math.min(t * cfg.cenAt, cfg.avgAt)).toFixed(4));
      r.style.setProperty('--cen', (t * cfg.cenAt).toFixed(4));
      r.style.setProperty('--on', smooth(range(t, 0.9, 1)).toFixed(3));
    });
  }

  function renderDocs(p) {
    var out = smooth(range(p, cfg.docsOut[0], cfg.docsOut[1]));
    el.docs.forEach(function (d, k) {
      var w = cfg.docs[k], t = easeOut(range(p, w[0], w[1]));
      show(d, t * (1 - out));
      var rot = k === 0 ? -9 + (1 - t) * -8 : 3 + (1 - t) * 10;
      var x = k === 0 ? (1 - t) * -60 - 7 : (1 - t) * 90 + 4;
      var y = k === 0 ? (1 - t) * 40 - 4 : (1 - t) * 120 + 3;
      d.style.transform = 'translate3d(' + x.toFixed(1) + '%,' + y.toFixed(1) + 'px,0) rotate(' + rot.toFixed(2) + 'deg) scale(' + (0.9 + t * 0.1 - out * 0.04).toFixed(4) + ')';
    });
  }

  function render(p) {
    var sw = band(p, cfg.sweep);
    el.sweep.style.opacity = sw.toFixed(3);
    el.sweep.style.transform = 'translate3d(' + (-60 + 170 * easeOut(range(p, cfg.sweep[0], cfg.sweep[3]))).toFixed(1) + '%,0,0) skewX(-14deg)';
    renderStone(p);
    renderCopies(p);
    renderChart(p);
    renderDocs(p);

    var active = cfg.beats.filter(function (b) { return p >= b; }).length;
    el.steps.forEach(function (li, k) { li.classList.toggle('is-active', k === active); li.classList.toggle('is-done', k < active); });
    el.rail.style.transform = 'scaleX(' + smooth(range(p, cfg.rail[0], cfg.rail[1])).toFixed(4) + ')';
    var railV = smooth(range(p, 0.04, 0.09)) * (1 - smooth(range(p, 0.95, 0.99)));
    el.steps[0].parentNode.style.opacity = railV.toFixed(3);
  }

  /* overlaps The Cut by a viewport: hidden until this pin takes over */
  function live(s) { root.classList.toggle('is-live', s.scroll() >= s.start - 2); }
  ScrollTrigger.create({
    trigger: root, start: 'top top', end: 'bottom bottom',
    pin: el.stage, pinSpacing: false, anticipatePin: 1,
    onToggle: live, onRefresh: live,
    onUpdate: function (s) { live(s); render(s.progress); }
  });
  render(0);
};
