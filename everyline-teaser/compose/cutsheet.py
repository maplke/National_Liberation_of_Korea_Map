# Builds cutsheet.html (rendered to PNG with Playwright) from the captioned v2 frames.
import json, html
CUTS=[
 ('OP','0:00.0–0:07.8','오프닝 · 밤의 전국 노선도 (widget 스킨, 새벽 2시)',[2.5,5.8],
   [('0.6–7.2','모든 장면은 실제 게임 화면입니다','상단 고지'),('0.8–4.0','Maplegrid 로고','로고'),('4.4–7.6','ER 아이콘','로고')]),
 ('C01','0:07.8–0:12.0','밤의 수도권 확대 · 반투명 UI(노선 수익·경영 패널·하단 바 확대)',[10.5],
   [('8.4 / 9.6 → 12.6','꿈꿀 수 / 있다면','단어별 등장, 다음 컷으로 넘어가 12.6에 사라짐')]),
 ('C02','0:12.0–0:18.0','노을 · 대구–부산 (18:54 + 노을 색보정) · 반투명 UI',[13.6,15.0,16.2,17.4],
   [('12.6 / 13.2 → 14.4','이을 수 / 있다',''),('14.4–15.6','빠르게 잇다','교체'),('15.6–16.8','멀리 잇다','교체'),('16.8–18.0','촘촘하게 잇다','교체')]),
 ('C03','0:18.0–0:21.6','같은 카메라로 스킨 전환 · sketch → cassette → paper (1.2초씩)',[18.6,19.8,21.0],
   [('18.0–19.2','당신답게 잇다','sketch'),('19.2–20.4','Connect your way','cassette'),('20.4–21.6','당신답게 잇다','paper')]),
 ('C04','0:21.6–0:25.2','철도 건설 실제 조작 · 서울→대전 끌어서 설계 → 건설 확정',[23.5],
   [('22.0–25.0','쉽게 잇다','')]),
 ('C05','0:25.2–0:33.6','시대 흐름 · 1960 → 1975 → 1990 → 2005 철도망 (paper 스킨, 0.25초 디졸브)',[26.2,28.5,30.5,32.6],
   [('25.5–27.4','시대를 잇다',''),('25.2 · 27.3 · 29.4 · 31.5 · 33.3','1960 · 1975 · 1990 · 2005 · 2030','연도 카운터 (그래픽)'),
    ('같은 시점','1챕터 · 창업과 첫 간선 / 2챕터 · 전철화와 도로 방어 / 3챕터 · 고속철 건설 / 4챕터 · 고속망 완성과 축소 균형','연도 위 부제 (그래픽)'),
    ('같은 시점','노선 0→22→23→25 · 역 0→103→105→110 · 선로 0→2,123→2,166→2,567km','연도 아래 통계 (그래픽)'),
    ('시대별 2장','철도신보: 선로 한 줄 없이 출발 / 호남 간선 개통 지시 / 도로가 주적이 된 시대 / 충청 산사태 / 고속철도의 시대가 열린다 / 제1차 경제개발 5개년계획 / 고속망 완성과 축소 균형의 시대 / 2005년 보조금 · PSO 정산','오른쪽 신문 카드 (그래픽)')]),
 ('C06','0:33.6–0:37.2','기능 창 · 흐린 밤 지도 위에 연구 → 의뢰 → 정책 (1.2초씩)',[34.2,35.4,36.6],
   [('33.6–34.85','연구 RESEARCH','왼쪽 아래 라벨'),('34.85–36.05','의뢰 COMMISSIONS','왼쪽 아래 라벨'),('36.05–37.2','정책 POLICY','왼쪽 아래 라벨 · "강화" 클릭')]),
 ('C07','0:37.2–0:41.4','서울→전국 줌아웃 · 새벽이 낮으로 · 반투명 UI · 흰색으로 전환',[39.5],
   [('37.8 / 38.7 → 41.0','모든 선은 / 당신에게서 시작된다','')]),
 ('END','0:41.4–0:45.0','엔드 카드 (흰 배경)',[44.0],
   [('41.5','Everyline: Rail 배너 로고','로고'),('42.6','2026.12 출시 예정 · DEC 2026 · PC / ANDROID',''),('43.2','Maplegrid','로고')]),
]
rows=[]
for cid,tc,desc,thumbs,caps in CUTS:
    imgs=''.join(f'<figure><img src="../frames2/{round(t*30):05d}.jpg"><figcaption>{t:.1f}s</figcaption></figure>' for t in thumbs)
    cl=''.join(f'<tr><td class="tm">{html.escape(a)}</td><td class="cap">{html.escape(b)}</td><td class="nt">{html.escape(c)}</td></tr>' for a,b,c in caps)
    mid=' mid' if cid.startswith('C') else ''
    rows.append(f'<section class="cut{mid}"><header><b>{cid}</b><span>{tc}</span><p>{html.escape(desc)}</p></header><div class="th">{imgs}</div><table>{cl}</table></section>')
page=f'''<!DOCTYPE html><html lang="ko"><meta charset="utf-8"><style>
@font-face{{font-family:W;font-weight:400;src:url(../assets/ELWanted-400.woff2)}}@font-face{{font-family:W;font-weight:600;src:url(../assets/ELWanted-600.woff2)}}
body{{margin:0;width:1600px;background:#f4f2ee;font-family:W;color:#1f2329;padding:40px 48px;box-sizing:border-box}}
h1{{font-weight:600;font-size:34px;margin:0 0 4px}} .lead{{color:#6b717c;font-size:17px;margin:0 0 26px}}
.cut{{background:#fff;border-radius:14px;padding:18px 22px;margin-bottom:16px;border:1px solid #e3e0da}} .cut.mid{{border-left:6px solid #3a7be0}}
header{{display:flex;align-items:baseline;gap:14px;margin-bottom:12px}} header b{{font-size:24px;font-weight:600;min-width:58px}} header span{{font-size:18px;color:#3a7be0;font-weight:600;font-variant-numeric:tabular-nums}} header p{{margin:0;font-size:18px;color:#3b4048}}
.th{{display:flex;gap:10px;margin-bottom:12px}} figure{{margin:0}} figure img{{width:355px;border-radius:6px;display:block}} figcaption{{font-size:13px;color:#8a8f98;margin-top:3px}}
table{{border-collapse:collapse;width:100%}} td{{padding:6px 10px;border-top:1px solid #eeebe6;font-size:17px;vertical-align:top}}
.tm{{width:230px;color:#6b717c;font-variant-numeric:tabular-nums}} .cap{{font-weight:600}} .nt{{width:300px;color:#8a8f98;font-size:15px}}
</style><h1>Everyline: Rail 런칭 티저 v2 — 컷 구성표</h1><p class="lead">45초 · 1920×1080 · 30fps · 파란 띠가 중간 컷(C01–C07)입니다. 시간은 영상 기준 초이며, 자막은 단어별로 0.55초에 걸쳐 흐림→선명하게 나타납니다.</p>
{''.join(rows)}</html>'''
open('cutsheet.html','w',encoding='utf-8').write(page)
