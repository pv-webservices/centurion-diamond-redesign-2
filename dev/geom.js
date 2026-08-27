const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({headless:'new',args:['--no-sandbox']});
  const p = await b.newPage();
  await p.setViewport({width:390,height:844});
  await p.goto('http://localhost:4321',{waitUntil:'networkidle2'});
  await new Promise(r=>setTimeout(r,3500));
  const r = await p.evaluate(() => {
    const q = s => document.querySelector(s);
    const box = el => { if(!el) return null; const b=el.getBoundingClientRect();
      const cs=getComputedStyle(el);
      return {L:Math.round(b.left),R:Math.round(b.right),W:Math.round(b.width),
        pad:cs.paddingLeft+'/'+cs.paddingRight, cols:cs.gridTemplateColumns, ji:cs.justifyItems, ta:cs.textAlign}; };
    const stage = q('#proofStage');
    return {
      viewport: document.documentElement.clientWidth,
      stage: box(stage),
      wrap: box(stage.querySelector('.wrap')),
      grid: box(q('.proof__grid')),
      side0: box(document.querySelectorAll('.proof__side')[0]),
      big0: box(document.querySelector('.proof__big')),
      facets: box(q('.facets'))
    };
  });
  console.log(JSON.stringify(r,null,1));
  await b.close();
})();
