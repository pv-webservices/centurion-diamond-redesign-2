/* Deterministic layout fingerprint: geometry + key computed styles of every
   meaningful node in the five scroll chapters, at fixed progress points.
   This is the desktop regression guard for mobile work — the approved
   desktop must not move, and pixel diffs are useless here because the hero
   video's scrub position is not reproducible run to run.

     node dev/fingerprint.js ./dev/fp-base-1440x900.json 1440 900   # baseline
     ...make changes...
     node dev/fingerprint.js ./dev/fp-now-1440x900.json 1440 900
     node dev/fpdiff.js ./dev/fp-base-1440x900.json ./dev/fp-now-1440x900.json

   Capture the baseline from a clean tree (`git stash push -- assets/ index.html`).
   MOBILE=1 fingerprints a phone instead. The dumps are gitignored: they are
   ~1.4MB each and only mean anything next to the tree that produced them.

   Noise floor: ~13 rows at one hero frame, all inside HEADER.hdr — its dim
   is a JS-driven CSS transition, so a capture can catch it mid-flight.
   Anything outside the header subtree is a real regression. Video
   currentTime and the grain layers are excluded for the same reason. */
const puppeteer = require('puppeteer');
const fs = require('fs');
const T = ms => new Promise(r => setTimeout(r, ms));
const OUT = process.argv[2];
const W = parseInt(process.argv[3]||'1440',10), H = parseInt(process.argv[4]||'900',10);
const MOB = process.env.MOBILE === '1';

const TARGETS = {
  chero:      [0,.15,.30,.45,.60,.75,.90,.99],
  anatomy:    [0,.12,.26,.38,.50,.62,.74,.86,.97],
  collection: [.05,.18,.30,.42,.54,.66,.78,.90,.98],
  worn:       [.05,.18,.30,.42,.54,.66,.78,.90,.98],
  display:    [.05,.20,.35,.50,.65,.80,.95]
};
const SEL = '.chero, .chero *, .plr, .plr *, .coll, .coll *, .wrn, .wrn *, .dsp, .dsp *, .hdr, .hdr *';

(async () => {
  const b = await puppeteer.launch({ headless:'new', args:['--no-sandbox','--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage();
  await p.setViewport({ width:W, height:H, isMobile:MOB, hasTouch:MOB });
  await p.goto('http://localhost:4321',{waitUntil:'networkidle2',timeout:60000});
  await T(4500);
  const dump = { vp: W+'x'+H, docH: 0, sections: {}, frames: {} };
  dump.docH = await p.evaluate(()=>document.documentElement.scrollHeight);
  for (const name of Object.keys(TARGETS)) {
    const g = await p.evaluate(id=>{const e=document.getElementById(id);const r=e.getBoundingClientRect();
      return {top:Math.round(r.top+window.scrollY),h:Math.round(r.height)};}, name);
    dump.sections[name] = g;
    for (const prog of TARGETS[name]) {
      const y = g.top + (g.h - H) * prog;
      await p.evaluate(v=>{window.lenis?window.lenis.scrollTo(v,{immediate:true}):window.scrollTo(0,v); if(window.ScrollTrigger)ScrollTrigger.update();}, y);
      await T(760);
      const rows = await p.evaluate(sel=>{
        const out=[];
        document.querySelectorAll(sel).forEach(el=>{
          const cs=getComputedStyle(el);
          if(cs.display==='none') return;
          const cls = (typeof el.className==='string'?el.className:'');
          /* CSS-animated noise: the grain layers run their own keyframes, so
             their transform is whatever phase the capture caught. */
          if(/grain/.test(cls)) return;
          const r=el.getBoundingClientRect();
          if(r.width<0.5&&r.height<0.5&&+cs.opacity<0.005) return;
          const id=(el.tagName+'.'+(typeof el.className==='string'?el.className:'')).replace(/\s+/g,'_').slice(0,70);
          out.push([id,Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height),
                    (+cs.opacity).toFixed(2),cs.visibility[0],
                    cs.transform.replace(/-?\d+\.\d+/g, m=>String(Math.round(m*10)/10)),
                    cs.fontSize,cs.backgroundColor,cs.filter.replace(/-?\d+\.\d+/g, m=>String(Math.round(m*100)/100)),cs.clipPath].join('|'));
        });
        return out;
      }, SEL);
      dump.frames[name+'@'+prog] = rows;
    }
  }
  fs.writeFileSync(OUT, JSON.stringify(dump,null,0));
  console.log('wrote', OUT, 'frames:', Object.keys(dump.frames).length);
  await b.close();
})();
