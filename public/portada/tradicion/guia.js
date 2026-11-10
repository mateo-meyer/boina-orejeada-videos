// reports bounding boxes of visible elements outside the 3:4 grid zone (y 240..1680)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
for (const f of process.argv.slice(2)){await p.goto('file://'+f);await p.waitForTimeout(300);
const r=await p.evaluate(()=>[...document.querySelectorAll('.tag,.abs,.st,.foto')].map(e=>{const b=e.getBoundingClientRect();return [e.className,Math.round(b.top),Math.round(b.bottom),Math.round(b.left),Math.round(b.right)]}));
console.log(f.split('/').pop(), JSON.stringify(r.filter(x=>x[1]<250||x[2]>1670||x[3]<20||x[4]>1060)));}
await b.close();})();
