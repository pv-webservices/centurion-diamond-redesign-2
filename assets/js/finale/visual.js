/* ============================================================
   11 · RETAIL FINALE — DOM mount and compositor-only rendering.
   ============================================================ */
window.CD = window.CD || {};

CD.finaleVisual = (function () {
  'use strict';

  function mount(root) {
    var ringLayer = root.querySelector('[data-fin-rings]');
    var products = document.querySelectorAll('#collection figure.cl[data-cl="product"]');
    var rings = [];

    Array.prototype.forEach.call(products, function (product) {
      var source = product.querySelector('.cl__stone img');
      if (!source) return;
      var figure = document.createElement('figure');
      figure.className = 'fin__ring';
      figure.setAttribute('aria-hidden', 'true');
      figure.dataset.cut = product.dataset.cut || '';
      figure.dataset.metal = product.dataset.metal || '';
      var image = source.cloneNode(true);
      image.alt = '';
      image.setAttribute('sizes', '(max-width:900px) 30vw, 16vw');
      figure.appendChild(image);
      ringLayer.appendChild(figure);
      rings.push(figure);
    });

    return {
      stage: root.querySelector('.fin__stage'),
      glow: root.querySelector('[data-fin-glow]'),
      case: root.querySelector('[data-fin-case]'),
      caseImg: root.querySelector('.fin__case-img'),
      rings: rings,
      copy: root.querySelector('[data-fin-copy]'),
      cta: root.querySelector('[data-fin-cta]')
    };
  }

  function render(el, f) {
    el.glow.style.opacity = f.glow.toFixed(3);
    el.case.style.opacity = f.case.o.toFixed(3);
    el.case.style.transform = 'translate3d(-50%,calc(-50% + ' + f.case.y.toFixed(2) + 'vh),0) scale(' + f.case.s.toFixed(4) + ')';
    el.caseImg.style.opacity = (0.72 + f.case.crisp * 0.28).toFixed(3);

    for (var i = 0; i < el.rings.length; i++) {
      var r = f.rings[i], node = el.rings[i];
      node.style.opacity = r.o.toFixed(3);
      node.style.visibility = r.o < .003 ? 'hidden' : 'visible';
      node.style.transform = 'translate3d(calc(-50% + ' + r.x.toFixed(2) + 'vw),calc(-50% + ' + r.y.toFixed(2) + 'vh),0) scale(' + r.s.toFixed(4) + ') rotate(' + r.r.toFixed(2) + 'deg)';
    }

    el.copy.style.opacity = f.copy.v.toFixed(3);
    el.copy.style.visibility = f.copy.v < .003 ? 'hidden' : 'visible';
    el.copy.style.transform = 'translate3d(0,' + f.copy.y.toFixed(2) + 'px,0)';
    el.copy.style.pointerEvents = f.copy.v > .92 ? 'auto' : 'none';
    el.cta.style.pointerEvents = f.copy.v > .92 ? 'auto' : 'none';
  }

  return { mount: mount, render: render };
})();
