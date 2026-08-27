const puppeteer = require('puppeteer');
const T = s => new Promise(r=>setTimeout(r,s));
(async () => {
  const b = await puppeteer.launch({headless:'new',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
  const p = await b.newPage();
  await p.setViewport({width:1440,height:900});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error')errs.push('C:'+m.text());});
  await p.goto('http://localhost:4321',{waitUntil:'networkidle2'});
  await T(5000);
  const boot = await p.evaluate(()=>({
    heroFound: !!document.getElementById('chero'),
    scenes: document.querySelectorAll('.cscene').length,
    ctaFound: !!document.querySelector('.chero__cta'),
    vidSrc: (document.querySelector('[data-hero-video]')||{}).currentSrc||'',
    vidDur: (document.querySelector('[data-hero-video]')||{}).duration,
    vidReady: (document.querySelector('[data-hero-video]')||{}).readyState,
    heroH: Math.round(document.getElementById('chero').getBoundingClientRect().height),
    triggers: ScrollTrigger.getAll().length
  }));
  console.log('BOOT', JSON.stringify(boot,null,1));
  // walk the hero and sample video time + which scene is visible
  const heroTop = await p.evaluate(()=>document.getElementById('chero').offsetTop);
  const heroH  = boot.heroH, vh = 900;
  console.log('\nprog | video t | visible scenes (opacity>0.15)');
  for (const f of [0,0.15,0.3,0.45,0.6,0.75,0.9,1]) {
    const y = heroTop + (heroH - vh) * f;
    await p.evaluate(v=>{ window.lenis?window.lenis.scrollTo(v,{immediate:true}):window.scrollTo(0,v); ScrollTrigger.update(); }, y);
    await T(900);
    const s = await p.evaluate(()=>{
      const v=document.querySelector('[data-hero-video]');
      const on=[...document.querySelectorAll('.cscene')].map((e,i)=>({i:i+1,o:+getComputedStyle(e).opacity})).filter(x=>x.o>0.15);
      const cta=+getComputedStyle(document.querySelector('.chero__cta')).opacity;
      return {t:+v.currentTime.toFixed(2), on:on.map(x=>`S${x.i}:${x.o.toFixed(2)}`).join(' '), cta:cta.toFixed(2)};
    });
    console.log(` ${String(Math.round(f*100)).padStart(3)}% | ${String(s.t).padStart(6)} | ${s.on||'(none)'}${+s.cta>0.15?'  CTA:'+s.cta:''}`);
  }
  console.log('\nerrors:', errs.length?errs.slice(0,4):'none');
  await b.close();
})();
