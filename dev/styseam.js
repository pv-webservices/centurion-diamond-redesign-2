/* 04 · A Study in Light — the two seams, and the scrub's frame cost.
   node dev/styseam.js <outdir> [w] [h] */
const puppeteer = require('puppeteer');
const T = ms => new Promise(r => setTimeout(r, ms));
const OUT = process.argv[2] || './dev/shots';
const W = +(process.argv[3] || 1440), H = +(process.argv[4] || 900);

(async () => {
  const b = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required']
  });
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await p.setViewport({ width: W, height: H });
  await p.goto('http://localhost:4321', { waitUntil: 'networkidle2' });
  await T(4500);

  const g = await p.evaluate(() => {
    const s = document.getElementById('study');
    const a = document.getElementById('anatomy');
    const m = document.querySelector('.marq');
    return { sTop: s.offsetTop, sH: Math.round(s.getBoundingClientRect().height),
             aTop: a.offsetTop, mTop: m.offsetTop, vh: innerHeight };
  });

  /* --- centre-of-screen colour straight across each boundary --- */
  async function walk(label, pts) {
    console.log(`\n${label}`);
    for (const y of pts) {
      await p.evaluate(v => {
        window.lenis ? window.lenis.scrollTo(v, { immediate: true }) : scrollTo(0, v);
        ScrollTrigger.update();
      }, y);
      await T(700);
      const px = await p.screenshot({ clip: { x: W / 2 - 4, y: H / 2 - 4, width: 8, height: 8 } });
      // average the 8x8 patch straight from the PNG via a canvas in-page
      const avg = await p.evaluate(async d => {
        const img = new Image();
        img.src = 'data:image/png;base64,' + d;
        await img.decode();
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        const x = c.getContext('2d');
        x.drawImage(img, 0, 0);
        const px = x.getImageData(0, 0, c.width, c.height).data;
        let r = 0, gg = 0, bb = 0;
        for (let i = 0; i < px.length; i += 4) { r += px[i]; gg += px[i + 1]; bb += px[i + 2]; }
        const n = px.length / 4;
        return [r / n, gg / n, bb / n].map(v => Math.round(v)).join(',');
      }, px.toString('base64'));
      console.log(`  y=${String(y).padStart(6)}  centre rgb(${avg})`);
    }
  }

  await walk('anatomy → study  (the aperture seals to ink; the study opens on it)',
    [g.sTop - 900, g.sTop - 320, g.sTop - 60, g.sTop, g.sTop + 60, g.sTop + 300]);
  await walk('study → marquee  (the beam lands on the marquee rule)',
    [g.mTop - g.vh - 240, g.mTop - g.vh - 60, g.mTop - g.vh, g.mTop - g.vh + 200, g.mTop - 200]);

  /* --- frame cost across the whole pinned run --- */
  await p.evaluate(v => { window.lenis ? window.lenis.scrollTo(v, { immediate: true }) : scrollTo(0, v); }, g.sTop);
  await T(600);
  const perf = await p.evaluate(async (top, travel) => {
    const frames = [];
    let last = performance.now();
    let raf = () => {};
    const stop = new Promise(res => {
      let i = 0;
      raf = () => {
        const now = performance.now();
        frames.push(now - last); last = now;
        const y = top + travel * (i / 130);
        window.lenis ? window.lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y);
        ScrollTrigger.update();
        if (++i > 130) return res();
        requestAnimationFrame(raf);
      };
    });
    requestAnimationFrame(raf);
    await stop;
    frames.shift(); frames.shift();
    frames.sort((a, b) => a - b);
    const at = q => frames[Math.floor(frames.length * q)].toFixed(1);
    return { n: frames.length, p50: at(0.5), p90: at(0.9), p99: at(0.99), worst: frames[frames.length - 1].toFixed(1) };
  }, g.sTop, g.sH - g.vh);
  console.log(`\nframe time over the pinned run  p50 ${perf.p50}ms  p90 ${perf.p90}ms  p99 ${perf.p99}ms  worst ${perf.worst}ms  (n=${perf.n})`);
  console.log(errs.length ? '\nERRORS:\n' + errs.join('\n') : '\nno console errors');
  await b.close();
})();
