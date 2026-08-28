/* land exactly on each collection slot and shoot it */
const puppeteer=require('puppeteer'); const fs=require('fs');
const T=ms=>new Promise(r=>setTimeout(r,ms));
const OUT=process.argv[2], W=+(process.argv[3]||390), H=+(process.argv[4]||844), TAG=process.argv[5]||'m';
const MOB = process.env.DESKTOP!=='1';
(async()=>{
 fs.mkdirSync(OUT,{recursive:true});
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 const p=await b.newPage(); await p.setViewport({width:W,height:H,isMobile:MOB,hasTouch:MOB});
 const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://localhost:4321',{waitUntil:'networkidle2'}); await T(4500);
 const g=await p.evaluate(()=>{const e=document.getElementById('collection');const r=e.getBoundingClientRect();
   return {top:Math.round(r.top+window.scrollY),h:Math.round(r.height),n:document.querySelectorAll('[data-cl]').length};});
 const cfg = await p.evaluate(()=>JSON.parse(JSON.stringify(CD.collection)));
 const progs=[];
 for(let i=0;i<g.n;i++) progs.push(await p.evaluate((i,n)=>CD.collectionTimeline.progressForSlot(CD.collection,i,n),i,g.n));
 // plus the intro, the held statement, the metals beat and the finale
 const extra=[0.02,0.10,0.17,0.60,0.88,0.93,0.99];
 const all = progs.map((v,i)=>({tag:'slot'+String(i).padStart(2,'0'),p:v})).concat(extra.map((v,i)=>({tag:'x'+i,p:v})));
 const rep=[];
 for(const s of all){
   const y=g.top+(g.h-H)*s.p;
   await p.evaluate(v=>{window.lenis?window.lenis.scrollTo(v,{immediate:true}):window.scrollTo(0,v); if(window.ScrollTrigger)ScrollTrigger.update();},y);
   await T(650);
   await p.screenshot({path:`${OUT}/${TAG}-${s.tag}.png`});
   const m=await p.evaluate(()=>{
     const de=document.documentElement;
     const act=[...document.querySelectorAll('[data-cl]')].map((el,i)=>{const o=+getComputedStyle(el).opacity;
       if(o<0.2)return null; const st=el.querySelector('.cl__stone,.cl__frame').getBoundingClientRect();
       const pl=el.querySelector('.cl__plate'); const po=pl?+getComputedStyle(pl).opacity:0;
       return {i,o:+o.toFixed(2),L:Math.round(st.left),R:Math.round(st.right),T:Math.round(st.top),B:Math.round(st.bottom),plate:+po.toFixed(2)};}).filter(Boolean);
     const nav=document.querySelector('[data-coll-nav]'), met=document.querySelector('[data-coll-metals]');
     const nb=nav.getBoundingClientRect(), mb=met.getBoundingClientRect();
     return {act,nav:{o:+(+getComputedStyle(nav).opacity).toFixed(2),T:Math.round(nb.top),B:Math.round(nb.bottom)},
             met:{o:+(+getComputedStyle(met).opacity).toFixed(2),T:Math.round(mb.top),B:Math.round(mb.bottom)},sw:de.scrollWidth,cw:de.clientWidth};});
   rep.push({...s,...m});
 }
 rep.forEach(r=>console.log(`${r.tag} p=${r.p.toFixed(3)} nav[${r.nav.T},${r.nav.B}]o${r.nav.o} met[${r.met.T},${r.met.B}]o${r.met.o} :: `+r.act.map(a=>`#${a.i}o${a.o}x[${a.L},${a.R}]y[${a.T},${a.B}]pl${a.plate}`).join(' ')));
 console.log('errors:',errs.slice(0,3));
 await b.close();
})();
