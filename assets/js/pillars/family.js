/* ============================================================
   03 · ANATOMY OF BRILLIANCE — the family finale ("One philosophy.
   Every shape.").

   Runs on its own progress (0..1), the last share of the chapter's pin:
     aperture   the light frame closes around the Round, the ground turns ink
     ring       100 facet ticks light around the stone, the title rises
     orbit      the other cuts spiral out from behind the Round
     showcase   each cut in turn takes the centre at hero size
     exit       the family gathers into the Round, and the Round into one
                line of light: the line the Light Study opens on

   Builds its own DOM from CD.diamondFamily; only transform / opacity are
   written per frame, plus the ring's lit count when it changes.
   ============================================================ */
window.CD = window.CD || {};

CD.pillarsFamily = (function () {
  'use strict';

  var T = null;                           // CD.pillarsTimeline, resolved at mount
  var TICKS = 100;
  var LIGHT = [243, 241, 238], INK = [21, 18, 19];

  /* the beats, in family-progress space */
  var B = {
    enter:    [0.00, 0.06],
    aperture: [0.02, 0.12],
    ground:   [0.11, 0.14],               // turns under the closed aperture
    unveil:   [0.14, 0.18],               // then the aperture itself lets go
    glow:     [0.12, 0.26],
    ring:     [0.14, 0.40],
    title:    [0.16, 0.30],
    settle:   [0.20, 0.34],
    orbit:    [0.26, 0.36],               // first relative; each next one +ORBIT_STEP
    showcase: [0.52, 0.86],
    exit:     [0.87, 0.94],               // everything gathers to the centre
    collapse: [0.92, 0.97],               // the Round folds to a point
    line:     [0.93, 0.995]               // which draws out into the hairline
  };
  var ORBIT_STEP = 0.022;

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html) n.innerHTML = html;
    return n;
  }

  /* an image with a sheen that travels only across the stone itself */
  function gem(shape, cls) {
    var wrap = el('span', cls);
    wrap.appendChild(CD.shapePicture(shape));
    var shine = el('i', 'fam__shine');
    /* absolute, so the stylesheet that reads the variable can't re-base it */
    shine.style.setProperty('--fam-mask', 'url("' + new URL(shape.src, document.baseURI).href + '")');
    wrap.appendChild(shine);
    return wrap;
  }

  function buildRing(svg) {
    var ns = 'http://www.w3.org/2000/svg', lines = [];
    for (var i = 0; i < TICKS; i++) {
      var a = (i / TICKS) * Math.PI * 2 - Math.PI / 2, long = i % 10 === 0;
      var r0 = long ? 176 : 185, c = Math.cos(a), s = Math.sin(a);
      var ln = document.createElementNS(ns, 'line');
      ln.setAttribute('x1', (200 + c * r0).toFixed(2));
      ln.setAttribute('y1', (200 + s * r0).toFixed(2));
      ln.setAttribute('x2', (200 + c * 196).toFixed(2));
      ln.setAttribute('y2', (200 + s * 196).toFixed(2));
      if (long) ln.setAttribute('class', 'is-long');
      svg.appendChild(ln);
      lines.push(ln);
    }
    return lines;
  }

  function mount(root) {
    T = CD.pillarsTimeline;
    var host = root.querySelector('[data-plr-family]');
    var shapes = CD.diamondFamily.filter(function (s) { return !!s.src; });

    host.appendChild(el('div', 'fam__glow'));
    var line = el('i', 'fam__line');
    host.appendChild(line);

    var head = el('div', 'fam__head');
    var eyebrow = el('p', 'fam__eyebrow', '<i></i><span>The Centurion family</span><i></i>');
    var title = el('h3', 'fam__title',
      '<span class="fam__ln"><span>One philosophy.</span></span>' +
      '<span class="fam__ln"><span><em>Every shape.</em></span></span>');
    head.appendChild(eyebrow); head.appendChild(title);
    host.appendChild(head);

    /* the centre: facet ring, a stack of every cut, glints, the name plate */
    var core = el('div', 'fam__core');
    var ring = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    ring.setAttribute('class', 'fam__ring');
    ring.setAttribute('viewBox', '0 0 400 400');
    ring.setAttribute('aria-hidden', 'true');
    var ticks = buildRing(ring);
    core.appendChild(ring);

    var show = el('div', 'fam__show');
    var stack = shapes.map(function (s) { var g = gem(s, 'fam__hero'); show.appendChild(g); return g; });
    core.appendChild(show);
    core.appendChild(el('span', 'fam__glints', '<i></i><i></i><i></i><i></i>'));

    var plate = el('p', 'fam__plate',
      '<span class="fam__count" data-fam-count>01 / ' + pad(shapes.length) + '</span>' +
      '<span class="fam__name" data-fam-name>' + shapes[0].name + '</span>');
    core.appendChild(plate);
    host.appendChild(core);

    /* the orbit: every other cut */
    var orbit = shapes.slice(1).map(function (s) {
      var fig = el('figure', 'fam__orb');
      fig.appendChild(gem(s, 'fam__gem'));
      var cap = el('figcaption'); cap.textContent = s.name; fig.appendChild(cap);
      host.appendChild(fig);
      return fig;
    });

    var m = {
      host: host, head: head, eyebrow: eyebrow, line: line,
      lines: Array.prototype.slice.call(title.querySelectorAll('.fam__ln > span')),
      glow: host.querySelector('.fam__glow'),
      core: core, ring: ring, ticks: ticks, show: show, stack: stack,
      glints: core.querySelector('.fam__glints'),
      plate: plate, count: plate.querySelector('[data-fam-count]'), name: plate.querySelector('[data-fam-name]'),
      orbit: orbit, shapes: shapes,
      iris: Array.prototype.slice.call(root.querySelectorAll('[data-plr-iris] .plr__ir')),
      irisSvg: root.querySelector('[data-plr-iris]'),
      stone: root.querySelector('[data-plr-stone] .plr__stone-in'),
      lit: -1, active: -1, irisTo: 0.2
    };
    measure(m);
    window.addEventListener('resize', function () { measure(m); }, { passive: true });
    return m;
  }

  /* the aperture closes to just outside the Round. The iris view box is
     100 units sliced to cover, so one unit is max(w,h)/100 px. */
  function measure(m) {
    var unit = Math.max(window.innerWidth, window.innerHeight) / 100;
    var r = (m.show.offsetHeight || window.innerHeight * 0.3) * 0.56;
    m.irisTo = Math.max(0.04, r / (50 * unit));
  }

  function ground(fp) {
    var t = T.smooth(T.range(fp, B.ground[0], B.ground[1]));
    return 'rgb(' + Math.round(T.lerp(LIGHT[0], INK[0], t)) + ',' +
                    Math.round(T.lerp(LIGHT[1], INK[1], t)) + ',' +
                    Math.round(T.lerp(LIGHT[2], INK[2], t)) + ')';
  }

  /* showcase order: every orbiting cut in turn, then home to the Round */
  function showcase(fp, n) {
    var seq = n + 1, s = T.range(fp, B.showcase[0], B.showcase[1]) * seq;
    if (s <= 0) return { from: 0, to: 0, blend: 0, slot: -1 };
    var k = Math.min(seq - 1, Math.floor(s)), local = s - k;
    var from = k % n, to = (k + 1) % n;               // 0 = Round, 1..n-1 = orbit
    var blend = k === seq - 1 ? 0 : T.smooth(T.range(local, 0.62, 0.95));
    /* stone k is centre-stage through segment k; the entrance crossfade
       happens at the end of the previous segment */
    return { from: from, to: to, blend: blend, slot: blend > 0.5 ? to : from };
  }

  function render(m, fp, narrow) {
    /* held at 1 too: the finished hairline stays drawn until the Light
       Study's stage, which opens on that same line, takes the frame */
    var active = fp > 0;
    m.host.style.visibility = active ? 'visible' : 'hidden';
    m.irisSvg.style.visibility = fp > 0 && fp < B.unveil[1] ? 'visible' : 'hidden';

    /* the chapter's travelling stone gives way to the family's Round */
    var enter = T.easeOut(T.range(fp, B.enter[0], B.enter[1]));
    if (fp > 0) m.stone.style.opacity = ((parseFloat(m.stone.style.opacity) || 0) * (1 - enter)).toFixed(3);
    if (!active) { m.host.style.opacity = 0; return; }

    var exit = T.easeIO(T.range(fp, B.exit[0], B.exit[1]));
    var collapse = T.easeIn(T.range(fp, B.collapse[0], B.collapse[1]));
    var drawn = T.easeIO(T.range(fp, B.line[0], B.line[1]));
    m.host.style.opacity = 1;
    m.host.classList.toggle('is-live', fp > B.orbit[1] && exit < 0.2);

    /* the hairline: the Study's opening frame, drawn from the Round's centre */
    m.line.style.opacity = Math.min(1, drawn * 4).toFixed(3);
    m.line.style.transform = 'scaleX(' + drawn.toFixed(4) + ')';

    /* --- aperture: dark rect with a hole, closing on the Round --- */
    var ap = T.easeIO(T.range(fp, B.aperture[0], B.aperture[1]));
    var irisScale = T.lerp(1.4, m.irisTo, ap).toFixed(4);
    for (var c = 0; c < m.iris.length; c++) m.iris[c].style.transform = 'scale(' + irisScale + ')';
    m.irisSvg.style.opacity = (1 - T.range(fp, B.unveil[0], B.unveil[1])).toFixed(3);

    /* --- light: halo and the facet ring --- */
    var glow = T.easeOut(T.range(fp, B.glow[0], B.glow[1]));
    m.glow.style.opacity = (glow * (1 - collapse)).toFixed(3);
    var lit = Math.round(TICKS * T.easeIO(T.range(fp, B.ring[0], B.ring[1])));
    if (lit !== m.lit) {
      for (var t = 0; t < TICKS; t++) m.ticks[t].classList.toggle('is-lit', t < lit);
      m.lit = lit;
    }
    m.ring.style.opacity = (T.range(fp, B.ring[0] - 0.02, B.ring[0] + 0.03) * (1 - exit)).toFixed(3);
    m.glints.style.opacity = (T.range(fp, B.ring[1] - 0.06, B.ring[1]) * (1 - exit)).toFixed(3);

    /* --- title --- */
    var tv = T.range(fp, B.title[0], B.title[1]);
    m.eyebrow.style.opacity = T.easeOut(T.range(tv, 0, 0.5)).toFixed(3);
    for (var l = 0; l < m.lines.length; l++) {
      var lv = T.stagger(tv, 0.18 + l * 0.22);
      m.lines[l].style.transform = 'translate3d(0,' + ((1 - lv) * 110).toFixed(2) + '%,0)';
    }
    m.head.style.opacity = (1 - exit).toFixed(3);
    m.head.style.transform = 'translate3d(0,' + (-exit * 6).toFixed(2) + 'svh,0)';

    /* --- the Round: enters at the frame's centre, settles into the ring --- */
    var cy = narrow ? 6 : 7;
    var settle = T.easeIO(T.range(fp, B.settle[0], B.settle[1]));
    var coreS = T.lerp(0.86, 1, enter) * (1 - collapse * 0.97);
    m.core.style.opacity = (enter * (1 - collapse)).toFixed(3);
    m.core.style.transform = 'translate3d(-50%,-50%,0) translate3d(0,' + (cy * settle * (1 - exit)).toFixed(2) + 'svh,0) ' +
      'scale(' + coreS.toFixed(4) + ') rotate(' + ((1 - enter) * -6).toFixed(2) + 'deg)';

    /* --- showcase --- */
    var n = m.shapes.length, sc = showcase(fp, n);
    for (var i = 0; i < n; i++) {
      var o = 0, s = 1;
      if (i === sc.from) { o = 1 - sc.blend; s = 1 + sc.blend * 0.06; }
      if (i === sc.to && sc.blend > 0) { o = Math.max(o, sc.blend); s = 0.9 + sc.blend * 0.1; }
      var h = m.stack[i];
      h.style.opacity = o.toFixed(3);
      h.style.visibility = o < 0.004 ? 'hidden' : 'visible';
      h.style.transform = 'scale(' + s.toFixed(4) + ') rotate(' + ((i === sc.to ? 1 - sc.blend : 0) * 8).toFixed(2) + 'deg)';
    }
    if (sc.slot !== m.active) {
      m.active = sc.slot;
      m.name.textContent = m.shapes[sc.slot].name;
      m.count.textContent = pad(sc.slot + 1) + ' / ' + pad(n);
    }
    var plateIn = T.range(fp, B.settle[1] - 0.04, B.settle[1] + 0.02);
    m.plate.style.opacity = (plateIn * (1 - Math.sin(Math.PI * sc.blend) * 0.85) * (1 - exit)).toFixed(3);

    /* --- orbit: each cut spirals out from behind the Round --- */
    var ring = m.orbit.length, rx = narrow ? 37 : 31, ry = narrow ? 26 : 24;
    var bob = T.range(fp, B.orbit[1], 1) * Math.PI * 5;          // a slow, scroll-held drift
    for (var k = 0; k < ring; k++) {
      var fig = m.orbit[k];
      var v = T.easeOut(T.range(fp, B.orbit[0] + k * ORBIT_STEP, B.orbit[1] + k * ORBIT_STEP));
      var base = -112.5 + k * 360 / ring;
      var a = (base - (1 - v) * 70) * Math.PI / 180;
      var rad = v * (1 - exit);                                    // gathers home
      var x = Math.cos(a) * rx * rad, y = cy + Math.sin(a) * ry * rad + Math.sin(bob + k * 1.7) * 0.9 * v;
      var isOn = sc.slot === k + 1;
      fig.classList.toggle('is-on', isOn);
      fig.style.opacity = (v * (isOn ? 0.32 : 1) * (1 - exit)).toFixed(3);
      fig.style.visibility = v < 0.004 ? 'hidden' : 'visible';
      fig.style.transform = 'translate3d(' + x.toFixed(2) + 'vw,' + y.toFixed(2) + 'svh,0) ' +
        'scale(' + ((0.35 + 0.65 * v) * (1 - exit * 0.7)).toFixed(4) + ')';
    }
  }

  return { mount: mount, render: render, ground: ground };
})();
