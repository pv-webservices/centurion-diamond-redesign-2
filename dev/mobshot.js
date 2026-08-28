/* mobile section scrubber: shoot each target section at a set of progress points */
const puppeteer = require('puppeteer');
const fs = require('fs');
const T = ms => new Promise(r => setTimeout(r, ms));

const OUT = process.argv[2] || './dev/shots/mob';
const W = parseInt(process.argv[3] || '390', 10);
const H = parseInt(process.argv[4] || '844', 10);
const TAG = process.argv[5] || 'm';
const ONLY = (process.argv[6] || '').split(',').filter(Boolean);

const TARGETS = {
  chero:      [0, .12, .28, .42, .56, .70, .84, .96],
  anatomy:    [0, .10, .24, .34, .44, .55, .66, .76, .86, .96],
  collection: [.06, .16, .26, .36, .46, .56, .66, .76, .86, .95],
  worn:       [.04, .14, .24, .34, .44, .54, .64, .74, .84, .94],
  display:    [.04, .16, .28, .40, .52, .64, .76, .88, .97]
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage();
  var MOB = process.env.DESKTOP !== '1';
  await p.setViewport({ width: W, height: H, deviceScaleFactor: 1, isMobile: MOB, hasTouch: MOB });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('http://localhost:4321', { waitUntil: 'networkidle2', timeout: 60000 });
  await T(4500);

  const names = Object.keys(TARGETS).filter(n => !ONLY.length || ONLY.includes(n));
  const report = { viewport: W + 'x' + H, sections: {}, errors: [] };

  for (const name of names) {
    const g = await p.evaluate(id => {
      const el = document.getElementById(id);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: Math.round(r.top + window.scrollY), h: Math.round(r.height) };
    }, name);
    if (!g) { report.sections[name] = 'MISSING'; continue; }
    report.sections[name] = g;
    let i = 0;
    for (const prog of TARGETS[name]) {
      const y = g.top + (g.h - H) * prog;
      await p.evaluate(v => { window.lenis ? window.lenis.scrollTo(v, { immediate: true }) : window.scrollTo(0, v); if (window.ScrollTrigger) ScrollTrigger.update(); }, y);
      await T(700);
      await p.screenshot({ path: `${OUT}/${TAG}-${name}-${String(i).padStart(2,'0')}.png` });
      i++;
    }
  }

  const ov = await p.evaluate(() => {
    const de = document.documentElement;
    const bad = [];
    document.querySelectorAll('body *').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && (r.right > de.clientWidth + 2 || r.left < -2) && getComputedStyle(el).position !== 'fixed') {
        bad.push((el.className || el.tagName) + ' L' + Math.round(r.left) + ' R' + Math.round(r.right));
      }
    });
    return { scrollW: de.scrollWidth, clientW: de.clientWidth, sample: bad.slice(0, 12) };
  });
  report.overflow = ov;
  report.errors = errs.slice(0, 10);
  console.log(JSON.stringify(report, null, 1));
  await b.close();
})();
