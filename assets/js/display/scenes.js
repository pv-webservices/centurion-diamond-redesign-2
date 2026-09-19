/* 07 / Retail: retain the original light rig, with registered display poses.
   Asset readiness is resolved once at mount; never scroll through empty slots. */
window.CD=window.CD||{};
CD.display={
  intro:{inA:.015,inB:.055,outA:.16,outB:.20},
  referenceBeats:[[.25,.30,.55,.60],[.67,.71,.90,.95]],
  expansionBeats:[[.25,.29,.49,.54],[.79,.83,.94,.98]],
  expansion:{inA:.55,inB:.80,clearTenA:.77,clearTenB:.81,pullback:.08},
  pose:{desktop:{x:-18,y:0,w:32},mobile:{x:0,y:-8,w:84}},
  glow: [
    { p: 0.060, s: 0.10, v: 0.00 },
    { p: 0.200, s: 0.55, v: 0.62 },
    { p: 0.420, s: 1.00, v: 0.86 },
    { p: 0.640, s: 1.34, v: 1.00 },
    { p: 0.860, s: 1.52, v: 1.00 },
    { p: 0.940, s: 1.30, v: 0.42 },
    { p: 1.000, s: 1.10, v: 0.00 }
  ],
  room: {
    tint: null,
    stops: [
      { p: 0.00, k: 0.00 },
      { p: 0.16, k: 0.04 },
      { p: 0.40, k: 0.12 },
      { p: 0.62, k: 0.23 },
      { p: 0.86, k: 0.30 },
      { p: 0.94, k: 0.11 },
      { p: 1.00, k: 0.00 }
    ]
  }
};
