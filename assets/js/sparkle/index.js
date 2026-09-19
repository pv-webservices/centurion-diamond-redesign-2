/* ============================================================
   03 · THE CENTURION CUT — engine.
   One pinned ScrollTrigger; every frame is a pure function of progress, so
   scrolling back reverses exactly. Only transform, opacity, clip-path,
   colour and one text node change while scrolling.
   ============================================================ */
window.CD = window.CD || {};

CD.initSparkle = function initSparkle() {
  'use strict';

  var root = document.getElementById('cut');
  if (!root || typeof gsap === 'undefined' || !CD.sparkle) return;
  if (root.dataset.mounted) return;
  root.dataset.mounted = 'true';

  var cfg = CD.sparkle, B = cfg.beats;
  var q = function (s) { return root.querySelector(s); };
  var el = {
    stage: q('.spk__stage'), sweep: q('[data-spk-sweep]'), intro: q('[data-spk-intro]'),
    pair: q('[data-spk-pair]'), cen: q('[data-spk-cut="centurion"]'), trad: q('[data-spk-cut="traditional"]'),
    over: q('[data-spk-over]'), under: q('[data-spk-under]'), wipe: q('[data-spk-wipe]'),
    label: q('[data-spk-label]'), num: q('[data-spk-num]'), note: q('[data-spk-note]'),
    lede: q('[data-spk-lede]'), outro: q('[data-spk-outro]')
  };

  /* facet rails: one tick per facet (100 and 57), drawn on with progress */
  var ns = 'http://www.w3.org/2000/svg';
  var rails = Array.prototype.map.call(root.querySelectorAll('[data-spk-ticks]'), function (g) {
    var n = +g.getAttribute('data-spk-ticks'), out = [];
    for (var i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2 - Math.PI / 2, major = i % 10 === 0;
      var l = document.createElementNS(ns, 'line'), r1 = major ? 176 : 184;
      l.setAttribute('x1', (200 + Math.cos(a) * r1).toFixed(2)); l.setAttribute('y1', (200 + Math.sin(a) * r1).toFixed(2));
      l.setAttribute('x2', (200 + Math.cos(a) * 196).toFixed(2)); l.setAttribute('y2', (200 + Math.sin(a) * 196).toFixed(2));
      if (major) l.setAttribute('class', 'is-major');
      g.appendChild(l); out.push(l);
    }
    return { lines: out, lit: -1 };
  });

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function range(p, a, b) { return clamp((p - a) / (b - a)); }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function mixc(a, b, t) { return 'rgb(' + a.map(function (v, i) { return Math.round(v + (b[i] - v) * t); }).join(',') + ')'; }
  function band(p, w) { var v = smooth(range(p, w.inA, w.inB)); return w.outA == null ? v : v * (1 - smooth(range(p, w.outA, w.outB))); }
  function bgAt(p) {
    var s = cfg.bgStops;
    for (var i = 1; i < s.length; i++) if (p <= s[i].p || i === s.length - 1) return mixc(s[i - 1].c, s[i].c, range(p, s[i - 1].p, s[i].p));
  }
  function light(rail, k) {
    var n = Math.round(k * rail.lines.length);
    if (n === rail.lit) return;
    for (var i = 0; i < rail.lines.length; i++) rail.lines[i].classList.toggle('is-lit', i < n);
    rail.lit = n;
  }

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('is-reduced');
    rails.forEach(function (r) { light(r, 1); });
    el.label.textContent = 'Centurion'; el.num.textContent = '100'; el.note.textContent = 'Patent-pending geometry';
    root.classList.add('is-centurion');
    return;
  }

  var narrow = matchMedia('(max-width: 900px)').matches, lastCount = -1, lastSide = '';
  window.addEventListener('resize', function () { narrow = matchMedia('(max-width: 900px)').matches; }, { passive: true });

  function render(p) {
    /* ground, type colour and the passing light */
    el.stage.style.backgroundColor = bgAt(p);
    el.stage.style.setProperty('--spk-ink', mixc(cfg.inkLight, cfg.inkDark, smooth(range(p, cfg.inkSwitch[0], cfg.inkSwitch[1]))));
    var sw = band(p, B.sweep);
    el.sweep.style.opacity = sw.toFixed(3);
    el.sweep.style.transform = 'translate3d(' + (-60 + 150 * smooth(range(p, 0.02, 0.21))).toFixed(2) + '%,0,0) skewX(-14deg)';

    /* intro */
    var iv = band(p, B.intro);
    el.intro.style.opacity = iv.toFixed(3);
    el.intro.style.visibility = iv < 0.01 ? 'hidden' : 'visible';
    el.intro.style.transform = 'translate3d(0,' + ((1 - smooth(range(p, B.intro.inA, B.intro.inB))) * 24 - smooth(range(p, B.intro.outA, B.intro.outB)) * 30).toFixed(1) + 'px,0)';

    /* one stone: the traditional arrives, then the Centurion wipes over it */
    var single = smooth(range(p, B.single.inA, B.single.inB));
    var wipe = smooth(range(p, B.wipe.inA, B.wipe.inB));
    var split = smooth(range(p, B.split.inA, B.split.inB));
    var out = smooth(range(p, B.pairOut.inA, B.pairOut.inB));

    /* once the wipe lands, drop the clip and the stone underneath entirely:
       nothing of the traditional can fringe the Centurion's finished edge */
    var landed = wipe >= 0.999;
    el.over.style.clipPath = landed ? 'none' : 'inset(0 ' + ((1 - wipe) * 100).toFixed(2) + '% 0 0)';
    el.under.style.visibility = landed ? 'hidden' : 'visible';
    el.wipe.style.left = (wipe * 100).toFixed(2) + '%';
    el.wipe.style.opacity = (Math.sin(wipe * Math.PI) * 1.2).toFixed(3);

    /* the count runs with the wipe; label and note turn at the midpoint */
    var count = Math.round(cfg.counts.from + (cfg.counts.to - cfg.counts.from) * wipe);
    if (count !== lastCount) { el.num.textContent = String(count); lastCount = count; }
    var side = wipe >= 0.5 ? 'centurion' : 'traditional';
    if (side !== lastSide) {
      el.label.textContent = side === 'centurion' ? 'Centurion' : 'Traditional';
      el.note.textContent = side === 'centurion' ? 'Patent-pending geometry' : 'The industry standard';
      root.classList.toggle('is-centurion', side === 'centurion');
      lastSide = side;
    }
    light(rails[0], wipe);                 // the Centurion rail fills to 100 as it wipes over
    light(rails[1], split);                // the traditional's own 57 on the split

    /* positions: one centred stone, then the pair side by side. On phones the
       single stone starts larger and both shrink to share the width. */
    var gap = narrow ? 24 : 19;                               // vw from centre
    var sPair = narrow ? 0.6 : 1;                             // keeps the two tick rings apart
    var s = 1 + (sPair - 1) * split;
    var enterY = (1 - single) * 40;
    el.cen.style.transform = 'translate3d(' + (-split * gap).toFixed(2) + 'vw,' + enterY.toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ')';
    el.trad.style.transform = 'translate3d(' + (split * gap).toFixed(2) + 'vw,0,0) scale(' + (s * (0.9 + split * 0.1)).toFixed(4) + ')';
    el.cen.style.opacity = single.toFixed(3);
    el.trad.style.opacity = split.toFixed(3);
    el.trad.style.visibility = split < 0.01 ? 'hidden' : 'visible';

    el.pair.style.opacity = (1 - out).toFixed(3);
    el.pair.style.visibility = out > 0.99 || single < 0.01 ? 'hidden' : 'visible';
    el.pair.style.transform = 'translate3d(0,' + (-out * 8).toFixed(2) + 'svh,0) scale(' + (1 - out * 0.06).toFixed(4) + ')';

    var lv = band(p, B.lede);
    el.lede.style.opacity = lv.toFixed(3);
    el.lede.style.visibility = lv < 0.01 ? 'hidden' : 'visible';

    /* the close: held until the section hands over to Anatomy */
    var ov = smooth(range(p, B.outro.inA, B.outro.inB));
    el.outro.style.opacity = ov.toFixed(3);
    el.outro.style.visibility = ov < 0.01 ? 'hidden' : 'visible';
    el.outro.style.transform = 'translate3d(0,' + ((1 - ov) * 30).toFixed(1) + 'px,0) scale(' + (0.96 + ov * 0.04).toFixed(4) + ')';
  }

  ScrollTrigger.create({
    trigger: root, start: 'top top', end: 'bottom bottom',
    pin: el.stage, pinSpacing: false, anticipatePin: 1,
    onUpdate: function (st) { render(st.progress); }
  });
  render(0);
};
