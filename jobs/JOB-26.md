# JOB-26 — 오르골 마을 배경·무대 + 소품·이펙트 + 풀기 모달

> 사람이 **"JOB26 진행해"**라고 하면 이 파일을 처음부터 끝까지 따라 한다. 다른 JOB은 건드리지 않는다.

- 소속: 제6·7막 「오르골 여왕」 (GAME_DESIGN.md 22~24절)
- 만들 파일: **16개**
- 먼저 끝나 있어야 하는 JOB: 없음 (바로 시작 가능)

## 1. 시작 전

1. `AGENTS.md`, `ASSET_GUIDE.md` 0~5절을 읽는다. 0절 절대 규칙은 이 JOB에도 그대로 적용된다.
2. 아래 레퍼런스 이미지를 열어 보고, 생성할 때마다 첨부한다.

   - `assets/refs/style_anchor.png`
   - `assets/refs/ref_03_stage_layers.jpg`
   - `assets/refs/ref_04_watercolor_bg.jpg`
   - `assets/road/bg_road1_far.png (길 배경 형식)`

## 2. 프롬프트 조립 순서

ASSET_GUIDE 1-2절 방식. 고정 블록은 **한 글자도 바꾸지 않고** 복사한다.

1. STYLE BLOCK
2. BACKGROUND RULES (far·아레나)
3. SPRITE RULES (나머지)
4. SIDE-SCROLL RULES
5. 시트 구성 설명 (아래 3절)
6. 각 ID의 개별 프롬프트 (아래 4절 표의 prompt 값 그대로)

## 3. 만드는 방법

### 시트 `mid1` — 중간 레이어(위쪽 마젠타)

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `bg_orgel_mid`
- 원본 저장: `assets/sheets/JOB-26_mid1.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-26_mid1.png --names bg_orgel_mid
```
- 잘린 개수가 1개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

### 시트 `mid2` — 중간 레이어(위쪽 마젠타)

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `bg_ballroom_mid`
- 원본 저장: `assets/sheets/JOB-26_mid2.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-26_mid2.png --names bg_ballroom_mid
```
- 잘린 개수가 1개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

### 시트 `a` — 소포·오르골 3개

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `prop_parcel_closed` → `prop_orgel_wild` → `prop_orgel_calm`
- 원본 저장: `assets/sheets/JOB-26_a.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-26_a.png --names prop_parcel_closed,prop_orgel_wild,prop_orgel_calm
```
- 잘린 개수가 3개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

### 시트 `b` — 스피커 2 + 빗살 원통

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `road_speaker` → `road_speaker_off` → `road_comb_drum`
- 원본 저장: `assets/sheets/JOB-26_b.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-26_b.png --names road_speaker,road_speaker_off,road_comb_drum
```
- 잘린 개수가 3개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

### 시트 `c` — 이펙트 3개

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `fx_music_wave` → `fx_note_tornado` → `fx_comb_tooth`
- 원본 저장: `assets/sheets/JOB-26_c.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-26_c.png --names fx_music_wave,fx_note_tornado,fx_comb_tooth
```
- 잘린 개수가 3개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

### 시트 `d` — 풀기 모달 배경 2개

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `wind_orgel_back` → `wind_melody_back`
- 원본 저장: `assets/sheets/JOB-26_d.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-26_d.png --names wind_orgel_back,wind_melody_back
```
- 잘린 개수가 2개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

### 한 장씩 따로 만드는 것

16:9 한 장씩 생성해서 아래 경로에 **PNG로 바로 저장**한다(자르기 없음).

- `bg_orgel_far` → `assets/road/bg_orgel_far.png`
- `bg_ballroom_far` → `assets/road/bg_ballroom_far.png`
- `bg_melody_arena` → `assets/road/bg_melody_arena.png`

## 4. 파일 목록

| ID | 저장 경로 | 게임 안 크기 | 필수 | 설명 | prompt (⑤에 그대로) |
|---|---|---|---|---|---|
| `bg_orgel_mid` | `assets/road/bg_orgel_mid.png` | 1280×360 | ● | 7막 구간1 중간 레이어(위쪽 마젠타) | middle parallax strip: lampposts shaped like tuning forks, ribbon bunting, tiny music box houses along the bottom, top part empty magenta, LEFT and RIGHT edges connect seamlessly |
| `bg_ballroom_mid` | `assets/road/bg_ballroom_mid.png` | 1280×360 | ● | 7막 구간2 중간 레이어 | middle parallax strip: rows of tiny dancing figurine silhouettes and columns along the bottom, top part empty magenta, LEFT and RIGHT edges connect seamlessly |
| `prop_parcel_closed` | `assets/props/prop_parcel_closed.png` | 높이 50px | ● | 6막 소포(닫힘, 끈으로 묶임, 덜덜 떨림) | a small brown paper parcel tied with string, shaking with motion lines, a postage stamp shape with no text |
| `prop_orgel_wild` | `assets/props/prop_orgel_wild.png` | 높이 70px | ● | 너무 감긴 낡은 오르골(뚜껑이 덜컹, 발레리나가 미친 듯 회전) | an old small wooden music box with the lid rattling open, a tiny ballerina figure spinning madly, the key on its side wound tight and glowing, screeching sound lines |
| `prop_orgel_calm` | `assets/props/prop_orgel_calm.png` | 높이 70px | ● | 풀린 오르골(제 속도로 노래) | the same old wooden music box open and calm, the tiny ballerina turning gently, soft music notes floating |
| `road_speaker` | `assets/road/road_speaker.png` | 높이 150px | ● | 오르골 스피커 상자(나팔 달림, 음악을 뿜음) | a music box speaker cabinet with a big brass horn on top blasting music waves, a wind-up key on its side, side view |
| `road_speaker_off` | `assets/road/road_speaker_off.png` | 높이 150px |  | 풀려서 꺼진 스피커 | the same music box speaker cabinet silent and relaxed, horn drooping, side view |
| `road_comb_drum` | `assets/road/road_comb_drum.png` | 높이 120px | ● | 회전하는 오르골 빗살 원통(빗살이 튀어나옴) | a big brass music box cylinder lying horizontally with pins, metal comb teeth springing up from the floor in front of it, side view |
| `fx_music_wave` | `assets/fx/fx_music_wave.png` | 높이 160px |  | 과감기 음악 파동(분홍 고리) | a ring of pink and gold music notes and sound waves expanding outward, cartoon |
| `fx_note_tornado` | `assets/fx/fx_note_tornado.png` | 높이 90px |  | 음표 회오리(바닥을 따라옴) | a small spinning whirlwind made of sharp music notes, cartoon |
| `fx_comb_tooth` | `assets/fx/fx_comb_tooth.png` | 높이 90px |  | 떨어지는 오르골 빗살 | a single long metal music box comb tooth falling point-down, shiny |
| `wind_orgel_back` | `assets/wind/wind_orgel_back.png` | 높이 430px | ● | 풀기 모달 배경 1: 낡은 오르골 밑면 클로즈업, 가운데 열쇠 구멍(열쇠 없음) | close-up of the underside of an old wooden music box filling the frame, the brass comb and pinned cylinder visible, a round brass key socket exactly in the CENTER (empty, NO key) |
| `wind_melody_back` | `assets/wind/wind_melody_back.png` | 높이 430px | ● | 풀기 모달 배경 2: 멜로디 여왕의 등 클로즈업, 가운데 열쇠 구멍(열쇠 없음) | close-up of the BACK of MELODY QUEEN filling the frame, her bodice laces and tutu edge, a round silver key socket exactly in the CENTER (empty, NO key), strain lines around it |
| `bg_orgel_far` | `assets/road/bg_orgel_far.png` | 1280×720 | ● | 7막 구간1 오르골 거리 먼 배경(좌우 반복) | far background for a side-scrolling level: a pastel music box town with round candy-colored roofs and little turning gears, a giant music box palace on the far horizon, dusky pink sky, faded watercolor, LEFT and RIGHT edges connect seamlessly |
| `bg_ballroom_far` | `assets/road/bg_ballroom_far.png` | 1280×720 | ● | 7막 구간2 무도회장 먼 배경(좌우 반복) | far background: inside a grand music box ballroom, giant brass cylinders with pins turning slowly, chandeliers, velvet curtains, warm gold and pink, LEFT and RIGHT edges connect seamlessly |
| `bg_melody_arena` | `assets/road/bg_melody_arena.png` | 1280×720 | ● | 멜로디 보스 아레나: 거대한 오르골 상자 뚜껑 위 무대(한 화면) | side-view single-screen arena on top of a giant open music box: the inside of the lid with a mirror and painted roses on the right as the backdrop, the brass comb and cylinder visible below the floor edge, three floating jewelry-box platforms, the floor strip at the bottom empty, no characters |

## 5. 이 JOB만의 규칙

- 오르골 마을은 지금까지의 마을·도시와 다른 **파스텔·분홍·금빛**. 다만 수채 질감과 외곽선은 같게.
- far 배경은 좌우가 이어져야 한다(반복 스크롤). 아레나(`bg_melody_arena`)는 한 화면 고정, 아래 120px 바닥 띠 비우기, 발판은 그리지 않음.
- `road_speaker`와 `road_speaker_off`는 같은 크기·위치(게임이 바꿔 끼움).
- 풀기 모달 배경 2개는 가운데 **빈 열쇠 구멍**(열쇠는 그리지 않음), 기존 `wind_gramo_back`과 같은 구도.

## 6. 끝나면

```
python tools/check_assets.py      # assets/STATUS.md 갱신
python tools/contact_sheet.py     # assets/sheets/_contact.png
```
1. ASSET_GUIDE 6절 체크리스트로 한 장씩 확인한다. 어긋난 파일만 다시 만든다.
2. `assets/PROMPT_LOG.md`에 한 줄씩: `날짜 | JOB-26 | 결과 파일 | 프롬프트 요약 | 합격/재생성`
3. 사람에게 보고: 만든 파일 수 / 다시 만든 파일과 이유 / STATUS.md에 남은 문제
4. `src/`, `index.html`, `GAME_DESIGN.md`, `assets/manifest.js`는 수정하지 않는다. 이름이나 크기를 바꿔야 할 것 같으면 사람에게 묻는다.
