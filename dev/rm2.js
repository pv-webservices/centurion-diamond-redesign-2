const puppeteer=require('puppeteer');
const T=s=>new Promise(r=>setTimeout(r,s));
(async()=>{const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
const p=await b.newPage(); await p.setViewport({width:1440,height:900});
await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
const e=[]; p.on('pageerror',x=>e.push(x.message));
await p.goto('http://localhost:4321',{waitUntil:'networkidle2'}); await T(4000);
const r=await p.evaluate(()=>({
  reducedClass: document.getElementById('chero').classList.contains('is-reduced'),
  heroH: Math.round(document.getElementById('chero').getBoundingClientRect().height),
  scenesVisible: [...document.querySelectorAll('.cscene')].filter(el=>+getComputedStyle(el).opacity>0.9).length,
  ctaVisible: +getComputedStyle(document.querySelector('.chero__cta')).opacity,
  pinned: ScrollTrigger.getAll().filter(t=>t.pin).length,
  videoPaused: document.querySelector('[data-hero-video]').paused
}));
console.log(r); console.log('errors:', e.length?e:'none');
await p.screenshot({path:process.argv[2]+'/reduced.png'});
await b.close();})();
