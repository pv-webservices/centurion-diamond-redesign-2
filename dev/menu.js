const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({headless:'new',args:['--no-sandbox']});
  const out = process.argv[2];
  const p = await b.newPage();
  await p.setViewport({width:390,height:844});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:4321',{waitUntil:'networkidle2'});
  await new Promise(r=>setTimeout(r,6500));
  await p.click('#navToggle');
  await new Promise(r=>setTimeout(r,1400));
  await p.screenshot({path:`${out}/menu-open.png`});
  const s1 = await p.evaluate(()=>({
    open: document.getElementById('navSheet').classList.contains('is-open'),
    aria: document.getElementById('navToggle').getAttribute('aria-expanded'),
    locked: document.body.classList.contains('is-locked'),
    firstLinkOpacity: getComputedStyle(document.querySelector('.sheet__nav a')).opacity
  }));
  await p.click('#navToggle');
  await new Promise(r=>setTimeout(r,1200));
  const s2 = await p.evaluate(()=>({
    open: document.getElementById('navSheet').classList.contains('is-open'),
    aria: document.getElementById('navToggle').getAttribute('aria-expanded'),
    locked: document.body.classList.contains('is-locked')
  }));
  console.log('opened :', JSON.stringify(s1));
  console.log('closed :', JSON.stringify(s2));
  console.log('errors :', errs.length?errs:'none');
  await b.close();
})();
