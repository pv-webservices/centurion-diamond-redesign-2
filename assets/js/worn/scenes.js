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

  /* ---------------------------------------------------------------- mobile
     A phone runs the chapter as a sequence rather than a contact sheet: one
     photograph owns the frame at a time, in the order the plates appear in
     the markup, and the copy rides in the negative space of the two it has
     something to say about. The desktop spread would shrink to thumbnails
     here — six 12vw plates on a 390px screen are 47px wide — so the same
     six pictures are given six moments instead of one crowded one.

     Windows are the chapter's own progress space. `w` is vw; the crop
     itself is `--mar` / `--mpos` on the figure in index.html, so the
     framing of each photograph is stated next to the photograph.

     `enter` names the reveal. They differ per plate deliberately — a
     sequence of six identical fades is a slideshow, not a film — but each
     is one gesture, not a stack of them. */
  mobile: {
    /* the colour arrives earlier than on desktop: a full-frame photograph
       held at 12% saturation reads as a fault rather than as an idea */
    colour: [
      { p: 0.100, v: 0.00 },
      { p: 0.300, v: 0.18 },
      { p: 0.460, v: 0.58 },
      { p: 0.620, v: 1.00 },
      { p: 1.000, v: 1.00 }
    ],

    beats: {
      intro:  { inA: 0.018, inB: 0.078, outA: 0.098, outB: 0.136 },
      scenes: [
        { inA: 0.312, inB: 0.362, outA: 0.392, outB: 0.432 },   // 01 · over the second plate
        { inA: 0.600, inB: 0.650, outA: 0.680, outB: 0.720 }    // 02 · over the fourth
      ],
      /* the closing statement plays over the last plate, which never leaves */
      gather: { inA: 0.876, inB: 0.928, outA: 0.982, outB: 1.000 },
      rule:   { inA: 0.900, inB: 0.948, outA: 0.984, outB: 1.000 }
    },

    plates: [
      { win: { inA: 0.118, inB: 0.186, outA: 0.256, outB: 0.298 },
        pose: { x: 0, y:  -2, w:  94, r: 0 }, enter: 'clipUp'     },
      { win: { inA: 0.268, inB: 0.332, outA: 0.402, outB: 0.446 },
        pose: { x: 0, y: -15, w:  92, r: 0 }, enter: 'slideRight' },   // copy below
      { win: { inA: 0.414, inB: 0.478, outA: 0.544, outB: 0.588 },
        pose: { x: 0, y:  -1, w:  96, r: 0 }, enter: 'scale'      },
      { win: { inA: 0.556, inB: 0.620, outA: 0.688, outB: 0.732 },
        pose: { x: 0, y:  15, w:  92, r: 0 }, enter: 'slideLeft'  },   // copy above
      { win: { inA: 0.700, inB: 0.762, outA: 0.822, outB: 0.862 },
        pose: { x: 0, y:  -1, w:  94, r: 0 }, enter: 'clipDown'   },
      { win: { inA: 0.830, inB: 0.892, outA: null,  outB: null   },
        pose: { x: 0, y:   0, w: 100, r: 0 }, enter: 'push'       }    // full bleed, holds
    ]
  },

  /* the plate that leads a scene sits a little proud of its partner */
  depth: { lead: 1, sub: 0.86 }
};
