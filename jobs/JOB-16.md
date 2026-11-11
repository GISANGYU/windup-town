# JOB-16 — 제5막 지형·장애물 16개

> 사람이 **"JOB16 진행해"**라고 하면 이 파일을 처음부터 끝까지 따라 한다. 다른 JOB은 건드리지 않는다.

- 소속: 제5막 「갈아끼우는 길」 (GAME_DESIGN.md 19절)
- 만들 파일: **16개**
- 먼저 끝나 있어야 하는 JOB: JOB-15 (결과 이미지를 레퍼런스로 씀. 없으면 사람에게 알리고 기다린다)

## 1. 시작 전

1. `AGENTS.md`, `ASSET_GUIDE.md` 0~5절을 읽는다. 0절 절대 규칙은 이 JOB에도 그대로 적용된다.
2. 아래 레퍼런스 이미지를 열어 보고, 생성할 때마다 첨부한다.

   - `assets/refs/style_anchor.png`
   - `assets/refs/ref_03_stage_layers.jpg`
   - JOB-15 결과 bg_road1_far·bg_road3_far (구간 색 맞춤)
   - `assets/props/prop_bush.png`
   - `assets/props/prop_key.png`

## 2. 프롬프트 조립 순서

ASSET_GUIDE 1-2절 방식. 고정 블록은 **한 글자도 바꾸지 않고** 복사한다.

1. STYLE BLOCK
2. SPRITE RULES
3. SIDE-SCROLL RULES
4. 시트 구성 설명 (아래 3절)
5. 각 ID의 개별 프롬프트 (아래 4절 표의 prompt 값 그대로)

## 3. 만드는 방법

### 시트 `a` — 태엽·들판 구간 7개 (2줄 격자 가능)

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `road_ground_grass` → `road_platform_wood` → `road_bush_tall` → `road_puddle` → `road_wind_lift` → `road_drawbridge` → `road_wind_post`
- 원본 저장: `assets/sheets/JOB-16_a.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-16_a.png --names road_ground_grass,road_platform_wood,road_bush_tall,road_puddle,road_wind_lift,road_drawbridge,road_wind_post
```
- 잘린 개수가 7개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

### 시트 `b` — 건전지·도시 구간 9개 (2줄 격자 가능)

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `road_ground_metal` → `road_shutter_closed` → `road_shutter_open` → `road_conveyor` → `road_door_closed` → `road_door_open` → `road_elevator` → `road_charger` → `road_spark_wire`
- 원본 저장: `assets/sheets/JOB-16_b.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-16_b.png --names road_ground_metal,road_shutter_closed,road_shutter_open,road_conveyor,road_door_closed,road_door_open,road_elevator,road_charger,road_spark_wire
```
- 잘린 개수가 9개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

## 4. 파일 목록

| ID | 저장 경로 | 게임 안 크기 | 필수 | 설명 | prompt (⑤에 그대로) |
|---|---|---|---|---|---|
| `road_ground_grass` | `assets/road/road_ground_grass.png` | 높이 128px | ● | 5막 땅 타일(들판). 정사각, 좌우 반복, 윗면 잔디 | a square side-view tile of grassy dirt ground: a band of olive grass on top, brown earth with small pebbles below, LEFT and RIGHT edges connect seamlessly |
| `road_platform_wood` | `assets/road/road_platform_wood.png` | 높이 40px | ● | 5막 떠 있는 나무 발판 | a floating wooden plank platform seen from the side, three planks with rope bindings, about four times wider than tall |
| `road_bush_tall` | `assets/road/road_bush_tall.png` | 높이 90px | ● | 5막 높은 덤불(점프 필요, 태엽 구간) | a tall round bush seen from the side, puffy lobes, as tall as a short wall |
| `road_puddle` | `assets/road/road_puddle.png` | 높이 24px | ● | 5막 물웅덩이(건전지 합선 위험) | a flat shallow water puddle seen from the side, light blue with small ripple lines and a white highlight, wide and very thin |
| `road_wind_lift` | `assets/road/road_wind_lift.png` | 높이 120px | ● | 5막 태엽 승강 발판. 감으면 위로 올라감 | a wooden platform on top of a big brass gear column with a wind-up key socket on its front, side view |
| `road_drawbridge` | `assets/road/road_drawbridge.png` | 높이 36px |  | 5막 태엽 도개교 다리판(감으면 내려옴) | a wooden drawbridge plank with two iron chains attached at the top end, side view, long and flat |
| `road_wind_post` | `assets/road/road_wind_post.png` | 높이 110px | ● | 5막 체크포인트: 작은 축음기 나팔이 달린 기둥(여기서 태엽 감기) | a short wooden post topped with a small brass gramophone horn and a little wind-up key on its side, side view, friendly |
| `road_ground_metal` | `assets/road/road_ground_metal.png` | 높이 128px | ● | 5막 땅 타일(도시). 정사각, 좌우 반복, 리벳 철판 | a square side-view tile of grey riveted metal floor with a darker under-layer, straight lines, LEFT and RIGHT edges connect seamlessly |
| `road_shutter_closed` | `assets/road/road_shutter_closed.png` | 높이 160px | ● | 5막 셔터(닫힘) | a grey corrugated metal shutter fully closed, side-scroller front view, tall rectangle |
| `road_shutter_open` | `assets/road/road_shutter_open.png` | 높이 160px |  | 5막 셔터(열림, 위로 말림) | the same grey metal shutter rolled up at the top, open doorway below |
| `road_conveyor` | `assets/road/road_conveyor.png` | 높이 40px | ● | 5막 컨베이어 벨트 한 칸(좌우 반복) | one segment of a grey conveyor belt with rollers seen from the side, LEFT and RIGHT edges connect seamlessly |
| `road_door_closed` | `assets/road/road_door_closed.png` | 높이 160px | ● | 5막 자동문(닫힘, 건전지로 열림) | a grey sliding automatic door with a small orange sensor light on top, closed, tall rectangle |
| `road_door_open` | `assets/road/road_door_open.png` | 높이 160px |  | 5막 자동문(열림) | the same grey automatic door slid open to both sides, orange sensor light on |
| `road_elevator` | `assets/road/road_elevator.png` | 높이 140px |  | 5막 전기 승강기 발판(레일 포함) | a flat metal elevator platform between two vertical grey rails, a small orange light on the side |
| `road_charger` | `assets/road/road_charger.png` | 높이 130px | ● | 5막 충전소 기둥. 케이블과 플러그, 주황 불빛 | a grey charging station post with a coiled cable and a plug hanging on a hook, a round orange light on top, plain with NO text or symbols |
| `road_spark_wire` | `assets/road/road_spark_wire.png` | 높이 40px |  | 5막 감전 전선(위험) | a broken grey electric cable lying across the ground with grey and white zigzag sparks at its tip |

## 5. 이 JOB만의 규칙

- a 시트(태엽 쪽)는 나무·황동·곡선, b 시트(건전지 쪽)는 회색 철·직선·주황 불빛. 한눈에 '태엽용/건전지용'이 구분돼야 한다(5막 장애물 설계 원칙).
- 땅 타일(`road_ground_*`)과 `road_conveyor`는 좌우가 이어지는 정사각 또는 가로 반복 조각.
- 열림/닫힘 쌍(셔터, 자동문)은 **같은 크기·같은 위치**로 그린다. 게임이 그 자리에서 바꿔 끼운다.
- 충전소·표지에 번개 기호, 글자, 숫자 금지.

## 6. 끝나면

```
python tools/check_assets.py      # assets/STATUS.md 갱신
python tools/contact_sheet.py     # assets/sheets/_contact.png
```
1. ASSET_GUIDE 6절 체크리스트로 한 장씩 확인한다. 어긋난 파일만 다시 만든다.
2. `assets/PROMPT_LOG.md`에 한 줄씩: `날짜 | JOB-16 | 결과 파일 | 프롬프트 요약 | 합격/재생성`
3. 사람에게 보고: 만든 파일 수 / 다시 만든 파일과 이유 / STATUS.md에 남은 문제
4. `src/`, `index.html`, `GAME_DESIGN.md`, `assets/manifest.js`는 수정하지 않는다. 이름이나 크기를 바꿔야 할 것 같으면 사람에게 묻는다.
