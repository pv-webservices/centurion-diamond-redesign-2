window.CD=window.CD||{};
CD.exclusiveTimeline={
 range:function(p,a,b){var t=Math.max(0,Math.min(1,(p-a)/(b-a)));return t*t*(3-2*t);},
 /* one 0..1 value per staggered item, spread evenly across the window */
 items:function(p,w,count){var T=this,span=(w.inB-w.inA)/Math.max(count,1),out=[];
  for(var i=0;i<count;i++){var a=w.inA+i*span;out.push(T.range(p,a,a+span*.8));}return out;},
 frame:function(p,counts){var T=this;return CD.exclusive.beats.map(function(w,i){
  var enter=T.range(p,w.inA,w.inB),exit=T.range(p,w.outA,w.outB);
  return {v:enter*(1-exit),y:(1-enter)*22-exit*14,items:w.items?T.items(p,w.items,counts[i]):null};});}
};
