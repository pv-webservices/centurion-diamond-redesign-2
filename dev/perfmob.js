/* what a phone actually downloads, and how big */
const puppeteer=require('puppeteer');
const T=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 for(const [w,h,lab] of [[390,844,'mobile'],[1440,900,'desktop']]){
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage(); await p.setViewport({width:w,height:h,isMobile:w<900,hasTouch:w<900});
  const seen=new Map();
  p.on('response',async r=>{ const u=r.url(); if(!/localhost/.test(u))return;
    let len=+(r.headers()['content-length']||0);
    seen.set(u.split('/').pop().split('?')[0], len); });
  await p.goto('http://localhost:4321',{waitUntil:'networkidle2'}); await T(4500);
  // scroll the hero only — what the first screen costs
  const heroBytes=[...seen.entries()].reduce((a,[k,v])=>a+v,0);
  const vid=[...seen.keys()].filter(k=>/\.mp4$/.test(k));
  const imgs=[...seen.entries()].filter(([k])=>/\.webp$/.test(k));
  console.log(`\n${lab} ${w}x${h}  initial requests=${seen.size}  bytes=${(heroBytes/1048576).toFixed(2)}MB`);
  console.log('  video:', vid.join(', ')||'none');
  console.log('  images:', imgs.length, 'largest:', imgs.sort((a,b)=>b[1]-a[1]).slice(0,4).map(([k,v])=>`${k} ${(v/1024).toFixed(0)}k`).join(', '));
  const heroSrc=await p.evaluate(()=>{const v=document.querySelector('[data-hero-video]');return (v.currentSrc||v.src||'').split('/').pop();});
  const lazy=await p.evaluate(()=>({lazy:document.querySelectorAll('img[loading="lazy"]').length,
     total:document.querySelectorAll('img').length,
     async:document.querySelectorAll('img[decoding="async"]').length}));
  console.log('  hero video src:', heroSrc, ' imgs lazy/async/total:', lazy.lazy+'/'+lazy.async+'/'+lazy.total);
  await b.close();
 }
})();
