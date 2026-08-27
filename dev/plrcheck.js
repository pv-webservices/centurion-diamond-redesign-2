/* 03 · Anatomy — sheen render check + reduced-motion check */
const puppeteer = require('puppeteer');
const T = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const b = await puppeteer.launch({ headless:'new', args:['--no-sandbox','--autoplay-policy=no-user-gesture-required'] });

  // --- 1. sheen at a light-pass moment ---
  let p = await b.newPage();
  await p.setViewport({ width:1440, height:900 });
  await p.goto('http://localhost:4321', { waitUntil:'networkidle2' });
  await T(5200);
  const geo = await p.evaluate(() => {
    const s = document.getElementById('anatomy');
    return { top:s.offsetTop, h:Math.round(s.getBoundingClientRect().height) };
  });
  const track = geo.h - 900;
  for (const prog of [0.273, 0.440, 0.987]) {
    await p.evaluate(v => { window.lenis ? lenis.scrollTo(v,{immediate:true}) : scrollTo(0,v); ScrollTrigger.update(); },
      Math.round(geo.top + track*prog));
    await T(700);
    const s = await p.evaluate(() => {
      const el = document.querySelector('[data-plr-stone] .plr__sheen');
      const i  = el.querySelector('i');
      const cs = getComputedStyle(el), ci = getComputedStyle(i);
      return { barOpacity:ci.opacity, mask:(cs.maskImage||cs.webkitMaskImage||'').slice(0,54),
               bar:ci.transform.slice(0,40) };
    });
    console.log(`sheen @ p=${prog}:`, JSON.stringify(s));
    await p.screenshot({ path:`./dev/shots/plr-sheen-${prog}.png` });
  }
  await p.close();

  // --- 2. reduced motion ---
  p = await b.newPage();
  await p.setViewport({ width:1440, height:900 });
  await p.emulateMediaFeatures([{ name:'prefers-reduced-motion', value:'reduce' }]);
  await p.goto('http://localhost:4321', { waitUntil:'networkidle2' });
  await T(2500);
  const rm = await p.evaluate(() => {
    const s = document.getElementById('anatomy');
    const scenes = [...s.querySelectorAll('.plr__scene')].map(el => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { opacity:+cs.opacity, vis:cs.visibility, h:Math.round(r.height) };
    });
    return {
      reducedClass: s.classList.contains('is-reduced'),
      sectionH: Math.round(s.getBoundingClientRect().height),
      pinned: !!document.querySelector('.pin-spacer'),
      scenes,
      stoneOpacity: +getComputedStyle(s.querySelector('.plr__stone-in')).opacity,
      words: [...s.querySelectorAll('.plr__word')].map(w => +getComputedStyle(w).opacity),
      hOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });
  console.log('reduced motion:', JSON.stringify(rm, null, 1));
  await p.evaluate(() => document.getElementById('anatomy').scrollIntoView());
  await T(600);
  await p.screenshot({ path:'./dev/shots/plr-reduced.png', fullPage:false });
  await b.close();
})();
