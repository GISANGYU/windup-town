# 새 3~5막 소리 작업 (볼트 남작 이야기, 소리 담당 Claude 창)

이야기가 새로 바뀌었다(`GAME_DESIGN.md` 17~21절). 이 문서는 **새로 필요한 소리만** 적는다. 이전 `jobs/AUDIO.md`로 만든 소리(횡스크롤·건전지·라디오 등 127개)는 그대로 쓴다.

## 0. 규칙 (AUDIO.md와 같음)
1. 외부 음원·샘플·음성 합성 금지. numpy/scipy 절차 합성.
2. 새 생성기는 **`tools/gen_audio_act3_5b.py`** 한 파일. 기존 `tools/gen_audio.py`·`tools/gen_audio_act3_5.py`의 도구 함수를 import해서 쓴다. 기존 곡은 바꾸지 않는다.
3. 모노 16bit WAV, BGM 22050Hz, SFX 44100Hz. `assets/audio/bgm/`, `assets/audio/sfx/`.
4. 다 만들면 `assets/audio/audio_manifest.js`에 아래 표 그대로 추가, `preview.html`에서 들을 수 있게.
5. 건드리지 않는 파일: `src/`, `index.html`, `GAME_DESIGN.md`, `assets/manifest.js`, 이미지. 깃 커밋·푸시, `tools/build_web_assets.py` 실행 금지.
6. 반복음은 끊김 없이, BGM 반복은 마디 단위로 정확히.

## 1. 소리 방향
- **태엽 쪽**(그라모, 변신 후 라디오 씨): 래그타임 피아노·클라리넷·튜바·밴조·오르골, 스윙.
- **볼트 남작 쪽**: 낮은 발전기 험, 사각파·톱니파, 정확한 박자, 번개 같은 고음 지지직, 금속 타악.
- **두꺼비집 문지기**: 우스꽝스러운 저음(튜바 + 전기 버즈), 통통 튀는 리듬.
- 변신 장면과 최종 라운드는 **태엽 쪽 멜로디가 보스 리듬을 이겨 내는** 느낌.

## 2. BGM · 징글
| id | file | loop | vol | when | 방향 |
|---|---|---|---|---|---|
| `bgm_recall_night` | audio/bgm/bgm_recall_night.wav | ✔ | 0.4 | 3막 회수 신호 밤·고백 | 불길한 저음 드론 + 멀리서 울리는 사이렌 같은 사인파, 아주 느림 |
| `bgm_departure` | audio/bgm/bgm_departure.wav | ✔ | 0.4 | 그라모의 열쇠·출발 컷신 | 마을 곡 동기를 오르골로 느리게, 따뜻하고 쓸쓸 |
| `bgm_toad_boss` | audio/bgm/bgm_toad_boss.wav | ✔ | 0.5 | 4막 중간 보스전 | 150BPM, 튜바가 개굴개굴 통통 튀는 베이스 + 전기 버즈 타악, 코믹 |
| `bgm_volt_boss` | audio/bgm/bgm_volt_boss.wav | ✔ | 0.5 | 5막 보스 1·2라운드 | 168BPM, 발전기 험 위에 톱니파 리프, 정확한 박자, 위협적이지만 카툰 |
| `bgm_volt_final` | audio/bgm/bgm_volt_final.wav | ✔ | 0.55 | 5막 최종 라운드(라디오 씨 변신 후) | 같은 템포에 마을 곡 멜로디를 래그타임 금관으로 크게. 보스 리듬은 아래에 깔림 |
| `jingle_radio_reborn` | audio/bgm/jingle_radio_reborn.wav | | 0.75 | 라디오 씨 변신 컷신 | 6~8초. 꺼진 정적 → 열쇠 감는 래칫 → 나팔 팡파르로 터지는 마을 곡 |
| `jingle_toad_defeat` | audio/bgm/jingle_toad_defeat.wav | | 0.65 | 문지기 쓰러짐 | 퓨즈 펑 + 하강하는 튜바 + 짧은 승리 3음 |
| `jingle_volt_defeat` | audio/bgm/jingle_volt_defeat.wav | | 0.7 | 남작이 작은 발전기가 됨 | 큰 기계음이 쪼그라들며 오르골 한 소절로 바뀜 |
| `bgm_ending` | audio/bgm/bgm_ending.wav | ✔ | 0.5 | 결말·이후 마을 | 마을 곡을 그라모(피아노)와 라디오 씨(나팔 금관) 듀엣으로 |

## 3. 효과음
| id | file | loop | vol | when | 방향 |
|---|---|---|---|---|---|
| `sfx_battery_insert` | audio/sfx/sfx_battery_insert.wav | | 0.6 | 건전지 끼우기 모달 완료 | 덮개 열림 → 밀어 넣는 마찰 → 딸깍 → 전자음 상승 |
| `sfx_battery_shake` | audio/sfx/sfx_battery_shake.wav | | 0.45 | 건전지 빼기 모달, A·D 한 번마다 | 금속 덜그럭 짧게 |
| `sfx_battery_pop` | audio/sfx/sfx_battery_pop.wav | | 0.6 | 건전지가 빠짐 | 뽁! + 전자음 하강 + 태엽 래칫 한 번 |
| `sfx_recall_signal` | audio/sfx/sfx_recall_signal.wav | | 0.6 | 회수 신호 | 멀리서 커지는 붉은 사이렌 파동 3번 |
| `sfx_thread_pull` | audio/sfx/sfx_thread_pull.wav | | 0.5 | 태엽 힘이 실로 빠져나감 | 스프링이 풀리며 쭉 늘어나는 하강 글리산도 |
| `sfx_freeze` | audio/sfx/sfx_freeze.wav | | 0.5 | 사물이 회색으로 굳음 | 하강음 + 금속 정적, 끝이 뚝 끊김 |
| `sfx_key_give` | audio/sfx/sfx_key_give.wav | | 0.6 | 그라모가 열쇠를 뽑아 건넴 | 금속 딸깍 + 오르골 한 음(따뜻하게) |
| `sfx_toad_croak` | audio/sfx/sfx_toad_croak.wav | | 0.6 | 문지기 방전 울음 | 낮은 개굴 + 전기 버즈 |
| `sfx_toad_tongue` | audio/sfx/sfx_toad_tongue.wav | | 0.55 | 자석 혀 발사 | 쭉 늘어나는 고무 소리 + 자석 웅 |
| `sfx_breaker` | audio/sfx/sfx_breaker.wav | | 0.7 | 차단기 레버 내림 | 큰 금속 딸깍 + 전원 꺼지는 하강 |
| `sfx_floor_charge` | audio/sfx/sfx_floor_charge.wav | | 0.45 | 바닥 칸 경고(0.8초) | 지지직이 점점 커지는 상승 |
| `sfx_floor_zap` | audio/sfx/sfx_floor_zap.wav | | 0.55 | 바닥 칸 감전 | 짧은 파지직 |
| `sfx_magnet_loop` | audio/sfx/sfx_magnet_loop.wav | ✔ | 0.4 | 자석 흡입 동안 | 낮은 웅웅이 맥동 |
| `sfx_coolant_spray` | audio/sfx/sfx_coolant_spray.wav | | 0.5 | 냉각수 분사 | 치이익 (화이트노이즈 + 저역 필터) |
| `sfx_lightning_warn` | audio/sfx/sfx_lightning_warn.wav | | 0.45 | 낙뢰 경고(0.45초 전) | 짧은 고음 띠링 |
| `sfx_lightning_strike` | audio/sfx/sfx_lightning_strike.wav | | 0.65 | 낙뢰 | 쾅 + 지지직 꼬리 |
| `sfx_bomb_roll` | audio/sfx/sfx_bomb_roll.wav | ✔ | 0.3 | 건전지 폭탄이 구르는 동안 | 덜컹덜컹 + 도화선 치익 |
| `sfx_bomb_boom` | audio/sfx/sfx_bomb_boom.wav | | 0.55 | 폭탄 터짐 | 카툰 펑 |
| `sfx_plug_pull` | audio/sfx/sfx_plug_pull.wav | | 0.7 | 보스 플러그 뽑기 | 뽁! + 큰 스파크 + 남작의 비명 같은 하강 버즈 |
| `sfx_volt_laugh` | audio/sfx/sfx_volt_laugh.wav | | 0.55 | 남작 웃음(대사 시작·라디오 쓰러짐) | 톱니파를 음절처럼 끊어 "하-하-하" 리듬(목소리 합성 금지, 기계음으로) |
| `sfx_volt_overheat` | audio/sfx/sfx_volt_overheat.wav | | 0.55 | 남작 과열 | 김 빠지는 소리 + 경보 두 번 |
| `sfx_radio_jam_beam` | audio/sfx/sfx_radio_jam_beam.wav | | 0.6 | 라디오 씨 잡음 빔(1.5초) | 지지직 빔이 길게, 끝에 힘이 빠짐 |
| `sfx_radio_collapse` | audio/sfx/sfx_radio_collapse.wav | | 0.6 | 라디오 씨 쓰러짐 | 전원이 천천히 꺼지며 마지막 지직 한 번 |
| `sfx_reborn_horn` | audio/sfx/sfx_reborn_horn.wav | | 0.65 | 변신 중 나팔이 피어남 | 금관 글리산도 상승 + 반짝 |
| `sfx_crank_rusty` | audio/sfx/sfx_crank_rusty.wav | | 0.5 | 남작 크랭크 과감기, 진행마다 | 녹슨 삐걱 래칫 |
| `sfx_volt_shrink` | audio/sfx/sfx_volt_shrink.wav | | 0.6 | 남작이 작아짐 | 뾰로롱 하강 + 작은 딸깍 |
| `sfx_timestop` | audio/sfx/sfx_timestop.wav | | 0.6 | Q 갈아끼우기 순간(0.6초 시간 정지) | 낮게 가라앉는 우웅~ (피치가 떨어지며 늘어지는 소리, 0.6초) |
| `sfx_swap_wind` | audio/sfx/sfx_swap_wind.wav | | 0.55 | 태엽으로 갈아끼울 때 | 끼기기긱 태엽 감는 래칫 4번이 빠르게 (0.5초 안) |
| `sfx_threads_return` | audio/sfx/sfx_threads_return.wav | | 0.6 | 결말: 빛줄기가 마을로 돌아옴 | 반짝이는 상승 아르페지오 |

## 4. 우선순위
1. 3막(건전지 끼우기·빼기, 회수 신호, 열쇠) → 2. 4막 문지기 → 3. 5막 남작·변신·결말.
막 하나가 끝날 때마다 `audio_manifest.js`에 추가하고 알려 준다. 없는 소리는 게임에서 조용히 넘어간다.

## 5. 끝나면 보고할 것
만든 개수와 목록, loop가 끊김 없는지, 기획과 다르게 만든 것과 이유.
