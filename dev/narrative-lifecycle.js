const fs=require('fs'),assert=require('node:assert/strict'),puppeteer=require('puppeteer');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const browser=await puppeteer.launch({headless:true});
 const page=await browser.newPage();await page.setViewport({width:1440,height:900});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto((process.env.BASE||'http://localhost:4321'),{waitUntil:'load'});
 // Pause the assembly itself, rather than relying on screenshot wall-clock time.
 const assembly=await page.evaluate(()=>{const tl=gsap.globalTimeline.getChildren().find(t=>t.getChildren&&t.getChildren().length>100);if(!tl)return false;tl.pause();tl.totalTime(1.46,false);return true;});
 assert.ok(assembly);await page.screenshot({path:'dev/shots/revision/preloader-100.png'});
 assert.equal(await page.$eval('#preNum',e=>e.textContent),'100');
 await page.evaluate(()=>{const tl=gsap.globalTimeline.getChildren().find(t=>t.getChildren&&t.getChildren().length>100);tl.play();});await wait(2200);
 const count=await page.evaluate(()=>ScrollTrigger.getAll().length);
 for(const [width,height] of [[390,844],[768,1024],[1440,900]]){
  await page.setViewport({width,height});await wait(350);
  const data=await page.evaluate(()=>{ScrollTrigger.refresh();return {triggers:ScrollTrigger.getAll().length,overflow:document.documentElement.scrollWidth-innerWidth};});
  assert.equal(data.triggers,count);assert.equal(data.overflow,0);
 }
 // Sample both sides of every seam and ensure adjacent section boxes touch.
 assert.deepEqual(await page.evaluate(()=>{const sections=[...document.querySelectorAll('section[id]')];return sections.slice(1).filter((s,i)=>Math.abs(s.getBoundingClientRect().top-sections[i].getBoundingClientRect().bottom)>2).map(s=>s.id);}),[]);
 // Explicit internal fixtures validate registration/masking without pretending
 // that missing client photographs exist. Nothing is written to production config.
 await page.setRequestInterception(true);
 page.on('request',req=>{
  if(req.url().endsWith('/assets/js/diamond-assets.js')){
   const fixture=label=>'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1480"><rect width="1200" height="1480" fill="#554444"/><text x="100" y="300" fill="white" font-size="60">QA FIXTURE ${label}</text></svg>`);
   req.respond({status:200,contentType:'application/javascript',body:fs.readFileSync('assets/js/diamond-assets.js','utf8')+'\nCD.retailAssets.ten.src='+JSON.stringify(fixture('TEN'))+';CD.retailAssets.twentyFive.src='+JSON.stringify(fixture('TWENTY FIVE'))+';'});
  }else req.continue();
 });
 await page.reload({waitUntil:'networkidle0'});await page.waitForFunction(()=>getComputedStyle(document.getElementById('pre')).display==='none'&&!document.body.classList.contains('is-locked'),{timeout:20000});await wait(600);
 assert.equal(await page.$eval('#display',e=>e.dataset.retailMode),'10-to-25');
 for(const [width,height] of [[1440,900],[390,844]]){
  await page.setViewport({width,height});await wait(350);await page.waitForFunction(()=>{const n=document.getElementById('display');const t=ScrollTrigger.getAll().find(s=>s.trigger===n);return t&&Math.abs(t.start-n.offsetTop)<2;},{timeout:5000});await wait(250);
  for(const progress of [.45,.67,.9]){
   const state=await page.evaluate(p=>{const node=document.getElementById('display');lenis.scrollTo(node.offsetTop+(node.offsetHeight-innerHeight)*p,{immediate:true});ScrollTrigger.update();return [...node.querySelectorAll('[data-dsp-case]')].map(e=>({opacity:+e.style.opacity,mask:e.style.clipPath,transform:e.style.transform}));},progress);
   assert.equal(state.length,2);if(state[0].opacity>.01&&state[1].opacity>.01)assert.equal(state[0].transform,state[1].transform);
   if(progress===.45)assert.equal(state[1].mask,'inset(100% 0px 0px)');
   if(progress===.67)assert.notEqual(state[1].mask,'inset(100% 0px 0px)');
   if(progress===.9){assert.equal(state[1].opacity,1);assert.equal(state[1].mask,'inset(0% 0px 0px)');assert.equal(state[0].opacity,0);}
  }
 }
 await page.setJavaScriptEnabled(false);await page.reload({waitUntil:'networkidle0'});
 const staticState=await page.evaluate(()=>({pre:getComputedStyle(document.getElementById('pre')).display,overflow:document.documentElement.scrollWidth-innerWidth,compare:getComputedStyle(document.querySelector('.spk__outro')).opacity}));
 assert.deepEqual(staticState,{pre:'none',overflow:0,compare:'1'});
 assert.deepEqual(errors,[]);await browser.close();
 console.log('PASS: preloader 100; resize trigger stability; contiguous section seams; registered 10/25 fixture masks at desktop/mobile; no-JS fallback.');
})().catch(e=>{console.error(e);process.exit(1);});
