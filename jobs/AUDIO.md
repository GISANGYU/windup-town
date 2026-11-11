# 제3~5막 소리 작업 (Claude 소리 담당 창)

이 문서는 **소리 담당 Claude 창**이 읽는 작업 지시서다. 게임 로직 창(Claude)과 이미지 창(Codex)은 이 파일의 소리를 만들지 않는다.

- 기획: `GAME_DESIGN.md` 17절(3막) · 18절(4막) · 19절(5막) · 15절(소리 규칙)
- 소리 목록 기준: `assets/audio/audio_manifest.js` (id, file, loop, vol, when)
- 기존 생성기: `tools/gen_audio.py` (numpy + scipy 절차 합성, 외부 음원 없음)

---

## 0. 규칙

1. **외부 음원·샘플·음성 합성 금지.** 기존처럼 numpy/scipy로 직접 합성한다.
2. 새 생성기는 **`tools/gen_audio_act3_5.py`** 한 파일에 만든다. 기존 `tools/gen_audio.py`의 도구 함수(`piano`, `clarinet`, `tuba`, `banjo`, `musicbox`, `brush`, `woodblock`, `tick`, `reverb`, `lp`/`hp`/`bp`, `noise`, `norm`, `fade`, `save` 등)는 `from gen_audio import ...`로 가져다 쓴다. **기존 파일의 곡은 바꾸지 않는다** (스템 작업은 2절 참고).
3. 형식은 기존과 같다: 모노 16bit WAV, BGM 22050Hz, SFX 44100Hz. 저장 위치는 `assets/audio/bgm/`, `assets/audio/sfx/`.
4. 다 만들면 `assets/audio/audio_manifest.js`의 `bgm` / `sfx` 배열에 아래 표 그대로(id, file, loop, vol, when) 추가한다. `assets/audio/preview.html`에서 들을 수 있게 한다.
5. **건드리지 않는 파일**: `src/`, `index.html`, `GAME_DESIGN.md`, `assets/manifest.js`, `assets/` 이미지. `tools/build_web_assets.py`는 실행하지 않는다(배포 전에 로직 창이 실행한다).
6. 반복음(loop)은 시작과 끝이 끊김 없이 이어져야 한다. BGM 반복은 마디 단위로 정확히 자른다.

## 1. 소리 방향 — "기계화"를 귀로

3막부터의 주제는 **편리해지는 대신 낭만이 사라짐**이다. 소리도 두 갈래로 나눈다.

| | 태엽 쪽 (마을) | 건전지 쪽 (라디오 씨·측량기·도시) |
|---|---|---|
| 악기 | 래그타임 피아노, 클라리넷, 튜바, 밴조, 오르골 | 사인파·사각파 전자음, 낮은 험(hum), 잡음, 메트로놈 |
| 박자 | 스윙, 흔들림, 사람 손맛 | 정확히 일정, 스윙 없음 |
| 질감 | 필름 잡음, 따뜻한 잔향 | 깨끗하고 건조함. 잔향 거의 없음 |

5막 결말 곡(`bgm_finale`)은 두 쪽이 **하나로 합쳐지는** 곡이다(마을 멜로디 + 도시의 일정한 리듬).

## 2. 마을 BGM 스템 (3막 핵심, 가장 먼저)

3막에서 주민이 건전지로 바뀔 때마다 **그 주민의 악기가 마을 음악에서 빠진다.** 이를 위해 `bgm_town_awake`를 악기별로 나눈 스템 3개가 필요하다.

- `gen_audio.py`의 `bgm_town_awake()` 편곡을 새 파일로 옮겨, **같은 악보·같은 길이·같은 샘플 수**로 악기만 나눠 저장한다.
- 세 파일을 더하면 원곡과 거의 같게 들려야 한다. 셋 다 처음부터 동시에 재생되고 같은 지점에서 반복된다.

| id | file | loop | vol | 들어가는 악기 | when |
|---|---|---|---|---|---|
| `bgm_town_awake_base` | audio/bgm/bgm_town_awake_base.wav | ✔ | 0.5 | 피아노·튜바·브러시 (그라모 = 마지막까지 남음) | 3막 마을. 항상 재생 |
| `bgm_town_awake_pip` | audio/bgm/bgm_town_awake_pip.wav | ✔ | 0.5 | 클라리넷 멜로디 (피프) | 3막 마을. pip.power='battery'면 끔 |
| `bgm_town_awake_lamp` | audio/bgm/bgm_town_awake_lamp.wav | ✔ | 0.5 | 밴조·높은 대선율 (가로등) | 3막 마을. lamp.power='battery'면 끔 |

원곡에 밴조·대선율이 없으면 가로등 파트(밴조나 오르골 대선율)를 새로 넣고, 그 파트를 뺀 나머지가 원곡 느낌을 유지하게 한다.

## 3. 제3막 「태엽 없는 손님」

### BGM · 징글
| id | file | loop | vol | when | 방향 |
|---|---|---|---|---|---|
| `bgm_festival` | audio/bgm/bgm_festival.wav | ✔ | 0.5 | 3막 ① 축제 준비·무대 꾸미기 | 밝은 폴카 120~126BPM, 밴조·클라리넷, 손뼉 |
| `bgm_radio_theme` | audio/bgm/bgm_radio_theme.wav | ✔ | 0.45 | 라디오 씨 등장 컷신·대화 | 광고 노래처럼 짧고 귀에 붙는 반복, 사각파 리드 + 정확한 박자, 살짝 지지직 |
| `jingle_radio_crank` | audio/bgm/jingle_radio_crank.wav | | 0.7 | ⑨ 크랭크 감기 완료 → 태엽 라디오 탄생 | `bgm_radio_theme` 멜로디를 래그타임 피아노·클라리넷으로 다시 연주(4초 이내) |
| `jingle_name_given` | audio/bgm/jingle_name_given.wav | | 0.6 | ⑦ 가로등이 이름을 얻음 | 오르골 + 맑은 종, 2~3초 |
| `jingle_city_signal` | audio/bgm/jingle_city_signal.wav | | 0.6 | 3막 끝 컷신 `story_12_city_signal` | 마을 곡 한 소절이 잡음에 먹히고, 단조 차임 3음으로 끝 |

### 효과음
| id | file | loop | vol | when | 방향 |
|---|---|---|---|---|---|
| `sfx_radio_on` | audio/sfx/sfx_radio_on.wav | | 0.5 | 라디오 씨 전원 켜짐·등장 | 진공관 예열 웅 → 지지직 → 맑아짐 |
| `sfx_radio_off` | audio/sfx/sfx_radio_off.wav | | 0.6 | ⑧ 건전지 닳아 꺼짐 | 음높이가 천천히 내려가며 지지직 끊김 (2초) |
| `sfx_radio_static` | audio/sfx/sfx_radio_static.wav | | 0.4 | 라디오 씨 말 시작, 장면 전환 | 짧은 지지직 0.3초 |
| `amb_radio_static` | audio/sfx/amb_radio_static.wav | ✔ | 0.15 | 라디오 씨 근처에 깔리는 잡음 | 아주 작은 잡음 바닥 |
| `sfx_text_blip_radio` | audio/sfx/sfx_text_blip_radio.wav | | 0.25 | 글자 출력(who='radio'), 2글자마다 | 짧은 사각파 '빕' |
| `sfx_battery_in` | audio/sfx/sfx_battery_in.wav | | 0.6 | 건전지 넣기(주민·보글) | 금속 딸깍 + 전자음 상승 + 험 시작 |
| `sfx_battery_out` | audio/sfx/sfx_battery_out.wav | | 0.6 | 건전지 빼기 | 딸깍 + 전자음 하강 |
| `sfx_battery_hum` | audio/sfx/sfx_battery_hum.wav | ✔ | 0.25 | 건전지 상태인 것이 화면에 있을 때 | 낮은 60Hz 계열 웅—, 아주 일정 |
| `sfx_jump_blocked` | audio/sfx/sfx_jump_blocked.wav | | 0.5 | 건전지 상태에서 Space | 둔한 금속 '덜컥' (점프 소리의 실패 버전) |
| `sfx_sheet_pickup` | audio/sfx/sfx_sheet_pickup.wav | | 0.55 | 악보 조각 줍기 | 종이 바스락 + 클라리넷 두 음 |
| `sfx_pip_song` | audio/sfx/sfx_pip_song.wav | | 0.6 | 피프가 노래 편지를 다시 부름(⑥ 완료) | 클라리넷 짧은 멜로디 2~3초, 신남 |
| `sfx_pip_flat` | audio/sfx/sfx_pip_flat.wav | | 0.4 | 건전지 피프의 "배달 완료" | 감정 없는 사인파 두 음 '삐-삐' |
| `sfx_lamp_blink_short` | audio/sfx/sfx_lamp_blink_short.wav | | 0.45 | 가로등 짧은 깜빡 / 플레이어가 짧게 누름 | 유리 '틱' + 짧은 웅 |
| `sfx_lamp_blink_long` | audio/sfx/sfx_lamp_blink_long.wav | | 0.45 | 가로등 긴 깜빡 / 길게 누름 | 같은 소리를 0.5초로 길게 |
| `sfx_blink_right` | audio/sfx/sfx_blink_right.wav | | 0.5 | 깜빡임 따라 하기 한 칸 맞음 | 오르골 한 음(칸마다 음이 올라가게 rate로 조절) |
| `sfx_blink_wrong` | audio/sfx/sfx_blink_wrong.wav | | 0.5 | 틀림 → 처음부터 | 낮은 부저 '부-' |
| `sfx_crank` | audio/sfx/sfx_crank.wav | | 0.45 | 크랭크 감기 모달에서 진행할 때(기존 `sfx_wind_ratchet` 자리) | 나무 크랭크 '드륵', 래칫보다 둥글고 낮게 |
| `sfx_festival_cheer` | audio/sfx/sfx_festival_cheer.wav | | 0.5 | 무대 꾸미기 완료 | 손뼉 + 휘파람 같은 상승음 |

## 4. 제4막 「도시에서 온 방송」

### BGM · 징글
| id | file | loop | vol | when | 방향 |
|---|---|---|---|---|---|
| `bgm_act4_tension` | audio/bgm/bgm_act4_tension.wav | ✔ | 0.45 | 측량기가 마을에 있는 동안 | 마을 곡을 단조로 + 메트로놈처럼 일정한 '틱', 점점 불안 |
| `bgm_chase` | audio/bgm/bgm_chase.wav | ✔ | 0.5 | ⑤ 건전지 추격(30초) | 빠른 전자 리듬 160BPM, 스윙 없음, 래그타임 조각이 가끔 섞임 |
| `bgm_flashback` | audio/bgm/bgm_flashback.wav | ✔ | 0.4 | ⑦ 라디오 씨 회상 `story_16` | 지글거리는 축음기 질감 + 쓸쓸한 피아노, 느림 |
| `jingle_map_get` | audio/bgm/jingle_map_get.wav | | 0.6 | ⑥ 지도 획득 | 짧은 발견 팡파르, 끝음이 단조로 꺾임 |

### 효과음
| id | file | loop | vol | when | 방향 |
|---|---|---|---|---|---|
| `sfx_surveyor_step` | audio/sfx/sfx_surveyor_step.wav | | 0.3 | 측량기 걸음(다리마다) | 마른 금속 '탁', 매번 같은 소리 |
| `sfx_surveyor_scan` | audio/sfx/sfx_surveyor_scan.wav | | 0.35 | 측량기가 멈춰 렌즈로 살핌 | '삐빅' + 짧은 스윕 |
| `sfx_stake_hammer` | audio/sfx/sfx_stake_hammer.wav | | 0.6 | 말뚝 박기 | 나무 '쾅' 두 번 |
| `sfx_stake_pull` | audio/sfx/sfx_stake_pull.wav | ✔ | 0.4 | 말뚝 앞 E 길게 누르는 동안 | 나무 삐걱 반복 |
| `sfx_stake_out` | audio/sfx/sfx_stake_out.wav | | 0.6 | 말뚝이 뽑힘 | '퐁!' + 흙 |
| `sfx_grey_spread` | audio/sfx/sfx_grey_spread.wav | | 0.45 | 말뚝 둘레에 회색이 번지기 시작 | 음높이가 내려가는 스윕 + 소리가 건조해짐 |
| `sfx_grey_recede` | audio/sfx/sfx_grey_recede.wav | | 0.5 | 회색 원이 줄어들며 색이 돌아옴 | 위로 오르는 스윕 + 오르골 반짝 |
| `sfx_radio_jam` | audio/sfx/sfx_radio_jam.wav | | 0.6 | 라디오 씨 잡음 방송 발사 | 큰 지지직 파동 0.6초 |
| `sfx_surveyor_stun` | audio/sfx/sfx_surveyor_stun.wav | | 0.55 | 측량기 3초 멈춤 | 전자음이 꼬이며 '삐요요' |
| `sfx_surveyor_stop` | audio/sfx/sfx_surveyor_stop.wav | | 0.6 | 측량기 건전지 빼서 완전 정지 | `sfx_battery_out` + 모터가 천천히 멈춤 |
| `sfx_battery_low` | audio/sfx/sfx_battery_low.wav | | 0.45 | 건전지 잔량 20% 이하(4·5막), 1초마다 | 짧은 '삐-삐' |
| `sfx_battery_empty` | audio/sfx/sfx_battery_empty.wav | | 0.6 | 건전지 0 | 하강음 + 털썩 |
| `sfx_broadcast_chime` | audio/sfx/sfx_broadcast_chime.wav | | 0.5 | 철거 방송 시작 전 | 단조 '딩-동-댕' (방송 안내음 느낌, 잡음 섞임) |

## 5. 제5막 「갈아끼우는 길」 (횡스크롤)

모드에 따라 BGM이 얇아지는 건 코드가 필터로 처리한다(건전지 모드 = 고음 필터 + 볼륨 감소). 구간 곡은 각각 **태엽 모드로 들었을 때 기준**으로 만든다.

### BGM · 징글
| id | file | loop | vol | when | 방향 |
|---|---|---|---|---|---|
| `bgm_road1` | audio/bgm/bgm_road1.wav | ✔ | 0.5 | 구간1 들판길 | 경쾌한 래그타임 행진 132BPM, 마을 곡 동기 |
| `bgm_road2` | audio/bgm/bgm_road2.wav | ✔ | 0.5 | 구간2 공장 지대 | 래그타임 반 + 기계 리듬 반, 망치·증기 타악 |
| `bgm_road3` | audio/bgm/bgm_road3.wav | ✔ | 0.5 | 구간3 도시 | 거의 전자 리듬, 멜로디는 멀리서 희미하게 |
| `bgm_finale` | audio/bgm/bgm_finale.wav | ✔ | 0.55 | 송신탑 결말 `story_21`~`22` | 마을 멜로디 + 도시의 일정한 리듬이 하나로 합쳐짐 |
| `jingle_checkpoint` | audio/bgm/jingle_checkpoint.wav | | 0.55 | 체크포인트 도착 | 축음기 나팔 짧은 3음 |
| `jingle_zone_clear` | audio/bgm/jingle_zone_clear.wav | | 0.65 | 구간 끝 | 2~3초 팡파르 |

### 효과음
| id | file | loop | vol | when | 방향 |
|---|---|---|---|---|---|
| `sfx_swap` | audio/sfx/sfx_swap.wav | | 0.6 | Q 갈아끼우기(정확히 **0.6초**) | 덮개 열림 → 빼기 → 끼우기 딸깍, 0.6초 안에 끝 |
| `sfx_auto_swap` | audio/sfx/sfx_auto_swap.wav | | 0.55 | 건전지 0 → 자동 태엽 전환 경고 | `sfx_battery_empty`보다 짧은 경고 + 딸깍 |
| `sfx_jump_charge` | audio/sfx/sfx_jump_charge.wav | ✔ | 0.4 | Space 길게 누르는 동안(충전 점프) | 스프링 감기며 음이 오름(1초에 최고) |
| `sfx_jump_big` | audio/sfx/sfx_jump_big.wav | | 0.55 | 충전 점프 발사 | 스프링 '뾰옹' 큰 버전 |
| `sfx_dash_step` | audio/sfx/sfx_dash_step.wav | | 0.25 | 건전지 모드 발소리 | 금속 '틱', 일정 간격, 감정 없음 |
| `sfx_wind_self` | audio/sfx/sfx_wind_self.wav | | 0.5 | 체크포인트에서 스스로 감기 | 래칫 드르륵 3번 + 딸깍 |
| `sfx_wind_low` | audio/sfx/sfx_wind_low.wav | | 0.45 | 태엽 게이지 20% 이하, 2초마다 | 느려지는 오르골 두 음 |
| `sfx_short_circuit` | audio/sfx/sfx_short_circuit.wav | | 0.65 | 건전지 모드로 물에 닿음 | 지지직 펑 + 치익 |
| `sfx_splash` | audio/sfx/sfx_splash.wav | | 0.5 | 태엽 모드로 물웅덩이 | 가벼운 첨벙 |
| `sfx_charge` | audio/sfx/sfx_charge.wav | ✔ | 0.35 | 충전소에서 충전 중 | 일정한 전자 웅 + 천천히 오르는 음 |
| `sfx_charge_full` | audio/sfx/sfx_charge_full.wav | | 0.55 | 충전 완료 | 맑은 '띵' 두 번 |
| `sfx_shutter_close` | audio/sfx/sfx_shutter_close.wav | | 0.55 | 셔터 닫힘 | 철판 드르륵 쾅 |
| `sfx_shutter_open` | audio/sfx/sfx_shutter_open.wav | | 0.5 | 셔터 열림 | 철판 드르륵 위로 |
| `sfx_door_auto` | audio/sfx/sfx_door_auto.wav | | 0.5 | 자동문 열림(건전지 모드로 다가감) | 공기 '슉' + 작은 전자음 |
| `sfx_elevator` | audio/sfx/sfx_elevator.wav | ✔ | 0.35 | 승강기 움직이는 동안 | 모터 웅 |
| `sfx_conveyor` | audio/sfx/sfx_conveyor.wav | ✔ | 0.3 | 컨베이어 위에 있을 때 | 롤러 덜덜덜 |
| `sfx_lift_wind` | audio/sfx/sfx_lift_wind.wav | | 0.55 | 태엽 승강 발판이 올라감 | 톱니 째깍째깍 상승 |
| `sfx_drawbridge` | audio/sfx/sfx_drawbridge.wav | | 0.6 | 도개교 내려옴 | 쇠사슬 촤르르 + 쿵 |
| `sfx_fall` | audio/sfx/sfx_fall.wav | | 0.5 | 구덩이에 떨어짐 | 카툰식 하강 휘파람 '휘이익' |
| `sfx_spark_hit` | audio/sfx/sfx_spark_hit.wav | | 0.6 | 감전 전선 피격 | 짧은 지지직 + 기존 `sfx_player_hit` 느낌 |

## 6. 우선순위

1. **3막 전부** (2절 스템 + 3절). 로직 창이 3막부터 개발한다.
2. 4막 (4절)
3. 5막 (5절)

막 하나가 끝날 때마다 `audio_manifest.js`에 추가하고, 로직 창에 "3막 소리 완료"처럼 알려 준다. 없는 소리는 게임에서 조용히 넘어가므로, 순서대로 넣어도 게임은 깨지지 않는다.

## 7. 끝나면 보고할 것

- 만든 개수 / 막별 목록
- 스템 3개 길이(샘플 수)가 같은지
- loop 항목이 끊김 없이 이어지는지 확인했는지
- 기획과 다르게 만든 것이 있으면 그 이유
