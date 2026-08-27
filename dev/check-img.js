const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({ headless:'new', args:['--no-sandbox'] });
  const p = await b.newPage();
  await p.setViewport({ width:1440, height:900 });
  const bad = [];
  p.on('requestfailed', r => bad.push(r.url()));
  p.on('response', r => { if (r.status() >= 400) bad.push(r.status()+' '+r.url()); });
  await p.goto('http://localhost:4321', { waitUntil:'networkidle2' });
  await new Promise(r=>setTimeout(r,4000));
  // force every lazy image to load
  await p.evaluate(async () => {
    const imgs = [...document.querySelectorAll('img')];
    imgs.forEach(i => i.loading = 'eager');
    await Promise.all(imgs.map(i => i.complete ? null : new Promise(r => { i.onload=r; i.onerror=r; })));
  });
  await new Promise(r=>setTimeout(r,2500));
  const res = await p.evaluate(() => [...document.querySelectorAll('img')].map(i => ({
    src: (i.currentSrc||i.src).split('/').pop(),
    nw: i.naturalWidth, nh: i.naturalHeight, ok: i.naturalWidth > 0
  })));
  console.log('broken requests:', bad.length ? bad : 'none');
  console.log('images failing to decode:', res.filter(r=>!r.ok));
  console.log('total imgs:', res.length, '| all decoded:', res.every(r=>r.ok));
  await b.close();
})();
