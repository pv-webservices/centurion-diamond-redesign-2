/* what is actually costing frames during the aperture? */
const puppeteer = require('puppeteer');
const T = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ headless:'new', args:['--no-sandbox','--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage();
  await p.setViewport({ width:1440, height:900 });
  await p.goto('http://localhost:4321', { waitUntil:'networkidle2' });
  await T(5200);
  await p.evaluate(async () => {   // warm every image first
    const s = document.getElementById('collection');
    const imgs = [...s.querySelectorAll('img')];
    imgs.forEach(i => i.loading = 'eager');
    await Promise.all(imgs.map(i => i.complete ? null : new Promise(r => { i.onload = r; i.onerror = r; })));
  });
  await T(1500);

  const run = await p.evaluate(async () => {
    const s = document.getElementById('collection');
    const top = s.offsetTop, track = s.getBoundingClientRect().height - innerHeight;
    function scrub(a, z, frames) {
      return new Promise(res => {
        const dt = []; let i = 0, last = performance.now();
        (function step() {
          const t = i / frames;
          const y = Math.round(top + track * (a + (z - a) * t));
          window.lenis ? lenis.scrollTo(y, { immediate:true }) : scrollTo(0, y);
          if (window.ScrollTrigger) ScrollTrigger.update();
          const now = performance.now();
          if (i) dt.push(now - last);
          last = now;
          if (++i > frames) return res(dt);
          requestAnimationFrame(step);
        })();
      });
    }
    const stats = d => { const x = [...d].sort((a,b)=>a-b);
      return { median:+x[x.length>>1].toFixed(1), p95:+x[Math.floor(x.length*.95)].toFixed(1) }; };
    const grain = s.querySelector('.coll__grain');
    const iris  = s.querySelector('.coll__iris');

    const base    = stats(await scrub(0, 0.14, 70));
    grain.style.display = 'none';
    const noGrain = stats(await scrub(0, 0.14, 70));
    iris.style.display = 'none';
    const neither = stats(await scrub(0, 0.14, 70));
    grain.style.display = ''; 
    const noIris  = stats(await scrub(0, 0.14, 70));
    iris.style.display = '';
    return { base, noGrain, noIris, neither };
  });
  console.log('aperture window, frame intervals (ms):');
  console.log(JSON.stringify(run, null, 1));
  await b.close();
})();
