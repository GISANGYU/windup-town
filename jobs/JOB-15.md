# JOB-15 — 제5막 배경 6장 (구간별 먼 배경 + 중간 레이어)

> 사람이 **"JOB15 진행해"**라고 하면 이 파일을 처음부터 끝까지 따라 한다. 다른 JOB은 건드리지 않는다.

- 소속: 제5막 「갈아끼우는 길」 (GAME_DESIGN.md 19절)
- 만들 파일: **6개**
- 먼저 끝나 있어야 하는 JOB: 없음 (바로 시작 가능)

## 1. 시작 전

1. `AGENTS.md`, `ASSET_GUIDE.md` 0~5절을 읽는다. 0절 절대 규칙은 이 JOB에도 그대로 적용된다.
2. 아래 레퍼런스 이미지를 열어 보고, 생성할 때마다 첨부한다.

   - `assets/refs/style_anchor.png`
   - `assets/refs/ref_04_watercolor_bg.jpg`
   - `assets/refs/ref_03_stage_layers.jpg`
   - `assets/bg/bg_intro.png (구간1 색 기준)`

## 2. 프롬프트 조립 순서

ASSET_GUIDE 1-2절 방식. 고정 블록은 **한 글자도 바꾸지 않고** 복사한다.

1. STYLE BLOCK
2. BACKGROUND RULES (far)
3. SPRITE RULES (mid)
4. SIDE-SCROLL RULES
5. 시트 구성 설명 (아래 3절)
6. 각 ID의 개별 프롬프트 (아래 4절 표의 prompt 값 그대로)

## 3. 만드는 방법

### 시트 `mid1` — 중간 레이어 1장(위쪽 마젠타)

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `bg_road1_mid`
- 원본 저장: `assets/sheets/JOB-15_mid1.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-15_mid1.png --names bg_road1_mid
```
- 잘린 개수가 1개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

### 시트 `mid2` — 중간 레이어 1장

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `bg_road2_mid`
- 원본 저장: `assets/sheets/JOB-15_mid2.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-15_mid2.png --names bg_road2_mid
```
- 잘린 개수가 1개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

### 시트 `mid3` — 중간 레이어 1장

- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서
- 순서: `bg_road3_mid`
- 원본 저장: `assets/sheets/JOB-15_mid3.png`
- 자르기:
```
python tools/slice_sheet.py assets/sheets/JOB-15_mid3.png --names bg_road3_mid
```
- 잘린 개수가 1개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.

### 한 장씩 따로 만드는 것

16:9 한 장씩 생성해서 아래 경로에 **PNG로 바로 저장**한다(자르기 없음).

- `bg_road1_far` → `assets/road/bg_road1_far.png`
- `bg_road2_far` → `assets/road/bg_road2_far.png`
- `bg_road3_far` → `assets/road/bg_road3_far.png`

## 4. 파일 목록

| ID | 저장 경로 | 게임 안 크기 | 필수 | 설명 | prompt (⑤에 그대로) |
|---|---|---|---|---|---|
| `bg_road1_mid` | `assets/road/bg_road1_mid.png` | 1280×360 | ● | 5막 구간1 중간 레이어(위쪽 투명). 덤불·나무·울타리 실루엣 띠 | middle parallax layer strip: a row of round bushes, poplar trees and a wooden fence along the bottom, top part empty magenta, LEFT and RIGHT edges connect seamlessly |
| `bg_road2_mid` | `assets/road/bg_road2_mid.png` | 1280×360 | ● | 5막 구간2 중간 레이어. 파이프·철골·전선주 띠 | middle parallax layer strip: grey pipes, steel girders, electric poles with drooping wires along the bottom, straight lines, top part empty magenta, LEFT and RIGHT edges connect seamlessly |
| `bg_road3_mid` | `assets/road/bg_road3_mid.png` | 1280×360 | ● | 5막 구간3 중간 레이어. 가로등·표지판(글자 없음)·셔터 상점 띠 | middle parallax layer strip: straight grey street lamps, blank signboards with NO text, closed shop shutters along the bottom, top part empty magenta, LEFT and RIGHT edges connect seamlessly |
| `bg_road1_far` | `assets/road/bg_road1_far.png` | 1280×720 | ● | 5막 구간1(마을 외곽 들판) 먼 배경. 좌우가 이어지는 반복 배경 | far background for a side-scrolling level: warm morning sky, soft rolling hills with round trees, a tiny village far on the left horizon, faded watercolor, the LEFT and RIGHT edges must connect seamlessly so it can repeat |
| `bg_road2_far` | `assets/road/bg_road2_far.png` | 1280×720 | ● | 5막 구간2(공장 지대) 먼 배경. 회색 굴뚝·톱니 공장, 색이 바래기 시작 | far background: overcast sky, grey factory buildings with chimneys and big idle gears, a long conveyor bridge, colors draining from warm to grey from left to right, LEFT and RIGHT edges connect seamlessly |
| `bg_road3_far` | `assets/road/bg_road3_far.png` | 1280×720 | ● | 5막 구간3(도시) 먼 배경. 직선 빌딩 숲과 붉은 불빛 송신탑, 거의 무채색 | far background: a colorless city of tall straight-edged buildings, a giant broadcast tower with a blinking red light in the center distance, flat grey sky, almost no color except the red light, LEFT and RIGHT edges connect seamlessly |

## 5. 이 JOB만의 규칙

- 세 구간은 **마을 → 공장 → 도시**로 갈수록 색이 빠지고 선이 곧아진다. 구간1은 1막 마을과 같은 따뜻한 수채, 구간3은 거의 무채색 + 송신탑의 붉은 불빛 하나.
- 모든 배경은 **왼쪽 끝과 오른쪽 끝이 이어져야** 한다(반복 스크롤). 만든 뒤 좌우를 붙여 이음매를 확인한다.
- far는 16:9 화면 가득. mid는 가로로 긴 띠(2:1 이상 권장), **아래쪽만 그리고 위쪽은 마젠타** → 자르기 명령으로 투명하게 만든다.
- far 저장: `assets/road/<ID>.png`에 바로. mid는 아래 자르기 명령으로.

## 6. 끝나면

```
python tools/check_assets.py      # assets/STATUS.md 갱신
python tools/contact_sheet.py     # assets/sheets/_contact.png
```
1. ASSET_GUIDE 6절 체크리스트로 한 장씩 확인한다. 어긋난 파일만 다시 만든다.
2. `assets/PROMPT_LOG.md`에 한 줄씩: `날짜 | JOB-15 | 결과 파일 | 프롬프트 요약 | 합격/재생성`
3. 사람에게 보고: 만든 파일 수 / 다시 만든 파일과 이유 / STATUS.md에 남은 문제
4. `src/`, `index.html`, `GAME_DESIGN.md`, `assets/manifest.js`는 수정하지 않는다. 이름이나 크기를 바꿔야 할 것 같으면 사람에게 묻는다.
