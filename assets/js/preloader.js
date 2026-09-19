window.CD = window.CD || {};
CD.runFacetPreloader = function (done, reduced) {
  var pre=document.getElementById('pre'), curtain=document.getElementById('curtain');
  var num=document.getElementById('preNum'), ns='http://www.w3.org/2000/svg';
  var svg=document.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','-100 -100 680 680');
  svg.setAttribute('aria-hidden','true');svg.classList.add('pre__diamond');
  svg.innerHTML='<defs><pattern id="facetPhoto" patternUnits="userSpaceOnUse" width="480" height="480"><image href="assets/img/diamond-shapes/round-480.webp" width="480" height="480"/></pattern></defs>';
  pre.querySelector('.pre__inner').prepend(svg);
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
  if(reduced){
    num.textContent='100';done();
    gsap.to(pre,{opacity:0,duration:.15,delay:.15,onComplete:function(){pre.style.display='none';}});return;
  }
  document.body.classList.add('is-locked');
  if(window.lenis) window.lenis.stop();
  facets.forEach(function(path,i){
    var a=i*2.399;
    gsap.set(path,{x:Math.cos(a)*42,y:Math.sin(a)*42,rotation:(i%2?1:-1)*4,opacity:0,svgOrigin:'240 240'});
  });
  var tl=gsap.timeline({onComplete:function(){pre.style.display='none';document.body.classList.remove('is-locked');if(window.lenis)window.lenis.start();}});
  facets.forEach(function(path,i){
    tl.to(path,{x:0,y:0,rotation:0,opacity:1,duration:.24,ease:'power2.out',onComplete:function(){num.textContent=String(i+1).padStart(2,'0');}},i*.012);
  });
  tl.to('#preBar',{scaleX:1,duration:1.43,ease:'none'},0);
  tl.add(function(){num.textContent='100';done();},1.5);
  tl.to(svg,{scale:1.12,duration:.65,ease:'power2.inOut'},1.62);
  tl.to(pre,{opacity:0,duration:.7,ease:'power2.inOut'},1.72);
};
