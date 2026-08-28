/* 08 · Metals — frame sampler.
   node dev/mtl.js <outdir> [w] [h] [tag] */
const puppeteer = require('puppeteer');
const T = ms => new Promise(r => setTimeout(r, ms));

const OUT = process.argv[2] || './dev/shots';
const W = +(process.argv[3] || 1440), H = +(process.argv[4] || 900);
const TAG = process.argv[5] || 'd';

const MARKS = [
  ['00-seam',    -0.004],
  ['01-title',    0.060],
  ['02-wipe',     0.145],
  ['03-platinum', 0.270],
  ['04-wipe2',    0.400],
  ['05-yellow',   0.520],
  ['06-retreat',  0.662],
  ['07-twotone',  0.780],
  ['08-claim',    0.920],
  ['09-drain',    0.985],
  ['10-display',  1.020]
];

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
    const s = document.getElementById('metals');
    return { top: s.offsetTop, h: Math.round(s.getBoundingClientRect().height),
             cls: s.className, vh: innerHeight };
  });
  console.log(`metals @${g.top}  track ${g.h}px  travel ${g.h - g.vh}px  [${g.cls}]`);

  for (const [name, prog] of MARKS) {
    const y = Math.round(g.top + (g.h - g.vh) * prog);
    await p.evaluate(v => {
      window.lenis ? window.lenis.scrollTo(v, { immediate: true }) : scrollTo(0, v);
      ScrollTrigger.update();
    }, y);
    await T(750);
    const s = await p.evaluate(() => {
      const tx = e => getComputedStyle(e).transform;
      const rings = [...document.querySelectorAll('[data-mtl-ring]')]
        .map(e => (+getComputedStyle(e).opacity).toFixed(2)).join('/');
      const doc = document.documentElement;
      return {
        pt: tx(document.querySelector('[data-mtl-panel="pt"]')).slice(0, 42),
        rings,
        drain: (+getComputedStyle(document.querySelector('[data-mtl-drain]')).opacity).toFixed(2),
        ovf: doc.scrollWidth - doc.clientWidth
      };
    });
    await p.screenshot({ path: `${OUT}/mtl-${TAG}-${name}.png` });
    console.log(` ${name.padEnd(11)} p=${String(prog).padEnd(7)} rings=${s.rings} drain=${s.drain} ovf=${s.ovf}`);
  }
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no console errors');
  await b.close();
})();
