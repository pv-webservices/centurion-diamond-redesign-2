const puppeteer = require('puppeteer');
const T = s => new Promise(r=>setTimeout(r,s));
(async () => {
  const out=process.argv[2], tag=process.argv[3], w=+process.argv[4], h=+process.argv[5];
  const b = await puppeteer.launch({headless:'new',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
  const p = await b.newPage(); await p.setViewport({width:w,height:h});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error')errs.push('C:'+m.text());});
  await p.goto('http://localhost:4321',{waitUntil:'networkidle2'});
  await T(5200);
  const g = await p.evaluate(()=>{const s=document.getElementById('cut');
    return {top:s.offsetTop,h:Math.round(s.getBoundingClientRect().height),
            ticksC:document.querySelectorAll('[data-cut="centurion"] .cut__rail line').length,
            ticksT:document.querySelectorAll('[data-cut="traditional"] .cut__rail line').length};});
  console.log(`${tag} track=${g.h}px ticks C:${g.ticksC} T:${g.ticksT}`);
  const marks=[0,0.10,0.20,0.34,0.48,0.62,0.74,0.86,0.97];
  for(const f of marks){
    const y=g.top+(g.h-h)*f;
    await p.evaluate(v=>{window.lenis?window.lenis.scrollTo(v,{immediate:true}):window.scrollTo(0,v);ScrollTrigger.update();},y);
    await T(850);
    await p.screenshot({path:`${out}/${tag}-${String(Math.round(f*100)).padStart(3,'0')}.png`});
    if(tag==='s'){
      const st=await p.evaluate(()=>{const q=s=>document.querySelector(s);
        return {bg:getComputedStyle(q('.spk__stage')).backgroundColor,
          intro:+getComputedStyle(q('.spk__intro')).opacity,
          field:+getComputedStyle(q('.spk__field')).opacity,
          nC:q('[data-cut="centurion"] .cut__num b').textContent,
          nT:q('[data-cut="traditional"] .cut__num b').textContent,
          oT:+getComputedStyle(q('[data-cut="traditional"]')).opacity,
          outro:+getComputedStyle(q('.spk__outro')).opacity};});
      console.log(` ${String(Math.round(f*100)).padStart(3)}% bg=${st.bg.padEnd(18)} intro=${st.intro.toFixed(2)} field=${st.field.toFixed(2)} C=${st.nC.padStart(3)} T=${st.nT.padStart(2)}(o${st.oT.toFixed(2)}) outro=${st.outro.toFixed(2)}`);
    }
  }
  console.log('errors:', errs.length?errs.slice(0,3):'none');
  await b.close();
})();
