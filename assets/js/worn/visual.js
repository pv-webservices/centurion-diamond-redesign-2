/* ============================================================
   07 · WORN — the renderer.

   Takes a frame from CD.wornTimeline and writes it to the DOM. Per frame it
   touches transform and opacity, one background-color on the stage, and one
   `filter` string shared by every plate — the colour arriving is the whole
   point of the chapter, and one string on a wrapper is cheaper than six.

   Plate width is published as a custom property rather than set as a width,
   so the browser sizes the figure from its own aspect-ratio and nothing
   re-flows: the transform does the moving.
   ============================================================ */
window.CD = window.CD || {};

CD.wornVisual = (function () {
  'use strict';

  var T = null;   // CD.wornTimeline, resolved at mount

  function mount(root) {
    T = CD.wornTimeline;
    var q = function (s) { return root.querySelector(s); };
    var all = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };

    var scenes = all('[data-wrn-scene]').map(function (el) {
      return {
        el: el,
        copy: el.querySelector('.wrn__copy'),
        lines: Array.prototype.slice.call(el.querySelectorAll('.wrn__ln > span')),
        body: el.querySelector('.wrn__b')
      };
    });

    return {
      stage:   q('.wrn__stage'),
      film:    q('[data-wrn-film]'),
      plates:  all('[data-wrn-plate]'),
      intro:   q('[data-wrn-intro]'),
      introLn: all('[data-wrn-intro] .wrn__ln > span'),
      scenes:  scenes,
      gather:  q('[data-wrn-gather]'),
      gatherLn: all('[data-wrn-gather] .wrn__ln > span'),
      rule:    q('[data-wrn-rule]'),
      _bg:     '',
      _filt:   ''
    };
  }

  function render(el, f) {
    /* --- ground --- */
    if (f.ground !== el._bg) { el.stage.style.backgroundColor = f.ground; el._bg = f.ground; }

    /* --- the colour arriving ---
       One filter on the layer every plate lives in. Saturation does the
       work; a little contrast and brightness come with it so the
       monochrome end reads as the page's own ink rather than a grey photo. */
    var c = f.colour;
    var filt = 'saturate(' + c.toFixed(3) + ') ' +
               'contrast(' + (1.16 - 0.16 * c).toFixed(3) + ') ' +
               'brightness(' + (0.74 + 0.26 * c).toFixed(3) + ')';
    if (filt !== el._filt) { el.film.style.filter = filt; el._filt = filt; }

    /* --- the plates --- */
    for (var i = 0; i < el.plates.length; i++) {
      var pl = f.plates[i], node = el.plates[i];
      node.style.opacity = pl.o.toFixed(3);
      node.style.visibility = pl.o < 0.004 ? 'hidden' : 'visible';
      if (pl.o < 0.004) continue;
      node.style.setProperty('--w', pl.w.toFixed(2) + 'vw');
      node.style.zIndex = pl.z;
      node.style.transform =
        'translate3d(' + pl.x.toFixed(2) + 'vw,' + pl.y.toFixed(2) + 'vh,0) ' +
        'scale(' + pl.s.toFixed(4) + ') rotate(' + pl.r.toFixed(2) + 'deg)';
    }

    /* --- opening --- */
    el.intro.style.opacity = f.intro.v.toFixed(3);
    el.intro.style.transform = 'translate3d(0,' + f.intro.y.toFixed(2) + 'vh,0)';
    for (var l = 0; l < el.introLn.length; l++) {
      var lv = f.intro.lines[l] == null ? 1 : f.intro.lines[l];
      el.introLn[l].style.transform = 'translate3d(0,' + ((1 - lv) * 108).toFixed(2) + '%,0)';
    }

    /* --- the two moments --- */
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
        var bv = T.stagger(stt.vin, 0.40);
        sc.body.style.opacity = bv.toFixed(3);
        sc.body.style.transform = 'translate3d(0,' + ((1 - bv) * 22).toFixed(2) + 'px,0)';
      }
    }

    /* --- the spread's closing line --- */
    el.gather.style.opacity = f.gather.v.toFixed(3);
    el.gather.style.visibility = f.gather.v < 0.004 ? 'hidden' : 'visible';
    el.gather.style.transform = 'translate3d(0,' + f.gather.y.toFixed(2) + 'px,0)';
    for (var m = 0; m < el.gatherLn.length; m++) {
      var gv = f.gather.lines[m] == null ? 1 : f.gather.lines[m];
      el.gatherLn[m].style.transform = 'translate3d(0,' + ((1 - gv) * 108).toFixed(2) + '%,0)';
    }
    el.rule.style.opacity = f.rule.v.toFixed(3);
    el.rule.style.transform = 'scaleX(' + f.rule.w.toFixed(4) + ')';
  }

  return { mount: mount, render: render };
})();
