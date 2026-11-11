# JOB-21 — 보스 아레나 배경 + 공격 이펙트 + 건전지 모달

> 사람이 **"JOB21 진행해"**라고 하면 이 파일을 처음부터 끝까지 따라 한다. 다른 JOB은 건드리지 않는다.

- 소속: 제4·5막 보스 아레나 (GAME_DESIGN.md 19·20절)
- 만들 파일: **12개**
- 먼저 끝나 있어야 하는 JOB: 없음 (바로 시작 가능)

## 1. 시작 전

1. `AGENTS.md`, `ASSET_GUIDE.md` 0~5절을 읽는다. 0절 절대 규칙은 이 JOB에도 그대로 적용된다.
2. 아래 레퍼런스 이미지를 열어 보고, 생성할 때마다 첨부한다.

   - `assets/refs/style_anchor.png`
   - `assets/refs/ref_03_stage_layers.jpg`
   - `assets/road/bg_road3_far.png (도시 색 기준)`
   - `assets/props/prop_battery.png`

## 2. 프롬프트 조립 순서

ASSET_GUIDE 1-2절 방식. 고정 블록은 **한 글자도 바꾸지 않고** 복사한다.

1. STYLE BLOCK
2. BACKGROUND RULES (배경 2장)
3. SPRITE RULES (나머지)
4. SIDE-SCROLL RULES
5. BOGLE (wind_bogle_back)
6. 시트 구성 설명 (아래 3절)
7. 각 ID의 개별 프롬프트 (아래 4절 표의 prompt 값 그대로)

## 3. 만드는 방법

### 시트 `a` — 소품 4개 한 줄

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `road_platform_metal` → `prop_battery_bomb` → `prop_plug` → `prop_breaker`
- 원본 저장: `assets/sheets/JOB-21_a.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-21_a.png --names road_platform_metal,prop_battery_bomb,prop_plug,prop_breaker
```
- 잘린 개수가 4개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

### 시트 `b` — 이펙트 5개 (2줄 격자 가능)

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `fx_lightning` → `fx_spark_floor` → `fx_magnet_wave` → `fx_coolant` → `fx_recall_thread`
- 원본 저장: `assets/sheets/JOB-21_b.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-21_b.png --names fx_lightning,fx_spark_floor,fx_magnet_wave,fx_coolant,fx_recall_thread
```
- 잘린 개수가 5개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

### 시트 `c` — 건전지 모달 배경 1개

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `wind_bogle_back`
- 원본 저장: `assets/sheets/JOB-21_c.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-21_c.png --names wind_bogle_back
```
- 잘린 개수가 1개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

### 한 장씩 따로 만드는 것

16:9 한 장씩 생성해서 아래 경로에 **PNG로 바로 저장**한다(자르기 없음).

- `bg_gate_arena` → `assets/road/bg_gate_arena.png`
- `bg_volt_arena` → `assets/road/bg_volt_arena.png`

## 4. 파일 목록

| ID | 저장 경로 | 게임 안 크기 | 필수 | 설명 | prompt (⑤에 그대로) |
|---|---|---|---|---|---|
| `road_platform_metal` | `assets/road/road_platform_metal.png` | 높이 40px | ● | 공중 철판 발판 | a floating riveted metal platform seen from the side, wide and flat, hazard stripes on its edge |
| `prop_battery_bomb` | `assets/props/prop_battery_bomb.png` | 높이 70px | ● | 굴러오는 건전지 폭탄 | a big grey cartoon battery lying on its side with a lit sparkling fuse, angry dot eyes, round and rollable |
| `prop_plug` | `assets/props/prop_plug.png` | 높이 70px | ● | 보스 몸에 꽂힌 큰 플러그 | a big brass electric plug with a thick black cable, two prongs, seen from the side |
| `prop_breaker` | `assets/props/prop_breaker.png` | 높이 70px | ● | 차단기 레버 | a big red-handled breaker lever on a small metal base, seen from the side |
| `fx_lightning` | `assets/fx/fx_lightning.png` | 높이 300px |  | 낙뢰(위에서 아래로 떨어지는 번개 한 줄기) | a single tall cartoon lightning bolt striking downward, yellow white with dark plum outline, zigzag |
| `fx_spark_floor` | `assets/fx/fx_spark_floor.png` | 높이 60px |  | 방전 바닥 띠(바닥 위 가로로 긴 전기 불꽃) | a wide horizontal strip of crackling yellow electric sparks hugging the ground, cartoon style |
| `fx_magnet_wave` | `assets/fx/fx_magnet_wave.png` | 높이 120px |  | 자석 끌어당김 물결 | three curved horseshoe-shaped pull waves in red and grey, cartoon magnet effect |
| `fx_coolant` | `assets/fx/fx_coolant.png` | 높이 24px |  | 냉각수 물웅덩이 | a flat blue coolant puddle seen from the side with frost sparkles, wide and thin |
| `fx_recall_thread` | `assets/fx/fx_recall_thread.png` | 높이 80px |  | 회수 신호에 끌려가는 빛나는 실 | a single glowing golden thread of light curling and stretching, like a spring's energy being pulled away |
| `wind_bogle_back` | `assets/wind/wind_bogle_back.png` | 높이 430px | ● | 건전지 모달 배경: 보글 등 클로즈업, 가운데 덮개가 열린 건전지 칸(비어 있음) | close-up of the BACK of BOGLE the teapot filling the frame, his curved handle at the top, a small round hatch in the CENTER swung open showing an EMPTY battery slot with two metal contacts, cream porcelain with the blue band |
| `bg_gate_arena` | `assets/road/bg_gate_arena.png` | 1280×720 | ● | 중간 보스 아레나: 발전소 정문 앞(옆에서 본 한 화면) | side-view single-screen arena in front of a huge power plant gate, riveted steel walls, warning stripes, two floating metal platforms in the air, dusk sky, the floor strip at the bottom left empty, no characters |
| `bg_volt_arena` | `assets/road/bg_volt_arena.png` | 1280×720 | ● | 최종 보스 아레나: 발전소 중심 홀 | side-view single-screen arena inside a giant generator hall, huge coils and copper pipes in the background, glowing threads of light flowing into a central socket on the right, three floating metal platforms, the floor strip at the bottom empty, no characters |

## 5. 이 JOB만의 규칙

- 아레나 배경 2장은 **한 화면 고정**(반복 아님). 아래 120px 바닥 띠는 비워 둔다(게임이 바닥을 그림). 공중 발판은 그려 넣지 않는다(게임이 `road_platform_metal`로 놓음).
- `bg_volt_arena`는 오른쪽 가운데로 빛나는 실들이 빨려 드는 소켓이 있어야 한다(보스 자리).
- `wind_bogle_back`은 보글 등 클로즈업, 가운데 **빈 건전지 칸**(덮개 열림). 건전지는 그리지 않는다(게임이 끼움).

## 6. 끝나면

```
python tools/check_assets.py      # assets/STATUS.md 갱신
python tools/contact_sheet.py     # assets/sheets/_contact.png
```
1. ASSET_GUIDE 6절 체크리스트로 한 장씩 확인한다. 어긋난 파일만 다시 만든다.
2. `assets/PROMPT_LOG.md`에 한 줄씩: `날짜 | JOB-21 | 결과 파일 | 프롬프트 요약 | 합격/재생성`
3. 사람에게 보고: 만든 파일 수 / 다시 만든 파일과 이유 / STATUS.md에 남은 문제
4. `src/`, `index.html`, `GAME_DESIGN.md`, `assets/manifest.js`는 수정하지 않는다. 이름이나 크기를 바꿔야 할 것 같으면 사람에게 묻는다.
