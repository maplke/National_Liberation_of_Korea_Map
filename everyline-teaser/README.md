# Everyline: Rail — 런칭 티저 (54초, 1920×1080, 30fps)

결과물: `everyline-rail-teaser.mp4`

레퍼런스 영상(시티즈: 스카이라인 2 출시 트레일러)의 흐름을 우리 게임에 맞게 옮겼습니다.
퍼블리셔 로고 → 게임 로고 → 밤 → 노을 → 낮으로 넘어가는 시네마틱 숏 → 단어가 하나씩 떠오르는 자막 → 게임 UI 몽타주 → 엔드 카드.
모든 지도 장면은 실제 게임(v0.13.12 b81)을 헤드리스 브라우저로 한 프레임씩 진행시키며 찍었습니다.

| 시간 | 장면 | 자막 |
|---|---|---|
| 0.0–4.8 | 밤의 전국 노선도 (widget 스킨, 새벽 2시 · 도시 불빛) | Maplegrid 로고, 상단 "모든 장면은 실제 게임 화면입니다" |
| 4.8–8.4 | 〃 | ER 아이콘 |
| 8.4–13.2 | 밤의 수도권 확대 | 꿈꿀 수 / 있다면 |
| 13.2–20.4 | 노을 (대구–부산, 18:54 + 색보정) | 이을 수 있다 → 빠르게 잇다 → 멀리 잇다 → 촘촘하게 잇다 |
| 20.4–25.2 | 같은 카메라로 스킨 전환 (sketch → cassette → paper → classic) | 당신답게 잇다 / Connect your way |
| 25.2–29.4 | 철도 건설: 서울에서 대전까지 끌어서 설계하고 건설 확정 | 쉽게 잇다 |
| 29.4–41.4 | 수요·분담률 레이어, 1960 → 1975 → 1990 → 2005 철도망, 열차 운행, 연구 창 | 연도 카운터 |
| 41.4–47.4 | 서울에서 전국으로 줌아웃하며 새벽이 낮으로 바뀜 | 모든 선은 / 당신에게서 시작된다 |
| 47.4–54.0 | 흰 엔드 카드 | 배너 로고, COMING SOON · 곧 출시, Maplegrid |

음악은 `compose/music.py`가 numpy로 직접 합성한 100 BPM 오리지널 곡입니다. 저작권 문제가 없습니다.
로고 등장, 컷, 자막 교체 시점에 맞춰 효과음이 들어갑니다.

## 다시 만들기

```bash
# 1) 캡처용 사본 만들기 (원본 게임 파일은 건드리지 않음)
python3 capture/make_capture_copy.py everyline-rail-0.13.12-b81.html /tmp/game/cap.html
# 2) 게임 화면 클립 캡처 (Playwright + Chromium). 클립 이름을 주면 그 클립만 다시 찍음
GAME=/tmp/game/cap.html OUT=compose/clips node capture/capture.js
# 3) 합성 프레임 렌더 → compose/frames
cd compose && node render.js frames        # 미리보기: node render.js prev 10.5 15.2
# 4) 음악 합성과 인코딩
python3 music.py score.wav
ffmpeg -framerate 30 -i frames/%05d.jpg -i score.wav -c:v libx264 -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 256k -shortest -movflags +faststart everyline-rail-teaser.mp4
```

- 자막, 타이밍, 색보정은 모두 `compose/comp.html` 위쪽의 `SHOTS`, `TEXT`, `YEARS` 표에서 바꿉니다.
- 출시 문구("COMING SOON · 곧 출시")는 `comp.html`의 `#end .soon`에 있습니다. 출시일이 정해지면 여기만 바꾸면 됩니다.
- `compose/assets/*.png`는 첨부 로고 이미지에서 배경만 투명하게 뺀 파일입니다(`keylogos.py`).
  글꼴(Wanted Sans, Pretendard, SIL OFL)은 게임 HTML에 들어 있는 것을 그대로 꺼내 `compose/assets/`에 넣었습니다.
