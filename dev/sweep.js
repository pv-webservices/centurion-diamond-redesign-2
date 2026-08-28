/* Whole-page regression sweep: overflow, console errors, section heights.
   node dev/sweep.js */
const puppeteer = require('puppeteer');
const T = ms => new Promise(r => setTimeout(r, ms));

const VIEWPORTS = [[1920, 1080], [1440, 900], [1366, 768], [1024, 768], [768, 1024], [430, 932], [390, 844]];
const SECTIONS = ['chero', 'cut', 'anatomy', 'study', 'collection', 'worn', 'metals', 'display', 'exclusive', 'contact'];

(async () => {
  const b = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required']
  });
  let bad = 0;
  for (const [w, h] of VIEWPORTS) {
    const p = await b.newPage();
    const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.setViewport({ width: w, height: h });
    await p.goto('http://localhost:4321', { waitUntil: 'networkidle2' });
    await T(4000);

    const H = await p.evaluate(() => document.body.scrollHeight);
    let ovf = 0;
    for (let i = 0; i <= 40; i++) {
      await p.evaluate(y => {
        window.lenis ? window.lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y);
        ScrollTrigger.update();
      }, Math.round(H * i / 40));
      await T(110);
      ovf = Math.max(ovf, await p.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth));
    }
    const secs = await p.evaluate(ids => ids.map(id => {
      const e = document.getElementById(id);
      return id + ':' + (e ? Math.round(e.getBoundingClientRect().height) : 'MISSING');
    }).join(' '), SECTIONS);

    const ok = ovf === 0 && errs.length === 0 && !secs.includes('MISSING');
    if (!ok) bad++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${w}x${h}  ovf=${ovf}  err=${errs.length ? errs.join('|') : 'none'}`);
    console.log(`       ${secs}`);
    await p.close();
  }
  console.log(bad ? `\n${bad} viewport(s) failed` : '\nall viewports clean');
  await b.close();
})();
