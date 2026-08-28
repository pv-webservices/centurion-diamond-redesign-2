/* does anything in the Collection overflow its own stage? */
const puppeteer = require('puppeteer');
const T = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ headless:'new', args:['--no-sandbox','--autoplay-policy=no-user-gesture-required'] });
  for (const [w,h] of [[1920,1080],[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844]]) {
    const p = await b.newPage();
    await p.setViewport({ width:w, height:h });
    await p.goto('http://localhost:4321', { waitUntil:'networkidle2' });
    await T(4200);
    const r = await p.evaluate(() => {
      const s = document.getElementById('collection');
      const stage = s.querySelector('.coll__stage');
      const sb = stage.getBoundingClientRect();
      const bad = [];
      // type that must never be clipped by the stage
      s.querySelectorAll('.coll__h2,.coll__stmtT,.coll__finalT,.coll__lede,.cl__cut,.cl__spec,.cl__sku,.coll__metals,.coll__nav')
        .forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.width === 0) return;
          if (r.left < sb.left - 1 || r.right > sb.right + 1) {
            bad.push((el.className||el.tagName).toString().split(' ')[0] +
              ' L' + Math.round(r.left - sb.left) + ' R' + Math.round(r.right - sb.right));
          }
        });
      return { bad: bad.slice(0, 8), docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
    });
    console.log(`${w}x${h}  docOverflow=${r.docOverflow}  clipped=${r.bad.length ? r.bad.join(' | ') : 'none'}`);
    await p.close();
  }
  await b.close();
})();
