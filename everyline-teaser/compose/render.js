// usage: node render.js out_dir [t1 t2 ...]   (no times = full render at 30fps)
const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{
  const out=process.argv[2]; const times=process.argv.slice(3).map(Number); fs.mkdirSync(out,{recursive:true});
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1920,height:1080}});
  p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('file://'+__dirname+'/'+(process.env.COMP||'comp_built.html')+(process.env.QUERY||'')); await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(500);
  const D=await p.evaluate(()=>DURATION); const [ra,rb]=(process.env.RANGE||'0,'+D).split(',').map(Number);
  const list=times.length?times:[...Array(Math.round((rb-ra)*30)).keys()].map(i=>ra+i/30);
  const t0=Date.now();
  for(let i=0;i<list.length;i++){
    await p.evaluate(t=>render(t),list[i]);
    const name=times.length?`t_${list[i].toFixed(2)}.jpg`:`${String(Math.round(list[i]*30)).padStart(5,'0')}.jpg`;
    await p.screenshot({path:`${out}/${name}`,type:'jpeg',quality:93});
    if(i%150===0) console.log(i,'/',list.length,((Date.now()-t0)/1000).toFixed(0)+'s');
  }
  await b.close();
})();
