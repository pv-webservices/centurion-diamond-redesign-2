/* ============================================================
   10 · EXCLUSIVITY — content timing + choreography, in master-progress
   space (0..1).

   The chapter's one idea: no photography at all. After three image-led
   chapters the trade argument is set as a ledger — three figures that
   arrive one row at a time and *stay*, each with its own rule drawing
   under it, while the case for stocking builds beside them.

   Rows accumulate rather than replacing one another, which is the whole
   point of a ledger: by the end the argument is on the page in one piece.

   Every figure and every sentence is the deck's own. Nothing counts up —
   the Sparkle section already owns that gesture.
   ============================================================ */
window.CD = window.CD || {};

CD.exclusive = {

  beats: {
    intro: { inA: 0.020, inB: 0.082, outA: 0.100, outB: 0.146 },

    /* each row arrives and holds; the whole ledger clears together */
    rows: [
      { inA: 0.170, inB: 0.244 },
      { inA: 0.275, inB: 0.349 },
      { inA: 0.380, inB: 0.454 }
    ],
    ledgerOut: { inA: 0.846, inB: 0.898 },
    /* A phone cannot hold three ruled rows and a claim at once, and the
       ledger has already made its point by then — so it clears as the
       first claim arrives instead of holding beside it. */
    ledgerOutNarrow: { inA: 0.470, inB: 0.520 },

    /* the case for stocking, one claim at a time, beside the ledger */
    claims: [
      { inA: 0.500, inB: 0.572, outA: 0.620, outB: 0.668 },
      { inA: 0.688, inB: 0.758, outA: 0.800, outB: 0.844 }
    ],

    /* the last frame: the headline and the one thing to do about it. It is
       not faded out — the button has to still be there to be pressed. */
    close: { inA: 0.884, inB: 0.944 }
  },

  /* how tall one ledger row is, in vh — the block is shifted by half a row
     for every row still to come, so the revealed rows stay optically
     centred instead of the stack growing downward from a fixed top */
  rowHeight: 15,

  /* the ledger sits left, the claims right */
  layout: { ledgerX: -1, claimX: 1 }
};
