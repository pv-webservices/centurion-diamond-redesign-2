/* ============================================================
   08 · METALS — the renderer.

   Takes a frame from CD.metalsTimeline and writes it to the DOM. Per frame
   it touches transform and opacity only.

   The panels are laid out 200vw wide and translated, rather than clipped:
   a clip-path is not compositor work, and these are two full-bleed layers
   moving on every frame. `pt` is anchored left and `yg` right, so each one
   translates in from its own side and the arithmetic stays readable.
   ============================================================ */
window.CD = window.CD || {};

CD.metalsVisual = (function () {
  'use strict';

  var T = null;   // CD.metalsTimeline, resolved at mount

  var RAKE = '';   // the shared diagonal, resolved at mount

  function mount(root) {
    T = CD.metalsTimeline;
    RAKE = ' skewX(' + (CD.metals.rake || 0) + 'deg)';
    var q = function (s) { return root.querySelector(s); };
    var all = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };

    var scenes = all('[data-mtl-scene]').map(function (el) {
      return {
        el: el,
        copy: el.querySelector('.mtl__copy'),
        lines: Array.prototype.slice.call(el.querySelectorAll('.mtl__ln > span')),
        body: el.querySelector('.mtl__b')
      };
    });

    return {
      stage:   q('.mtl__stage'),
      pt:      q('[data-mtl-panel="pt"]'),
      yg:      q('[data-mtl-panel="yg"]'),
      rings:   all('[data-mtl-ring]'),
      intro:   q('[data-mtl-intro]'),
      introLn: all('[data-mtl-intro] .mtl__ln > span'),
      scenes:  scenes,
      statement: q('[data-mtl-statement]'),
      drain:   q('[data-mtl-drain]')
    };
  }

  function render(el, f) {
    /* --- the ground ---
       pt is anchored left: its box spans [0,200]vw, so translating by
       (e - 200) puts its leading edge at `e`. yg is anchored right: its box
       spans [-100,100]vw, so translating by (200 - e) puts its leading edge
       at (100 - e), i.e. it covers `e` of the stage from the right.

       Both carry the same skew, appended here rather than left in the
       stylesheet — a transform written per frame replaces the whole
       property, so a skew declared in CSS would simply be dropped. */
    el.pt.style.transform = 'translate3d(' + (f.pt.e - 200).toFixed(2) + 'vw,0,0)' + RAKE;
    el.yg.style.transform = 'translate3d(' + (200 - f.yg.e).toFixed(2) + 'vw,0,0)' + RAKE;

    /* --- the rings --- */
    for (var i = 0; i < el.rings.length; i++) {
      var rg = f.rings[i], node = el.rings[i];
      node.style.opacity = rg.o.toFixed(3);
      node.style.visibility = rg.o < 0.004 ? 'hidden' : 'visible';
      if (rg.o < 0.004) continue;
      node.style.setProperty('--w', rg.w.toFixed(2) + 'vw');
      node.style.transform =
        'translate3d(' + rg.x.toFixed(2) + 'vw,' + rg.y.toFixed(2) + 'vh,0) ' +
        'scale(' + rg.s.toFixed(4) + ') rotate(' + rg.r.toFixed(2) + 'deg)';
    }

    /* --- opening --- */
    el.intro.style.opacity = f.intro.v.toFixed(3);
    el.intro.style.transform = 'translate3d(0,' + f.intro.y.toFixed(2) + 'vh,0)';
    for (var l = 0; l < el.introLn.length; l++) {
      var lv = f.intro.lines[l] == null ? 1 : f.intro.lines[l];
      el.introLn[l].style.transform = 'translate3d(0,' + ((1 - lv) * 108).toFixed(2) + '%,0)';
    }

    /* --- the three materials --- */
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

    /* --- closing line, and the drain back to ink --- */
    el.statement.style.opacity = f.statement.v.toFixed(3);
    el.statement.style.visibility = f.statement.v < 0.004 ? 'hidden' : 'visible';
    el.statement.style.transform = 'translate3d(0,' + f.statement.y.toFixed(2) + 'px,0)';
    el.drain.style.opacity = f.drain.toFixed(3);
  }

  return { mount: mount, render: render };
})();
