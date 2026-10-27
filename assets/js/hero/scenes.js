/* ============================================================
   Hero timeline — the storyboard in master-progress space (0..1).

   Origin → Craft → Reveal → Masterpiece, joined the way the storyboard
   asks: cuts, never a morph.
     scenes[].cam    camera window; scale / x (% of the plate) run across it
     scenes[].enter  the transition that brings the scene in:
                       sweep    a gliding reflection, the cut hidden under it
                       flash    a highlight bloom from the laser's contact point
                       dissolve a pull back through the previous frame
     chapters[]      the three statements (in → out windows)
     final           the closing frame's copy, actions and facts
     rail            chapter boundaries for the progress rail
   Re-time the hero here; nothing else needs touching.
   ============================================================ */
window.CD = window.CD || {};

CD.heroTimeline = {
  intro: { outA: 0.02, outB: 0.085 },

  scenes: [
    { id: 'origin',      cam: [0, 0.31],    scale: [1, 1.14],    x: [0, -1],
      /* the crystal emerges from darkness over the opening scroll */
      light: [0, 0.09] },
    { id: 'craft',       cam: [0.25, 0.56], scale: [1.12, 1.08], x: [1.5, -1.5],
      enter: { type: 'sweep', a: 0.245, b: 0.315 },
      /* the laser burns while the frame is on screen */
      laser: [0.28, 0.33, 0.49, 0.53] },
    { id: 'reveal',      cam: [0.51, 0.80], scale: [1.02, 1.1],  x: [0, 0],
      enter: { type: 'flash', a: 0.49, b: 0.565 },
      /* the storyboard's "gentle 10–15° rotation" */
      spin: [0.51, 0.82, -4, 12] },
    { id: 'masterpiece', cam: [0.75, 0.9],  scale: [1.22, 1],    x: [0, 0],
      enter: { type: 'dissolve', a: 0.755, b: 0.805 },
      /* the champagne rim light comes up as the camera settles */
      rim: [0.82, 0.92] }
  ],

  chapters: [
    { inA: 0.085, inB: 0.14, outA: 0.215, outB: 0.255 },
    { inA: 0.32,  inB: 0.37, outA: 0.45,  outB: 0.49 },
    { inA: 0.575, inB: 0.625, outA: 0.705, outB: 0.745,
      /* the facet meter climbs from a traditional 58 to 100 */
      count: { a: 0.585, b: 0.67, from: 58, to: 100 } }
  ],

  final: { inA: 0.84, inB: 0.9, ctaA: 0.88, ctaB: 0.95 },

  rail: [0, 0.255, 0.5, 0.76, 1]
};
