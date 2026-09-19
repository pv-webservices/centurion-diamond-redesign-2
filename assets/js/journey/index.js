/* ============================================================
   02 · THE DIAMOND JOURNEY — one stone, worked in place.
   A single ScrollTrigger owns progress 0..1. Four stages hold in turn
   (rough, sawn, shaped, finished); each change is a dissolve with a light
   sweep and a small settle. A ring of 100 ticks lights up with progress and
   completes on the finished stone. Illustrative study, not a cutting spec.
   ============================================================ */
window.CD = window.CD || {};

CD.journey = {
  /* stage k holds until swaps[k] begins; each swap lasts `swap` */
  swaps: [0.24, 0.49, 0.74],
  swap: 0.08,
  /* caption windows: [inA, inB, outA, outB] */
  captions: [[-1, 0, 0.19, 0.23], [0.31, 0.35, 0.44, 0.48], [0.56, 0.60, 0.69, 0.73], [0.81, 0.85, 2, 2]],
  ticks: 100,
  /* ember (rough) -> diamond white (finished) */
  glowFrom: [196, 126, 92],
  glowTo: [226, 222, 236]
};

CD.initJourney = function () {
  'use strict';
  var root = document.getElementById('journey');
  if (!root || root.dataset.mounted) return;
  root.dataset.mounted = 'true';
  var cfg = CD.journey;
  var q = function (s) { return root.querySelector(s); };
  var all = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };

  /* the tick ring: 100 marks, every tenth longer */
  var ns = 'http://www.w3.org/2000/svg', tickGroup = q('[data-jny-ticks]'), ticks = [];
  for (var i = 0; i < cfg.ticks; i++) {
    var a = i / cfg.ticks * Math.PI * 2 - Math.PI / 2, long = i % 10 === 0;
    var r1 = long ? 176 : 183, r2 = 192;
    var line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', (200 + Math.cos(a) * r1).toFixed(2)); line.setAttribute('y1', (200 + Math.sin(a) * r1).toFixed(2));
    line.setAttribute('x2', (200 + Math.cos(a) * r2).toFixed(2)); line.setAttribute('y2', (200 + Math.sin(a) * r2).toFixed(2));
    if (long) line.setAttribute('class', 'is-long');
    tickGroup.appendChild(line); ticks.push(line);
  }

  var el = {
    stone: q('[data-jny-stone]'), imgs: all('[data-jny-img]'), shine: q('[data-jny-shine]'),
    glints: q('[data-jny-glints]'), guides: q('[data-jny-guides]'), glow: q('[data-jny-glow]'),
    ring: q('[data-jny-ring]'), copies: all('[data-jny-copy]'), steps: all('[data-jny-step]'), rail: q('[data-jny-rail]')
  };

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('is-reduced');
    ticks.forEach(function (t) { t.classList.add('is-lit'); });
    return;
  }

  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var range = function (p, a, b) { return clamp((p - a) / (b - a)); };
  var smooth = function (t) { return t * t * (3 - 2 * t); };
  var lit = -1;

  function render(p) {
    /* stage blend: which pair is dissolving, and how far */
    var from = 0, mix = 0;
    for (var s = 0; s < cfg.swaps.length; s++) {
      if (p >= cfg.swaps[s]) { from = s; mix = smooth(range(p, cfg.swaps[s], cfg.swaps[s] + cfg.swap)); }
    }
    if (mix >= 1) { from = Math.min(from + 1, 3); mix = 0; }
    var pulse = Math.sin(mix * Math.PI);                     // 0 at rest, 1 mid-swap
    el.imgs.forEach(function (img, k) {
      var o = k === from ? 1 - mix : k === from + 1 ? mix : 0;
      img.style.opacity = o.toFixed(3);
      img.style.visibility = o < 0.004 ? 'hidden' : 'visible';
      /* the outgoing stone softens and flares, the incoming one only flares */
      img.style.filter = pulse < 0.01 || o < 0.004 ? ''
        : (k === from ? 'blur(' + (pulse * 2.4).toFixed(2) + 'px) ' : '') + 'brightness(' + (1 + pulse * 0.25).toFixed(3) + ')';
    });

    /* the stone: arrives, settles at each swap, lifts slightly when finished */
    var enter = smooth(range(p, 0, 0.12)), done = smooth(range(p, 0.82, 0.95));
    el.stone.style.transform = 'translate(-50%,-50%) scale(' + (0.9 + enter * 0.1 - pulse * 0.025 + done * 0.04).toFixed(4) + ') rotate(' + ((1 - enter) * -8 + pulse * 2).toFixed(2) + 'deg)';

    /* light sweep across the stone during each swap */
    el.shine.style.opacity = pulse.toFixed(3);
    el.shine.style.transform = 'translateX(' + (-110 + mix * 220).toFixed(1) + '%) skewX(-18deg)';

    /* construction lines only while it is being shaped */
    el.guides.style.opacity = (0.42 * smooth(range(p, 0.44, 0.52)) * (1 - smooth(range(p, 0.72, 0.8)))).toFixed(3);

    /* glints only on the finished stone */
    el.glints.style.opacity = done.toFixed(3);

    /* 100 ticks light with progress; all lit exactly as it is finished */
    var n = Math.round(smooth(range(p, 0.04, 0.84)) * cfg.ticks);
    if (n !== lit) {
      for (var t = 0; t < ticks.length; t++) ticks[t].classList.toggle('is-lit', t < n);
      lit = n;
    }
    el.ring.style.transform = 'rotate(' + (p * 60).toFixed(2) + 'deg)';

    /* ember -> diamond white */
    var g = smooth(range(p, 0.2, 0.9)), c = cfg.glowFrom.map(function (v, k) { return Math.round(v + (cfg.glowTo[k] - v) * g); });
    el.glow.style.setProperty('--jny-glow', c.join(','));
    el.glow.style.opacity = (0.55 + enter * 0.35 + done * 0.1).toFixed(3);

    /* captions */
    el.copies.forEach(function (node, k) {
      var w = cfg.captions[k], vin = smooth(range(p, w[0], w[1])), vout = smooth(range(p, w[2], w[3]));
      var v = vin * (1 - vout);
      node.style.opacity = v.toFixed(3);
      node.style.visibility = v < 0.01 ? 'hidden' : 'visible';
      node.style.transform = 'translate3d(0,' + ((1 - vin) * 22 - vout * 14).toFixed(1) + 'px,0)';
    });

    /* stage rail */
    var active = mix > 0.5 ? from + 1 : from;
    el.steps.forEach(function (li, k) { li.classList.toggle('is-active', k === active); li.classList.toggle('is-done', k < active); });
    el.rail.style.transform = 'scaleX(' + smooth(range(p, 0.02, 0.84)).toFixed(4) + ')';
  }

  ScrollTrigger.create({
    trigger: root, start: 'top top', end: 'bottom bottom',
    pin: root.querySelector('.jny__stage'), pinSpacing: false, anticipatePin: 1,
    onUpdate: function (st) { render(st.progress); }
  });
  render(0);
};
