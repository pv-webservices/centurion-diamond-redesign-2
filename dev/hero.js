const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({headless:'new',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
  const out = process.argv[2];
  for (const [tag,w,h] of [['hd',1440,900],['hw',1920,1000],['ht',900,1100],['hm',390,844]]) {
    const p = await b.newPage();
    await p.setViewport({width:w,height:h});
    await p.goto('http://localhost:4321',{waitUntil:'networkidle2'});
    await new Promise(r=>setTimeout(r,7000));   // let preloader + aperture finish
    await p.screenshot({path:`${out}/${tag}.png`});
    const m = await p.evaluate(() => {
      const r = el => { if(!el) return null; const b=el.getBoundingClientRect();
        return {L:Math.round(b.left),R:Math.round(b.right),T:Math.round(b.top),B:Math.round(b.bottom)}; };
      const q = s => document.querySelector(s);
      const vw = document.documentElement.clientWidth;
      const clipped = [...document.querySelectorAll('.hero__line .msk > span')].map(s=>{
        const sw=s.scrollWidth, ow=s.parentElement.clientWidth;
        return {txt:s.textContent.trim(), scroll:sw, box:ow, cut: sw>ow+1};
      });
      return {vw, tl:r(q('.hero__tl')), br:r(q('.hero__br')), bl:r(q('.hero__bl')), clipped};
    });
    console.log(tag, JSON.stringify(m));
    await p.close();
  }
  await b.close();
})();
