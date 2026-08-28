/* 06 · The Collection — scene-by-scene capture at one viewport.
   usage: node dev/plr.js <outDir> <w> <h> [tag] */
const puppeteer = require('puppeteer');
const T = ms => new Promise(r => setTimeout(r, ms));

const OUT = process.argv[2] || './dev/shots';
const W = parseInt(process.argv[3] || '1440', 10);
const H = parseInt(process.argv[4] || '900', 10);
const TAG = process.argv[5] || `${W}x${H}`;

// master-progress samples: seam in, title, four benefits, final, aperture, seam out
const STOPS = [-0.04, 0.03, 0.07, 0.115, 0.165, 0.212, 0.264, 0.316, 0.419, 0.52,
  0.60, 0.641, 0.693, 0.796, 0.848, 0.893, 0.945, 0.99, 1.04];

(async () => {
  const b = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--autoplay-policy=no-user-gesture-required']
  });
  const p = await b.newPage();
  await p.setViewport({ width: W, height: H, deviceScaleFactor: 1 });

  const errs = [];
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));

  await p.goto('http://localhost:4321', { waitUntil: 'networkidle2', timeout: 60000 });
  await T(5200);                                   // preloader

  const geo = await p.evaluate(() => {
    const s = document.getElementById('collection');
    const st = document.getElementById('study');
    return {
      top: Math.round(s.offsetTop),
      h: Math.round(s.getBoundingClientRect().height),
      studyTop: Math.round(st.offsetTop),
      docH: document.documentElement.scrollHeight
    };
  });

  const track = geo.h - H;                         // pinSpacing:false → progress span
  const rows = [];
  for (let i = 0; i < STOPS.length; i++) {
    const y = Math.round(geo.top + track * STOPS[i]);
    await p.evaluate(v => {
      window.lenis ? window.lenis.scrollTo(v, { immediate: true }) : window.scrollTo(0, v);
      if (window.ScrollTrigger) ScrollTrigger.update();
    }, y);
    await T(700);
    const probe = await p.evaluate(() => {
      const st = document.querySelector('.plr__stage');
      const de = document.documentElement;
      return {
        bg: st ? getComputedStyle(st).backgroundColor : null,
        overflow: de.scrollWidth - de.clientWidth,
        body: getComputedStyle(document.body).backgroundColor
      };
    });
    const f = `${OUT}/coll-${TAG}-${String(i).padStart(2, '0')}.png`;
    await p.screenshot({ path: f });
    rows.push({ p: STOPS[i], y, bg: probe.bg, hOverflow: probe.overflow });
  }

  console.log(JSON.stringify({
    viewport: `${W}x${H}`, geo, track,
    maxHorizontalOverflow: Math.max(...rows.map(r => r.hOverflow)),
    frames: rows, errors: errs.slice(0, 12)
  }, null, 1));
  await b.close();
})();
