/* ============================================================
   04 · THE COLLECTION — the renderer.

   Takes a frame from CD.collectionTimeline and writes it. Transforms,
   opacity and one custom property only.

   `--ground` is the whole trick behind the product plates: each ring photo
   ships on white and is dropped onto the page with `mix-blend-mode:
   multiply`, but the animated transform on its slot isolates it from the
   page backdrop. So every plate paints the stage's own colour behind its
   ring, and that colour is written here — which is also why the rings
   dissolve correctly when the ground darkens into the next section.
   ============================================================ */
window.CD = window.CD || {};

CD.collectionVisual = (function () {
  'use strict';

  var T = null;

  function mount(root) {
    T = CD.collectionTimeline;
    var q = function (s) { return root.querySelector(s); };
    var all = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };

    var slots = all('[data-cl]').map(function (el) {
      return {
        el: el,
        life: el.getAttribute('data-cl') === 'life',
        metal: el.getAttribute('data-metal') || '',
        plate: el.querySelector('.cl__plate'),
        lines: Array.prototype.slice.call(el.querySelectorAll('.cl__plate > *')),
        /* eleven slots write on every scroll frame; only the two or three
           near the centre actually change, so each one remembers what it
           last set and skips the rest */
        _op: -1, _vis: '', _z: -1, _plate: -1
      };
    });

    return {
      stage:  q('.coll__stage'),
      grain:  q('[data-coll-grain]'),
      iris:   all('[data-coll-iris] .coll__ir'),
      intro:  q('[data-coll-intro]'),
      eyebrow: q('.coll__eyebrow'),
      introLn: all('[data-coll-intro] .coll__ln > span'),
      lede:   q('.coll__lede'),
      rail:   q('[data-coll-rail]'),
      slots:  slots,
      stmt:   q('[data-coll-stmt]'),
      stmtLn: all('[data-coll-stmt] .coll__ln > span'),
      nav:    q('[data-coll-nav]'),
      navCount: q('[data-coll-count]'),
      navIdx: q('[data-coll-i]'),
      navCut: q('[data-coll-cut]'),
      bar:    q('[data-coll-bar]'),
      metals: q('[data-coll-metals]'),
      final:  q('[data-coll-final]'),
      finalStone: q('[data-coll-final] .coll__hero'),
      finalLn: all('[data-coll-final] .coll__ln > span'),
      cta:    q('[data-coll-cta]'),
      filter: '',          // active metal family, set by the selector
      _bg: '', _idx: -1, _grain: ''
    };
  }

  function render(el, f, cfg) {
    /* --- ground: the stage, and every plate that has to match it --- */
    if (f.ground !== el._bg) {
      el.stage.style.setProperty('--ground', f.ground);
      el._bg = f.ground;
    }

    /* --- the aperture, opening --- */
    var ir = 'scale(' + f.iris.toFixed(4) + ')';
    for (var c = 0; c < el.iris.length; c++) el.iris[c].style.transform = ir;

    /* The grain is a full-viewport multiply layer and the aperture is a
       full-viewport mask; rasterising both on the same frames is the one
       expensive moment in this section. Under a closed aperture the grain
       is invisible anyway, so it stays out of the compositor until the
       room is lit. */
    var gv = f.iris > 0.85 ? 'visible' : 'hidden';
    if (gv !== el._grain) { el.grain.style.visibility = gv; el._grain = gv; }

    /* --- opening type --- */
    el.intro.style.opacity = f.intro.v.toFixed(3);
    el.intro.style.transform = 'translate3d(0,' + f.intro.y.toFixed(2) + 'vh,0)';
    el.intro.style.visibility = f.intro.v < 0.004 ? 'hidden' : 'visible';
    if (f.intro.v >= 0.004) {
      el.eyebrow.style.opacity = f.intro.eyebrow.toFixed(3);
      for (var i = 0; i < el.introLn.length; i++) {
        var lv = f.intro.lines[i] == null ? 1 : f.intro.lines[i];
        el.introLn[i].style.transform = 'translate3d(0,' + ((1 - lv) * 108).toFixed(2) + '%,0)';
      }
      el.lede.style.opacity = f.intro.lede.toFixed(3);
      el.lede.style.transform = 'translate3d(0,' + ((1 - f.intro.lede) * 20).toFixed(2) + 'px,0)';
    }

    /* --- the rail. Pitch lives in CSS so it stays responsive. --- */
    el.rail.style.transform =
      'translate3d(calc(var(--pitch) * ' + (-f.rail.pos).toFixed(4) + '),' +
      'calc(-50% + ' + f.rail.y.toFixed(2) + 'vh),0)';

    for (var s = 0; s < el.slots.length; s++) {
      var sl = el.slots[s], st = f.slots[s];
      var op = st.opacity;
      if (sl.life) op = Math.pow(op, cfg.rail.lifeFalloff);
      /* the metal selector dims what does not match — it never hides product
         data, and it never reorders the real catalogue */
      if (el.filter && sl.metal && sl.metal !== el.filter) op *= 0.16;

      var ops = op.toFixed(3);
      if (ops !== sl._op) { sl.el.style.opacity = ops; sl._op = ops; }
      var vis = op < 0.005 ? 'hidden' : 'visible';
      if (vis !== sl._vis) { sl.el.style.visibility = vis; sl._vis = vis; }
      if (st.z !== sl._z) { sl.el.style.zIndex = st.z; sl._z = st.z; }
      if (op < 0.005) continue;

      sl.el.style.transform =
        'translate3d(0,' + st.y.toFixed(2) + 'vh,0) ' +
        'scale(' + st.scale.toFixed(4) + ') rotate(' + st.rot.toFixed(2) + 'deg)';

      if (sl.plate) {
        var pl = st.plate.toFixed(3);
        if (pl !== sl._plate) { sl.plate.style.opacity = pl; sl._plate = pl; }
        if (st.plate > 0.004) {
          for (var l = 0; l < sl.lines.length; l++) {
            var k = cfg.plate[l] == null ? 0.44 : cfg.plate[l];
            var v = T.stagger(st.near, k);
            sl.lines[l].style.opacity = v.toFixed(3);
            sl.lines[l].style.transform = 'translate3d(0,' + ((1 - v) * 14).toFixed(2) + 'px,0)';
          }
        }
      }
    }

    /* --- the statement that holds the gallery --- */
    el.stmt.style.opacity = f.stmt.v.toFixed(3);
    el.stmt.style.visibility = f.stmt.v < 0.004 ? 'hidden' : 'visible';
    if (f.stmt.v >= 0.004) {
      for (var m = 0; m < el.stmtLn.length; m++) {
        var sv = f.stmt.lines[m] == null ? 1 : f.stmt.lines[m];
        el.stmtLn[m].style.transform = 'translate3d(0,' + ((1 - sv) * 106).toFixed(2) + '%,0)';
      }
    }

    /* --- navigation --- */
    el.nav.style.opacity = f.nav.v.toFixed(3);
    el.nav.style.visibility = f.nav.v < 0.004 ? 'hidden' : 'visible';
    el.bar.style.transform = 'scaleX(' + f.nav.bar.toFixed(4) + ')';
    if (f.nav.index !== el._idx) {
      var act = el.slots[f.nav.index];
      if (act) {
        var num = act.el.getAttribute('data-n') || '';
        el.navIdx.textContent = num;
        el.navCut.textContent = act.el.getAttribute('data-cut') || '';
        el.navCount.style.display = num ? '' : 'none';
      }
      el._idx = f.nav.index;
    }

    /* The material story arrives in the second half of the gallery, but a
       family that is currently chosen must keep its own control on screen —
       otherwise selecting one scrolls the selector out of its own band. */
    var mv = el.filter ? 1 : f.metals.v;
    el.metals.style.opacity = mv.toFixed(3);
    el.metals.style.visibility = mv < 0.004 ? 'hidden' : 'visible';
    el.metals.style.pointerEvents = mv > 0.6 ? 'auto' : 'none';

    /* --- the last frame: one stone, centred --- */
    el.final.style.opacity = (f.finale.v * (1 - f.handoff)).toFixed(3);
    el.final.style.transform = 'translate3d(0,' + (-f.handoff * 7).toFixed(2) + 'vh,0)';
    var fv = f.finale.v * (1 - f.handoff);
    el.final.style.visibility = fv < 0.004 ? 'hidden' : 'visible';
    if (fv >= 0.004) {
      el.finalStone.style.transform =
        'scale(' + (0.88 + 0.12 * f.finale.stone).toFixed(4) + ')';
      for (var w = 0; w < el.finalLn.length; w++) {
        var fv = f.finale.lines[w] == null ? 1 : f.finale.lines[w];
        el.finalLn[w].style.transform = 'translate3d(0,' + ((1 - fv) * 108).toFixed(2) + '%,0)';
      }
      el.cta.style.opacity = f.finale.cta.toFixed(3);
      el.cta.style.transform = 'translate3d(0,' + ((1 - f.finale.cta) * 18).toFixed(2) + 'px,0)';
      el.cta.style.pointerEvents = (f.finale.cta > 0.6 && f.handoff < 0.3) ? 'auto' : 'none';
    }
  }

  return { mount: mount, render: render };
})();
