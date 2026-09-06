/* ============================================================
   10 · RETAIL SHOWCASE — frame sets and editorial beats.
   Times were tuned against the supplied eight-second film: the display is
   empty through ~1.5s, ring placement dominates 1.5–6s, and the completed
   case settles from ~6.5s onward.
   ============================================================ */
window.CD = window.CD || {};

CD.finale = {
  sets: {
    desktop: {
      base: 'assets/img/retail-scrub/',
      count: 96,
      width: 1280,
      height: 720
    },
    mobile: {
      base: 'assets/img/retail-scrub/mobile/',
      count: 80,
      width: 720,
      height: 405
    }
  },

  preload: {
    rootMargin: '180% 0px',
    previewStride: 10,
    concurrency: 4,
    fillDelay: 320
  },

  /* master progress -> source-film time, expressed as normalized seconds */
  videoMap: [
    { p: 0.00, t: 0.0000 },
    { p: 0.10, t: 0.1563 }, /* 1.25s — empty display hold */
    { p: 0.72, t: 0.7500 }, /* 6.00s — placement choreography */
    { p: 0.84, t: 0.8438 }, /* 6.75s — final settle */
    { p: 0.92, t: 0.9688 },
    { p: 1.00, t: 1.0000 }
  ],

  copy: {
    eyebrow: { inA: 0.680, inB: 0.760 },
    lines: [
      { inA: 0.755, inB: 0.835 },
      { inA: 0.795, inB: 0.875 },
      { inA: 0.835, inB: 0.915 }
    ],
    body: { inA: 0.875, inB: 0.945 },
    cta: { inA: 0.915, inB: 0.980 },
    scrim: { inA: 0.665, inB: 0.885 }
  },

  media: {
    reveal: { inA: 0.000, inB: 0.080 },
    firstSettle: { inA: 0.000, inB: 0.680 },
    finalSettle: { inA: 0.720, inB: 0.940 },
    sweep: { inA: 0.700, peak: 0.765, outB: 0.835 }
  }
};
