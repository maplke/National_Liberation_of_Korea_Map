/* 자동 생성 · tools/extract.js · 원본 everyline-rail 0.19.0-b114
   게임 로더의 validScen을 그대로 옮긴 것이다. 손으로 고치지 말고 다시 뽑는다(지시서 10-6). */
const GAME_VER="0.19.0-b114";
const METRIC={dblRatio:1,hsKm:1,connSmall:1,metroShare:1,longShare:1,profit3:1,debtRatio:1,pax:1,debt:1,cash:1,lines:1,year:1,fareLv:1};
const KT=[['build','건설비',1],['time','공사 기간',1],['trk','선로 유지비',1],['st','역 유지비',1],
 ['veh','차량비',0],['run','주행비',0],['rsp','연구 속도',0],['rc','연구비',0],
 ['acc','사고율',1],['permit','인허가 기간',1]];
const PCOND=['yr','res','dec','ev','opin','gov','cash','net','loss'];
const PNET={km:['선로 연장','km'],elKm:['전철화 연장','km'],st:['역 수','곳']};
function KTo(k){return KT.find(x=>x[0]===k)||null;}
function efxN(e){return e&&e.t==='costMul'?Object.assign({},e,{t:'mul',k:'build'}):e;}   // 2-3 옛 비용 계수는 건설비로 읽는다
const EFX=['demandMul','nodeWeight','modeAvail','mul','techUnlock','cash','constraint','planCancel','trust'];
const QREQ=['link','serve','grade','freq','time','share','keep','metric'];   // 설계안 3-1 닫힌 목록
const QSRC={gov:'정부',loc:'지자체',biz:'기업'};                         // 2-1 닫힌 목록
const GKIND=['ratio','pax','km','money','lteRatio','lteMoney'];
const FST=['on','off','opt'];
function validScen(r){const e=[];
 if(!r||typeof r!=='object')return['시나리오 파일을 읽을 수 없습니다'];
 ['id','ver','title'].forEach(k=>{if(!r[k])e.push('필수 필드가 없습니다 · '+k);});
 if(!r.map||!r.map.src||!Array.isArray(r.map.proj)||r.map.proj.length!==6)
  e.push('지도 정의가 없거나 투영 계수가 여섯 개가 아닙니다');
 if(!Array.isArray(r.nodes)||!r.nodes.length)e.push('노드 배열이 없습니다');
 else{r.nodes.forEach((n,i)=>{if(!n||n.length<6)e.push((i+1)+'번 노드의 속성이 모자랍니다');});
  const seen={};
  r.nodes.forEach(n=>{if(!n)return;
   if(seen[n[0]])e.push('노드 이름이 겹칩니다 · '+n[0]);seen[n[0]]=1;});
  const has=nm=>r.nodes.some(x=>x&&x[0]===nm);
  r.nodes.forEach(n=>{const a=(n&&n[6])||null;if(!a)return;
   if(a.parent&&!has(a.parent))e.push('참조할 수 없는 부모 노드 · '+a.parent);
   if(a.unlock&&!has(a.unlock.by))e.push('참조할 수 없는 해금 기준 노드 · '+a.unlock.by);
   if(typeof a.pull==='string'&&!(r.pullProf&&r.pullProf[a.pull]!=null))
    e.push('알 수 없는 pull 프로필 · '+a.pull);});}
 if(!r.era||!Array.isArray(r.era.cpi)||!Array.isArray(r.era.pop))
  e.push('시대 곡선이 갖춰지지 않았습니다');
 if(!Array.isArray(r.modes))e.push('수단 테이블이 없습니다');
 else r.modes.forEach(m=>{if(!m.id||!m.nm)e.push('수단에 식별자나 이름이 없습니다');
  [['v',m.v],['acc',m.acc],['av',m.av]].forEach(([nm,c2])=>{
   if(!c2||['const','logi','ramp','pts'].indexOf(c2.t)<0)
    e.push(m.id+' 수단의 '+nm+' 곡선 종류가 목록 밖입니다');});});
 if(!r.tech||!Array.isArray(r.tech.sig))e.push('기술 표가 없습니다');
 // H단계 테크트리. 없으면 연구 창이 비고 해금 제약이 걸리지 않는다
 if(r.tech&&r.tech.tree!=null){const tr=r.tech.tree,ids={},ln={};
  if(!Array.isArray(tr))e.push('테크트리가 배열이 아닙니다');
  else{(r.tech.lanes||[]).forEach(l=>{ln[l[0]]=1;});tr.forEach(t=>{if(t&&t.id)ids[t.id]=1;});
   tr.forEach(t=>{if(!t||!t.id){e.push('식별자 없는 기술이 있습니다');return;}
    if(!ln[t.l])e.push('기술의 계통이 목록 밖입니다 · '+t.id);
    (t.p||[]).forEach(p=>{if(!ids[p])e.push('기술의 선행을 찾을 수 없습니다 · '+t.id+' ← '+p);});
    if(t.fx&&t.fx.sig!=null&&!r.tech.sig[t.fx.sig])e.push('기술이 없는 신호 등급을 가리킵니다 · '+t.id);
    if(t.fx&&t.fx.wipKm!=null&&!(t.fx.wipKm>0))e.push('동시 공사 한도 증가값이 양수가 아닙니다 · '+t.id);});
   if(r.veh&&Array.isArray(r.veh.list))r.veh.list.forEach(v=>{if(!v.id)e.push('식별자 없는 차종이 있습니다');
    else{if(v.r&&!ids[v.r])e.push('차종의 해금 연구를 찾을 수 없습니다 · '+v.id+' ← '+v.r);
     if(!(v.A>0&&v.V>0&&v.cap>0))e.push('차종의 가감속·속도·정원이 없습니다 · '+v.id);}});}}
 if(!r.presets||typeof r.presets!=='object')e.push('프리셋 망이 없습니다');
 if(!Array.isArray(r.chapters)||!r.chapters.length)e.push('챕터 정의가 없습니다');
 else r.chapters.forEach((c,i)=>{const t=(i+1)+'챕터';
  if(c.y0==null||c.y1==null)e.push(t+'에 연도 구간이 없습니다');
  if(c.cap==null)e.push(t+'에 시작자본이 없습니다');
  if(i===0){if(c.pre)e.push('첫 챕터는 프리셋 없이 무에서 시작해야 합니다');}
  else if(!r.presets||!r.presets[c.pre])e.push(t+'가 참조하는 프리셋을 찾을 수 없습니다 · '+c.pre);
  if(!Array.isArray(c.goals)||!c.goals.length)e.push(t+'에 목표가 없습니다');
  else{if(c.goals.length>3)e.push(t+'의 목표가 셋을 넘습니다');
   c.goals.forEach(g=>{if(!METRIC[g.m])e.push(t+'의 목표가 알 수 없는 지표를 참조합니다 · '+g.m);
    if(GKIND.indexOf(g.k)<0)e.push(t+'의 목표 판정 종류가 목록 밖입니다 · '+g.k);});}});
 if(r.events!=null&&!Array.isArray(r.events))e.push('이벤트 정의가 배열이 아닙니다');
 else (r.events||[]).forEach(v=>{
  if(!v.id)e.push('식별자 없는 이벤트가 있습니다');
  const efs=(v.efx||[]).concat((v.plan&&v.plan.done&&v.plan.done.efx)||[]);
  efs.forEach(x=>{if(EFX.indexOf(x.t)<0)
   e.push('효과 타입이 8-6 목록 밖입니다 · '+x.t);});
  if(v.kind==='plan'&&!v.plan)e.push('계획형 이벤트에 plan 정의가 없습니다 · '+v.id);
  if(v.cond&&v.cond.when&&!METRIC[v.cond.when.m])
   e.push('이벤트 조건이 알 수 없는 지표를 참조합니다 · '+v.id);
  if(v.kind!=null&&['plan','badge','era'].indexOf(v.kind)<0)e.push('이벤트 종류가 목록 밖입니다 · '+v.id+' · '+v.kind);
  if(v.cond&&v.cond.m!=null&&!(v.cond.m>=1&&v.cond.m<=12))e.push('이벤트 조건의 달이 1~12 밖입니다 · '+v.id);
  if(v.cond&&v.cond.after&&!(r.events||[]).some(x=>x&&x.id===v.cond.after))
   e.push('이벤트 조건이 없는 사건을 가리킵니다 · '+v.id+' → '+v.cond.after);});
 // 의뢰 시스템 설계안 3-3 · 부록 A 3-8
 if(r.quests!=null){if(!Array.isArray(r.quests))e.push('의뢰 정의가 배열이 아닙니다');
  else{const ids={},has=nm=>Array.isArray(r.nodes)&&r.nodes.some(x=>x&&x[0]===nm);
   r.quests.forEach(q=>{if(q&&q.id)ids[q.id]=1;});
   r.quests.forEach(q=>{const t='의뢰 '+((q&&q.id)||'?');
    if(!q||!q.id){e.push('식별자 없는 의뢰가 있습니다');return;}
    if(!QSRC[q.src])e.push(t+'의 발주처가 목록 밖입니다 · '+q.src);
    // 결정이 붙이는 틀 과제(tpl)는 자리와 요구를 붙는 순간 정한다(개편 지시서 3-1 · 3-5)
    if(q.mand!=null&&q.mand!==1&&q.mand!==2)e.push(t+'의 지정 표시(mand)는 1 또는 2입니다');
    if(q.tpl&&!(q.cond&&q.cond.dec))e.push(t+'는 틀 과제인데 결정 조건(dec)이 없습니다');
    if(!q.slot&&!q.tpl)e.push(t+'에 자리가 없습니다');
    if(!q.tpl&&(!Array.isArray(q.req)||!q.req.length||q.req.length>3))e.push(t+'의 요구는 1~3개여야 합니다');
    if(q.sub&&!ids[q.sub])e.push(t+'의 대체 의뢰를 찾을 수 없습니다 · '+q.sub);
    (q.req||[]).concat((q.alt&&q.alt.req)||[]).forEach(R=>{
     if(QREQ.indexOf(R.t)<0)e.push(t+'의 요구 타입이 목록 밖입니다 · '+R.t);
     ['a','b','st'].forEach(k=>{const v=R[k];(Array.isArray(v)?v:v!=null?[v]:[]).forEach(nm=>{
      if(!has(nm))e.push(t+'가 없는 노드를 가리킵니다 · '+nm);});});
     if(R.t==='metric'&&!METRIC[R.m])e.push(t+'의 지표를 알 수 없습니다 · '+R.m);
     if(R.t==='freq'&&R.v%10)e.push(t+'의 배차 기준이 10분 단위가 아닙니다');});
    const link=(q.req||[]).some(R=>R.t==='link');
    ['win','lose','no'].forEach(k=>(q[k]||[]).forEach(x=>{
     if(EFX.indexOf(x.t)<0)e.push(t+'의 효과 타입이 8-6 목록 밖입니다 · '+x.t);
     if(x.t==='cash'&&x.of==='est'&&!link)e.push(t+'가 선로 요구 없이 추정 공사비 보수를 씁니다');
     if(x.t==='trust'&&!QSRC[x.id])e.push(t+'의 신뢰 대상이 목록 밖입니다 · '+x.id);}));});}}
 // 정책 시스템 설계안 2-2 · 5-2 닫힌 목록 검증
 if(r.policy!=null){const p=r.policy,e2=m=>e.push('정책 · '+m);
  if(typeof p!=='object')e2('정의가 객체가 아닙니다');
  else{const reg={},tids={},bands={},pids={},dids={},evs={};
   (p.regs||[]).forEach(R=>{if(!R.id)e2('식별자 없는 권역이 있습니다');else reg[R.id]=1;});
   ((r.tech&&r.tech.tree)||[]).forEach(t=>{tids[t.id]=1;});((r.tech&&r.tech.bands)||[]).forEach(b=>{bands[b[0]]=1;});
   (p.pols||[]).forEach(P=>{pids[P.id]=1;});(p.decs||[]).forEach(D=>{dids[D.id]=1;});(r.events||[]).forEach(v=>{evs[v.id]=1;});
   const chkMul=(x,t)=>{if(!KTo(x.k))e2(t+'의 계수 대상이 목록 밖입니다 · '+x.k);if(x.b&&!bands[x.b])e2(t+'의 갈래를 찾을 수 없습니다 · '+x.b);};
   const chkSc=(x,t)=>{if(x.sc&&!reg[x.sc])e2(t+'의 권역을 찾을 수 없습니다 · '+x.sc);};
   const chkC=(c,t)=>{if(PCOND.indexOf(c.t)<0){e2(t+'의 조건 타입이 목록 밖입니다 · '+c.t);return;}
    if(c.t==='res'&&!tids[c.id])e2(t+'의 조건이 없는 연구를 가리킵니다 · '+c.id);
    if(c.t==='dec'&&!dids[c.id])e2(t+'의 조건이 없는 결정을 가리킵니다 · '+c.id);
    if(c.t==='ev'&&!evs[c.id]&&!c.na)e2(t+'의 조건이 없는 사건을 가리킵니다 · '+c.id);
    if(c.t==='net'&&!PNET[c.m])e2(t+'의 망 지표가 목록 밖입니다 · '+c.m);chkSc(c,t);};
   (p.pols||[]).forEach(P=>{const t='상시 정책 '+(P.id||'?');if(!P.id)e2('식별자 없는 상시 정책이 있습니다');
    if(['tog','step'].indexOf(P.kind)<0)e2(t+'의 형태가 목록 밖입니다');
    if(P.kind==='step'&&(!Array.isArray(P.lv)||!Array.isArray(P.fx)||P.lv.length!==P.fx.length))e2(t+'의 단계 수와 효과 수가 다릅니다');
    (P.kind==='step'?[].concat.apply([],P.fx||[]):(P.fx||[])).forEach(x=>{
     if(['mul','demandMul'].indexOf(x.t)<0)e2(t+'는 계수 변경과 수요 배율만 쓸 수 있습니다 · '+x.t);
     if(x.t==='mul')chkMul(x,t);if(x.dur)e2(t+'의 효과에는 기간을 둘 수 없습니다(2-7)');});
    (P.need||[]).forEach(c=>chkC(c,t));});
   (p.decs||[]).forEach(D=>{const t='결정 '+(D.id||'?');if(!D.id)e2('식별자 없는 결정이 있습니다');
    if(!D.cost||typeof D.cost!=='object')e2(t+'의 비용은 {m:억} 형태여야 합니다');
    (D.fx||[]).forEach(x=>{const y=efxN(x);if(EFX.indexOf(y.t)<0)e2(t+'의 효과 타입이 8-6 목록 밖입니다 · '+x.t);
     if(y.t==='mul')chkMul(y,t);chkSc(y,t);
     if(y.t==='trust'&&y.id!=='gov')e2(t+'는 정부 신뢰만 움직일 수 있습니다(1-4)');
     if(y.t==='constraint'&&y.op&&!pids[y.pol])e2(t+'가 없는 상시 정책을 가리킵니다 · '+y.pol);});
    (D.cond||[]).forEach(c=>chkC(c,t));});
   (p.pre||[]).forEach((L,i)=>(L||[]).forEach(x=>{const id=Array.isArray(x)?x[0]:x;
    if(!dids[id])e2((i+1)+'챕터 프리셋이 없는 결정을 가리킵니다 · '+id);}));}}
 if(!Array.isArray(r.feats))e.push('기능 표가 없습니다');
 else r.feats.forEach(f=>{if(!f.id)e.push('기능 표에 식별자 없는 항목이 있습니다');
  else if(FST.indexOf(f.state)<0)e.push('기능 표의 상태 값이 목록 밖입니다 · '+f.id);});
 if(!r.diff||['cap','build','dem','goal'].some(k=>typeof r.diff[k]!=='number'))
  e.push('난이도 계수 넷이 갖춰지지 않았습니다');
 return e;}

