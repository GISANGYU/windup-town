# JOB-10 — 제3막 소품·축제 장식·가로등 초상화

> 사람이 **"JOB10 진행해"**라고 하면 이 파일을 처음부터 끝까지 따라 한다. 다른 JOB은 건드리지 않는다.

- 소속: 제3막 「태엽 없는 손님」 (GAME_DESIGN.md 17절)
- 만들 파일: **9개**
- 먼저 끝나 있어야 하는 JOB: 없음 (바로 시작 가능)

## 1. 시작 전

1. `AGENTS.md`, `ASSET_GUIDE.md` 0~5절을 읽는다. 0절 절대 규칙은 이 JOB에도 그대로 적용된다.
2. 아래 레퍼런스 이미지를 열어 보고, 생성할 때마다 첨부한다.

   - `assets/refs/style_anchor.png`
   - `assets/refs/ref_02_character.jpg`
   - `assets/npc/npc_lamp_on.png (가로등 초상화용)`

## 2. 프롬프트 조립 순서

ASSET_GUIDE 1-2절 방식. 고정 블록은 **한 글자도 바꾸지 않고** 복사한다.

1. STYLE BLOCK
2. SPRITE RULES
3. LAMP (c 시트만)
4. 시트 구성 설명 (아래 3절)
5. 각 ID의 개별 프롬프트 (아래 4절 표의 prompt 값 그대로)

## 3. 만드는 방법

### 시트 `a` — 아이템 4개 한 줄

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `prop_battery` → `prop_battery_pack` → `prop_sheet_music` → `prop_ribbon`
- 원본 저장: `assets/sheets/JOB-10_a.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-10_a.png --names prop_battery,prop_battery_pack,prop_sheet_music,prop_ribbon
```
- 잘린 개수가 4개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

### 시트 `b` — 축제 장식 3개 한 줄

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `furn_bunting` → `furn_lantern` → `furn_banner`
- 원본 저장: `assets/sheets/JOB-10_b.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-10_b.png --names furn_bunting,furn_lantern,furn_banner
```
- 잘린 개수가 3개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

### 시트 `c` — 가로등 초상화 2개 한 줄

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `portrait_lamp_awake` → `portrait_lamp_shy`
- 원본 저장: `assets/sheets/JOB-10_c.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-10_c.png --names portrait_lamp_awake,portrait_lamp_shy
```
- 잘린 개수가 2개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

## 4. 파일 목록

| ID | 저장 경로 | 게임 안 크기 | 필수 | 설명 | prompt (⑤에 그대로) |
|---|---|---|---|---|---|
| `prop_battery` | `assets/props/prop_battery.png` | 높이 40px | ● | 건전지(아이템·HUD). 마을과 어울리지 않는 차가운 회색, 로고·글자 없음 | a single cartoon dry-cell battery standing upright, smooth cool grey metal body #9BA3AE with a silver top cap and a dark band, plain with NO logo, NO plus or minus signs, NO face, slightly too clean and shiny compared to the village |
| `prop_battery_pack` | `assets/props/prop_battery_pack.png` | 높이 46px |  | 보글 등에 붙는 건전지 팩(4·5막 오버레이). 옆에서 본 모습 | a small grey battery pack with a strap clip, seen from the side, cool grey #9BA3AE with one tiny orange indicator light, plain with NO logo or text |
| `prop_sheet_music` | `assets/props/prop_sheet_music.png` | 높이 40px | ● | 피프의 악보 조각(줍는 아이템). 찢어진 크림색 종이에 음표 모양 | a torn scrap of cream sheet-music paper standing slightly curled, a few music note SHAPES and staff lines drawn on it, no letters, one corner ripped |
| `prop_ribbon` | `assets/props/prop_ribbon.png` | 높이 36px |  | 보글 이사 상자의 빨간 리본(건전지 체험 때 덤불 너머에 보임) | a red #D2463C ribbon bow lying on the ground, slightly crumpled, two loose tails |
| `furn_bunting` | `assets/furniture/furn_bunting.png` | 높이 110px |  | 축제 깃발 줄(무대 꾸미기). 양쪽 작은 기둥 사이 삼각 깃발 | a string of triangle pennant flags in red, blue and yellow hanging in a gentle curve between two short wooden posts, wide and horizontal |
| `furn_lantern` | `assets/furniture/furn_lantern.png` | 높이 120px |  | 축제 종이 등불(기둥형) | a round paper festival lantern glowing warm yellow hanging from a short curved wooden pole |
| `furn_banner` | `assets/furniture/furn_banner.png` | 높이 130px |  | 축제 깃발 기둥 | a tall wooden pole with a wavy cream and red flag on top, the flag blank with no symbols |
| `portrait_lamp_awake` | `assets/portrait/portrait_lamp_awake.png` | 높이 200px |  | 대화 카드용 가로등(이름을 얻은 뒤, 밝게 깜빡임) | close-up of LAMP's glass lantern head glowing warm yellow, pie-cut eyes bright and happy, mid-blink with one eye closed |
| `portrait_lamp_shy` | `assets/portrait/portrait_lamp_shy.png` | 높이 200px |  | 대화 카드용 가로등(처음 말할 때, 수줍음) | close-up of LAMP's glass lantern head glowing softly, looking down shyly, small blush, pie-cut eyes |

## 5. 이 JOB만의 규칙

- 건전지(`prop_battery`, `prop_battery_pack`)는 마을 물건보다 **차갑고 깨끗하게**: 회색 `#9BA3AE`, 은색 뚜껑, 얼굴 없음. +·− 기호와 로고 금지.
- 악보 조각의 음표는 글자가 아니라 **모양**으로. 오선은 3~5줄.
- 가로등 초상화는 기존 `npc_lamp_on`의 유리 머리와 같은 모양으로. 가로등은 이 막에서 처음 말을 하는 캐릭터다.

## 6. 끝나면

```
python tools/check_assets.py      # assets/STATUS.md 갱신
python tools/contact_sheet.py     # assets/sheets/_contact.png
```
1. ASSET_GUIDE 6절 체크리스트로 한 장씩 확인한다. 어긋난 파일만 다시 만든다.
2. `assets/PROMPT_LOG.md`에 한 줄씩: `날짜 | JOB-10 | 결과 파일 | 프롬프트 요약 | 합격/재생성`
3. 사람에게 보고: 만든 파일 수 / 다시 만든 파일과 이유 / STATUS.md에 남은 문제
4. `src/`, `index.html`, `GAME_DESIGN.md`, `assets/manifest.js`는 수정하지 않는다. 이름이나 크기를 바꿔야 할 것 같으면 사람에게 묻는다.
