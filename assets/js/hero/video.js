/* ============================================================
   Hero video timeline — scroll-scrubbed cinematic sequence.

   The clip is seeked, never played. Two things make that smooth:
     1. the file is encoded with a 4-frame GOP (see dev/encode-scrub.sh) so a
        seek never has to decode far from a keyframe;
     2. we never queue a seek while the decoder is still resolving the last one,
        and we damp the target so a flick does not pile up seeks.
   Reading progress happens on GSAP's ticker, not on raw scroll events.
   ============================================================ */
window.CD = window.CD || {};

CD.heroVideo = (function () {
  'use strict';

  var video = null;
  var duration = 0;
  var target = 0;      // where scroll wants us
  var eased = 0;       // damped playhead
  var ready = false;
  var primed = false;
  var EPS = 0.01;

  function isCoarse() {
    return window.matchMedia('(hover: none)').matches || window.innerWidth <= 860;
  }

  /* Portrait phones get a dedicated 9:16 master: the full 16:9 composition is
     padded into a portrait canvas with the hero's own near-black, so the frame
     reads full-bleed while the diamond's framing survives. Cropping a landscape
     master to portrait would show ~26% of its width — a slice of the stone. */
  function pickSource(v) {
    var vw = window.innerWidth, vh = window.innerHeight;
    var portrait = vw <= 720 && vh / vw > 1.3;
    var w = vw * (window.devicePixelRatio > 1.5 ? 1.3 : 1);
    var file = portrait ? 'hero-scrub-portrait.mp4'
             : w >= 1200 ? 'hero-scrub-1280.mp4'
             : w >= 900  ? 'hero-scrub-960.mp4'
             : 'hero-scrub-720.mp4';
    if (portrait) v.poster = 'assets/video/hero-scrub-portrait.webp';
    v.src = 'assets/video/' + file;
    return file;
  }

  /* iOS keeps a seeked-but-never-played muted video blank until it has painted
     once, so prime it on the first interaction. */
  function prime() {
    if (primed || !video) return;
    primed = true;
    var p = video.play();
    if (p && p.then) p.then(function () { video.pause(); }).catch(function () {});
    else { try { video.pause(); } catch (e) {} }
  }

  function init(el, opts) {
    video = el;
    if (!video) return null;
    EPS = isCoarse() ? 0.024 : 0.008;

    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.preload = 'auto';
    video.removeAttribute('controls');
    pickSource(video);

    video.addEventListener('loadedmetadata', function () {
      duration = video.duration || 0;
      ready = duration > 0;
      if (ready) video.currentTime = 0.001;
    });
    video.addEventListener('loadeddata', function () {
      video.classList.add('is-ready');
    });

    ['touchstart', 'pointerdown', 'wheel', 'keydown'].forEach(function (evt) {
      window.addEventListener(evt, prime, { once: true, passive: true });
    });

    video.load();
    return api;
  }

  /* called by the orchestrator with master progress 0..1 */
  function setProgress(p) {
    target = Math.max(0, Math.min(1, p));
  }

  /* runs on the GSAP ticker */
  function tick() {
    if (!ready || !video) return;
    // damp toward the target so fast scrolls do not thrash the decoder
    eased += (target - eased) * 0.18;
    if (Math.abs(target - eased) < 0.0005) eased = target;

    if (video.seeking) return;                    // decoder still busy
    var t = eased * (duration - 0.05);
    if (Math.abs(video.currentTime - t) < EPS) return;
    try { video.currentTime = t; } catch (e) {}
  }

  /* reduced motion: park on a representative frame and never seek again */
  function staticFrame(at) {
    if (!video) return;
    var apply = function () {
      try { video.currentTime = (video.duration || 10) * (at == null ? 0.62 : at); } catch (e) {}
    };
    if (video.readyState >= 1) apply();
    else video.addEventListener('loadedmetadata', apply, { once: true });
  }

  var api = { init: init, setProgress: setProgress, tick: tick, staticFrame: staticFrame };
  return api;
})();
