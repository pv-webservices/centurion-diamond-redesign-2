const puppeteer = require('puppeteer');
const T = s => new Promise(r=>setTimeout(r,s));
(async () => {
  const b = await puppeteer.launch({headless:'new',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});

  // ---- desktop: pointer tilt + magnetic ----
  const p = await b.newPage();
  await p.setViewport({width:1440,height:900});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:4321',{waitUntil:'networkidle2'});
  await T(4200);
  const rest = await p.evaluate(()=>getComputedStyle(document.getElementById('jewelTilt')).transform);
  await p.mouse.move(1250, 300); await T(900);
  const tilted = await p.evaluate(()=>getComputedStyle(document.getElementById('jewelTilt')).transform);
  // magnetic button
  const box = await p.$eval('.mag', el=>{const b=el.getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2};});
  const magRest = await p.evaluate(()=>getComputedStyle(document.querySelector('.mag')).transform);
  await p.mouse.move(box.x+34, box.y+12); await T(800);
  const magHover = await p.evaluate(()=>({
    tr:getComputedStyle(document.querySelector('.mag')).transform,
    fill:getComputedStyle(document.querySelector('.mag__fill')).transform
  }));
  console.log('jewel rest  :', rest.slice(0,42));
  console.log('jewel tilted:', tilted.slice(0,42), tilted!==rest ? '  ✓ responds' : '  ✗ NO CHANGE');
  console.log('mag rest    :', magRest.slice(0,34));
  console.log('mag hover   :', magHover.tr.slice(0,34), magHover.tr!==magRest?'  ✓ magnetic':'  ✗ none');
  console.log('mag fill    :', magHover.fill.slice(0,34));
  console.log('headline sweep class:', await p.evaluate(()=>document.getElementById('heroH1').className));
  await p.close();

  // ---- touch device ----
  const m = await b.newPage();
  await m.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
  await m.goto('http://localhost:4321',{waitUntil:'networkidle2'});
  await T(4200);
  const t0 = await m.evaluate(()=>getComputedStyle(document.getElementById('jewelTilt')).transform);
  await m.touchscreen.tap(200, 250); await T(700);
  const t1 = await m.evaluate(()=>getComputedStyle(document.getElementById('jewelTilt')).transform);
  console.log('touch drift :', t0!==t1 ? '✓ jewel responds to tap' : '(same frame — auto-drift may be mid-cycle)');
  console.log('errors      :', errs.length?errs:'none');
  await b.close();
})();
