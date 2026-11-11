# JOB-11 — 제3막 컷신 5장 + 크랭크 감기 모달

> 사람이 **"JOB11 진행해"**라고 하면 이 파일을 처음부터 끝까지 따라 한다. 다른 JOB은 건드리지 않는다.

- 소속: 제3막 「태엽 없는 손님」 (GAME_DESIGN.md 17절)
- 만들 파일: **7개**
- 먼저 끝나 있어야 하는 JOB: JOB-9, JOB-10 (결과 이미지를 레퍼런스로 씀. 없으면 사람에게 알리고 기다린다)

## 1. 시작 전

1. `AGENTS.md`, `ASSET_GUIDE.md` 0~5절을 읽는다. 0절 절대 규칙은 이 JOB에도 그대로 적용된다.
2. 아래 레퍼런스 이미지를 열어 보고, 생성할 때마다 첨부한다.

   - `assets/refs/style_anchor.png`
   - `assets/refs/ref_01_carnival.jpg`
   - `assets/refs/ref_03_stage_layers.jpg`
   - `assets/bg/bg_town_ground.png`
   - JOB-9 결과 npc_radio_* (라디오 씨 모습 고정)
   - JOB-10 결과 furn_bunting·furn_lantern (축제 장식)

## 2. 프롬프트 조립 순서

ASSET_GUIDE 1-2절 방식. 고정 블록은 **한 글자도 바꾸지 않고** 복사한다.

1. STYLE BLOCK
2. BACKGROUND RULES (컷신)
3. SPRITE RULES (모달 2개)
4. BOGLE, GRAMO, PIP, LAMP, RADIO 중 등장하는 것
5. 시트 구성 설명 (아래 3절)
6. 각 ID의 개별 프롬프트 (아래 4절 표의 prompt 값 그대로)

## 3. 만드는 방법

### 시트 `a` — 모달 2개 마젠타 시트 1장

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `wind_radio_back` → `wind_crank`
- 원본 저장: `assets/sheets/JOB-11_a.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-11_a.png --names wind_radio_back,wind_crank
```
- 잘린 개수가 2개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

### 한 장씩 따로 만드는 것

16:9 한 장씩 생성해서 아래 경로에 **PNG로 바로 저장**한다(자르기 없음).

- `story_08_festival` → `assets/story/story_08_festival.png`
- `story_09_radio_arrive` → `assets/story/story_09_radio_arrive.png`
- `story_10_radio_down` → `assets/story/story_10_radio_down.png`
- `story_11_broadcast` → `assets/story/story_11_broadcast.png`
- `story_12_city_signal` → `assets/story/story_12_city_signal.png`

## 4. 파일 목록

| ID | 저장 경로 | 게임 안 크기 | 필수 | 설명 | prompt (⑤에 그대로) |
|---|---|---|---|---|---|
| `wind_radio_back` | `assets/wind/wind_radio_back.png` | 높이 430px |  | 크랭크 감기 모달 배경: 라디오 씨 옆면 클로즈업, 가운데 둥근 크랭크 축 자리(크랭크 없음) | close-up of the right side of RADIO's wooden radio cabinet filling the frame, warm wood with a speaker grille edge visible, a round brass crank socket exactly in the CENTER (empty, NO crank), his antenna peeking at the top edge |
| `wind_crank` | `assets/wind/wind_crank.png` | 높이 200px |  | 크랭크 감기 모달의 크랭크. 화면에서 회전하므로 둥근 바퀴 + 가장자리 손잡이, 정면 | a single brass crank wheel seen straight from the front, perfectly round disc with spokes, a small round wooden knob on the rim at the top, toy-like, no sparkle |
| `story_08_festival` | `assets/story/story_08_festival.png` | 1280×720 |  | 3막 1: 깃발·등불로 꾸민 광장 축제. 모두 춤추고, 무대 위 그라모는 조금 지쳐 이마를 닦음 | sunny village square decorated with pennant bunting and paper lanterns, PIP, LAMP and BOGLE dancing, GRAMO on the round bandstand playing music but looking a little tired, wiping his brow with a glove, music notes in the air |
| `story_09_radio_arrive` | `assets/story/story_09_radio_arrive.png` | 1280×720 |  | 3막 2: 건전지를 잔뜩 실은 수레를 밀고 축제에 들어오는 라디오 씨 | RADIO gliding stiffly into the festival pushing a small cart piled high with grey batteries, presenting one battery with a big salesman smile, villagers turning their heads curiously, RADIO and the batteries are colder and greyer than the warm festival |
| `story_10_radio_down` | `assets/story/story_10_radio_down.png` | 1280×720 |  | 3막 3: 해 질 녘, 광장 한가운데 꺼진 채 쓰러진 라디오 씨와 걱정스레 모인 주민들 | dusk, RADIO switched off and slumped alone in the middle of the square, dark empty dial eyes, GRAMO, PIP, LAMP and BOGLE gathering around him worried, long quiet atmosphere |
| `story_11_broadcast` | `assets/story/story_11_broadcast.png` | 1280×720 |  | 3막 4: 크랭크를 단 라디오 씨가 무대에서 그라모 곁에 서서 음악을 마을 전체로 방송 | RADIO with a brass crank on his side standing on the bandstand next to GRAMO, music notes pouring out of RADIO's speaker and flowing over the whole village in a ribbon, the village in its fullest warm colors, PIP and LAMP dancing |
| `story_12_city_signal` | `assets/story/story_12_city_signal.png` | 1280×720 |  | 3막 끝: 빛나는 라디오 다이얼 너머, 먼 지평선의 회색 도시와 송신탑에서 들쭉날쭉한 잡음 파동이 밀려옴 | close-up of RADIO's glowing dial on the left, jagged grey static waves rolling in from the far horizon on the right where a distant grey city skyline and a tall broadcast tower with a red light stand, uneasy mood, warm village colors on the left fading to grey on the right |

## 5. 이 JOB만의 규칙

- 컷신은 16:9 각각 따로. 화면 **아래 30%는 자막 카드가 덮으므로** 중요한 얼굴을 두지 않는다. 글자 금지.
- 기계화 대비: 라디오 씨와 건전지는 주변보다 **회색·직선**으로, 마을은 따뜻한 색으로. `story_11_broadcast`는 마을이 가장 진한 색.
- `story_12_city_signal`은 4막 떡밥. 먼 도시는 디테일 없이 회색 실루엣과 붉은 불빛 하나만.
- `wind_radio_back`은 크랭크 축 자리가 정확히 가운데, 크랭크는 그리지 않음(기존 `wind_gramo_back`과 같은 구도). `wind_crank`는 회전하므로 정면·원형·대칭.

## 6. 끝나면

```
python tools/check_assets.py      # assets/STATUS.md 갱신
python tools/contact_sheet.py     # assets/sheets/_contact.png
```
1. ASSET_GUIDE 6절 체크리스트로 한 장씩 확인한다. 어긋난 파일만 다시 만든다.
2. `assets/PROMPT_LOG.md`에 한 줄씩: `날짜 | JOB-11 | 결과 파일 | 프롬프트 요약 | 합격/재생성`
3. 사람에게 보고: 만든 파일 수 / 다시 만든 파일과 이유 / STATUS.md에 남은 문제
4. `src/`, `index.html`, `GAME_DESIGN.md`, `assets/manifest.js`는 수정하지 않는다. 이름이나 크기를 바꿔야 할 것 같으면 사람에게 묻는다.
