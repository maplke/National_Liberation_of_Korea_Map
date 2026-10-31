const { chromium } = require('playwright');
async function open({w=1920,h=1080,dsf=1}={}){
  const b = await chromium.launch({args:['--disable-gpu-vsync']});
  const p = await b.newPage({ viewport:{width:w,height:h}, deviceScaleFactor:dsf, locale:'ko-KR' });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto('file://'+(process.env.GAME||'/tmp/game/cap.html'));
  await p.waitForTimeout(1500);
  return {b,p};
}
async function startChapter(p, ch, skin){
  if(skin) await p.evaluate(k=>__ev(`setSkin("${k}")`), skin);
  await p.getByText('새 게임').first().click();
  await p.waitForTimeout(400);
  await p.getByText('한국', {exact:true}).first().click();
  await p.locator(':text-is("다음"):visible').first().click();
  await p.waitForTimeout(500);
  await p.locator(`:text("${ch}챕터"):visible`).first().click();
  await p.waitForTimeout(300);
  await p.locator(':text("게임 시작"):visible').first().click();
  await p.waitForTimeout(2500);
  // close start dialog
  const s = p.getByText('시작',{exact:true});
  if(await s.count()) { try{ await s.first().click({timeout:1500}); }catch(e){} }
  await p.waitForTimeout(500);
}
// take control of the loop: stop rAF, step manually
async function manual(p){
  await p.evaluate(()=>{ window.__T=performance.now(); window.__raf=window.requestAnimationFrame; window.requestAnimationFrame=()=>0; });
  await p.waitForTimeout(100);
}
async function step(p, n=1, dtms=1000/30){
  await p.evaluate(([n,d])=>{ for(let i=0;i<n;i++){ window.__T+=d; (window.__loop||(window.__loop=__ev("loop")))(window.__T);} }, [n,dtms]);
}
module.exports={open,startChapter,manual,step};
async function cine(p, on=true){
  await p.evaluate(on=>{
    let s=document.getElementById('__cine'); if(!s){s=document.createElement('style');s.id='__cine';document.head.appendChild(s);}
    s.textContent = on ? `#left,#right,#bot,#dl,#dr,#botRz,#tool,#dens,#leg,#toast,#wins,#pop,#opc,#ev,#ov,#scan{display:none!important}
      #center{position:fixed!important;left:0!important;top:0!important;width:100vw!important;height:100vh!important;margin:0!important;border:0!important;border-radius:0!important;box-shadow:none!important}` : '';
    __ev('fit()');
  }, on);
}
// center camera on city name at scale sc (or on point given in map coords)
async function cam(p, name, sc, dx=0, dy=0){
  return p.evaluate(([name,sc,dx,dy])=>__ev(`(function(){
    let i=CT.findIndex(c=>c[0]===${JSON.stringify(name)}); if(i<0) return 'nf';
    const q=pos(i); view.sc=${sc}; view.px=W/2-q[0]*ms*view.sc+${dx}; view.py=H/2-q[1]*ms*view.sc+${dy}; return [q, W, H, ms];})()`),[name,sc,dx,dy]);
}
module.exports.cine=cine; module.exports.cam=cam;
