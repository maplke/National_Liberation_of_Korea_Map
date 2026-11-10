// CDP screencast recorder -> mp4 (30fps CFR)
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
exports.cursor=async(p)=>p.evaluate(()=>{if(document.getElementById('__cur'))return;
 const c=document.createElement('div');c.id='__cur';
 c.style.cssText='position:fixed;left:0;top:0;width:22px;height:22px;z-index:2147483647;pointer-events:none;transform:translate(-100px,-100px)';
 c.innerHTML='<svg width="22" height="22" viewBox="0 0 22 22"><path d="M2 1 L2 17 L6.5 13 L9.5 20 L12.5 18.8 L9.6 12 L15.5 12 Z" fill="#fff" stroke="#000" stroke-width="1.4" stroke-linejoin="round"/></svg>';
 const r=document.createElement('div');r.id='__rip';r.style.setProperty('border-radius','50%','important');r.style.cssText='position:fixed;left:0;top:0;width:34px;height:34px;margin:-17px 0 0 -17px;border:3px solid rgba(255,80,40,.9);background:rgba(255,120,60,.25);z-index:2147483646;pointer-events:none;opacity:0;transition:opacity .25s, transform .25s';
 document.documentElement.appendChild(r);document.documentElement.appendChild(c);
 const mv=e=>{c.style.transform='translate('+(e.clientX-2)+'px,'+(e.clientY-1)+'px)';r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';};
 addEventListener('pointermove',mv,true);addEventListener('mousemove',mv,true);
 addEventListener('pointerdown',e=>{mv(e);r.style.opacity="1";r.style.transform="scale(.8)";},true);
 addEventListener('pointerup',e=>{r.style.opacity='0';r.style.transform='scale(1.4)';},true);});
exports.start=async(p,dir)=>{fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
 const s=await p.context().newCDPSession(p);const fr=[];let n=0;
 s.on('Page.screencastFrame',async ev=>{const f=path.join(dir,String(n++).padStart(6,'0')+'.jpg');fs.writeFileSync(f,Buffer.from(ev.data,'base64'));fr.push([f,ev.metadata.timestamp]);s.send('Page.screencastFrameAck',{sessionId:ev.sessionId}).catch(()=>{});});
 await s.send('Page.startScreencast',{format:'jpeg',quality:92,maxWidth:1920,maxHeight:1080,everyNthFrame:1});
 return {s,fr,dir,t0:Date.now()/1000};};
exports.stop=async(R,out)=>{await new Promise(r=>setTimeout(r,300));await R.s.send('Page.stopScreencast');await new Promise(r=>setTimeout(r,300));
 const fr=R.fr;if(!fr.length)throw new Error('no frames');
 const tEnd=Date.now()/1000;let lst='';
 for(let k=0;k<fr.length;k++){const d=(k+1<fr.length?fr[k+1][1]:fr[k][1]+0.3)-fr[k][1];lst+="file '"+fr[k][0]+"'\nduration "+Math.max(0.001,d).toFixed(4)+"\n";}
 lst+="file '"+fr[fr.length-1][0]+"'\n";const lf=path.join(R.dir,'list.txt');fs.writeFileSync(lf,lst);
 execFileSync('ffmpeg',['-y','-loglevel','error','-f','concat','-safe','0','-i',lf,'-vf','fps=30,scale=1920:1080:flags=lanczos,format=yuv420p','-c:v','libx264','-preset','medium','-crf','18','-movflags','+faststart',out]);
 const dur=fr[fr.length-1][1]-fr[0][1];console.log('saved',out,fr.length+' frames',dur.toFixed(1)+'s',(fr.length/dur).toFixed(1)+'fps');
 fs.rmSync(R.dir,{recursive:true,force:true});};
