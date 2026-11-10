const L=require('./lib.js'),R=require('./rec.js'),path=require('path'),fs=require('fs');
const OUT=path.join(__dirname,'out');fs.mkdirSync(OUT,{recursive:true});
const W=ms=>new Promise(r=>setTimeout(r,ms));
let P,cur={x:960,y:540};
async function mv(x,y,speed=1){const d=Math.hypot(x-cur.x,y-cur.y);const steps=Math.max(8,Math.round(d/(9*speed)));await P.mouse.move(x,y,{steps});cur={x,y};}
async function click(x,y,o={}){await mv(x,y);await W(o.pre??350);await P.mouse.down();await W(90);await P.mouse.up();await W(o.post??650);}
async function box(sel){const l=typeof sel==='string'?P.locator(sel).first():sel;await l.scrollIntoViewIfNeeded().catch(()=>{});const b=await l.boundingBox();if(!b)throw new Error('no box '+sel);return {x:b.x+b.width/2,y:b.y+b.height/2};}
async function clickSel(sel,o){const b=await box(sel);await click(b.x,b.y,o);}
async function hover(sel,ms=900){const b=await box(sel);await mv(b.x,b.y);await W(ms);}
async function drag(pts,o={}){await mv(pts[0].x,pts[0].y);await W(o.pre??400);await P.mouse.down();await W(o.hold??150);
 for(let k=1;k<pts.length;k++){await mv(pts[k].x,pts[k].y,o.speed??0.6);await W(o.pause??350);}await P.mouse.up();await W(o.post??700);}
const C=n=>L.city(P,n);
const rp=()=>P.locator('#right');
async function prep({setup,zoom=['수원',15,0],mode}={}){
 const S=await L.start();P=S.p;await L.newGame(P);await L.quiet(P);await L.Q(P,"cfg.dayFx=false;1");
 await P.getByText('시작',{exact:true}).click();await W(400);
 if(setup)await setup();
 await L.Q(P,"setMode(0);selT=null;toastHide=true;showToast();cold();1");
 await L.zoom(P,zoom[0],zoom[1],zoom[2]||0,zoom[3]||0);
 if(mode!=null)await L.Q(P,`setMode(${mode});cold();1`);
 await R.cursor(P);cur={x:930,y:960};await P.mouse.move(cur.x,cur.y);await W(600);return S;}
async function rec(name,fn,opt){const S=await prep(opt);const r=await R.start(P,path.join(__dirname,'fr_'+name));await W(1200);
 try{await fn();}catch(e){console.log('ERROR in',name,e);}
 await W(1800);await R.stop(r,path.join(OUT,name+'.mp4'));await P.screenshot({path:path.join(__dirname,'last_'+name+'.png')});await S.b.close();}
const NET=async()=>{await L.quickRail(P,['서울','과천','안양','의왕','수원','오산','평택','천안']);await L.ff(P,150);};
const NETST=async()=>{await NET();await L.quickStations(P,['수원','평택','천안']);await L.ff(P,80);};
const modeBtn=m=>clickSel(`#bMode [data-m="${m}"]`);

const V={
'01_철도건설_역에서역으로끌어_선로계획': async()=>{
 await modeBtn(2);await W(700);
 const a=await C('서울'),b=await C('수원');await drag([a,b],{speed:.45});
 await hover('#right .sect:has-text("설계 계획")',600);
 for(const t of ['총연장','건설비','지형 계수','예상 공기','동시 공사','인허가'])await hover(rp().locator('.kv span',{hasText:t}).first(),550);
 await clickSel('#pOk');await W(2000);},
'02_철도건설_여러역잇기_되돌아가면구간취소': async()=>{
 await modeBtn(2);await W(600);
 const [a,b,c,d,e]=await Promise.all(['수원','오산','평택','천안','아산'].map(C));
 await drag([a,b,c,d,c,e],{speed:.45,pause:700});
 await hover('#right .sect:has-text("설계 계획")',1500);},
'03_철도건설_계획이어그리기_역눌러구간추가': async()=>{
 await modeBtn(2);await W(600);
 let a=await C('수원'),b=await C('오산');await drag([a,b],{speed:.5});await W(500);
 const c=await C('평택');await drag([b,c],{speed:.5});await W(600);
 const d=await C('천안');await click(d.x,d.y,{post:1000});
 const e=await C('아산');await click(e.x,e.y,{post:1000});
 await hover('#right .sect:has-text("설계 계획")',1500);},
'04_철도건설_선로형상_손잡이끌기_뒤집기': async()=>{
 await modeBtn(2);await W(600);
 const a=await C('오산'),b=await C('안성');await drag([a,b],{speed:.5});await W(600);
 let h=(await L.handles(P))[0];
 await drag([h,{x:h.x+45,y:h.y},{x:h.x+70,y:h.y}],{pause:600});
 h=(await L.handles(P))[0];await drag([h,{x:h.x-70,y:h.y},{x:h.x-110,y:h.y}],{pause:600});
 h=(await L.handles(P))[0];await click(h.x,h.y,{post:1300});   // 꺾임 방향 뒤집기
 h=(await L.handles(P))[0];await drag([h,{x:h.x,y:h.y-40},{x:h.x,y:h.y+40}],{pause:600});
 h=(await L.handles(P))[0];await click(h.x,h.y,{post:1300});
 await clickSel('#pOk');await W(1500);},
'05_철도건설_선로등급_선로수_비용비교': async()=>{
 await modeBtn(2);await W(600);
 const a=await C('서울'),b=await C('수원');await drag([a,b],{speed:.5});
 const cost=rp().locator('.kv',{hasText:'건설비'}).first();
 await clickSel('#right [data-tt="1"]');await hover(cost,1000);
 await clickSel('#right [data-tt="0"]');await hover(cost,900);
 for(const n of [2,3,4,6,8]){const s=P.locator(`#right [data-tn="${n}"]`);if(!await s.count())continue;await clickSel(s);await hover(cost,900);}
 await clickSel('#right [data-tn="2"]');await hover(cost,900);
 await clickSel('#pOk');await W(1500);},
'06_철도건설_순환선_첫역으로돌아와고리닫기': async()=>{
 await modeBtn(2);await W(600);
 const [a,b,c,d,e]=await Promise.all(['수원','용인','안성','평택','오산'].map(C));
 await drag([a,b,c,d,e,a],{speed:.45,pause:600});
 await hover('#right .sect:has-text("설계 계획")',1500);
 await clickSel('#pOk');await W(1500);},
'07_철도건설_계획취소_취소버튼과Esc': async()=>{
 await modeBtn(2);await W(600);
 let a=await C('수원'),b=await C('평택');await drag([a,b],{speed:.5});await W(800);
 await clickSel('#pNo',{post:1200});
 a=await C('서울');b=await C('수원');await drag([a,b],{speed:.5});await W(1000);
 await P.keyboard.press('Escape');await W(1500);},
'08_공사현황_착공부터완공까지': async()=>{
 await modeBtn(2);await W(600);
 let a=await C('서울'),b=await C('수원');await drag([a,b],{speed:.5});await clickSel('#pOk');
 a=await C('수원');b=await C('평택');await drag([a,b],{speed:.5});await clickSel('#pOk');
 await clickSel('#right [data-dp="wip"]',{post:1500});
 await modeBtn(0);await W(500);
 const t=await L.trkPt(P,'수원','오산');await click(t.x,t.y,{post:1500});
 await hover(rp().locator('.sect',{hasText:'공사 진행'}).first(),1000);
 await hover(rp().locator('[data-wcx]').first(),1000);
 await clickSel('[data-sp="4"]');await mv(1300,800);
 for(let k=0;k<40;k++){await W(1000);const n=await L.Q(P,"Object.values(trk).filter(e=>e.wip).length");if(!n){await W(3000);break;}}
 await clickSel('[data-sp="0"]');await W(1000);},
'09_역건설_역등급선택_도시눌러계획_일괄건설': async()=>{
 await modeBtn(1);await W(800);
 await clickSel('#right [data-sg="1"]');await W(400);
 for(const n of ['수원','오산','평택','천안','안양']){const c=await C(n);await click(c.x,c.y,{post:600});}
 const c=await C('안양');await click(c.x,c.y,{post:900});   // 다시 누르면 계획에서 빠짐
 await hover(rp().locator('.sect',{hasText:'계획'}).last(),900);
 await clickSel(rp().locator('[data-sc]').last(),{post:900});   // 빼기
 const sel=rp().locator('select[data-sdpall]');if(await sel.count()){await hover(sel,500);await sel.selectOption({index:1});await W(1000);}
 await clickSel('#allB',{post:2000});},
'10_역건설_지은역누르기_역등급승격': async()=>{
 await modeBtn(1);await W(800);
 const c=await C('수원');await click(c.x,c.y,{post:1500});
 const g=rp().locator('[data-bgu]').first();if(await g.count()){await hover(g,1200);await clickSel(g,{post:1800});}
 const d=await C('평택');await click(d.x,d.y,{post:1500});},
'11_역설계_설계안편집기로새역설계': async()=>{
 await modeBtn(1);await W(700);
 await clickSel('#right [data-bt="lib"]',{post:900});
 await clickSel(rp().getByText('새 간이역 설계안'),{post:1200});
 await clickSel('[data-wmax="sd"]',{post:900});
 const Wd=P.locator('[data-wt="sd"]');
 for(let k=0;k<3;k++)await clickSel(Wd.getByText('＋',{exact:true}).first(),{post:350});
 let G=await L.cells(P);const at=(x,y)=>({x:G.c[y*G.W+x][0],y:G.c[y*G.W+x][1]});
 await clickSel(Wd.getByText('상대식',{exact:true}));await drag([at(1,0),at(6,0)],{speed:.5});
 await clickSel(Wd.getByText('대합실',{exact:true}).first());await drag([at(2,2),at(5,3)],{speed:.5});
 await clickSel(Wd.getByText('자판기',{exact:true}));await drag([at(6,2),at(6,3)],{speed:.5});
 await clickSel(Wd.getByText('출입구',{exact:true}));await drag([at(3,4),at(4,4)],{speed:.5});
 await hover(Wd.getByText('설계 조건',{exact:false}).first(),1500);
 await clickSel(Wd.getByText('동선 표시',{exact:true}),{post:1200});
 const nm=Wd.locator('input').first();await clickSel(nm);await P.keyboard.press('Control+A');await P.keyboard.type('영상용 간이역',{delay:120});await W(600);
 await clickSel(Wd.getByText('설계안 저장',{exact:true}),{post:2000});},
'12_선로선택_구간정보_복선화개량': async()=>{
 const t=await L.trkPt(P,'수원','오산');await click(t.x,t.y,{post:1200});
 for(const s of ['구간','등급 / 선로','연장','월 선로비','선로 상태'])await hover(rp().locator('.kv span',{hasText:s}).first(),600);
 await hover('#right #up',1000);
 await clickSel(rp().locator('[data-nu]').first(),{post:1800});
 await hover(rp().locator('.sect',{hasText:'공사 진행'}).first(),1500);},
'13_선로선택_여러구간고르기_한꺼번에개량': async()=>{
 const pts=[];for(const [a,b] of [['서울','과천'],['과천','안양'],['안양','의왕'],['의왕','수원'],['수원','오산']]){pts.push(await L.trkPt(P,a,b,.5));}
 await mv(pts[0].x,pts[0].y);await W(400);await P.mouse.down();await W(700);
 for(let k=1;k<pts.length;k++){await mv(pts[k].x,pts[k].y,.5);await W(250);}await P.mouse.up();await W(1200);
 await hover(rp().locator('.lst').first(),1200);
 const q=await L.trkPt(P,'오산','평택');await P.keyboard.down('Shift');await click(q.x,q.y,{post:900});await P.keyboard.up('Shift');
 await clickSel(rp().locator('[data-tsx]').first(),{post:1000});
 await clickSel(rp().locator('[data-tsc]'),{post:1300});   // 이어진 구간 모두
 await hover(rp().locator('[data-tbk="nu"]'),900);
 await clickSel(rp().locator('[data-tbk="nu"]'),{post:2000});},
'14_철거_선로구간철거': async()=>{
 await modeBtn(3);await W(1000);
 await hover('#right .sect:has-text("철거 규칙")',1200);
 const t=await L.trkPt(P,'평택','천안');await click(t.x,t.y,{post:1300});
 await hover('#right #ty',900);await clickSel('#right #ty',{post:1800});},
'15_철거_역철거와폐역': async()=>{
 await modeBtn(3);await W(1000);
 const c=await C('평택');await click(c.x,c.y,{post:1300});
 await hover(rp().getByText('폐역 확정',{exact:true}),900);await clickSel(rp().getByText('폐역 확정',{exact:true}),{post:1800});
 const d=await C('천안');await click(d.x,d.y,{post:1300});
 await clickSel(rp().getByText('철거 확정',{exact:true}),{post:1800});},
};
const OPT={
 '04_철도건설_선로형상_손잡이끌기_뒤집기':{zoom:['오산',17,0,60]},
 '09_역건설_역등급선택_도시눌러계획_일괄건설':{setup:NET},
 '10_역건설_지은역누르기_역등급승격':{setup:NETST},
 '12_선로선택_구간정보_복선화개량':{setup:NET},
 '13_선로선택_여러구간고르기_한꺼번에개량':{setup:NET},
 '14_철거_선로구간철거':{setup:NET},
 '15_철거_역철거와폐역':{setup:NETST},
};
(async()=>{const want=process.argv.slice(2);for(const k of Object.keys(V)){if(want.length&&!want.some(w=>k.startsWith(w)))continue;console.log('==',k);await rec(k,V[k],OPT[k]||{});}})();
