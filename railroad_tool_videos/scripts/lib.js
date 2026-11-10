const {chromium}=require('playwright');
exports.start=async(opt={})=>{const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:1920,height:1080},locale:'ko-KR',...(opt.video?{recordVideo:{dir:opt.video,size:{width:1920,height:1080}}}:{})});
 const p=await ctx.newPage();p.on('pageerror',e=>console.log('PERR',e.message));
 await p.goto('file://'+__dirname+'/game_rec.html');await p.waitForTimeout(1200);
 return {b,ctx,p};};
exports.newGame=async(p)=>{
 await p.getByText('새 게임').first().click();await p.waitForTimeout(600);
 await p.getByText('한국',{exact:true}).first().click();await p.waitForTimeout(300);
 await p.getByText('다음',{exact:true}).first().click();await p.waitForTimeout(800);
 await p.click('[data-ch="0"]');await p.waitForTimeout(500);
 await p.getByText('쉬움',{exact:true}).first().click();await p.waitForTimeout(300);
 await p.click('[data-ft="resGate"]');await p.waitForTimeout(300);
 await p.getByText('게임 시작',{exact:true}).first().click();await p.waitForTimeout(2500);};
exports.Q=(p,s)=>p.evaluate(s=>window.__q(s),s);
exports.city=async(p,name)=>p.evaluate(n=>window.__q('('+(n=>{const i=CT.findIndex(c=>c[0]===n);if(i<0)return null;const s=scr(i),r=cv.getBoundingClientRect();return {i,x:r.left+s[0]*UIZ,y:r.top+s[1]*UIZ,vis:nodeVis(i)};})+')('+JSON.stringify(n)+')'),name);
exports.drag=async(p,pts,steps=25,pause=250)=>{await p.mouse.move(pts[0].x,pts[0].y,{steps:15});await p.waitForTimeout(pause);await p.mouse.down();
 for(let k=1;k<pts.length;k++){await p.mouse.move(pts[k].x,pts[k].y,{steps});await p.waitForTimeout(pause);}await p.mouse.up();};
exports.zoom=async(p,name,n,dy=0,dx=0)=>{const a=await exports.city(p,name);await p.mouse.move(a.x+dx,a.y+dy,{steps:10});for(let k=0;k<n;k++){await p.mouse.wheel(0,-100);await p.waitForTimeout(120);}await p.waitForTimeout(300);};
exports.setup=async(p)=>{await exports.newGame(p);await p.getByText('시작',{exact:true}).click();await p.waitForTimeout(400);
 await p.evaluate(()=>{const x=document.querySelector('#toast [title*="닫"], #toast .tX');});};
exports.quiet=async(p)=>exports.Q(p,"cfg.era='off';cfg.ntf='off';cfg.ntfImp=false;cfg.hints=false;1");
exports.closeToast=async(p)=>{await exports.Q(p,"(document.querySelector('#toast .tX,#toast [data-tx]')||{click(){}}).click();1");};
// build rail between named cities quickly (off-camera) and finish construction
exports.quickRail=async(p,names,opt={})=>exports.Q(p,`(()=>{const ids=${JSON.stringify(names)}.map(n=>CT.findIndex(c=>c[0]===n));
 setMode(2);plan={s:[ids[0]],g:[]};for(let k=1;k<ids.length;k++)planAdd(ids[k]);cold();document.getElementById('pOk').click();return plan;})()`);
exports.ff=async(p,units)=>exports.Q(p,`(()=>{for(let n=0;n<${units}/0.2;n++)upd(0.2);hot();cold();return calDate();})()`);
exports.handles=async(p)=>exports.Q(p,"(()=>{const r=cv.getBoundingClientRect();return planHandles().map(([q,h,s])=>({q,x:r.left+(h[0]+view.px)*UIZ,y:r.top+(h[1]+view.py)*UIZ,dir:s.dir,f:s.f}));})()");
exports.trkPt=async(p,a,b,f=0.5)=>exports.Q(p,`(()=>{const A=CT.findIndex(c=>c[0]===${JSON.stringify(a)}),B=CT.findIndex(c=>c[0]===${JSON.stringify(b)});rgEnsure();const k=key(A,B);const g=RGI.cg.get(k);const r=cv.getBoundingClientRect();
 let P=g&&g.p;if(!P)return null;let L=0;const d=[];for(let i=1;i<P.length;i++){const s=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);d.push(s);L+=s;}
 let t=L*${f};for(let i=1;i<P.length;i++){if(t<=d[i-1]){const u=t/d[i-1];const x=P[i-1][0]+(P[i][0]-P[i-1][0])*u,y=P[i-1][1]+(P[i][1]-P[i-1][1])*u;return {x:r.left+(x+view.px)*UIZ,y:r.top+(y+view.py)*UIZ,k};}t-=d[i-1];}return null;})()`);
exports.quickStations=async(p,names,g=0)=>exports.Q(p,`(()=>{setMode(1);sg=${g};const r=[];for(const n of ${JSON.stringify(names)}){const i=CT.findIndex(c=>c[0]===n);if(!st[i].on)r.push(buildStation(i));}setMode(0);cold();return r;})()`);
exports.cells=async(p)=>p.evaluate(()=>{const g=document.querySelector('.sd-grid');const cs=[...g.children].filter(e=>!e.classList.contains('sd-ov'));const W=getComputedStyle(g).gridTemplateColumns.split(' ').length;
 return {W,H:cs.length/W,c:cs.map(e=>{const r=e.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2];})};});
