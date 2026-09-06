/* ============================================================
   08 · CENTURION AT RETAIL — responsive frame loading and cache.
   No images are requested until index.js marks the section as near. A small
   preview lattice loads first, then the gaps fill in the background; the
   current scroll target and its neighbours always jump to the front.
   ============================================================ */
window.CD = window.CD || {};

CD.finaleFrames = (function () {
  'use strict';

  function create(cfg, narrow, onReady) {
    var active = null;
    var key = '';
    var records = [];
    var queue = [];
    var inFlight = 0;
    var current = 0;
    var started = false;
    var fillTimer = 0;
    var version = 0;

    function file(index) {
      return active.base + 'retail-' + ('000' + index).slice(-3) + '.webp';
    }

    function enqueue(index, priority) {
      index = Math.max(0, Math.min(active.count - 1, index));
      if (records[index]) {
        /* A background-fill request may already be queued. Promote it when
           scroll makes that frame current instead of waiting behind gaps. */
        if (priority && records[index].status === 'queued') {
          var queuedAt = queue.indexOf(index);
          if (queuedAt >= 0) queue.splice(queuedAt, 1);
          queue.unshift(index);
        }
        return;
      }
      records[index] = { status: 'queued', image: null };
      if (priority) queue.unshift(index); else queue.push(index);
    }

    function pump() {
      while (inFlight < cfg.preload.concurrency && queue.length) {
        load(queue.shift());
      }
    }

    function load(index) {
      var token = version;
      var record = records[index];
      var image = new Image();
      var settled = false;
      record.status = 'loading';
      inFlight++;
      image.decoding = 'async';

      function finish(ok) {
        if (settled) return;
        settled = true;
        if (token !== version) return;
        inFlight--;
        record.status = ok ? 'ready' : 'error';
        record.image = ok ? image : null;
        if (ok && onReady) onReady(index);
        pump();
      }

      image.onload = function () {
        if (image.decode) image.decode().then(function () { finish(true); }, function () { finish(true); });
        else finish(true);
      };
      image.onerror = function () { finish(false); };
      image.src = file(index);
    }

    function fill() {
      for (var radius = 0; radius < active.count; radius++) {
        enqueue(current + radius, false);
        if (radius) enqueue(current - radius, false);
      }
      pump();
    }

    function start() {
      if (started) return;
      started = true;
      enqueue(active.count - 1, true);
      for (var i = cfg.preload.previewStride; i < active.count - 1; i += cfg.preload.previewStride) enqueue(i, false);
      enqueue(0, true);
      pump();
      fillTimer = window.setTimeout(fill, cfg.preload.fillDelay);
    }

    function request(index) {
      current = Math.max(0, Math.min(active.count - 1, index));
      if (!started) return;
      enqueue(current + 2, true);
      enqueue(current - 2, true);
      enqueue(current + 1, true);
      enqueue(current - 1, true);
      enqueue(current, true);
      pump();
    }

    function nearest(index) {
      for (var radius = 0; radius < active.count; radius++) {
        var lo = index - radius, hi = index + radius;
        if (lo >= 0 && records[lo] && records[lo].status === 'ready') return { index: lo, image: records[lo].image };
        if (hi < active.count && hi !== lo && records[hi] && records[hi].status === 'ready') return { index: hi, image: records[hi].image };
      }
      return null;
    }

    function select(isNarrow) {
      var nextKey = isNarrow ? 'mobile' : 'desktop';
      if (nextKey === key) return false;
      var restart = started;
      if (fillTimer) window.clearTimeout(fillTimer);
      version++;
      key = nextKey;
      active = cfg.sets[key];
      records = new Array(active.count);
      queue = [];
      inFlight = 0;
      current = Math.min(current, active.count - 1);
      started = false;
      if (restart) start();
      return true;
    }

    function destroy() {
      version++;
      queue.length = 0;
      if (fillTimer) window.clearTimeout(fillTimer);
    }

    select(narrow);
    return {
      start: start,
      request: request,
      nearest: nearest,
      select: select,
      set: function () { return active; },
      count: function () { return active.count; },
      started: function () { return started; },
      destroy: destroy
    };
  }

  return { create: create };
})();
