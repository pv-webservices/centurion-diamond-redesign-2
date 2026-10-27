/* ============================================================
   Hero narrative — the opening title, three chapters and the closing frame.

   The copy is real markup in index.html (it is the page's h1 and must read
   without JS); this module only drives it from master progress. Each line
   sits in a vertical mask (.hx-ln) and rises into place, staggered.
   ============================================================ */
window.CD = window.CD || {};

CD.heroNarrative = (function () {
  'use strict';

  var M = CD.heroMath;
  var T = null;
  var intro = null, chapters = [], fin = null;

  function lines(el) { return el.querySelectorAll('.hx-ln > span'); }

  function init(root, timeline) {
    T = timeline;
    intro = root.querySelector('[data-hx-intro]');

    var els = root.querySelectorAll('[data-hx-chapter]');
    for (var i = 0; i < els.length; i++) {
      chapters.push({
        cfg: T.chapters[i],
        el: els[i],
        lines: lines(els[i]),
        mark: els[i].querySelector('.hx__mark'),
        count: els[i].querySelector('[data-hx-count]'),
        shown: null
      });
    }

    var f = root.querySelector('[data-hx-final]');
    fin = {
      el: f,
      lines: lines(f),
      mark: f.querySelector('.hx__mark'),
      actions: f.querySelector('[data-hx-actions]'),
      facts: f.querySelectorAll('[data-hx-facts] li'),
      shown: null
    };
    return api;
  }

  /* per-line mask reveal: v is the block's entrance, 0..1 */
  function riseLines(list, v) {
    for (var j = 0; j < list.length; j++) {
      var d = j * 0.18;
      var lv = M.easeOut(M.clamp01((v - d * (1 - v)) / (1 - d * 0.5)));
      list[j].style.transform = 'translate3d(0,' + ((1 - lv) * 112).toFixed(2) + '%,0)';
    }
  }

  /* a block drifts up through its window: in from below, out above */
  function place(el, vIn, vOut) {
    var vis = vIn * (1 - vOut);
    var y = (1 - vIn) * 4.5 - vOut * 4;
    var blur = (1 - vIn) * 6 + vOut * 6;
    el.style.opacity = vis.toFixed(3);
    el.style.transform = 'translate3d(0,' + y.toFixed(3) + 'svh,0)';
    el.style.filter = blur > 0.06 ? 'blur(' + blur.toFixed(2) + 'px)' : 'none';
    return vis;
  }

  function update(p) {
    // the opening title lifts away as the journey starts
    var vo = M.easeIn(M.range(p, T.intro.outA, T.intro.outB));
    intro.style.opacity = (1 - vo).toFixed(3);
    intro.style.transform = 'translate3d(0,' + (-vo * 6).toFixed(3) + 'svh,0)';
    intro.style.filter = vo > 0.01 ? 'blur(' + (vo * 8).toFixed(2) + 'px)' : 'none';

    for (var i = 0; i < chapters.length; i++) {
      var c = chapters[i], cfg = c.cfg;
      var vIn = M.easeOut(M.range(p, cfg.inA, cfg.inB));
      var vOut = M.easeIn(M.range(p, cfg.outA, cfg.outB));
      var vis = place(c.el, vIn, vOut);
      riseLines(c.lines, vIn);
      c.mark.style.letterSpacing = (0.5 - 0.16 * vIn).toFixed(3) + 'em';

      if (c.count && cfg.count) {
        var n = Math.round(M.lerp(cfg.count.from, cfg.count.to, M.easeInOut(M.range(p, cfg.count.a, cfg.count.b))));
        if (c.count.textContent !== String(n)) c.count.textContent = n;
      }

      var on = vis > 0.02;
      if (on !== c.shown) { c.el.style.pointerEvents = on ? 'auto' : 'none'; c.shown = on; }
    }

    // the closing frame — enters and stays
    var fv = M.easeOut(M.range(p, T.final.inA, T.final.inB));
    place(fin.el, fv, 0);
    riseLines(fin.lines, fv);
    fin.mark.style.letterSpacing = (0.5 - 0.16 * fv).toFixed(3) + 'em';

    var cv = M.range(p, T.final.ctaA, T.final.ctaB);
    var av = M.easeOut(M.range(cv, 0, 0.7));
    fin.actions.style.opacity = av.toFixed(3);
    fin.actions.style.transform = 'translate3d(0,' + ((1 - av) * 18).toFixed(2) + 'px,0)';
    for (var k = 0; k < fin.facts.length; k++) {
      var fk = M.easeOut(M.range(cv, 0.15 + k * 0.12, 0.6 + k * 0.12));
      fin.facts[k].style.opacity = fk.toFixed(3);
      fin.facts[k].style.transform = 'translate3d(0,' + ((1 - fk) * 14).toFixed(2) + 'px,0)';
    }

    // the actions only become reachable once they can be seen
    var live = fv > 0.02;
    if (live !== fin.shown) {
      fin.el.style.visibility = live ? 'visible' : 'hidden';
      fin.shown = live;
    }
  }

  var api = { init: init, update: update };
  return api;
})();
