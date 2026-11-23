window.CD = window.CD || {};
/* The facet loader: 100 pieces assemble into the stone while the count runs
   to 100, then the count gives way to an invitation to enter. The page opens
   on the visitor's own gesture (click, Enter/Space, or a scroll or swipe). */
CD.PRELOADER_PACE = 1.3;   // client: the 0 -> 100 count runs 30% longer
CD.runFacetPreloader = function (done, reduced, onEnter) {
  var pre=document.getElementById('pre'), curtain=document.getElementById('curtain');
  var num=document.getElementById('preNum'), enter=document.getElementById('preEnter');
  var ns='http://www.w3.org/2000/svg', k=CD.PRELOADER_PACE;
  var svg=document.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','-100 -100 680 680');
  svg.setAttribute('aria-hidden','true');svg.classList.add('pre__diamond');
  svg.innerHTML='<defs><pattern id="facetPhoto" patternUnits="userSpaceOnUse" width="480" height="480"><image href="assets/img/diamond-shapes/round-480.webp" width="480" height="480" preserveAspectRatio="xMidYMid slice"/></pattern></defs>';
  var inner=pre.querySelector('.pre__inner');
  inner.insertBefore(svg,inner.querySelector('.pre__stack'));   // logo, then the stone, then Enter
  var facets=[];
  function pt(r,i){var a=i/20*Math.PI*2;return [240+Math.cos(a)*r,240+Math.sin(a)*r];}
  function triangle(a,b,c){
    var path=document.createElementNS(ns,'path');
    path.setAttribute('d','M'+a.join(',')+'L'+b.join(',')+'L'+c.join(',')+'Z');
    path.setAttribute('fill','url(#facetPhoto)');
    svg.appendChild(path);facets.push(path);
  }
  /* 20 central triangles + two rings of 40 triangles = 100 coherent pieces.
     Artistic assembly mask, not a diagram of the proprietary cut. One image. */
  for(var i=0;i<20;i++) triangle([240,240],pt(85,i),pt(85,i+1));
  [ [85,165], [165,240] ].forEach(function(r){for(var i=0;i<20;i++){
    triangle(pt(r[0],i),pt(r[1],i),pt(r[1],i+1));
    triangle(pt(r[0],i),pt(r[1],i+1),pt(r[0],i+1));
  }});
  gsap.set(curtain,{display:'none'});

  /* ---- the gate: shown once the count lands on 100 ---- */
  var opened=false, intents=['wheel','touchmove','keydown'];
  function onIntent(e){
    if(e.type==='keydown' && ['Enter',' ','ArrowDown','PageDown','Spacebar'].indexOf(e.key)<0) return;
    if(e.type==='keydown') e.preventDefault();
    openSite();
  }
  function showGate(){
    pre.classList.add('is-ready');
    pre.removeAttribute('aria-hidden');
    enter.hidden=false;
    enter.addEventListener('click',openSite);
    intents.forEach(function(t){window.addEventListener(t,onIntent,{passive:t!=='keydown'});});
    if(reduced){gsap.set(enter,{opacity:1});}
    else{
      gsap.fromTo(enter,{opacity:0,y:18},{opacity:1,y:0,duration:.9,ease:'expo.out'});
      gsap.to(svg,{scale:1.035,duration:2.4,ease:'sine.inOut',yoyo:true,repeat:-1,svgOrigin:'240 240'});
    }
    try{enter.focus({preventScroll:true});}catch(err){enter.focus();}
  }
  function openSite(){
    if(opened) return; opened=true;
    if(onEnter) onEnter();
    intents.forEach(function(t){window.removeEventListener(t,onIntent);});
    enter.removeEventListener('click',openSite);
    gsap.killTweensOf(svg);
    var close=function(){pre.style.display='none';document.body.classList.remove('is-locked');if(window.lenis)window.lenis.start();};
    if(reduced){gsap.to(pre,{opacity:0,duration:.2,onComplete:close});return;}
    var tl=gsap.timeline({onComplete:close});
    tl.to(enter,{opacity:0,y:-10,duration:.35,ease:'power2.in'},0);
    tl.to(svg,{scale:1.16,duration:.75,ease:'power2.inOut'},0);
    tl.to(pre,{opacity:0,duration:.8,ease:'power2.inOut'},.15);
  }

  document.body.classList.add('is-locked');
  if(window.lenis) window.lenis.stop();
  if(reduced){ num.textContent='100';done();showGate();return; }

  facets.forEach(function(path,i){
    var a=i*2.399;
    gsap.set(path,{x:Math.cos(a)*42,y:Math.sin(a)*42,rotation:(i%2?1:-1)*4,opacity:0,svgOrigin:'240 240'});
  });
  var tl=gsap.timeline();
  facets.forEach(function(path,i){
    tl.to(path,{x:0,y:0,rotation:0,opacity:1,duration:.24*k,ease:'power2.out',onComplete:function(){num.textContent=String(i+1).padStart(2,'0');}},i*.012*k);
  });
  tl.to('#preBar',{scaleX:1,duration:1.43*k,ease:'none'},0);
  tl.add(function(){num.textContent='100';done();},1.5*k);
  /* the count and its bar step back; the invitation takes their place */
  tl.to(['.pre__count','.pre__bar'],{opacity:0,y:-12,duration:.55,ease:'power2.inOut',stagger:.06},1.5*k+.35);
  tl.add(showGate,1.5*k+.75);
};
