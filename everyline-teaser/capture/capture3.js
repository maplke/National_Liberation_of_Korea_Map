// v3 captures: varied networks, profitable states, feature windows in four skins, motion-graphic data
const L=require('./lib'), N=require('./nets'), fs=require('fs');
const FPS=30, OUT=process.env.OUT||'/tmp/tr/clips';
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2, lerp=(a,b,t)=>a+(b-a)*t;
async function dismiss(p){for(let k=0;k<4;k++){const n=await p.evaluate(()=>{const ev=document.getElementById('ev');if(!ev||getComputedStyle(ev).display==='none')return 0;
  const bs=[...ev.querySelectorAll('button')].filter(b=>b.offsetParent);const ok=bs.find(b=>/확인|닫기|시작/.test(b.textContent))||bs[bs.length-1];if(ok){ok.click();return 1;}return 0;});if(!n)break;await p.waitForTimeout(150);}}
async function cityPos(p,n){return p.evaluate(n=>__ev(`pos(CT.findIndex(c=>c[0]===${JSON.stringify(n)}))`),n);}
async function setCam(p,x,y,s){await p.evaluate(([x,y,s])=>__ev(`view.sc=${s};view.px=W/2-${x}*ms*${s};view.py=H/2-${y}*ms*${s};`),[x,y,s]);}
async function cursor(p){await p.evaluate(()=>{const d=document.createElement('div');d.id='__cur';
  d.innerHTML='<svg width="26" height="26" viewBox="0 0 24 24"><path d="M3 2 L3 19 L8 14.5 L11.5 22 L14.5 20.6 L11 13.3 L17.5 13.3 Z" fill="#fff" stroke="#111" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  d.style.cssText='position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35));transform:translate(-3px,-2px)';
  document.body.appendChild(d);document.addEventListener('mousemove',e=>{d.style.left=e.clientX+'px';d.style.top=e.clientY+'px';},true);});}
async function hideToast(p){await p.addStyleTag({content:'#toast{display:none!important}'});}
async function hideEv(p){await p.addStyleTag({content:'#ev{display:none!important}'});}
async function warmTo(p,months,frac){ // run whole months, then stop at a fraction into the next month
  await p.evaluate(([m,f])=>__ev(`(function(){const tgt=(Math.floor(elapsed/DAYSEC)+${m})*DAYSEC+${f}*DAYSEC;let g=0;while(elapsed<tgt&&g++<200000)upd(Math.min(0.2,tgt-elapsed));})()`),[months,frac]);
  await p.waitForTimeout(300); await dismiss(p);}
async function prep({ch=4,skin='classic',cine=false,net=null,keep=null,months=0,frac=0,spd=4,hour=12,dsf=1.5,w=1280,h=720}){
  const {b,p}=await L.open({w,h,dsf});
  await L.startChapter(p,ch,skin); await dismiss(p);
  if(net) await N.applyNet(p,net);
  if(keep) await N.prune(p,keep);
  if(months||frac) await warmTo(p,months,frac);
  await p.evaluate(s=>__ev(`spd=${s}`),spd);
  if(cine) await L.cine(p);
  await p.evaluate(h=>{window.__H=h;__ev('tod=function(){return window.__H}');},hour);
  await p.waitForTimeout(400); await L.manual(p); return {b,p};}
async function shoot(p,name,frames,perFrame,noDismiss){const dir=`${OUT}/${name}`;fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
  const t0=Date.now();for(let i=0;i<frames;i++){if(perFrame)await perFrame(i,i/(frames-1));await L.step(p,1);if(!noDismiss&&i%45===0)await dismiss(p);
  await p.screenshot({path:`${dir}/${String(i).padStart(4,'0')}.jpg`,quality:90});}console.log(name,frames,((Date.now()-t0)/1000).toFixed(1)+'s');}
async function winRect(p){return p.evaluate(()=>{const w=[...document.querySelectorAll('#wins > *')].filter(e=>e.offsetParent).pop();const q=w.getBoundingClientRect();return [q.x,q.y,q.width,q.height].map(v=>v*1.5);});}
const LEAN75=['경부선','중앙선','동해남부선','호남선','영동선','장항선','경의선'];

const C={
 async night_wide(){const {b,p}=await prep({skin:'widget',cine:true,net:'extra',months:3,frac:.3,hour:2});
   const a=await cityPos(p,'서울'),c=await cityPos(p,'부산'),cx=(a[0]+c[0])/2,cy=(a[1]+c[1])/2;
   await shoot(p,'v3_night_wide',270,async(i,t)=>setCam(p,cx+lerp(10,-6,t),cy+lerp(-4,4,t),lerp(1.75,2.2,ease(t))));await b.close();},
 async night_seoul(){const {b,p}=await prep({skin:'widget',cine:true,net:'extra',months:3,frac:.3,hour:1.5});
   const a=await cityPos(p,'서울');
   await shoot(p,'v3_night_seoul',140,async(i,t)=>setCam(p,a[0]+lerp(-6,14,t),a[1]+lerp(12,2,t),lerp(3.6,4.6,ease(t))));await b.close();},
 async golden(){const {b,p}=await prep({skin:'classic',cine:true,net:'extra',months:3,frac:.3,hour:18.9});
   const a=await cityPos(p,'순천'),c=await cityPos(p,'진주');
   await shoot(p,'v3_golden',186,async(i,t)=>setCam(p,lerp(a[0],c[0],.5)+lerp(-40,30,t),lerp(a[1],c[1],.5)-18+lerp(-6,6,t),lerp(2.7,3.1,t)));await b.close();},
 async skins(){const {b,p}=await prep({ch:1,skin:'sketch',cine:true,net:'hub',months:2,frac:.3});
   const a=await cityPos(p,'서울');const seq=['sketch','cassette','paper'];
   await shoot(p,'v3_skins',110,async(i,t)=>{if(i%36===0&&i/36<3){await p.evaluate(k=>__ev(`setSkin('${k}')`),seq[i/36]);await p.waitForTimeout(250);}
     await setCam(p,a[0]+lerp(-10,40,t),a[1]+lerp(-8,8,t),lerp(2.5,2.9,t));});await b.close();},
 async feat_bg(){const {b,p}=await prep({skin:'widget',cine:true,net:'extra',months:3,frac:.3,hour:21.5});
   const a=await cityPos(p,'대전');
   await shoot(p,'v3_feat_bg',150,async(i,t)=>setCam(p,a[0]+lerp(-30,30,t),a[1]+lerp(10,-10,t),lerp(2.4,2.8,t)));await b.close();},
 async chrome_night(){const {b,p}=await prep({ch:2,skin:'widget',keep:LEAN75,months:3,frac:.12,hour:1.5,spd:8});await hideToast(p);await hideEv(p);
   await shoot(p,'v3_chrome_night',130);await b.close();},
 async chrome_golden(){const {b,p}=await prep({ch:4,skin:'classic',keep:['경부고속','경부선'],months:3,frac:.1,hour:18.9,spd:8});await hideToast(p);await hideEv(p);
   await shoot(p,'v3_chrome_golden',186);await b.close();},
 async win_research(){const {b,p}=await prep({skin:'cassette',months:1,frac:.2});await hideToast(p);await hideEv(p);await cursor(p);
   await p.locator('#bot button[title="연구"]').first().click();await p.waitForTimeout(600);
   await p.evaluate(()=>{document.querySelectorAll('button').forEach(b=>{if(b.textContent.trim()==='도움말 끄기'&&b.offsetParent)b.click();});});await p.waitForTimeout(200);
   const r=await winRect(p);fs.writeFileSync(`${OUT}/v3_win_research.rect.json`,JSON.stringify(r));const R=r.map(v=>v/1.5);
   await p.mouse.move(R[0]+R[2]*.3,R[1]+R[3]*.6);
   await shoot(p,'v3_win_research',48,async(i,t)=>p.mouse.move(R[0]+R[2]*lerp(.3,.55,t),R[1]+R[3]*lerp(.6,.42,t)));await b.close();},
 async win_policy(){const {b,p}=await prep({skin:'paper',months:1,frac:.2});await hideToast(p);await hideEv(p);await cursor(p);
   await p.locator('#bot button[title="정책"]').first().click();await p.waitForTimeout(600);
   await p.evaluate(()=>{document.querySelectorAll('button').forEach(b=>{if(b.textContent.trim()==='도움말 끄기'&&b.offsetParent)b.click();});});await p.waitForTimeout(200);
   const r=await winRect(p);fs.writeFileSync(`${OUT}/v3_win_policy.rect.json`,JSON.stringify(r));const R=r.map(v=>v/1.5);
   const bb=await p.locator('#wins button:has-text("강화"):visible').first().boundingBox();const tgt=bb?[bb.x+bb.width/2,bb.y+bb.height/2]:[R[0]+R[2]*.6,R[1]+R[3]*.5];
   const st0=[R[0]+R[2]*.25,R[1]+R[3]*.75];await p.mouse.move(...st0);
   await shoot(p,'v3_win_policy',48,async(i,t)=>{if(i<=18){const k=ease(i/18);await p.mouse.move(lerp(st0[0],tgt[0],k),lerp(st0[1],tgt[1],k));}
     if(i===20){await p.mouse.down();await p.mouse.up();}});await b.close();},
 async win_finance(){const {b,p}=await prep({skin:'widget',keep:['경부고속'],months:6,frac:.5});await hideToast(p);await hideEv(p);await cursor(p);
   await p.locator('button:has-text("재무 리포트 창 열기"):visible').first().click();await p.waitForTimeout(700);
   const r=await winRect(p);fs.writeFileSync(`${OUT}/v3_win_finance.rect.json`,JSON.stringify(r));const R=r.map(v=>v/1.5);
   await p.mouse.move(R[0]+R[2]*.3,R[1]+R[3]*.7);
   await shoot(p,'v3_win_finance',48,async(i,t)=>p.mouse.move(R[0]+R[2]*lerp(.3,.62,t),R[1]+R[3]*lerp(.7,.5,t)));await b.close();},
 async win_commission(){ // sketch skin: run chapter 1 until a commission (의뢰) arrives, then accept it on camera
   const {b,p}=await L.open({w:1280,h:720,dsf:1.5});await L.startChapter(p,1,'sketch');await dismiss(p);await hideToast(p);
   let found=false;for(let k=0;k<200&&!found;k++){await p.evaluate(()=>__ev('for(let i=0;i<40;i++)upd(0.25)'));
     const t=await p.evaluate(()=>{const e=document.getElementById('ev');return getComputedStyle(e).display!=='none'?e.innerText:''});
     if(t){if(/의뢰/.test(t.split('\n').slice(0,4).join(' '))&&/수락/.test(t)){found=true;break;}
       await p.evaluate(()=>{const b=[...document.querySelectorAll('#ev button')].filter(b=>b.offsetParent);b.length&&b[b.length-1].click();});await p.waitForTimeout(60);}}
   console.log('commission found',found);
   await p.evaluate(()=>{document.querySelectorAll('#wins button').forEach(b=>{if(b.offsetParent&&(b.title==='닫기'||b.textContent.trim()==='×'))b.click();});
     document.querySelectorAll('button').forEach(b=>{if(b.offsetParent&&b.textContent.trim()==='도움말 끄기')b.click();});});
   await p.addStyleTag({content:'#wins{display:none!important}'});
   await p.evaluate(()=>{window.__H=12;__ev('tod=function(){return window.__H}');});await L.manual(p);await cursor(p);
   const r=await p.evaluate(()=>{const q=document.getElementById('ev').getBoundingClientRect();return [q.x,q.y,q.width,q.height].map(v=>v*1.5);});
   fs.writeFileSync(`${OUT}/v3_win_commission.rect.json`,JSON.stringify(r));const R=r.map(v=>v/1.5);
   const bb=await p.locator('#ev button:has-text("수락"):visible').first().boundingBox();const tgt=bb?[bb.x+bb.width/2,bb.y+bb.height/2]:[R[0]+R[2]*.3,R[1]+R[3]*.9];
   const st0=[R[0]+R[2]*.7,R[1]+R[3]*.35];await p.mouse.move(...st0);
   await shoot(p,'v3_win_commission',48,async(i,t)=>{if(i<=24){const k=ease(i/24);await p.mouse.move(lerp(st0[0],tgt[0],k),lerp(st0[1],tgt[1],k));}},true);
   await b.close();},
 async mgdata(){ // motion-graphic data: city screen coords for a fixed 1920x1080 camera, chapter networks, land mask
   const dir=`${OUT}/mg`;fs.mkdirSync(dir,{recursive:true});const data={nets:{}};
   for(const [tag,ch,net] of [['c2',2,null],['c3',3,null],['c4',4,null],['x',4,'extra']]){
     const {b,p}=await L.open({w:1920,h:1080,dsf:1});await L.startChapter(p,ch,'classic');await dismiss(p);
     if(net) await N.applyNet(p,net);
     await L.cine(p);await p.evaluate(()=>{window.__H=12;__ev('tod=function(){return window.__H}');});
     const cam=await p.evaluate(()=>__ev(`(function(){const id=n=>CT.findIndex(c=>c[0]===n);const a=pos(id('연천')),z=pos(id('완도')),s1=pos(id('서울')),s2=pos(id('부산'));
       const sc=930/((z[1]-a[1])*ms);view.sc=sc;view.px=1180-(s1[0]+s2[0])/2*ms*sc;view.py=75-a[1]*ms*sc;return sc;})()`));
     await p.evaluate(()=>__ev('draw()'));
     if(tag==='c2'){ // land mask from an empty-looking frame: hide lines by drawing chapter 1? use colour threshold of land
       await p.screenshot({path:`${dir}/land_src.png`});
       data.ct=await p.evaluate(()=>__ev('CT.map((c,i)=>{const s=scr(i);return [c[0],Math.round(s[0]*10)/10,Math.round(s[1]*10)/10,CT[i][5]?1:0,isSub(i)?1:0];})'));}
     data.nets[tag]=await p.evaluate(()=>__ev('lines.map(l=>({n:l.name,c:l.c,hs:l.hs?1:0,s:l.s.slice()}))'));
     data.cam=cam;await b.close();}
   fs.writeFileSync(`${dir}/data.json`,JSON.stringify(data));console.log('mgdata ok',Object.keys(data.nets).map(k=>k+':'+data.nets[k].length).join(' '));},
};
(async()=>{const names=process.argv.slice(2);for(const n of (names.length?names:Object.keys(C)))await C[n]();})();
