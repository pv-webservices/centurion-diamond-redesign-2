/* ============================================================
   THE SPARKLE — dark-to-light passage.

   One pinned ScrollTrigger yields a master progress value; five small
   timelines read it independently (transition / intro / facet / compare /
   outro). Same pattern as the hero, so the two sections behave alike.

   Everything animated here is transform / opacity / background-color, and the
   facet rails are built once at mount — no DOM churn while scrolling.
   ============================================================ */
window.CD = window.CD || {};

CD.initSparkle = function initSparkle() {
  'use strict';

  var root = document.getElementById('cut');
  if (!root || typeof gsap === 'undefined' || !CD.sparkle) return;

  var cfg      = CD.sparkle;
  var stage    = root.querySelector('.spk__stage');
  var sweep    = root.querySelector('[data-spk-sweep]');
  var intro    = root.querySelector('[data-spk-intro]');
  var introLn  = root.querySelectorAll('.spk__ln > span');
  var eyebrow  = root.querySelector('.spk__eyebrow');
  var field    = root.querySelector('[data-spk-field]');
  var figs     = root.querySelectorAll('.cut');
  var lede     = root.querySelector('[data-spk-lede]');
  var outro    = root.querySelector('[data-spk-outro]');
  var words    = root.querySelectorAll('[data-spk-word]');
  var rule     = root.querySelector('[data-spk-rule] i');
  var metas    = Array.prototype.slice.call(root.querySelectorAll('.cut__meta'));

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- helpers ---------- */
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function range(p, a, b) { return b === a ? (p >= b ? 1 : 0) : clamp01((p - a) / (b - a)); }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeIn(t) { return t * t * t; }
  function band(p, w) { return easeOut(range(p, w.inA, w.inB)) * (w.outA == null ? 1 : 1 - easeIn(range(p, w.outA, w.outB))); }

  /* ---------- facet rails: one tick per facet, drawn on ---------- */
  function buildRail(g, count) {
    var cx = 200, cy = 200, rOut = 194;
    for (var i = 0; i < count; i++) {
      var major = i % 10 === 0;
      var a = (i / count) * Math.PI * 2 - Math.PI / 2;
      var rIn = major ? 168 : 180;
      var ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      ln.setAttribute('x1', (cx + Math.cos(a) * rIn).toFixed(2));
      ln.setAttribute('y1', (cy + Math.sin(a) * rIn).toFixed(2));
      ln.setAttribute('x2', (cx + Math.cos(a) * rOut).toFixed(2));
      ln.setAttribute('y2', (cy + Math.sin(a) * rOut).toFixed(2));
      if (major) ln.setAttribute('class', 'tk-major');
      g.appendChild(ln);
    }
    return g.querySelectorAll('line');
  }

  var rails = [];
  figs.forEach(function (fig, i) {
    var g = fig.querySelector('[data-ticks]');
    var spec = cfg.cuts[i];
    var lines = buildRail(g, spec ? spec.ticks : 100);
    lines.forEach(function (l) { l.style.strokeDasharray = '26'; l.style.strokeDashoffset = '26'; });
    rails.push({ fig: fig, lines: lines, spec: spec,
                 num: fig.querySelector('[data-count-to]') });
  });

  /* ---------- background ramp ---------- */
  var stops = cfg.bgStops;
  function bgAt(p) {
    for (var i = 1; i < stops.length; i++) {
      if (p <= stops[i].p || i === stops.length - 1) {
        var a = stops[i - 1], b = stops[i];
        var t = range(p, a.p, b.p);
        return 'rgb(' + Math.round(a.c[0] + (b.c[0] - a.c[0]) * t) + ','
                      + Math.round(a.c[1] + (b.c[1] - a.c[1]) * t) + ','
                      + Math.round(a.c[2] + (b.c[2] - a.c[2]) * t) + ')';
      }
    }
    return 'rgb(243,241,238)';
  }

  /* ---------- reduced motion: stable, fully readable composition ---------- */
  if (REDUCED) {
    root.classList.add('is-reduced');
    stage.style.backgroundColor = 'rgb(243,241,238)';
    rails.forEach(function (r) {
      r.lines.forEach(function (l) { l.style.strokeDashoffset = '0'; });
      if (r.num) r.num.textContent = r.spec ? r.spec.count : '';
    });
    if (rule) rule.style.transform = 'scaleX(1)';
    return;
  }

  // narrow viewports stack the pair, so the gather/split runs on Y not X
  var VERT = window.matchMedia('(max-width: 900px)').matches;
  var counted = [-1, -1];

  ScrollTrigger.create({
    trigger: root,
    start: 'top top',
    end: 'bottom bottom',
    pin: stage,
    pinSpacing: false,
    anticipatePin: 1,
    onUpdate: function (self) {
      var p = self.progress;

      /* --- 1. light transition --- */
      stage.style.backgroundColor = bgAt(p);
      root.classList.toggle('is-light', p > 0.17);
      var sw = band(p, cfg.beats.sweep);
      sweep.style.opacity = sw.toFixed(3);
      sweep.style.transform = 'translate3d(' + (-60 + 150 * easeOut(range(p, 0.02, 0.24))).toFixed(2) + '%,0,0) skewX(-14deg)';

      /* --- 2. intro typography --- */
      var iv = band(p, cfg.beats.intro);
      var iIn = easeOut(range(p, cfg.beats.intro.inA, cfg.beats.intro.inB));
      var iOut = easeIn(range(p, cfg.beats.intro.outA, cfg.beats.intro.outB));
      intro.style.opacity = iv.toFixed(3);
      intro.style.transform = 'translate3d(0,' + (-iOut * 12).toFixed(2) + 'vh,0)';
      eyebrow.style.opacity = easeOut(range(p, cfg.beats.intro.inA, cfg.beats.intro.inA + 0.05)).toFixed(3);
      for (var i = 0; i < introLn.length; i++) {
        var d = i * 0.22;
        var lv = easeOut(clamp01((iIn - d) / (1 - d)));
        introLn[i].style.transform = 'translate3d(0,' + ((1 - lv) * 108).toFixed(2) + '%,0)';
      }

      /* --- 3. the cut + 4. the two worlds --- */
      var fv = easeOut(range(p, cfg.beats.facet.inA, cfg.beats.facet.inB));
      var cv = easeOut(range(p, cfg.beats.compare.inA, cfg.beats.compare.inB));
      var co = easeIn(range(p, cfg.beats.compare.outA, cfg.beats.compare.outB));
      field.style.opacity = Math.min(1, fv).toFixed(3);

      rails.forEach(function (r, idx) {
        var isC = idx === 0;
        var lead = isC ? fv : cv;

        // draw the ticks
        var drawn = isC ? fv : cv;
        var n = r.lines.length;
        for (var k = 0; k < n; k++) {
          var kd = (k / n) * 0.55;
          var kv = clamp01((drawn - kd) / (1 - kd));
          r.lines[k].style.strokeDashoffset = (26 * (1 - kv)).toFixed(2);
        }

        // count the number up as its ticks draw
        var target = Math.round((r.spec ? r.spec.count : 0) * drawn);
        if (r.num && counted[idx] !== target) { r.num.textContent = target; counted[idx] = target; }

        // The flex row already places the pair; translation only gathers them to
        // centre while the Centurion leads alone, then releases to the split,
        // then re-centres the Centurion as the traditional cut leaves.
        var GATHER = VERT ? 17 : 15;           // vh when stacked, vw when side by side
        var shift = isC ? GATHER * (1 - cv) + GATHER * co
                        : -GATHER * (1 - cv) + (VERT ? 14 : 12) * co;
        var op = isC ? Math.max(fv, cv) : cv * (1 - co);
        var sc = isC ? (0.94 + 0.06 * fv) * (1 + 0.10 * co) : 0.94 + 0.06 * cv;
        var rot = (isC ? 1 : -1) * (1 - lead) * 8 + (p - 0.5) * (isC ? 8 : -8);

        r.fig.style.opacity = op.toFixed(3);
        r.fig.style.transform = VERT
          ? 'translate3d(0,' + shift.toFixed(2) + 'vh,0) scale(' + sc.toFixed(3) + ') rotate(' + rot.toFixed(2) + 'deg)'
          : 'translate3d(' + shift.toFixed(2) + 'vw,0,0) scale(' + sc.toFixed(3) + ') rotate(' + rot.toFixed(2) + 'deg)';
        r.fig.style.filter = op < 0.98 ? 'blur(' + ((1 - op) * 5).toFixed(2) + 'px)' : 'none';
      });

      lede.style.opacity = (easeOut(range(p, 0.37, 0.46)) * (1 - easeIn(range(p, 0.52, 0.60)))).toFixed(3);

      /* --- 5. outro ---
         The closing statements own the frame: the numbers and labels clear, and
         the Centurion diagram lifts and dims to a backdrop so nothing collides. */
      var ov = easeOut(range(p, cfg.beats.outro.inA, cfg.beats.outro.inB));
      outro.style.opacity = ov.toFixed(3);
      outro.setAttribute('aria-hidden', ov > 0.5 ? 'false' : 'true');

      metas.forEach(function (m) { m.style.opacity = (1 - ov).toFixed(3); });
      field.style.transform = 'translate3d(0,' + (-13 * ov).toFixed(2) + 'vh,0) scale(' + (1 - 0.14 * ov).toFixed(3) + ')';
      if (ov > 0) field.style.opacity = (Math.min(1, fv) * (1 - 0.62 * ov)).toFixed(3);

      // one statement at a time — each clears before the next arrives
      var oA = cfg.beats.outro.inA, span = (1 - oA) / words.length;
      for (var w = 0; w < words.length; w++) {
        var s0 = oA + w * span;
        var wv = easeOut(range(p, s0, s0 + span * 0.42));
        var wo = w < words.length - 1 ? easeIn(range(p, s0 + span * 0.62, s0 + span * 0.96)) : 0;
        var vis = wv * (1 - wo);
        words[w].style.opacity = vis.toFixed(3);
        words[w].style.transform = 'translate3d(0,' + ((1 - wv) * 44 + wo * -34).toFixed(2) + 'px,0)';
      }

      if (rule) rule.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    }
  });

  // paint the opening frame so nothing shows in an untimed state
  stage.style.backgroundColor = bgAt(0);
  ScrollTrigger.refresh();
};
