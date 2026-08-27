const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({headless:'new',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
  const out = process.argv[2];
  for (const [tag,w,h] of [['n-desk',1440,900],['n-wide',1920,1000],['n-tab',820,1100],['n-mob',390,844]]) {
    const p = await b.newPage();
    await p.setViewport({width:w,height:h});
    const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    p.on('console',m=>{ if(m.type()==='error') errs.push('C:'+m.text()); });
    await p.goto('http://localhost:4321',{waitUntil:'networkidle2'});
    // capture early to prove the intro is quick
    await new Promise(r=>setTimeout(r,2200));
    await p.screenshot({path:`${out}/${tag}-early.png`});
    await new Promise(r=>setTimeout(r,2600));
    await p.screenshot({path:`${out}/${tag}.png`});
    const m = await p.evaluate(() => {
      const q=s=>document.querySelector(s);
      const r=el=>{if(!el)return null;const b=el.getBoundingClientRect();
        return {L:Math.round(b.left),R:Math.round(b.right),T:Math.round(b.top),B:Math.round(b.bottom)};};
      const de=document.documentElement;
      return {
        vw:de.clientWidth, vh:de.clientHeight,
        preDisplay:getComputedStyle(q('#pre')).display,
        chars:document.querySelectorAll('.hero__h1 .ch').length,
        h1:r(q('.hero__h1')), jewel:r(q('#jewelTilt')), logo:r(q('.hero__logo')),
        heroH:Math.round(q('.hero').getBoundingClientRect().height),
        overflowY: q('.hero').scrollHeight > q('.hero').clientHeight+2,
        vid:(()=>{const v=q('#heroVid');return v?{rs:v.readyState,paused:v.paused,src:(v.currentSrc||'').split('/').pop()}:null;})()
      };
    });
    console.log(tag, JSON.stringify(m), errs.length?('ERR '+errs.slice(0,3)):'');
    await p.close();
  }
  await b.close();
})();
