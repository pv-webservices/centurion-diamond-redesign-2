/* Centurion Experience: four frames, one normalized timeline. The chapter's
   title is carried by Anatomy's family finale, which plays just before it.
   Each frame has an entrance, a long stationary hold, and an exit. Items in
   the retailer frame (ledger rows, then claims) arrive one at a time inside
   its `items` window so each can be read before the next appears. */
window.CD=window.CD||{};
CD.exclusive={beats:[
 {inA:.01,inB:.05,outA:.22,outB:.26},                      // Every centre stone
 {inA:.26,inB:.30,outA:.42,outB:.46},                      // A different kind of standard
 {inA:.46,inB:.49,outA:.75,outB:.79,items:{inA:.48,inB:.64}}, // ledger + the case for stocking
 {inA:.79,inB:.82,outA:.945,outB:.995}                     // Unshoppable by design — clears into Centurion at Retail
]};
