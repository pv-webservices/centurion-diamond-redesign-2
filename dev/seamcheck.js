/* Centre-of-screen colour straight across a section's two boundaries.
   node dev/seamcheck.js <sectionId> [w] [h] */
const puppeteer = require('puppeteer');
const T = ms => new Promise(r => setTimeout(r, ms));

const ID = process.argv[2];
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

  const g = await p.evaluate(id => {
    const s = document.getElementById(id);
    const r = s.getBoundingClientRect();
    return { top: s.offsetTop, h: Math.round(r.height), vh: innerHeight };
  }, ID);

  async function sample(y) {
    await p.evaluate(v => {
      window.lenis ? window.lenis.scrollTo(v, { immediate: true }) : scrollTo(0, v);
      ScrollTrigger.update();
    }, y);
    await T(650);
    const shot = await p.screenshot({ clip: { x: W / 2 - 4, y: H / 2 - 4, width: 8, height: 8 } });
    return p.evaluate(async d => {
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
    }, shot.toString('base64'));
  }

  console.log(`\ninto #${ID}`);
  for (const y of [g.top - 900, g.top - 300, g.top - 40, g.top, g.top + 40, g.top + 260]) {
    console.log(`  y=${String(y).padStart(6)}  rgb(${await sample(y)})`);
  }
  const out = g.top + g.h - g.vh;
  console.log(`out of #${ID}`);
  for (const y of [out - 240, out - 40, out, out + 200, out + 700]) {
    console.log(`  y=${String(y).padStart(6)}  rgb(${await sample(y)})`);
  }
  console.log(errs.length ? '\nERRORS:\n' + errs.join('\n') : '\nno console errors');
  await b.close();
})();
