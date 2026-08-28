/* Reduced-motion and no-JS check for any pinned chapter.
   node dev/rmcheck.js <sectionId> <outdir> [w] [h] */
const puppeteer = require('puppeteer');
const T = ms => new Promise(r => setTimeout(r, ms));

const ID = process.argv[2];
const OUT = process.argv[3] || './dev/shots';
const W = +(process.argv[4] || 1440), H = +(process.argv[5] || 900);

async function shoot(b, { js, rm, tag, w, h }) {
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.setViewport({ width: w, height: h });
  if (rm) await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  if (!js) await p.setJavaScriptEnabled(false);
  await p.goto('http://localhost:4321', { waitUntil: 'networkidle2' });
  await T(js ? 4200 : 1800);

  const g = await p.evaluate(id => {
    const s = document.getElementById(id);
    const stage = s.firstElementChild;
    const txt = [...s.querySelectorAll('h1,h2,h3,p,li,figcaption')]
      .filter(e => e.textContent.trim())
      .map(e => {
        const cs = getComputedStyle(e);
        const r = e.getBoundingClientRect();
        return { o: +cs.opacity, vis: cs.visibility, w: Math.round(r.width) };
      });
    const imgs = [...s.querySelectorAll('img')].map(e => +getComputedStyle(e).opacity);
    return {
      cls: s.className, h: Math.round(s.getBoundingClientRect().height),
      top: Math.round(s.offsetTop), pos: getComputedStyle(stage).position,
      lines: txt.length,
      hidden: txt.filter(x => x.o < 0.9 || x.vis === 'hidden' || x.w === 0).length,
      imgs: imgs.length, imgsHidden: imgs.filter(o => o < 0.9).length,
      ovf: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  }, ID);
  console.log(`${tag.padEnd(7)} ${w}x${h}  h=${String(g.h).padEnd(5)} pos=${g.pos.padEnd(8)} ` +
              `cls="${g.cls}"  text ${g.lines - g.hidden}/${g.lines}  ` +
              `img ${g.imgs - g.imgsHidden}/${g.imgs}  ovf=${g.ovf}` +
              (errs.length ? '  ERR: ' + errs.join('|') : ''));
  await p.evaluate(y => scrollTo(0, y), g.top + g.h * 0.4);
  await T(800);
  await p.screenshot({ path: `${OUT}/${ID}-${tag}.png` });
  await p.close();
}

(async () => {
  const b = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required']
  });
  await shoot(b, { js: true,  rm: true,  tag: 'rm',    w: W, h: H });
  await shoot(b, { js: true,  rm: true,  tag: 'rmmob', w: 390, h: 844 });
  await shoot(b, { js: false, rm: false, tag: 'nojs',  w: W, h: H });
  await b.close();
})();
