# 태엽 마을 (Windup Town)

1930년대 러버호스 카툰 스타일의 브라우저 2D 생활형 미니 RPG.
태엽이 풀려 멈춘 마을에 이사 온 찻주전자 보글이 태엽 열쇠를 모아 축음기 그라모를 다시 감고, 열쇠를 훔친 째깍 백작과 맞선다.

인터렉션웹 11주차 · 3 HOURS AI CODING CHALLENGE

## 플레이
https://gisangyu.github.io/windup-town/

## 로컬 실행
```
python tools/serve.py
```
브라우저에서 `http://localhost:5500`
주소 옵션: `?nointro` 오프닝 건너뛰기 · `?act2` 바로 제2막 · `?debug` 충돌 박스·리소스 현황 · `?selftest` 자동 점검

## 조작
| 키 | 동작 |
|---|---|
| WASD / 방향키 | 이동 |
| Shift | 빨리 걷기 |
| Space | 점프 (덤불·작은 톱니·충격파 회피) |
| E | 대화, 줍기, 문, 태엽 감기, 과감기 |
| 마우스 원 그리기 / A·D 번갈아 | 태엽 감기 |
| 클릭·드래그, 1~5, R, G, Delete | 집 꾸미기 |
| Esc | 닫기·취소·나가기 |

## 구성
- 제1막 · 멈춘 음악 (튜토리얼): 오프닝 컷신 → 열쇠 3개 → 태엽 감기 → 집 꾸미기
- 제2막 · 째깍 백작의 습격 (보스전): 충격파·톱니·종소리 패턴, 과열 때 과감기로 스프링 3개 제거

## 문서
- `GAME_DESIGN.md` 기획·로직 기준
- `ASSET_GUIDE.md`, `AGENTS.md` 이미지 리소스 제작 기준
- `assets/manifest.js` 이미지 목록, `assets/audio/audio_manifest.js` 소리 목록

## 배포 (GitHub Pages)
이미지를 바꾼 뒤 푸시하기 전에 웹용 압축본을 다시 만든다.
```
python tools/build_web_assets.py   # assets/*.png → assets_web/*.webp (약 30MB → 2.5MB)
```
배포 사이트는 `assets_web/`를, 로컬 서버는 원본 `assets/`를 읽는다.
