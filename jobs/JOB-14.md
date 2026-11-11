# JOB-14 — 제5막 보글 횡스크롤 포즈 11개

> 사람이 **"JOB14 진행해"**라고 하면 이 파일을 처음부터 끝까지 따라 한다. 다른 JOB은 건드리지 않는다.

- 소속: 제5막 「갈아끼우는 길」 (GAME_DESIGN.md 19절)
- 만들 파일: **11개**
- 먼저 끝나 있어야 하는 JOB: 없음 (바로 시작 가능)

## 1. 시작 전

1. `AGENTS.md`, `ASSET_GUIDE.md` 0~5절을 읽는다. 0절 절대 규칙은 이 JOB에도 그대로 적용된다.
2. 아래 레퍼런스 이미지를 열어 보고, 생성할 때마다 첨부한다.

   - `assets/refs/style_anchor.png`
   - `assets/refs/ref_02_character.jpg`
   - `assets/player/player_idle_side.png (모양 고정)`
   - `assets/player/player_jump_side.png`
   - JOB-10 결과 prop_battery_pack

## 2. 프롬프트 조립 순서

ASSET_GUIDE 1-2절 방식. 고정 블록은 **한 글자도 바꾸지 않고** 복사한다.

1. STYLE BLOCK
2. SPRITE RULES
3. SIDE-SCROLL RULES
4. BOGLE
5. 시트 구성 설명 (아래 3절)
6. 각 ID의 개별 프롬프트 (아래 4절 표의 prompt 값 그대로)

## 3. 만드는 방법

### 시트 `a` — 위 줄: 태엽 달리기 4프레임 / 아래 줄: 건전지 대시 2프레임

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `player_run_side_01` → `player_run_side_02` → `player_run_side_03` → `player_run_side_04` → `player_dash_side_01` → `player_dash_side_02`
- 원본 저장: `assets/sheets/JOB-14_a.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-14_a.png --names player_run_side_01,player_run_side_02,player_run_side_03,player_run_side_04,player_dash_side_01,player_dash_side_02
```
- 잘린 개수가 6개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

### 시트 `b` — 동작 5개 한 줄

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `player_swap` → `player_wind_self` → `player_charge` → `player_short` → `player_hurt_side`
- 원본 저장: `assets/sheets/JOB-14_b.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-14_b.png --names player_swap,player_wind_self,player_charge,player_short,player_hurt_side
```
- 잘린 개수가 5개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

## 4. 파일 목록

| ID | 저장 경로 | 게임 안 크기 | 필수 | 설명 | prompt (⑤에 그대로) |
|---|---|---|---|---|---|
| `player_run_side_01` | `assets/player/player_run_side_01.png` | 높이 120px | ● | 5막 태엽 달리기 1(오른쪽). 출렁이는 러버호스 보폭 | BOGLE running to the RIGHT in strict side view, wide bouncy rubber hose stride, front leg reaching, body squashed down, lid bouncing |
| `player_run_side_02` | `assets/player/player_run_side_02.png` | 높이 120px |  | 5막 태엽 달리기 2 | BOGLE running to the RIGHT in strict side view, legs passing, body stretched up, lid lifted |
| `player_run_side_03` | `assets/player/player_run_side_03.png` | 높이 120px |  | 5막 태엽 달리기 3 | BOGLE running to the RIGHT in strict side view, the other leg reaching forward, body squashed down |
| `player_run_side_04` | `assets/player/player_run_side_04.png` | 높이 120px |  | 5막 태엽 달리기 4 | BOGLE running to the RIGHT in strict side view, legs passing again, body stretched up, small steam puff from spout |
| `player_dash_side_01` | `assets/player/player_dash_side_01.png` | 높이 120px | ● | 5막 건전지 대시 1. 뻣뻣하게 앞으로 기울어짐, 등에 건전지 팩, 튐 없음 | BOGLE dashing to the RIGHT in strict side view with a small grey battery pack clipped on his back, body rigid and leaning forward, legs straight like scissors, NO bounce, NO steam, eyes as two small glowing dots |
| `player_dash_side_02` | `assets/player/player_dash_side_02.png` | 높이 120px |  | 5막 건전지 대시 2 | the same rigid dashing BOGLE with the battery pack, legs swapped, body exactly level |
| `player_swap` | `assets/player/player_swap.png` | 높이 120px | ● | 5막 갈아끼우기: 등 덮개를 열고 한 손엔 건전지, 한 손엔 태엽 열쇠 | BOGLE standing in side view facing RIGHT, his back hatch open, reaching behind with one glove holding a grey battery and the other holding a brass wind-up key, focused face, tongue out |
| `player_wind_self` | `assets/player/player_wind_self.png` | 높이 120px |  | 5막 스스로 태엽 감기(게이지 회복) | BOGLE standing in side view facing RIGHT, twisting the brass wind-up key on his own back with both gloves, eyes squeezed, effort lines |
| `player_charge` | `assets/player/player_charge.png` | 높이 120px |  | 5막 충전소에서 충전 중. 등에 플러그, 눈 감고 편안 | BOGLE standing in side view facing RIGHT with a thick grey cable plugged into his back, eyes closed, calm, tiny orange light glowing on the battery pack |
| `player_short` | `assets/player/player_short.png` | 높이 120px |  | 5막 물에 닿아 합선. 지지직, 몸이 굳음 | BOGLE frozen in side view facing RIGHT, short-circuited: grey zigzag sparks around him, frazzled lid, spiral eyes, little smoke puffs, battery pack on his back |
| `player_hurt_side` | `assets/player/player_hurt_side.png` | 높이 120px |  | 5막 피격(뒤로 밀림) | BOGLE knocked backward in side view facing RIGHT, arms flailing, eyes shut, lid popping up |

## 5. 이 JOB만의 규칙

- 모두 **오른쪽을 보는 엄격한 옆모습**, 카메라는 땅과 같은 높이.
- **태엽 달리기**(run 1~4): 출렁이는 러버호스, 눌림·늘어남이 큼, 뚜껑이 들썩임, 파이 눈.
- **건전지 대시**(dash 1~2): 몸이 뻣뻣하고 수평, 다리는 가위처럼 곧게, 증기 없음, 눈은 불빛 점 두 개, **등에 건전지 팩**(`prop_battery_pack`과 같은 모양).
- 두 상태의 차이가 실루엣만 봐도 구분돼야 한다. 5막 조작의 핵심이다.
- `player_swap`은 등 덮개가 열린 모습. 기존 보글 디자인(주전자 자체가 몸)은 그대로.

## 6. 끝나면

```
python tools/check_assets.py      # assets/STATUS.md 갱신
python tools/contact_sheet.py     # assets/sheets/_contact.png
```
1. ASSET_GUIDE 6절 체크리스트로 한 장씩 확인한다. 어긋난 파일만 다시 만든다.
2. `assets/PROMPT_LOG.md`에 한 줄씩: `날짜 | JOB-14 | 결과 파일 | 프롬프트 요약 | 합격/재생성`
3. 사람에게 보고: 만든 파일 수 / 다시 만든 파일과 이유 / STATUS.md에 남은 문제
4. `src/`, `index.html`, `GAME_DESIGN.md`, `assets/manifest.js`는 수정하지 않는다. 이름이나 크기를 바꿔야 할 것 같으면 사람에게 묻는다.
