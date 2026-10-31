# Everyline: Rail — 런칭 티저

| 파일 | 길이 | 내용 |
|---|---|---|
| `everyline-rail-teaser-v3.mp4` | 45.6초 | **최신.** 다양한 노선망, 흑자 장면, 시대 흐름·엔딩 모션그래픽 |
| `everyline-rail-teaser-v2.mp4` | 45초 | 시네마틱 위에 기능을 은은하게 겹친 버전 |
| `everyline-rail-teaser.mp4` | 54초 | v1. 시네마틱 위주 |

모두 1920×1080, 30fps, 음악 포함입니다. 컷 구성표, 자막(SRT), 자막을 뺀 컷별 클립은 `cuts/v3/`(v2는 `cuts/`)에 있습니다.

## v3에서 바뀐 점

- **오프닝 전환:** Maplegrid 로고는 검은 화면에 단독으로 보여 줍니다. 이어 밤 지도가 올라오고 ER 아이콘이 뜨며, 배경 밝기는 로고에 따라 출렁이지 않고 일정하게 유지됩니다. 장면 사이 검은 화면으로 꺼지던 곳도 겹쳐 넘어가도록 고쳤습니다.
- **ER 누끼:** R 안쪽 구멍과 워드마크 글자 안쪽(e·a·ㅇ 등)까지 투명하게 뺐습니다. 회색 후광으로만 둘러싸인 구멍만 지우고, 환승 알약 속 흰색은 남깁니다(`keylogos.py`).
- **다양한 노선망:** 챕터 기본 노선 대신 직접 설계한 노선을 게임 프리셋 형식으로 넣었습니다(`capture/nets.js`).
  - *2030 확장망:* 4챕터 노선에 강릉 고속·동해선·강원 북부선·서해선·남해안선·중부내륙선·수도권 순환선 등 14개를 더한 39개 노선. 밤 장면, 노을(남해안), 기능 배경, 엔딩에 씁니다.
  - *수도권 허브망:* 1960년 지도 위에 새로 그린 8개 노선. 스킨 전환 장면에 씁니다.
- **흑자 장면:** 반투명 UI는 실제로 흑자가 나는 상태에서 찍었습니다. 수익 노선만 남기고 안 쓰는 선로·역을 정리한 "축소 균형" 상태입니다.
  - 1975 경량망: 월 +84~+205억
  - 2005 경부고속: 월 +1,000억 이상, 화면의 경부고속 +1,987억
  - 기능 장면에 **경영(재무 리포트)** 을 추가했습니다.
- **기능 창 스킨:** 연구 = cassette · 의뢰 = sketch("수락" 클릭) · 정책 = paper("강화" 클릭) · 경영 = widget.
- **시대 흐름 (25.2–33.6):** 점묘 국토 위에서 실제 챕터 노선(1975·1990·2005)과 2030 확장망이 빛나는 머리를 달고 뻗어나갑니다. 연도 카운터, 챕터 제목, 노선·역·선로 km 실시간 집계, 하단 타임라인이 함께 움직입니다.
- **엔딩 (38.4–45.6):** 순서는 다음과 같습니다.
  1. 흰 화면에서 2030 확장망이 서울부터 뻗어나갑니다("모든 선은 당신에게서 시작된다").
  2. 망이 사라지면서 파랑·빨강·노랑·초록 선이 그려져 ER을 조립합니다.
  3. 환승 알약이 튀어나옵니다.
  4. 마크가 왼쪽으로 줄어들며 워드마크와 "Dec 2026 · PC and Android / 2026.12 · 출시 예정"이 나타납니다.
  
  ER은 원본 아이콘에서 잰 치수(선 39, 흰 틈 59, 후광 80, 모서리 반지름 128)로 벡터로 다시 그렸습니다.

| 시간 | 장면 | 자막 |
|---|---|---|
| 0–7.8 | Maplegrid(검은 화면) → 밤 확장망 + ER 아이콘 | 모든 장면은 실제 게임 화면입니다 |
| 7.8–12 | 밤 수도권 + 흑자 UI | 꿈꿀 수 있다면 |
| 12–18 | 노을 남해안 + 흑자 UI | 이을 수 있다 → 빠르게 → 멀리 → 촘촘하게 잇다 |
| 18–21.6 | 허브망 스킨 전환 | 당신답게 잇다 / Connect your way |
| 21.6–25.2 | 철도 건설 조작 | 쉽게 잇다 |
| 25.2–33.6 | 시대 흐름 모션그래픽 | 시대를 잇다 |
| 33.6–38.4 | 연구 · 의뢰 · 정책 · 경영 | 기능 라벨 |
| 38.4–45.6 | 엔딩 모션그래픽 | 모든 선은 당신에게서 시작된다 · 출시 정보 |

음악(`compose/music.py`)은 numpy로 직접 합성한 100 BPM 오리지널 곡이라 저작권 문제가 없습니다.

## 다시 만들기

```bash
# 1) 캡처용 사본 (원본 게임 파일은 건드리지 않음)
python3 capture/make_capture_copy.py everyline-rail-0.13.12-b81.html /tmp/game/cap.html
# 2) 게임 클립 캡처 · 모션그래픽 데이터(mgdata)까지. 클립 이름을 주면 그 클립만 다시 찍음
GAME=/tmp/game/cap.html OUT=compose/clips node capture/capture3.js
GAME=/tmp/game/cap.html OUT=compose/clips node capture/capture.js build     # 철도 건설 장면
python3 compose/make_land_dots.py compose/clips/mg
# 3) 데이터 채우기 → 프레임 렌더 (자막 없는 클린 버전: QUERY='?notext')
cd compose && python3 build_comp.py && node render.js frames
# 4) 음악과 인코딩
python3 music.py score.wav
ffmpeg -framerate 30 -i frames/%05d.jpg -i score.wav -c:v libx264 -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 256k -shortest -movflags +faststart everyline-rail-teaser-v3.mp4
```

- 장면·자막·기능 창·시대 구간은 `compose/comp.html` 위쪽 표(`SHOTS`, `GHOSTS`, `TEXT`, `FEAT`, `ERAS`)에서 바꿉니다. 엔딩 타이밍은 `ERP`, `PILLS`, `finRender`에 있습니다.
- 노선망 구성은 `capture/nets.js`의 `EXTRA`, `HUB`, `KEEP_PROFIT`에서 바꿉니다.
- `compose/mg/`에는 이번에 쓴 모션그래픽 데이터와 점묘 국토 이미지가 들어 있습니다.
