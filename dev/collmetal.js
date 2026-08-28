/* the metal selector and the directional controls */
const puppeteer = require('puppeteer');
const T = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ headless:'new', args:['--no-sandbox','--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage();
  await p.setViewport({ width:1440, height:900 });
  await p.goto('http://localhost:4321', { waitUntil:'networkidle2' });
  await T(5200);

  // park in the middle of the rail, where the selector is live
  await p.evaluate(() => {
    const s = document.getElementById('collection');
    const y = s.offsetTop + (s.getBoundingClientRect().height - innerHeight) * 0.70;
    window.lenis ? lenis.scrollTo(y, { immediate:true }) : scrollTo(0, y);
    ScrollTrigger.update();
  });
  await T(900);

  const read = () => p.evaluate(() => {
    const s = document.getElementById('collection');
    const by = { platinum: [], yellow: [], 'two-tone': [] };
    s.querySelectorAll('[data-cl="product"]').forEach(el => {
      by[el.getAttribute('data-metal')].push(+(+getComputedStyle(el).opacity).toFixed(3));
    });
    const pressed = [...s.querySelectorAll('.coll__metals [data-metal]')]
      .filter(b => b.getAttribute('aria-pressed') === 'true')
      .map(b => b.getAttribute('data-metal'));
    return { by, pressed, filter: s.getAttribute('data-filter') || '' };
  });

  const avg = a => a.length ? +(a.reduce((x,y)=>x+y,0)/a.length).toFixed(3) : 0;
  const show = (label, r) => console.log(
    `${label.padEnd(16)} pressed=[${r.pressed}] platinum=${avg(r.by.platinum)} yellow=${avg(r.by.yellow)} twoTone=${avg(r.by['two-tone'])}`);

  show('before', await read());
  await p.click('.coll__metals [data-metal="yellow"]'); await T(1600);
  show('yellow', await read());
  await p.click('.coll__metals [data-metal="two-tone"]'); await T(1600);
  show('two-tone', await read());
  await p.click('.coll__metals [data-metal="all"]'); await T(1600);
  show('all', await read());

  // directional controls move the page, not a private slider state
  const before = await p.evaluate(() => Math.round(window.scrollY));
  await p.click('[data-coll-next]'); await T(1800);
  const after = await p.evaluate(() => ({
    y: Math.round(window.scrollY),
    idx: document.querySelector('[data-coll-i]').textContent,
    cut: document.querySelector('[data-coll-cut]').textContent
  }));
  console.log(`next: scrollY ${before} -> ${after.y} (+${after.y - before}), now showing ${after.idx} ${after.cut}`);
  await b.close();
})();
