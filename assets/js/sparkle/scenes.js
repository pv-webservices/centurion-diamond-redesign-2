/* ============================================================
   03 · THE CENTURION CUT — see the difference.
   Master progress 0..1 across the pinned stage. Every beat has an entrance,
   a long hold and an exit, so nothing reads as rushed (client note: "the
   scroll after this is too fast").
   Copy is the client deck's; no invented claims.
   ============================================================ */
window.CD = window.CD || {};

CD.sparkle = {
  /* ground: the Journey's ink -> warm mineral light. It ends on exactly the
     tone Anatomy of Brilliance opens on, so the two read as one space. */
  bgStops: [
    { p: 0.00, c: [21, 18, 19] },     // --ink, continuous with the Journey
    { p: 0.05, c: [30, 26, 27] },
    { p: 0.11, c: [110, 105, 102] },
    { p: 0.17, c: [222, 218, 212] },
    { p: 0.22, c: [243, 241, 238] },
    { p: 0.90, c: [243, 241, 238] },
    { p: 1.00, c: [236, 233, 228] }   // = Anatomy's first frame
  ],
  /* type colour follows the ground: bone on dark, graphite on light */
  inkLight: [244, 241, 234],
  inkDark: [26, 25, 23],
  inkSwitch: [0.10, 0.16],

  beats: {
    sweep:   { inA: 0.02, inB: 0.10, outA: 0.13, outB: 0.21 },
    intro:   { inA: 0.03, inB: 0.08, outA: 0.20, outB: 0.24 },
    single:  { inA: 0.24, inB: 0.30 },                 // traditional 57 arrives, centred
    wipe:    { inA: 0.34, inB: 0.56 },                 // Centurion 100 wipes over it; count 57 -> 100
    split:   { inA: 0.62, inB: 0.70 },                 // the two side by side
    lede:    { inA: 0.68, inB: 0.73, outA: 0.80, outB: 0.83 },
    pairOut: { inA: 0.80, inB: 0.85 },
    outro:   { inA: 0.84, inB: 0.89 }                  // See the difference, held to the end
  },
  counts: { from: 57, to: 100 }
};
