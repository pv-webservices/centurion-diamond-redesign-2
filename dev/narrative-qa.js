/* Local narrative regression sweep. Screenshots and results are review evidence. */
const fs=require('fs'),path=require('path'),puppeteer=require('puppeteer');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const sizes=(process.env.SIZES||'375x812,390x844,430x932,768x1024,1366x768,1440x900,1920x1080').split(',').map(v=>v.split('x').map(Number));
const out=path.resolve('dev/shots/revision');fs.mkdirSync(out,{recursive:true});
const samples={chero:[.03,.2,.46,.7,.89],journey:[.12,.48,.88],cut:[.06,.28,.46,.6,.76,.94],anatomy:[.12,.28,.43,.59,.74,.92],study:[.23,.43,.61,.79,.92],exclusive:[.07,.24,.41,.70,.92],display:[.1,.43,.75,.94],'retail-showcase':[.85]};
(async()=>{
 const browser=await puppeteer.launch({headless:true,args:['--autoplay-policy=no-user-gesture-required']});const results=[];
 for(const [width,height] of sizes){
  const page=await browser.newPage();await page.setViewport({width,height});
  if(process.env.REDUCED==='1')await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  const errors=[],warnings=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());if(m.type()==='warn')warnings.push(m.text());});
  await page.goto(process.env.BASE||'http://localhost:4321',{waitUntil:'networkidle0'});await wait(2800);
  const issues=[];let maxOverflow=0;
  for(const [id,progresses] of Object.entries(samples)){
   for(const p of progresses){
    await page.evaluate(([id,p])=>{const node=document.getElementById(id);const y=node.getBoundingClientRect().top+scrollY+Math.max(0,node.offsetHeight-innerHeight)*p;window.lenis?lenis.scrollTo(y,{immediate:true}):scrollTo(0,y);ScrollTrigger.update();},[id,p]);await wait(110);
    const state=await page.evaluate(id=>{
     const root=document.getElementById(id),bad=[];
     root.querySelectorAll('.exp__frame h2,.exp__frame h3,.exp__ledger,.exp__claims,.jny__copy h2,.jny__copy h3,.plr__copy,.cscene,.cscene__ln>span,.plr__relative,.dsp__copy,.spk__h2,.spk__meta,.spk__close,.spk__lede,.jny__copy,.jny__rail').forEach(el=>{
      let opacity=1;for(let n=el;n&&n!==document.body;n=n.parentElement){const s=getComputedStyle(n);opacity*=+s.opacity;if(s.visibility==='hidden')opacity=0;}
      if(opacity<.95)return;const r=el.getBoundingClientRect();
      if(r.bottom<0||r.top>innerHeight)return;
      if(el.matches('.cscene__ln>span')&&el.scrollWidth>el.clientWidth+2)bad.push({class:'text wider than column',text:el.textContent,sw:el.scrollWidth,cw:el.clientWidth});
      if(r.left < -2||r.right>innerWidth+2||(!root.classList.contains("is-reduced")&&(r.top < -2||r.bottom>innerHeight+2)))bad.push({class:el.className,box:[r.x,r.y,r.width,r.height].map(Math.round)});
     });
     return{overflow:document.documentElement.scrollWidth-innerWidth,bad};
    },id);
    maxOverflow=Math.max(maxOverflow,state.overflow);if(state.bad.length)issues.push({id,p,bad:state.bad});
    if(width===390||width===1440)await page.screenshot({path:path.join(out,`${process.env.REDUCED?'rm-':''}${width}-${id}-${p}.png`)});
   }
  }
  const checks=await page.evaluate(()=>{
   const dead=[...document.querySelectorAll('a[href^="#"]')].filter(a=>a.hash.length>1&&!document.getElementById(a.hash.slice(1))).map(a=>a.hash);
   const broken=[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.currentSrc||i.src);
   const ids=[...document.querySelectorAll("[id]")].map(e=>e.id);
   const duplicates=ids.filter((id,i)=>ids.indexOf(id)!==i);
   const forbidden=[...document.querySelectorAll("#worn,#metals,#collection,script[src*=\"/worn/\"],script[src*=\"/metals/\"],script[src*=\"/collection/\"]")].length;
   const count=ScrollTrigger.getAll().length;ScrollTrigger.refresh();ScrollTrigger.refresh();
   return{dead,broken,duplicates,forbidden,preloader:document.getElementById('preNum').textContent,facets:document.querySelectorAll('.pre__diamond path').length,nodes:document.querySelectorAll('*').length,triggers:count,refreshStable:count===ScrollTrigger.getAll().length,sections:[...document.querySelectorAll('section[id]')].map(s=>s.id),bytes:performance.getEntriesByType('resource').reduce((s,r)=>s+r.transferSize,0)};
  });
  const result={width,height,errors,warnings,maxOverflow,issues,...checks};results.push(result);console.log(JSON.stringify(result));await page.close();
 }
 await browser.close();fs.writeFileSync(path.join(out,process.env.REDUCED?'reduced-results.json':'results.json'),JSON.stringify(results,null,2));
 if(results.some(r=>r.errors.length||r.maxOverflow>1||r.issues.length||r.dead.length||r.broken.length||r.duplicates.length||r.forbidden||r.preloader!=='100'||!r.refreshStable))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
