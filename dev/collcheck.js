/* 06 · Collection — reduced-motion and no-JS integrity */
const puppeteer = require('puppeteer');
const T = ms => new Promise(r => setTimeout(r, ms));

const probe = () => {
  const s = document.getElementById('collection');
  const vis = el => { const c = getComputedStyle(el); return +c.opacity > .5 && c.visibility !== 'hidden' && c.display !== 'none'; };
  const txt = el => el.textContent.replace(/\s+/g, ' ').trim();
  return {
    classes: s.className,
    height: Math.round(s.getBoundingClientRect().height),
    pinned: !!document.querySelector('.pin-spacer'),
    products: [...s.querySelectorAll('[data-cl="product"]')].map(el => ({
      sku: txt(el.querySelector('.cl__sku')),
      spec: txt(el.querySelector('.cl__cut')) + ' ' + txt(el.querySelector('.cl__ct')) + ' ' + txt(el.querySelector('.cl__spec')),
      vis: vis(el), plateVis: vis(el.querySelector('.cl__plate'))
    })),
    lifestyle: [...s.querySelectorAll('[data-cl="life"]')].map(vis),
    statement: vis(s.querySelector('.coll__stmt')),
    metals: vis(s.querySelector('.coll__metals')),
    finale: vis(s.querySelector('.coll__final')),
    cta: vis(s.querySelector('.coll__cta')),
    altsMissing: [...s.querySelectorAll('img')].filter(i => i.hasAttribute('alt') === false).length,
    lazy: [...s.querySelectorAll('img')].every(i => i.loading === 'lazy'),
    hOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
  };
};

(async () => {
  const b = await puppeteer.launch({ headless:'new', args:['--no-sandbox'] });

  let p = await b.newPage();
  await p.setViewport({ width:1440, height:900 });
  await p.emulateMediaFeatures([{ name:'prefers-reduced-motion', value:'reduce' }]);
  await p.goto('http://localhost:4321', { waitUntil:'networkidle2' });
  await T(2500);
  const rm = await p.evaluate(probe);
  await p.evaluate(() => document.getElementById('collection').scrollIntoView());
  await T(700);
  await p.screenshot({ path:'./dev/shots/coll-reduced.png' });
  await p.close();

  p = await b.newPage();
  await p.setJavaScriptEnabled(false);
  await p.setViewport({ width:1440, height:900 });
  await p.goto('http://localhost:4321', { waitUntil:'networkidle2' });
  const nj = await p.evaluate(probe);
  await p.close();

  const sum = (label, r) => {
    console.log(`\n== ${label} ==`);
    console.log(` classes: ${r.classes} | height ${r.height}px | pinned ${r.pinned} | hOverflow ${r.hOverflow}`);
    console.log(` products visible: ${r.products.filter(x => x.vis).length}/9, plates: ${r.products.filter(x => x.plateVis).length}/9`);
    console.log(` lifestyle ${r.lifestyle.filter(Boolean).length}/2 | statement ${r.statement} | metals ${r.metals} | finale ${r.finale} | cta ${r.cta}`);
    console.log(` alts missing: ${r.altsMissing} | all lazy: ${r.lazy}`);
    r.products.forEach(x => console.log(`   ${x.sku.padEnd(18)} ${x.spec}`));
  };
  sum('reduced motion', rm);
  sum('no JavaScript', nj);
  await b.close();
})();
