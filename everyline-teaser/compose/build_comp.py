"""Fill comp.html's data placeholders (MG data + window crop rects) -> comp_built.html"""
import json, glob, os, sys
root=os.path.dirname(os.path.abspath(__file__)); clips=os.path.join(root,'clips')
s=open(os.path.join(root,'comp.html'),encoding='utf-8').read()
mg=json.load(open(os.path.join(clips,'mg','data.json'),encoding='utf-8'))
rects={os.path.basename(f).replace('.rect.json',''):json.load(open(f)) for f in glob.glob(os.path.join(clips,'v3_win_*.rect.json'))}
s=s.replace('/*MGDATA*/null',json.dumps(mg,ensure_ascii=False)).replace('/*RECTS*/null',json.dumps(rects))
open(os.path.join(root,'comp_built.html'),'w',encoding='utf-8').write(s); print('rects',list(rects))
