/* ============================================================
   Hero narrative timeline — the alternating editorial statements.

   Markup is generated once from CD.heroScenes, then each scene is driven
   directly from master progress. No ScrollTrigger per scene: one progress
   value feeds every transform, which keeps the statements perfectly in step
   with the video scrub.
   ============================================================ */
window.CD = window.CD || {};

CD.heroNarrative = (function () {
  'use strict';

  var scenes = [];
  var ctaEl = null;
  var cta = null;
  var reduced = false;
  /* Portrait phones compose the narrative top / bottom rather than left /
     right (see the .chero mobile block), so the entrance travels on the axis
     the statement actually sits on. Desktop is untouched by this. */
  var PORTRAIT_Q = '(max-width: 860px) and (orientation: portrait)';
  var portrait = false;

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function range(p, a, b) { return b === a ? (p >= b ? 1 : 0) : clamp01((p - a) / (b - a)); }
  // luxury-commercial easing: quick settle, no bounce
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeIn(t) { return t * t * t; }

  function build(root, data, ctaData) {
    if (!root) return null;
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    portrait = window.matchMedia(PORTRAIT_Q).matches;
    window.addEventListener('resize', function () {
      portrait = window.matchMedia(PORTRAIT_Q).matches;
    }, { passive: true });

    data.forEach(function (s, i) {
      var el = document.createElement('article');
      el.className = 'cscene cscene--' + s.side;
      el.setAttribute('aria-hidden', 'true');

      var eyebrow = document.createElement('p');
      eyebrow.className = 'cscene__eyebrow';
      eyebrow.innerHTML = '<i></i><span>' + s.eyebrow + '</span>';

      var h = document.createElement('h2');
      h.className = 'cscene__title';
      s.title.forEach(function (line) {
        var ln = document.createElement('span');
        ln.className = 'cscene__ln';
        var inner = document.createElement('span');
        inner.textContent = line;
        ln.appendChild(inner);
        h.appendChild(ln);
      });

      var body = document.createElement('p');
      body.className = 'cscene__body';
      body.textContent = s.body;

      el.appendChild(eyebrow);
      el.appendChild(h);
      el.appendChild(body);
      root.appendChild(el);

      scenes.push({
        cfg: s,
        el: el,
        lines: el.querySelectorAll('.cscene__ln > span'),
        eyebrow: eyebrow,
        body: body,
        wasOn: null
      });
    });

    if (ctaData) {
      cta = ctaData;
      ctaEl = document.createElement('div');
      ctaEl.className = 'chero__cta';
      ctaEl.innerHTML =
        '<a class="cbtn" href="' + ctaData.href + '">' +
        '<span class="cbtn__fill"></span>' +
        '<span class="cbtn__label"><i></i>' + ctaData.label + '</span></a>';
      root.appendChild(ctaEl);
    }

    if (reduced) showAllStatic();
    return api;
  }

  /* reduced motion: no scrubbed choreography — every statement simply reads */
  function showAllStatic() {
    scenes.forEach(function (s) {
      s.el.classList.add('is-static');
      s.el.setAttribute('aria-hidden', 'false');
    });
    if (ctaEl) ctaEl.classList.add('is-static');
  }

  function update(p) {
    if (reduced) return;

    for (var i = 0; i < scenes.length; i++) {
      var s = scenes[i], c = s.cfg;
      var vIn = easeOut(range(p, c.inA, c.inB));
      var vOut = easeIn(range(p, c.outA, c.outB));
      var vis = vIn * (1 - vOut);

      var dir = c.side === 'left' ? -1 : 1;
      var scale = 0.965 + 0.035 * vIn - 0.02 * vOut;
      var blur = (1 - vIn) * 7 + vOut * 5;
      var shift;
      if (portrait) {
        /* a top statement drops in and lifts away; a bottom one rises in and
           settles further down — the axis the composition already reads on */
        var vdir = c.side === 'left' ? -1 : 1;
        shift = 'translate3d(0,' + ((1 - vIn) * vdir * 4.2 + vOut * vdir * -3.2).toFixed(3) + 'vh,0)';
      } else {
        // enters from its own side, leaves continuing the same direction
        shift = 'translate3d(' + ((1 - vIn) * dir * 7 + vOut * dir * 5).toFixed(3) + 'vw,0,0)';
      }

      s.el.style.opacity = vis.toFixed(3);
      s.el.style.transform = shift + ' scale(' + scale.toFixed(4) + ')';
      s.el.style.filter = blur > 0.06 ? 'blur(' + blur.toFixed(2) + 'px)' : 'none';

      // per-line mask reveal, staggered
      for (var j = 0; j < s.lines.length; j++) {
        var d = j * 0.16;
        var lv = easeOut(clamp01((vIn - d * (1 - vIn)) / (1 - d * 0.5)));
        s.lines[j].style.transform = 'translate3d(0,' + ((1 - lv) * 108).toFixed(2) + '%,0)';
      }

      // letter-spacing tightens as it settles
      s.eyebrow.style.letterSpacing = (0.42 - 0.14 * vIn).toFixed(3) + 'em';

      var on = vis > 0.02;
      if (on !== s.wasOn) {
        s.el.setAttribute('aria-hidden', on ? 'false' : 'true');
        s.el.style.pointerEvents = on ? 'auto' : 'none';
        s.wasOn = on;
      }
    }

    if (ctaEl && cta) {
      var cv = easeOut(range(p, cta.inA, cta.inB));
      ctaEl.style.opacity = cv.toFixed(3);
      ctaEl.style.transform = 'translate3d(0,' + ((1 - cv) * 22).toFixed(2) + 'px,0)';
      ctaEl.style.pointerEvents = cv > 0.5 ? 'auto' : 'none';
      ctaEl.setAttribute('aria-hidden', cv > 0.5 ? 'false' : 'true');
    }
  }

  var api = { build: build, update: update };
  return api;
})();
