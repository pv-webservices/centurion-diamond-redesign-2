/* ============================================================
   07 · WORN — content timing + choreography, in master-progress
   space (0..1).

   The copy lives in index.html so the chapter still reads with scripting
   off; everything that *moves* is described here.

   The chapter's one idea: the photographs arrive in the page's own
   monochrome and find their colour as it goes, then gather into a spread.
   The ground stays on `--ink` throughout — the Collection above hands off
   to it, the Metals chapter below opens on it, and holding it means the
   type never has to cross a contrast boundary mid-sentence. The colour
   arrives in the pictures, which is the only place it can honestly come
   from: this is studio photography, not candlelight.

   Copy is the deck's own and the wording already approved on the site.
   ============================================================ */
window.CD = window.CD || {};

CD.worn = {

  beats: {
    intro:  { inA: 0.020, inB: 0.082, outA: 0.104, outB: 0.152 },
    scenes: [
      { inA: 0.140, inB: 0.232, outA: 0.300, outB: 0.358 },   // 01 · looked at twice
      { inA: 0.382, inB: 0.470, outA: 0.545, outB: 0.602 }    // 02 · works indoors
    ],
    /* the payoff: every moment the chapter has shown, at once, in colour */
    gather: { inA: 0.646, inB: 0.744, outA: 0.888, outB: 0.934 },
    /* a thin rule that draws under the gathered spread */
    rule:   { inA: 0.700, inB: 0.790, outA: 0.900, outB: 0.948 }
  },

  /* Monochrome to full colour. Not a per-plate value — the whole chapter
     finds its colour together, so it reads as one idea rather than six. */
  colour: [
    { p: 0.100, v: 0.00 },
    { p: 0.380, v: 0.12 },
    { p: 0.560, v: 0.42 },
    { p: 0.720, v: 1.00 },
    { p: 1.000, v: 1.00 }
  ],

  /* The ground barely moves — just enough that it is not literally static.
     Both ends are the page's ink, which is what makes both seams free. */
  bgStops: [
    { p: 0.00, c: [10, 10, 11] },
    { p: 0.50, c: [17, 15, 16] },
    { p: 0.86, c: [20, 18, 19] },
    { p: 1.00, c: [10, 10, 11] }
  ],

  /* Each plate has two poses and a window.
       `feat`  its moment, when it holds the frame
       `home`  where it settles, and where the gather brings it back up
     x/y are vw/vh from the stage centre, w is vw, r degrees.

     Both sets keep clear of the type: a `feat` pose sits opposite its
     scene's copy column, and the `home` poses ring the centre so the
     closing statement has the middle of the frame to itself.
     `in` is where it first appears; plates featured in a scene arrive with
     that scene, the last two arrive straight into the gather. */
  plates: [
    { key: 'cheek', role: 'lead', scene: 0, in: 0.118,
      feat: { x: -21, y:  -1, w: 27, r: -1.5 },
      home: { x: -34, y: -17, w: 13, r: -2.0 } },
    { key: 'silk', role: 'sub', scene: 0, in: 0.168,
      feat: { x:  26, y:  28, w: 24, r:  1.8 },
      home: { x: -32, y:  17, w: 19, r:  1.5 } },
    { key: 'coat', role: 'lead', scene: 1, in: 0.360,
      feat: { x:  20, y:   4, w: 30, r:  1.5 },
      home: { x:  33, y: -18, w: 15, r:  2.0 } },
    { key: 'shirt', role: 'sub', scene: 1, in: 0.408,
      feat: { x:  36, y: -28, w: 10, r: -2.5 },
      home: { x:  34, y:  18, w: 12, r: -1.5 } },
    { key: 'red',    scene: -1, in: 0.648,
      feat: null,
      home: { x:  -8, y: -27, w: 12, r:  2.5 } },
    { key: 'pinch',  scene: -1, in: 0.688,
      feat: null,
      home: { x:   9, y:  31, w: 10, r: -2.0 } }
  ],

  /* Narrow viewports show one plate at a time, centred, and gather into a
     column rather than a spread — the poses above are lateral by design
     and would shrink to thumbnails. */
  mobile: {
    /* the plates take the top of the frame, the copy the bottom — a lead
       and its partner offset rather than stacked in one pose */
    feat: {
      lead: { x: -4, y: -20, w: 60, r: 0 },
      sub:  { x: 22, y:   2, w: 30, r: 0 }
    },
    /* the gather runs the statement above a 2-wide stack rather than
       around it: there is no room to ring anything on a phone */
    grid: { w: 28, gapX: 32, gapY: 21, y0: -6 }
  },

  /* the plate that leads a scene sits a little proud of its partner */
  depth: { lead: 1, sub: 0.86 }
};
