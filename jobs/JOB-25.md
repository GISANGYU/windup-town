# JOB-25 — 오르골 마을 주민 3종 (춤 2프레임 + 쉼)

> 사람이 **"JOB25 진행해"**라고 하면 이 파일을 처음부터 끝까지 따라 한다. 다른 JOB은 건드리지 않는다.

- 소속: 제7막 「멈추지 않는 무도회」 (GAME_DESIGN.md 24절)
- 만들 파일: **9개**
- 먼저 끝나 있어야 하는 JOB: 없음 (바로 시작 가능)

## 1. 시작 전

1. `AGENTS.md`, `ASSET_GUIDE.md` 0~5절을 읽는다. 0절 절대 규칙은 이 JOB에도 그대로 적용된다.
2. 아래 레퍼런스 이미지를 열어 보고, 생성할 때마다 첨부한다.

   - `assets/refs/style_anchor.png`
   - `assets/refs/ref_02_character.jpg`
   - `assets/npc/npc_pip_awake.png (주민 크기감)`

## 2. 프롬프트 조립 순서

ASSET_GUIDE 1-2절 방식. 고정 블록은 **한 글자도 바꾸지 않고** 복사한다.

1. STYLE BLOCK
2. SPRITE RULES
3. SIDE-SCROLL RULES
4. ORGEL DANCERS
5. 시트 구성 설명 (아래 3절)
6. 각 ID의 개별 프롬프트 (아래 4절 표의 prompt 값 그대로)

## 3. 만드는 방법

### 시트 `a` — 양철 병정 3개

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `npc_tin_dance_01` → `npc_tin_dance_02` → `npc_tin_rest`
- 원본 저장: `assets/sheets/JOB-25_a.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-25_a.png --names npc_tin_dance_01,npc_tin_dance_02,npc_tin_rest
```
- 잘린 개수가 3개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

### 시트 `b` — 태엽 새 3개

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `npc_bird_dance_01` → `npc_bird_dance_02` → `npc_bird_rest`
- 원본 저장: `assets/sheets/JOB-25_b.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-25_b.png --names npc_bird_dance_01,npc_bird_dance_02,npc_bird_rest
```
- 잘린 개수가 3개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

### 시트 `c` — 팽이 아가씨 3개

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `npc_top_dance_01` → `npc_top_dance_02` → `npc_top_rest`
- 원본 저장: `assets/sheets/JOB-25_c.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-25_c.png --names npc_top_dance_01,npc_top_dance_02,npc_top_rest
```
- 잘린 개수가 3개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

## 4. 파일 목록

| ID | 저장 경로 | 게임 안 크기 | 필수 | 설명 | prompt (⑤에 그대로) |
|---|---|---|---|---|---|
| `npc_tin_dance_01` | `assets/npc/npc_tin_dance_01.png` | 높이 110px | ● | 양철 병정 춤 1(너무 감김) | TIN SOLDIER dancing wildly in side view facing LEFT, one leg kicked high, arms flailing, dizzy spiral eyes, his back key spinning |
| `npc_tin_dance_02` | `assets/npc/npc_tin_dance_02.png` | 높이 110px |  | 양철 병정 춤 2 | TIN SOLDIER dancing wildly in side view facing LEFT, the other leg kicked high, hat tilted, dizzy spiral eyes |
| `npc_tin_rest` | `assets/npc/npc_tin_rest.png` | 높이 110px | ● | 양철 병정 쉼(풀린 뒤 털썩 앉음) | TIN SOLDIER sitting down on the ground in side view facing LEFT, exhausted but relieved, normal pie-cut eyes, a little sweat drop |
| `npc_bird_dance_01` | `assets/npc/npc_bird_dance_01.png` | 높이 110px | ● | 태엽 새 춤 1 | WIND-UP BIRD hopping frantically in side view facing LEFT, wings flapping, beak open singing nonstop, dizzy spiral eyes |
| `npc_bird_dance_02` | `assets/npc/npc_bird_dance_02.png` | 높이 110px |  | 태엽 새 춤 2 | WIND-UP BIRD hopping frantically in side view facing LEFT, other wing up, feathers flying, dizzy spiral eyes |
| `npc_bird_rest` | `assets/npc/npc_bird_rest.png` | 높이 110px | ● | 태엽 새 쉼 | WIND-UP BIRD sitting fluffed up and resting in side view facing LEFT, eyes half closed happily |
| `npc_top_dance_01` | `assets/npc/npc_top_dance_01.png` | 높이 110px | ● | 팽이 아가씨 춤 1 | TOP LADY a spinning-top shaped lady spinning nonstop in side view facing LEFT, motion lines, dizzy spiral eyes |
| `npc_top_dance_02` | `assets/npc/npc_top_dance_02.png` | 높이 110px |  | 팽이 아가씨 춤 2 | TOP LADY spinning nonstop tilted the other way, motion lines, dizzy spiral eyes |
| `npc_top_rest` | `assets/npc/npc_top_rest.png` | 높이 110px | ● | 팽이 아가씨 쉼(옆으로 누움) | TOP LADY lying on her side at rest, a relieved smile, normal pie-cut eyes |

## 5. 이 JOB만의 규칙

- 모두 **왼쪽**을 본다(보글이 왼쪽에서 다가옴).
- 춤 2프레임은 **너무 감긴** 모습(나선 눈, 쉬지 못함). 쉼은 털썩 앉거나 누워 **파이 눈**으로 안도.
- 세 종류가 실루엣만으로 구분되게.

## 6. 끝나면

```
python tools/check_assets.py      # assets/STATUS.md 갱신
python tools/contact_sheet.py     # assets/sheets/_contact.png
```
1. ASSET_GUIDE 6절 체크리스트로 한 장씩 확인한다. 어긋난 파일만 다시 만든다.
2. `assets/PROMPT_LOG.md`에 한 줄씩: `날짜 | JOB-25 | 결과 파일 | 프롬프트 요약 | 합격/재생성`
3. 사람에게 보고: 만든 파일 수 / 다시 만든 파일과 이유 / STATUS.md에 남은 문제
4. `src/`, `index.html`, `GAME_DESIGN.md`, `assets/manifest.js`는 수정하지 않는다. 이름이나 크기를 바꿔야 할 것 같으면 사람에게 묻는다.
