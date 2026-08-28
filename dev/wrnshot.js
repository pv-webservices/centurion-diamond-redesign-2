const puppeteer=require('puppeteer'); const fs=require('fs');
const T=ms=>new Promise(r=>setTimeout(r,ms));
const OUT=process.argv[2], W=+(process.argv[3]||390), H=+(process.argv[4]||844), SEC=process.argv[5]||'worn';
const PROGS=(process.argv[6]||'0.05,0.16,0.22,0.30,0.36,0.42,0.48,0.55,0.63,0.70,0.78,0.85,0.92,0.98').split(',').map(Number);
const MOB=process.env.DESKTOP!=='1';
(async()=>{
 fs.mkdirSync(OUT,{recursive:true});
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 const p=await b.newPage(); await p.setViewport({width:W,height:H,isMobile:MOB,hasTouch:MOB});
 const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://localhost:4321',{waitUntil:'networkidle2'}); await T(4500);
 const g=await p.evaluate(id=>{const e=document.getElementById(id);const r=e.getBoundingClientRect();
   return {top:Math.round(r.top+window.scrollY),h:Math.round(r.height)};},SEC);
 let i=0;
 for(const prog of PROGS){
   const y=g.top+(g.h-H)*prog;
   await p.evaluate(v=>{window.lenis?window.lenis.scrollTo(v,{immediate:true}):window.scrollTo(0,v); if(window.ScrollTrigger)ScrollTrigger.update();},y);
   await T(620);
   await p.screenshot({path:`${OUT}/${SEC}-${String(i).padStart(2,'0')}.png`});
   const m=await p.evaluate(sec=>{
     const root=document.getElementById(sec);
     const pl=[...root.querySelectorAll('[data-wrn-plate],[data-dsp-case]')].map((el,i)=>{
       const o=+getComputedStyle(el).opacity; if(o<0.03)return null; const r=el.getBoundingClientRect();
       return `#${i}o${o.toFixed(2)}[${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.width)},${Math.round(r.height)}]`;}).filter(Boolean);
     const cp=[...root.querySelectorAll('[data-wrn-scene],[data-wrn-intro],[data-wrn-gather],[data-dsp-scene],[data-dsp-intro]')].map((el,i)=>{
       const o=+getComputedStyle(el).opacity; if(o<0.15)return null;
       const c=el.querySelector('.wrn__copy,.dsp__copy')||el.firstElementChild; const r=(c||el).getBoundingClientRect();
       return `${el.getAttribute('data-wrn-scene')??el.getAttribute('data-dsp-scene')??(el.hasAttribute('data-wrn-gather')?'G':'I')}o${o.toFixed(2)}y[${Math.round(r.top)},${Math.round(r.bottom)}]x[${Math.round(r.left)},${Math.round(r.right)}]`;}).filter(Boolean);
     return {pl,cp,sw:document.documentElement.scrollWidth};},SEC);
   console.log(`${String(i).padStart(2,'0')} p=${prog}  plates: ${m.pl.join(' ')||'-'}  copy: ${m.cp.join(' ')||'-'}`);
   i++;
 }
 console.log('errors:',errs.slice(0,3));
 await b.close();
})();
