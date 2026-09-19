window.CD=window.CD||{};
CD.initExclusive=function(){
 var root=document.getElementById('exclusive');if(!root||root.dataset.mounted)return;root.dataset.mounted='true';
 var V=CD.exclusiveVisual,el=V.mount(root),counts=V.counts(el);
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){root.classList.add('is-reduced');return;}
 /* the close eases the ground to the finale's own black, which Centurion at
    Retail opens on before its film irises in */
 var from=[28,22,23],to=[10,10,11],lastG='';
 function ground(p){var t=CD.exclusiveTimeline.range(p,.95,1),g='rgb('+from.map(function(c,i){return Math.round(c+(to[i]-c)*t);}).join(',')+')';
  if(g!==lastG){el.stage.style.backgroundColor=g;lastG=g;}}
 function render(p){V.render(el,CD.exclusiveTimeline.frame(p,counts));ground(p);}
 /* overlaps the Light Study by a viewport (sections.css): hidden until its pin takes over */
 function live(s){root.classList.toggle('is-live',s.scroll()>=s.start-2);}
 ScrollTrigger.create({trigger:root,start:'top top',end:'bottom bottom',pin:el.stage,pinSpacing:false,anticipatePin:1,onToggle:live,onRefresh:live,onUpdate:function(s){live(s);render(s.progress);}});render(0);
};
