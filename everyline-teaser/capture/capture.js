// Frame-stepped footage capture from Everyline: Rail (capture copy with __ev hook).
const L=require('./lib');
const fs=require('fs');
const FPS=30, OUT='/tmp/tr/clips';
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const lerp=(a,b,t)=>a+(b-a)*t;

async function dismiss(p){
  for(let k=0;k<4;k++){
    const n=await p.evaluate(()=>{const ev=document.getElementById('ev');if(!ev||getComputedStyle(ev).display==='none')return 0;
      const bs=[...ev.querySelectorAll('button')].filter(b=>b.offsetParent);const ok=bs.find(b=>/확인|닫기|시작/.test(b.textContent))||bs[bs.length-1];if(ok){ok.click();return 1;}return 0;});
    if(!n) break; await p.waitForTimeout(150);
  }
}
async function cityPos(p,name){return p.evaluate(n=>__ev(`pos(CT.findIndex(c=>c[0]===${JSON.stringify(n)}))`),name);}
async function setCam(p,cx,cy,sc){await p.evaluate(([x,y,s])=>__ev(`view.sc=${s};view.px=W/2-${x}*ms*${s};view.py=H/2-${y}*ms*${s};`),[cx,cy,sc]);}
async function cursor(p){await p.evaluate(()=>{const d=document.createElement('div');d.id='__cur';
  d.innerHTML='<svg width="26" height="26" viewBox="0 0 24 24"><path d="M3 2 L3 19 L8 14.5 L11.5 22 L14.5 20.6 L11 13.3 L17.5 13.3 Z" fill="#fff" stroke="#111" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  d.style.cssText='position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35));transform:translate(-3px,-2px)';
  document.body.appendChild(d);document.addEventListener('mousemove',e=>{d.style.left=e.clientX+'px';d.style.top=e.clientY+'px';},true);});}
async function hideToast(p){await p.addStyleTag({content:'#toast,#ev{display:none!important}'});}

async function prep({ch=4,skin='classic',cine=false,warm=0,spd=4,hour=12}){
  const {b,p}=await L.open({w:1280,h:720,dsf:1.5});
  await L.startChapter(p,ch,skin);
  await dismiss(p);
  if(warm) await p.evaluate(w=>__ev(`for(let i=0;i<${w};i++)upd(0.2)`),warm);
  await p.waitForTimeout(300); await dismiss(p);
  await p.evaluate(s=>__ev(`spd=${s}`),spd);
  if(cine) await L.cine(p);
  await p.evaluate(h=>{window.__H=h;__ev('tod=function(){return window.__H}');},hour);
  await p.waitForTimeout(400);
  await L.manual(p);
  return {b,p};
}
async function shoot(p,name,frames,perFrame){
  const dir=`${OUT}/${name}`; fs.rmSync(dir,{recursive:true,force:true}); fs.mkdirSync(dir,{recursive:true});
  const t0=Date.now();
  for(let i=0;i<frames;i++){
    if(perFrame) await perFrame(i,i/(frames-1));
    await L.step(p,1);
    if(i%45===0) await dismiss(p);
    await p.screenshot({path:`${dir}/${String(i).padStart(4,'0')}.jpg`,quality:90});
  }
  console.log(name,frames,'frames',((Date.now()-t0)/1000).toFixed(1)+'s');
}


// open a game window from the bottom bar, record its rect, capture with a moving cursor
async function winClip(name,btn,act){
  const {b,p}=await prep({skin:'classic',warm:60,spd:4}); await hideToast(p); await cursor(p);
  await p.locator(`#bot button:has-text("${btn}"):visible`).first().click(); await p.waitForTimeout(600);
  await p.evaluate(()=>{document.querySelectorAll('button').forEach(b=>{if(b.textContent.trim()==='도움말 끄기'&&b.offsetParent)b.click();});});
  await p.waitForTimeout(200);
  const r=await p.evaluate(()=>{const w=[...document.querySelectorAll('#wins > *')].filter(e=>e.offsetParent).pop();const q=w.getBoundingClientRect();return [q.x,q.y,q.width,q.height];});
  fs.mkdirSync(OUT,{recursive:true}); fs.writeFileSync(`${OUT}/${name}.rect.json`,JSON.stringify(r.map(v=>v*1.5)));
  await p.mouse.move(r[0]+r[2]*.3,r[1]+r[3]*.6);
  await shoot(p,name,48,async(i,t)=>{ await act(p,i,r); if(i<16) await p.mouse.move(r[0]+r[2]*lerp(.3,.55,t*3),r[1]+r[3]*lerp(.6,.4,t*3)); });
  await b.close();
}

const CLIPS={
  // ---- v2: ghost UI chrome (side panels + bottom bar) with numbers running at 16x ----
  async chrome_night(){ const {b,p}=await prep({skin:'widget',warm:200,hour:1.5,spd:16}); await hideToast(p);
    await shoot(p,'chrome_night',150); await b.close(); },
  async chrome_golden(){ const {b,p}=await prep({skin:'classic',warm:200,hour:18.9,spd:16}); await hideToast(p);
    await shoot(p,'chrome_golden',185); await b.close(); },
  async chrome_final(){ const {b,p}=await prep({skin:'classic',warm:200,hour:3.5,spd:16}); await hideToast(p);
    await shoot(p,'chrome_final',130,async(i,t)=>p.evaluate(h=>{window.__H=h},lerp(3.5,7.6,t))); await b.close(); },
  async growth_long(){ for(const ch of [1,2,3,4]){ const {b,p}=await prep({ch,skin:'paper',cine:true,warm:20});
      const a=await cityPos(p,'서울'),c=await cityPos(p,'부산'),cx=(a[0]+c[0])/2,cy=(a[1]+c[1])/2;
      await shoot(p,'growthL'+ch,75,async(i,t)=>setCam(p,cx,cy,1.55+(ch-1)*0.06+0.06*t));
      await b.close(); } },
  async feat_bg(){ const {b,p}=await prep({skin:'widget',cine:true,warm:200,hour:21.5});
    const a=await cityPos(p,'대전');
    await shoot(p,'feat_bg',115,async(i,t)=>setCam(p,a[0]+lerp(-30,30,t),a[1]+lerp(10,-10,t),lerp(2.6,3.0,t))); await b.close(); },
  async win_research(){ await winClip('win_research','연구',async(p,i,r)=>{}); },
  async win_policy(){ await winClip('win_policy','정책',async(p,i,r)=>{
      if(i===16){ const bb=await p.locator('#wins button:has-text("강화"):visible').first().boundingBox(); if(bb) await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2,{steps:1}); }
      if(i===22){ await p.mouse.down(); await p.mouse.up(); } }); },

  async night_wide(){ const {b,p}=await prep({skin:'widget',cine:true,warm:200,hour:2});
    const a=await cityPos(p,'서울'),c=await cityPos(p,'부산'),cx=(a[0]+c[0])/2,cy=(a[1]+c[1])/2;
    await shoot(p,'night_wide',9*FPS,async(i,t)=>setCam(p,cx+lerp(10,-6,t),cy+lerp(-4,4,t),lerp(1.75,2.2,ease(t))));
    await b.close(); },
  async night_seoul(){ const {b,p}=await prep({skin:'widget',cine:true,warm:200,hour:1.5});
    const a=await cityPos(p,'서울');
    await shoot(p,'night_seoul',5.5*FPS,async(i,t)=>setCam(p,a[0]+lerp(-14,6,t),a[1]+lerp(10,0,t),lerp(4.4,5.6,ease(t))));
    await b.close(); },
  async golden(){ const {b,p}=await prep({skin:'classic',cine:true,warm:200,hour:18.9});
    const a=await cityPos(p,'대구'),c=await cityPos(p,'부산');
    await shoot(p,'golden',7.5*FPS,async(i,t)=>setCam(p,lerp(a[0],c[0],.35)+lerp(-30,20,t),lerp(a[1],c[1],.35)+lerp(-6,6,t),lerp(3.0,3.5,t)));
    await b.close(); },
  async skins(){ const {b,p}=await prep({skin:'sketch',cine:true,warm:200});
    const a=await cityPos(p,'서울'); const seq=['sketch','cassette','paper','classic'];
    await shoot(p,'skins',5.4*FPS,async(i,t)=>{ if(i%36===0&&i/36<4){await p.evaluate(k=>__ev(`setSkin('${k}')`),seq[i/36]); await p.waitForTimeout(250);} 
      await setCam(p,a[0]+lerp(-20,25,t),a[1]+lerp(8,-6,t),lerp(3.3,3.8,t)); });
    await b.close(); },
  async build(){ const {b,p}=await prep({ch:1,skin:'classic',warm:0,spd:1}); await hideToast(p); await cursor(p);
    await p.getByText('철도 건설').first().click(); await p.waitForTimeout(400);
    const a=await cityPos(p,'서울'),c=await cityPos(p,'대전');
    await setCam(p,(a[0]+c[0])/2+10,(a[1]+c[1])/2+4,1.75);
    const S=async n=>p.evaluate(n=>__ev(`(function(){const i=CT.findIndex(c=>c[0]===${JSON.stringify(n)});const s=scr(i);const r=cv.getBoundingClientRect();return [s[0]+r.left,s[1]+r.top];})()`),n);
    const sa=await S('서울'), sc=await S('대전'); let home=[sa[0]+140,sa[1]-60]; await p.mouse.move(...home);
    let btn=null, pos=home;
    await shoot(p,'build',8*FPS,async(i)=>{
      if(i<=18){const t=ease(i/18);pos=[lerp(home[0],sa[0],t),lerp(home[1],sa[1],t)];await p.mouse.move(...pos);}
      else if(i===20){await p.mouse.down();}
      else if(i>20&&i<=70){const t=ease((i-20)/50);pos=[lerp(sa[0],sc[0],t)+Math.sin(t*Math.PI)*18,lerp(sa[1],sc[1],t)];await p.mouse.move(...pos);}
      else if(i===74){await p.mouse.up();}
      else if(i===88){const bb=await p.locator('button:has-text("건설 확정"):visible').last().boundingBox(); btn=bb?[bb.x+bb.width/2,bb.y+bb.height/2]:pos; home=pos;}
      else if(i>88&&i<=108&&btn){const t=ease((i-88)/20);await p.mouse.move(lerp(home[0],btn[0],t),lerp(home[1],btn[1],t));}
      else if(i===112&&btn){await p.mouse.down();await p.waitForTimeout(40);await p.mouse.up();await p.waitForTimeout(150);
        await p.evaluate(()=>__ev('spd=24'));}
      else if(i===120){await p.mouse.move(btn?btn[0]+260:900,btn?btn[1]-200:300);}
    });
    await b.close(); },
  async layer(){ const {b,p}=await prep({skin:'classic',warm:60}); await hideToast(p);
    await p.locator('button:has-text("수요 지도"):visible').first().click(); await p.waitForTimeout(300);
    await p.locator('button[title="지도 레이어 순환"]').first().click(); await p.waitForTimeout(300); await L.manual(p);
    const a=await cityPos(p,'대전');
    await shoot(p,'layer',3.2*FPS,async(i,t)=>{ if(i===48){await p.locator('button[title="지도 레이어 순환"]').first().click();} await setCam(p,a[0],a[1]-30,lerp(1.25,1.4,t));});
    await b.close(); },
  async growth(){ for(const ch of [1,2,3,4]){ const {b,p}=await prep({ch,skin:'paper',cine:true,warm:20});
      const a=await cityPos(p,'서울'),c=await cityPos(p,'부산'),cx=(a[0]+c[0])/2,cy=(a[1]+c[1])/2;
      await shoot(p,'growth'+ch,1.6*FPS,async(i,t)=>setCam(p,cx,cy,lerp(1.55,1.6,t)+ (ch-1)*0.05));
      await b.close(); } },
  async trains(){ const {b,p}=await prep({skin:'classic',warm:60,spd:4}); await hideToast(p);
    const a=await cityPos(p,'서울');
    await shoot(p,'trains',3.4*FPS,async(i,t)=>setCam(p,a[0]+lerp(20,-10,t),a[1]+20,lerp(3.2,3.6,t)));
    await b.close(); },
  async research(){ const {b,p}=await prep({skin:'classic',warm:60}); await hideToast(p); await cursor(p);
    await p.locator('button:has-text("연구"):visible').first().click(); await p.waitForTimeout(500);
    await p.evaluate(()=>{document.querySelectorAll('button').forEach(b=>{if(b.textContent.trim()==='도움말 끄기'&&b.offsetParent)b.click();});});
    await L.manual(p);
    await shoot(p,'research',3.2*FPS,async(i,t)=>p.mouse.move(lerp(500,760,ease(t)),lerp(330,250,ease(t))));
    await b.close(); },
  async final(){ const {b,p}=await prep({skin:'classic',cine:true,warm:200,hour:3.5});
    const a=await cityPos(p,'서울'),c=await cityPos(p,'대전'); 
    await shoot(p,'final',6*FPS,async(i,t)=>{const e=ease(t);setCam(p,lerp(a[0],c[0],e*.8),lerp(a[1],c[1],e*.8),Math.exp(lerp(Math.log(7),Math.log(1.6),e)));await p.evaluate(h=>{window.__H=h},lerp(3.5,7.6,t));});
    await b.close(); },
};
(async()=>{ const names=process.argv.slice(2); for(const n of (names.length?names:Object.keys(CLIPS))) await CLIPS[n](); })();
