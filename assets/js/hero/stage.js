/* ============================================================
   Hero stage — the four frames, their camera moves and the cuts between.

   update(p) is pure scroll: camera, transitions, light levels.
   tick(time) is the living layer that should move even while the page is
   still: the stone's glints, the pointer parallax, and following the laser's
   contact point on screen (the flash is centred on it).
   ============================================================ */
window.CD = window.CD || {};

CD.heroStage = (function () {
  'use strict';

  var M = CD.heroMath;
  var TAU = Math.PI * 2;
  var SHEEN_TILT = Math.tan(14 * Math.PI / 180);   // matches the sheen's 14deg lean

  var stage, wrap, night, sheen, flash, laser, spin, rim, glints = [];
  var scenes = [];
  var T = null;
  var p = 0;
  var revealVis = 0;
  var glintsOn = false;   // glints were lit last frame, so they still need clearing
  var laserLevel = 0;
  var par = { x: 0, y: 0, tx: 0, ty: 0 };
  var size = { w: 1, h: 1 };

  function init(root, timeline) {
    T = timeline;
    stage = root.querySelector('.hx__stage');
    wrap = root.querySelector('[data-hx-scenes]');
    night = root.querySelector('[data-hx-night]');
    sheen = root.querySelector('[data-hx-sheen]');
    flash = root.querySelector('[data-hx-flash]');
    laser = root.querySelector('[data-hx-laser]');
    spin = root.querySelector('[data-hx-spin]');
    rim = root.querySelector('[data-hx-rim]');
    glints = Array.prototype.slice.call(root.querySelectorAll('.hx__glints i'));

    scenes = T.scenes.map(function (cfg) {
      var el = root.querySelector('[data-hx-scene="' + cfg.id + '"]');
      return { cfg: cfg, el: el, plate: el.querySelector('.hx__plate'), shown: null, clipped: false };
    });

    measure();
    window.addEventListener('resize', measure, { passive: true });

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      window.addEventListener('pointermove', function (e) {
        par.tx = (e.clientX / size.w - 0.5) * -14;
        par.ty = (e.clientY / size.h - 0.5) * -9;
      }, { passive: true });
    }
    return api;
  }

  function measure() {
    size.w = stage.clientWidth || window.innerWidth;
    size.h = stage.clientHeight || window.innerHeight;
  }

  function show(s, on) {
    if (s.shown === on) return;
    s.el.style.visibility = on ? 'visible' : 'hidden';
    s.shown = on;
  }

  /* camera: a slow move across the scene's window, about its focal point */
  function camera(s, extraScale) {
    var c = s.cfg;
    var t = M.range(p, c.cam[0], c.cam[1]);
    // the pull back decelerates into stillness; the others glide
    t = c.enter && c.enter.type === 'dissolve' ? M.easeOut(t) : M.easeInOut(t);
    var sc = M.lerp(c.scale[0], c.scale[1], t) * (extraScale || 1);
    var x = M.lerp(c.x[0], c.x[1], t);
    s.plate.style.transform = 'translate3d(' + x.toFixed(3) + '%,0,0) scale(' + sc.toFixed(4) + ')';
  }

  /* how far each scene's entrance has run, 0..1 */
  function entry(s) {
    var e = s.cfg.enter;
    return e ? M.range(p, e.a, e.b) : 1;
  }

  function sweep(s, e) {
    var pos = M.lerp(-0.3, 1.3, M.easeInOut(e)) * size.w;
    var k = SHEEN_TILT * size.h / 2;
    if (e <= 0 || e >= 1) {
      if (s.clipped) { s.el.style.clipPath = ''; s.clipped = false; }
    } else {
      s.el.style.clipPath = 'polygon(0px 0px,' + (pos + k).toFixed(1) + 'px 0px,' +
        (pos - k).toFixed(1) + 'px 100%,0px 100%)';
      s.clipped = true;
    }
    sheen.style.opacity = Math.min(1, M.bell(e) * 1.6).toFixed(3);
    sheen.style.transform = 'translate3d(' + pos.toFixed(1) + 'px,0,0) translateX(-50%) rotate(14deg)';
    return e > 0;
  }

  function flashCut(s, e) {
    s.el.style.opacity = M.range(e, 0.42, 0.6).toFixed(3);
    flash.style.opacity = (0.92 * M.bell(e)).toFixed(3);
    flash.dataset.scale = (0.15 + 1.6 * M.easeOut(e)).toFixed(3);
    return e > 0;
  }

  function dissolve(s, e) {
    // front-loaded, so the two frames spend little time as a double exposure
    s.el.style.opacity = M.easeOut(e).toFixed(3);
    return e > 0;
  }

  function update(progress) {
    p = progress;
    var i, s, e, visible;
    var cover = [];

    for (i = 0; i < scenes.length; i++) {
      s = scenes[i];
      e = entry(s);
      visible = true;
      if (s.cfg.enter) {
        if (s.cfg.enter.type === 'sweep') visible = sweep(s, e);
        else if (s.cfg.enter.type === 'flash') visible = flashCut(s, e);
        else visible = dissolve(s, e);
      }
      cover.push(e);
      s.visible = visible;
    }

    for (i = 0; i < scenes.length; i++) {
      s = scenes[i];
      // a frame fully covered by the next one stops painting
      var hidden = !s.visible || (i + 1 < scenes.length && cover[i + 1] >= 1);
      show(s, !hidden);
      if (hidden) continue;
      // the reveal is pushed through as the masterpiece pulls back over it
      var through = s.cfg.id === 'reveal' ? 1 + 0.1 * M.easeIn(cover[i + 1]) : 1;
      camera(s, through);
    }

    var origin = T.scenes[0], craft = T.scenes[1], reveal = T.scenes[2], master = T.scenes[3];

    night.style.opacity = (0.55 * (1 - M.easeOut(M.range(p, origin.light[0], origin.light[1])))).toFixed(3);

    var L = craft.laser;
    laserLevel = M.easeOut(M.range(p, L[0], L[1])) * (1 - M.easeIn(M.range(p, L[2], L[3])));
    scenes[1].el.style.setProperty('--laser', laserLevel.toFixed(3));

    var sp = M.easeInOut(M.range(p, reveal.spin[0], reveal.spin[1]));
    spin.style.setProperty('--spin', M.lerp(reveal.spin[2], reveal.spin[3], sp).toFixed(2) + 'deg');
    revealVis = scenes[2].shown ? M.range(cover[2], 0.5, 1) * (1 - cover[3]) : 0;

    rim.style.setProperty('--rim', M.easeOut(M.range(p, master.rim[0], master.rim[1])).toFixed(3));
    stage.style.setProperty('--handoff', M.range(p, 0.9, 1).toFixed(3));
  }

  /* where the laser's contact point is on screen, in stage pixels */
  function laserPoint() {
    if (!scenes[1].shown) return null;
    var r = laser.getBoundingClientRect(), o = stage.getBoundingClientRect();
    return { x: r.left - o.left, y: r.top - o.top };
  }

  function tick(time) {
    var pt = laserPoint();
    if (pt && +flash.style.opacity > 0) {
      flash.style.transform = 'translate3d(' + pt.x.toFixed(1) + 'px,' + pt.y.toFixed(1) + 'px,0) scale(' + flash.dataset.scale + ')';
    }

    for (var k = 0; k < glints.length && (revealVis > 0 || glintsOn); k++) {
      var g = revealVis > 0 ? Math.pow(Math.max(0, Math.sin(p * TAU * 7 + time * 0.9 + k * 1.7)), 10) * revealVis : 0;
      glints[k].style.opacity = g.toFixed(3);
      glints[k].style.transform = 'scale(' + (0.4 + g * 0.9).toFixed(3) + ') rotate(' + (12 + p * 90).toFixed(1) + 'deg)';
    }

    glintsOn = revealVis > 0;

    // parallax eases toward the pointer and stops writing once it has arrived
    if (Math.abs(par.tx - par.x) + Math.abs(par.ty - par.y) > 0.02) {
      par.x += (par.tx - par.x) * 0.06;
      par.y += (par.ty - par.y) * 0.06;
      wrap.style.setProperty('--px', par.x.toFixed(2) + 'px');
      wrap.style.setProperty('--py', par.y.toFixed(2) + 'px');
    }

    return pt;
  }

  /* 0..1 — how hard the laser is burning, for the sparks */
  function laserIntensity() { return laserLevel; }

  var api = { init: init, update: update, tick: tick, laserIntensity: laserIntensity };
  return api;
})();
