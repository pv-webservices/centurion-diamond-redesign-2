/* ============================================================
   09 · DISPLAY — content timing + choreography, in master-progress
   space (0..1).

   The chapter's one idea: the colour arrives as light. The deck names the
   periwinkle explicitly, so this is the one chromatic room on the page —
   a dark space that a periwinkle source rises into and fills, revealing
   the case, then falls away again for Exclusivity below.

   That is deliberately not another ground ramp. The Sparkle section already
   ramps a ground and Metals already wipes one; here the ground is only
   ever what the light leaves behind, and the light itself is the object
   that moves.

   Copy is the deck's own, and nothing repeats: the lede belongs to the
   first beat, the merchandising line to the second, and the last beat has
   no words at all.
   ============================================================ */
window.CD = window.CD || {};

CD.display = {

  beats: {
    intro:  { inA: 0.020, inB: 0.080, outA: 0.104, outB: 0.150 },
    scenes: [
      { inA: 0.232, inB: 0.312, outA: 0.372, outB: 0.424 },   // 01 · built to be noticed
      { inA: 0.598, inB: 0.680, outA: 0.740, outB: 0.788 }    // 02 · ready to merchandise
    ]
  },

  /* The light source: a soft periwinkle bloom that rises behind the case,
     spreads to fill the room, holds, and falls. `s` is its scale, `v` its
     presence — the ground ramp below is keyed to the same shape. */
  glow: [
    { p: 0.060, s: 0.10, v: 0.00 },
    { p: 0.200, s: 0.55, v: 0.62 },
    { p: 0.420, s: 1.00, v: 0.86 },
    { p: 0.640, s: 1.34, v: 1.00 },
    { p: 0.860, s: 1.52, v: 1.00 },
    { p: 0.940, s: 1.30, v: 0.42 },
    { p: 1.000, s: 1.10, v: 0.00 }
  ],

  /* What the light leaves on the walls.

     ONE PLACE FOR THE ROOM'S COLOUR. `tint` is the lit wall at its
     fullest; every stop is a fraction of it mixed over the page's ink, so
     changing the hue is a single edit here (and the matching rgba in
     .dsp__glow, which is the source itself).

     It is periwinkle because that is what the deck says: "a striking
     periwinkle colour". The photographed prototype is not periwinkle — it
     samples at about rgb(183,123,126), a blush rose, which is all but the
     brand's own --rose. The deck's word is treated as authoritative here
     and the mismatch is flagged rather than quietly resolved; if the case
     really is rose, this triple and the glow are the whole change.

     Both ends are the page's ink — Metals above drains to it and
     Exclusivity below opens on it. Every stop stays dark enough for bone
     type at AA without a colour change anywhere in the chapter. */
  room: {
    tint: [75, 83, 140],
    stops: [
      { p: 0.00, k: 0.00 },
      { p: 0.16, k: 0.10 },
      { p: 0.40, k: 0.32 },
      { p: 0.62, k: 0.52 },
      { p: 0.86, k: 0.62 },
      { p: 0.94, k: 0.24 },
      { p: 1.00, k: 0.00 }
    ]
  },

  /* The two case photographs, on a slow dolly. Each has a pose per beat;
     `in` is where it first appears. x/y are vw/vh from the stage centre,
     w is vw. The dolly is the `w` growing across the chapter — the room
     is being walked into, not panned across. */
  cases: [
    { key: 'a', in: 0.150, poses: [
      { p: 0.150, x:  -2, y:  2, w: 20, o: 0 },
      { p: 0.300, x:  -2, y:  0, w: 26, o: 1 },     // 01 · lit, centred
      { p: 0.470, x:  -2, y:  0, w: 27, o: 1 },
      { p: 0.660, x:  12, y: -8, w: 19, o: 1 },     // 02 · pairs up, right
      { p: 0.820, x: -13, y:  4, w: 20, o: 1 },     // the room, the pair composed
      { p: 1.000, x: -13, y:  5, w: 21, o: 0 }
    ] },
    { key: 'b', in: 0.470, poses: [
      { p: 0.470, x:  30, y: 16, w: 13, o: 0 },
      { p: 0.660, x:  30, y: 12, w: 17, o: 1 },     // 02 · behind and below A
      { p: 0.820, x:  14, y: -5, w: 17, o: 1 },
      { p: 1.000, x:  14, y: -6, w: 18, o: 0 }
    ] }
  ],

  /* ---------------------------------------------------------------- mobile
     A phone gets the same room, composed for a portrait frame: one case at
     a time and large enough to be looked at, alternating with the copy —
     the case high and the copy under it, then the case low and the copy
     over it — before the two cases come together for the closing frame.

     The crop is `--mar` / `--mpos` on the figures in index.html; the mask
     that opens each case and the slow push inside its frame are `reveal`
     and `push` below. */
  mobile: {
    a: { x: 0, y: -15, w: 95 },
    b: { x: 0, y:  16, w: 95 },
    /* the last beat, where the two come together: side by side and
       stepped, so the pair reads as a composition rather than as one
       wide photograph cut down the middle */
    pair: { x: 25.5, y: 2, w: 46, step: 7 },
    /* a 95vw case cannot share a phone with another one, so the first hands
       the frame to the second rather than staying behind it */
    swap: { inA: 0.500, inB: 0.592 },
    pairAt: { inA: 0.700, inB: 0.815 },
    /* the mask opening under each case, measured from where it arrives */
    reveal: 0.10,
    /* gentle parallax: 1.06 settling to 1.00, then closing in for the pair */
    push: { from: 1.06, to: 1.00, pair: 0.14 }
  }
};
