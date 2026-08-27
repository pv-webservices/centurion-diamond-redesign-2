const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({ headless:'new', args:['--no-sandbox'] });
  for (const [w,h] of [[390,844],[768,1024],[1440,900]]) {
    const p = await b.newPage();
    await p.setViewport({width:w,height:h});
    await p.goto('http://localhost:4321',{waitUntil:'networkidle2'});
    await new Promise(r=>setTimeout(r,3500));
    const r = await p.evaluate(() => {
      const de = document.documentElement;
      const over = [];
      document.querySelectorAll('body *').forEach(el => {
        const b = el.getBoundingClientRect();
        if (b.width === 0) return;
        if (b.right > de.clientWidth + 2 || b.left < -2) {
          const cs = getComputedStyle(el);
          if (cs.position === 'fixed' || el.closest('.marq') || el.classList.contains('ghost') || el.classList.contains('hero__mirror')) return;
          over.push((el.tagName+'.'+(el.className||'').toString().split(' ')[0]).slice(0,44) + ` L${Math.round(b.left)} R${Math.round(b.right)}`);
        }
      });
      return { scrollW: de.scrollWidth, clientW: de.clientWidth, over: [...new Set(over)].slice(0,10) };
    });
    console.log(`${w}x${h}: scrollW=${r.scrollW} clientW=${r.clientW} overflow=${r.scrollW>r.clientW+1?'YES':'no'}`);
    if (r.over.length) console.log('   ', r.over.join('\n    '));
    await p.close();
  }
  await b.close();
})();
