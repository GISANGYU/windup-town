# JOB-22 — 3~5막 컷신 13장

> 사람이 **"JOB22 진행해"**라고 하면 이 파일을 처음부터 끝까지 따라 한다. 다른 JOB은 건드리지 않는다.

- 소속: 제3~5막 (GAME_DESIGN.md 18~20절)
- 만들 파일: **13개**
- 먼저 끝나 있어야 하는 JOB: JOB-18, JOB-19, JOB-20 (결과 이미지를 레퍼런스로 씀. 없으면 사람에게 알리고 기다린다)

## 1. 시작 전

1. `AGENTS.md`, `ASSET_GUIDE.md` 0~5절을 읽는다. 0절 절대 규칙은 이 JOB에도 그대로 적용된다.
2. 아래 레퍼런스 이미지를 열어 보고, 생성할 때마다 첨부한다.

   - `assets/refs/style_anchor.png`
   - `assets/refs/ref_01_carnival.jpg`
   - `assets/story/story_08_festival.png (축제 톤)`
   - JOB-18·19·20 결과 (보스·라디오 씨 모습 고정)

## 2. 프롬프트 조립 순서

ASSET_GUIDE 1-2절 방식. 고정 블록은 **한 글자도 바꾸지 않고** 복사한다.

1. STYLE BLOCK
2. BACKGROUND RULES
3. 등장하는 캐릭터 블록 전부
4. 시트 구성 설명 (아래 3절)
5. 각 ID의 개별 프롬프트 (아래 4절 표의 prompt 값 그대로)

## 3. 만드는 방법

### 한 장씩 따로 만드는 것

16:9 한 장씩 생성해서 아래 경로에 **PNG로 바로 저장**한다(자르기 없음).

- `story_30_gramo_unwind` → `assets/story/story_30_gramo_unwind.png`
- `story_32_battery_montage` → `assets/story/story_32_battery_montage.png`
- `story_33_recall_night` → `assets/story/story_33_recall_night.png`
- `story_34_radio_confess` → `assets/story/story_34_radio_confess.png`
- `story_35_gramo_key` → `assets/story/story_35_gramo_key.png`
- `story_36_departure` → `assets/story/story_36_departure.png`
- `story_37_toad_gate` → `assets/story/story_37_toad_gate.png`
- `story_38_volt_reveal` → `assets/story/story_38_volt_reveal.png`
- `story_39_radio_collapse` → `assets/story/story_39_radio_collapse.png`
- `story_40_key_insert` → `assets/story/story_40_key_insert.png`
- `story_41_radio_reborn` → `assets/story/story_41_radio_reborn.png`
- `story_42_volt_small` → `assets/story/story_42_volt_small.png`
- `story_43_home` → `assets/story/story_43_home.png`

## 4. 파일 목록

| ID | 저장 경로 | 게임 안 크기 | 필수 | 설명 | prompt (⑤에 그대로) |
|---|---|---|---|---|---|
| `story_30_gramo_unwind` | `assets/story/story_30_gramo_unwind.png` | 1280×720 |  | 3막 1: 밤새 음악을 틀던 그라모의 태엽이 풀려 음악이 늘어지고 축제가 휘청임 | night festival in the village square with lanterns, GRAMO on the bandstand slumping as his spring unwinds, his horn drooping, music notes falling down and stretching, dancers wobbling and slowing |
| `story_32_battery_montage` | `assets/story/story_32_battery_montage.png` | 1280×720 |  | 3막 2: 건전지를 받은 피프는 쌩쌩, 가로등은 밤새 환함(살짝 회색, 불빛 점 눈) | split montage: on the left PIP the mailbox zooming with letters and straight speed lines, on the right LAMP the street lamp blazing harsh white all night, both slightly grey with two dot-light eyes and grey batteries on their backs |
| `story_33_recall_night` | `assets/story/story_33_recall_night.png` | 1280×720 |  | 3막 3: 회수 신호. 도시 쪽 하늘의 붉은 빛, 회색으로 굳은 피프·가로등에서 빛나는 실이 도시로 끌려감 | dark night, a red beam flashing in the sky over a distant city on the horizon, PIP and LAMP frozen grey, glowing golden threads pulled out of their backs and flying away toward the red light, BOGLE in full color watching in shock |
| `story_34_radio_confess` | `assets/story/story_34_radio_confess.png` | 1280×720 |  | 3막 4: 꺼져 가는 라디오 씨가 고백하고 보글이 듣는다 | the quiet square at night, RADIO sitting on a crate with his dials dimmed and head low, a nearly empty battery gauge glowing faintly on him, BOGLE sitting beside him listening, GRAMO behind |
| `story_35_gramo_key` | `assets/story/story_35_gramo_key.png` | 1280×720 |  | 3막 5: 그라모가 등에서 태엽 열쇠 하나를 뽑아 보글에게 건넴 | warm close moment: GRAMO pulling one brass wind-up key from his own back and handing it to BOGLE with both gloves, two keys still in GRAMO's back, soft lantern light |
| `story_36_departure` | `assets/story/story_36_departure.png` | 1280×720 |  | 3막 끝: 새벽, 보글과 라디오 씨가 마을을 떠남. 뒤에 회색으로 굳은 친구들과 손 흔드는 그라모 | dawn, BOGLE with a brass key on his back and RADIO walking out of the village gate toward a long road, GRAMO waving slowly behind them, PIP and LAMP frozen grey in the background |
| `story_37_toad_gate` | `assets/story/story_37_toad_gate.png` | 1280×720 |  | 4막 끝: 발전소 정문, 개굴! 길을 막는 두꺼비집 문지기 | a giant power plant gate at dusk, TOAD GATEKEEPER blocking it with a huge croak, sparks around its throat, tiny BOGLE and RADIO in front |
| `story_38_volt_reveal` | `assets/story/story_38_volt_reveal.png` | 1280×720 |  | 5막 1: 발전소 홀, 빛나는 실들을 빨아들이는 볼트 남작 | inside a vast generator hall, BARON VOLT towering and laughing, countless glowing golden threads from many towns flowing into his chest socket, BOGLE and RADIO small at the bottom |
| `story_39_radio_collapse` | `assets/story/story_39_radio_collapse.png` | 1280×720 |  | 5막 2: 마지막 잡음을 쏘고 회색으로 쓰러진 라디오 씨, 비웃는 남작 | RADIO collapsed grey on the floor with dark empty dials, a last wisp of static, BOGLE kneeling by him, BARON VOLT laughing in the background |
| `story_40_key_insert` | `assets/story/story_40_key_insert.png` | 1280×720 |  | 5막 3: 보글이 그라모의 열쇠를 라디오 씨 등에 꽂음(그라모의 기억이 희미하게 겹침) | close-up of BOGLE inserting a brass wind-up key into the back of the grey RADIO, a faint golden memory image of GRAMO handing over the key floating behind |
| `story_41_radio_reborn` | `assets/story/story_41_radio_reborn.png` | 1280×720 |  | 5막 4: 변신. 나팔이 피고 음표가 터져 나오는 라디오 씨 | RADIO transforming in a burst of golden light: a gramophone horn speaker blooming from his head, rubber hose limbs, pie-cut eyes opening, a huge wave of music notes exploding outward, BARON VOLT shielding his eyes |
| `story_42_volt_small` | `assets/story/story_42_volt_small.png` | 1280×720 |  | 5막 5: 작은 손전등 발전기가 된 남작 | the generator hall quiet now, BARON VOLT shrunk into a small hand-crank flashlight dynamo sitting on the floor, BOGLE turning its little crank gently, it smiles, RADIO REBORN beside them |
| `story_43_home` | `assets/story/story_43_home.png` | 1280×720 |  | 결말: 빛나는 실이 마을로 돌아오고 피프·가로등이 깨어남, 라디오 씨와 그라모가 함께 음악을 틂 | morning village square, golden threads raining back down into PIP and LAMP who wake up colorful and dancing, RADIO REBORN and GRAMO on the bandstand playing music together, BOGLE cheering |

## 5. 이 JOB만의 규칙

- 화면 아래 30%는 자막 카드가 덮는다. 중요한 얼굴은 위쪽 70%에.
- 건전지를 넣은 것은 **회색 + 불빛 점 눈**, 태엽인 것은 원래 색 + 파이 눈. 이 대비가 컷신 전체의 규칙.
- 그라모는 3막 5(`story_35`)부터 **등의 열쇠가 2개**다.
- `story_41_radio_reborn`은 이 게임의 하이라이트. 금빛, 음표, 변신 전후가 한 장에 보이도록 빛 속에서 피어나는 순간으로.

## 6. 끝나면

```
python tools/check_assets.py      # assets/STATUS.md 갱신
python tools/contact_sheet.py     # assets/sheets/_contact.png
```
1. ASSET_GUIDE 6절 체크리스트로 한 장씩 확인한다. 어긋난 파일만 다시 만든다.
2. `assets/PROMPT_LOG.md`에 한 줄씩: `날짜 | JOB-22 | 결과 파일 | 프롬프트 요약 | 합격/재생성`
3. 사람에게 보고: 만든 파일 수 / 다시 만든 파일과 이유 / STATUS.md에 남은 문제
4. `src/`, `index.html`, `GAME_DESIGN.md`, `assets/manifest.js`는 수정하지 않는다. 이름이나 크기를 바꿔야 할 것 같으면 사람에게 묻는다.
