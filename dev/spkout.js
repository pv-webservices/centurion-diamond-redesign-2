const puppeteer=require('puppeteer');const T=s=>new Promise(r=>setTimeout(r,s));
(async()=>{const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
const p=await b.newPage();await p.setViewport({width:1440,height:900});
await p.goto('http://localhost:4321',{waitUntil:'networkidle2'});await T(5000);
const g=await p.evaluate(()=>{const s=document.getElementById('cut');return{top:s.offsetTop,h:Math.round(s.getBoundingClientRect().height)};});
for(const f of [0.87,0.91,0.94,0.97,1.0]){
  await p.evaluate(v=>{window.lenis?window.lenis.scrollTo(v,{immediate:true}):window.scrollTo(0,v);ScrollTrigger.update();},g.top+(g.h-900)*f);
  await T(800);
  const r=await p.evaluate(()=>({w:[...document.querySelectorAll('[data-spk-word]')].map(e=>+getComputedStyle(e).opacity),
    field:+getComputedStyle(document.querySelector('.spk__field')).opacity,
    meta:+getComputedStyle(document.querySelector('.cut__meta')).opacity}));
  console.log(` ${String(Math.round(f*100)).padStart(3)}% words=[${r.w.map(x=>x.toFixed(2)).join(' ')}] field=${r.field.toFixed(2)} meta=${r.meta.toFixed(2)}`);
}
await b.close();})();
