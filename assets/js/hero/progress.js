/* ============================================================
   Progress indicator + scroll hint.
   A thin rule that fills with hero progress, plus the phase readout.
   ============================================================ */
window.CD = window.CD || {};

CD.heroProgress = (function () {
  'use strict';
  var bar = null, num = null, hint = null, total = 0;

  function init(root, sceneCount) {
    if (!root) return null;
    bar = root.querySelector('[data-prog-bar]');
    num = root.querySelector('[data-prog-num]');
    hint = document.querySelector('[data-hero-hint]');
    total = sceneCount;
    return api;
  }

  function update(p) {
    if (bar) bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    if (num) {
      var idx = Math.min(total, Math.floor(p * total) + 1);
      var s = String(idx).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
      if (num.textContent !== s) num.textContent = s;
    }
    if (hint) hint.style.opacity = Math.max(0, 1 - p / 0.06).toFixed(3);
  }

  var api = { init: init, update: update };
  return api;
})();
