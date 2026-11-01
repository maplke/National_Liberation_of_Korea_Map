// v4: game-rendered frames for the network-growth motion graphics (in-game style)
const L=require('./lib'), N=require('./nets'), fs=require('fs');
const OUT=process.env.OUT||'/tmp/tr/clips';
const lerp=(a,b,t)=>a+(b-a)*t, eio=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
async function dismiss(p){for(let k=0;k<4;k++){const n=await p.evaluate(()=>{const ev=document.getElementById('ev');if(!ev||getComputedStyle(ev).display==='none')return 0;
  const bs=[...ev.querySelectorAll('button')].filter(b=>b.offsetParent);const ok=bs.find(b=>/확인|닫기|시작/.test(b.textContent))||bs[bs.length-1];if(ok){ok.click();return 1;}return 0;});if(!n)break;await p.waitForTimeout(150);}}
async function stage(ch,net,skin){
  const {b,p}=await L.open({w:1280,h:720,dsf:1.5});await L.startChapter(p,ch,skin);await dismiss(p);
  if(net) await N.applyNet(p,net);
  await L.cine(p);await p.addStyleTag({content:'#ev{display:none!important}'});
  await p.evaluate(()=>{window.__H=12;__ev('tod=function(){return window.__H}');});await p.waitForTimeout(500);await L.manual(p);return {b,p};}
// fixed camera for the era graphic: South Korea fills the height, sits right of centre
const ERA_CAM=`(function(){const id=n=>CT.findIndex(c=>c[0]===n);const a=pos(id('연천')),z=pos(id('완도')),s1=pos(id('서울')),s2=pos(id('부산'));
  const sc=640/((z[1]-a[1])*ms);view.sc=sc;view.px=800-(s1[0]+s2[0])/2*ms*sc;view.py=46-a[1]*ms*sc;return sc;})()`;
const camState=`({sc:view.sc,px:view.px,py:view.py,ms:ms})`;
const C={
 async era(){const dir=`${OUT}/mg4`;fs.mkdirSync(dir,{recursive:true});const data={nets:{}};
   for(const [tag,ch,net] of [['s0',1,null],['s1',2,null],['s2',3,null],['s3',4,null],['s4',4,'extra']]){
     const {b,p}=await stage(ch,net,'classic');await p.evaluate(s=>__ev(s),ERA_CAM);
     await L.step(p,1);await p.screenshot({path:`${dir}/era_${tag}.jpg`,quality:93});
     data.nets[tag]=await p.evaluate(()=>__ev('lines.map(l=>({n:l.name,c:l.c,s:l.s.slice()}))'));
     if(tag==='s0'){data.ct=await p.evaluate(()=>__ev('CT.map((c,i)=>{const s=scr(i);const r=cv.getBoundingClientRect();return [c[0],+((s[0]+r.left)*1.5).toFixed(1),+((s[1]+r.top)*1.5).toFixed(1),CT[i][5]?1:0];})'));}
     await b.close();console.log('era stage',tag);}
   fs.writeFileSync(`${dir}/era.json`,JSON.stringify(data));},
 async ending(){ // two passes along the same camera path: empty map (A) and the 2030 network (B)
   const dir=`${OUT}/mg4`;fs.mkdirSync(dir,{recursive:true});let cams=[],posMap=null,net=null;const F=66;
   for(const [tag,ch,nt] of [['endA',1,null],['endB',4,'extra']]){
     const {b,p}=await stage(ch,nt,'classic');
     if(tag==='endB'){net=await p.evaluate(()=>__ev('lines.map(l=>({n:l.name,c:l.c,s:l.s.slice()}))'));
       posMap=await p.evaluate(()=>__ev('CT.map(c=>{const q=pos(CT.indexOf(c));return [+q[0].toFixed(3),+q[1].toFixed(3)];})'));}
     const sp=await p.evaluate(()=>__ev('pos(CT.findIndex(c=>c[0]==="서울"))'));
     const ec=await p.evaluate(s=>__ev(s+';({sc:view.sc,px:view.px,py:view.py})'),ERA_CAM);
     // centre of the era framing, in map units
     const cx=(640-ec.px)/(await p.evaluate(()=>__ev('ms'))*ec.sc),cy=(360-ec.py)/(await p.evaluate(()=>__ev('ms'))*ec.sc);
     const d=`${dir}/${tag}`;fs.rmSync(d,{recursive:true,force:true});fs.mkdirSync(d);
     cams=[];
     for(let i=0;i<F;i++){const k=eio(Math.min(1,i/52));const sc=Math.exp(lerp(Math.log(ec.sc*3.4),Math.log(ec.sc),k));
       const x=lerp(sp[0],cx,k),y=lerp(sp[1],cy,k);
       await p.evaluate(([x,y,s])=>__ev(`view.sc=${s};view.px=W/2-${x}*ms*${s};view.py=H/2-${y}*ms*${s};`),[x,y,sc]);
       await L.step(p,1);cams.push(await p.evaluate(s=>__ev(s),camState));
       await p.screenshot({path:`${d}/${String(i).padStart(4,'0')}.jpg`,quality:90});}
     await b.close();console.log('ending',tag,F);}
   const off=await (async()=>{return null;})();
   fs.writeFileSync(`${dir}/ending.json`,JSON.stringify({cams,pos:posMap,net}));},
};
(async()=>{const names=process.argv.slice(2);for(const n of (names.length?names:Object.keys(C)))await C[n]();})();
