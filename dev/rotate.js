/* load portrait, rotate to landscape without reload — the composition is
   chosen at load, so this checks it degrades rather than breaks */
const puppeteer=require('puppeteer'); const T=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 for(const [a,c] of [[[390,844],[844,390]],[[844,390],[390,844]]]){
  const p=await b.newPage(); await p.setViewport({width:a[0],height:a[1],isMobile:true,hasTouch:true});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:4321',{waitUntil:'networkidle2'}); await T(4000);
  await p.setViewport({width:c[0],height:c[1],isMobile:true,hasTouch:true}); await T(1400);
  const r=await p.evaluate(()=>{
   const de=document.documentElement, out={sw:de.scrollWidth,cw:de.clientWidth,secs:{}};
   ['chero','anatomy','collection','worn','display'].forEach(id=>{
     const e=document.getElementById(id); out.secs[id]=Math.round(e.getBoundingClientRect().height);});
   out.stacked=document.getElementById('collection').classList.contains('is-stacked');
   return out;});
  // scroll each changed section and look for anything clipped out of frame
  let bad=0;
  for(const id of ['chero','anatomy','collection','worn','display']){
   const g=await p.evaluate(i=>{const e=document.getElementById(i);const rr=e.getBoundingClientRect();
     return{top:Math.round(rr.top+window.scrollY),h:Math.round(rr.height)};},id);
   for(let k=0;k<6;k++){
    await p.evaluate(v=>{window.lenis?window.lenis.scrollTo(v,{immediate:true}):window.scrollTo(0,v); if(window.ScrollTrigger)ScrollTrigger.update();}, g.top+(g.h-c[1])*(k/5));
    await T(260);
    const o=await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
    if(o) bad++;
   }
  }
  console.log(`${a.join('x')} -> ${c.join('x')}  overflowFrames=${bad}  stacked=${r.stacked}  ${errs.length?'ERR '+errs[0]:'no errors'}`);
  await p.close();
 }
 await b.close();
})();
