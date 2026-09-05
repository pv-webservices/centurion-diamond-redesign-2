/* ============================================================
   03 · ANATOMY OF BRILLIANCE — the renderer.

   Takes a frame from CD.pillarsTimeline and writes it to the DOM. Only
   transform / opacity / background-color are touched per frame; the one
   blur in the section is static CSS on the light bars.
   ============================================================ */
window.CD = window.CD || {};

CD.pillarsVisual = (function () {
  'use strict';

  var T = null;   // CD.pillarsTimeline, resolved at mount

  /* how each scene reveals. `line` returns the transform for one headline
     line at local progress v; `exit` the copy block's drift on the way out. */
  var MOTION = {
    rise: {
      line: function (v) { return 'translate3d(0,' + ((1 - v) * 106).toFixed(2) + '%,0)'; },
      exit: function (o) { return 'translate3d(0,' + (-o * 7).toFixed(2) + 'vh,0)'; }
    },
    clip: {
      line: function (v) { return 'translate3d(0,' + ((1 - v) * 16).toFixed(2) + '%,0)'; },
      clip: function (v) { return 'inset(0 0 ' + ((1 - v) * 100).toFixed(2) + '% 0)'; },
      exit: function (o) { return 'translate3d(0,' + (-o * 4).toFixed(2) + 'vh,0) scale(' + (1 - o * 0.03).toFixed(4) + ')'; }
    },
    slide: {
      line: function (v) { return 'translate3d(' + ((1 - v) * -8).toFixed(2) + 'vw,0,0)'; },
      exit: function (o) { return 'translate3d(' + (o * 6).toFixed(2) + 'vw,0,0)'; },
      fade: true
    },
    scale: {
      line: function (v) { return 'scale(' + (0.86 + 0.14 * v).toFixed(4) + ')'; },
      exit: function (o) { return 'scale(' + (1 + o * 0.07).toFixed(4) + ')'; },
      fade: true
    }
  };

  /* stagger keys — number, then each headline line, then the body */
  var K_NUM = 0, K_LINE = [0.12, 0.24, 0.34], K_BODY = 0.44;

  function mount(root) {
    T = CD.pillarsTimeline;
    var q = function (s) { return root.querySelector(s); };

    var scenes = Array.prototype.map.call(
      root.querySelectorAll('[data-plr-scene]'),
      function (el) {
        return {
          el: el,
          copy: el.querySelector('.plr__copy'),
          n: el.querySelector('.plr__n'),
          lines: Array.prototype.slice.call(el.querySelectorAll('.plr__ln > span')),
          body: el.querySelector('.plr__b')
        };
      }
    );

    return {
      stage:  q('.plr__stage'),
      sweep:  q('[data-plr-sweep]'),
      intro:  q('[data-plr-intro]'),
      introLn: Array.prototype.slice.call(root.querySelectorAll('[data-plr-intro] .plr__ln > span')),
      scenes: scenes,
      stone:  q('[data-plr-stone] .plr__stone-in'),
      contour:q('[data-plr-contour]'),
      outline:q('[data-plr-outline]'),
      flash:  q('.plr__gem-flash'),
      shapeLabel:q('[data-plr-shape-label]'),
      words:  Array.prototype.slice.call(root.querySelectorAll('[data-plr-word]')),
      final:  q('[data-plr-final]'),
      beam:   q('[data-plr-beam]'),
      iris:   Array.prototype.slice.call(root.querySelectorAll('[data-plr-iris] .plr__ir')),
      seal:   q('[data-plr-seal]'),
      _bg:    ''      // last ground written, so a held colour is not re-set
    };
  }

  function render(el, f) {
    /* --- ground + the light passing through it --- */
    if (f.ground !== el._bg) { el.stage.style.backgroundColor = f.ground; el._bg = f.ground; }
    el.sweep.style.opacity = f.sweep.v.toFixed(3);
    el.sweep.style.transform = 'translate3d(' + f.sweep.x.toFixed(2) + 'vw,0,0) skewX(-13deg)';

    /* --- opening title --- */
    el.intro.style.opacity = f.intro.v.toFixed(3);
    el.intro.style.transform = 'translate3d(0,' + f.intro.y.toFixed(2) + 'vh,0)';
    for (var i = 0; i < el.introLn.length; i++) {
      var lv = f.intro.lines[i] == null ? 1 : f.intro.lines[i];
      el.introLn[i].style.transform = 'translate3d(0,' + ((1 - lv) * 108).toFixed(2) + '%,0)';
    }

    /* --- the four benefits --- */
    for (var s = 0; s < el.scenes.length; s++) {
      var sc = el.scenes[s], st = f.scenes[s];
      var M = MOTION[st.motion] || MOTION.rise;

      sc.el.style.opacity = st.v.toFixed(3);
      sc.el.style.visibility = st.v < 0.004 ? 'hidden' : 'visible';
      if (st.v < 0.004) continue;                     // nothing to draw

      sc.copy.style.transform = M.exit(st.vout);

      if (sc.n) {
        var nv = T.stagger(st.vin, K_NUM);
        sc.n.style.opacity = nv.toFixed(3);
        sc.n.style.transform = 'translate3d(0,' + ((1 - nv) * 16).toFixed(2) + 'px,0)';
      }
      for (var l = 0; l < sc.lines.length; l++) {
        var v = T.stagger(st.vin, K_LINE[l] == null ? 0.34 : K_LINE[l]);
        sc.lines[l].style.transform = M.line(v);
        if (M.clip) sc.lines[l].style.clipPath = M.clip(v);
        if (M.fade) sc.lines[l].style.opacity = v.toFixed(3);
      }
      if (sc.body) {
        var bv = T.stagger(st.vin, K_BODY);
        sc.body.style.opacity = bv.toFixed(3);
        sc.body.style.transform = 'translate3d(0,' + ((1 - bv) * 22).toFixed(2) + 'px,0)';
      }
    }

    /* --- the stone --- */
    var p = f.stone;
    el.stone.style.opacity = p.o.toFixed(3);
    el.stone.style.transform =
      'translate3d(' + p.x.toFixed(2) + 'vw,' + p.y.toFixed(2) + 'vh,0) ' +
      'scale(' + (p.s * f.shape.contract).toFixed(4) + ') rotate(' + (p.r + f.shape.turn).toFixed(2) + 'deg)';
    if (el.contour) {
      var pts = '', xy = f.shape.points;
      for (var pi = 0; pi < xy.length; pi += 2) pts += (pi ? ' ' : '') + xy[pi].toFixed(2) + ',' + xy[pi + 1].toFixed(2);
      el.contour.setAttribute('points', pts);
      el.outline.setAttribute('points', pts);
      el.flash.style.opacity = Math.max(f.shape.flash, p.sh).toFixed(3);
      el.flash.style.transform = 'translate3d(' + (-165 + 330 * f.shape.local).toFixed(1) + '%,0,0) rotate(14deg)';
      el.shapeLabel.textContent = CD.pillars.shapes.items[f.shape.index].name;
      el.shapeLabel.style.opacity = f.shape.v.toFixed(3);
    }

    /* --- closing statements --- */
    var loudest = 0;
    for (var w = 0; w < el.words.length; w++) {
      var wd = f.words[w];
      el.words[w].style.opacity = wd.v.toFixed(3);
      el.words[w].style.transform = 'translate3d(0,' + wd.y.toFixed(2) + 'px,0)';
      if (wd.v > loudest) loudest = wd.v;
    }
    el.final.style.visibility = loudest < 0.004 ? 'hidden' : 'visible';

    /* --- handoff into the Light Study --- */
    el.beam.style.opacity = f.beam.v.toFixed(3);
    el.beam.style.transform = 'translate3d(' + f.beam.x.toFixed(2) + 'vw,0,0) skewX(-8deg)';
    var ir = 'scale(' + f.iris.toFixed(4) + ')';
    for (var c = 0; c < el.iris.length; c++) el.iris[c].style.transform = ir;
    el.seal.style.opacity = f.seal.toFixed(3);
  }

  return { mount: mount, render: render, MOTION: MOTION };
})();
