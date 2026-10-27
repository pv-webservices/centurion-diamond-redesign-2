/* ============================================================
   Chapter rail + scroll hint.
   Four segments — Origin / Craft / Reveal / Masterpiece — each filling
   across its own stretch of the hero; the current one is lit.
   ============================================================ */
window.CD = window.CD || {};

CD.heroProgress = (function () {
  'use strict';

  var M = CD.heroMath;
  var items = [], bars = [], bounds = null, hint = null, active = -1;
  var gate = 0, last = 0;   // gate: the hint's own entrance, run once on load

  function init(root, timeline) {
    var rail = root.querySelector('[data-hx-rail]');
    if (!rail) return null;
    items = Array.prototype.slice.call(rail.querySelectorAll('li'));
    bars = items.map(function (li) { return li.querySelector('b'); });
    bounds = timeline.rail;
    hint = root.querySelector('[data-hx-hint]');
    return api;
  }

  function update(p) {
    var now = 0;
    for (var i = 0; i < items.length; i++) {
      var t = M.range(p, bounds[i], bounds[i + 1]);
      bars[i].style.transform = 'scaleX(' + t.toFixed(4) + ')';
      if (p >= bounds[i]) now = i;
    }
    if (now !== active) {
      items.forEach(function (li, i) { li.classList.toggle('is-on', i === now); });
      active = now;
    }
    last = p;
    paintHint();
  }

  /* the hint only shows as far as scroll allows: a visitor already past the
     opening (restored scroll, anchor jump) never sees it over a later frame */
  function paintHint() {
    if (hint) hint.style.opacity = (gate * Math.max(0, 1 - last / 0.03)).toFixed(3);
  }
  function revealHint(v) { gate = v; paintHint(); }

  var api = { init: init, update: update, revealHint: revealHint };
  return api;
})();
