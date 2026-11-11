# JOB-19 — 두꺼비집 문지기 (중간 보스)

> 사람이 **"JOB19 진행해"**라고 하면 이 파일을 처음부터 끝까지 따라 한다. 다른 JOB은 건드리지 않는다.

- 소속: 제4막 (GAME_DESIGN.md 19절)
- 만들 파일: **8개**
- 먼저 끝나 있어야 하는 JOB: 없음 (바로 시작 가능)

## 1. 시작 전

1. `AGENTS.md`, `ASSET_GUIDE.md` 0~5절을 읽는다. 0절 절대 규칙은 이 JOB에도 그대로 적용된다.
2. 아래 레퍼런스 이미지를 열어 보고, 생성할 때마다 첨부한다.

   - `assets/refs/style_anchor.png`
   - `assets/refs/ref_02_character.jpg`

## 2. 프롬프트 조립 순서

ASSET_GUIDE 1-2절 방식. 고정 블록은 **한 글자도 바꾸지 않고** 복사한다.

1. STYLE BLOCK
2. SPRITE RULES
3. SIDE-SCROLL RULES
4. TOAD GATEKEEPER
5. 시트 구성 설명 (아래 3절)
6. 각 ID의 개별 프롬프트 (아래 4절 표의 prompt 값 그대로)

## 3. 만드는 방법

### 시트 `a` — 자세 4개 한 줄 (모두 왼쪽 보기)

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `boss_toad_idle` → `boss_toad_croak` → `boss_toad_tongue` → `boss_toad_overheat_top`
- 원본 저장: `assets/sheets/JOB-19_a.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-19_a.png --names boss_toad_idle,boss_toad_croak,boss_toad_tongue,boss_toad_overheat_top
```
- 잘린 개수가 4개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

### 시트 `b` — 자세 3개 + 초상화

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `boss_toad_overheat_mouth` → `boss_toad_hurt` → `boss_toad_down` → `portrait_toad`
- 원본 저장: `assets/sheets/JOB-19_b.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-19_b.png --names boss_toad_overheat_mouth,boss_toad_hurt,boss_toad_down,portrait_toad
```
- 잘린 개수가 4개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

## 4. 파일 목록

| ID | 저장 경로 | 게임 안 크기 | 필수 | 설명 | prompt (⑤에 그대로) |
|---|---|---|---|---|---|
| `boss_toad_idle` | `assets/boss/boss_toad_idle.png` | 높이 230px | ● | 두꺼비집 문지기 대기 | TOAD GATEKEEPER sitting wide facing LEFT, puffed cheeks, lever on top of its head, smug half-closed eyes |
| `boss_toad_croak` | `assets/boss/boss_toad_croak.png` | 높이 230px | ● | 방전 울음: 목주머니가 부풀며 번개 | TOAD GATEKEEPER croaking loudly facing LEFT, huge inflated throat sac glowing with electricity, small sparks shooting down to the floor |
| `boss_toad_tongue` | `assets/boss/boss_toad_tongue.png` | 높이 230px | ● | 자석 혀: 혀를 길게 뻗음(혀 끝이 자석) | TOAD GATEKEEPER facing LEFT shooting out a very long tongue with a horseshoe magnet at the tip, curved pull lines, eyes squeezed |
| `boss_toad_overheat_top` | `assets/boss/boss_toad_overheat_top.png` | 높이 230px | ● | 과열 1: 엎드려 헐떡이고 머리 위 레버가 드러남 | TOAD GATEKEEPER flattened and panting facing LEFT, steam puffs, the big breaker lever on top of its head clearly sticking up |
| `boss_toad_overheat_mouth` | `assets/boss/boss_toad_overheat_mouth.png` | 높이 230px | ● | 과열 2: 입을 크게 벌림, 입 안에 레버 | TOAD GATEKEEPER with its huge mouth gaping wide open facing LEFT, a breaker lever visible inside the mouth, tongue limp, steam |
| `boss_toad_hurt` | `assets/boss/boss_toad_hurt.png` | 높이 230px |  | 차단기가 내려가 몸이 깜빡 | TOAD GATEKEEPER with spiral eyes facing LEFT, its body lights flickering off, little smoke puffs |
| `boss_toad_down` | `assets/boss/boss_toad_down.png` | 높이 230px | ● | 퓨즈가 나가 쓰러짐 | TOAD GATEKEEPER lying flat on its back facing LEFT, legs in the air, fuse popped out, dazed X eyes, funny not scary |
| `portrait_toad` | `assets/portrait/portrait_toad.png` | 높이 200px |  | 대화 카드용 두꺼비집 문지기 | close-up bust of TOAD GATEKEEPER, puffed cheeks, lever on head, smug |

## 5. 이 JOB만의 규칙

- 모든 자세가 **왼쪽**을 본다(아레나 오른쪽에 섬).
- 머리 위 **차단기 레버**는 모든 자세에서 같은 자리. `overheat_top`에서 특히 분명하게.
- `overheat_mouth`는 입이 화면을 크게 차지하고 **입 안에 레버**가 보여야 한다(플레이어가 뛰어드는 곳).
- 우렁차지만 조금 멍청한 문지기. 징그럽지 않게, 둥글고 만화적으로.

## 6. 끝나면

```
python tools/check_assets.py      # assets/STATUS.md 갱신
python tools/contact_sheet.py     # assets/sheets/_contact.png
```
1. ASSET_GUIDE 6절 체크리스트로 한 장씩 확인한다. 어긋난 파일만 다시 만든다.
2. `assets/PROMPT_LOG.md`에 한 줄씩: `날짜 | JOB-19 | 결과 파일 | 프롬프트 요약 | 합격/재생성`
3. 사람에게 보고: 만든 파일 수 / 다시 만든 파일과 이유 / STATUS.md에 남은 문제
4. `src/`, `index.html`, `GAME_DESIGN.md`, `assets/manifest.js`는 수정하지 않는다. 이름이나 크기를 바꿔야 할 것 같으면 사람에게 묻는다.
