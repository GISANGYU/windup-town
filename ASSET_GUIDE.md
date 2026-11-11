# 태엽 마을 — 이미지 리소스 제작 기준 (Codex 작업 지시)

이 문서는 이미지 생성 작업을 **몇 개를 동시에 돌려도 같은 스타일이 나오게** 하기 위한 기준이다.
게임 코드는 이미 이 파일 이름들을 기다리고 있다. 이름과 경로만 맞으면 게임에 바로 반영된다.

- 리소스 목록의 단일 기준: `assets/manifest.js` (ID, 경로, 게임 안 크기, 개별 프롬프트)
- 스타일 레퍼런스: `assets/refs/`
- 게임 기획: `GAME_DESIGN.md`

---

## 0. 절대 규칙 (모든 작업 공통)
1. **이미지를 생성할 때마다** `assets/refs/style_anchor.png`(만들어진 뒤부터)와 `assets/refs/ref_02_character.jpg`를 레퍼런스로 첨부한다. 첨부할 수 없는 환경이면 작업 전에 두 이미지를 열어 보고 시작한다.
2. 프롬프트의 스타일 부분은 아래 **STYLE BLOCK**과 **CHARACTER BLOCK**을 한 글자도 바꾸지 않고 붙인다. 요약하거나 다른 말로 바꾸지 않는다.
3. 파일 이름과 경로는 `manifest.js`의 `file` 값 그대로 쓴다. 새 ID를 만들거나 이름을 바꾸지 않는다. 필요하면 사람에게 먼저 묻는다.
4. 이미지 안에 글자, 숫자, 로고를 넣지 않는다. 예외는 `ui_key_e`의 E 한 글자뿐이다. 텍스트는 게임 코드가 그린다.
5. 바닥 그림자를 그리지 않는다. 그림자는 게임이 그린다.
6. 스프라이트는 **투명 배경 PNG**로 저장한다. 투명 배경을 만들 수 없으면 **단색 마젠타 `#FF00FF`** 배경으로 만든다. 게임과 도구가 자동으로 지운다.
7. 레퍼런스는 **그리는 방식만** 가져온다. 레퍼런스 게임의 캐릭터, 컵 모양 머리, 로고, 특정 장면을 따라 그리지 않는다.
8. 생성할 때마다 `assets/PROMPT_LOG.md`에 한 줄씩 남긴다: `날짜 | JOB | 결과 파일 | 사용한 프롬프트 요약 | 합격/재생성`

---

## 1. 동시 생성에서 스타일을 맞추는 방법

### 1-1. 스타일 앵커를 먼저 1장 만든다 (JOB-0, 단독 실행)
병렬 작업을 시작하기 전에 **기준 이미지 1장**을 만들고 사람이 승인한다. 이후 모든 작업이 이 이미지를 첨부한다. 첨부 이미지가 같으면 따로 돌려도 선 굵기, 눈 모양, 색이 크게 벗어나지 않는다.

- 저장: `assets/refs/style_anchor.png`
- 내용(왼쪽→오른쪽 한 줄): 보글 정면, 보글 옆(오른쪽 보기), 그라모 졸림, 그라모 깨어남, 피프 깨어남, 둥근 나무, 태엽 열쇠
- 그 아래 줄: 팔레트 색 원 10개 (2장의 색, 글자 없이)
- 승인 전에는 다른 JOB을 시작하지 않는다. 승인 후 이 파일을 덮어쓰지 않는다.

### 1-2. 프롬프트를 조립식으로 만든다
모든 프롬프트는 이 순서로 붙인다. 바뀌는 부분은 ④⑤뿐이다.
```
① STYLE BLOCK          (고정)
② SPRITE RULES 또는 BACKGROUND RULES (고정)
③ 해당 CHARACTER BLOCK (고정, 캐릭터가 나올 때만)
④ 시트 구성 설명         (JOB마다 다름)
⑤ manifest.js의 각 ID별 prompt 값 (그대로 복사)
```

### 1-3. 같은 묶음은 한 장의 시트로 만든다
보글의 7가지 포즈를 7번 따로 만들면 7번 다르게 나온다. **한 번의 생성에 여러 포즈를 한 장으로** 그리게 하고, 도구로 잘라서 개별 파일로 저장한다.
- 시트는 마젠타 배경, 포즈 사이 간격을 넉넉하게, 한 줄 또는 2줄 격자
- 원본 시트 저장: `assets/sheets/JOB-1_a.png` 처럼 JOB 이름으로
- 자르기: `python tools/slice_sheet.py assets/sheets/JOB-1_a.png --names player_idle_down,player_idle_up,...` (읽는 순서: 위 줄 왼쪽→오른쪽, 다음 줄)
- 자른 결과가 이름 수와 맞지 않으면 다시 자르기 옵션을 조정하거나 시트를 다시 만든다

### 1-4. 병렬 작업 분배 (JOB-0 승인 후 동시에 실행)
| JOB | 묶음 | 시트 구성 | 첨부 레퍼런스 |
|---|---|---|---|
| JOB-1 | 주인공 보글 | a: 대기 3방향 + 점프 2 + 손 뻗기 + 기쁨 (7개) / b: 걷기 6프레임 | anchor, ref_02 |
| JOB-2 | NPC | a: 그라모 졸림·깨어남·춤2 / b: 피프 졸림·깨어남·춤2 / c: 가로등 꺼짐·켜짐 | anchor, ref_02, ref_01 |
| JOB-3 | 초상화 | 5개 한 줄 (그라모 2, 피프 2, 보글 1) | anchor, ref_02, JOB-2 결과 |
| JOB-4 | 소품 | a: 집, 나무 2, 덤불, 돌, 열쇠 / b: 울타리 / c: 연못, 무대 (위에서 본 시점) | anchor, ref_01, ref_03 |
| JOB-5 | 가구 + 이펙트 + UI | a: 가구 4개 / b: 이펙트 5개 / c: UI 2개 | anchor, ref_02 |
| JOB-6 | 배경 | 3장 각각 따로 (시트 아님) | anchor, ref_04, ref_03 |
| JOB-8 | 제2막 보스 (추가) | a: 백작 포즈 6개(idle, slam, throw, bell, tired, hurt) 한 장 / b: 뻐꾸기시계 + 초상화 2 + 가구 뻐꾸기시계 / c: 이펙트 4개(톱니, 스프링, 김, 종소리) / 배경·컷신·감기 모달은 각각 따로 | anchor, ref_02, ref_01, 완성된 npc_gramo_awake |
| JOB-7 | 컷신 + 감기 모달 (추가) | 컷신 5장 각각 따로(16:9, BACKGROUND RULES) / 감기 모달 2개는 마젠타 시트 1장 | anchor, ref_01, ref_03, 완성된 bg_town_ground |

- 초상화(JOB-3)는 NPC(JOB-2) 결과를 레퍼런스로 써야 해서 JOB-2가 끝난 뒤 시작한다. 나머지 5개는 동시에 돌려도 된다.
- 한 JOB 안에서는 순서대로 진행한다.
- JOB-7 컷신 규칙: 화면 아래 30%는 자막 카드가 덮으므로 중요한 얼굴을 두지 않는다. 악당(째깍 백작)은 아직 디자인 확정 전이라 **실루엣과 노란 눈만** 그린다. 컷신 이미지에도 글자를 넣지 않는다.
- JOB-8 규칙: 백작은 COUNT TICK-TOCK 블록 그대로. `boss_tired`는 **등의 태엽 열쇠가 오른쪽에 분명히 보여야** 한다(플레이어가 그 열쇠를 노림). `fx_gear`는 굴러가며 회전하므로 정면·원형으로. `bg_arena`의 무대 바닥은 비워 둔다.
- `wind_key`는 화면에서 빙글빙글 돌아가므로 정면, 수직, 좌우 대칭으로 그린다. `wind_gramo_back`은 열쇠 구멍이 정확히 가운데에 오게 하고 열쇠는 그리지 않는다.

### 1-5. 검수
JOB마다 끝나면:
1. `python tools/check_assets.py` → 이름, 경로, 투명도, 비율 검사. 결과는 `assets/STATUS.md`
2. `python tools/contact_sheet.py` → `assets/sheets/_contact.png`에 전체 이미지를 한 장으로 모음
3. 아래 **6. 검수 체크리스트**와 style_anchor를 나란히 놓고 비교한다. 하나라도 어긋나면 그 파일만 다시 만든다.

---

## 2. STYLE BLOCK (그대로 붙일 것)
```
STYLE: 1930s rubber hose cartoon, hand-inked cel animation look, original characters.
Thick uniform outline in dark plum #3D3346 on every shape, clean confident lines, no sketchy strokes.
Flat cel colors with at most one soft shade tone per color, no gradients on characters, no 3D rendering, no glossy plastic look; one small white highlight dot is allowed.
Characters: bendy rubber hose arms and legs with no elbows or knees, white four-finger cartoon gloves, big round shoes, pie-cut eyes (black ovals with a small wedge cut out), simple wide mouth, big head-to-body ratio.
Character colors are saturated: red #D2463C, blue #3E6DB5, yellow #F2C14E, cream #F4E6C8, glove white #FBF6EA.
Backgrounds and large props look like faded watercolor on paper in beige #CFAC8D, sand #D7BE97, dusty navy #4E546E, muted olive #8A9A6B, warm grey #907F77, and are LESS saturated than the characters.
Soft light from the top-left. No cast shadow on the ground. No text, letters or numbers anywhere.
Do not copy any existing cartoon or game character, logo, or scene.
```

## 3. 고정 규칙 블록
**SPRITE RULES** (캐릭터, 소품, 가구, 이펙트, UI, 초상화)
```
Each item isolated on a flat solid #FF00FF magenta background (or transparent), full figure visible, nothing cropped, wide empty margin around every item, no ground line, no floor, no frame, no border, no shadow under the item.
Characters face the viewer at a slight high 3/4 angle unless a direction is given. "Side" always means facing RIGHT.
```
**BACKGROUND RULES** (bg_*)
```
Fill the whole 16:9 canvas edge to edge, no border, no vignette (the game adds its own), no characters, no text.
```

## 4. 팔레트
| 용도 | 색 |
|---|---|
| 외곽선 (모든 그림) | `#3D3346` |
| 캐릭터 빨강 | `#D2463C` |
| 캐릭터 파랑 | `#3E6DB5` |
| 캐릭터 노랑·황동 | `#F2C14E` |
| 크림 | `#F4E6C8` |
| 장갑·눈 흰색 | `#FBF6EA` |
| 그라모 나무색 | `#8B4A2F` |
| 배경 베이지 | `#CFAC8D` |
| 배경 모래 | `#D7BE97` |
| 배경 남색 | `#4E546E` |
| 배경 올리브 | `#8A9A6B` |
| 배경 웜그레이 | `#907F77` |
| 마젠타 (지울 배경) | `#FF00FF` — 그림 안에서는 절대 쓰지 않음 |

## 5. CHARACTER BLOCK (그대로 붙일 것)
**BOGLE (주인공)**
```
BOGLE: a small round porcelain TEAPOT whose whole body IS the teapot (no human torso, no head sitting on a body).
Cream-white body #FBF6EA with one blue band #3E6DB5 around the middle and a row of small blue dots on the band.
Red #D2463C lid knob on top like a tiny hat. Short spout on the front-right, curved handle on the back.
Face on the front of the teapot: two big pie-cut eyes, rosy cheeks, wide friendly smile.
Two short rubber hose legs with big red round shoes, two rubber hose arms with white gloves coming out of the sides.
Proportions: teapot body 70% of total height, legs 30%.
```
**GRAMO (축음기 할아버지)**
```
GRAMO: an old wooden gramophone, grandfather character.
Square cabinet body in reddish-brown wood #8B4A2F with cream #F4E6C8 trim; the cabinet front is his face with pie-cut eyes and a white bushy moustache.
A big brass flower-shaped horn #F2C14E rises from the top like a hat. A wind-up crank handle sticks out of his right side.
Short rubber hose legs with black round shoes, rubber hose arms with white gloves.
```
**PIP (우체통)**
```
PIP: a cheerful young red mailbox #D2463C with a rounded top, standing on one short post that splits into two rubber hose legs with blue #3E6DB5 round shoes.
The mail slot is the mouth, pie-cut eyes above it, a small blue flag on the right side, rubber hose arms with white gloves.
```
**COUNT TICK-TOCK (째깍 백작, 제2막 보스)**
```
COUNT TICK-TOCK: a big villainous ALARM CLOCK, the body is one round clock: dark navy metal #3B4A6B case with a brass #C99A3A rim.
The clock face is his face: cream dial with 12 dot marks, two pie-cut eyes, the hour and minute HANDS form his angry eyebrows, a monocle on his left eye, a thin sly mouth.
Two brass alarm bells on top of his head like horns. Very long thin rubber hose arms with white gloves, long thin black legs with white spats and black shoes.
Tall and lanky, about twice BOGLE's height. Menacing but funny, never scary-gory.
```
**LAMP (가로등, 선택)**
```
LAMP: a thin dark plum iron street lamp with a curved neck; the glass lantern is the head with two pie-cut eyes. When on, the glass glows warm yellow #F2C14E.
```

---

## 6. 검수 체크리스트
- [ ] 외곽선이 `#3D3346` 계열이고 굵기가 다른 이미지와 비슷하다 (순수 검정 X)
- [ ] 눈이 파이 모양이다 (점 눈, 애니 눈 X)
- [ ] 팔다리에 관절이 없다
- [ ] 캐릭터 색은 진하고, 배경·큰 소품은 바랜 수채 톤이다
- [ ] 바닥 그림자, 글자, 테두리가 없다
- [ ] 배경이 투명하거나 순수 마젠타다 (마젠타 안에 다른 색 얼룩 X)
- [ ] 옆모습은 오른쪽을 본다
- [ ] 보글은 주전자 자체가 몸이다
- [ ] 집 문이 아래 가운데에 있다
- [ ] style_anchor와 나란히 놓았을 때 같은 작품으로 보인다

## 7. 파일 규칙
- 형식: PNG (RGBA). 배경 이미지도 PNG로 통일
- 크기: 자유. 게임이 투명 여백을 잘라내고 manifest의 `h`에 맞춘다. 단 캐릭터 한 명이 최소 300px 높이는 되게 한다
- 배경(`bg_*`): 16:9 비율. 게임이 1280×720에 맞춰 늘린다. `bg_town_backdrop`만 1280×200 비율
- 이름: 소문자 + 밑줄. `그룹_대상_상태_방향_번호` 순서
  - 방향: `down`(정면) `up`(뒷모습) `side`(오른쪽 보기)
  - 상태: `idle` `walk` `jump` `interact` `happy` / NPC는 `sleepy` `awake` / 가로등은 `off` `on`
  - 프레임 번호: `_01` `_02` (두 자리)
- 같은 이름으로 덮어쓰면 게임이 2초 안에 새 이미지를 불러온다(새로고침 불필요). `F8`을 누르면 즉시 다시 불러온다

## 8. 전체 목록
`req = 필수`는 게임이 완성돼 보이는 데 필요한 것. `선택`은 없으면 다른 이미지나 코드 애니메이션으로 대신한다.
필수부터 만든다.

<!--ASSET_TABLE-->
| 그룹 | ID (파일명) | 필수 | 게임 안 크기 | 시점 | 설명 |
|---|---|---|---|---|---|
| 배경 | `bg/bg_town_ground.png` | 필수 | 1280×720 | top34 | 마을 바닥 전체. 오브젝트 없이 잔디·흙 질감만 |
| 배경 | `bg/bg_town_backdrop.png` | 선택 | 1280×200 | front34 | 화면 맨 위 띠. 무대 배경막처럼 그린 먼 숲·언덕 실루엣 |
| 배경 | `bg/bg_house_room.png` | 필수 | 1280×720 | front34 | 집 내부. 위쪽 1/3 벽(창문·액자), 아래 2/3 나무 바닥. 가구 없음 |
| 주인공 | `player/player_idle_down.png` | 필수 | 높이 110px | front34 | 보글 정면 대기 |
| 주인공 | `player/player_idle_up.png` | 필수 | 높이 110px | front34 | 보글 뒷모습 대기 |
| 주인공 | `player/player_idle_side.png` | 필수 | 높이 110px | front34 | 보글 옆모습 대기(오른쪽을 봄). 왼쪽은 코드가 뒤집음 |
| 주인공 | `player/player_walk_down_01.png` | 선택 | 높이 110px | front34 | 정면 걷기 1 (왼발 앞) |
| 주인공 | `player/player_walk_down_02.png` | 선택 | 높이 110px | front34 | 정면 걷기 2 (오른발 앞) |
| 주인공 | `player/player_walk_up_01.png` | 선택 | 높이 110px | front34 | 뒷모습 걷기 1 |
| 주인공 | `player/player_walk_up_02.png` | 선택 | 높이 110px | front34 | 뒷모습 걷기 2 |
| 주인공 | `player/player_walk_side_01.png` | 선택 | 높이 110px | front34 | 옆 걷기 1 (오른쪽 이동) |
| 주인공 | `player/player_walk_side_02.png` | 선택 | 높이 110px | front34 | 옆 걷기 2 (오른쪽 이동) |
| 주인공 | `player/player_jump.png` | 필수 | 높이 110px | front34 | 점프(공중). 정면 |
| 주인공 | `player/player_jump_side.png` | 선택 | 높이 110px | front34 | 점프(공중). 옆(오른쪽) |
| 주인공 | `player/player_interact.png` | 선택 | 높이 110px | front34 | E를 눌렀을 때 손 뻗기(줍기·말 걸기) |
| 주인공 | `player/player_happy.png` | 선택 | 높이 110px | front34 | 열쇠 획득·퀘스트 완료 기쁨 포즈 |
| NPC | `npc/npc_gramo_sleepy.png` | 필수 | 높이 160px | front34 | 그라모 영감 — 태엽 풀림. 처진 나팔, 반쯤 감은 눈 |
| NPC | `npc/npc_gramo_awake.png` | 필수 | 높이 160px | front34 | 그라모 영감 — 태엽 감김. 나팔 활짝, 파이 눈 크게 |
| NPC | `npc/npc_gramo_awake_02.png` | 선택 | 높이 160px | front34 | 그라모 춤 2번째 동작 |
| NPC | `npc/npc_pip_sleepy.png` | 필수 | 높이 120px | front34 | 피프(우체통) — 졸림. 깃발 내려감 |
| NPC | `npc/npc_pip_awake.png` | 필수 | 높이 120px | front34 | 피프 — 활기. 깃발 올라감 |
| NPC | `npc/npc_pip_awake_02.png` | 선택 | 높이 120px | front34 | 피프 춤 2번째 동작 |
| NPC | `npc/npc_lamp_off.png` | 선택 | 높이 200px | front34 | 가로등 — 꺼짐(선택 NPC) |
| NPC | `npc/npc_lamp_on.png` | 선택 | 높이 200px | front34 | 가로등 — 켜짐 |
| 초상화 | `portrait/portrait_gramo_sleepy.png` | 선택 | 높이 200px | front34 | 대화 카드용 그라모 얼굴(졸림) |
| 초상화 | `portrait/portrait_gramo_awake.png` | 선택 | 높이 200px | front34 | 대화 카드용 그라모 얼굴(깨어남) |
| 초상화 | `portrait/portrait_pip_sleepy.png` | 선택 | 높이 200px | front34 | 대화 카드용 피프(졸림) |
| 초상화 | `portrait/portrait_pip_awake.png` | 선택 | 높이 200px | front34 | 대화 카드용 피프(활기) |
| 초상화 | `portrait/portrait_bogle.png` | 선택 | 높이 200px | front34 | 대화 카드용 보글 |
| 소품 | `props/prop_house.png` | 필수 | 높이 260px | front34 | 보글의 집 외관. 문은 반드시 아래 가운데 |
| 소품 | `props/prop_tree_round.png` | 필수 | 높이 190px | front34 | 둥근 나무 |
| 소품 | `props/prop_tree_tall.png` | 필수 | 높이 230px | front34 | 키 큰 나무 |
| 소품 | `props/prop_bush.png` | 필수 | 높이 56px | front34 | 낮은 덤불(점프로 넘을 수 있음) |
| 소품 | `props/prop_rock.png` | 선택 | 높이 44px | front34 | 낮은 돌(점프로 넘을 수 있음) |
| 소품 | `props/prop_fence.png` | 필수 | 높이 70px | front34 | 울타리 한 칸(가로 약 120px로 쓰임). 좌우 끝이 이어지게 |
| 소품 | `props/prop_pond.png` | 필수 | 높이 170px | top34 | 연못(바닥형). 가로로 긴 타원 |
| 소품 | `props/prop_stage.png` | 필수 | 높이 150px | top34 | 광장 원형 무대(바닥형). 그라모가 올라섬 |
| 소품 | `props/prop_key.png` | 필수 | 높이 44px | front34 | 태엽 열쇠(줍는 아이템) |
| 가구 | `furniture/furn_chair.png` | 필수 | 높이 110px | front34 | 의자 |
| 가구 | `furniture/furn_table.png` | 필수 | 높이 95px | front34 | 테이블 |
| 가구 | `furniture/furn_plant.png` | 선택 | 높이 115px | front34 | 화분 |
| 가구 | `furniture/furn_gramophone_mini.png` | 필수 | 높이 120px | front34 | 미니 축음기(퀘스트 보상) |
| 이펙트 | `fx/fx_note_01.png` | 선택 | 높이 40px | front34 | 음표 1 |
| 이펙트 | `fx/fx_note_02.png` | 선택 | 높이 40px | front34 | 음표 2 |
| 이펙트 | `fx/fx_zzz.png` | 선택 | 높이 40px | front34 | 졸음 표시 |
| 이펙트 | `fx/fx_sparkle.png` | 선택 | 높이 48px | front34 | 반짝임(열쇠·획득) |
| 이펙트 | `fx/fx_dust.png` | 선택 | 높이 36px | front34 | 착지 먼지 |
| 컷신 | `story/story_01_town.png` | 선택 | 1280×720 | front34 | 오프닝 1: 음악에 맞춰 춤추는 평화로운 마을 (그라모 깨어남, 피프, 집, 나무, 음표) |
| 컷신 | `story/story_02_thief.png` | 선택 | 1280×720 | front34 | 오프닝 2: 밤. 시계탑에서 내려온 자명종 그림자가 잠든 그라모 등에서 열쇠 3개를 뽑아 감 |
| 컷신 | `story/story_03_sleep.png` | 선택 | 1280×720 | front34 | 오프닝 3: 음악이 멈춘 마을. 모두 처져 졸고, 열쇠 3개가 바람에 흩어짐 |
| 컷신 | `story/story_04_arrival.png` | 선택 | 1280×720 | front34 | 오프닝 4: 아침, 여행 가방을 든 보글이 마을 입구에 도착 |
| 컷신 | `story/story_05_teaser.png` | 선택 | 1280×720 | front34 | 제1막 끝 예고: 시계탑 꼭대기에서 마을을 내려다보는 째깍 백작 실루엣 |
| 감기 모달 | `wind/wind_gramo_back.png` | 선택 | 높이 430px | front34 | 태엽 감기 모달 배경: 그라모의 등(나무 상자 뒷면) 클로즈업. 가운데 열쇠 구멍, 열쇠는 그리지 않음 |
| 감기 모달 | `wind/wind_key.png` | 선택 | 높이 200px | front34 | 태엽 감기 모달의 큰 열쇠. 화면에서 회전하므로 손잡이가 위, 축이 아래로 곧게, 대칭 |
| 보스 | `boss/boss_idle.png` | 필수 | 높이 240px | front34 | 째깍 백작 대기. 거만하게 서서 몸을 흔듦 |
| 보스 | `boss/boss_slam.png` | 필수 | 높이 240px | front34 | 충격파: 두 팔을 머리 위로 들어 바닥을 내려찍기 직전 |
| 보스 | `boss/boss_throw.png` | 필수 | 높이 240px | front34 | 톱니 던지기: 한 팔을 옆으로 크게 휘두름 |
| 보스 | `boss/boss_bell.png` | 필수 | 높이 240px | front34 | 졸음 종소리: 머리의 종 두 개가 요란하게 흔들림 |
| 보스 | `boss/boss_tired.png` | 필수 | 높이 240px | front34 | 과열로 주저앉음. 등의 태엽 열쇠가 옆으로 보임 |
| 보스 | `boss/boss_hurt.png` | 선택 | 높이 240px | front34 | 과감기 당함: 스프링이 튕겨 나가며 몸이 출렁임 |
| 보스 | `boss/boss_cuckoo.png` | 필수 | 높이 150px | front34 | 퇴치 후: 작은 뻐꾸기시계가 된 백작. 웃는 얼굴, 작은 새 |
| 초상화 | `portrait/portrait_boss_angry.png` | 선택 | 높이 200px | front34 | 대화 카드용 백작 얼굴(화남) |
| 초상화 | `portrait/portrait_boss_cuckoo.png` | 선택 | 높이 200px | front34 | 대화 카드용 뻐꾸기시계(온순) |
| 배경 | `bg/bg_arena.png` | 필수 | 1280×720 | top34 | 보스전 배경: 한밤 광장. 위쪽에 시계탑과 밤하늘, 아래 2/3는 큰 원형 나무 무대 바닥(비어 있음) |
| 이펙트 | `fx/fx_gear.png` | 필수 | 높이 80px | front34 | 굴러오는 톱니(정면, 원형, 회전함) |
| 이펙트 | `fx/fx_spring.png` | 필수 | 높이 60px | front34 | 튕겨 나가는 스프링 + 백작 체력 아이콘 |
| 이펙트 | `fx/fx_steam.png` | 선택 | 높이 50px | front34 | 과열 김 |
| 이펙트 | `fx/fx_bell_wave.png` | 선택 | 높이 60px | front34 | 종소리 음파(위쪽 반원 파동) |
| 감기 모달 | `wind/wind_boss_back.png` | 선택 | 높이 430px | front34 | 과감기 모달 배경: 백작의 등(자명종 뒷면) 클로즈업, 가운데 열쇠 구멍, 열쇠 없음 |
| 컷신 | `story/story_06_boss_arrive.png` | 선택 | 1280×720 | front34 | 제2막 시작: 자정, 백작이 광장으로 성큼성큼 내려옴(이제 실루엣 아님) |
| 컷신 | `story/story_07_boss_defeat.png` | 선택 | 1280×720 | front34 | 제2막 끝: 뻐꾸기시계가 된 백작과 함께 춤추는 마을 |
| 가구 | `furniture/furn_cuckoo.png` | 선택 | 높이 130px | front34 | 제2막 보상 가구: 뻐꾸기시계(얼굴 없는 가구 버전) |
| UI | `ui/ui_card_frame.png` | 선택 | 1100×240 | front34 | 무성영화 자막 카드 테두리. 가운데는 비워 둠 |
| UI | `ui/ui_key_e.png` | 선택 | 높이 48px | front34 | E 키 아이콘(상호작용 안내). 글자 E만 허용 |

각 ID의 개별 프롬프트(⑤)는 `assets/manifest.js`의 `prompt` 값을 그대로 쓴다.
