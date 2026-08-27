const puppeteer=require('puppeteer');const T=s=>new Promise(r=>setTimeout(r,s));
(async()=>{const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
const p=await b.newPage();await p.setViewport({width:1440,height:900});
await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
const e=[];p.on('pageerror',x=>e.push(x.message));
await p.goto('http://localhost:4321',{waitUntil:'networkidle2'});await T(4000);
const r=await p.evaluate(()=>{const s=document.getElementById('cut');
 return {reduced:s.classList.contains('is-reduced'),
  pinned:ScrollTrigger.getAll().filter(t=>t.pin).length,
  intro:+getComputedStyle(s.querySelector('.spk__intro')).opacity,
  field:+getComputedStyle(s.querySelector('.spk__field')).opacity,
  cuts:[...s.querySelectorAll('.cut')].map(c=>+getComputedStyle(c).opacity),
  nums:[...s.querySelectorAll('[data-count-to]')].map(n=>n.textContent),
  words:[...s.querySelectorAll('.spk__word')].map(w=>+getComputedStyle(w).opacity),
  drawn:[...s.querySelectorAll('.cut__rail line')].filter(l=>parseFloat(l.style.strokeDashoffset||'1')===0).length,
  bg:getComputedStyle(s.querySelector('.spk__stage')).backgroundColor};});
console.log(JSON.stringify(r)); console.log('errors:',e.length?e:'none');
await p.evaluate(()=>document.getElementById('cut').scrollIntoView());
await T(700); await p.screenshot({path:process.argv[2]+'/spk-reduced.png',fullPage:false});
await b.close();})();
