/* ============================================================
   04 · A STUDY IN LIGHT — the renderer.

   Takes a frame from CD.studyTimeline and writes it to the DOM. Per frame
   it touches transform and opacity only, plus one `filter` string on the
   media — brightness/contrast is the whole point of the section, it is one
   element, and the alternative is a second stacked video.

   The shutters scale; their hairlines are separate un-scaled elements
   positioned in pixels, so a 1px line stays 1px however far the aperture
   has opened. Stage height is cached and re-read on resize rather than
   measured per frame.
   ============================================================ */
window.CD = window.CD || {};

CD.studyVisual = (function () {
  'use strict';

  var T = null;   // CD.studyTimeline, resolved at mount

  /* How each scene reveals. The copy alternates sides, so the motion
     alternates with it rather than repeating one entrance five times. */
  var MOTION = [
    { line: function (v) { return 'translate3d(0,' + ((1 - v) * 108).toFixed(2) + '%,0)'; },
      clip: function (v) { return 'inset(0 0 ' + ((1 - v) * 100).toFixed(1) + '% 0)'; } },
    { line: function (v) { return 'translate3d(' + ((1 - v) * 5).toFixed(2) + 'vw,0,0)'; },
      fade: true },
    { line: function (v) { return 'translate3d(0,' + ((1 - v) * 108).toFixed(2) + '%,0)'; },
      clip: function (v) { return 'inset(0 0 ' + ((1 - v) * 100).toFixed(1) + '% 0)'; } },
    { line: function (v) { return 'scale(' + (0.9 + 0.1 * v).toFixed(4) + ')'; },
      fade: true },
    { line: function (v) { return 'translate3d(0,' + ((1 - v) * 22).toFixed(2) + 'px,0)'; },
      fade: true }
  ];

  var K_LINE = [0.00, 0.16], K_BODY = 0.34;

  /* The facet traces are drawn once, at mount. 32 radial ticks is a
     texture, not an assertion — nothing here counts anything or states a
     measurement. Coordinates are in the clip's own 160x90 frame. */
  function buildFacets(g, n) {
    var ns = 'http://www.w3.org/2000/svg';
    var cx = 80, cy = 48, r0 = 41.5, r1 = 46.5;
    for (var i = 0; i < n; i++) {
      var ang = (i / n) * Math.PI * 2 - Math.PI / 2;
      var ln = document.createElementNS(ns, 'line');
      ln.setAttribute('x1', (cx + Math.cos(ang) * r0).toFixed(2));
      ln.setAttribute('y1', (cy + Math.sin(ang) * r0 * 0.86).toFixed(2));
      ln.setAttribute('x2', (cx + Math.cos(ang) * r1).toFixed(2));
      ln.setAttribute('y2', (cy + Math.sin(ang) * r1 * 0.86).toFixed(2));
      g.appendChild(ln);
    }
  }

  function mount(root, cfg) {
    T = CD.studyTimeline;
    var q = function (s) { return root.querySelector(s); };
    var all = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };

    var facetG = q('[data-sty-facets]');
    if (facetG && !facetG.childNodes.length) buildFacets(facetG, cfg.facetTicks);

    var scenes = all('[data-sty-scene]').map(function (el) {
      return {
        el: el,
        copy: el.querySelector('.sty__copy'),
        lines: Array.prototype.slice.call(el.querySelectorAll('.sty__ln > span')),
        body: el.querySelector('.sty__b')
      };
    });

    return {
      stage:   q('.sty__stage'),
      media:   q('[data-sty-media]'),
      video:   q('[data-sty-video]'),
      glow:    q('[data-sty-glow]'),
      shT:     q('[data-sty-sh="t"]'),
      shB:     q('[data-sty-sh="b"]'),
      shL:     q('[data-sty-sh="l"]'),
      shR:     q('[data-sty-sh="r"]'),
      edgeT:   q('[data-sty-edge="t"]'),
      edgeB:   q('[data-sty-edge="b"]'),
      beam:    q('[data-sty-beam]'),
      optics:  q('[data-sty-optics]'),
      opticsG: q('[data-sty-optics-g]'),
      rule:    q('[data-sty-rule]'),
      points:  q('[data-sty-points]'),
      reticle: q('[data-sty-reticle]'),
      facets:  facetG,
      exit:    q('[data-sty-exit]'),
      intro:   q('[data-sty-intro]'),
      scenes:  scenes,
      vp:      { w: 0, h: 0, fw: 0, fh: 0 },   // stage + clip-frame metrics
      _f:      ''                              // last filter string written
    };
  }

  /* Stage size, plus the size the clip's own 16:9 frame is laid out at.
     Read on mount and on resize — never per frame. Mirrors the CSS on
     .sty__media / .sty__optics, which is what keeps the optical traces
     sitting on the stone rather than near it. */
  var ASPECT = 16 / 9;
  function measure(el, narrow) {
    var vp = el.vp;
    vp.w = el.stage ? el.stage.clientWidth  : window.innerWidth;
    vp.h = el.stage ? el.stage.clientHeight : window.innerHeight;
    vp.fw = narrow ? Math.min(vp.w, vp.h * ASPECT) : Math.max(vp.w, vp.h * ASPECT);
    vp.fh = vp.fw / ASPECT;
  }

  function render(el, f) {
    /* --- the subject --- */
    var m = f.media;
    el.media.style.opacity = m.o.toFixed(3);
    el.media.style.transform =
      'translate3d(' + m.x.toFixed(2) + 'vw,0,0) scale(' + m.s.toFixed(4) + ')';
    var filt = 'brightness(' + m.br.toFixed(3) + ') contrast(' + m.ct.toFixed(3) + ')';
    if (filt !== el._f) { el.video.style.filter = filt; el._f = filt; }
    if (el.glow) el.glow.style.opacity = (m.o * Math.min(1, m.br) * 0.5).toFixed(3);

    /* --- optical traces, riding the frame's own offset --- */
    var o = f.optics;
    el.optics.style.opacity = o.v.toFixed(3);
    el.optics.style.visibility = o.v < 0.004 ? 'hidden' : 'visible';
    if (o.v >= 0.004) {
      el.optics.style.transform =
        'translate3d(' + o.x.toFixed(2) + 'vw,0,0) scale(' + o.s.toFixed(4) + ')';
      el.opticsG.style.transform = 'rotate(' + o.spin.toFixed(2) + 'deg)';
      el.rule.style.opacity    = o.rule.toFixed(3);
      el.points.style.opacity  = o.points.toFixed(3);
      el.reticle.style.opacity = o.reticle.toFixed(3);
      el.facets.style.opacity  = o.facets.toFixed(3);
    }

    /* --- light crossing the stone --- */
    el.beam.style.opacity = f.beam.v.toFixed(3);
    el.beam.style.transform = 'translate3d(' + f.beam.x.toFixed(2) + 'vw,0,0) skewX(-9deg)';

    /* --- the aperture --- */
    el.shT.style.transform = 'scaleY(' + f.sh.t.toFixed(4) + ')';
    el.shB.style.transform = 'scaleY(' + f.sh.b.toFixed(4) + ')';
    el.shL.style.transform = 'scaleX(' + f.sh.l.toFixed(4) + ')';
    el.shR.style.transform = 'scaleX(' + f.sh.r.toFixed(4) + ')';

    /* Its hairline, positioned in pixels off the cached stage height so it
       never inherits the shutters' scale. Both edges meet in the middle
       when the aperture is shut — one line, which is the whole handoff. */
    var y = (f.edge.y * el.vp.h).toFixed(1);
    var w = f.edge.w.toFixed(4), eo = f.edge.o.toFixed(3);
    el.edgeT.style.opacity = eo;
    el.edgeT.style.transform = 'translate3d(0,' + y + 'px,0) scaleX(' + w + ')';
    el.edgeB.style.opacity = eo;
    el.edgeB.style.transform = 'translate3d(0,-' + y + 'px,0) scaleX(' + w + ')';

    /* --- the handoff into the marquee --- */
    el.exit.style.opacity = f.exit.v.toFixed(3);
    el.exit.style.transform =
      'translate3d(' + f.exit.x.toFixed(2) + 'vw,' + f.exit.y.toFixed(2) + 'vh,0) ' +
      'scaleX(' + f.exit.w.toFixed(4) + ')';

    /* --- copy --- */
    el.intro.style.opacity = f.intro.v.toFixed(3);
    el.intro.style.transform = 'translate3d(0,' + f.intro.y.toFixed(2) + 'vh,0)';

    for (var s = 0; s < el.scenes.length; s++) {
      var sc = el.scenes[s], st = f.scenes[s], M = MOTION[s] || MOTION[0];
      sc.el.style.opacity = st.v.toFixed(3);
      sc.el.style.visibility = st.v < 0.004 ? 'hidden' : 'visible';
      if (st.v < 0.004) continue;                     // nothing to draw

      sc.copy.style.transform = 'translate3d(0,' + (-st.vout * 4).toFixed(2) + 'vh,0)';
      for (var l = 0; l < sc.lines.length; l++) {
        var v = T.stagger(st.vin, K_LINE[l] == null ? 0.16 : K_LINE[l]);
        sc.lines[l].style.transform = M.line(v);
        if (M.clip) sc.lines[l].style.clipPath = M.clip(v);
        if (M.fade) sc.lines[l].style.opacity = v.toFixed(3);
      }
      if (sc.body) {
        var bv = T.stagger(st.vin, K_BODY);
        sc.body.style.opacity = bv.toFixed(3);
        sc.body.style.transform = 'translate3d(0,' + ((1 - bv) * 20).toFixed(2) + 'px,0)';
      }
    }
  }

  return { mount: mount, measure: measure, render: render, MOTION: MOTION };
})();
