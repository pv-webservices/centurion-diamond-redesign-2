/* ============================================================
   Sparkle section — content + choreography, in master-progress space (0..1).
   Copy is taken from the client deck; no invented performance claims.
   ============================================================ */
window.CD = window.CD || {};

CD.sparkle = {
  /* dark hero ground -> warm mineral light. Directional values from the brief,
     pulled toward the project's own ink/bone tokens at either end. */
  bgStops: [
    { p: 0.00, c: [10, 10, 11] },     // --ink, continuous with the hero
    { p: 0.07, c: [21, 21, 21] },
    { p: 0.13, c: [92, 90, 88] },
    { p: 0.19, c: [216, 213, 208] },
    { p: 0.26, c: [243, 241, 238] },  // warm mineral, not sterile white
    { p: 0.94, c: [243, 241, 238] },
    { p: 1.00, c: [236, 233, 228] }
  ],

  beats: {
    sweep:      { inA: 0.02, inB: 0.13, outA: 0.15, outB: 0.24 },
    intro:      { inA: 0.10, inB: 0.23, outA: 0.26, outB: 0.33 },
    facet:      { inA: 0.34, inB: 0.45, outA: 0.50, outB: 0.58 },
    compare:    { inA: 0.49, inB: 0.62, outA: 0.80, outB: 0.90 },
    outro:      { inA: 0.86, inB: 0.95 }
  },

  /* the two worlds — approved cut diagrams from the deck */
  cuts: [
    {
      key: 'centurion', side: 'l', label: 'Centurion', count: 100, ticks: 100,
      note: 'Patent-pending geometry',
      img: 'assets/img/brand/cut-centurion-face',
      widths: [301]
    },
    {
      key: 'traditional', side: 'r', label: 'Traditional', count: 57, ticks: 57,
      note: 'The industry standard',
      img: 'assets/img/brand/cut-traditional-face',
      widths: [291]
    }
  ],

  outro: ['More facets.', 'More sparkle.', 'See the difference.']
};
