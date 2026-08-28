/* ============================================================
   10 · EXCLUSIVITY — the renderer.

   Takes a frame from CD.exclusiveTimeline and writes it to the DOM. Per
   frame it touches transform and opacity only.

   The closing button is the one element on any of these stages that has to
   stay pressable, so its layer takes pointer events back as it arrives and
   gives them up if it leaves.
   ============================================================ */
window.CD = window.CD || {};

CD.exclusiveVisual = (function () {
  'use strict';

  var T = null;   // CD.exclusiveTimeline, resolved at mount

  function mount(root) {
    T = CD.exclusiveTimeline;
    var q = function (s) { return root.querySelector(s); };
    var all = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };

    return {
      stage:   q('.exc__stage'),
      intro:   q('[data-exc-intro]'),
      introLn: all('[data-exc-intro] .exc__ln > span'),
      ledger:  q('[data-exc-ledger]'),
      rows:    all('[data-exc-row]').map(function (el) {
        return {
          el: el,
          n: el.querySelector('.exc__n'),
          l: el.querySelector('.exc__l'),
          rule: el.querySelector('.exc__rule')
        };
      }),
      claims:  all('[data-exc-claim]'),
      close:   q('[data-exc-close]'),
      closeLn: all('[data-exc-close] .exc__ln > span'),
      cta:     q('[data-exc-cta]')
    };
  }

  function render(el, f) {
    /* --- opening --- */
    el.intro.style.opacity = f.intro.v.toFixed(3);
    el.intro.style.transform = 'translate3d(0,' + f.intro.y.toFixed(2) + 'vh,0)';
    for (var l = 0; l < el.introLn.length; l++) {
      var lv = f.intro.lines[l] == null ? 1 : f.intro.lines[l];
      el.introLn[l].style.transform = 'translate3d(0,' + ((1 - lv) * 108).toFixed(2) + '%,0)';
    }

    /* --- the ledger --- */
    el.ledger.style.opacity = f.ledger.v.toFixed(3);
    el.ledger.style.visibility = f.ledger.v < 0.004 ? 'hidden' : 'visible';
    el.ledger.style.transform = 'translate3d(0,' + f.ledger.y.toFixed(2) + 'vh,0)';
    for (var r = 0; r < el.rows.length; r++) {
      var row = el.rows[r], rs = f.rows[r];
      row.el.style.opacity = rs.v.toFixed(3);
      if (rs.v < 0.004) continue;
      row.n.style.transform = 'translate3d(0,' + ((1 - rs.v) * 34).toFixed(2) + 'px,0)';
      var lvv = T.stagger(rs.v, 0.34);
      row.l.style.opacity = lvv.toFixed(3);
      row.l.style.transform = 'translate3d(0,' + ((1 - lvv) * 14).toFixed(2) + 'px,0)';
      row.rule.style.transform = 'scaleX(' + rs.rule.toFixed(4) + ')';
    }

    /* --- the case for stocking --- */
    for (var c = 0; c < el.claims.length; c++) {
      var cl = f.claims[c], node = el.claims[c];
      node.style.opacity = cl.v.toFixed(3);
      node.style.visibility = cl.v < 0.004 ? 'hidden' : 'visible';
      if (cl.v < 0.004) continue;
      node.style.transform =
        'translate3d(0,' + ((1 - cl.vin) * 26 - cl.vout * 18).toFixed(2) + 'px,0)';
    }

    /* --- the last frame --- */
    el.close.style.opacity = f.close.v.toFixed(3);
    el.close.style.visibility = f.close.v < 0.004 ? 'hidden' : 'visible';
    el.close.style.transform = 'translate3d(0,' + f.close.y.toFixed(2) + 'px,0)';
    for (var m = 0; m < el.closeLn.length; m++) {
      var cv = f.close.lines[m] == null ? 1 : f.close.lines[m];
      el.closeLn[m].style.transform = 'translate3d(0,' + ((1 - cv) * 108).toFixed(2) + '%,0)';
    }
    el.cta.style.opacity = f.close.cta.toFixed(3);
    el.cta.style.transform = 'translate3d(0,' + ((1 - f.close.cta) * 16).toFixed(2) + 'px,0)';
    /* the one control on these stages that has to stay pressable */
    el.cta.style.pointerEvents = f.close.cta > 0.9 ? 'auto' : 'none';
  }

  return { mount: mount, render: render };
})();
