const L=require('./lib');
const NEWS_OUT=(process.env.OUT||'/tmp/tr/clips')+'/news';
(async()=>{
  const out={};
  for(const ch of [1,2,3,4]){
    require('fs').mkdirSync(NEWS_OUT,{recursive:true});
    const {b,p}=await L.open({w:1280,h:720,dsf:1.5});
    await L.startChapter(p,ch,'classic');
    const stats=await p.evaluate(()=>__ev(`(function(){let k=0;for(const x of Object.keys(trk)){const [a,b]=x.split('_').map(Number);if(!isNaN(a)&&!isNaN(b))k+=km(a,b);}return {lines:lines.length,st:st.filter(s=>s.on).length,km:Math.round(k),year:clock&&document.getElementById('tDate').textContent};})()`));
    const items=[];
    for(let k=0;k<160 && items.length<5;k++){
      await p.evaluate(()=>__ev('for(let i=0;i<60;i++)upd(0.25)'));
      const t=await p.evaluate(()=>{const e=document.getElementById('ev');return getComputedStyle(e).display!=='none'?e.innerText:''});
      if(t){ if(/철도신보/.test(t)){ const n=items.length; const r=await p.evaluate(()=>{const m=document.querySelector('#ev .evMast').getBoundingClientRect();const e=document.getElementById('ev').getBoundingClientRect();return {x:e.x,y:e.y,w:e.width,h:e.height,m:m.height};});
          await p.locator('#ev').screenshot({path:`${NEWS_OUT}/ch${ch}_${n}.png`}); items.push({t:t.split('\n').slice(0,4).join(' | '),r}); }
        await p.evaluate(()=>{const b=[...document.querySelectorAll('#ev button')].filter(b=>b.offsetParent);b[b.length-1]&&b[b.length-1].click();}); await p.waitForTimeout(80);}
    }
    out[ch]={stats,items}; console.log(ch, JSON.stringify(stats), items.map(i=>i.t).join('\n   '));
    await b.close();
  }
  require('fs').writeFileSync(NEWS_OUT+'/news.json',JSON.stringify(out,null,1));
})();
