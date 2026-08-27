const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({headless:'new',args:['--no-sandbox']});
  for (const [label,w,h] of [['mobile',390,844],['desktop',1440,900]]) {
    const p = await b.newPage();
    await p.setViewport({width:w,height:h});
    const by = {}; let total = 0;
    p.on('response', async r => {
      try {
        const h = r.headers()['content-length'];
        const len = h ? +h : (await r.buffer().catch(()=>({length:0}))).length || 0;
        const u = r.url();
        const t = /\.(mp4|webm)$/.test(u) ? 'video'
               : /\.webp|\.png|\.jpe?g|\.svg/.test(u) ? 'image'
               : /\.js$/.test(u) ? 'js'
               : /\.css$/.test(u) ? 'css'
               : /fonts\.g/.test(u) ? 'font' : 'other';
        by[t] = (by[t]||0) + len; total += len;
      } catch(e){}
    });
    await p.goto('http://localhost:4321',{waitUntil:'networkidle2'});
    await new Promise(r=>setTimeout(r,4000));
    const m = await p.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0]||{};
      const fcp = performance.getEntriesByName('first-contentful-paint')[0];
      return { domReady: Math.round(nav.domContentLoadedEventEnd||0), load: Math.round(nav.loadEventEnd||0),
               fcp: fcp?Math.round(fcp.startTime):null, imgs: document.images.length };
    });
    console.log(`\n== ${label} (${w}x${h}) — initial viewport load ==`);
    Object.entries(by).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log(`  ${k.padEnd(6)} ${(v/1024).toFixed(0).padStart(6)} KB`));
    console.log(`  ${'TOTAL'.padEnd(6)} ${(total/1024).toFixed(0).padStart(6)} KB`);
    console.log(`  FCP ${m.fcp}ms | DOMReady ${m.domReady}ms | load ${m.load}ms`);
    await p.close();
  }
  await b.close();
})();
