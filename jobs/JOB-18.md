# JOB-18 — 볼트 남작 (최종 보스)

> 사람이 **"JOB18 진행해"**라고 하면 이 파일을 처음부터 끝까지 따라 한다. 다른 JOB은 건드리지 않는다.

- 소속: 제5막 「볼트 남작」 (GAME_DESIGN.md 20절)
- 만들 파일: **12개**
- 먼저 끝나 있어야 하는 JOB: 없음 (바로 시작 가능)

## 1. 시작 전

1. `AGENTS.md`, `ASSET_GUIDE.md` 0~5절을 읽는다. 0절 절대 규칙은 이 JOB에도 그대로 적용된다.
2. 아래 레퍼런스 이미지를 열어 보고, 생성할 때마다 첨부한다.

   - `assets/refs/style_anchor.png`
   - `assets/refs/ref_02_character.jpg`
   - `assets/boss/boss_idle.png (2막 백작과 같은 크기감·악당 톤)`

## 2. 프롬프트 조립 순서

ASSET_GUIDE 1-2절 방식. 고정 블록은 **한 글자도 바꾸지 않고** 복사한다.

1. STYLE BLOCK
2. SPRITE RULES
3. SIDE-SCROLL RULES
4. BARON VOLT
5. 시트 구성 설명 (아래 3절)
6. 각 ID의 개별 프롬프트 (아래 4절 표의 prompt 값 그대로)

## 3. 만드는 방법

### 시트 `a` — 공격 자세 5개 한 줄 (모두 왼쪽 보기)

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `boss_volt_idle` → `boss_volt_spark` → `boss_volt_magnet` → `boss_volt_spray` → `boss_volt_throw`
- 원본 저장: `assets/sheets/JOB-18_a.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-18_a.png --names boss_volt_idle,boss_volt_spark,boss_volt_magnet,boss_volt_spray,boss_volt_throw
```
- 잘린 개수가 5개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

### 시트 `b` — 낙뢰·과열·피격·크랭크 4개 한 줄

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `boss_volt_strike` → `boss_volt_overheat` → `boss_volt_hurt` → `boss_volt_crank`
- 원본 저장: `assets/sheets/JOB-18_b.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-18_b.png --names boss_volt_strike,boss_volt_overheat,boss_volt_hurt,boss_volt_crank
```
- 잘린 개수가 4개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

### 시트 `c` — 작은 발전기 + 초상화 2개

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `boss_volt_small` → `portrait_volt` → `portrait_volt_small`
- 원본 저장: `assets/sheets/JOB-18_c.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-18_c.png --names boss_volt_small,portrait_volt,portrait_volt_small
```
- 잘린 개수가 3개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

## 4. 파일 목록

| ID | 저장 경로 | 게임 안 크기 | 필수 | 설명 | prompt (⑤에 그대로) |
|---|---|---|---|---|---|
| `boss_volt_idle` | `assets/boss/boss_volt_idle.png` | 높이 300px | ● | 볼트 남작 대기. 거만하게 서서 코일 머리가 지지직 | BARON VOLT standing tall and smug facing LEFT, plug arms crossed, coil head crackling with small sparks, wire moustache curled |
| `boss_volt_spark` | `assets/boss/boss_volt_spark.png` | 높이 300px | ● | 방전 바닥: 두 플러그 팔로 바닥을 내려침 | BARON VOLT slamming both plug-shaped fists into the floor facing LEFT, bright sparks bursting from the floor, furious face |
| `boss_volt_magnet` | `assets/boss/boss_volt_magnet.png` | 높이 300px | ● | 자석 흡입: 두 팔을 앞으로 뻗어 끌어당김 | BARON VOLT facing LEFT with both arms stretched forward, his plug hands turned into horseshoe magnets, curved pull lines, greedy grin |
| `boss_volt_spray` | `assets/boss/boss_volt_spray.png` | 높이 300px |  | 냉각수: 옆구리 파이프로 물을 뿌림 | BARON VOLT facing LEFT spraying a stream of blue coolant water from a pipe on his side onto the floor, smug |
| `boss_volt_throw` | `assets/boss/boss_volt_throw.png` | 높이 300px |  | 건전지 폭탄 던지기 | BARON VOLT facing LEFT bowling a big grey battery with a lit fuse along the floor with one arm, sly grin |
| `boss_volt_strike` | `assets/boss/boss_volt_strike.png` | 높이 300px | ● | 추적 낙뢰: 코일 머리를 치켜들어 번개를 부름 | BARON VOLT facing LEFT raising his coil head to the sky, lightning bolts forking upward from the coil, eyes glowing |
| `boss_volt_overheat` | `assets/boss/boss_volt_overheat.png` | 높이 300px | ● | 과열: 주저앉아 김을 뿜고 몸통 플러그 구멍이 드러남 | BARON VOLT slumped and overheated facing LEFT, steam puffs from his coil, panting, a panel on his chest swung open showing three big plugs stuck into sockets, clearly visible |
| `boss_volt_hurt` | `assets/boss/boss_volt_hurt.png` | 높이 300px |  | 플러그를 뽑혔을 때 몸이 출렁 | BARON VOLT jolting with a shocked face facing LEFT, spiral eyes, one plug flying out of his chest, sparks |
| `boss_volt_crank` | `assets/boss/boss_volt_crank.png` | 높이 300px | ● | 마지막: 몸통이 열려 녹슨 크랭크가 드러남 | BARON VOLT on his knees facing LEFT, his chest panel fully open revealing a big old rusty hand crank inside, his face surprised and a little ashamed |
| `boss_volt_small` | `assets/boss/boss_volt_small.png` | 높이 120px | ● | 퇴치 후: 작은 손전등형 수동 발전기가 됨 | a small cute hand-crank flashlight dynamo with a tiny face, little wire moustache, a brass crank on its side, gentle smile, rubber hose legs, no electricity effects |
| `portrait_volt` | `assets/portrait/portrait_volt.png` | 높이 200px |  | 대화 카드용 볼트 남작 | close-up bust of BARON VOLT, coil head crackling, wire moustache, arrogant smile |
| `portrait_volt_small` | `assets/portrait/portrait_volt_small.png` | 높이 200px |  | 대화 카드용 작은 발전기 | close-up of the small hand-crank flashlight dynamo with a gentle smile |

## 5. 이 JOB만의 규칙

- 보스 아레나는 오른쪽에 보스가 서므로 **모든 자세가 왼쪽(보글 쪽)을 본다.** SIDE-SCROLL RULES의 'Characters face RIGHT'의 예외.
- `boss_volt_overheat`는 가슴 판이 열려 **플러그 3개가 꽂힌 소켓**이 분명히 보여야 한다(플레이어가 노리는 곳).
- `boss_volt_crank`는 몸속의 **녹슨 손 크랭크**가 주인공. 결말의 반전이다.
- `boss_volt_small`은 귀여운 손전등형 수동 발전기. 전기 효과 없이, 남작의 콧수염만 작게 남긴다.
- 무섭지 않게: 1930년대 카툰 악당, 거만하지만 우스꽝스럽게.

## 6. 끝나면

```
python tools/check_assets.py      # assets/STATUS.md 갱신
python tools/contact_sheet.py     # assets/sheets/_contact.png
```
1. ASSET_GUIDE 6절 체크리스트로 한 장씩 확인한다. 어긋난 파일만 다시 만든다.
2. `assets/PROMPT_LOG.md`에 한 줄씩: `날짜 | JOB-18 | 결과 파일 | 프롬프트 요약 | 합격/재생성`
3. 사람에게 보고: 만든 파일 수 / 다시 만든 파일과 이유 / STATUS.md에 남은 문제
4. `src/`, `index.html`, `GAME_DESIGN.md`, `assets/manifest.js`는 수정하지 않는다. 이름이나 크기를 바꿔야 할 것 같으면 사람에게 묻는다.
