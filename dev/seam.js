const puppeteer=require('puppeteer');const T=s=>new Promise(r=>setTimeout(r,s));
(async()=>{const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
const p=await b.newPage();await p.setViewport({width:1440,height:900});
await p.goto('http://localhost:4321',{waitUntil:'networkidle2'});await T(5000);
const g=await p.evaluate(()=>{const hero=document.getElementById('chero'),spk=document.getElementById('cut');
 return {heroTop:hero.offsetTop,heroH:Math.round(hero.getBoundingClientRect().height),
         spkTop:spk.offsetTop,spkH:Math.round(spk.getBoundingClientRect().height)};});
console.log('hero ends at', g.spkTop, '| sparkle track', g.spkH);
// sample straight across the boundary
const pts=[g.spkTop-700, g.spkTop-260, g.spkTop, g.spkTop+220, g.spkTop+460, g.spkTop+760];
for(let i=0;i<pts.length;i++){
  await p.evaluate(v=>{window.lenis?window.lenis.scrollTo(v,{immediate:true}):window.scrollTo(0,v);ScrollTrigger.update();},pts[i]);
  await T(800);
  const c=await p.evaluate(()=>{const s=document.querySelector('.spk__stage');
    return {bg:getComputedStyle(s).backgroundColor,
            body:getComputedStyle(document.body).backgroundColor};});
  await p.screenshot({path:`${process.argv[2]}/seam-${i}.png`});
  console.log(` y=${String(pts[i]).padStart(6)}  stage=${c.bg}`);
}
await b.close();})();
