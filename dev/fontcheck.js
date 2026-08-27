const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({headless:'new',args:['--no-sandbox']});
  const p = await b.newPage();
  const ext=[]; p.on('request',r=>{ const u=r.url(); if(!u.includes('localhost')) ext.push(u); });
  await p.setViewport({width:1440,height:900});
  await p.goto('http://localhost:4321',{waitUntil:'networkidle2'});
  await new Promise(r=>setTimeout(r,4000));
  const f = await p.evaluate(async ()=>{
    await document.fonts.ready;
    const fams=[...document.fonts].filter(x=>x.status==='loaded').map(x=>`${x.family} ${x.style} ${x.weight}`);
    const h1=getComputedStyle(document.querySelector('.hero__h1')).fontFamily;
    const body=getComputedStyle(document.body).fontFamily;
    return {loaded:[...new Set(fams)], h1, body, count:document.fonts.size};
  });
  console.log('loaded faces :', f.loaded.join(' | '));
  console.log('h1 font      :', f.h1.split(',')[0]);
  console.log('body font    :', f.body.split(',')[0]);
  console.log('EXTERNAL reqs:', ext.length?ext:'NONE — fully self-hosted');
  await b.close();
})();
