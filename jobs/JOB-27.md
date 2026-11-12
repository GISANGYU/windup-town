# JOB-27 — 6·7막 컷신 12장

> 사람이 **"JOB27 진행해"**라고 하면 이 파일을 처음부터 끝까지 따라 한다. 다른 JOB은 건드리지 않는다.

- 소속: 제6·7막 「오르골 여왕」 (GAME_DESIGN.md 22~24절)
- 만들 파일: **12개**
- 먼저 끝나 있어야 하는 JOB: JOB-24, JOB-25 (결과 이미지를 레퍼런스로 씀. 없으면 사람에게 알리고 기다린다)

## 1. 시작 전

1. `AGENTS.md`, `ASSET_GUIDE.md` 0~5절을 읽는다. 0절 절대 규칙은 이 JOB에도 그대로 적용된다.
2. 아래 레퍼런스 이미지를 열어 보고, 생성할 때마다 첨부한다.

   - `assets/refs/style_anchor.png`
   - `assets/refs/ref_01_carnival.jpg`
   - `assets/story/story_43_home.png (마을 결말 톤)`
   - JOB-24·25 결과 (멜로디·주민 모습 고정)
   - `assets/npc/npc_radio_reborn_idle.png`

## 2. 프롬프트 조립 순서

ASSET_GUIDE 1-2절 방식. 고정 블록은 **한 글자도 바꾸지 않고** 복사한다.

1. STYLE BLOCK
2. BACKGROUND RULES
3. 등장하는 캐릭터 블록 전부 (회상은 YOUNG GRAMO)
4. 시트 구성 설명 (아래 3절)
5. 각 ID의 개별 프롬프트 (아래 4절 표의 prompt 값 그대로)

## 3. 만드는 방법

### 한 장씩 따로 만드는 것

16:9 한 장씩 생성해서 아래 경로에 **PNG로 바로 저장**한다(자르기 없음).

- `story_50_parcel` → `assets/story/story_50_parcel.png`
- `story_51_orgel_scream` → `assets/story/story_51_orgel_scream.png`
- `story_52_flashback_stage` → `assets/story/story_52_flashback_stage.png`
- `story_53_flashback_gift` → `assets/story/story_53_flashback_gift.png`
- `story_54_hidden_voice` → `assets/story/story_54_hidden_voice.png`
- `story_55_waltz_signal` → `assets/story/story_55_waltz_signal.png`
- `story_56_orgel_town` → `assets/story/story_56_orgel_town.png`
- `story_57_ballroom` → `assets/story/story_57_ballroom.png`
- `story_58_memory_1` → `assets/story/story_58_memory_1.png`
- `story_59_memory_2` → `assets/story/story_59_memory_2.png`
- `story_60_melody_stops` → `assets/story/story_60_melody_stops.png`
- `story_61_duet` → `assets/story/story_61_duet.png`

## 4. 파일 목록

| ID | 저장 경로 | 게임 안 크기 | 필수 | 설명 | prompt (⑤에 그대로) |
|---|---|---|---|---|---|
| `story_50_parcel` | `assets/story/story_50_parcel.png` | 1280×720 |  | 6막 1: 평화로운 마을, 피프가 덜덜 떨리는 소포를 들고 옴 | peaceful morning village square, PIP the mailbox running in holding a small trembling parcel, GRAMO and RADIO REBORN on the bandstand turning to look, BOGLE curious |
| `story_51_orgel_scream` | `assets/story/story_51_orgel_scream.png` | 1280×720 |  | 6막 2: 소포 속 오르골이 비명 지르듯 미친 듯 돌고 모두 귀를 막음 | the parcel torn open on the ground, the old music box screeching and spinning madly with shrill sound lines, PIP, BOGLE and RADIO covering their ears, GRAMO staring in recognition |
| `story_52_flashback_stage` | `assets/story/story_52_flashback_stage.png` | 1280×720 |  | 6막 3: 회상(세피아). 젊은 그라모와 멜로디의 무대 듀엣 | sepia flashback with film grain: a small old theater stage, YOUNG GRAMO playing music proudly and MELODY QUEEN dancing on her music box beside him, a small happy audience, warm spotlight |
| `story_53_flashback_gift` | `assets/story/story_53_flashback_gift.png` | 1280×720 |  | 6막 4: 회상(세피아). 헤어지는 날 멜로디가 오르골을 건넴 | sepia flashback: a train platform at dusk, MELODY QUEEN handing YOUNG GRAMO a small wooden music box, both sad but smiling, steam from the train |
| `story_54_hidden_voice` | `assets/story/story_54_hidden_voice.png` | 1280×720 |  | 6막 5: 풀린 오르골에서 흐르는 멜로디의 목소리, 듣는 그라모 | the calm open music box on a table glowing softly, a faint ghostly image of MELODY QUEEN's face in the music notes rising from it, GRAMO listening with a sad face, BOGLE beside him |
| `story_55_waltz_signal` | `assets/story/story_55_waltz_signal.png` | 1280×720 |  | 6막 끝: 라디오 씨가 잡은 끝없이 빨라지는 왈츠, 출발 | RADIO REBORN with his antenna and horn catching frantic spiraling pink music waves from the horizon where a distant music box palace stands, BOGLE ready to leave, GRAMO giving a nod |
| `story_56_orgel_town` | `assets/story/story_56_orgel_town.png` | 1280×720 |  | 7막 1: 쉬지 못하고 춤추는 오르골 마을 | a pastel music box town where everyone dances nonstop with dizzy spiral eyes: tin soldiers kicking, wind-up birds hopping, spinning-top ladies whirling, some springs about to snap, BOGLE and RADIO arriving in shock |
| `story_57_ballroom` | `assets/story/story_57_ballroom.png` | 1280×720 |  | 7막 2: 무도회장 꼭대기, 거대한 오르골 위의 멜로디 여왕 | a grand music box ballroom, on top of a giant open music box MELODY QUEEN spinning endlessly on tiptoe with dizzy eyes, her back key glowing from being overwound, BOGLE small at the bottom |
| `story_58_memory_1` | `assets/story/story_58_memory_1.png` | 1280×720 |  | 7막 기억 1(세피아, 짧게): 무대 위 첫 인사 | sepia memory fragment: YOUNG GRAMO and MELODY QUEEN bowing together on a stage, flowers thrown, soft vignette edges |
| `story_59_memory_2` | `assets/story/story_59_memory_2.png` | 1280×720 |  | 7막 기억 2(세피아, 짧게): 멈춘 오르골 앞에서 우는 어린 멜로디 | sepia memory fragment: a small young MELODY on a still music box whose music has stopped, alone in a dark room, crying, explaining her fear of stopping |
| `story_60_melody_stops` | `assets/story/story_60_melody_stops.png` | 1280×720 |  | 7막 끝: 처음으로 천천히 멈추는 멜로디, 쉬기 시작하는 마을 | MELODY QUEEN slowly coming to rest on her music box with a peaceful face for the first time, RADIO REBORN broadcasting slow golden music notes, the dancers of the town sitting down to rest all around, BOGLE smiling |
| `story_61_duet` | `assets/story/story_61_duet.png` | 1280×720 |  | 결말: 마을 무대에서 그라모와 멜로디의 듀엣, 라디오 씨 방송 | warm evening village square, GRAMO and MELODY QUEEN performing a duet on the bandstand, RADIO REBORN broadcasting beside them, PIP, LAMP, BOGLE and the small dynamo dancing, lanterns |

## 5. 이 JOB만의 규칙

- 화면 아래 30%는 자막 카드가 덮는다. 글자 금지.
- **회상**(`story_52`·`53`·`58`·`59`)은 세피아 + 필름 질감 + 둥근 비네팅. 젊은 그라모는 YOUNG GRAMO 블록.
- 그라모는 3막 뒤라 **등 열쇠가 2개**(회상 속 젊은 그라모는 3개).
- 라디오 씨는 변신 후 모습(RADIO REBORN).
- `story_60_melody_stops`가 7막의 하이라이트: 처음으로 쉬는 멜로디의 평온한 얼굴.

## 6. 끝나면

```
python tools/check_assets.py      # assets/STATUS.md 갱신
python tools/contact_sheet.py     # assets/sheets/_contact.png
```
1. ASSET_GUIDE 6절 체크리스트로 한 장씩 확인한다. 어긋난 파일만 다시 만든다.
2. `assets/PROMPT_LOG.md`에 한 줄씩: `날짜 | JOB-27 | 결과 파일 | 프롬프트 요약 | 합격/재생성`
3. 사람에게 보고: 만든 파일 수 / 다시 만든 파일과 이유 / STATUS.md에 남은 문제
4. `src/`, `index.html`, `GAME_DESIGN.md`, `assets/manifest.js`는 수정하지 않는다. 이름이나 크기를 바꿔야 할 것 같으면 사람에게 묻는다.
