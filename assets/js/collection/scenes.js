/* ============================================================
   04 · THE COLLECTION — choreography, in master-progress space (0..1).

   The nine SKUs, their specifications and the lifestyle plates live in
   index.html: they are real product data and must survive with scripting
   off. Everything that *moves* is described here.

   No prices, no certifications, no invented claims — the deck's own
   references, shapes, carats, metals and setting weights only.
   ============================================================ */
window.CD = window.CD || {};

CD.collection = {
  /* The Marquee above closes on the page's ink; the Worn section below opens
     on it again. The gallery is a lit room between the two — the aperture
     lets the light in, the handoff takes it away. */
  bgStops: [
    { p: 0.00, c: [244, 241, 234] },   // --bone, behind the closed aperture
    { p: 0.14, c: [243, 240, 233] },
    { p: 0.90, c: [243, 240, 233] },
    { p: 0.95, c: [214, 209, 199] },
    { p: 1.00, c: [ 10,  10,  11] }    // --ink, continuous with Worn below
  ],

  beats: {
    /* the aperture from Anatomy of Brilliance, run in reverse */
    aperture: { inA: 0.000, inB: 0.110 },
    intro:    { inA: 0.050, inB: 0.150, outA: 0.178, outB: 0.232 },

    /* the rail holds still at slot `holdAt` for `holdSpan` of progress while
       the statement takes the frame — the timeline derives the statement's
       own window from these, so the two can never drift apart */
    rail:     { inA: 0.212, outB: 0.848, holdAt: 5, holdSpan: 0.118 },

    nav:      { inA: 0.222, inB: 0.268, outA: 0.828, outB: 0.866 },
    metals:   { inA: 0.560, inB: 0.612, outA: 0.828, outB: 0.862 },
    finale:   { inA: 0.858, inB: 0.916 },
    handoff:  { inA: 0.928, inB: 0.994 }
  },

  /* how hard neighbours fall away from the centre of the rail */
  rail: {
    scale:   { at1: 0.58, at2: 0.34 },   // scale at one and two slots out
    opacity: { at1: 0.52, at2: 0.10 },
    drop:    2.4,                        // vh each neighbour sits lower
    tilt:    1.5,                        // deg per slot out
    plate:   0.86,                       // label legible only this close to centre
    /* a full-colour photograph holds the eye far harder than a ring on
       ivory does, so the lifestyle plates fall away much faster */
    lifeFalloff: 2.4
  },

  /* Narrow viewports run the same rail, not a column: vertical scroll still
     travels the gallery horizontally, and the piece either side stays
     partly in frame so the depth of the desktop composition survives.
     Only the falloff changes — a phone shows one large piece and a slice of
     its neighbour, where a desktop shows one and two whole neighbours. */
  mobileRail: {
    scale:   { at1: 0.58, at2: 0.30 },
    opacity: { at1: 0.34, at2: 0.00 },
    drop:    2.0,
    tilt:    1.0,
    /* the title card owns a phone's frame outright, so the rail waits
       further down the stage than it does on a desktop */
    introDrop: 27,
    /* the plate belongs to whichever piece actually holds the frame — at
       this pitch the neighbour overlaps, and two legible plates would read
       as one wrong caption */
    plate:   0.55,
    lifeFalloff: 2.8
  },

  /* museum-plate stagger: reference, then shape, then carat, then the
     specification line — the catalogue rhythm, not everything at once */
  plate: [0, 0.16, 0.30, 0.44],

  /* the aperture circle's scale in the SVG mask: shut, then wider than the
     viewport corners on every tested ratio */
  iris: { from: 0.02, to: 1.45 },

  /* narrow viewports keep the rail, on the falloff above */
  narrowAt: '(max-width: 900px)',

  /* The one case the rail cannot serve: a phone held sideways has no
     vertical room for a piece, its plate and the controls at once. There the
     gallery falls back to the column it used to run on every phone. */
  stackAt: '(max-width: 900px) and (orientation: landscape) and (max-height: 520px)'
};
