"""Fill comp.html's data placeholders -> comp_built.html"""
import json, glob, os
root=os.path.dirname(os.path.abspath(__file__)); clips=os.path.join(root,'clips')
s=open(os.path.join(root,'comp.html'),encoding='utf-8').read()
rects={os.path.basename(f).replace('.rect.json',''):json.load(open(f)) for f in glob.glob(os.path.join(clips,'v3_win_*.rect.json'))}
era=json.load(open(os.path.join(clips,'mg4','era.json'),encoding='utf-8'))
end=json.load(open(os.path.join(clips,'mg4','ending.json'),encoding='utf-8'))
s=s.replace('/*ERADATA*/null',json.dumps(era,ensure_ascii=False)).replace('/*ENDDATA*/null',json.dumps(end,ensure_ascii=False)).replace('/*RECTS*/null',json.dumps(rects))
open(os.path.join(root,'comp_built.html'),'w',encoding='utf-8').write(s); print('ok',list(rects))
