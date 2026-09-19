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
    inA: 0.06, inB: 0.11, outA: 0.29, outB: 0.35
  },
  {
    side: 'right',
    eyebrow: 'Engineered to Perform',
    title: ['Brilliance', 'by', 'design.'],
    body: 'Advanced cutting, proportion and polish reveal the fire within every diamond.',
    inA: 0.35, inB: 0.40, outA: 0.55, outB: 0.60
  },
  {
    side: 'left',
    eyebrow: 'Mastered Craft',
    title: ['100', 'facets of', 'excellence.'],
    body: 'Precision manufacturing meets generations of diamond expertise.',
    inA: 0.60, inB: 0.64, outA: 0.77, outB: 0.81
  },
  {
    side: 'right',
    eyebrow: 'A Global Standard',
    title: ['Crafted for', 'the world.'],
    body: 'Consistency, precision and uncompromising quality from origin to final polish.',
    inA: 0.81, inB: 0.84, outA: 0.92, outB: 0.945
  }
];

/* the closing frame — typography clears, the stone owns the screen */
CD.heroCta = { label: 'Explore our diamonds', href: '#anatomy', inA: 0.93, inB: 0.99 };
