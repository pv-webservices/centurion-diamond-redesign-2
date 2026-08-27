const puppeteer=require('puppeteer');
(async()=>{const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
const p=await b.newPage();await p.setViewport({width:1440,height:900});
await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
const e=[];p.on('pageerror',x=>e.push(x.message));
await p.goto('http://localhost:4321',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,2500));
console.log(await p.evaluate(()=>({
 preHidden:getComputedStyle(document.getElementById('pre')).display==='none',
 h1Opacity:getComputedStyle(document.querySelector('.hero__h1')).opacity,
 chars:document.querySelectorAll('.hero__h1 .ch').length,
 copyVisible:getComputedStyle(document.querySelector('.hero__copy')).opacity,
 jewelVisible:getComputedStyle(document.getElementById('heroJewel')).opacity })));
console.log('errors:',e.length?e:'none');await b.close();})();
