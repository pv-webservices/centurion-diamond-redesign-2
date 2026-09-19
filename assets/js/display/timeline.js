/* 07 / Centurion at Retail. Experience hands off into the original blush
   lighting rig, then the registered display progression meets the locked finale. */
window.CD = window.CD || {};

CD.displayTimeline = (function () {
  'use strict';

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function range(p, a, b) { return b === a ? (p >= b ? 1 : 0) : clamp01((p - a) / (b - a)); }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeIn(t) { return t * t * t; }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function band(p, w) {
    var v = easeOut(range(p, w.inA, w.inB));
    return w.outA == null ? v : v * (1 - easeIn(range(p, w.outA, w.outB)));
  }

  function stagger(vin, k) { return easeOut(clamp01((vin - k) / (1 - k))); }

  /* The wall: the room's one tint, mixed over the page's ink by the
     fraction the stop list asks for. Keeping it a single hue is what makes
     the colour a one-line decision — see `room` in scenes.js. */
  var INK = [33, 26, 26];
  function wallAt(room, p) {
    var stops = room.stops, k = stops[stops.length - 1].k, i;
    for (i = 1; i < stops.length; i++) {
      if (p <= stops[i].p || i === stops.length - 1) {
        k = lerp(stops[i - 1].k, stops[i].k, range(p, stops[i - 1].p, stops[i].p));
        break;
      }
    }
    return 'rgb(' + Math.round(lerp(INK[0], room.tint[0], k)) + ','
                  + Math.round(lerp(INK[1], room.tint[1], k)) + ','
                  + Math.round(lerp(INK[2], room.tint[2], k)) + ')';
  }

  /* walk a keyframe list of arbitrary numeric fields, smoothstepped */
  function poseInto(keys, p, fields, o) {
    var last = keys.length - 1, a, b, t, i, f;
    if (p <= keys[0].p)         { a = b = keys[0];    t = 0; }
    else if (p >= keys[last].p) { a = b = keys[last]; t = 0; }
    else {
      for (i = 1; i <= last; i++) if (p <= keys[i].p) break;
      a = keys[i - 1]; b = keys[i]; t = smooth(range(p, a.p, b.p));
    }
    for (f = 0; f < fields.length; f++) {
      o[fields[f]] = lerp(a[fields[f]], b[fields[f]], t);
    }
    return o;
  }

  var CASE_FIELDS = ['x', 'y', 'w', 'o'];
  var GLOW_FIELDS = ['s', 'v'];

  function createState(cfg) {
    return {ground:'',glow:{s:0,v:0},intro:{v:0,y:0,lines:[0,0]},scenes:[{},{ }],cases:cfg.hasExpansion?[{},{}]:[{}]};
  }
  function frame(cfg,p,narrow,st){
    st.ground=wallAt(cfg.room,p);
    if(p>.94){var fade=smooth(range(p,.94,1));var start=wallAt(cfg.room,.94).match(/\d+/g).map(Number);st.ground="rgb("+start.map(function(v,i){return Math.round(lerp(v,i===2?11:10,fade));}).join(",")+")";}
    poseInto(cfg.glow,p,GLOW_FIELDS,st.glow);
    var intro=cfg.intro;
    var enter=easeOut(range(p,intro.inA,intro.inB)),leave=easeIn(range(p,intro.outA,intro.outB));
    st.intro.v=enter*(1-leave);st.intro.y=-leave*12;st.intro.lines=[enter,enter];
    var windows=cfg.hasExpansion?cfg.expansionBeats:cfg.referenceBeats;
    windows.forEach(function(w,i){var sc=st.scenes[i];sc.vin=easeOut(range(p,w[0],w[1]));sc.vout=easeIn(range(p,w[2],w[3]));sc.v=sc.vin*(1-sc.vout);});
    var expansion=cfg.hasExpansion?smooth(range(p,cfg.expansion.inA,cfg.expansion.inB)):0;
    var on=easeOut(range(p,.20,.28)),off=1-easeIn(range(p,.96,1));
    st.narrow=narrow;
    st.cases.forEach(function(c,i){
      var pose=narrow?cfg.pose.mobile:cfg.pose.desktop;
      c.x=pose.x;c.y=pose.y;c.w=pose.w;c.scale=1-expansion*cfg.expansion.pullback;
      c.o=on*off*(i===0?1-smooth(range(p,cfg.expansion.clearTenA,cfg.expansion.clearTenB)):1);
      c.k=i===1?expansion:on;c.push=1;
    });
    if(!cfg.hasExpansion)st.cases[0].o=on*off;
    return st;
  }
  return {createState:createState,frame:frame,poseInto:poseInto,wallAt:wallAt,stagger:stagger,band:band,clamp01:clamp01,range:range,lerp:lerp,easeIn:easeIn,easeOut:easeOut,smooth:smooth};
})();
