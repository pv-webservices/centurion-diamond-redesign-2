/* Diff two layout fingerprints. Rows keyed by element identity + order. */
const A = require(require('path').resolve(process.argv[2]));
const B = require(require('path').resolve(process.argv[3]));
const ONLY = process.argv[4];
let diff = 0, tot = 0;
const byFrame = {};
for (const k of Object.keys(A.frames)) {
  if (ONLY && !k.startsWith(ONLY)) continue;
  const a = A.frames[k], b = B.frames[k] || [];
  tot += a.length;
  const m = Math.max(a.length, b.length);
  for (let i = 0; i < m; i++) {
    if (a[i] !== b[i]) {
      diff++;
      (byFrame[k] = byFrame[k] || []).push(['  - ' + a[i], '  + ' + b[i]]);
    }
  }
}
const V = process.env.VERBOSE === '1';
for (const k of Object.keys(byFrame)) {
  console.log(k + '  (' + byFrame[k].length + ' rows)');
  byFrame[k].slice(0, V ? 999 : 3).forEach(r => console.log(r[0] + '\n' + r[1]));
}
console.log(`\ndocH ${A.docH} -> ${B.docH}`);
Object.keys(A.sections).forEach(s=>{
  const x=A.sections[s], y=B.sections[s];
  if(x.top!==y.top||x.h!==y.h) console.log(`section ${s}: top ${x.top}->${y.top}  h ${x.h}->${y.h}`);
});
console.log(`TOTAL differing rows: ${diff} / ${tot}`);
