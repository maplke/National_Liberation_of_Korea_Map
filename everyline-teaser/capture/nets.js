// Custom networks injected through the game's own preset format (stations, tracks, lines + trains).
const EXTRA=[ // added on top of chapter 4 → "2030 확장망"
 ['강릉 고속',1,['서울','하남','양평','횡성','평창','강릉'],4],
 ['동해선',0,['포항','영덕','울진','삼척'],2],
 ['강원 북부선',0,['춘천','화천','양구','인제','속초','양양','강릉'],2],
 ['서해선',0,['안산','화성','평택','당진','서산','태안'],3],
 ['남해안선',0,['목포','영암','장흥','보성','순천','광양','하동','사천','고성(경남)','통영','거제'],3],
 ['중부내륙선',0,['성남','광주(경기)','이천','여주','충주','괴산','문경','상주','김천'],3],
 ['수도권 순환선',0,['파주','김포','부천','시흥','안산','수원','용인','성남','하남','남양주','의정부'],5],
 ['남부내륙선',0,['대전','금산','무주','거창','함양','산청','진주'],2],
 ['경북 내륙선',0,['대구','군위','의성','안동','청송','영덕'],2],
 ['서해 남부선',0,['군산','부안','고창','영광','함평'],2],
 ['백제선',0,['세종','공주','부여','서천'],2],
 ['남도선',0,['광주','담양','순창','남원'],2],
 ['진도선',0,['나주','영암','해남','진도'],1],
 ['경기 동부선',0,['포천','남양주','하남','광주(경기)','용인','안성','진천','청주'],3],
];
const HUB=[ // chapter-1 map + a capital-hub network unlike any preset
 ['한강선',0,['인천','부천','서울','구리','남양주','가평','춘천','홍천','인제','속초'],5],
 ['남북선',0,['파주','고양','서울','과천','성남','용인','이천','여주','원주'],5],
 ['동서 고속',0,['김포','서울','하남','양평','횡성','평창','강릉'],4],
 ['경기 종단선',0,['의정부','서울','안양','수원','오산','평택','천안'],5],
 ['동부 순환선',0,['포천','남양주','하남','광주(경기)','용인','안성','진천','청주'],3],
 ['북부선',0,['강화','김포','고양','의정부','포천','철원'],2],
 ['서남부선',0,['시흥','안산','화성','오산','용인','이천'],3],
 ['충청 연결선',0,['천안','세종','대전','청주','증평','충주','제천'],3],
];
const KEEP_PROFIT=['경부고속','수도권 전철','경인선','경부선','경원선','과천·안산선','분당선','경춘선','경의선'];
function injectSrc(){return `window.__net=function(L,replace,keep){
  const id=n=>CT.findIndex(c=>c[0]===n);
  if(keep){lines=lines.filter(l=>keep.indexOf(l.name)>=0);}
  if(replace){lines=[];}
  const G=(PRE[4]&&PRE[4].gr)||1;
  L.forEach(([nm,hs,stops,ntr])=>{
    const s=stops.map(id).filter(x=>x>=0);
    s.forEach(i=>{if(!st[i].on){st[i].on=true;st[i].everOn=1;st[i].gr=G;st[i].unl=1;st[i].wip=0;}});
    for(let q=0;q<s.length-1;q++){const A=s[q],B=s[q+1],k=key(A,B);
      if(!trk[k])trk[k]={a:A,b:B,t:hs,n:2,n0:0,oc:[0,0],ex:[0,0],lt:[-999,-999],cost:tkBase(A,B,hs,2),wip:0,pt:hs,pn:2,cond:CONDD().c0[Math.min(chap,3)]};
      else if(hs&&!trk[k].t){trk[k].t=1;trk[k].pt=1;}}
    const l=mkline(hs);l.name=nm;l.s=s;l.sk=s.map(()=>false);
    for(let q=0;q<ntr;q++)l.tr.push({seg:0,x:0,v:0,d:1,dw:0,hold:true,pax:[],b:ymNow()});
    l.cap=trCost(l)*ntr;l.opened=1;assets+=l.cap;lines.push(l);});
  dirty=true;try{cold();}catch(e){}
  return lines.length;}`;}
async function applyNet(p,kind){
  await p.evaluate(s=>__ev(s),injectSrc());
  if(kind==='extra') return p.evaluate(L=>__net(L,false,null),EXTRA);
  if(kind==='hub')   return p.evaluate(L=>__net(L,true,null),HUB);
  if(kind==='lean')  return p.evaluate(k=>__net([],false,k),KEEP_PROFIT);
  if(kind==='leanplus') return p.evaluate(([L,k])=>__net(L,false,k),[EXTRA.filter(x=>['강릉 고속','수도권 순환선'].includes(x[0])),KEEP_PROFIT]);
}
module.exports={applyNet,EXTRA,HUB,KEEP_PROFIT};
// prune: keep only the named lines, drop tracks and stations they don't use (a genuine "축소 균형" play)
async function prune(p,keep){
  return p.evaluate(k=>__ev(`(function(){const K=${JSON.stringify(k)};
    lines=lines.filter(l=>K.indexOf(l.name)>=0);
    const used=new Set(),us=new Set();lines.forEach(l=>{l.s.forEach(i=>us.add(i));for(let q=0;q<l.s.length-1;q++)used.add(key(l.s[q],l.s[q+1]));});
    for(const x of Object.keys(trk))if(!used.has(x))delete trk[x];
    st.forEach((s,i)=>{if(s.on&&!us.has(i)){s.on=false;}});
    dirty=true;try{cold();}catch(e){}return lines.length+' lines, '+Object.keys(trk).length+' tracks';})()`),keep);
}
module.exports.prune=prune;
