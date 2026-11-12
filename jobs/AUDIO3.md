# 6~7막 소리 작업 (「오르골 여왕」, 소리 담당 Claude 창)

기획: `GAME_DESIGN.md` 22~24절. 이 문서는 **6·7막에 새로 필요한 소리만** 적는다. 이전 소리(AUDIO.md·AUDIO2.md, 약 165개)는 그대로 쓴다.

## 0. 규칙 (이전과 같음)
1. 외부 음원·샘플·음성 합성 금지. numpy/scipy 절차 합성. **멜로디의 "목소리"도 말소리 합성이 아니라 오르골 악구로 표현**한다.
2. 새 생성기는 **`tools/gen_audio_act6_7.py`** 한 파일. 기존 `tools/gen_audio.py`·`gen_audio_act3_5.py`·`gen_audio_act3_5b.py`의 도구 함수(`musicbox`, `piano`, `clarinet`, `reverb` 등)를 import해서 쓴다. 기존 곡은 바꾸지 않는다.
3. 모노 16bit WAV, BGM 22050Hz, SFX 44100Hz. `assets/audio/bgm/`, `assets/audio/sfx/`.
4. 다 만들면 `assets/audio/audio_manifest.js`에 아래 표 그대로 추가하고 `preview.html`에서 들을 수 있게 한다.
5. 건드리지 않는 파일: `src/`, `index.html`, `GAME_DESIGN.md`, `assets/manifest.js`, 이미지. 커밋·푸시, `tools/build_web_assets.py` 실행 금지.
6. 반복음은 끊김 없이, BGM 반복은 마디 단위로 정확히.

## 1. 소리 방향
- 6·7막의 중심 악기는 **오르골**(맑은 금속 빗살 소리, 짧은 감쇠, 높은 음역).
- **너무 감긴 상태** = 템포가 계속 빨라지고 음정이 살짝 위로 뜨는 오르골, 쉬지 않는 왈츠, 날카로운 끼이익.
- **풀린 상태** = 제 템포, 따뜻한 잔향, 그라모의 피아노와 어울림.
- 3막의 그라모 대사 "느린 음악도 음악이지"를 소리로: **최종 라운드와 결말은 느린 템포가 이긴다.**
- **멜로디 테마**: 6막 회상, 7막 보스, 결말 듀엣에서 같은 8마디 선율을 다르게 편곡해 쓴다. 그라모의 마을 곡과 겹쳐 연주해도 어울리게 같은 조로 맞춘다.

## 2. BGM · 징글
| id | file | loop | vol | when | 방향 |
|---|---|---|---|---|---|
| `bgm_orgel_town` | audio/bgm/bgm_orgel_town.wav | ✔ | 0.45 | 7막 구간 1 오르골 거리 | 쉬지 않는 오르골 왈츠 168BPM, 음정이 아주 살짝 뜬 느낌, 숨 쉴 틈 없는 반복 |
| `bgm_ballroom` | audio/bgm/bgm_ballroom.wav | ✔ | 0.45 | 7막 구간 2 무도회장 | 같은 왈츠를 현악풍 합성 + 빗살 원통의 '틱틱' 리듬(원통 박자와 맞출 수 있게 정확히 2박마다) |
| `bgm_melody_boss` | audio/bgm/bgm_melody_boss.wav | ✔ | 0.5 | 보스 1~2라운드 | 멜로디 테마를 빠르고 날카롭게(176BPM), 오르골 + 튜바 저음, 끝마디마다 끼이익 |
| `bgm_melody_final` | audio/bgm/bgm_melody_final.wav | ✔ | 0.5 | 보스 최종 라운드(라디오 씨의 느린 방송) | **느린 템포 84BPM**. 그라모의 마을 곡(피아노) 위에 멜로디 테마(오르골)가 천천히 얹힘. 따뜻하게 |
| `bgm_flashback_duet` | audio/bgm/bgm_flashback_duet.wav | ✔ | 0.4 | 6막 회상 컷신 | 세피아 느낌: 축음기 지글 + 피아노(그라모) + 오르골(멜로디) 듀엣, 왈츠 96BPM |
| `bgm_parcel` | audio/bgm/bgm_parcel.wav | ✔ | 0.4 | 6막 소포·풀기 연습 동안 | 마을 곡을 조용하게, 가끔 오르골 비명이 섞여 불안 |
| `bgm_duet_ending` | audio/bgm/bgm_duet_ending.wav | ✔ | 0.5 | 7막 결말·이후 마을 | 그라모(피아노) + 멜로디(오르골) + 라디오 씨(나팔 금관) 셋의 마을 곡 |
| `jingle_unwind_done` | audio/bgm/jingle_unwind_done.wav | | 0.65 | 풀기 성공(모달·주민) | 내려가는 오르골 아르페지오가 부드럽게 멈춤, 2초 |
| `jingle_memory` | audio/bgm/jingle_memory.wav | | 0.55 | 보스전 기억 컷 | 세피아 지글 + 멜로디 테마 2마디, 3초 |
| `jingle_melody_rest` | audio/bgm/jingle_melody_rest.wav | | 0.7 | 멜로디가 처음으로 멈춤 | 오르골 태엽이 천천히 풀리며 마지막 음이 길게, 6초 |

## 3. 효과음
| id | file | loop | vol | when | 방향 |
|---|---|---|---|---|---|
| `sfx_parcel_shake` | audio/sfx/sfx_parcel_shake.wav | ✔ | 0.35 | 소포가 덜덜 떨리는 동안 | 종이 상자 덜그럭 + 안에서 끼익 |
| `sfx_parcel_open` | audio/sfx/sfx_parcel_open.wav | | 0.5 | 소포 뜯기 | 끈 툭, 종이 찢김 |
| `amb_orgel_scream` | audio/sfx/amb_orgel_scream.wav | ✔ | 0.45 | 너무 감긴 오르골 근처 | 날카롭게 빨라지는 오르골 + 금속 끼이익 (귀를 막을 만큼, 하지만 아프지 않게) |
| `sfx_unwind_tick` | audio/sfx/sfx_unwind_tick.wav | | 0.4 | 풀기: 진행할 때마다 | 감기 래칫의 **역방향**: 낮고 부드러운 '톡' (피치를 진행에 따라 내림) |
| `sfx_unwind_good` | audio/sfx/sfx_unwind_good.wav | ✔ | 0.3 | 풀기: 속도가 초록 띠 안에 있는 동안 | 은은한 오르골 지속음(볼륨은 게임이 조절) |
| `sfx_unwind_snap` | audio/sfx/sfx_unwind_snap.wav | | 0.6 | 풀기: 너무 빨라 튕김 | 스프링 '팅!' + 금속 진동 |
| `sfx_unwind_creep` | audio/sfx/sfx_unwind_creep.wav | | 0.35 | 풀기: 너무 느려 다시 감김 | 끼… 끼… 조이는 소리 |
| `sfx_music_wave` | audio/sfx/sfx_music_wave.wav | | 0.55 | 과감기 선율 파동 | 오르골 화음이 '와앙' 퍼짐 |
| `sfx_dance_lock` | audio/sfx/sfx_dance_lock.wav | | 0.4 | 춤 상태로 저절로 깡충(0.5초마다) | 고무 '보잉' 짧게, 음정 랜덤 |
| `sfx_dancer_rest` | audio/sfx/sfx_dancer_rest.wav | | 0.5 | 주민이 풀려 털썩 앉음 | 털썩 + 긴 한숨 같은 하강 글리산도(목소리 아님) |
| `sfx_speaker_off` | audio/sfx/sfx_speaker_off.wav | | 0.5 | 스피커 상자를 풀어 끔 | 음악이 늘어지며 꺼짐 |
| `sfx_comb_pluck` | audio/sfx/sfx_comb_pluck.wav | | 0.4 | 빗살 원통의 빗살이 튀어나올 때 | 맑은 '팅'(음정 여러 개 중 랜덤 재생 가능하게 한 음) |
| `sfx_note_tornado` | audio/sfx/sfx_note_tornado.wav | ✔ | 0.35 | 음표 회오리가 화면에 있는 동안 | 빠르게 도는 오르골 트릴 + 바람 |
| `sfx_comb_warn` | audio/sfx/sfx_comb_warn.wav | | 0.4 | 빗살 비 그림자 예고 | 높은 쉬익 |
| `sfx_comb_fall` | audio/sfx/sfx_comb_fall.wav | | 0.55 | 빗살이 바닥에 꽂힘 | 짱! 금속 |
| `sfx_melody_creak` | audio/sfx/sfx_melody_creak.wav | | 0.6 | 멜로디가 너무 감겨 굳음 | 큰 삐걱 + 스프링이 늘어나는 긴장음 |
| `sfx_melody_spin` | audio/sfx/sfx_melody_spin.wav | | 0.5 | 회전 발레 시작 | 휘이잉 + 오르골 상승 |
| `sfx_memory_flash` | audio/sfx/sfx_memory_flash.wav | | 0.5 | 기억 컷이 번쩍일 때 | 필름 영사기 철컥 + 반짝 |
| `sfx_orgel_voice` | audio/sfx/sfx_orgel_voice.wav | | 0.55 | 6막 숨은 목소리 컷신 | 멜로디 테마의 첫 4음을 아주 느리게, 떨리는 오르골로(목소리 대신) |

## 4. 우선순위
1. 6막(소포·비명·풀기 3종·회상·숨은 목소리) → 2. 7막 구간(마을·무도회장·춤·주민·스피커·빗살) → 3. 보스·결말.
막 하나가 끝날 때마다 `audio_manifest.js`에 추가하고 알려 준다. 없는 소리는 게임에서 조용히 넘어간다.

## 5. 끝나면 보고할 것
만든 개수와 목록, 멜로디 테마가 그라모 마을 곡과 같은 조인지, loop가 끊김 없는지, 기획과 다르게 만든 것과 이유.
