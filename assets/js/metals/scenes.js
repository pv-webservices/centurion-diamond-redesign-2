/* ============================================================
   08 · METALS — content timing + choreography, in master-progress
   space (0..1).

   The chapter's one idea: the ground becomes the metal. Two full-bleed
   panels wipe across the stage on a diagonal — platinum, then yellow gold
   over it — and for the third beat the gold panel simply *retreats* to the
   right rather than a third panel arriving. The two metals then sit side by
   side with the two-tone ring standing on the seam, which is the argument
   made visible: there are three settings but only ever two metals.

   That is also why the deck's own headline is left alone. "Two metals. One
   standard." reads like a contradiction next to three cards; it stops
   reading like one the moment Two Tone is shown to *be* the two.

   Copy is the deck's own — the three material paragraphs verbatim.
   ============================================================ */
window.CD = window.CD || {};

CD.metals = {

  beats: {
    intro:  { inA: 0.018, inB: 0.078, outA: 0.098, outB: 0.144 },
    scenes: [
      { inA: 0.186, inB: 0.262, outA: 0.310, outB: 0.356 },   // platinum
      { inA: 0.442, inB: 0.516, outA: 0.566, outB: 0.612 },   // 14K yellow
      { inA: 0.706, inB: 0.776, outA: 0.826, outB: 0.868 }    // two tone
    ],
    /* the closing line, and the room draining back to ink for Display */
    statement: { inA: 0.876, inB: 0.926, outA: 0.944, outB: 0.976 },
    drain:     { inA: 0.948, inB: 1.000 }
  },

  /* Each panel's leading edge, as a percentage of the stage width covered.
     0 is off-stage, 100 is the whole stage. `pt` wipes in from the left and
     stays; `yg` wipes in from the right, holds, then falls back to 62 —
     which is where the seam lives for the two-tone beat. */
  wipe: {
    pt: [
      { p: 0.104, e:   0 },
      { p: 0.182, e: 100 },
      { p: 1.000, e: 100 }
    ],
    yg: [
      { p: 0.362, e:   0 },
      { p: 0.438, e: 100 },
      { p: 0.620, e: 100 },
      { p: 0.702, e:  62 },
      { p: 1.000, e:  62 }
    ]
  },
  /* the diagonal, in degrees of skew on both panels — they share it, so the
     seam between them is one continuous line */
  rake: -9,

  /* One ring per metal, alpha-keyed so it can stand on the metal itself.
     x/y are vw/vh from the stage centre, w is vw. */
  rings: [
    { key: 'pt', x: -22, y:  2, w: 22, r: -2 },
    { key: 'yg', x:  22, y:  2, w: 20, r:  2 },
    { key: 'tt', x: -12, y:  4, w: 21, r: -1 }    // standing on the seam
  ],

  /* narrow viewports: the ring above, the copy below, no lateral offset */
  mobile: { ring: { x: 0, y: -18, w: 52, r: 0 } },

  /* The metal is lit, not flooded: a static veil keeps the ground reading
     as a surface in a dark room, so the type never has to change colour.
     This is the extra darkening on top of it, eased per scene. */
  veil: { base: 0.10, edge: 0.42 }
};
