/* frame cost while scrubbing 03 · Anatomy, and specifically the aperture close */
const puppeteer = require('puppeteer');
const T = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const b = await puppeteer.launch({ headless:'new', args:['--no-sandbox','--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage();
  await p.setViewport({ width:1440, height:900 });
  await p.goto('http://localhost:4321', { waitUntil:'networkidle2' });
  await T(5200);

  const runs = await p.evaluate(async () => {
    const s = document.getElementById('anatomy');
    const top = s.offsetTop, track = s.getBoundingClientRect().height - innerHeight;

    function scrub(a, z, frames) {
      return new Promise(res => {
        const dt = [];
        let i = 0, last = performance.now();
        function step() {
          const t = i / frames;
          const y = Math.round(top + track * (a + (z - a) * t));
          window.lenis ? lenis.scrollTo(y, { immediate:true }) : scrollTo(0, y);
          if (window.ScrollTrigger) ScrollTrigger.update();
          const now = performance.now();
          if (i) dt.push(now - last);
          last = now;
          if (++i > frames) return res(dt);
          requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }
    function stats(d) {
      const s = [...d].sort((a, b) => a - b);
      return { frames:d.length, median:+s[s.length >> 1].toFixed(1),
               p95:+s[Math.floor(s.length * .95)].toFixed(1), max:+s[s.length - 1].toFixed(1) };
    }
    const whole   = stats(await scrub(0, 1, 220));
    const scenes  = stats(await scrub(0.20, 0.80, 140));
    const closing = stats(await scrub(0.90, 1.00, 90));
    return { whole, scenes, closing };
  });

  console.log('frame intervals in ms (16.7 = 60fps):');
  console.log(JSON.stringify(runs, null, 1));
  await b.close();
})();
