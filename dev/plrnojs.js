/* 03 · Anatomy — does the chapter still read with scripting off? */
const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({ headless:'new', args:['--no-sandbox'] });
  const p = await b.newPage();
  await p.setJavaScriptEnabled(false);
  await p.setViewport({ width:1440, height:900 });
  await p.goto('http://localhost:4321', { waitUntil:'networkidle2' });
  const r = await p.evaluate(() => {
    const s = document.getElementById('anatomy');
    const vis = el => { const c = getComputedStyle(el); return +c.opacity > .5 && c.visibility !== 'hidden' && c.display !== 'none'; };
    return {
      noJsClass: document.documentElement.classList.contains('no-js'),
      sectionH: Math.round(s.getBoundingClientRect().height),
      headings: [...s.querySelectorAll('h2,h3')].map(h => ({ t:h.textContent.trim().replace(/\s+/g,' '), vis:vis(h) })),
      bodies:  [...s.querySelectorAll('.plr__b')].map(vis),
      words:   [...s.querySelectorAll('.plr__word')].map(vis),
      stone:   vis(s.querySelector('.plr__stone-in')),
      hOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });
  console.log(JSON.stringify(r, null, 1));
  await b.close();
})();
