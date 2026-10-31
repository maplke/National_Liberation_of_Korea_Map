# Builds cutsheet.html (rendered to PNG with Playwright) from the captioned v2 frames.
import json, html
CUTS=[
 ('OP','0:00.0–0:07.8','검은 화면의 Maplegrid → 밤의 2030 확장망(39개 노선) 위 ER 아이콘',[1.8,5.8],
   [('0.5–3.3','Maplegrid 로고','검은 화면'),('4.0–7.4','모든 장면은 실제 게임 화면입니다','상단 고지'),('4.6–7.7','ER 아이콘','배경 밝기 고정')]),
 ('C01','0:07.8–0:12.0','밤의 수도권 (확장망) · 반투명 UI: 1975 경량망 흑자 상태',[10.5],
   [('8.4 / 9.6 → 12.6','꿈꿀 수 / 있다면','다음 컷까지 이어짐')]),
 ('C02','0:12.0–0:18.0','노을 · 남해안 순천–진주 (남해안선·남부내륙선 포함) · 반투명 UI: 경부고속 +1,987억 흑자',[13.6,15.0,16.2,17.4],
   [('12.6 / 13.2 → 14.4','이을 수 / 있다',''),('14.4–15.6','빠르게 잇다','교체'),('15.6–16.8','멀리 잇다','교체'),('16.8–18.0','촘촘하게 잇다','교체')]),
 ('C03','0:18.0–0:21.6','1960 지도 위 수도권 허브망(8개 노선) · sketch → cassette → paper',[18.6,19.8,21.0],
   [('18.0–19.2','당신답게 잇다','sketch'),('19.2–20.4','Connect your way','cassette'),('20.4–21.6','당신답게 잇다','paper')]),
 ('C04','0:21.6–0:25.2','철도 건설 실제 조작 · 서울→대전 끌어서 설계 → 건설 확정',[23.5],
   [('22.0–25.0','쉽게 잇다','')]),
 ('C05','0:25.2–0:33.6','시대 흐름 모션그래픽 · 실제 챕터 노선이 빛나는 머리를 달고 뻗어나감 (1960→1975→1990→2005→2030)',[26.4,28.6,30.8,33.0],
   [('25.6 / 26.0 → 27.2','시대를 / 잇다','왼쪽 정렬'),('연속','1960 → 2030','연도 카운터 (그래픽)'),
    ('25.2 · 27.3 · 29.4 · 31.5','창업과 첫 간선 / 전철화와 도로 방어 / 고속철 건설 / 고속망 완성, 그리고 당신의 노선','챕터 제목 (그래픽)'),
    ('연속','노선 · 역 · 선로 km (그려진 만큼 실시간 집계)','통계 (그래픽)')]),
 ('C06','0:33.6–0:38.4','기능 창 4개 · 기능마다 다른 스킨',[34.2,35.4,36.6,37.8],
   [('33.6–34.85','연구 RESEARCH','cassette 스킨'),('34.85–36.05','의뢰 COMMISSIONS','sketch 스킨 · "수락" 클릭'),('36.05–37.25','정책 POLICY','paper 스킨 · "강화" 클릭'),('37.25–38.4','경영 MANAGEMENT','widget 스킨 · 재무 리포트 흑자')]),
 ('C07','0:38.4–0:45.6','엔딩 모션그래픽 · 서울에서 확장망이 뻗어나감 → 선들이 ER 조립 → 환승 알약 → 워드마크 + 출시 정보',[39.3,40.4,41.6,42.3,44.3],
   [('38.7 / 39.3 → 40.8','모든 선은 / 당신에게서 시작된다','진한 글자'),('41.0–42.0','ER 선 조립','파랑 → 빨강 → 노랑 → 초록'),('42.05–42.45','환승 알약','튀어나옴'),
    ('43.0','Everyline: Rail · 에브리라인: 레일','워드마크'),('43.6–45.6','Dec 2026 · PC and Android / 2026.12 · 출시 예정','')]),
]
rows=[]
for cid,tc,desc,thumbs,caps in CUTS:
    iw=355 if len(thumbs)<=4 else 282
    imgs=''.join(f'<figure><img style="width:{iw}px" src="../frames3/{round(t*30):05d}.jpg"><figcaption>{t:.1f}s</figcaption></figure>' for t in thumbs)
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
</style><h1>Everyline: Rail 런칭 티저 v3 — 컷 구성표</h1><p class="lead">45.6초 · 1920×1080 · 30fps · 파란 띠가 중간 컷(C01–C07)입니다. 시간은 영상 기준 초이며, 자막은 단어별로 0.55초에 걸쳐 흐림→선명하게 나타납니다.</p>
{''.join(rows)}</html>'''
open('cutsheet.html','w',encoding='utf-8').write(page)
