/* reduced motion + no-JS: every heading, paragraph and photograph must still
   be laid out and visible, with no pin and no page overflow. */
const puppeteer=require('puppeteer');
const T=ms=>new Promise(r=>setTimeout(r,ms));
const NOJS = process.env.NOJS==='1';
(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 for(const [w,h] of [[390,844],[1440,900]]){
  const p=await b.newPage();
  if(NOJS) await p.setJavaScriptEnabled(false);
  await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await p.setViewport({width:w,height:h,isMobile:w<900,hasTouch:w<900});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:4321',{waitUntil:'networkidle2'}); await T(NOJS?1500:3500);
  const r=await p.evaluate(()=>{
    const de=document.documentElement;
    const hidden=[], sel='.plr__t,.plr__b,.plr__h2,.cl__cut,.cl__sku,.cl__spec,.wrn__t,.wrn__b,.wrn__h2,.dsp__t,.dsp__b,.dsp__h2,.cscene__title,.cscene__body,.wrn__plate img,.dsp__case img,.cl__stone img';
    document.querySelectorAll(sel).forEach(el=>{
      const cs=getComputedStyle(el); const rr=el.getBoundingClientRect();
      let o=1,n=el; while(n&&n!==document.body){const c=getComputedStyle(n);o*=+c.opacity;if(c.visibility==='hidden'||c.display==='none'){o=0;break;}n=n.parentElement;}
      if(o<0.5||rr.width<4||rr.height<4) hidden.push((el.className||el.tagName).toString().split(' ')[0]+` o=${o.toFixed(2)} ${Math.round(rr.width)}x${Math.round(rr.height)}`);
    });
    const pinned=[...document.querySelectorAll('.chero__stage,.plr__stage,.coll__stage,.wrn__stage,.dsp__stage')]
      .filter(e=>getComputedStyle(e).position==='fixed').length;
    return {sw:de.scrollWidth,cw:de.clientWidth,docH:de.scrollHeight,hidden:hidden.slice(0,10),nHidden:hidden.length,pinned};});
  console.log(`${w}x${h}${NOJS?' no-js':''}  overflow:${r.sw>r.cw+1?'YES '+r.sw:'no'}  docH=${r.docH}  pinnedStages=${r.pinned}  hiddenContent=${r.nHidden}`);
  r.hidden.forEach(x=>console.log('   hidden: '+x));
  if(errs.length) console.log('   ERR '+errs[0]);
  await p.close();
 }
 await b.close();
})();
