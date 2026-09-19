/* ============================================================
   08 · CENTURION AT RETAIL — one canvas and restrained overlays.
   Canvas sizing is isolated here; the timeline never reads layout.
   ============================================================ */
window.CD = window.CD || {};

CD.finaleVisual = (function () {
  'use strict';

  function mount(root) {
    var canvas = root.querySelector('[data-fin-canvas]');
    return {
      stage: root.querySelector('.fin__stage'),
      media: root.querySelector('[data-fin-media]'),
      canvas: canvas,
      ctx: canvas.getContext('2d', { alpha: false, desynchronized: true }),
      poster: root.querySelector('.fin__poster'),
      vig: root.querySelector('[data-fin-vig]'),
      blush: root.querySelector('[data-fin-blush]'),
      sweep: root.querySelector('[data-fin-sweep]'),
      copy: root.querySelector('[data-fin-copy]'),
      eyebrow: root.querySelector('[data-fin-eyebrow]'),
      lines: Array.prototype.slice.call(root.querySelectorAll('.fin__line > span')),
      body: root.querySelector('[data-fin-body]'),
      cta: root.querySelector('[data-fin-cta]'),
      progress: root.querySelector('[data-fin-progress]'),
      progressBar: root.querySelector('[data-fin-progress-bar]'),
      progressValue: root.querySelector('[data-fin-progress-value]'),
      width: 0,
      height: 0,
      dpr: 1,
      narrow: false,
      lastDrawn: -1
    };
  }

  function resize(el, set, narrow) {
    var rect = el.media.getBoundingClientRect();
    var width = Math.max(1, Math.round(rect.width));
    var height = Math.max(1, Math.round(rect.height));
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var pixelWidth = Math.round(width * dpr);
    var pixelHeight = Math.round(height * dpr);
    el.narrow = narrow;
    el.width = width;
    el.height = height;
    el.dpr = dpr;
    if (el.canvas.width !== pixelWidth || el.canvas.height !== pixelHeight) {
      el.canvas.width = pixelWidth;
      el.canvas.height = pixelHeight;
      el.lastDrawn = -1;
    }
    el.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw(el, frame) {
    if (!frame || frame.index === el.lastDrawn) return;
    var image = frame.image;
    var iw = image.naturalWidth || image.width;
    var ih = image.naturalHeight || image.height;
    var scale = el.narrow
      ? Math.min(el.width / iw, el.height / ih)
      : Math.max(el.width / iw, el.height / ih);
    var width = iw * scale;
    var height = ih * scale;
    el.ctx.fillStyle = '#0A0A0B';
    el.ctx.fillRect(0, 0, el.width, el.height);
    el.ctx.drawImage(image, (el.width - width) / 2, (el.height - height) / 2, width, height);
    el.lastDrawn = frame.index;
    el.canvas.dataset.frame = frame.index;
    el.canvas.classList.add('is-ready');
  }

  function reveal(node, value, distance) {
    node.style.opacity = value.toFixed(3);
    node.style.transform = 'translate3d(0,' + ((1 - value) * distance).toFixed(2) + 'px,0)';
  }

  function render(el, f, frames) {
    frames.request(f.frame);
    draw(el, frames.nearest(f.frame));

    el.media.style.opacity = f.media.v.toFixed(3);
    el.media.style.transform = 'scale(' + f.media.scale.toFixed(4) + ')';
    /* 75% of the frame's half-diagonal clears every corner */
    el.media.style.clipPath = f.media.iris >= 1 ? 'none'
      : 'circle(' + (6 + 69 * f.media.iris).toFixed(2) + '% at 50% 50%)';
    el.vig.style.opacity = f.vig.toFixed(3);
    el.blush.style.opacity = f.blush.toFixed(3);
    el.sweep.style.opacity = f.sweep.v.toFixed(3);
    el.sweep.style.transform = 'translate3d(' + f.sweep.x.toFixed(2) + 'vw,0,0) skewX(-14deg)';

    el.copy.style.setProperty('--fin-scrim', f.copy.scrim.toFixed(3));
    reveal(el.eyebrow, f.copy.eyebrow, 14);
    for (var i = 0; i < el.lines.length; i++) {
      el.lines[i].style.transform = 'translate3d(0,' + ((1 - f.copy.lines[i]) * 108).toFixed(2) + '%,0)';
    }
    reveal(el.body, f.copy.body, 18);
    reveal(el.cta, f.copy.cta, 16);
    el.cta.style.pointerEvents = f.copy.cta > 0.92 ? 'auto' : 'none';

    el.progressBar.style.transform = 'scaleX(' + f.progress.toFixed(4) + ')';
    var pct = Math.round(f.progress * 100);
    el.progressValue.textContent = pct === 100 ? '100' : ('0' + pct).slice(-2);
  }

  return { mount: mount, resize: resize, render: render };
})();
