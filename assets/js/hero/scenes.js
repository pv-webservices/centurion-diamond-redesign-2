/* ============================================================
   Hero narrative data.
   Windows are in master-progress space (0..1) across the pinned hero:
     inA -> inB   the statement animates in
     outA -> outB the statement animates out
   Keeping this data-driven means the markup is generated once and the
   choreography is tuned here, not by duplicating DOM.
   ============================================================ */
window.CD = window.CD || {};
CD.heroScenes = [
  {
    side: 'left',
    eyebrow: '100 Facets of Brilliance',
    title: ['Precision', 'in every', 'facet.'],
    body: 'From exceptional rough to masterfully finished diamonds, every facet is shaped by precision.',
    inA: 0.06, inB: 0.19, outA: 0.25, outB: 0.35
  },
  {
    side: 'right',
    eyebrow: 'Engineered to Perform',
    title: ['Brilliance', 'by', 'design.'],
    body: 'Advanced cutting, proportion and polish reveal the fire within every diamond.',
    inA: 0.33, inB: 0.45, outA: 0.51, outB: 0.61
  },
  {
    side: 'left',
    eyebrow: 'Mastered Craft',
    title: ['100', 'facets of', 'excellence.'],
    body: 'Precision manufacturing meets generations of diamond expertise.',
    inA: 0.59, inB: 0.70, outA: 0.74, outB: 0.82
  },
  {
    side: 'right',
    eyebrow: 'A Global Standard',
    title: ['Crafted for', 'the world.'],
    body: 'Consistency, precision and uncompromising quality from origin to final polish.',
    inA: 0.78, inB: 0.86, outA: 0.90, outB: 0.945
  }
];

/* the closing frame — typography clears, the stone owns the screen */
CD.heroCta = { label: 'Explore our diamonds', href: '#collection', inA: 0.93, inB: 0.99 };
