/* Approved source slots. Null means unavailable: never relabel another cut.
   Cut photographs are the client's own 100-facet stones (Centurion deck),
   background-isolated. Every scene reads this one manifest. */
window.CD = window.CD || {};
(function () {
  function cut(key, name) {
    var base = 'assets/img/diamond-shapes/' + key;
    return { key: key, name: name, src: base + '-480.webp', srcset: base + '-480.webp 480w, ' + base + '-960.webp 960w' };
  }
  /* Every 100-facet cut in the deck. */
  CD.diamondFamily = [
    cut('round', 'Round'), cut('oval', 'Oval'), cut('radiant', 'Radiant'),
    cut('elongated-cushion', 'Elongated Cushion'), cut('marquise', 'Marquise'),
    cut('emerald', 'Emerald'), cut('pear', 'Pear'), cut('heart', 'Heart'), cut('princess', 'Princess')
  ];
  /* The feature rotation, in the order the client asked for. */
  CD.diamondShapes = CD.diamondFamily.slice(0, 5);
})();
CD.retailAssets = {
  /* The 10-piece display: ten stands, ten rings, the same tray as the finale film.
     (display-case-a below has nine stands, so it is only a reference.) */
  ten: { src: 'assets/img/model/display-case-b-800.webp', srcset: 'assets/img/model/display-case-b-560.webp 560w, assets/img/model/display-case-b-800.webp 800w, assets/img/model/display-case-b-1200.webp 1200w' },
  twentyFive: { src: null, slot: 'assets/img/experience/display-25.webp' },
  /* Existing presentation reference only; it is not the approved ten-ring set. */
  reference: { src: 'assets/img/model/display-case-a-800.webp', srcset: 'assets/img/model/display-case-a-560.webp 560w, assets/img/model/display-case-a-800.webp 800w, assets/img/model/display-case-a-1200.webp 1200w' }
};
CD.shapePicture = function (shape, className) {
  var img = document.createElement('img');
  img.className = className || '';
  img.src = shape.src;
  if (shape.srcset) img.srcset = shape.srcset;
  img.sizes = '(max-width:900px) 80vw, 32vw';
  img.alt = shape.name + ' Centurion diamond';
  img.loading = 'lazy'; img.decoding = 'async';
  return img;
};
