/* ============================================================
   11 · RETAIL FINALE — progress beats and ring trajectories.
   Product images are deliberately absent here: visual.js derives them from
   the nine Collection figures so future asset swaps propagate automatically.
   ============================================================ */
window.CD = window.CD || {};

CD.finale = {
  beats: {
    room: { inA: 0.015, inB: 0.180 },
    case: { inA: 0.035, inB: 0.230 },
    copy: { inA: 0.805, inB: 0.925 }
  },

  casePoses: [
    { p: 0.00, y: 13, s: 0.62, o: 0.00, crisp: 0.00 },
    { p: 0.16, y: 10, s: 0.76, o: 0.78, crisp: 0.35 },
    { p: 0.46, y:  8, s: 0.88, o: 0.94, crisp: 0.72 },
    { p: 0.76, y:  4, s: 1.00, o: 1.00, crisp: 1.00 },
    { p: 1.00, y:  2, s: 1.04, o: 0.48, crisp: 1.00 }
  ],

  /* Deliberate editorial positions, resolved to a shared receiving area in
     three waves. x/y are viewport units from centre; r is degrees. */
  rings: [
    { x:-39, y:-27, r:-18, s:.62, tx:-7.0, ty:12.0, tr:-4,  inA:.205, inB:.465 },
    { x: -7, y:-38, r:  8, s:.58, tx: 0.0, ty:10.5, tr: 1,  inA:.225, inB:.485 },
    { x: 36, y:-25, r: 17, s:.64, tx: 7.0, ty:12.0, tr: 4,  inA:.245, inB:.505 },
    { x:-44, y:  1, r:-10, s:.60, tx:-7.5, ty:15.5, tr:-2,  inA:.355, inB:.615 },
    { x: 43, y:  2, r: 11, s:.61, tx: 0.0, ty:14.5, tr: 0,  inA:.375, inB:.635 },
    { x:-34, y: 29, r:-16, s:.57, tx: 7.5, ty:15.5, tr: 3,  inA:.395, inB:.655 },
    { x: -2, y: 37, r:  5, s:.60, tx:-6.5, ty:18.5, tr:-1,  inA:.505, inB:.745 },
    { x: 34, y: 29, r: 15, s:.58, tx: 0.0, ty:18.0, tr: 1,  inA:.525, inB:.765 },
    { x:  5, y: -4, r: -4, s:.67, tx: 6.5, ty:18.5, tr: 2,  inA:.545, inB:.785 }
  ],

  mobile: {
    pathScale: 0.90,
    ringScale: 0.92,
    caseScale: 1.10
  }
};
