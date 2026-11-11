# JOB-17 — 제5막 컷신 5장 + HUD 아이콘 2개

> 사람이 **"JOB17 진행해"**라고 하면 이 파일을 처음부터 끝까지 따라 한다. 다른 JOB은 건드리지 않는다.

- 소속: 제5막 「갈아끼우는 길」 (GAME_DESIGN.md 19절)
- 만들 파일: **7개**
- 먼저 끝나 있어야 하는 JOB: JOB-9, JOB-14, JOB-15 (결과 이미지를 레퍼런스로 씀. 없으면 사람에게 알리고 기다린다)

## 1. 시작 전

1. `AGENTS.md`, `ASSET_GUIDE.md` 0~5절을 읽는다. 0절 절대 규칙은 이 JOB에도 그대로 적용된다.
2. 아래 레퍼런스 이미지를 열어 보고, 생성할 때마다 첨부한다.

   - `assets/refs/style_anchor.png`
   - `assets/refs/ref_01_carnival.jpg`
   - JOB-15 결과 bg_road*_far (구간 분위기)
   - JOB-9 결과 npc_radio_crank
   - JOB-14 결과 player_dash_side_01

## 2. 프롬프트 조립 순서

ASSET_GUIDE 1-2절 방식. 고정 블록은 **한 글자도 바꾸지 않고** 복사한다.

1. STYLE BLOCK
2. BACKGROUND RULES (컷신)
3. SPRITE RULES (아이콘)
4. BOGLE, RADIO
5. 시트 구성 설명 (아래 3절)
6. 각 ID의 개별 프롬프트 (아래 4절 표의 prompt 값 그대로)

## 3. 만드는 방법

### 시트 `a` — HUD 아이콘 2개 한 줄

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `ui_icon_wind` → `ui_icon_battery`
- 원본 저장: `assets/sheets/JOB-17_a.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-17_a.png --names ui_icon_wind,ui_icon_battery
```
- 잘린 개수가 2개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

### 한 장씩 따로 만드는 것

16:9 한 장씩 생성해서 아래 경로에 **PNG로 바로 저장**한다(자르기 없음).

- `story_18_road_start` → `assets/story/story_18_road_start.png`
- `story_19_factory` → `assets/story/story_19_factory.png`
- `story_20_city_gate` → `assets/story/story_20_city_gate.png`
- `story_21_tower_top` → `assets/story/story_21_tower_top.png`
- `story_22_music_spreads` → `assets/story/story_22_music_spreads.png`

## 4. 파일 목록

| ID | 저장 경로 | 게임 안 크기 | 필수 | 설명 | prompt (⑤에 그대로) |
|---|---|---|---|---|---|
| `ui_icon_wind` | `assets/ui/ui_icon_wind.png` | 높이 56px | ● | 5막 HUD 태엽 모드 아이콘(둥근 배지 + 황동 열쇠) | a round cream badge with a dark plum outline and a brass butterfly wind-up key in the center, no text |
| `ui_icon_battery` | `assets/ui/ui_icon_battery.png` | 높이 56px | ● | 5막 HUD 건전지 모드 아이콘(둥근 배지 + 회색 건전지) | a round cool grey badge with a dark plum outline and a grey battery with an orange light in the center, no text, no plus or minus signs |
| `story_18_road_start` | `assets/story/story_18_road_start.png` | 1280×720 |  | 5막 1: 새벽, 작은 배낭에 건전지와 열쇠를 꽂고 긴 길을 떠나는 보글 | dawn, BOGLE setting off on a long winding road with a small backpack holding a grey battery and a brass wind-up key, the warm village behind him, a long road ahead fading into grey |
| `story_19_factory` | `assets/story/story_19_factory.png` | 1280×720 |  | 5막 2: 회색 공장 지대에서 건전지 사물들이 줄지어 뻣뻣하게 행진, 상자 뒤에 숨은 보글 | grey factory district, rows of grey battery-powered objects (kettles, clocks, lamps) marching stiffly in perfect lines with dot-light eyes, BOGLE in full color hiding behind a crate watching |
| `story_20_city_gate` | `assets/story/story_20_city_gate.png` | 1280×720 |  | 5막 3: 거대한 회색 도시 성문과 붉은 불빛 송신탑, 아래에 조그맣게 선 색 있는 보글 | a huge grey city gate made of straight steel lines and a giant broadcast tower with a red light behind it, everything colorless, tiny BOGLE at the bottom center in full warm color looking up |
| `story_21_tower_top` | `assets/story/story_21_tower_top.png` | 1280×720 |  | 5막 4: 송신탑 꼭대기에서 보글이 라디오 씨 안테나를 송신기에 연결 | the top of the broadcast tower at night, BOGLE connecting RADIO's antenna to a giant grey transmitter with many dials, RADIO smiling with his crank, wind blowing, city lights below |
| `story_22_music_spreads` | `assets/story/story_22_music_spreads.png` | 1280×720 |  | 5막 끝(후보): 송신탑에서 음표와 색이 퍼져 회색 도시의 사물들이 박자에 맞춰 튀기 시작 | music notes and warm color spreading out from the broadcast tower in a big ring over the grey city, grey battery-powered objects in the streets starting to bounce in rubber hose curves for the first time, joyful |

## 5. 이 JOB만의 규칙

- 화면 아래 30% 비우기, 글자 금지.
- 회색 도시 속에서 **보글만 원래 색**인 대비가 5막 컷신의 공통 규칙.
- `story_22_music_spreads`는 결말 후보. 회색 사물들이 처음으로 러버호스 곡선으로 튀는 순간.
- 아이콘 2개는 같은 크기의 둥근 배지. 태엽=크림 바탕+황동 열쇠, 건전지=회색 바탕+회색 건전지. 작게 줄여도 구분되게 단순하게.

## 6. 끝나면

```
python tools/check_assets.py      # assets/STATUS.md 갱신
python tools/contact_sheet.py     # assets/sheets/_contact.png
```
1. ASSET_GUIDE 6절 체크리스트로 한 장씩 확인한다. 어긋난 파일만 다시 만든다.
2. `assets/PROMPT_LOG.md`에 한 줄씩: `날짜 | JOB-17 | 결과 파일 | 프롬프트 요약 | 합격/재생성`
3. 사람에게 보고: 만든 파일 수 / 다시 만든 파일과 이유 / STATUS.md에 남은 문제
4. `src/`, `index.html`, `GAME_DESIGN.md`, `assets/manifest.js`는 수정하지 않는다. 이름이나 크기를 바꿔야 할 것 같으면 사람에게 묻는다.
