/* Compare this checkout with HEAD over the same local initial-load window. */
const fs=require('fs'),cp=require('child_process'),puppeteer=require('puppeteer');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const original=new Map();
 const paths=cp.execFileSync('git',['ls-tree','-r','--name-only','HEAD'],{encoding:'utf8'}).trim().split('\n').filter(p=>p==='index.html'||/^assets\/(css|js)\//.test(p));
 for(const p of paths)original.set('/'+p,cp.execFileSync('git',['show','HEAD:'+p]));
 const browser=await puppeteer.launch({headless:true});const results=[];
 for(const [width,height] of [[390,844],[1440,900]])for(const baseline of [true,false]){
  const context=await browser.createBrowserContext(),page=await context.newPage();await page.setViewport({width,height});
  if(baseline){await page.setRequestInterception(true);page.on('request',r=>{const pathname=new URL(r.url()).pathname,key=pathname==='/'?'/index.html':pathname;if(original.has(key))r.respond({status:200,contentType:key.endsWith('.js')?'application/javascript':key.endsWith('.css')?'text/css':'text/html',body:original.get(key)});else r.continue();});}
  let bytes=0;page.on('response',r=>{bytes+=Number(r.headers()['content-length']||0);});
  await page.goto('http://localhost:4321',{waitUntil:'networkidle0'});await wait(2800);
  const metrics=await page.evaluate(()=>({nodes:document.querySelectorAll('*').length,images:document.images.length,triggers:ScrollTrigger.getAll().length,retailFrames:performance.getEntriesByType('resource').filter(r=>r.name.includes('/retail-scrub/')).length}));
  const result={width,height,version:baseline?'HEAD':'working',responseBytes:bytes,...metrics};results.push(result);console.log(JSON.stringify(result));await context.close();
 }
 await browser.close();fs.writeFileSync('dev/shots/revision/performance.json',JSON.stringify(results,null,2));
})().catch(e=>{console.error(e);process.exit(1);});
