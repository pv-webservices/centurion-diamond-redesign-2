const puppeteer = require('puppeteer');
const OUT = process.argv[2];
const W = parseInt(process.argv[3]||'1440',10), H = parseInt(process.argv[4]||'900',10);
const TAG = process.argv[5] || 'd';

(async () => {
  const b = await puppeteer.launch({ headless:'new', args:['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage();
  await p.setViewport({ width:W, height:H, deviceScaleFactor:1 });
  const errs = [];
  p.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
  p.on('pageerror', e => errs.push('PAGEERROR: '+e.message));
  await p.goto('http://localhost:4321', { waitUntil:'networkidle2', timeout:60000 });
  await new Promise(r => setTimeout(r, 5000));           // let preloader finish

  const meta = await p.evaluate(() => {
    const secs = {};
    document.querySelectorAll('section[id], .marq').forEach(s => {
      secs[s.id || 'marquee'] = Math.round(s.getBoundingClientRect().top + window.scrollY);
    });
    return { docH: document.documentElement.scrollHeight, secs };
  });

  // step-scroll the whole page so every ScrollTrigger fires naturally
  const shots = [];
  const step = Math.round(H * 0.85);
  for (let y = 0, i = 0; y < meta.docH - H*0.4; y += step, i++) {
    await p.evaluate(v => { window.lenis ? window.lenis.scrollTo(v,{immediate:true}) : window.scrollTo(0,v); }, y);
    await new Promise(r => setTimeout(r, 850));
    const f = `${OUT}/${TAG}-${String(i).padStart(2,'0')}.png`;
    await p.screenshot({ path:f });
    shots.push(f);
  }
  console.log(JSON.stringify({ docH: meta.docH, sections: meta.secs, shots: shots.length, errors: errs.slice(0,10) }, null, 1));
  await b.close();
})();
