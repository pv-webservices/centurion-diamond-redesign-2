const puppeteer=require('puppeteer');const T=s=>new Promise(r=>setTimeout(r,s));
(async()=>{const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
for(const [w,h] of [[1920,1080],[1440,900],[1366,768],[1024,768],[430,932],[390,844]]){
  const p=await b.newPage();await p.setViewport({width:w,height:h});
  const e=[];p.on('pageerror',x=>e.push(x.message));p.on('console',m=>{if(m.type()==='error')e.push('C:'+m.text());});
  await p.goto('http://localhost:4321',{waitUntil:'networkidle2'});await T(4800);
  const g=await p.evaluate(()=>{const s=document.getElementById('cut');return{top:s.offsetTop,h:Math.round(s.getBoundingClientRect().height)};});
  let hOver=false,vClip=false;
  for(const f of [0.20,0.48,0.62,0.86,0.97]){
    await p.evaluate(v=>{window.lenis?window.lenis.scrollTo(v,{immediate:true}):window.scrollTo(0,v);ScrollTrigger.update();},g.top+(g.h-h)*f);
    await T(650);
    const r=await p.evaluate(()=>{const de=document.documentElement;
      const vis=[...document.querySelectorAll('.spk__intro,.cut,.spk__word,.spk__lede')]
        .filter(el=>+getComputedStyle(el).opacity>0.25).map(el=>el.getBoundingClientRect());
      return {sw:de.scrollWidth,cw:de.clientWidth,vh:de.clientHeight,
        h:vis.some(b=>b.left<-2||b.right>de.clientWidth+2),
        v:vis.some(b=>b.top<-2||b.bottom>de.clientHeight+2)};});
    if(r.sw>r.cw+1||r.h) hOver=true;
    if(r.v) vClip=true;
  }
  console.log(`${String(w).padStart(4)}x${String(h).padEnd(4)} hOverflow:${hOver?'YES':'no '} vClip:${vClip?'YES':'no '} ${e.length?'ERR '+e[0]:''}`);
  await p.close();
}
await b.close();})();
