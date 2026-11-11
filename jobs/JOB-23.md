# JOB-23 — 흑막 암시 컷신 2장 (볼트 남작·문지기 실루엣)

> 사람이 **"JOB23 진행해"**라고 하면 이 파일을 처음부터 끝까지 따라 한다. 다른 JOB은 건드리지 않는다.

- 소속: 제3막 (GAME_DESIGN.md 18절)
- 만들 파일: **2개**
- 먼저 끝나 있어야 하는 JOB: JOB-18, JOB-19 (결과 이미지를 레퍼런스로 씀. 없으면 사람에게 알리고 기다린다)

## 1. 시작 전

1. `AGENTS.md`, `ASSET_GUIDE.md` 0~5절을 읽는다. 0절 절대 규칙은 이 JOB에도 그대로 적용된다.
2. 아래 레퍼런스 이미지를 열어 보고, 생성할 때마다 첨부한다.

   - `assets/refs/style_anchor.png`
   - `assets/story/story_02_thief.png (1막 째깍 그림자 — 실루엣 연출 기준)`
   - JOB-18 결과 boss_volt_idle (실루엣 윤곽)
   - JOB-19 결과 boss_toad_idle (실루엣 윤곽)
   - `assets/road/bg_volt_arena.png (발전소 홀)`

## 2. 프롬프트 조립 순서

ASSET_GUIDE 1-2절 방식. 고정 블록은 **한 글자도 바꾸지 않고** 복사한다.

1. STYLE BLOCK
2. BACKGROUND RULES
3. 시트 구성 설명 (아래 3절)
4. 각 ID의 개별 프롬프트 (아래 4절 표의 prompt 값 그대로)

## 3. 만드는 방법

### 한 장씩 따로 만드는 것

16:9 한 장씩 생성해서 아래 경로에 **PNG로 바로 저장**한다(자르기 없음).

- `story_44_shadow_hall` → `assets/story/story_44_shadow_hall.png`
- `story_45_shadow_plan` → `assets/story/story_45_shadow_plan.png`

## 4. 파일 목록

| ID | 저장 경로 | 게임 안 크기 | 필수 | 설명 | prompt (⑤에 그대로) |
|---|---|---|---|---|---|
| `story_44_shadow_hall` | `assets/story/story_44_shadow_hall.png` | 1280×720 |  | 3막 흑막 1: 어두운 발전소 홀. 여러 마을에서 끌려온 빛나는 실이 거대한 그림자(볼트 남작 실루엣)의 가슴으로 빨려 듦. 앞쪽에 작은 두꺼비 실루엣 | a vast dark power plant hall at night seen from below, many glowing golden threads of light streaming in from small distant village silhouettes through tall windows and converging into the chest of a HUGE dark SILHOUETTE of a generator villain (round broad body, tall coil head with a few yellow sparks, long cable arms ending in plug shapes, curled wire moustache shape), only two glowing yellow eyes visible; in front of him a smaller squat SILHOUETTE of a toad-shaped fuse box with a lever on its head and two glowing eyes; no faces, no details, pure mysterious silhouettes against the glow, ominous but cartoonish |
| `story_45_shadow_plan` | `assets/story/story_45_shadow_plan.png` | 1280×720 |  | 3막 흑막 2: 그림자 남작이 건전지 하나를 치켜들고 설명, 탁자 위 지도의 마을들에 건전지 표시. 옆에서 두꺼비 그림자가 경례 | dramatic low-key close shot: the HUGE dark SILHOUETTE of the generator villain holding up a single grey battery between two plug-shaped fingers, a thin glowing golden thread being sucked from the battery into his chest, glowing yellow eyes and a sly crescent grin only; below him a table with a hand-drawn map of small villages, each village marked with a tiny battery shape (no text, no letters); the squat toad fuse-box SILHOUETTE saluting beside him with its lever up and glowing eyes; red light from below, everything else in deep shadow |

## 5. 이 JOB만의 규칙

- **정체를 보여 주지 않는다.** 볼트 남작과 두꺼비집 문지기는 **검은 실루엣 + 빛나는 노란 눈**만. 얼굴·색·디테일 금지. 5막에서 정체가 드러난다.
- 실루엣 윤곽은 JOB-18·19 결과와 같아야 한다(코일 머리, 플러그 팔, 콧수염 / 머리 위 레버, 넓적한 몸). 나중에 "아, 그 그림자가 이 녀석이었구나"가 되게.
- 남작 그림자는 크게, 문지기 그림자는 그 앞에 작게. 흑막이 둘이라는 게 한눈에 보이게.
- `story_44`: 빛나는 실(태엽 힘)이 그림자 가슴으로 빨려 드는 장면이 중심. `story_45`: 그림자가 건전지를 들어 보이고, 건전지에서 실이 빨려 나가는 모습 + 마을 지도의 건전지 표시.
- 화면 아래 30%는 자막 카드가 덮는다. 글자·숫자 금지(지도에도).

## 6. 끝나면

```
python tools/check_assets.py      # assets/STATUS.md 갱신
python tools/contact_sheet.py     # assets/sheets/_contact.png
```
1. ASSET_GUIDE 6절 체크리스트로 한 장씩 확인한다. 어긋난 파일만 다시 만든다.
2. `assets/PROMPT_LOG.md`에 한 줄씩: `날짜 | JOB-23 | 결과 파일 | 프롬프트 요약 | 합격/재생성`
3. 사람에게 보고: 만든 파일 수 / 다시 만든 파일과 이유 / STATUS.md에 남은 문제
4. `src/`, `index.html`, `GAME_DESIGN.md`, `assets/manifest.js`는 수정하지 않는다. 이름이나 크기를 바꿔야 할 것 같으면 사람에게 묻는다.
