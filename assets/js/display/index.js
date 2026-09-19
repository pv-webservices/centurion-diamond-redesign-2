/* 07 / Centurion at Retail. Experience hands off into the original blush
   lighting rig, then the registered display progression meets the locked finale. */
window.CD = window.CD || {};

CD.initDisplay = function initDisplay() {
  'use strict';

  var root = document.getElementById('display');
  if (!root || root.hidden || typeof gsap === 'undefined' || !CD.display) return;

  if (root.dataset.mounted) return;
  root.dataset.mounted='true';
  var cfg = CD.display;
  var assets=CD.retailAssets;
  cfg.hasTen=!!assets.ten.src;
  cfg.hasExpansion=!!(assets.ten.src && assets.twentyFive.src);
  root.dataset.retailMode=cfg.hasExpansion?'10-to-25':cfg.hasTen?'10-piece':'reference';
  var first=root.querySelector('[data-dsp-case] img');
  var source=cfg.hasTen?assets.ten:assets.reference;
  first.src=source.src;
  if(source.srcset)first.srcset=source.srcset;else first.removeAttribute('srcset');
  first.alt=cfg.hasTen?'Approved Centurion ten-piece display':'Existing Centurion retail presentation reference';
  if(cfg.hasExpansion){
    var figure=root.querySelector('[data-dsp-case]').cloneNode(true);
    figure.setAttribute('data-dsp-expansion','');
    var image=figure.querySelector('img');image.src=assets.twentyFive.src;
    if(assets.twentyFive.srcset)image.srcset=assets.twentyFive.srcset;else image.removeAttribute('srcset');
    image.alt='Approved Centurion twenty-five-piece display';
    root.querySelector('.dsp__stage').insertBefore(figure,root.querySelector('[data-dsp-intro]'));
  }
  var titles=root.querySelectorAll('[data-dsp-scene] .dsp__t');
  var bodies=root.querySelectorAll('[data-dsp-scene] .dsp__b');
  if(cfg.hasTen){titles[0].innerHTML='<span class="dsp__ln"><span>10 pieces.</span></span><span class="dsp__ln"><span class="is-em">One experience.</span></span>';}
  if(cfg.hasExpansion){titles[1].innerHTML='<span class="dsp__ln"><span>25 pieces.</span></span><span class="dsp__ln"><span class="is-em">The complete presentation.</span></span>';bodies[1].textContent='The Centurion retail experience, expanded.';}

  var T = CD.displayTimeline;
  var V = CD.displayVisual;
  var el = V.mount(root);
  if (!el.stage) return;

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Keep the progress renderer tied to the single CSS brand token. */
  var brandRgb = getComputedStyle(document.documentElement).getPropertyValue('--brand-blush-rgb').trim().split(',');
  if (brandRgb.length === 3) cfg.room.tint = [Number(brandRgb[0]), Number(brandRgb[1]), Number(brandRgb[2])];

  /* ---------- reduced motion: no pin, no light ----------
     The chapter becomes the case, its two photographs and its copy in
     document order, on a still, softly blush-lit ground. */
  if (REDUCED) {
    root.classList.add('is-reduced');
    el.stage.style.backgroundColor = 'rgb(55,39,42)';
    return;
  }

  var narrow = window.matchMedia('(max-width: 900px)').matches;
  var state  = T.createState(cfg);

  ScrollTrigger.create({
    trigger: root,
    start: 'top top',
    end: 'bottom bottom',
    pin: el.stage,
    pinSpacing: false,
    anticipatePin: 1,
    onUpdate: function (self) {
      V.render(el, T.frame(cfg, self.progress, narrow, state));
    }
  });

  window.addEventListener('resize', function () {
    narrow = window.matchMedia('(max-width: 900px)').matches;
  }, { passive: true });

  V.render(el, T.frame(cfg, 0, narrow, state));
};
