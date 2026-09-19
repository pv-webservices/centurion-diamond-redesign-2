/* Centurion Experience: five frames, one normalized timeline.
   Each frame has an entrance, a long stationary hold, and an exit. Items in
   the retailer frame (ledger rows, then claims) arrive one at a time inside
   its `items` window so each can be read before the next appears. */
window.CD=window.CD||{};
CD.exclusive={beats:[
 {inA:0,inB:.03,outA:.12,outB:.15},                        // The Centurion experience
 {inA:.15,inB:.18,outA:.30,outB:.33},                      // Every centre stone
 {inA:.33,inB:.36,outA:.46,outB:.49},                      // A different kind of standard
 {inA:.49,inB:.52,outA:.77,outB:.80,items:{inA:.51,inB:.66}}, // ledger + the case for stocking
 {inA:.80,inB:.83,outA:.945,outB:.995}                     // Unshoppable by design — clears into Centurion at Retail
]};
