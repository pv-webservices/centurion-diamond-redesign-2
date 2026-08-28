/* 04 · A Study in Light — frame sampler.
   node dev/sty.js <outdir> [w] [h] [tag]
   Walks the section's own progress space and shoots each beat. */
const puppeteer = require('puppeteer');
const T = ms => new Promise(r => setTimeout(r, ms));

const OUT = process.argv[2] || './dev/shots';
const W = +(process.argv[3] || 1440), H = +(process.argv[4] || 900);
const TAG = process.argv[5] || 'd';

const MARKS = [
  ['00-seam',   -0.004],   // the frame Anatomy hands over
  ['01-title',   0.055],
  ['02-enters',  0.235],
  ['03-emerge',  0.400],
  ['04-moves',   0.545],
  ['05-returns', 0.700],
  ['06-facets',  0.800],
  ['07-lead',    0.905],
  ['08-domin',   0.945],
  ['09-shut',    0.972],
  ['10-beam',    0.992],
  ['11-marquee', 1.02]
];

(async () => {
  const b = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required']
  });
  const p = await b.newPage();
  await p.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await p.goto('http://localhost:4321', { waitUntil: 'networkidle2' });
  await T(4500);

  const g = await p.evaluate(() => {
    const s = document.getElementById('study');
    return { top: s.offsetTop, h: Math.round(s.getBoundingClientRect().height),
             cls: s.className, vh: innerHeight };
  });
  console.log(`study @${g.top}  track ${g.h}px  travel ${g.h - g.vh}px  [${g.cls}]`);

  for (const [name, prog] of MARKS) {
    const y = Math.round(g.top + (g.h - g.vh) * prog);
    await p.evaluate(v => {
      window.lenis ? window.lenis.scrollTo(v, { immediate: true }) : scrollTo(0, v);
      ScrollTrigger.update();
    }, y);
    await T(900);
    const s = await p.evaluate(() => {
      const st = document.querySelector('.sty__stage');
      const m = document.querySelector('[data-sty-media]');
      const v = document.querySelector('[data-sty-video]');
      const t = document.querySelector('[data-sty-sh="t"]');
      const doc = document.documentElement;
      return {
        bg: getComputedStyle(st).backgroundColor,
        body: getComputedStyle(document.body).backgroundColor,
        mediaO: +getComputedStyle(m).opacity,
        filt: getComputedStyle(v).filter,
        time: v.currentTime.toFixed(2),
        shT: getComputedStyle(t).transform,
        ovf: doc.scrollWidth - doc.clientWidth
      };
    });
    await p.screenshot({ path: `${OUT}/sty-${TAG}-${name}.png` });
    console.log(` ${name.padEnd(11)} p=${String(prog).padEnd(7)} o=${s.mediaO.toFixed(2)} t=${s.time}s ` +
                `bg=${s.bg} ovf=${s.ovf} ${s.filt}`);
  }
  await b.close();
})();
