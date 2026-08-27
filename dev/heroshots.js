const puppeteer = require('puppeteer');
const T = s => new Promise(r=>setTimeout(r,s));
(async () => {
  const out = process.argv[2];
  const [tag,w,h] = [process.argv[3], +process.argv[4], +process.argv[5]];
  const b = await puppeteer.launch({headless:'new',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
  const p = await b.newPage();
  await p.setViewport({width:w,height:h});
  await p.goto('http://localhost:4321',{waitUntil:'networkidle2'});
  await T(5000);
  const geo = await p.evaluate(()=>({top:document.getElementById('chero').offsetTop,
                                     h:Math.round(document.getElementById('chero').getBoundingClientRect().height)}));
  const marks = [0,0.14,0.30,0.42,0.55,0.68,0.84,0.97];
  for (let i=0;i<marks.length;i++){
    const y = geo.top + (geo.h - h) * marks[i];
    await p.evaluate(v=>{ window.lenis?window.lenis.scrollTo(v,{immediate:true}):window.scrollTo(0,v); ScrollTrigger.update(); }, y);
    await T(1000);
    await p.screenshot({path:`${out}/${tag}-${String(Math.round(marks[i]*100)).padStart(3,'0')}.png`});
  }
  await b.close();
})();
