# JOB-12 — 제4막 측량기 + 말뚝·지도

> 사람이 **"JOB12 진행해"**라고 하면 이 파일을 처음부터 끝까지 따라 한다. 다른 JOB은 건드리지 않는다.

- 소속: 제4막 「도시에서 온 방송」 (GAME_DESIGN.md 18절)
- 만들 파일: **10개**
- 먼저 끝나 있어야 하는 JOB: 없음 (바로 시작 가능)

## 1. 시작 전

1. `AGENTS.md`, `ASSET_GUIDE.md` 0~5절을 읽는다. 0절 절대 규칙은 이 JOB에도 그대로 적용된다.
2. 아래 레퍼런스 이미지를 열어 보고, 생성할 때마다 첨부한다.

   - `assets/refs/style_anchor.png`
   - `assets/refs/ref_02_character.jpg`
   - JOB-10 결과 prop_battery (회색 기준)

## 2. 프롬프트 조립 순서

ASSET_GUIDE 1-2절 방식. 고정 블록은 **한 글자도 바꾸지 않고** 복사한다.

1. STYLE BLOCK
2. SPRITE RULES
3. SURVEYOR
4. 시트 구성 설명 (아래 3절)
5. 각 ID의 개별 프롬프트 (아래 4절 표의 prompt 값 그대로)

## 3. 만드는 방법

### 시트 `a` — 측량기 5포즈 한 줄

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `npc_surveyor_idle` → `npc_surveyor_walk_01` → `npc_surveyor_walk_02` → `npc_surveyor_hammer` → `npc_surveyor_stun`
- 원본 저장: `assets/sheets/JOB-12_a.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-12_a.png --names npc_surveyor_idle,npc_surveyor_walk_01,npc_surveyor_walk_02,npc_surveyor_hammer,npc_surveyor_stun
```
- 잘린 개수가 5개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

### 시트 `b` — 초상화 + 소품 3 + 이펙트 1 한 줄

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `portrait_surveyor` → `prop_stake` → `prop_stake_pulled` → `prop_city_map` → `fx_static`
- 원본 저장: `assets/sheets/JOB-12_b.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-12_b.png --names portrait_surveyor,prop_stake,prop_stake_pulled,prop_city_map,fx_static
```
- 잘린 개수가 5개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

## 4. 파일 목록

| ID | 저장 경로 | 게임 안 크기 | 필수 | 설명 | prompt (⑤에 그대로) |
|---|---|---|---|---|---|
| `npc_surveyor_idle` | `assets/npc/npc_surveyor_idle.png` | 높이 130px | ● | 측량기 대기. 삼각대 다리, 뻣뻣하게 서 있음 | SURVEYOR standing perfectly still and rigid on its three straight legs, lens eye scanning forward, antenna up |
| `npc_surveyor_walk_01` | `assets/npc/npc_surveyor_walk_01.png` | 높이 130px |  | 측량기 걷기 1(오른쪽). 다리 하나를 직선으로 뻗음 | SURVEYOR walking to the RIGHT in side view, one straight leg stepping forward like a compass, body perfectly level, no bounce |
| `npc_surveyor_walk_02` | `assets/npc/npc_surveyor_walk_02.png` | 높이 130px |  | 측량기 걷기 2(오른쪽) | SURVEYOR walking to the RIGHT in side view, the other straight leg stepping forward, body perfectly level |
| `npc_surveyor_hammer` | `assets/npc/npc_surveyor_hammer.png` | 높이 130px | ● | 측량기가 말뚝을 땅에 박는 동작 | SURVEYOR driving a wooden survey stake into the ground with a small hammer held in a mechanical claw arm, precise and emotionless |
| `npc_surveyor_stun` | `assets/npc/npc_surveyor_stun.png` | 높이 130px | ● | 측량기 멈춤(합선). 렌즈가 빙글, 회색 지지직 | SURVEYOR stunned and tilted, legs splayed, lens eye showing a spiral, small grey zigzag static sparks around its head |
| `portrait_surveyor` | `assets/portrait/portrait_surveyor.png` | 높이 200px |  | 대화 카드용 측량기 | close-up of SURVEYOR's boxy grey head, two small round glowing dot eyes below the lens, expressionless |
| `prop_stake` | `assets/props/prop_stake.png` | 높이 60px | ● | 측량 말뚝(뽑는 대상). 주황 꼬리표와 작은 안테나 | a wooden survey stake stuck upright in the ground, an orange #E07A3A tag tied near the top and a tiny metal antenna with a small light, plain with NO text or numbers |
| `prop_stake_pulled` | `assets/props/prop_stake_pulled.png` | 높이 30px |  | 뽑혀 쓰러진 말뚝 | the same wooden survey stake lying on its side on the ground, tag loose, antenna light off |
| `prop_city_map` | `assets/props/prop_city_map.png` | 높이 40px | ● | 측량기가 떨어뜨린 도시 지도(돌돌 만 청사진) | a rolled-up pale blue blueprint scroll tied with a grey string, slightly unrolled at one end showing straight grid lines only, no text |
| `fx_static` | `assets/fx/fx_static.png` | 높이 50px |  | 회색 잡음 불꽃(건전지·측량기 이펙트) | a small burst of grey and white zigzag static sparks, jagged straight lines, cartoon electric crackle |

## 5. 이 JOB만의 규칙

- 측량기 다리는 **러버호스가 아닌 곧은 직선**. 이 게임에서 처음 나오는 '관절 없는 직선' 캐릭터라 대비가 핵심이다. 외곽선은 그대로 `#3D3346`.
- 눈은 렌즈 아래 **불빛 점 두 개**(눈 규칙 예외).
- 말뚝 꼬리표·지도에 글자·숫자 금지. 지도는 격자선만.

## 6. 끝나면

```
python tools/check_assets.py      # assets/STATUS.md 갱신
python tools/contact_sheet.py     # assets/sheets/_contact.png
```
1. ASSET_GUIDE 6절 체크리스트로 한 장씩 확인한다. 어긋난 파일만 다시 만든다.
2. `assets/PROMPT_LOG.md`에 한 줄씩: `날짜 | JOB-12 | 결과 파일 | 프롬프트 요약 | 합격/재생성`
3. 사람에게 보고: 만든 파일 수 / 다시 만든 파일과 이유 / STATUS.md에 남은 문제
4. `src/`, `index.html`, `GAME_DESIGN.md`, `assets/manifest.js`는 수정하지 않는다. 이름이나 크기를 바꿔야 할 것 같으면 사람에게 묻는다.
