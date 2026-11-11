# JOB-13 — 제4막 컷신 5장

> 사람이 **"JOB13 진행해"**라고 하면 이 파일을 처음부터 끝까지 따라 한다. 다른 JOB은 건드리지 않는다.

- 소속: 제4막 「도시에서 온 방송」 (GAME_DESIGN.md 18절)
- 만들 파일: **5개**
- 먼저 끝나 있어야 하는 JOB: JOB-9, JOB-12 (결과 이미지를 레퍼런스로 씀. 없으면 사람에게 알리고 기다린다)

## 1. 시작 전

1. `AGENTS.md`, `ASSET_GUIDE.md` 0~5절을 읽는다. 0절 절대 규칙은 이 JOB에도 그대로 적용된다.
2. 아래 레퍼런스 이미지를 열어 보고, 생성할 때마다 첨부한다.

   - `assets/refs/style_anchor.png`
   - `assets/refs/ref_01_carnival.jpg`
   - `assets/refs/ref_03_stage_layers.jpg`
   - `assets/bg/bg_town_ground.png`
   - JOB-9 결과 npc_radio_crank
   - JOB-12 결과 npc_surveyor_idle
   - JOB-10 결과 prop_battery_pack

## 2. 프롬프트 조립 순서

ASSET_GUIDE 1-2절 방식. 고정 블록은 **한 글자도 바꾸지 않고** 복사한다.

1. STYLE BLOCK
2. BACKGROUND RULES
3. BOGLE, GRAMO, PIP, LAMP, RADIO, SURVEYOR 중 등장하는 것
4. 시트 구성 설명 (아래 3절)
5. 각 ID의 개별 프롬프트 (아래 4절 표의 prompt 값 그대로)

## 3. 만드는 방법

### 한 장씩 따로 만드는 것

16:9 한 장씩 생성해서 아래 경로에 **PNG로 바로 저장**한다(자르기 없음).

- `story_13_surveyors` → `assets/story/story_13_surveyors.png`
- `story_14_grey_spread` → `assets/story/story_14_grey_spread.png`
- `story_15_chase` → `assets/story/story_15_chase.png`
- `story_16_radio_past` → `assets/story/story_16_radio_past.png`
- `story_17_road_open` → `assets/story/story_17_road_open.png`

## 4. 파일 목록

| ID | 저장 경로 | 게임 안 크기 | 필수 | 설명 | prompt (⑤에 그대로) |
|---|---|---|---|---|---|
| `story_13_surveyors` | `assets/story/story_13_surveyors.png` | 1280×720 |  | 4막 1: 아침, 말뚝을 등에 진 측량기 셋이 줄 맞춰 마을로 들어옴 | morning, three grey SURVEYOR robots marching into the village in a perfectly straight line from the road, bundles of survey stakes on their backs, GRAMO, PIP and LAMP peeking from behind trees and the bandstand |
| `story_14_grey_spread` | `assets/story/story_14_grey_spread.png` | 1280×720 |  | 4막 2: 박힌 말뚝에서 회색이 얼룩처럼 번져 마을 바닥과 꽃이 색을 잃음 | a survey stake driven into colorful village grass, a circle of grey color spreading out from it like an ink stain, flowers and grass inside the circle turned colorless and straight, a SURVEYOR walking away in the background |
| `story_15_chase` | `assets/story/story_15_chase.png` | 1280×720 |  | 4막 3: 등에 건전지 팩을 단 보글이 속도선을 그리며 마을 출구로 달아나는 측량기를 쫓음 | BOGLE with a grey battery pack on his back dashing very fast with straight speed lines, chasing a SURVEYOR robot that runs toward the village exit gate, BOGLE's body stiff and greyish, no bounce |
| `story_16_radio_past` | `assets/story/story_16_radio_past.png` | 1280×720 |  | 4막 4: 회상(회색 톤). 도시 방송국 선반 위 라디오 씨가 반짝이는 새 기계들 사이에서 고물 상자로 던져짐 | flashback in grey and sepia tones: inside a big city broadcasting station, RADIO standing on a shelf among many shiny new grey devices, a large mechanical hand dropping him into a scrap box, sad and lonely |
| `story_17_road_open` | `assets/story/story_17_road_open.png` | 1280×720 |  | 4막 끝: 마을 끝에서 먼 회색 도시와 송신탑으로 이어진 긴 길을 바라보는 보글과 라디오 씨 | BOGLE and RADIO with his crank standing at the edge of the village looking down a long winding road toward a distant grey city with a tall broadcast tower, GRAMO and PIP waving goodbye behind them, warm village behind and grey horizon ahead |

## 5. 이 JOB만의 규칙

- 화면 아래 30% 비우기, 글자 금지(JOB-11과 같음).
- `story_14_grey_spread`: 회색 원 안쪽은 채도 0 + 풀·꽃이 **곧게 선 직선**, 바깥은 원래 색과 곡선. 4막 핵심 연출.
- `story_15_chase`의 보글은 건전지 상태: 뻣뻣함, 튐 없음, 불빛 점 눈, 등에 건전지 팩.
- `story_16_radio_past`는 회상이라 전체를 회색·세피아로. 3막 이후 라디오 씨는 크랭크가 있지만 이 장면(과거)에는 **크랭크가 없다**.

## 6. 끝나면

```
python tools/check_assets.py      # assets/STATUS.md 갱신
python tools/contact_sheet.py     # assets/sheets/_contact.png
```
1. ASSET_GUIDE 6절 체크리스트로 한 장씩 확인한다. 어긋난 파일만 다시 만든다.
2. `assets/PROMPT_LOG.md`에 한 줄씩: `날짜 | JOB-13 | 결과 파일 | 프롬프트 요약 | 합격/재생성`
3. 사람에게 보고: 만든 파일 수 / 다시 만든 파일과 이유 / STATUS.md에 남은 문제
4. `src/`, `index.html`, `GAME_DESIGN.md`, `assets/manifest.js`는 수정하지 않는다. 이름이나 크기를 바꿔야 할 것 같으면 사람에게 묻는다.
