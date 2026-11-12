# AGENTS.md — 태엽 마을

## 역할 분담
- **Codex: 이미지 리소스 담당.** `assets/` 아래 이미지만 만든다.
- **Claude: 게임 로직 담당.** `src/`, `index.html`, `GAME_DESIGN.md`는 Claude가 관리한다. Codex는 이 파일들을 수정하지 않는다.
- 기준 문서: `ASSET_GUIDE.md` (스타일·네이밍·작업 분배), `assets/manifest.js` (리소스 목록), `GAME_DESIGN.md` (세계관·캐릭터 역할)

## 명령 규칙: "JOBn 진행해"
- 사람이 **"JOB9 진행해"**처럼 번호만 말하면 `jobs/JOB-09.md`(두 자리)를 열고 그 지시서만 처음부터 끝까지 수행한다.
- 지시서에 적힌 "먼저 끝나 있어야 하는 JOB"의 결과 이미지가 없으면 시작하지 말고 사람에게 알린다.
- 전체 순서와 의존 관계: `jobs/README.md`. JOB-0~8은 이 문서 아래와 ASSET_GUIDE 1-4절 기준.

## 작업 전에 반드시
1. `ASSET_GUIDE.md`를 처음부터 끝까지 읽는다.
2. `assets/refs/` 이미지를 열어 본다. `style_anchor.png`가 있으면 그것이 최우선 기준이다.
3. 맡은 JOB 번호를 확인한다(ASSET_GUIDE 1-4). `style_anchor.png`가 아직 없으면 JOB-0부터 하고, 사람의 승인을 받기 전에는 다른 JOB을 시작하지 않는다.

## 이미지 생성 규칙 요약
- 프롬프트 = STYLE BLOCK + SPRITE/BACKGROUND RULES + CHARACTER BLOCK + 시트 구성 + manifest의 prompt. 고정 블록은 그대로 복사하고 바꾸지 않는다.
- 생성할 때마다 `assets/refs/style_anchor.png`와 `assets/refs/ref_02_character.jpg`를 레퍼런스로 첨부한다.
- 같은 묶음은 마젠타(#FF00FF) 배경의 시트 한 장으로 만들고, 원본은 `assets/sheets/JOB-n_x.png`로 저장한 뒤 `tools/slice_sheet.py`로 자른다.
- 파일 이름과 경로는 `manifest.js`의 `file` 값 그대로. 새 ID 추가와 이름 변경은 금지(필요하면 사람에게 묻기).
- 이미지에 글자·숫자·로고·바닥 그림자를 넣지 않는다.
- 레퍼런스 게임의 캐릭터나 디자인을 따라 그리지 않는다. 그리는 방식만 따른다.

## 작업이 끝날 때마다
```
python tools/check_assets.py      # assets/STATUS.md 갱신
python tools/contact_sheet.py     # assets/sheets/_contact.png 로 전체 비교
```
- `assets/PROMPT_LOG.md`에 `날짜 | JOB | 파일 | 프롬프트 요약 | 합격/재생성` 한 줄 추가
- 게임은 파일이 바뀌면 2초 안에 자동으로 다시 불러온다. 확인은 `python tools/serve.py` 후 `http://localhost:5500` (캐시를 끈 개발 서버)

## 추가 작업 (2026-11-11)
- **JOB-7**: 오프닝·예고 컷신 5장(`story/`)과 태엽 감기 모달 2개(`wind/`). 규칙은 ASSET_GUIDE 1-4 표 아래.
- **JOB-8**: 제2막 보스 째깍 백작 18개(`boss/` 외). 캐릭터 블록은 ASSET_GUIDE 5절 COUNT TICK-TOCK. 필수(req)부터: boss_idle, boss_slam, boss_throw, boss_bell, boss_tired, boss_cuckoo, bg_arena, fx_gear, fx_spring.

## 추가 작업 (6~7막 오르골 여왕, 2026-11-12)
- **JOB-24 ~ JOB-27**: 멜로디 여왕, 오르골 마을 주민 3종, 배경·소품·풀기 모달, 컷신 12장. 지시서 `jobs/JOB-24.md` ~ `jobs/JOB-27.md`. 캐릭터 블록은 ASSET_GUIDE 5절 MELODY QUEEN · ORGEL DANCERS · YOUNG GRAMO.

## 추가 작업 (새 3~5막, 2026-11-12)
- **JOB-18 ~ JOB-22**: 볼트 남작, 두꺼비집 문지기, 변신 후 라디오 씨, 보스 아레나·이펙트, 컷신 13장. 지시서 `jobs/JOB-18.md` ~ `jobs/JOB-22.md`. 캐릭터 블록은 ASSET_GUIDE 5절 BARON VOLT · TOAD GATEKEEPER · RADIO REBORN.
- `src/`는 수정하지 않는다(게임 로직은 Claude 담당). 게임에 대한 의견은 사람에게 남긴다.

## 추가 작업 (제3~5막, 이전 이야기 · 완료)
- **JOB-9 ~ JOB-17**: 지시서 `jobs/JOB-09.md` ~ `jobs/JOB-17.md`. 새 캐릭터 블록은 ASSET_GUIDE 5절 RADIO·SURVEYOR, 제5막은 SIDE-SCROLL RULES.
- 건전지로 움직이는 것은 파이 눈 대신 불빛 점 눈(ASSET_GUIDE 5절 눈 규칙 예외).
