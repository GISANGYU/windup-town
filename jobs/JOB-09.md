# JOB-9 — 제3막 라디오 씨

> 사람이 **"JOB9 진행해"**라고 하면 이 파일을 처음부터 끝까지 따라 한다. 다른 JOB은 건드리지 않는다.

- 소속: 제3막 「태엽 없는 손님」 (GAME_DESIGN.md 17절)
- 만들 파일: **6개**
- 먼저 끝나 있어야 하는 JOB: 없음 (바로 시작 가능)

## 1. 시작 전

1. `AGENTS.md`, `ASSET_GUIDE.md` 0~5절을 읽는다. 0절 절대 규칙은 이 JOB에도 그대로 적용된다.
2. 아래 레퍼런스 이미지를 열어 보고, 생성할 때마다 첨부한다.

   - `assets/refs/style_anchor.png`
   - `assets/refs/ref_02_character.jpg`
   - `assets/npc/npc_pip_awake.png (키 비교용)`

## 2. 프롬프트 조립 순서

ASSET_GUIDE 1-2절 방식. 고정 블록은 **한 글자도 바꾸지 않고** 복사한다.

1. STYLE BLOCK
2. SPRITE RULES
3. RADIO
4. 시트 구성 설명 (아래 3절)
5. 각 ID의 개별 프롬프트 (아래 4절 표의 prompt 값 그대로)

## 3. 만드는 방법

### 시트 `a` — 라디오 씨 4포즈 한 줄

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `npc_radio_idle` → `npc_radio_talk` → `npc_radio_off` → `npc_radio_crank`
- 원본 저장: `assets/sheets/JOB-9_a.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-9_a.png --names npc_radio_idle,npc_radio_talk,npc_radio_off,npc_radio_crank
```
- 잘린 개수가 4개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

### 시트 `b` — 초상화 2개 한 줄 (a 결과를 레퍼런스로 첨부)

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `portrait_radio` → `portrait_radio_crank`
- 원본 저장: `assets/sheets/JOB-9_b.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-9_b.png --names portrait_radio,portrait_radio_crank
```
- 잘린 개수가 2개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

## 4. 파일 목록

| ID | 저장 경로 | 게임 안 크기 | 필수 | 설명 | prompt (⑤에 그대로) |
|---|---|---|---|---|---|
| `npc_radio_idle` | `assets/npc/npc_radio_idle.png` | 높이 130px | ● | 라디오 씨 대기(건전지 상태). 영업용 미소, 한 손을 내밀어 소개하는 자세 | RADIO standing upright and stiff, friendly salesman smile, one white glove raised palm-up as if presenting a product, antenna perfectly straight, dial eyes showing two small glowing dot lights |
| `npc_radio_talk` | `assets/npc/npc_radio_talk.png` | 높이 130px |  | 라디오 씨 말하기. 두 팔 벌림, 스피커 입 크게 | RADIO talking excitedly like a TV salesman, speaker-grille mouth wide open, both arms spread wide, leaning forward, dial eyes as two glowing dots, three small curved sound lines near the speaker |
| `npc_radio_off` | `assets/npc/npc_radio_off.png` | 높이 130px | ● | 건전지가 다 닳아 꺼진 라디오 씨. 앞으로 고꾸라짐, 다이얼 눈이 비어 있음 | RADIO switched off and slumped forward, dial eyes dark and empty with no lights, antenna drooping down, arms hanging limp, colors slightly faded, sad and lifeless but still cartoonish |
| `npc_radio_crank` | `assets/npc/npc_radio_crank.png` | 높이 130px | ● | 크랭크를 단 태엽 라디오 씨. 다이얼 눈 안에 처음으로 파이 눈이 생김, 몸이 출렁임 | RADIO after getting a wind-up crank: a brass crank wheel with a knob attached to his right side, his two dial eyes now show pie-cut pupils for the first time, warm grateful smile, body bouncing in a rubber hose curve, antenna wiggling |
| `portrait_radio` | `assets/portrait/portrait_radio.png` | 높이 200px |  | 대화 카드용 라디오 씨(건전지, 영업 미소) | close-up bust of RADIO with a wide salesman smile, dial eyes as two glowing dot lights |
| `portrait_radio_crank` | `assets/portrait/portrait_radio_crank.png` | 높이 200px |  | 대화 카드용 태엽 라디오 씨(따뜻한 미소) | close-up bust of RADIO with the brass crank on his side, pie-cut pupils inside the dial eyes, gentle warm smile |

## 5. 이 JOB만의 규칙

- 라디오 씨는 마을에서 유일하게 **몸이 출렁이지 않는** 캐릭터다. 팔은 러버호스지만 자세는 곧고 뻣뻣하게.
- `idle`·`talk`의 눈은 다이얼 안의 **작은 불빛 점 두 개**(ASSET_GUIDE 5절 눈 규칙 예외). `off`는 불빛 없이 빈 다이얼.
- `crank`만 다이얼 안에 **파이 눈**이 생기고 몸이 출렁인다. 3막 결말의 핵심 변화이므로 차이가 분명해야 한다.
- 크랭크는 오른쪽 옆구리. `crank` 외 포즈에는 크랭크를 그리지 않는다.

## 6. 끝나면

```
python tools/check_assets.py      # assets/STATUS.md 갱신
python tools/contact_sheet.py     # assets/sheets/_contact.png
```
1. ASSET_GUIDE 6절 체크리스트로 한 장씩 확인한다. 어긋난 파일만 다시 만든다.
2. `assets/PROMPT_LOG.md`에 한 줄씩: `날짜 | JOB-9 | 결과 파일 | 프롬프트 요약 | 합격/재생성`
3. 사람에게 보고: 만든 파일 수 / 다시 만든 파일과 이유 / STATUS.md에 남은 문제
4. `src/`, `index.html`, `GAME_DESIGN.md`, `assets/manifest.js`는 수정하지 않는다. 이름이나 크기를 바꿔야 할 것 같으면 사람에게 묻는다.
