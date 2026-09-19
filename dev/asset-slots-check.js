/* Pure timeline checks use synthetic slot strings, never substitute products. */
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const context={window:{}};context.window=context;vm.createContext(context);
function load(file){vm.runInContext(fs.readFileSync(file,'utf8'),context);}
load('assets/js/diamond-assets.js');
assert.deepEqual(Array.from(context.CD.diamondShapes,s=>s.key),['round','oval','radiant','elongated-cushion','marquise']);
assert.equal(context.CD.diamondShapes.filter(s=>s.src).length,5);
assert.ok(/display-case-b/.test(context.CD.retailAssets.ten.src));assert.equal(context.CD.retailAssets.twentyFive.src,null);
context.CD.diamondShapes.forEach(s=>s.src='test-fixture:'+s.key);
load('assets/js/pillars/scenes.js');load('assets/js/pillars/timeline.js');
const cfg=context.CD.pillars,T=context.CD.pillarsTimeline,st=T.createState(cfg),seen=new Set();
for(let n=0;n<=1000;n++){const f=T.frame(cfg,n/1000,false,st);assert.ok(Number.isFinite(f.shape.contract));if(f.shape.v>.95)seen.add(cfg.shapes.items[f.shape.index].key);}
assert.equal(seen.size,5);
load('assets/js/display/scenes.js');load('assets/js/display/timeline.js');
const d=context.CD.display,D=context.CD.displayTimeline;d.room.tint=[204,156,156];
for(const expanded of [false,true])for(const narrow of [false,true]){
 d.hasExpansion=expanded;const state=D.createState(d);
 for(let n=0;n<=1000;n++){const f=D.frame(d,n/1000,narrow,state);assert.equal(f.cases.length,expanded?2:1);for(const c of f.cases)for(const key of ['x','y','w','o','k','scale'])assert.ok(Number.isFinite(c[key]),key);}
 if(expanded){const ten=D.frame(d,.46,narrow,state);assert.equal(ten.cases[0].o,1);assert.equal(ten.cases[1].k,0);const full=D.frame(d,.9,narrow,state);assert.equal(full.cases[0].o,0);assert.equal(full.cases[1].k,1);assert.equal(full.cases[1].o,1);}
 assert.equal(D.frame(d,1,narrow,state).ground,'rgb(10,10,11)');
}
console.log('PASS: five configured cut slots; all five timeline states; reference and 10-to-25 paths on desktop/mobile; finale seam.');
