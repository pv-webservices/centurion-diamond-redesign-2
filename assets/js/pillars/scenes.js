/* ============================================================
   03 · ANATOMY OF BRILLIANCE — content timing + choreography,
   expressed in master-progress space (0..1).

   The four benefit texts live in index.html so the chapter still reads
   without JS; everything that *moves* is described here. One entry per
   scene, one keyframe list for the stone — no per-scene code.

   Copy is the four benefits from the client deck. No invented claims.
   ============================================================ */
window.CD = window.CD || {};

CD.pillars = {
  /* the mineral ground. Opens on exactly the tone the Sparkle section
     closes on, so the two sections share one continuous light. */
  bgStops: [
    { p: 0.00, c: [236, 233, 228] },   // = .spk's final frame
    { p: 0.09, c: [243, 241, 238] },   // warm mineral white
    { p: 0.80, c: [243, 241, 238] },
    { p: 0.90, c: [246, 243, 238] },   // final statement runs a shade warmer
    { p: 1.00, c: [246, 243, 238] }    // the aperture, not the ground, goes dark
  ],

  beats: {
    sweep:    { inA: 0.000, inB: 0.045, outA: 0.070, outB: 0.115 },
    intro:    { inA: 0.035, inB: 0.130, outA: 0.150, outB: 0.198 },
    /* the four scenes divide this window evenly */
    scenes:   { inA: 0.198, outB: 0.800 },
    final:    { inA: 0.808, outB: 0.958 },
    beam:     { inA: 0.946, inB: 0.966, outA: 0.972, outB: 0.996 },
    aperture: { inA: 0.950, inB: 0.994 },
    seal:     { inA: 0.982, inB: 1.000 }
  },

  /* per-scene choreography. `motion` selects the reveal treatment, `side`
     the desktop composition. Mobile ignores `side` and centres everything. */
  scenes: [
    { key: 'facets',     side: 'left',   motion: 'rise'  },
    { key: 'brilliance', side: 'right',  motion: 'clip'  },
    { key: 'elegance',   side: 'left',   motion: 'slide' },
    { key: 'gimmick',    side: 'center', motion: 'scale' }
  ],

  /* The only cut families in the current Collection. Each name maps in DOM
     order to a supplied, background-isolated product photograph. */
  shapes: {
    inA: 0.205,
    outB: 0.790,
    items: [
      { name: 'Round' },
      { name: 'Oval' },
      { name: 'Radiant' },
      { name: 'Emerald' },
      { name: 'Cushion' }
    ]
  },

  /* the stone is one continuous object across the chapter — these are the
     poses it passes through, lerped with a smoothstep between neighbours.
     x is vw, y is vh, r is degrees, o is opacity, sh is sheen intensity. */
  stone: [
    { p: 0.110, x:   4, y:  12, s: 0.66, r: -7, o: 0.00, sh: 0 },
    { p: 0.235, x:  25, y:   5, s: 0.90, r: -4, o: 1.00, sh: 1 },   // 01 · right
    { p: 0.312, x:  26, y:  -1, s: 0.97, r: -1, o: 1.00, sh: 0 },
    { p: 0.362, x:  -4, y:   2, s: 1.05, r:  1, o: 0.88, sh: 0 },   // crossing
    { p: 0.409, x: -24, y:   3, s: 1.13, r:  3, o: 1.00, sh: 1 },   // 02 · left, closer
    { p: 0.470, x: -25, y:   0, s: 1.21, r:  5, o: 1.00, sh: 0 },
    { p: 0.559, x:  30, y:  15, s: 0.88, r:  8, o: 1.00, sh: 0 },   // 03 · off-axis
    { p: 0.625, x:  29, y:  17, s: 0.85, r:  9, o: 0.92, sh: 0 },
    { p: 0.710, x:   1, y:  31, s: 0.62, r:  3, o: 0.20, sh: 0 },   // 04 · subdued, low
    { p: 0.780, x:   1, y:  30, s: 0.64, r:  2, o: 0.20, sh: 0 },   // holds low while 04 clears
    { p: 0.860, x:   0, y:  16, s: 0.84, r:  0, o: 0.34, sh: 0 },   // returns to centre
    { p: 0.945, x:   0, y:  11, s: 0.92, r:  0, o: 0.40, sh: 0 },   // backdrop to the statements
    { p: 0.975, x:   0, y:   0, s: 1.04, r:  0, o: 1.00, sh: 1 },   // type clears, stone owns the frame
    { p: 1.000, x:   0, y:  -1, s: 1.10, r:  0, o: 1.00, sh: 0 }
  ],

  /* Narrow viewports get their own pose track rather than a squashed copy of
     the desktop one. Same `p` markers, so the sheen still fires on the same
     legs — but the composition is corner-to-corner in portrait: the copy
     takes one corner (see the .plr mobile block in sections.css) and the
     stone takes the opposite one, swapping between benefits. That is the
     desktop's left/right recomposition turned through 90 degrees, not a
     stacked article. */
  mobileStone: [
    { p: 0.110, x:   0, y:  30, s: 0.70, r:  0, o: 0.00, sh: 0 },
    { p: 0.235, x:  13, y:  26, s: 0.92, r: -2, o: 1.00, sh: 1 },   // 01 · lower-right
    { p: 0.312, x:  14, y:  24, s: 0.96, r: -1, o: 1.00, sh: 0 },
    { p: 0.362, x:   0, y:  25, s: 1.00, r:  0, o: 0.86, sh: 0 },   // crossing
    { p: 0.409, x: -13, y:  26, s: 1.02, r:  2, o: 1.00, sh: 1 },   // 02 · lower-left
    { p: 0.470, x: -14, y:  24, s: 1.06, r:  3, o: 1.00, sh: 0 },
    { p: 0.559, x:  13, y: -25, s: 0.88, r: -3, o: 1.00, sh: 0 },   // 03 · upper-right
    { p: 0.625, x:  14, y: -27, s: 0.86, r: -3, o: 0.92, sh: 0 },
    { p: 0.710, x:   0, y:  21, s: 0.82, r:  0, o: 0.22, sh: 0 },   // 04 · subdued, under the copy
    { p: 0.780, x:   0, y:  20, s: 0.84, r:  0, o: 0.22, sh: 0 },   // holds while 04 clears
    { p: 0.860, x:   0, y:  13, s: 0.94, r:  0, o: 0.32, sh: 0 },   // returns to centre
    { p: 0.945, x:   0, y:  10, s: 1.02, r:  0, o: 0.38, sh: 0 },   // backdrop to the statements
    { p: 0.975, x:   0, y:   0, s: 1.18, r:  0, o: 1.00, sh: 1 },   // type clears, stone owns the frame
    { p: 1.000, x:   0, y:  -1, s: 1.26, r:  0, o: 1.00, sh: 0 }
  ],

  /* aperture close — scale of the iris circle in the SVG mask. 1.4 clears the
     viewport corners on every tested ratio; the seal finishes the last sliver. */
  iris: { from: 1.4, to: 0.03 }
};
