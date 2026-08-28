/* 07 · Worn — frame sampler.
   node dev/wrn.js <outdir> [w] [h] [tag] */
const puppeteer = require('puppeteer');
const T = ms => new Promise(r => setTimeout(r, ms));

const OUT = process.argv[2] || './dev/shots';
const W = +(process.argv[3] || 1440), H = +(process.argv[4] || 900);
const TAG = process.argv[5] || 'd';

const MARKS = [
  ['00-seam',   -0.004],
  ['01-title',   0.070],
  ['02-first',   0.250],
  ['03-hold',    0.320],
  ['04-second',  0.490],
  ['05-hold2',   0.570],
  ['06-gather',  0.760],
  ['07-spread',  0.860],
  ['08-out',     0.960],
  ['09-metals',  1.020]
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
    const s = document.getElementById('worn');
    return { top: s.offsetTop, h: Math.round(s.getBoundingClientRect().height),
             cls: s.className, vh: innerHeight };
  });
  console.log(`worn @${g.top}  track ${g.h}px  travel ${g.h - g.vh}px  [${g.cls}]`);

  for (const [name, prog] of MARKS) {
    const y = Math.round(g.top + (g.h - g.vh) * prog);
    await p.evaluate(v => {
      window.lenis ? window.lenis.scrollTo(v, { immediate: true }) : scrollTo(0, v);
      ScrollTrigger.update();
    }, y);
    await T(750);
    const s = await p.evaluate(() => {
      const st = document.querySelector('.wrn__stage');
      const film = document.querySelector('[data-wrn-film]');
      const vis = [...document.querySelectorAll('[data-wrn-plate]')]
        .filter(e => +getComputedStyle(e).opacity > 0.02).length;
      const doc = document.documentElement;
      return { bg: getComputedStyle(st).backgroundColor,
               filt: getComputedStyle(film).filter,
               plates: vis,
               ovf: doc.scrollWidth - doc.clientWidth };
    });
    await p.screenshot({ path: `${OUT}/wrn-${TAG}-${name}.png` });
    console.log(` ${name.padEnd(10)} p=${String(prog).padEnd(7)} plates=${s.plates} bg=${s.bg} ovf=${s.ovf}  ${s.filt}`);
  }
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no console errors');
  await b.close();
})();
