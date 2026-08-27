const puppeteer=require('puppeteer');const T=s=>new Promise(r=>setTimeout(r,s));
(async()=>{const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
for(const [w,h] of [[1920,1080],[1440,900],[1366,768],[1024,768],[430,932],[390,844]]){
  const p=await b.newPage();await p.setViewport({width:w,height:h});
  const e=[];p.on('pageerror',x=>e.push(x.message));
  await p.goto('http://localhost:4321',{waitUntil:'networkidle2'});await T(4800);
  const g=await p.evaluate(()=>{const s=document.getElementById('cut');return{top:s.offsetTop,h:Math.round(s.getBoundingClientRect().height)};});
  let worst=0, off=false;
  for(const f of [0.20,0.48,0.62,0.86,0.97]){
    await p.evaluate(v=>{window.lenis?window.lenis.scrollTo(v,{immediate:true}):window.scrollTo(0,v);ScrollTrigger.update();},g.top+(g.h-h)*f);
    await T(600);
    const r=await p.evaluate(()=>{const de=document.documentElement;
      const els=[...document.querySelectorAll('.spk__intro,.cut,.spk__word,.spk__lede')]
        .filter(el=>+getComputedStyle(el).opacity>0.2)
        .map(el=>{const b=el.getBoundingClientRect();return{l:b.left,r:b.right};});
      return {sw:de.scrollWidth,cw:de.clientWidth,
        bad:els.some(x=>x.l<-2||x.r>de.clientWidth+2)};});
    worst=Math.max(worst,r.sw-r.cw); if(r.bad) off=true;
  }
  console.log(`${String(w).padStart(4)}x${String(h).padEnd(4)} overflow:${worst>1?'YES':'no '} contentOffscreen:${off?'YES':'no '} ${e.length?'ERR '+e[0]:''}`);
  await p.close();
}
await b.close();})();
