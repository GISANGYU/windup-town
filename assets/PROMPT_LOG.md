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
