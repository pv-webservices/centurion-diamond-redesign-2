/* ============================================================
   04 · A STUDY IN LIGHT — content timing + choreography,
   expressed in master-progress space (0..1).

   The copy itself lives in index.html so the chapter still reads with
   scripting off. Everything that *moves* is described here: the beat
   windows, the aperture keyframes, and the map from scroll progress to
   the clip's own playhead. Retiming the section needs nothing else.

   Copy is the deck's own and the wording already approved on the site.
   No invented optics, no invented numbers.
   ============================================================ */
window.CD = window.CD || {};

CD.study = {

  /* ---------------------------------------------------------- beats
     One scene owns the frame at a time. `inA/inB` ease in, `outA/outB`
     ease out — the same window shape the hero and Anatomy use. */
  beats: {
    intro:  { inA: 0.025, inB: 0.078, outA: 0.104, outB: 0.156 },
    scenes: [
      { inA: 0.135, inB: 0.214, outA: 0.256, outB: 0.312 },   // 01 · light enters
      { inA: 0.452, inB: 0.528, outA: 0.570, outB: 0.626 },   // 02 · light moves
      { inA: 0.630, inB: 0.706, outA: 0.736, outB: 0.784 },   // 03 · light returns
      { inA: 0.782, inB: 0.842, outA: 0.856, outB: 0.884 },   // 04 · 100 facets
      { inA: 0.880, inB: 0.918, outA: 0.930, outB: 0.952 }    // 05 · the proposition
    ],

    /* the aperture's own hairline: it strikes out of the dark, recedes to a
       frame, and returns as the shutters close on it */
    edge:   { open: [0.005, 0.060], settle: [0.080, 0.220],
              close: [0.940, 0.978], gone: [0.980, 0.992] },

    /* the light bar that crosses the stone while "light moves" holds */
    beam:   { inA: 0.428, inB: 0.482, outA: 0.556, outB: 0.612 },

    /* the closing beam — converged line, dropped to the stage foot, then
       streaked left so the marquee below inherits its direction */
    exit:   { on: [0.972, 0.984], drop: [0.974, 0.996],
              run: [0.980, 1.000], off: [0.994, 1.000] }
  },

  /* ---------------------------------------------------------- optics
     Technical traces, each held for a short beat and never more than one
     idea at a time. Nothing here states a measurement. */
  optics: {
    rule:    { inA: 0.404, inB: 0.470, outA: 0.560, outB: 0.612 },  // measurement rule
    points:  { inA: 0.444, inB: 0.500, outA: 0.548, outB: 0.598 },  // facet light points
    reticle: { inA: 0.618, inB: 0.678, outA: 0.716, outB: 0.768 },  // observation rings
    facets:  { inA: 0.748, inB: 0.812, outA: 0.856, outB: 0.898 }   // the facet traces
  },
  facetTicks: 32,          // traces around the ring — a texture, not a count

  /* ---------------------------------------------------------- the stage
     One continuous object across the chapter. The aperture is four ink
     shutters; `tb` is the top/bottom pair as a fraction of stage height,
     `sl`/`sr` the side pair as a fraction of stage width. 0.5 is shut.

     The video never moves to make room for type — the aperture does, and
     the frame re-centres itself on the open window. That is what keeps the
     stone whole while the copy alternates sides.

     `s` is headroom, not an absolute scale: the frame is fitted to cover
     the open window first, then multiplied by this. 1.00 is an exact fit;
     above it crops into the frame for presence.

     o opacity · br brightness · ct contrast
  */
  stage: [
    { p: 0.000, tb: 0.500, sl: 0.000, sr: 0.000, s: 1.06, o: 0.00, br: 0.28, ct: 1.34 },
    { p: 0.070, tb: 0.496, sl: 0.000, sr: 0.000, s: 1.08, o: 0.45, br: 0.32, ct: 1.30 },
    { p: 0.140, tb: 0.440, sl: 0.100, sr: 0.000, s: 1.12, o: 0.62, br: 0.40, ct: 1.24 },
    { p: 0.205, tb: 0.330, sl: 0.400, sr: 0.000, s: 1.24, o: 0.80, br: 0.50, ct: 1.20 },  // 01 · left
    { p: 0.300, tb: 0.290, sl: 0.400, sr: 0.000, s: 1.22, o: 0.92, br: 0.64, ct: 1.13 },
    { p: 0.400, tb: 0.168, sl: 0.200, sr: 0.000, s: 1.14, o: 1.00, br: 0.84, ct: 1.08 },  // emergence
    { p: 0.462, tb: 0.120, sl: 0.000, sr: 0.320, s: 1.09, o: 1.00, br: 0.96, ct: 1.04 },  // swings right
    { p: 0.530, tb: 0.104, sl: 0.000, sr: 0.380, s: 1.07, o: 1.00, br: 1.00, ct: 1.02 },  // 02 · right
    { p: 0.612, tb: 0.092, sl: 0.000, sr: 0.340, s: 1.05, o: 1.00, br: 1.03, ct: 1.01 },
    { p: 0.690, tb: 0.058, sl: 0.340, sr: 0.000, s: 1.04, o: 1.00, br: 1.06, ct: 1.00 },  // 03 · left, widest
    { p: 0.750, tb: 0.076, sl: 0.280, sr: 0.000, s: 1.04, o: 1.00, br: 1.05, ct: 1.00 },
    { p: 0.820, tb: 0.255, sl: 0.115, sr: 0.115, s: 1.03, o: 1.00, br: 1.00, ct: 1.03 },  // 04 · centred
    { p: 0.888, tb: 0.104, sl: 0.000, sr: 0.400, s: 1.06, o: 1.00, br: 0.98, ct: 1.04 },  // 05 · right
    { p: 0.930, tb: 0.096, sl: 0.000, sr: 0.400, s: 1.06, o: 1.00, br: 0.99, ct: 1.03 },
    { p: 0.958, tb: 0.034, sl: 0.000, sr: 0.000, s: 1.04, o: 1.00, br: 1.08, ct: 1.00 },  // type clears
    { p: 0.980, tb: 0.500, sl: 0.000, sr: 0.000, s: 1.05, o: 1.00, br: 1.24, ct: 1.02 },  // shut
    { p: 1.000, tb: 0.500, sl: 0.000, sr: 0.000, s: 1.05, o: 1.00, br: 1.24, ct: 1.02 }
  ],

  /* Narrow and tall: no side shutters, a shallower letterbox, and the frame
     fitted to the viewport's width rather than to the open window — the
     stone spans nearly the whole width of a 16:9 frame, so fitting a tall
     window would crop it to its middle third. `zoom` buys back some
     presence at the cost of the stone's outermost tips. */
  narrowStage: { tbScale: 0.62, shut: 0.44, zoom: 1.18 },

  /* ---------------------------------------------------------- the clip
     Scroll progress to playhead, in seconds. Deliberately not linear: the
     opening dwells on the dark outline the footage starts on, so the
     section can hold its darkness while the title reads. */
  clip: [
    { p: 0.000, t: 0.00 },
    { p: 0.120, t: 0.20 },
    { p: 0.300, t: 1.30 },
    { p: 0.450, t: 2.75 },
    { p: 0.620, t: 4.10 },
    { p: 0.800, t: 5.70 },
    { p: 1.000, t: 7.94 }
  ],

  /* reduced motion parks here — full brilliance, beam already crossed */
  staticAt: 0.62
};
