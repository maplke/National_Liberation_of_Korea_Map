# Everyline: Rail — 런칭 티저

| 파일 | 길이 | 내용 |
|---|---|---|
| `everyline-rail-teaser-v2.mp4` | 45초 | **최신.** v1 시네마틱에 게임 기능을 은은하게 겹친 버전 |
| `everyline-rail-teaser.mp4` | 54초 | v1. 시네마틱 위주 |

모두 1920×1080, 30fps, 음악 포함입니다. 모든 지도 장면은 실제 게임(v0.13.12 b81)을 헤드리스 브라우저로 한 프레임씩 진행시키며 찍었습니다.

## v2 구성 (45초)

시네마틱 장면은 그대로 두고, 게임 기능은 "어렴풋이" 보이게 했습니다.

- **반투명 UI:** 밤·노을·새벽 장면 위에 실제 게임의 노선 목록과 경영 패널을 반투명하게 겹쳤습니다(밤은 screen, 낮은 multiply 합성). 패널은 16배속으로 돌린 화면이라 수익, 현금, 날짜가 실제로 움직입니다. 왼쪽 아래에는 하단 바(날짜·현금·이번 달·부채)를 확대해 둡니다.
- **시대 흐름:** 연도가 1960→1975→1990→2005→2030으로 굴러가고, 노선·역·선로 km는 각 챕터 시작 시점의 실제 수치로 올라갑니다. 옆으로는 그 시대의 실제 철도신보 헤드라인이 지나갑니다.
- **기능 짧게 보기:** 연구 · 의뢰 · 정책 창이 밤 지도 위에 떠오릅니다. 정책 창에서는 "강화"를 누르면 효과가 바뀌는 장면이 나옵니다.
- **엔드 카드:** v10 영상을 따라 "2026.12 출시 예정 · DEC 2026 · PC / ANDROID"로 바꿨습니다.

| 시간 | 장면 | 자막 / 겹침 |
|---|---|---|
| 0–7.8 | 밤의 전국 노선도 | Maplegrid → ER 아이콘 |
| 7.8–12 | 밤의 수도권 | 꿈꿀 수 있다면 · 반투명 UI(숫자 변화) |
| 12–18 | 노을 | 이을 수 있다 → 빠르게 → 멀리 → 촘촘하게 · 반투명 UI |
| 18–21.6 | 스킨 전환 | 당신답게 잇다 / Connect your way |
| 21.6–25.2 | 철도 건설 실제 조작 | 쉽게 잇다 |
| 25.2–33.6 | 1960 → 2030 철도망 | 시대를 잇다 · 연도·통계 카운터 · 철도신보 |
| 33.6–37.2 | 연구 · 의뢰 · 정책 창 | 기능 라벨 |
| 37.2–41.4 | 새벽→낮 줌아웃 | 모든 선은 당신에게서 시작된다 · 반투명 UI |
| 41.4–45 | 엔드 카드 | 2026.12 출시 예정 |

음악(`compose/music.py`)은 numpy로 직접 합성한 100 BPM 오리지널 곡이라 저작권 문제가 없습니다. 연도가 굴러갈 때 째깍거리는 소리, 연도가 바뀌는 순간과 창이 뜰 때마다 효과음이 들어갑니다.

## 다시 만들기

```bash
# 1) 캡처용 사본 만들기 (원본 게임 파일은 건드리지 않음)
python3 capture/make_capture_copy.py everyline-rail-0.13.12-b81.html /tmp/game/cap.html
# 2) 게임 화면 클립과 철도신보 카드 캡처 (Playwright + Chromium). 클립 이름을 주면 그 클립만 다시 찍음
GAME=/tmp/game/cap.html OUT=compose/clips node capture/capture.js
GAME=/tmp/game/cap.html OUT=compose/clips node capture/news.js
# 3) 합성 프레임 렌더 → compose/frames
cd compose && node render.js frames        # 미리보기: node render.js prev 10.5 28.5
# 4) 음악 합성과 인코딩
python3 music.py score.wav
ffmpeg -framerate 30 -i frames/%05d.jpg -i score.wav -c:v libx264 -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 256k -shortest -movflags +faststart everyline-rail-teaser-v2.mp4
```

- 장면, 자막, 반투명 UI, 시대 흐름, 기능 창은 모두 `compose/comp.html` 위쪽 표(`SHOTS`, `GHOSTS`, `TEXT`, `ERA`, `NEWS`, `FEAT`)에서 바꿉니다. 반투명 UI가 더 진하거나 옅어야 하면 `GHOSTS`의 `op` 값을 조정하면 됩니다.
- 출시 문구는 `comp.html`의 `#end .soon`에 있습니다.
- v1 합성은 git 기록에 남아 있습니다.
- `compose/assets/*.png`는 첨부 로고 이미지에서 배경만 투명하게 뺀 파일입니다(`keylogos.py`). 글꼴(Wanted Sans, Pretendard, SIL OFL)은 게임 HTML에 들어 있는 것을 그대로 꺼내 넣었습니다.
