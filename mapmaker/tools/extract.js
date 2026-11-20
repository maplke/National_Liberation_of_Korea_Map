// 게임 HTML에서 맵 제작기가 쓰는 두 가지를 뽑는다.
//  1) 기본 시나리오 둘(한국 · 가람 지방)의 JSON  → src/base-kr.json, src/base-gr.json
//  2) 게임 로더의 검증 함수 validScen과 그 닫힌 목록들 → src/validator.js
// 쓰는 법: node tools/extract.js <everyline-rail-*.html>   (Playwright 필요)
const fs=require('fs'),path=require('path');
const {chromium}=require('playwright');
const src=process.argv[2];
if(!src){console.error('게임 HTML 경로를 주십시오');process.exit(1);}
const OUT=path.join(__dirname,'..','src');
let s=fs.readFileSync(src,'utf8');
const cut=(a,b)=>{const i=s.indexOf(a);if(i<0)throw new Error('못 찾음: '+a);const j=s.indexOf(b,i);if(j<0)throw new Error('못 찾음: '+b);return s.slice(i,j);};
const line=a=>{const i=s.indexOf(a);if(i<0)throw new Error('못 찾음: '+a);return s.slice(i,s.indexOf('\n',i));};
// 검증 함수 본문과 의존 목록
const parts=[
 cut('const KT=[','\n// '),           // 계수 대상 닫힌 목록 (여러 줄)
 line('const PCOND='),line('const PNET='),line('function KTo('),line('function efxN('),
 line('const EFX='),line('const QREQ='),line('const QSRC='),line('const GKIND='),
 cut('const FST=','let SCENS=[];')];
// 게임 안에서 패치해 실행하고 시나리오 객체와 METRIC 키를 꺼낸다
const hook='addScen(SCEN_GR,false);\n';
if(s.split(hook).length!==2)throw new Error('addScen(SCEN_GR) 자리를 하나로 찾지 못했습니다');
const tmp=path.join(require('os').tmpdir(),'everyline-extract.html');
fs.writeFileSync(tmp,s.replace(hook,hook+'window.__MM={KR:JSON.parse(JSON.stringify(SCEN_KR)),GR:JSON.parse(JSON.stringify(SCEN_GR)),MET:Object.keys(METRIC),VER:VER};\n'));
(async()=>{const b=await chromium.launch();const p=await b.newPage();
 await p.goto('file://'+tmp);await p.waitForFunction(()=>window.__MM,null,{timeout:20000});
 const R=await p.evaluate(()=>window.__MM);await b.close();
 const ver=R.VER.major+'.'+R.VER.minor+'.'+R.VER.patch+'-b'+R.VER.build;
 fs.writeFileSync(path.join(OUT,'base-kr.json'),JSON.stringify(R.KR));
 fs.writeFileSync(path.join(OUT,'base-gr.json'),JSON.stringify(R.GR));
 const js='/* 자동 생성 · tools/extract.js · 원본 everyline-rail '+ver+'\n   게임 로더의 validScen을 그대로 옮긴 것이다. 손으로 고치지 말고 다시 뽑는다(지시서 10-6). */\n'
  +'const GAME_VER='+JSON.stringify(ver)+';\n'
  +'const METRIC={'+R.MET.map(k=>k+':1').join(',')+'};\n'
  +parts.join('\n')+'\n';
 fs.writeFileSync(path.join(OUT,'validator.js'),js);
 console.log('추출 완료 · '+ver);})();
