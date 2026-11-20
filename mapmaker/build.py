#!/usr/bin/env python3
"""src/app.html에 검증기와 기본 시나리오를 끼워 index.html 한 파일로 묶는다.
   게임이 바뀌면 먼저 node tools/extract.js <게임 HTML> 로 src를 다시 뽑는다."""
import json, pathlib
D = pathlib.Path(__file__).resolve().parent
S = D / 'src'
app = (S / 'app.html').read_text(encoding='utf-8')
def js(p):  # JSON을 script 안에 넣을 때 </script가 끊지 않게
    return json.dumps(json.loads((S / p).read_text(encoding='utf-8')), ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
for k, v in [('/*@@VALIDATOR@@*/', (S / 'validator.js').read_text(encoding='utf-8')),
             ('/*@@BASE_KR@@*/null', js('base-kr.json')),
             ('/*@@BASE_GR@@*/null', js('base-gr.json'))]:
    assert app.count(k) == 1, k
    app = app.replace(k, v)
(D / 'index.html').write_text(app, encoding='utf-8')
print('index.html', round(len(app.encode()) / 1024), 'KB')
