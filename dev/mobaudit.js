/* Mobile test matrix: overflow, JS errors, header collisions, off-frame copy,
   wrapped CTAs and empty frames, swept across every changed section. */
const puppeteer=require('puppeteer');
const T=ms=>new Promise(r=>setTimeout(r,ms));
const SIZES=(process.env.SIZES||'390x844,393x852,412x915,430x932,360x800,768x1024').split(',').map(s=>s.split('x').map(Number));
const LAND=process.env.LANDSCAPE==='1';
const SEC={chero:8,anatomy:10,collection:12,worn:12,display:10};

(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 let fail=0;
 for(const [w,h] of SIZES){
  const p=await b.newPage();
  await p.setViewport({width:w,height:h,isMobile:true,hasTouch:true});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await p.goto('http://localhost:4321',{waitUntil:'networkidle2',timeout:60000}); await T(4300);
  const issues=[];
  let maxSW=0;
  for(const [name,steps] of Object.entries(SEC)){
   const g=await p.evaluate(id=>{const e=document.getElementById(id);if(!e)return null;
     const r=e.getBoundingClientRect();return{top:Math.round(r.top+window.scrollY),h:Math.round(r.height)};},name);
   if(!g){issues.push(`${name}: MISSING`);continue;}
   let blank=0;
   for(let i=0;i<steps;i++){
    const prog=steps===1?0:i/(steps-1);
    const y=g.top+(g.h-h)*prog;
    await p.evaluate(v=>{window.lenis?window.lenis.scrollTo(v,{immediate:true}):window.scrollTo(0,v); if(window.ScrollTrigger)ScrollTrigger.update();},y);
    await T(340);
    const r=await p.evaluate(sec=>{
      const de=document.documentElement, cw=de.clientWidth, ch=de.clientHeight;
      const hdrB=document.getElementById('hdr').getBoundingClientRect().bottom;
      const root=document.getElementById(sec);
      const out={sw:de.scrollWidth,cw,off:[],hdr:[],wrap:[],ink:0};
      // any visible text block that leaves the frame or sits under the header
      root.querySelectorAll('.cscene,.plr__copy,.cl__plate,.coll__lede,.coll__stmtT,.coll__finalT,.wrn__copy,.wrn__final,.dsp__copy,.plr__h2,.wrn__h2,.dsp__h2,.coll__h2,.cbtn,.coll__cta,.coll__nav,.coll__metals')
        .forEach(el=>{
          let o=1,n=el;
          while(n&&n!==document.body){o*=+getComputedStyle(n).opacity; if(getComputedStyle(n).visibility==='hidden'){o=0;break;} n=n.parentElement;}
          if(o<0.35) return;
          const r=el.getBoundingClientRect();
          // in-flow content of a stacked (unpinned) section scrolls past the
          // frame by design; only clipped-in-view boxes are a fault
          if(r.bottom<-8||r.top>ch+8) return;
          if(r.width<2||r.height<2) return;
          const id=(el.className||el.tagName).toString().split(' ')[0];
          if(r.left<-3||r.right>cw+3||r.bottom>ch+4||r.top<-4) out.off.push(`${id}[${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)}]`);
          else if(r.top<hdrB-4) out.hdr.push(`${id}@${Math.round(r.top)}<${Math.round(hdrB)}`);
        });
      // the hero CTA must stay on one line
      const lab=document.querySelector('.cbtn__label');
      if(lab){const lr=lab.getBoundingClientRect(); let o=1,n=lab; while(n&&n!==document.body){o*=+getComputedStyle(n).opacity;n=n.parentElement;}
        const fs=parseFloat(getComputedStyle(lab).fontSize);
        if(o>0.5 && lr.height>fs*1.9) out.wrap.push('cbtn__label lines='+Math.round(lr.height/(fs*1.2)));}
      // does the frame carry anything at all?
      let vis=0;
      root.querySelectorAll('figure,article,div,p,h2,h3,video,img').forEach(el=>{
        const cs=getComputedStyle(el); if(cs.visibility==='hidden'||+cs.opacity<0.08) return;
        const r=el.getBoundingClientRect();
        if(r.width>40&&r.height>40&&r.bottom>0&&r.top<ch) vis++;});
      out.ink=vis;
      return out;
    },name);
    maxSW=Math.max(maxSW,r.sw);
    if(r.sw>r.cw+1) issues.push(`${name}@${prog.toFixed(2)} H-OVERFLOW ${r.sw}>${r.cw}`);
    if(r.off.length) issues.push(`${name}@${prog.toFixed(2)} OFF-FRAME ${r.off.slice(0,3).join(' ')}`);
    if(r.hdr.length) issues.push(`${name}@${prog.toFixed(2)} UNDER-HEADER ${r.hdr.slice(0,2).join(' ')}`);
    if(r.wrap.length) issues.push(`${name}@${prog.toFixed(2)} ${r.wrap.join(' ')}`);
    if(r.ink<2) blank++;
   }
   if(blank>1) issues.push(`${name} EMPTY-FRAMES ${blank}/${steps}`);
  }
  if(errs.length) issues.push('JS-ERR '+errs.slice(0,2).join(' | '));
  console.log(`\n=== ${w}x${h}${LAND?' (landscape)':''}  scrollW=${maxSW}  ${issues.length?issues.length+' issue(s)':'CLEAN'}`);
  issues.slice(0,18).forEach(i=>console.log('   '+i));
  fail+=issues.length;
  await p.close();
 }
 console.log('\nTOTAL ISSUES:',fail);
 await b.close();
})();
