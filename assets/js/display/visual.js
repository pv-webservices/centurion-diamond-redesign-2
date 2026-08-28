/* ============================================================
   09 · DISPLAY — the renderer.

   Takes a frame from CD.displayTimeline and writes it to the DOM. Per
   frame it touches transform and opacity, plus one background-color on the
   stage — which is what the light leaves on the walls.
   ============================================================ */
window.CD = window.CD || {};

CD.displayVisual = (function () {
  'use strict';

  var T = null;   // CD.displayTimeline, resolved at mount

  function mount(root) {
    T = CD.displayTimeline;
    var q = function (s) { return root.querySelector(s); };
    var all = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };

    var scenes = all('[data-dsp-scene]').map(function (el) {
      return {
        el: el,
        copy: el.querySelector('.dsp__copy'),
        lines: Array.prototype.slice.call(el.querySelectorAll('.dsp__ln > span')),
        body: el.querySelector('.dsp__b')
      };
    });

    return {
      stage:   q('.dsp__stage'),
      glow:    q('[data-dsp-glow]'),
      cases:   all('[data-dsp-case]'),
      intro:   q('[data-dsp-intro]'),
      introLn: all('[data-dsp-intro] .dsp__ln > span'),
      scenes:  scenes,
      _bg:     ''
    };
  }

  function render(el, f) {
    if (f.ground !== el._bg) { el.stage.style.backgroundColor = f.ground; el._bg = f.ground; }

    el.glow.style.opacity = f.glow.v.toFixed(3);
    el.glow.style.transform = 'translate3d(-50%,-50%,0) scale(' + f.glow.s.toFixed(4) + ')';

    for (var i = 0; i < el.cases.length; i++) {
      var c = f.cases[i], node = el.cases[i];
      node.style.opacity = c.o.toFixed(3);
      node.style.visibility = c.o < 0.004 ? 'hidden' : 'visible';
      if (c.o < 0.004) continue;
      node.style.setProperty('--w', c.w.toFixed(2) + 'vw');
      node.style.transform =
        'translate3d(' + c.x.toFixed(2) + 'vw,' + c.y.toFixed(2) + 'vh,0)';
    }

    el.intro.style.opacity = f.intro.v.toFixed(3);
    el.intro.style.transform = 'translate3d(0,' + f.intro.y.toFixed(2) + 'vh,0)';
    for (var l = 0; l < el.introLn.length; l++) {
      var lv = f.intro.lines[l] == null ? 1 : f.intro.lines[l];
      el.introLn[l].style.transform = 'translate3d(0,' + ((1 - lv) * 108).toFixed(2) + '%,0)';
    }

    for (var s = 0; s < el.scenes.length; s++) {
      var sc = el.scenes[s], stt = f.scenes[s];
      sc.el.style.opacity = stt.v.toFixed(3);
      sc.el.style.visibility = stt.v < 0.004 ? 'hidden' : 'visible';
      if (stt.v < 0.004) continue;

      sc.copy.style.transform = 'translate3d(0,' + (-stt.vout * 5).toFixed(2) + 'vh,0)';
      for (var k = 0; k < sc.lines.length; k++) {
        var v = T.stagger(stt.vin, k * 0.18);
        sc.lines[k].style.transform = 'translate3d(0,' + ((1 - v) * 108).toFixed(2) + '%,0)';
      }
      if (sc.body) {
        var bv = T.stagger(stt.vin, 0.38);
        sc.body.style.opacity = bv.toFixed(3);
        sc.body.style.transform = 'translate3d(0,' + ((1 - bv) * 22).toFixed(2) + 'px,0)';
      }
    }
  }

  return { mount: mount, render: render };
})();
