window.CD=window.CD||{};
CD.exclusiveVisual={
 mount:function(root){
  var frames=root.querySelectorAll('[data-exp-frame]');
  return {stage:root.querySelector('.exc__stage'),frames:frames,
   items:Array.prototype.map.call(frames,function(f){return f.querySelectorAll('[data-exp-item]');})};
 },
 counts:function(el){return el.items.map(function(list){return list.length;});},
 render:function(el,states){states.forEach(function(s,i){
  var node=el.frames[i];
  node.style.opacity=s.v;node.style.visibility=s.v<.005?'hidden':'visible';
  node.style.transform='translate3d(0,'+s.y+'px,0)';
  node.setAttribute('aria-hidden',s.v<.5?'true':'false');
  if(!s.items)return;
  s.items.forEach(function(v,k){var item=el.items[i][k];
   item.style.opacity=v;item.style.transform='translate3d(0,'+((1-v)*18).toFixed(1)+'px,0)';
   item.style.setProperty('--draw',v.toFixed(3));});
 });}
};
