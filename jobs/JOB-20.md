# JOB-20 — 라디오 씨 — 잡음 방송 / 변신 후 모습

> 사람이 **"JOB20 진행해"**라고 하면 이 파일을 처음부터 끝까지 따라 한다. 다른 JOB은 건드리지 않는다.

- 소속: 제5막 「볼트 남작」 (GAME_DESIGN.md 20절)
- 만들 파일: **6개**
- 먼저 끝나 있어야 하는 JOB: 없음 (바로 시작 가능)

## 1. 시작 전

1. `AGENTS.md`, `ASSET_GUIDE.md` 0~5절을 읽는다. 0절 절대 규칙은 이 JOB에도 그대로 적용된다.
2. 아래 레퍼런스 이미지를 열어 보고, 생성할 때마다 첨부한다.

   - `assets/refs/style_anchor.png`
   - `assets/refs/ref_02_character.jpg`
   - `assets/npc/npc_radio_idle.png (변신 전 기준)`
   - `assets/npc/npc_gramo_awake.png (나팔 모양 참고)`

## 2. 프롬프트 조립 순서

ASSET_GUIDE 1-2절 방식. 고정 블록은 **한 글자도 바꾸지 않고** 복사한다.

1. STYLE BLOCK
2. SPRITE RULES
3. RADIO (npc_radio_jam만)
4. RADIO REBORN (나머지)
5. 시트 구성 설명 (아래 3절)
6. 각 ID의 개별 프롬프트 (아래 4절 표의 prompt 값 그대로)

## 3. 만드는 방법

### 시트 `a` — 변신 전 잡음 방송 1개

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `npc_radio_jam`
- 원본 저장: `assets/sheets/JOB-20_a.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-20_a.png --names npc_radio_jam
```
- 잘린 개수가 1개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

### 시트 `b` — 변신 후 4자세 + 초상화

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `npc_radio_reborn_idle` → `npc_radio_reborn_talk` → `npc_radio_reborn_dance` → `npc_radio_reborn_broadcast` → `portrait_radio_reborn`
- 원본 저장: `assets/sheets/JOB-20_b.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-20_b.png --names npc_radio_reborn_idle,npc_radio_reborn_talk,npc_radio_reborn_dance,npc_radio_reborn_broadcast,portrait_radio_reborn
```
- 잘린 개수가 5개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

## 4. 파일 목록

| ID | 저장 경로 | 게임 안 크기 | 필수 | 설명 | prompt (⑤에 그대로) |
|---|---|---|---|---|---|
| `npc_radio_jam` | `assets/npc/npc_radio_jam.png` | 높이 140px | ● | 변신 전 라디오 씨: 안테나로 잡음 방송을 쏨(건전지, 회색) | RADIO in side view facing RIGHT, straining, antenna pointing forward and shooting jagged grey static waves, dial eyes as two glowing dots, battery-powered stiff body |
| `npc_radio_reborn_idle` | `assets/npc/npc_radio_reborn_idle.png` | 높이 140px | ● | 변신 후 라디오 씨 대기 | RADIO REBORN standing proud facing the viewer, gramophone horn speaker blooming from his head, brass wind-up key on his back, bouncy rubber hose limbs, warm smile |
| `npc_radio_reborn_talk` | `assets/npc/npc_radio_reborn_talk.png` | 높이 140px |  | 변신 후 말하기 | RADIO REBORN talking happily, one glove raised, horn speaker tilted, pie-cut eyes wide |
| `npc_radio_reborn_dance` | `assets/npc/npc_radio_reborn_dance.png` | 높이 140px |  | 변신 후 춤 | RADIO REBORN dancing on one leg, rubber hose arms waving, music notes popping from his horn speaker |
| `npc_radio_reborn_broadcast` | `assets/npc/npc_radio_reborn_broadcast.png` | 높이 140px | ● | 변신 후 음악 방송(보스전) | RADIO REBORN in side view facing RIGHT, legs planted wide, a big stream of music notes and warm golden sound rings blasting from his horn speaker |
| `portrait_radio_reborn` | `assets/portrait/portrait_radio_reborn.png` | 높이 200px |  | 대화 카드용 변신 후 라디오 씨 | close-up bust of RADIO REBORN with the horn speaker and pie-cut eyes, warm smile |

## 5. 이 JOB만의 규칙

- **변신 전과 후의 실루엣이 확 달라야 한다.** 뻣뻣한 회색 상자 → 머리 위로 피어난 나팔, 출렁이는 팔다리, 등의 황동 열쇠, 금 테두리.
- 변신 후 눈은 파이 눈. 다이얼 자리는 볼처럼 남겨도 좋다.
- `npc_radio_reborn_broadcast`와 `npc_radio_jam`은 오른쪽을 본다(아레나 왼쪽에 섬).

## 6. 끝나면

```
python tools/check_assets.py      # assets/STATUS.md 갱신
python tools/contact_sheet.py     # assets/sheets/_contact.png
```
1. ASSET_GUIDE 6절 체크리스트로 한 장씩 확인한다. 어긋난 파일만 다시 만든다.
2. `assets/PROMPT_LOG.md`에 한 줄씩: `날짜 | JOB-20 | 결과 파일 | 프롬프트 요약 | 합격/재생성`
3. 사람에게 보고: 만든 파일 수 / 다시 만든 파일과 이유 / STATUS.md에 남은 문제
4. `src/`, `index.html`, `GAME_DESIGN.md`, `assets/manifest.js`는 수정하지 않는다. 이름이나 크기를 바꿔야 할 것 같으면 사람에게 묻는다.
