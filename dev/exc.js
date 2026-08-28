/* 08 · Exclusive — frame sampler.
   node dev/exc.js <outdir> [w] [h] [tag] */
const puppeteer = require('puppeteer');
const T = ms => new Promise(r => setTimeout(r, ms));

const OUT = process.argv[2] || './dev/shots';
const W = +(process.argv[3] || 1440), H = +(process.argv[4] || 900);
const TAG = process.argv[5] || 'd';

const MARKS = [
  ['00-seam',  -0.004],
  ['01-title',  0.062],
  ['02-row1',   0.250],
  ['03-row2',   0.356],
  ['04-row3',   0.470],
  ['05-claim1', 0.590],
  ['06-claim2', 0.780],
  ['07-close',  0.950],
  ['08-out',    1.020]
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
    const s = document.getElementById('exclusive');
    return { top: s.offsetTop, h: Math.round(s.getBoundingClientRect().height),
             cls: s.className, vh: innerHeight };
  });
  console.log(`exclusive @${g.top}  track ${g.h}px  travel ${g.h - g.vh}px  [${g.cls}]`);

  for (const [name, prog] of MARKS) {
    const y = Math.round(g.top + (g.h - g.vh) * prog);
    await p.evaluate(v => {
      window.lenis ? window.lenis.scrollTo(v, { immediate: true }) : scrollTo(0, v);
      ScrollTrigger.update();
    }, y);
    await T(750);
    const s = await p.evaluate(() => {
      const doc = document.documentElement;
      const rows = [...document.querySelectorAll('[data-exc-row]')]
        .map(e => (+getComputedStyle(e).opacity).toFixed(2)).join('/');
      const cta = document.querySelector('[data-exc-cta]');
      const cs = getComputedStyle(cta);
      return {
        rows,
        claims: [...document.querySelectorAll('[data-exc-claim]')]
          .map(e => (+getComputedStyle(e).opacity).toFixed(2)).join('/'),
        cta: (+cs.opacity).toFixed(2) + ' pe:' + cs.pointerEvents,
        bg: getComputedStyle(document.querySelector('.exc__stage')).backgroundColor,
        ovf: doc.scrollWidth - doc.clientWidth
      };
    });
    await p.screenshot({ path: `${OUT}/exc-${TAG}-${name}.png` });
    console.log(` ${name.padEnd(9)} p=${String(prog).padEnd(7)} rows=${s.rows} claims=${s.claims} cta=${s.cta} ovf=${s.ovf}`);
  }
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no console errors');
  await b.close();
})();
