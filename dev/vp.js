const puppeteer=require('puppeteer');
const T=s=>new Promise(r=>setTimeout(r,s));
(async()=>{const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
for(const [w,h] of [[1920,1080],[1440,900],[1366,768],[1024,768],[430,932],[390,844]]){
  const p=await b.newPage(); await p.setViewport({width:w,height:h});
  const e=[]; p.on('pageerror',x=>e.push(x.message));
  await p.goto('http://localhost:4321',{waitUntil:'networkidle2'}); await T(4500);
  const g=await p.evaluate(()=>({top:document.getElementById('chero').offsetTop,h:Math.round(document.getElementById('chero').getBoundingClientRect().height)}));
  // mid-narrative check
  await p.evaluate(v=>{window.lenis?window.lenis.scrollTo(v,{immediate:true}):window.scrollTo(0,v);ScrollTrigger.update();}, g.top+(g.h-h)*0.45);
  await T(900);
  const r=await p.evaluate(()=>{const de=document.documentElement;
    const sc=[...document.querySelectorAll('.cscene')].map(el=>{const b=el.getBoundingClientRect();return {l:Math.round(b.left),r:Math.round(b.right),o:+getComputedStyle(el).opacity};}).filter(x=>x.o>0.15);
    const v=document.querySelector('[data-hero-video]');
    return {sw:de.scrollWidth,cw:de.clientWidth,sc,t:+v.currentTime.toFixed(2),src:(v.currentSrc||'').split('/').pop()};});
  const off = r.sc.some(x=>x.l< -2 || x.r> r.cw+2);
  console.log(`${String(w).padStart(4)}x${String(h).padEnd(4)} overflow:${r.sw>r.cw+1?'YES':'no '} sceneOffscreen:${off?'YES':'no '} t=${r.t} src=${r.src} ${e.length?'ERR '+e[0]:''}`);
  await p.close();
}
await b.close();})();
