/* 08 · Display — frame sampler.
   node dev/dsp.js <outdir> [w] [h] [tag] */
const puppeteer = require('puppeteer');
const T = ms => new Promise(r => setTimeout(r, ms));

const OUT = process.argv[2] || './dev/shots';
const W = +(process.argv[3] || 1440), H = +(process.argv[4] || 900);
const TAG = process.argv[5] || 'd';

const MARKS = [
  ['00-seam',   -0.004],
  ['01-title',   0.062],
  ['02-rise',    0.190],
  ['03-case',    0.330],
  ['04-spread',  0.500],
  ['05-pair',    0.690],
  ['06-room',    0.830],
  ['07-fall',    0.950],
  ['08-out',     1.020]
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
    const s = document.getElementById('display');
    return { top: s.offsetTop, h: Math.round(s.getBoundingClientRect().height),
             cls: s.className, vh: innerHeight };
  });
  console.log(`display @${g.top}  track ${g.h}px  travel ${g.h - g.vh}px  [${g.cls}]`);

  for (const [name, prog] of MARKS) {
    const y = Math.round(g.top + (g.h - g.vh) * prog);
    await p.evaluate(v => {
      window.lenis ? window.lenis.scrollTo(v, { immediate: true }) : scrollTo(0, v);
      ScrollTrigger.update();
    }, y);
    await T(750);
    const s = await p.evaluate(() => {
      const tx = e => getComputedStyle(e).transform;
      const rings = [...document.querySelectorAll('[data-dsp-case]')]
        .map(e => (+getComputedStyle(e).opacity).toFixed(2)).join('/');
      const doc = document.documentElement;
      return {
        glow: (+getComputedStyle(document.querySelector('[data-dsp-glow]')).opacity).toFixed(2),
        bg: getComputedStyle(document.querySelector('.dsp__stage')).backgroundColor,
        cases: rings,
        ovf: doc.scrollWidth - doc.clientWidth
      };
    });
    await p.screenshot({ path: `${OUT}/dsp-${TAG}-${name}.png` });
    console.log(` ${name.padEnd(10)} p=${String(prog).padEnd(7)} cases=${s.cases} glow=${s.glow} bg=${s.bg} ovf=${s.ovf}`);
  }
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no console errors');
  await b.close();
})();
