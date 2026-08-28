/* ============================================================
   04 · A STUDY IN LIGHT — the scrub engine.

   The clip is seeked, never played, so that scrolling *is* the observation
   rather than something happening alongside it. Two things make that
   smooth, and they are the same two that make the hero work:

     1. dedicated scrub masters with a 4-frame GOP (dev/encode-study.sh).
        The shipped light-*.mp4 files carry one keyframe every ~94 frames,
        which costs up to three seconds of decode per seek — fine for
        playback, unusable for scrubbing.
     2. never queueing a seek while the decoder is still resolving the last
        one, and damping the target so a flick cannot pile seeks up.

   Its own instance rather than a shared one: the hero's engine is a
   singleton holding a single element, and both sections are alive at once
   in ScrollTrigger's eyes.
   ============================================================ */
window.CD = window.CD || {};

CD.studyVideo = (function () {
  'use strict';

  var video = null;
  var duration = 0;
  var targetT = 0;       // seconds the scroll wants
  var easedT = 0;        // damped playhead
  var ready = false;
  var primed = false;
  var EPS = 0.01;

  function isCoarse() {
    return window.matchMedia('(hover: none)').matches || window.innerWidth <= 860;
  }

  /* Sized off the frame the clip is actually laid out at, not the viewport:
     a wide-and-short laptop renders the 16:9 frame far wider than its own
     width, and a narrow viewport letterboxes it far narrower. Mirrors the
     box in sections.css and the measurements in study/visual.js. */
  function pickSource(v) {
    var vw = window.innerWidth, vh = window.innerHeight;
    var narrow = vw <= 900 && vh > vw * 0.9;
    var frame = narrow ? Math.min(vw, vh * 16 / 9) * 1.2
                       : Math.max(vw, vh * 16 / 9);
    var need = frame * (window.devicePixelRatio > 1.5 ? 1.3 : 1);
    var file = need >= 1150 ? 'light-scrub-1280.mp4'
             : need >= 820  ? 'light-scrub-960.mp4'
             : 'light-scrub-720.mp4';
    v.src = 'assets/video/' + file;
    return file;
  }

  /* A seekable clip has to be buffered, so it cannot be fetched lazily at
     the section's own edge — but nor should it compete with the hero's
     master for the first paint. It starts loading a viewport and a half
     out, which on this page is most of Anatomy of Brilliance. */
  function begin() {
    if (video.src) return;
    pickSource(video);          // assigning src is what starts the fetch
    video.preload = 'auto';
    video.load();
  }

  function loadWhenNear(section) {
    if (!('IntersectionObserver' in window)) { begin(); return; }
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      begin();
    }, { rootMargin: '150% 0px 150% 0px' });
    io.observe(section || video);
  }

  /* iOS keeps a seeked-but-never-played muted video blank until it has
     painted once, so prime it on the first interaction. */
  function prime() {
    if (primed || !video) return;
    primed = true;
    var p = video.play();
    if (p && p.then) p.then(function () { video.pause(); }).catch(function () {});
    else { try { video.pause(); } catch (e) {} }
  }

  function init(el, section) {
    video = el;
    if (!video) return null;
    EPS = isCoarse() ? 0.024 : 0.008;

    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.preload = 'none';     // until the section is in reach — see begin()
    video.removeAttribute('loop');
    video.removeAttribute('controls');

    video.addEventListener('loadedmetadata', function () {
      duration = video.duration || 0;
      ready = duration > 0;
      if (ready) { try { video.currentTime = 0.001; } catch (e) {} }
    });
    video.addEventListener('loadeddata', function () {
      video.classList.add('is-ready');
    });

    ['touchstart', 'pointerdown', 'wheel', 'keydown'].forEach(function (evt) {
      window.addEventListener(evt, prime, { once: true, passive: true });
    });

    loadWhenNear(section);
    return api;
  }

  /* called by the orchestrator with the playhead the timeline asked for */
  function setTime(t) { targetT = t; }

  /* runs on the GSAP ticker, decoupled from the scroll event rate */
  function tick() {
    if (!ready || !video) return;
    easedT += (targetT - easedT) * 0.18;
    if (Math.abs(targetT - easedT) < 0.004) easedT = targetT;

    if (video.seeking) return;                       // decoder still busy
    var t = Math.max(0, Math.min(duration - 0.05, easedT));
    if (Math.abs(video.currentTime - t) < EPS) return;
    try { video.currentTime = t; } catch (e) {}
  }

  /* reduced motion: park on one representative frame and never seek again */
  function staticFrame(at) {
    if (!video) return;
    begin();
    var apply = function () {
      try { video.currentTime = (video.duration || 8) * (at == null ? 0.62 : at); } catch (e) {}
    };
    if (video.readyState >= 1) apply();
    else video.addEventListener('loadedmetadata', apply, { once: true });
  }

  var api = { init: init, setTime: setTime, tick: tick, staticFrame: staticFrame };
  return api;
})();
