/* ============================================================
   Hero sparks — "a few minimal sparks" at the laser's contact point.

   A small fixed pool of particles on one canvas, drawn as short additive
   streaks. It only paints while the laser burns or a spark is still in
   flight, so the canvas costs nothing for the rest of the hero.
   ============================================================ */
window.CD = window.CD || {};

CD.heroSparks = (function () {
  'use strict';

  var POOL = 140;
  var RATE = 70;          // sparks per second at full burn
  var GRAVITY = 560;      // px/s², at a 900px-tall stage

  var canvas, ctx, dpr = 1, w = 0, h = 0, unit = 1;
  var parts = [];
  var last = 0, owed = 0, live = 0, dirty = false;

  function init(el) {
    canvas = el;
    if (!canvas || !canvas.getContext) return null;
    ctx = canvas.getContext('2d');
    for (var i = 0; i < POOL; i++) parts.push({ on: false, x: 0, y: 0, px: 0, py: 0, vx: 0, vy: 0, life: 0, max: 1, hue: 0 });
    resize();
    window.addEventListener('resize', resize, { passive: true });
    return api;
  }

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    unit = h / 900;
    dirty = true;
  }

  function emit(x, y) {
    for (var i = 0; i < POOL; i++) {
      var s = parts[i];
      if (s.on) continue;
      // mostly thrown back and down, away from the cutting head
      var a = Math.PI * (0.62 + Math.random() * 0.78);
      var v = (90 + Math.random() * 260) * unit;
      s.on = true; live++;
      s.x = s.px = x; s.y = s.py = y;
      s.vx = Math.cos(a) * v; s.vy = Math.sin(a) * v - 40 * unit;
      s.life = 0; s.max = 0.25 + Math.random() * 0.6;
      s.hue = Math.random();
      return;
    }
  }

  /* time in seconds; point = contact point in stage px (or null); level 0..1 */
  function tick(time, point, level) {
    var dt = last ? Math.min(0.05, time - last) : 0;
    last = time;
    if (!ctx || (!live && !(point && level > 0.01))) {
      if (dirty) { ctx && ctx.clearRect(0, 0, canvas.width, canvas.height); dirty = false; }
      return;
    }

    if (point && level > 0.01) {
      owed += RATE * level * dt;
      while (owed >= 1) { emit(point.x, point.y); owed -= 1; }
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';

    for (var i = 0; i < POOL; i++) {
      var s = parts[i];
      if (!s.on) continue;
      s.life += dt;
      if (s.life >= s.max || s.y > h) { s.on = false; live--; continue; }
      s.px = s.x; s.py = s.y;
      s.vy += GRAVITY * unit * dt;
      s.x += s.vx * dt; s.y += s.vy * dt;

      var k = 1 - s.life / s.max;
      // white-hot when thrown, cooling to amber, then rose
      var r = 255, g = Math.round(200 + 50 * k - 40 * s.hue), b = Math.round(150 + 90 * k * k - 40 * s.hue);
      ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (k * 0.9).toFixed(3) + ')';
      ctx.lineWidth = (0.6 + 1.1 * k) * Math.max(1, unit);
      ctx.beginPath();
      ctx.moveTo(s.px - s.vx * dt * 1.5, s.py - s.vy * dt * 1.5);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
    }
    dirty = true;
  }

  var api = { init: init, tick: tick };
  return api;
})();
