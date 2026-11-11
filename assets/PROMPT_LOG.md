# 이미지 생성 Prompt Log

평가 기호: ○ 바로 합격 / △ 일부 수정 / × 폐기 / ★ 스타일 기준을 크게 올린 생성

| 날짜 | JOB | 결과 파일 | 프롬프트 요약 (STYLE BLOCK 외에 바꾼 부분) | 평가 | 메모 |
|---|---|---|---|---|---|
| 2026-11-11 | JOB-0 / 시안 1 | exec-5db11933-a437-44fe-ad9b-5d1352b555b1.png (생성 원본 보관) | 고정 블록 + 7개 대상 한 줄 + 팔레트 10색, 투명 배경 | × 재생성 | 알파 가장자리 잔여물, 그라데이션 |
| 2026-11-11 | JOB-0 / 시안 2 | exec-19553f04-6574-417b-b634-29d2f01ff2ed.png (생성 원본 보관) | 시안 1의 색 잔여물·여백·명암 정리 | × 재생성 | 알파 가장자리 잔여물 지속 |
| 2026-11-11 | JOB-0 / 시안 3 | sheets/JOB-0_a.png | 고정 블록 + 7개 대상 한 줄 + 팔레트 10색, 마젠타 배경 | △ 승인 대기 | 내장 image_gen 사용. 약한 톤 변화 잔존. 작업 중 별도로 생성된 refs/style_anchor.png는 보존하고 후보만 저장. 후속 JOB 미시작. 전체 프롬프트: sheets/JOB-0_prompts.json |
| 2026-11-11 | JOB-0 (furniture 선행 기준) | refs/style_anchor.png | 고정 STYLE·SPRITE·BOGLE·GRAMO·PIP 블록, 7개 한 줄 및 팔레트 10색. 내장 imagegen 사용, refs 4장 사전 열람. 전체 프롬프트: sheets/JOB-0_furniture_prompt.txt | △ 승인 대기 | furniture JOB-5a 제작 전 사용자 승인 필요 |
| 2026-11-11 | JOB-1 배정 | player/ | 사용자 후속 지시: JOB-1 진행. 현재 style_anchor 기준으로 보글 13종 제작 착수 | 진행 | JOB-0 시안 제시 후 사용자의 진행 지시에 따라 후속 제작 |
| 2026-11-11 | JOB-1_a | sheets/JOB-1_a.png → player/ 7종 | 고정 블록 + anchor/ref_02 첨부, 4×2 격자(7포즈), 뒷모습 무표정·주둥이 숨김, 오른쪽 옆모습 | ○ | 내장 imagegen. slice_sheet --merge 32. 전체 프롬프트: sheets/JOB-1_a_prompt.txt |
| 2026-11-11 | JOB-2a | sheets/JOB-2_a.png; npc/npc_gramo_sleepy.png; npc/npc_gramo_awake.png; npc/npc_gramo_awake_02.png | 고정 STYLE·SPRITE·GRAMO 블록 + 졸림·깨어남·반대 춤 3종 한 줄, anchor/ref_02/ref_01 첨부 | ○ 합격 | 내장 image_gen, 사용자 JOB-2 진행 지시 후 현재 앵커 사용, slice_sheet로 투명 분리. 전체 프롬프트: sheets/JOB-2_prompts.json |
| 2026-11-11 | JOB-1_b | sheets/JOB-1_b.png → player/ 걷기 6종 | 고정 블록 + anchor/ref_02/JOB-1_a 첨부, 2×3 격자, 앞·뒤 교대 보행 및 오른쪽 옆모습 접지·통과 포즈 | ○ | 내장 imagegen. 전체 프롬프트: sheets/JOB-1_b_prompt.txt |
| 2026-11-11 | JOB-2b | sheets/JOB-2_b.png; npc/npc_pip_sleepy.png; npc/npc_pip_awake.png; npc/npc_pip_awake_02.png | 고정 STYLE·SPRITE·PIP 블록 + 내려간 깃발·편지 배달·한발 춤 3종, anchor/ref_02/ref_01 첨부 | ○ 합격 | 내장 image_gen, slice_sheet로 투명 분리. 전체 프롬프트: sheets/JOB-2_prompts.json |
| 2026-11-11 | JOB-6 / 마을 바닥 | bg/bg_town_ground.png | 고정 STYLE·BACKGROUND + manifest 원문, 앵커 및 ref_02·04·03 첨부, 저채도 올리브 잔디·모래 얼룩 | ○ 합격 | 내장 image_gen. 전체 프롬프트: sheets/JOB-6_prompts.json |
| 2026-11-11 | JOB-2c | sheets/JOB-2_c.png; npc/npc_lamp_off.png; npc/npc_lamp_on.png | 고정 STYLE·SPRITE·LAMP 블록 + 졸린 소등·밝은 점등 2종, anchor/ref_02/ref_01 첨부 | ○ 합격 | 내장 image_gen, slice_sheet로 투명 분리. 전체 프롬프트: sheets/JOB-2_prompts.json |
| 2026-11-11 | JOB-6 / 집 내부 시안 1 | exec-7fd9aa12-995b-41be-b386-f481dfdcd14f.png (생성 원본 보관) | 고정 블록 + 가구 없는 실내 | × 재생성 | 벽이 약 49% 차지. 벽 1/3·바닥 2/3로 수정 |
| 2026-11-11 | JOB-6 / 집 내부 시안 2 | bg/bg_house_room.png | 시안 1을 편집하여 벽 1/3·빈 나무 바닥 2/3, 둥근 창문·빈 액자 축소 | ○ 합격 | 내장 image_gen. 전체 프롬프트: sheets/JOB-6_room_revision_prompt.txt |
| 2026-11-11 | JOB-4a | sheets/JOB-4_a.png; props/prop_house.png, prop_tree_round.png, prop_tree_tall.png, prop_bush.png, prop_rock.png, prop_key.png | 고정 STYLE·SPRITE 블록 + manifest 원문, 3열 2행 소품 6종. anchor·ref_02·ref_01·ref_03 첨부. 내장 image_gen 사용 | ○ 합격 | slice_sheet.py로 6개 RGBA 분리. 집 문 아래 중앙, 바닥 그림자 없음. 전체 프롬프트: sheets/JOB-4_prompts.json |
| 2026-11-11 | JOB-4b | sheets/JOB-4_b.png; props/prop_fence.png | 고정 STYLE·SPRITE 블록 + manifest 원문, 4개 말뚝·가로대 2개·좌우 수직 절단. 동일 레퍼런스 4장, 내장 image_gen | ○ 합격 | slice_sheet.py로 RGBA 분리. 좌우 가로대 높이 일치. 전체 프롬프트: sheets/JOB-4_prompts.json |
| 2026-11-11 | JOB-4c | sheets/JOB-4_c.png; props/prop_pond.png, prop_stage.png | 고정 STYLE·SPRITE 블록 + manifest 원문, 연못·원형 무대 1행 2열, 높은 3/4 시점. 동일 레퍼런스 4장, 내장 image_gen | ○ 합격 | slice_sheet.py로 2개 RGBA 분리. 연잎 2개, 무대 중앙 비움. JOB-4 전체 9종 check_assets OK 및 contact_sheet 육안 검수. 전체 프롬프트: sheets/JOB-4_prompts.json |
| 2026-11-11 | JOB-5a | sheets/JOB-5_a.png; furniture/ 4종 | 고정 STYLE·SPRITE + manifest 원문, 의자·테이블·화분·미니 축음기 한 줄, anchor/ref_02 첨부 | ○ 합격 | 내장 image_gen 사용. slice_sheet.py로 RGBA 분리. 전체 프롬프트: sheets/JOB-5_prompts.json |
| 2026-11-11 | JOB-5b | sheets/JOB-5_b.png; fx/ 5종 | 고정 STYLE·SPRITE + manifest 원문, 음표 2종·졸음·반짝임·착지 먼지, anchor/ref_02 첨부 | ○ 합격 | 내장 image_gen. 자동 조각 검출 6개로 분리되어 slice_sheet.remove_background 후 빈 간격 기준 5개 영역으로 분리, 작은 조각 전부 보존. 좌표: sheets/JOB-5_b_slicing.json |
| 2026-11-11 | JOB-5c | sheets/JOB-5_c.png; ui/ui_card_frame.png; ui/ui_key_e.png | 고정 STYLE·SPRITE + manifest 원문, 빈 자막 카드와 E 키캡, anchor/ref_02 첨부 | ○ 합격 | 내장 image_gen. slice_sheet.py로 RGBA 분리. JOB-5 11종 check_assets OK, contact_sheet 육안 검수 완료. 전체 프롬프트: sheets/JOB-5_prompts.json |
| 2026-11-11 | JOB-3 | sheets/JOB-3_a.png → portrait/ 5종 | 고정 STYLE·SPRITE·GRAMO·PIP·BOGLE + 졸림/깨어남 그라모·피프, 미소 보글 한 줄 흉상. anchor/ref_02/JOB-2_a/JOB-2_b/player_idle_down 첨부 | ○ 합격 | 내장 image_gen. slice_sheet로 투명 분리, 5종 검사 통과, 마젠타 잔여 0. 전체 프롬프트: sheets/JOB-3_prompts.json |
| 2026-11-11 | JOB-6 / 먼 숲 시안 1 | exec-3040721b-a942-44a4-a6c3-09e79606a27b.png (생성 원본 보관) | 고정 블록 + 가로 숲 배경 및 하단 알파 요청 | × 재생성 | 출력 비율 3:1 및 투명 가장자리 색 잔여물 |
| 2026-11-11 | JOB-6 / 먼 숲 시안 2 | bg/bg_town_backdrop.png | 낮은 원경 언덕·둥근 숲, 하단 실제 알파 | ○ 합격 | 내장 image_gen, 원본 sheets/JOB-6_c.png. 여백 crop (0,160,1983,470), 알파 2 이하 잔여물 제거, 1280×200 저장. 합성 검수 완료. 전체 프롬프트: sheets/JOB-6_backdrop_revision_prompt.txt |
| 2026-11-11 | JOB-6 / 최종 규격 | bg/bg_town_ground.png, bg/bg_house_room.png | 생성 결과 RGBA PNG 규격화, 1280×720 | ○ 합격 | 원본 sheets/JOB-6_a.png, JOB-6_b.png 보존. 배경 3종 시각·비율·알파 검사 |
| 2026-11-11 | JOB-7 / 컷신 1 | story/story_01_town.png | 앵커 기준 행복한 광장, 그라모·피프, 하단 자막 여백 | ○ 합격 | 내장 image_gen. 프롬프트: sheets/JOB-7_prompts.json |
| 2026-11-11 | JOB-7 / 컷신 2 | story/story_02_thief.png | 밤의 열쇠 도난, 악당 실루엣·노란 눈, 열쇠 3개 | ○ 합격 | 내장 image_gen. 프롬프트: sheets/JOB-7_prompts.json |
| 2026-11-11 | JOB-7 / 컷신 3 | story/story_03_sleep.png | 첫 컷과 같은 광장, 잠든 주민, 흩어지는 열쇠 3개, 문자 없는 졸음 표현 | ○ 합격 | 내장 image_gen. 완성 컷 1 추가 참조. 프롬프트: sheets/JOB-7_prompts.json |
| 2026-11-11 | JOB-7 / 컷신 4 | story/story_04_arrival.png | 빨간 여행 가방을 든 보글의 아침 도착, 얼굴 자막 영역 밖 배치 | ○ 합격 | 내장 image_gen. 완성 컷 1 추가 참조. 프롬프트: sheets/JOB-7_prompts.json |
| 2026-11-11 | JOB-7 / 컷신 5 | story/story_05_teaser.png | 시계탑 꼭대기 자명종 실루엣, 노란 눈, 숫자 없는 시계판 | ○ 합격 | 내장 image_gen. 완성 컷 1 추가 참조. 프롬프트: sheets/JOB-7_prompts.json |
| 2026-11-11 | JOB-7 / 모달 시안 1 | exec-56949674-90dd-44a9-9bd8-bbdb98d61186.png (생성 원본) | 그라모 뒷면·정면 대칭 열쇠 마젠타 시트 | × 재생성 | 구멍이 전체 실루엣 중심보다 아래에 있음 |
| 2026-11-11 | JOB-7 / 모달 시안 2 | exec-ee3722b6-19fd-4c22-89ae-e66cab0f1ea8.png (생성 원본) | 나팔 축소·구멍 위치 수정 | × 재생성 | 중심판을 50px 위로 추가 이동 |
| 2026-11-11 | JOB-7 / 모달 최종 | wind/wind_gramo_back.png, wind/wind_key.png | 나팔 축소, 전체 실루엣 중심에 빈 구멍, 수직 대칭 열쇠 | ○ 합격 | 내장 image_gen + 지정 slice_sheet.py로 투명 PNG 분리. 원본: sheets/JOB-7_wind.png |
| 2026-11-11 | JOB-7 / 최종 검수 | story 5개 + wind 2개 | PNG 무결성·RGBA·16:9·모달 투명도 검사, 전체 contact sheet 시각 확인 | ○ 7/7 합격 | 최종 실제 프롬프트: sheets/JOB-7_generation_record.json, 검사: sheets/JOB-7_validation.json |
| 2026-11-11 | JOB-8a | sheets/JOB-8_a.png; boss/ 6포즈 | 고정 STYLE·SPRITE·COUNT 블록 + manifest 원문, 3×2 배치, 지친 자세 오른쪽 열쇠 강조 | ○ 합격 | 내장 image_gen, anchor/ref_02/ref_01/npc_gramo_awake 첨부. slice_sheet --merge 90 --min-area 80. 전체 프롬프트: sheets/JOB-8_prompts.json |
| 2026-11-11 | JOB-8b | sheets/JOB-8_b.png; boss/boss_cuckoo.png; portrait/ 백작 2종; furniture/furn_cuckoo.png | 뻐꾸기시계·화난 백작 초상·뻐꾸기 초상·얼굴 없는 보상 가구 2×2 | ○ 합격 | 내장 image_gen, 기본 레퍼런스 4장 및 JOB-8_a 첨부. slice_sheet로 4개 분리 |
| 2026-11-11 | JOB-8c | sheets/JOB-8_c.png; fx/ 신규 4종 | 정면 원형 10개 이빨 톱니·황동 스프링·김·상향 3개 음파 곡선 | ○ 합격 | 내장 image_gen. slice_sheet.remove_background 후 빈 간격 기준 그룹 분리로 곡선·동세 보존. 좌표: sheets/JOB-8_c_slicing.json |
| 2026-11-11 | JOB-8 / 전투 배경 | sheets/JOB-8_arena.png; bg/bg_arena.png | 고정 STYLE·BACKGROUND + manifest, 밤 광장·상단 시계탑·하단 빈 무대 | ○ 합격 | 내장 image_gen, 기본 4개 참조 및 story_01_town 참조. 1280×720 RGBA 규격화 |
| 2026-11-11 | JOB-8 / 감기 모달 시안 1 | sheets/JOB-8_wind_draft.png | 백작 등 정면·대칭 팔·열쇠 없는 황동 구멍 | △ 위치 보정 | 전체 실루엣 중심보다 열쇠 구멍이 약 74px 낮아 위로 이동 편집 |
| 2026-11-11 | JOB-8 / 감기 모달 최종 | sheets/JOB-8_wind.png; wind/wind_boss_back.png | 기존 시안의 황동 구멍판을 위로 이동, 백작 뒤태 유지 | ○ 합격 | 내장 image_gen 편집 + slice_sheet.py. 회전 열쇠가 놓이는 중앙 영역의 빈 구멍 확인. 실제 수정 프롬프트: sheets/JOB-8_generation_record.json |
| 2026-11-11 | JOB-8 / 등장 컷신 | sheets/JOB-8_arrive.png; story/story_06_boss_arrive.png | 확정된 백작의 자정 광장 등장, 보글 대치·그라모·숨어 있는 피프, 얼굴은 하단 자막 영역 밖 | ○ 합격 | 내장 image_gen, 기본 4장 및 JOB-8_a 참조. 1280×720 RGBA |
| 2026-11-11 | JOB-8 / 엔딩 시안 | sheets/JOB-8_defeat_draft.png | 아침 광장 축제, 보글·그라모·피프와 기둥의 뻐꾸기시계 | △ 얼굴 수정 | 시계가 얼굴 없는 가구 버전으로 생성되어 변신한 백작의 파이 눈·미소로 수정 |
| 2026-11-11 | JOB-8 / 엔딩 최종 | sheets/JOB-8_defeat.png; story/story_07_boss_defeat.png | 뻐꾸기시계 시계판만 파이 눈과 온순한 미소로 교체, 다른 요소 유지 | ○ 합격 | 내장 image_gen 편집. JOB-8_b의 캐릭터 디자인 참조, 1280×720 RGBA |
| 2026-11-11 | JOB-8 / 최종 검수 | 18종 전체; sheets/JOB-8_contact.png | PNG 무결성·RGBA·manifest 경로·스프라이트 투명도·잔류 마젠타·캐릭터 최소 높이·16:9 배경·원형 톱니 검사 | ○ 18/18 합격 | check_assets: 전체 74/74 OK, contact_sheet 및 JOB-8 비교 시트 육안 확인. 검사: sheets/JOB-8_validation.json, 실제 생성·수정 프롬프트: sheets/JOB-8_generation_record.json |
| 2026-11-11 | INTRO / 배경 | sheets/INTRO_background.png; bg/bg_intro.png | 고정 STYLE·BACKGROUND + 기존 마을 참조, 양옆 오두막·나무·시계탑, 중앙 제목·버튼 여백 | ○ 합격 | 사용자 신규 시작 화면 이미지 요청. 내장 image_gen, anchor/ref_02/story_01_town 첨부. 1280×720 RGBA |
| 2026-11-11 | INTRO / 버튼 시안 | sheets/INTRO_buttons_draft.png | 시작·게임설명 카드 2종 | × 재생성 | 시트 중앙 장식이 맞닿아 단일 조각으로 검출. 정사각 시트·둥근 직사각형·큰 간격으로 재생성 |
| 2026-11-11 | INTRO / 버튼 최종 | sheets/INTRO_buttons.png; ui/ui_button_start.png; ui/ui_button_help.png | 붉은 시작 버튼·크림 설명 버튼, 태엽 열쇠·책 문양, 텍스트 영역 비움 | ○ 합격 | 내장 image_gen. slice_sheet.py로 2개 RGBA 분리. 수정 프롬프트: sheets/INTRO_buttons_revision_prompt.txt |
| 2026-11-11 | INTRO / 설명 모달 | sheets/INTRO_modal.png; ui/ui_help_modal.png | 크림 본문·황동 테두리·상단 태엽 장식, 설명 문구용 넓은 여백 | ○ 합격 | 내장 image_gen, anchor/ref_02/ui_card_frame/INTRO_buttons 참조. slice_sheet.py로 RGBA 분리 |
| 2026-11-11 | INTRO / 최종 검수 | 신규 4종; sheets/INTRO_contact.png | PNG·RGBA·투명도·잔류 마젠타·경로 검사, 이미지 비교 | ○ 4/4 합격 | manifest에 요청 리소스 4종 등록. 전체 78/78 OK. 조작법·배치: sheets/INTRO_layout.json, 프롬프트: sheets/INTRO_prompts.json. 게임 이벤트 연결은 미구현(이미지 제작 범위) |
| 2026-11-11 | JOB-12 / a 초안 | sheets/JOB-12_a_draft.png | 고정 STYLE·SPRITE·SURVEYOR + 5포즈, 내장 image_gen | 재생성: 노란 본체 장식, 일부 두 팔, 걷기 옆면·나선 렌즈 보정 필요 |
| 2026-11-11 | JOB-12 / a 수정 | sheets/JOB-12_a.png | 회색 몸체·단일 팔·망치 접촉·걷기 보폭·나선 렌즈 보정, 내장 image_gen | 생성 완료, 분리 검수 진행 |
| 2026-11-11 | JOB-10 | props/prop_battery.png | 고정 STYLE·SPRITE + manifest 원문; 차가운 회색 건전지, 은색 뚜껑·짙은 띠, 로고·기호·얼굴 없음 | ○ 합격 | 내장 image_gen, anchor/ref_02/npc_lamp_on 참조. 시트 a/b/c 순차 생성, slice_sheet.py 분리, 재생성 없음. 전체 프롬프트: sheets/JOB-10_prompts.json |
| 2026-11-11 | JOB-10 | props/prop_battery_pack.png | 고정 STYLE·SPRITE + manifest 원문; 옆에서 본 회색 건전지 팩, 스트랩 클립·주황 표시등 | ○ 합격 | 내장 image_gen, anchor/ref_02/npc_lamp_on 참조. 시트 a/b/c 순차 생성, slice_sheet.py 분리, 재생성 없음. 전체 프롬프트: sheets/JOB-10_prompts.json |
| 2026-11-11 | JOB-10 | props/prop_sheet_music.png | 고정 STYLE·SPRITE + manifest 원문; 찢어진 크림 악보, 오선 5줄과 음표 모양 | ○ 합격 | 내장 image_gen, anchor/ref_02/npc_lamp_on 참조. 시트 a/b/c 순차 생성, slice_sheet.py 분리, 재생성 없음. 전체 프롬프트: sheets/JOB-10_prompts.json |
| 2026-11-11 | JOB-10 | props/prop_ribbon.png | 고정 STYLE·SPRITE + manifest 원문; 빨간 리본 매듭과 느슨한 꼬리 2개 | ○ 합격 | 내장 image_gen, anchor/ref_02/npc_lamp_on 참조. 시트 a/b/c 순차 생성, slice_sheet.py 분리, 재생성 없음. 전체 프롬프트: sheets/JOB-10_prompts.json |
| 2026-11-11 | JOB-10 | furniture/furn_bunting.png | 고정 STYLE·SPRITE + manifest 원문; 두 나무 기둥 사이 빨강·파랑·노랑 삼각 깃발 | ○ 합격 | 내장 image_gen, anchor/ref_02/npc_lamp_on 참조. 시트 a/b/c 순차 생성, slice_sheet.py 분리, 재생성 없음. 전체 프롬프트: sheets/JOB-10_prompts.json |
| 2026-11-11 | JOB-10 | furniture/furn_lantern.png | 고정 STYLE·SPRITE + manifest 원문; 굽은 나무 기둥의 둥근 노란 종이 등불 | ○ 합격 | 내장 image_gen, anchor/ref_02/npc_lamp_on 참조. 시트 a/b/c 순차 생성, slice_sheet.py 분리, 재생성 없음. 전체 프롬프트: sheets/JOB-10_prompts.json |
| 2026-11-11 | JOB-10 | furniture/furn_banner.png | 고정 STYLE·SPRITE + manifest 원문; 나무 기둥의 무늬 없는 크림·빨강 깃발 | ○ 합격 | 내장 image_gen, anchor/ref_02/npc_lamp_on 참조. 시트 a/b/c 순차 생성, slice_sheet.py 분리, 재생성 없음. 전체 프롬프트: sheets/JOB-10_prompts.json |
| 2026-11-11 | JOB-10 | portrait/portrait_lamp_awake.png | 고정 STYLE·SPRITE·LAMP + manifest 원문; 기존 가로등 머리 유지, 한쪽 눈을 감은 밝은 표정 | ○ 합격 | 내장 image_gen, anchor/ref_02/npc_lamp_on 참조. 시트 a/b/c 순차 생성, slice_sheet.py 분리, 재생성 없음. 전체 프롬프트: sheets/JOB-10_prompts.json |
| 2026-11-11 | JOB-10 | portrait/portrait_lamp_shy.png | 고정 STYLE·SPRITE·LAMP + manifest 원문; 기존 가로등 머리 유지, 아래를 보는 파이 눈·작은 홍조 | ○ 합격 | 내장 image_gen, anchor/ref_02/npc_lamp_on 참조. 시트 a/b/c 순차 생성, slice_sheet.py 분리, 재생성 없음. 전체 프롬프트: sheets/JOB-10_prompts.json |

| 2026-11-11 | JOB-9 / 전신 시안 | sheets/JOB-9_a_draft.png | 고정 STYLE·SPRITE·RADIO + manifest 4포즈, anchor/ref_02/PIP 참조 | 재생성 | 태엽 포즈 한쪽 팔 누락 및 말하기 음파 형태 수정 필요 |
| 2026-11-11 | JOB-9 / 전신 수정 | sheets/JOB-9_a.png | 시안 디자인 유지, 태엽 포즈 두 번째 팔·장갑 추가 및 탄성 실루엣, 말하기 음파를 곡선 3개로 수정 | 합격 | 내장 image_gen 편집, 수정 프롬프트: sheets/JOB-9_revision_prompt.txt |
| 2026-11-11 | JOB-9 / 초상화 | sheets/JOB-9_b.png | 고정 STYLE·SPRITE·RADIO + manifest 2종, 전신 시안을 추가 참조 | 합격 | 내장 image_gen, 프롬프트: sheets/JOB-9_prompts.json |
| 2026-11-11 | JOB-9 | npc/npc_radio_idle.png | RADIO standing upright and stiff, friendly salesman smile, one white glove raised palm-up as if presenting a product, antenna perfectly straight, dial eyes showing two small glowing dot lights | 합격 | slice_sheet.py 분리, RGBA·투명도·잔류 마젠타·최소 높이 검사 통과 |
| 2026-11-11 | JOB-9 | npc/npc_radio_talk.png | RADIO talking excitedly like a TV salesman, speaker-grille mouth wide open, both arms spread wide, leaning forward, dial eyes as two glowing dots, three small curved sound lines near the speaker | 합격 | slice_sheet.py 분리, RGBA·투명도·잔류 마젠타·최소 높이 검사 통과 |
| 2026-11-11 | JOB-9 | npc/npc_radio_off.png | RADIO switched off and slumped forward, dial eyes dark and empty with no lights, antenna drooping down, arms hanging limp, colors slightly faded, sad and lifeless but still cartoonish | 합격 | slice_sheet.py 분리, RGBA·투명도·잔류 마젠타·최소 높이 검사 통과 |
| 2026-11-11 | JOB-9 | npc/npc_radio_crank.png | RADIO after getting a wind-up crank: a brass crank wheel with a knob attached to his right side, his two dial eyes now show pie-cut pupils for the first time, warm grateful smile, body bouncing in a rubber hose curve, antenna wiggling | 합격 | slice_sheet.py 분리, RGBA·투명도·잔류 마젠타·최소 높이 검사 통과 |
| 2026-11-11 | JOB-9 | portrait/portrait_radio.png | close-up bust of RADIO with a wide salesman smile, dial eyes as two glowing dot lights | 합격 | slice_sheet.py 분리, RGBA·투명도·잔류 마젠타·최소 높이 검사 통과 |
| 2026-11-11 | JOB-9 | portrait/portrait_radio_crank.png | close-up bust of RADIO with the brass crank on his side, pie-cut pupils inside the dial eyes, gentle warm smile | 합격 | slice_sheet.py 분리, RGBA·투명도·잔류 마젠타·최소 높이 검사 통과 |
| 2026-11-11 | JOB-12 / b | sheets/JOB-12_b.png | 고정 STYLE·SPRITE·SURVEYOR + 초상화·말뚝 2·격자 지도·회색 잡음, 내장 image_gen | 생성 완료, 분리 검수 진행 |
| 2026-11-11 | JOB-12 / b 분리 검수 | sheets/JOB-12_b_draft.png | 분리 도구 merge 70 검사 | 재생성: 떨어진 잡음 조각이 지도 영역에 합쳐져 이펙트만 연결형으로 수정 |
| 2026-11-11 | JOB-12 / b 수정 | sheets/JOB-12_b.png | 잡음 이펙트를 연결된 회색·흰색 지그재그로 수정, 내장 image_gen | 합격: 5조각 분리 |
| 2026-11-11 | JOB-12 | npc/npc_surveyor_idle.png | SURVEYOR standing perfectly still and rigid on its three straight legs, lens eye scanning forward, antenna up / 고정 STYLE·SPRITE·SURVEYOR, anchor/ref_02 참조 | 합격: RGBA·투명도·마젠타 잔류 0·최소 크기·육안 검수 |
| 2026-11-11 | JOB-12 | npc/npc_surveyor_walk_01.png | SURVEYOR walking to the RIGHT in side view, one straight leg stepping forward like a compass, body perfectly level, no bounce / 고정 STYLE·SPRITE·SURVEYOR, anchor/ref_02 참조 | 합격: RGBA·투명도·마젠타 잔류 0·최소 크기·육안 검수 |
| 2026-11-11 | JOB-12 | npc/npc_surveyor_walk_02.png | SURVEYOR walking to the RIGHT in side view, the other straight leg stepping forward, body perfectly level / 고정 STYLE·SPRITE·SURVEYOR, anchor/ref_02 참조 | 합격: RGBA·투명도·마젠타 잔류 0·최소 크기·육안 검수 |
| 2026-11-11 | JOB-12 | npc/npc_surveyor_hammer.png | SURVEYOR driving a wooden survey stake into the ground with a small hammer held in a mechanical claw arm, precise and emotionless / 고정 STYLE·SPRITE·SURVEYOR, anchor/ref_02 참조 | 합격: RGBA·투명도·마젠타 잔류 0·최소 크기·육안 검수 |
| 2026-11-11 | JOB-12 | npc/npc_surveyor_stun.png | SURVEYOR stunned and tilted, legs splayed, lens eye showing a spiral, small grey zigzag static sparks around its head / 고정 STYLE·SPRITE·SURVEYOR, anchor/ref_02 참조 | 합격: RGBA·투명도·마젠타 잔류 0·최소 크기·육안 검수 |
| 2026-11-11 | JOB-12 | portrait/portrait_surveyor.png | close-up of SURVEYOR's boxy grey head, two small round glowing dot eyes below the lens, expressionless / 고정 STYLE·SPRITE·SURVEYOR, anchor/ref_02 참조 | 합격: RGBA·투명도·마젠타 잔류 0·최소 크기·육안 검수 |
| 2026-11-11 | JOB-12 | props/prop_stake.png | a wooden survey stake stuck upright in the ground, an orange #E07A3A tag tied near the top and a tiny metal antenna with a small light, plain with NO text or numbers / 고정 STYLE·SPRITE·SURVEYOR, anchor/ref_02 참조 | 합격: RGBA·투명도·마젠타 잔류 0·최소 크기·육안 검수 |
| 2026-11-11 | JOB-12 | props/prop_stake_pulled.png | the same wooden survey stake lying on its side on the ground, tag loose, antenna light off / 고정 STYLE·SPRITE·SURVEYOR, anchor/ref_02 참조 | 합격: RGBA·투명도·마젠타 잔류 0·최소 크기·육안 검수 |
| 2026-11-11 | JOB-12 | props/prop_city_map.png | a rolled-up pale blue blueprint scroll tied with a grey string, slightly unrolled at one end showing straight grid lines only, no text / 고정 STYLE·SPRITE·SURVEYOR, anchor/ref_02 참조 | 합격: RGBA·투명도·마젠타 잔류 0·최소 크기·육안 검수 |
| 2026-11-11 | JOB-12 | fx/fx_static.png | a small burst of grey and white zigzag static sparks, jagged straight lines, cartoon electric crackle / 고정 STYLE·SPRITE·SURVEYOR, anchor/ref_02 참조 | 합격: RGBA·투명도·마젠타 잔류 0·최소 크기·육안 검수 |
| 2026-11-11 | JOB-12 / 최종 검수 | 10종 전체; sheets/JOB-12_contact.png | 내장 image_gen, slice_sheet a merge=70 / b merge=40; 캐릭터 508~526px, 초상화 397px; 생성 당시 prop_battery 미존재로 지정 팔레트 사용, 완성 후 추가된 건전지와 비교 | 합격 10/10; 전체 검사 시점 OK 114 / 없음 41 / 확인 필요 0 / 오류 0. 프롬프트: sheets/JOB-12_generation_record.json, 검사: sheets/JOB-12_validation.json |
| 2026-11-11 | JOB-11 | sheets/JOB-11_a_draft.png | 내장 image_gen, 고정 STYLE·SPRITE·RADIO와 모달 2개 | 재생성: 안테나 포함 중심 대비 소켓이 낮고 크랭크 손잡이가 원형 밖으로 돌출 |

| 2026-11-11 | JOB-14 / 시트 a 초안 | sheets/JOB-14_a_draft.png | 고정 블록 + 기존 보글 기준, 달리기4·대시2 | 재생성: 달리기 후반 팔다리 변화와 곧은 대시 다리 보정 |
| 2026-11-11 | JOB-14 / 동작 보정 | sheets/JOB-14_a_pre_pack.png | 달리기3·4 팔과 다리, 대시 직선 다리 수정 | 재생성: 작업 중 완성된 JOB-10 팩 디자인 반영 필요 |
| 2026-11-11 | JOB-14 / 시트 b 초안 | sheets/JOB-14_b_pre_pack.png | 교체·감기·충전·합선·피격 5개 | 재생성: 확정 팩 반영, 합선 케이블 제거, 교체 손의 건전지 크기 축소 |
| 2026-11-11 | JOB-14 | player/player_run_side_01.png | 5막 태엽 달리기 1(오른쪽). 출렁이는 러버호스 보폭; 내장 image_gen, 확정 JOB-10 팩 참조 | 합격 |
| 2026-11-11 | JOB-14 | player/player_run_side_02.png | 5막 태엽 달리기 2; 내장 image_gen, 확정 JOB-10 팩 참조 | 합격 |
| 2026-11-11 | JOB-14 | player/player_run_side_03.png | 5막 태엽 달리기 3; 내장 image_gen, 확정 JOB-10 팩 참조 | 합격 |
| 2026-11-11 | JOB-14 | player/player_run_side_04.png | 5막 태엽 달리기 4; 내장 image_gen, 확정 JOB-10 팩 참조 | 합격 |
| 2026-11-11 | JOB-14 | player/player_dash_side_01.png | 5막 건전지 대시 1. 뻣뻣하게 앞으로 기울어짐, 등에 건전지 팩, 튐 없음; 내장 image_gen, 확정 JOB-10 팩 참조 | 합격 |
| 2026-11-11 | JOB-14 | player/player_dash_side_02.png | 5막 건전지 대시 2; 내장 image_gen, 확정 JOB-10 팩 참조 | 합격 |
| 2026-11-11 | JOB-14 | player/player_swap.png | 5막 갈아끼우기: 등 덮개를 열고 한 손엔 건전지, 한 손엔 태엽 열쇠; 내장 image_gen, 확정 JOB-10 팩 참조 | 합격 |
| 2026-11-11 | JOB-14 | player/player_wind_self.png | 5막 스스로 태엽 감기(게이지 회복); 내장 image_gen, 확정 JOB-10 팩 참조 | 합격 |
| 2026-11-11 | JOB-14 | player/player_charge.png | 5막 충전소에서 충전 중. 등에 플러그, 눈 감고 편안; 내장 image_gen, 확정 JOB-10 팩 참조 | 합격 |
| 2026-11-11 | JOB-14 | player/player_short.png | 5막 물에 닿아 합선. 지지직, 몸이 굳음; 내장 image_gen, 확정 JOB-10 팩 참조 | 합격 |
| 2026-11-11 | JOB-14 | player/player_hurt_side.png | 5막 피격(뒤로 밀림); 내장 image_gen, 확정 JOB-10 팩 참조 | 합격 |
| 2026-11-11 | JOB-14 / 최종 검수 | sheets/JOB-14_contact.png; sheets/JOB-14_validation.json | 11/11 PNG·RGBA·투명 모서리·높이300px 이상·마젠타 잔류0 검사; 실제 프롬프트: sheets/JOB-14_generation_record.json | 합격 |
| 2026-11-11 | JOB-13 | story/story_13_surveyors.png | built-in image_gen; 원본 고정 블록, 3대 직선 행진, 주민 엿보기, 하단 자막 여백 | 합격 |
| 2026-11-11 | JOB-11 | sheets/JOB-11_story_08_draft.png | 축제, 춤추는 주민과 이마를 닦는 그라모 | 재생성 예정: 가로등 아래 바닥 그림자 제거 필요 |

| 2026-11-11 | JOB-13 | sheets/JOB-13_grey_spread_draft.png | 회색 확산 첫 시안; 원 안쪽 일부 곡선 잔디와 유채색 외곽선 수정 필요 | 재생성 |
| 2026-11-11 | JOB-13 | story/story_14_grey_spread.png | 회색 확산 재생성; 회색 내부 직선 풀과 꽃줄기, 삼각대 세 다리, 하단 여백 | 합격 |
| 2026-11-11 | JOB-11 | sheets/JOB-11_story_09_draft.png | 건전지 수레를 밀고 축제에 들어오는 라디오 | 재생성 예정: 다이얼당 불빛 한 점으로 수정, 건전지 그림 삭제 |
| 2026-11-11 | JOB-13 | sheets/JOB-13_chase_draft.png | 추격 첫 시안; 발밑 그림자 제거 및 하단 30% 여백 확대 필요 | 재생성 |
| 2026-11-11 | JOB-11 | story/story_10_radio_down.png | 고정 STYLE·BACKGROUND·캐릭터 블록, 해질녘 방전 라디오와 걱정하는 주민 | 합격: 빈 다이얼·처진 안테나·얼굴 자막영역 회피 확인 |
| 2026-11-11 | JOB-13 | story/story_15_chase.png | 추격 재생성; 건전지 팩, 불빛 점 눈, 직선 속도선, 발밑 그림자 제거, 하단 여백 | 합격 |
| 2026-11-11 | JOB-11 | story/story_11_broadcast.png | 크랭크와 파이 눈을 얻은 라디오, 그라모와 무대에서 마을 전체로 음악 방송 | 합격: 크랭크·눈 변화·풍부한 마을 색·얼굴 상단 배치 확인 |
| 2026-11-11 | JOB-13 | sheets/JOB-13_radio_past_draft.png | 회상 첫 시안; 고물 상자가 하단 자막 영역을 침범해 구도 수정 | 재생성 |
| 2026-11-11 | JOB-11 | sheets/JOB-11_story_12_draft.png | 도시 신호 예고 | 재생성: 전신과 밝은 미소 대신 다이얼 클로즈업·불안한 분위기 강화 |
| 2026-11-11 | JOB-13 | story/story_16_radio_past.png | 회상 재생성; 전체 세피아, 크랭크 없음, 불빛 점 눈, 기계 손과 고물 상자, 하단 여백 | 합격 |
| 2026-11-11 | JOB-15 | sheets/JOB-15_mid1_draft.png | 내장 image_gen; 고정 STYLE·SPRITE·SIDE 블록과 지정 레퍼런스; 마을 덤불·나무·울타리 | 재생성: 둥근 나무를 지정된 포플러로 변경 |
| 2026-11-11 | JOB-15 | sheets/JOB-15_mid3_draft.png | 내장 image_gen; 회색 도시 상점·가로등 띠 | 재생성: 둥근 지붕·따뜻한 색을 직선·무채색으로 수정 |
| 2026-11-11 | JOB-15 | sheets/JOB-15_far3_draft.png | 내장 image_gen; 도시 송신탑 먼 배경 | 재생성: 꽃·녹색 덤불·황토색 바닥 제거, 회색 빌딩 숲으로 변경 |
| 2026-11-11 | JOB-15 | sheets/JOB-15_mid3_revision1.png | 내장 image_gen; 직선 회색 상점·셔터·가로등 | 재생성: 가로등과 상점 사이 좁은 틈의 마젠타 얼룩 제거 |
| 2026-11-11 | JOB-15 | road/bg_road1_mid.png | 내장 image_gen; 따뜻한 포플러·둥근 덤불·울타리; slice_sheet 기본값 | 합격: PNG RGBA·투명·마젠타 0; 반복 육안 확인, 경계 픽셀 미세 차이 있음 |
| 2026-11-11 | JOB-15 | road/bg_road2_mid.png | 내장 image_gen; 회색 파이프·철골·처진 전선; slice_sheet 기본값 | 합격: PNG RGBA·투명·마젠타 0; 반복 육안 확인, 경계 픽셀 미세 차이 있음 |
| 2026-11-11 | JOB-15 | road/bg_road3_mid.png | 내장 image_gen; 직선 회색 상점·빈 간판·닫힌 셔터; 틈 배경 재생성, slice_sheet BIG_RATIO=0.5 런타임 설정(도구 파일 변경 없음) | 합격: PNG RGBA·투명·마젠타 0; 반복 육안 확인, 경계 픽셀 미세 차이 있음 |
| 2026-11-11 | JOB-15 | road/bg_road1_far.png | 내장 image_gen; 고정 STYLE·BACKGROUND·SIDE; 따뜻한 아침·언덕·왼편 작은 마을 | 합격: 16:9 허용오차·RGBA·불투명; 반복 육안 확인, 경계 픽셀 미세 차이 있음 |
| 2026-11-11 | JOB-15 | road/bg_road2_far.png | 내장 image_gen; 공장 굴뚝·톱니·긴 컨베이어, 왼쪽 따뜻한 색에서 오른쪽 회색으로 변화 | 합격: 16:9 허용오차·RGBA·불투명; 반복 육안 확인, 경계 픽셀 미세 차이 있음 |
| 2026-11-11 | JOB-15 | road/bg_road3_far.png | 내장 image_gen; 무채색 직선 빌딩 숲·중앙 송신탑의 붉은 불빛 하나 | 합격: 16:9 허용오차·RGBA·불투명; 반복 육안 확인, 경계 픽셀 미세 차이 있음 |
| 2026-11-11 | JOB-15 / 검수 | 6종; sheets/JOB-15_contact.png; sheets/JOB-15_seam_preview.png | check_assets 및 contact_sheet 실행. 프롬프트 전체: sheets/JOB-15_generation_record.json; 수치 검수: sheets/JOB-15_validation.json | 파일 검사 6/6 OK. 전체 검사 시점 OK 128 / 없음 27(필수 13) / 확인 필요 0 / 오류 0. 단 좌우 끝 픽셀 완전 일치 조건은 미충족이며 검수 기록에 명시. |
| 2026-11-11 | JOB-13 | story/story_17_road_open.png | 태엽 라디오와 보글, 배웅하는 주민, 따뜻한 마을과 먼 회색 도시 대비 | 합격 |

| 2026-11-11 | JOB-11 | sheets/JOB-11_a_center_draft.png | 모달 원형 크랭크·낮은 안테나로 재생성 | 재생성: 소켓 중심을 추가 보정 |
| 2026-11-11 | JOB-11 | wind/wind_radio_back.png | 고정 STYLE·SPRITE·RADIO, 오른쪽 옆면과 빈 황동 소켓, 위치 보정 후 slice_sheet.py 분리 | 합격: 637x631 RGBA·투명 배경·잔류 마젠타 0 |
| 2026-11-11 | JOB-11 | wind/wind_crank.png | 고정 STYLE·SPRITE, 정면 원형 6개 살·원 안쪽 상단 손잡이 | 합격: 607x603 RGBA·투명 배경·잔류 마젠타 0 |
| 2026-11-11 | JOB-11 | story/story_08_festival.png | 고정 STYLE·BACKGROUND·BOGLE·GRAMO·PIP·LAMP, 축제 장면 바닥 그림자만 제거 | 합격: 1280x720 RGBA·얼굴 상단 70% 배치 |
| 2026-11-11 | JOB-11 | story/story_09_radio_arrive.png | 차가운 회색 라디오의 건전지 수레, 다이얼당 불빛 한 점·무표식 건전지로 수정 | 합격: 1280x720 RGBA·건전지/마을 색 대비 |
| 2026-11-11 | JOB-11 | story/story_12_city_signal.png | 라디오 다이얼 클로즈업으로 재구성, 회색 도시 실루엣과 송신탑 붉은 불빛 하나 | 합격: 1280x720 RGBA·잡음 파동·불안한 분위기 |
| 2026-11-11 | JOB-11 검수 | sheets/JOB-11_contact.png; sheets/JOB-11_validation.json | 내장 image_gen 사용, 7개 전체 육안 비교·경로·PNG·RGBA·투명도·비율·마젠타 검사 및 전체 contact_sheet 생성 | 합격: JOB11 7/7 OK; 당시 전체 OK 141·확인 필요 0·없음 14·오류 0 |

| 2026-11-11 | JOB-16 | assets/sheets/JOB-16_a.png | 고정 STYLE+SPRITE+SIDE-SCROLL 블록, 기준 레퍼런스 7개를 5개 첨부로 묶음, 들판 소품 7종 | 합격 6종 / 잔디 타일 비율·경계 재생성 |
| 2026-11-11 | JOB-16 | assets/sheets/JOB-16_b.png | 고정 블록, 회색 철·주황 불빛 도시 소품 9종, 셔터·자동문 상태 쌍 | 합격 8종 / 금속 타일 비율 재생성 |
| 2026-11-11 | JOB-16 | assets/sheets/JOB-16_tiles.png | 잔디·금속 정면 단면 타일 2종, 수직 테두리 제거, 640px 정사각 출력 | 합격 / 반복 경계 미세 색차 검수 기록 |
| 2026-11-11 | JOB-16 | assets/road/road_ground_grass.png | a square side-view tile of grassy dirt ground: a band of olive grass on top, brown earth with small pebbles below, LEFT and RIGHT edges connect seamlessly | 합격: RGBA·마젠타 제거·육안 확인 / 반복 경계 미세 색차 있음 |
| 2026-11-11 | JOB-16 | assets/road/road_platform_wood.png | a floating wooden plank platform seen from the side, three planks with rope bindings, about four times wider than tall | 합격: RGBA·마젠타 제거·육안 확인 |
| 2026-11-11 | JOB-16 | assets/road/road_bush_tall.png | a tall round bush seen from the side, puffy lobes, as tall as a short wall | 합격: RGBA·마젠타 제거·육안 확인 |
| 2026-11-11 | JOB-16 | assets/road/road_puddle.png | a flat shallow water puddle seen from the side, light blue with small ripple lines and a white highlight, wide and very thin | 합격: RGBA·마젠타 제거·육안 확인 |
| 2026-11-11 | JOB-16 | assets/road/road_wind_lift.png | a wooden platform on top of a big brass gear column with a wind-up key socket on its front, side view | 합격: RGBA·마젠타 제거·육안 확인 |
| 2026-11-11 | JOB-16 | assets/road/road_drawbridge.png | a wooden drawbridge plank with two iron chains attached at the top end, side view, long and flat | 합격: RGBA·마젠타 제거·육안 확인 |
| 2026-11-11 | JOB-16 | assets/road/road_wind_post.png | a short wooden post topped with a small brass gramophone horn and a little wind-up key on its side, side view, friendly | 합격: RGBA·마젠타 제거·육안 확인 |
| 2026-11-11 | JOB-16 | assets/road/road_ground_metal.png | a square side-view tile of grey riveted metal floor with a darker under-layer, straight lines, LEFT and RIGHT edges connect seamlessly | 합격: RGBA·마젠타 제거·육안 확인 / 반복 경계 미세 색차 있음 |
| 2026-11-11 | JOB-16 | assets/road/road_shutter_closed.png | a grey corrugated metal shutter fully closed, side-scroller front view, tall rectangle | 합격: RGBA·마젠타 제거·육안 확인 |
| 2026-11-11 | JOB-16 | assets/road/road_shutter_open.png | the same grey metal shutter rolled up at the top, open doorway below | 합격: RGBA·마젠타 제거·육안 확인 |
| 2026-11-11 | JOB-16 | assets/road/road_conveyor.png | one segment of a grey conveyor belt with rollers seen from the side, LEFT and RIGHT edges connect seamlessly | 합격: RGBA·마젠타 제거·육안 확인 / 반복 경계 미세 색차 있음 |
| 2026-11-11 | JOB-16 | assets/road/road_door_closed.png | a grey sliding automatic door with a small orange sensor light on top, closed, tall rectangle | 합격: RGBA·마젠타 제거·육안 확인 |
| 2026-11-11 | JOB-16 | assets/road/road_door_open.png | the same grey automatic door slid open to both sides, orange sensor light on | 합격: RGBA·마젠타 제거·육안 확인 |
| 2026-11-11 | JOB-16 | assets/road/road_elevator.png | a flat metal elevator platform between two vertical grey rails, a small orange light on the side | 합격: RGBA·마젠타 제거·육안 확인 |
| 2026-11-11 | JOB-16 | assets/road/road_charger.png | a grey charging station post with a coiled cable and a plug hanging on a hook, a round orange light on top, plain with NO text or symbols | 합격: RGBA·마젠타 제거·육안 확인 |
| 2026-11-11 | JOB-16 | assets/road/road_spark_wire.png | a broken grey electric cable lying across the ground with grey and white zigzag sparks at its tip | 합격: RGBA·마젠타 제거·육안 확인 |
| 2026-11-11 | JOB-16 | road_shutter_open.png, road_door_open.png, road_conveyor.png | 출력 크기 정렬 후 슬라이서 마젠타 번짐 재제거, 컨베이어 반복 열 위치 재선택 | 합격: JOB16 16개 모두 OK, 마젠타 0px; 반복 경계 픽셀 완전 일치는 아님 |

| 2026-11-11 | JOB-17 | 생성 JOB-17_a | 내장 image_gen; 고정 스타일 블록과 레퍼런스 아틀라스; 전체 프롬프트: sheets/JOB-17_generation_record.json | 합격: 동일 높이 배지 2개, 마젠타 시트에서 투명 PNG로 분리 |
| 2026-11-11 | JOB-17 | 생성 story_18_road_start | 내장 image_gen; 고정 스타일 블록과 레퍼런스 아틀라스; 전체 프롬프트: sheets/JOB-17_generation_record.json | 재생성: 자막 영역과 겹치는 발 및 바닥 그림자 |
| 2026-11-11 | JOB-17 | 생성 story_18_road_start_revision1 | 내장 image_gen; 고정 스타일 블록과 레퍼런스 아틀라스; 전체 프롬프트: sheets/JOB-17_generation_record.json | 재생성: 길과 보글 발 위치 연결 및 잔여 그림자 |
| 2026-11-11 | JOB-17 | 생성 story_19_factory | 내장 image_gen; 고정 스타일 블록과 레퍼런스 아틀라스; 전체 프롬프트: sheets/JOB-17_generation_record.json | 재생성: 따뜻한 창문색과 바닥 그림자, 행진 다리 형태 |
| 2026-11-11 | JOB-17 | 생성 story_20_city_gate | 내장 image_gen; 고정 스타일 블록과 레퍼런스 아틀라스; 전체 프롬프트: sheets/JOB-17_generation_record.json | 재생성: 곡선 성문과 하단 자막 영역 침범 |
| 2026-11-11 | JOB-17 | 생성 story_21_tower_top | 내장 image_gen; 고정 스타일 블록과 레퍼런스 아틀라스; 전체 프롬프트: sheets/JOB-17_generation_record.json | 재생성: 라디오 안테나와 송신기 연결 끊김, 라디오 및 구조물 채도 과다 |
| 2026-11-11 | JOB-17 | 생성 story_22_music_spreads | 내장 image_gen; 고정 스타일 블록과 레퍼런스 아틀라스; 전체 프롬프트: sheets/JOB-17_generation_record.json | 합격: 음악과 따뜻한 색 확산, 회색 사물의 첫 러버호스 춤 |
| 2026-11-11 | JOB-17 | 생성 story_18_road_start_revision2 | 내장 image_gen; 고정 스타일 블록과 레퍼런스 아틀라스; 전체 프롬프트: sheets/JOB-17_generation_record.json | 합격: 길을 따라 출발하는 보글, 배낭의 건전지와 열쇠, 자막 여백 |
| 2026-11-11 | JOB-17 | 생성 story_19_factory_revision1 | 내장 image_gen; 고정 스타일 블록과 레퍼런스 아틀라스; 전체 프롬프트: sheets/JOB-17_generation_record.json | 재생성: 곧은 다리가 정지 자세로 바뀌어 행진 보폭 복원 |
| 2026-11-11 | JOB-17 | 생성 story_20_city_gate_revision1 | 내장 image_gen; 고정 스타일 블록과 레퍼런스 아틀라스; 전체 프롬프트: sheets/JOB-17_generation_record.json | 재생성: 직선 성문과 여백 수정 완료, 발밑 그림자 잔존 |
| 2026-11-11 | JOB-17 | 생성 story_21_tower_top_revision1 | 내장 image_gen; 고정 스타일 블록과 레퍼런스 아틀라스; 전체 프롬프트: sheets/JOB-17_generation_record.json | 합격: 라디오 안테나→보글 손→송신기 연결, 보글만 본래 채도 |
| 2026-11-11 | JOB-17 | 생성 story_20_city_gate_revision2 | 내장 image_gen; 고정 스타일 블록과 레퍼런스 아틀라스; 전체 프롬프트: sheets/JOB-17_generation_record.json | 재생성: 작은 회색 발밑 그림자 제거 실패 |
| 2026-11-11 | JOB-17 | 생성 story_19_factory_revision2 | 내장 image_gen; 고정 스타일 블록과 레퍼런스 아틀라스; 전체 프롬프트: sheets/JOB-17_generation_record.json | 합격: 회색 사물의 점 불빛 눈과 직선 행진, 숨은 보글 |
| 2026-11-11 | JOB-17 | 생성 story_20_city_gate_revision3 | 내장 image_gen; 고정 스타일 블록과 레퍼런스 아틀라스; 전체 프롬프트: sheets/JOB-17_generation_record.json | 재생성/검토 필요: 저장 후보로 선택, 자막 여백과 무채색 대비는 충족하나 작은 발밑 그림자 잔존 |
| 2026-11-11 | JOB-17 | 생성 story_20_city_gate_revision4 | 내장 image_gen; 고정 스타일 블록과 레퍼런스 아틀라스; 전체 프롬프트: sheets/JOB-17_generation_record.json | 재생성/미채택: 새 구도에서도 발밑 그림자 및 하단 여백 미충족 |
| 2026-11-11 | JOB-17 | story/story_18_road_start.png | 최종 저장; PNG RGBA; 생성 원본 1672×941, 게임 1280×720 표시, 비율 허용오차 통과 | 합격 |
| 2026-11-11 | JOB-17 | story/story_19_factory.png | 최종 저장; PNG RGBA; 생성 원본 1672×941, 게임 1280×720 표시, 비율 허용오차 통과 | 합격 |
| 2026-11-11 | JOB-17 | story/story_20_city_gate.png | 최종 저장; PNG RGBA; 생성 원본 1672×941, 게임 1280×720 표시, 비율 허용오차 통과 | 시각 검토 필요: 작은 발밑 그림자 잔존 |
| 2026-11-11 | JOB-17 | story/story_21_tower_top.png | 최종 저장; PNG RGBA; 생성 원본 1672×941, 게임 1280×720 표시, 비율 허용오차 통과 | 합격 |
| 2026-11-11 | JOB-17 | story/story_22_music_spreads.png | 최종 저장; PNG RGBA; 생성 원본 1672×941, 게임 1280×720 표시, 비율 허용오차 통과 | 합격 |
| 2026-11-11 | JOB-17 | ui/ui_icon_wind.png | 최종 저장; PNG RGBA; slice_sheet로 투명 분리 | 합격 |
| 2026-11-11 | JOB-17 | ui/ui_icon_battery.png | 최종 저장; PNG RGBA; slice_sheet로 투명 분리 | 합격 |
| 2026-11-11 | JOB-17 / 검수 | sheets/JOB-17_contact.png; sheets/JOB-17_validation.json | check_assets 및 contact_sheet 실행 | JOB17 파일 검사 7/7 OK; 전체 155/155 OK, 누락 0, 오류 0. 시각 미해결: story_20_city_gate 발밑 그림자 |

