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

  /* narrow viewports: one column, stone below the type, no lateral drift */
  mobileStone: { x: 0, yBase: 19, yScale: 0.34, sScale: 0.86 },

  /* aperture close — scale of the iris circle in the SVG mask. 1.4 clears the
     viewport corners on every tested ratio; the seal finishes the last sliver. */
  iris: { from: 1.4, to: 0.03 }
};
