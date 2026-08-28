/* 04 · A Study in Light — reduced-motion and no-JS checks.
   node dev/styrm.js <outdir> */
const puppeteer = require('puppeteer');
const T = ms => new Promise(r => setTimeout(r, ms));
const OUT = process.argv[2] || './dev/shots';

async function shoot(b, { js, rm, tag, w = 1440, h = 900 }) {
  const p = await b.newPage();
  await p.setViewport({ width: w, height: h });
  if (rm) await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  if (!js) await p.setJavaScriptEnabled(false);
  await p.goto('http://localhost:4321', { waitUntil: 'networkidle2' });
  await T(js ? 4000 : 1800);

  const g = await p.evaluate(() => {
    const s = document.getElementById('study');
    const r = s.getBoundingClientRect();
    const txt = [...s.querySelectorAll('.sty__ln > span, .sty__b')].map(e => {
      const cs = getComputedStyle(e);
      return { t: e.textContent.trim().slice(0, 26), o: cs.opacity, vis: cs.visibility };
    });
    const v = s.querySelector('[data-sty-video]');
    return {
      cls: s.className, h: Math.round(r.height),
      top: Math.round(s.offsetTop),
      pinned: getComputedStyle(s.querySelector('.sty__stage')).position,
      hidden: txt.filter(x => +x.o < 0.9 || x.vis === 'hidden').length,
      lines: txt.length,
      vsrc: (v && (v.currentSrc || v.getAttribute('src'))) || '(none)',
      vtime: v ? +v.currentTime.toFixed(2) : null,
      ovf: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });
  console.log(`${tag}: h=${g.h} pos=${g.pinned} cls="${g.cls}" ` +
              `text ${g.lines - g.hidden}/${g.lines} visible  ovf=${g.ovf}  t=${g.vtime}s`);
  await p.evaluate(y => scrollTo(0, y), g.top - 40);
  await T(900);
  await p.screenshot({ path: `${OUT}/sty-${tag}-a.png` });
  await p.evaluate(y => scrollTo(0, y), g.top + g.h * 0.45);
  await T(900);
  await p.screenshot({ path: `${OUT}/sty-${tag}-b.png` });
  await p.close();
}

(async () => {
  const b = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required']
  });
  await shoot(b, { js: true,  rm: true,  tag: 'rm' });
  await shoot(b, { js: true,  rm: true,  tag: 'rmmob', w: 390, h: 844 });
  await shoot(b, { js: false, rm: false, tag: 'nojs' });
  await b.close();
})();
