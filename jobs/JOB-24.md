# JOB-24 — 멜로디 여왕 (7막 보스)

> 사람이 **"JOB24 진행해"**라고 하면 이 파일을 처음부터 끝까지 따라 한다. 다른 JOB은 건드리지 않는다.

- 소속: 제6·7막 「오르골 여왕」 (GAME_DESIGN.md 22~24절)
- 만들 파일: **10개**
- 먼저 끝나 있어야 하는 JOB: 없음 (바로 시작 가능)

## 1. 시작 전

1. `AGENTS.md`, `ASSET_GUIDE.md` 0~5절을 읽는다. 0절 절대 규칙은 이 JOB에도 그대로 적용된다.
2. 아래 레퍼런스 이미지를 열어 보고, 생성할 때마다 첨부한다.

   - `assets/refs/style_anchor.png`
   - `assets/refs/ref_02_character.jpg`
   - `assets/boss/boss_volt_idle.png (보스 크기감)`

## 2. 프롬프트 조립 순서

ASSET_GUIDE 1-2절 방식. 고정 블록은 **한 글자도 바꾸지 않고** 복사한다.

1. STYLE BLOCK
2. SPRITE RULES
3. SIDE-SCROLL RULES
4. MELODY QUEEN
5. 시트 구성 설명 (아래 3절)
6. 각 ID의 개별 프롬프트 (아래 4절 표의 prompt 값 그대로)

## 3. 만드는 방법

### 시트 `a` — 공격 자세 4개 한 줄 (모두 왼쪽 보기)

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `boss_melody_idle` → `boss_melody_wave` → `boss_melody_spin` → `boss_melody_rain`
- 원본 저장: `assets/sheets/JOB-24_a.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-24_a.png --names boss_melody_idle,boss_melody_wave,boss_melody_spin,boss_melody_rain
```
- 잘린 개수가 4개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

### 시트 `b` — 삐걱·풀림·쉼 3개 한 줄

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `boss_melody_creak` → `boss_melody_unwind` → `boss_melody_calm`
- 원본 저장: `assets/sheets/JOB-24_b.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-24_b.png --names boss_melody_creak,boss_melody_unwind,boss_melody_calm
```
- 잘린 개수가 3개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

### 시트 `c` — 마을용 정면 1 + 초상화 2

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `npc_melody` → `portrait_melody_wild` → `portrait_melody_calm`
- 원본 저장: `assets/sheets/JOB-24_c.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-24_c.png --names npc_melody,portrait_melody_wild,portrait_melody_calm
```
- 잘린 개수가 3개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

## 4. 파일 목록

| ID | 저장 경로 | 게임 안 크기 | 필수 | 설명 | prompt (⑤에 그대로) |
|---|---|---|---|---|---|
| `boss_melody_idle` | `assets/boss/boss_melody_idle.png` | 높이 260px | ● | 멜로디 여왕 대기: 오르골 상자 위에서 발끝으로 떨며 회전(너무 감김) | MELODY QUEEN standing on her music box stage facing LEFT, on tiptoe, trembling, spiral dizzy eyes, a forced wide smile, her big silver wind-up key on her back wound so tight it glows |
| `boss_melody_wave` | `assets/boss/boss_melody_wave.png` | 높이 260px | ● | 과감기 선율: 두 팔을 펼쳐 음악 파동을 내보냄 | MELODY QUEEN facing LEFT with both arms flung wide, a powerful ring of music notes and sound waves bursting from her, the music box lid open behind her, eyes spinning |
| `boss_melody_spin` | `assets/boss/boss_melody_spin.png` | 높이 260px | ● | 회전 발레: 팽이처럼 빠르게 회전 | MELODY QUEEN spinning extremely fast like a top facing LEFT, her tutu a blur, a small whirlwind of sharp music notes around her feet |
| `boss_melody_rain` | `assets/boss/boss_melody_rain.png` | 높이 260px | ● | 빗살 비: 두 팔을 치켜들어 오르골 빗살을 불러 내림 | MELODY QUEEN facing LEFT raising both arms to the sky, metal music box comb teeth falling from above, her face strained |
| `boss_melody_creak` | `assets/boss/boss_melody_creak.png` | 높이 260px | ● | 삐걱: 너무 감겨 굳음, 등 열쇠가 분명히 보임 | MELODY QUEEN frozen mid-pose facing LEFT, stiff and trembling, small cracks of strain lines and steam puffs, her big silver wind-up key on her back clearly visible on the right side, painful but cartoonish |
| `boss_melody_unwind` | `assets/boss/boss_melody_unwind.png` | 높이 260px |  | 풀리는 중: 몸의 떨림이 가라앉고 눈이 돌아옴 | MELODY QUEEN facing LEFT slowly relaxing as her back key turns backward, arms lowering gently, the spiral in her eyes fading, a tear of relief |
| `boss_melody_calm` | `assets/boss/boss_melody_calm.png` | 높이 260px | ● | 결말: 상자 가장자리에 앉아 쉬는 멜로디(파이 눈, 온화) | MELODY QUEEN sitting calmly on the edge of her music box facing LEFT, legs dangling, normal pie-cut eyes, a soft tired smile, hands on her knees |
| `npc_melody` | `assets/npc/npc_melody.png` | 높이 140px |  | 마을 결말용 멜로디(정면, 그라모 옆 듀엣) | MELODY QUEEN standing gracefully facing the viewer on a small music box, one arm raised in a gentle ballet pose, calm pie-cut eyes, warm smile |
| `portrait_melody_wild` | `assets/portrait/portrait_melody_wild.png` | 높이 200px |  | 대화 카드용 멜로디(과감기, 눈이 핑핑) | close-up bust of MELODY QUEEN with spiral dizzy eyes, a forced smile, trembling |
| `portrait_melody_calm` | `assets/portrait/portrait_melody_calm.png` | 높이 200px |  | 대화 카드용 멜로디(온화) | close-up bust of MELODY QUEEN calm, soft pie-cut eyes, gentle smile |

## 5. 이 JOB만의 규칙

- 보스 자세는 모두 **왼쪽**을 본다(아레나 오른쪽에 섬). `npc_melody`만 정면.
- 공격·삐걱 자세는 **너무 감긴 상태**: 나선 눈, 떨림 선, 억지 미소. `unwind`에서 풀려 가고, `calm`과 `npc_melody`에서 처음으로 **파이 눈**이 된다. 이 변화가 7막의 결말이다.
- `boss_melody_creak`은 등의 **은색 큰 열쇠**가 오른쪽에 분명히 보여야 한다(플레이어가 풀어 주는 곳).
- 악당이 아니라 두려움에 사로잡힌 인물. 무섭지 않게, 안쓰럽고 우아하게.

## 6. 끝나면

```
python tools/check_assets.py      # assets/STATUS.md 갱신
python tools/contact_sheet.py     # assets/sheets/_contact.png
```
1. ASSET_GUIDE 6절 체크리스트로 한 장씩 확인한다. 어긋난 파일만 다시 만든다.
2. `assets/PROMPT_LOG.md`에 한 줄씩: `날짜 | JOB-24 | 결과 파일 | 프롬프트 요약 | 합격/재생성`
3. 사람에게 보고: 만든 파일 수 / 다시 만든 파일과 이유 / STATUS.md에 남은 문제
4. `src/`, `index.html`, `GAME_DESIGN.md`, `assets/manifest.js`는 수정하지 않는다. 이름이나 크기를 바꿔야 할 것 같으면 사람에게 묻는다.
