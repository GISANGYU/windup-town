"""jobs/JOB-09.md ~ JOB-17.md + jobs/README.md 생성. 파일 목록은 manifest.js의 job 필드에서 읽는다."""
import json, os, re, sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
t = open(os.path.join(ROOT, "assets", "manifest.js"), encoding="utf-8").read()
m = re.search(r"^window\.ASSET_MANIFEST\s*=", t, re.M)
assets = json.loads(t[m.end():].strip().rstrip(";"))["assets"]
by_job = {}
for a in assets:
    if a.get("job"):
        by_job.setdefault(a["job"], []).append(a)

# sheets: list of (sheet name, [ids])  /  singles: ids made one by one (full images)
JOBS = {
    9: dict(
        title="제3막 라디오 씨", act="3막", dep=[],
        refs=["assets/refs/style_anchor.png", "assets/refs/ref_02_character.jpg", "assets/npc/npc_pip_awake.png (키 비교용)"],
        blocks=["STYLE BLOCK", "SPRITE RULES", "RADIO"],
        sheets=[("a", ["npc_radio_idle", "npc_radio_talk", "npc_radio_off", "npc_radio_crank"], "라디오 씨 4포즈 한 줄"),
                ("b", ["portrait_radio", "portrait_radio_crank"], "초상화 2개 한 줄 (a 결과를 레퍼런스로 첨부)")],
        rules=["라디오 씨는 마을에서 유일하게 **몸이 출렁이지 않는** 캐릭터다. 팔은 러버호스지만 자세는 곧고 뻣뻣하게.",
               "`idle`·`talk`의 눈은 다이얼 안의 **작은 불빛 점 두 개**(ASSET_GUIDE 5절 눈 규칙 예외). `off`는 불빛 없이 빈 다이얼.",
               "`crank`만 다이얼 안에 **파이 눈**이 생기고 몸이 출렁인다. 3막 결말의 핵심 변화이므로 차이가 분명해야 한다.",
               "크랭크는 오른쪽 옆구리. `crank` 외 포즈에는 크랭크를 그리지 않는다."]),
    10: dict(
        title="제3막 소품·축제 장식·가로등 초상화", act="3막", dep=[],
        refs=["assets/refs/style_anchor.png", "assets/refs/ref_02_character.jpg", "assets/npc/npc_lamp_on.png (가로등 초상화용)"],
        blocks=["STYLE BLOCK", "SPRITE RULES", "LAMP (c 시트만)"],
        sheets=[("a", ["prop_battery", "prop_battery_pack", "prop_sheet_music", "prop_ribbon"], "아이템 4개 한 줄"),
                ("b", ["furn_bunting", "furn_lantern", "furn_banner"], "축제 장식 3개 한 줄"),
                ("c", ["portrait_lamp_awake", "portrait_lamp_shy"], "가로등 초상화 2개 한 줄")],
        rules=["건전지(`prop_battery`, `prop_battery_pack`)는 마을 물건보다 **차갑고 깨끗하게**: 회색 `#9BA3AE`, 은색 뚜껑, 얼굴 없음. +·− 기호와 로고 금지.",
               "악보 조각의 음표는 글자가 아니라 **모양**으로. 오선은 3~5줄.",
               "가로등 초상화는 기존 `npc_lamp_on`의 유리 머리와 같은 모양으로. 가로등은 이 막에서 처음 말을 하는 캐릭터다."]),
    11: dict(
        title="제3막 컷신 5장 + 크랭크 감기 모달", act="3막", dep=[9, 10],
        refs=["assets/refs/style_anchor.png", "assets/refs/ref_01_carnival.jpg", "assets/refs/ref_03_stage_layers.jpg", "assets/bg/bg_town_ground.png", "JOB-9 결과 npc_radio_* (라디오 씨 모습 고정)", "JOB-10 결과 furn_bunting·furn_lantern (축제 장식)"],
        blocks=["STYLE BLOCK", "BACKGROUND RULES (컷신)", "SPRITE RULES (모달 2개)", "BOGLE, GRAMO, PIP, LAMP, RADIO 중 등장하는 것"],
        singles=["story_08_festival", "story_09_radio_arrive", "story_10_radio_down", "story_11_broadcast", "story_12_city_signal"],
        sheets=[("a", ["wind_radio_back", "wind_crank"], "모달 2개 마젠타 시트 1장")],
        rules=["컷신은 16:9 각각 따로. 화면 **아래 30%는 자막 카드가 덮으므로** 중요한 얼굴을 두지 않는다. 글자 금지.",
               "기계화 대비: 라디오 씨와 건전지는 주변보다 **회색·직선**으로, 마을은 따뜻한 색으로. `story_11_broadcast`는 마을이 가장 진한 색.",
               "`story_12_city_signal`은 4막 떡밥. 먼 도시는 디테일 없이 회색 실루엣과 붉은 불빛 하나만.",
               "`wind_radio_back`은 크랭크 축 자리가 정확히 가운데, 크랭크는 그리지 않음(기존 `wind_gramo_back`과 같은 구도). `wind_crank`는 회전하므로 정면·원형·대칭."]),
    12: dict(
        title="제4막 측량기 + 말뚝·지도", act="4막", dep=[],
        refs=["assets/refs/style_anchor.png", "assets/refs/ref_02_character.jpg", "JOB-10 결과 prop_battery (회색 기준)"],
        blocks=["STYLE BLOCK", "SPRITE RULES", "SURVEYOR"],
        sheets=[("a", ["npc_surveyor_idle", "npc_surveyor_walk_01", "npc_surveyor_walk_02", "npc_surveyor_hammer", "npc_surveyor_stun"], "측량기 5포즈 한 줄"),
                ("b", ["portrait_surveyor", "prop_stake", "prop_stake_pulled", "prop_city_map", "fx_static"], "초상화 + 소품 3 + 이펙트 1 한 줄")],
        rules=["측량기 다리는 **러버호스가 아닌 곧은 직선**. 이 게임에서 처음 나오는 '관절 없는 직선' 캐릭터라 대비가 핵심이다. 외곽선은 그대로 `#3D3346`.",
               "눈은 렌즈 아래 **불빛 점 두 개**(눈 규칙 예외).",
               "말뚝 꼬리표·지도에 글자·숫자 금지. 지도는 격자선만."]),
    13: dict(
        title="제4막 컷신 5장", act="4막", dep=[9, 12],
        refs=["assets/refs/style_anchor.png", "assets/refs/ref_01_carnival.jpg", "assets/refs/ref_03_stage_layers.jpg", "assets/bg/bg_town_ground.png", "JOB-9 결과 npc_radio_crank", "JOB-12 결과 npc_surveyor_idle", "JOB-10 결과 prop_battery_pack"],
        blocks=["STYLE BLOCK", "BACKGROUND RULES", "BOGLE, GRAMO, PIP, LAMP, RADIO, SURVEYOR 중 등장하는 것"],
        singles=["story_13_surveyors", "story_14_grey_spread", "story_15_chase", "story_16_radio_past", "story_17_road_open"],
        rules=["화면 아래 30% 비우기, 글자 금지(JOB-11과 같음).",
               "`story_14_grey_spread`: 회색 원 안쪽은 채도 0 + 풀·꽃이 **곧게 선 직선**, 바깥은 원래 색과 곡선. 4막 핵심 연출.",
               "`story_15_chase`의 보글은 건전지 상태: 뻣뻣함, 튐 없음, 불빛 점 눈, 등에 건전지 팩.",
               "`story_16_radio_past`는 회상이라 전체를 회색·세피아로. 3막 이후 라디오 씨는 크랭크가 있지만 이 장면(과거)에는 **크랭크가 없다**."]),
    14: dict(
        title="제5막 보글 횡스크롤 포즈 11개", act="5막", dep=[],
        refs=["assets/refs/style_anchor.png", "assets/refs/ref_02_character.jpg", "assets/player/player_idle_side.png (모양 고정)", "assets/player/player_jump_side.png", "JOB-10 결과 prop_battery_pack"],
        blocks=["STYLE BLOCK", "SPRITE RULES", "SIDE-SCROLL RULES", "BOGLE"],
        sheets=[("a", ["player_run_side_01", "player_run_side_02", "player_run_side_03", "player_run_side_04", "player_dash_side_01", "player_dash_side_02"], "위 줄: 태엽 달리기 4프레임 / 아래 줄: 건전지 대시 2프레임"),
                ("b", ["player_swap", "player_wind_self", "player_charge", "player_short", "player_hurt_side"], "동작 5개 한 줄")],
        rules=["모두 **오른쪽을 보는 엄격한 옆모습**, 카메라는 땅과 같은 높이.",
               "**태엽 달리기**(run 1~4): 출렁이는 러버호스, 눌림·늘어남이 큼, 뚜껑이 들썩임, 파이 눈.",
               "**건전지 대시**(dash 1~2): 몸이 뻣뻣하고 수평, 다리는 가위처럼 곧게, 증기 없음, 눈은 불빛 점 두 개, **등에 건전지 팩**(`prop_battery_pack`과 같은 모양).",
               "두 상태의 차이가 실루엣만 봐도 구분돼야 한다. 5막 조작의 핵심이다.",
               "`player_swap`은 등 덮개가 열린 모습. 기존 보글 디자인(주전자 자체가 몸)은 그대로."]),
    15: dict(
        title="제5막 배경 6장 (구간별 먼 배경 + 중간 레이어)", act="5막", dep=[],
        refs=["assets/refs/style_anchor.png", "assets/refs/ref_04_watercolor_bg.jpg", "assets/refs/ref_03_stage_layers.jpg", "assets/bg/bg_intro.png (구간1 색 기준)"],
        blocks=["STYLE BLOCK", "BACKGROUND RULES (far)", "SPRITE RULES (mid)", "SIDE-SCROLL RULES"],
        singles=["bg_road1_far", "bg_road2_far", "bg_road3_far"],
        sheets=[("mid1", ["bg_road1_mid"], "중간 레이어 1장(위쪽 마젠타)"), ("mid2", ["bg_road2_mid"], "중간 레이어 1장"), ("mid3", ["bg_road3_mid"], "중간 레이어 1장")],
        rules=["세 구간은 **마을 → 공장 → 도시**로 갈수록 색이 빠지고 선이 곧아진다. 구간1은 1막 마을과 같은 따뜻한 수채, 구간3은 거의 무채색 + 송신탑의 붉은 불빛 하나.",
               "모든 배경은 **왼쪽 끝과 오른쪽 끝이 이어져야** 한다(반복 스크롤). 만든 뒤 좌우를 붙여 이음매를 확인한다.",
               "far는 16:9 화면 가득. mid는 가로로 긴 띠(2:1 이상 권장), **아래쪽만 그리고 위쪽은 마젠타** → 자르기 명령으로 투명하게 만든다.",
               "far 저장: `assets/road/<ID>.png`에 바로. mid는 아래 자르기 명령으로."]),
    16: dict(
        title="제5막 지형·장애물 16개", act="5막", dep=[15],
        refs=["assets/refs/style_anchor.png", "assets/refs/ref_03_stage_layers.jpg", "JOB-15 결과 bg_road1_far·bg_road3_far (구간 색 맞춤)", "assets/props/prop_bush.png", "assets/props/prop_key.png"],
        blocks=["STYLE BLOCK", "SPRITE RULES", "SIDE-SCROLL RULES"],
        sheets=[("a", ["road_ground_grass", "road_platform_wood", "road_bush_tall", "road_puddle", "road_wind_lift", "road_drawbridge", "road_wind_post"], "태엽·들판 구간 7개 (2줄 격자 가능)"),
                ("b", ["road_ground_metal", "road_shutter_closed", "road_shutter_open", "road_conveyor", "road_door_closed", "road_door_open", "road_elevator", "road_charger", "road_spark_wire"], "건전지·도시 구간 9개 (2줄 격자 가능)")],
        rules=["a 시트(태엽 쪽)는 나무·황동·곡선, b 시트(건전지 쪽)는 회색 철·직선·주황 불빛. 한눈에 '태엽용/건전지용'이 구분돼야 한다(5막 장애물 설계 원칙).",
               "땅 타일(`road_ground_*`)과 `road_conveyor`는 좌우가 이어지는 정사각 또는 가로 반복 조각.",
               "열림/닫힘 쌍(셔터, 자동문)은 **같은 크기·같은 위치**로 그린다. 게임이 그 자리에서 바꿔 끼운다.",
               "충전소·표지에 번개 기호, 글자, 숫자 금지."]),
    17: dict(
        title="제5막 컷신 5장 + HUD 아이콘 2개", act="5막", dep=[9, 14, 15],
        refs=["assets/refs/style_anchor.png", "assets/refs/ref_01_carnival.jpg", "JOB-15 결과 bg_road*_far (구간 분위기)", "JOB-9 결과 npc_radio_crank", "JOB-14 결과 player_dash_side_01"],
        blocks=["STYLE BLOCK", "BACKGROUND RULES (컷신)", "SPRITE RULES (아이콘)", "BOGLE, RADIO"],
        singles=["story_18_road_start", "story_19_factory", "story_20_city_gate", "story_21_tower_top", "story_22_music_spreads"],
        sheets=[("a", ["ui_icon_wind", "ui_icon_battery"], "HUD 아이콘 2개 한 줄")],
        rules=["화면 아래 30% 비우기, 글자 금지.",
               "회색 도시 속에서 **보글만 원래 색**인 대비가 5막 컷신의 공통 규칙.",
               "`story_22_music_spreads`는 결말 후보. 회색 사물들이 처음으로 러버호스 곡선으로 튀는 순간.",
               "아이콘 2개는 같은 크기의 둥근 배지. 태엽=크림 바탕+황동 열쇠, 건전지=회색 바탕+회색 건전지. 작게 줄여도 구분되게 단순하게."]),
    # ───── 2026-11-12 새 이야기(볼트 남작) ─────
    18: dict(
        title="볼트 남작 (최종 보스)", act="5막", dep=[],
        refs=["assets/refs/style_anchor.png", "assets/refs/ref_02_character.jpg", "assets/boss/boss_idle.png (2막 백작과 같은 크기감·악당 톤)"],
        blocks=["STYLE BLOCK", "SPRITE RULES", "SIDE-SCROLL RULES", "BARON VOLT"],
        sheets=[("a", ["boss_volt_idle", "boss_volt_spark", "boss_volt_magnet", "boss_volt_spray", "boss_volt_throw"], "공격 자세 5개 한 줄 (모두 왼쪽 보기)"),
                ("b", ["boss_volt_strike", "boss_volt_overheat", "boss_volt_hurt", "boss_volt_crank"], "낙뢰·과열·피격·크랭크 4개 한 줄"),
                ("c", ["boss_volt_small", "portrait_volt", "portrait_volt_small"], "작은 발전기 + 초상화 2개")],
        rules=["보스 아레나는 오른쪽에 보스가 서므로 **모든 자세가 왼쪽(보글 쪽)을 본다.** SIDE-SCROLL RULES의 'Characters face RIGHT'의 예외.",
               "`boss_volt_overheat`는 가슴 판이 열려 **플러그 3개가 꽂힌 소켓**이 분명히 보여야 한다(플레이어가 노리는 곳).",
               "`boss_volt_crank`는 몸속의 **녹슨 손 크랭크**가 주인공. 결말의 반전이다.",
               "`boss_volt_small`은 귀여운 손전등형 수동 발전기. 전기 효과 없이, 남작의 콧수염만 작게 남긴다.",
               "무섭지 않게: 1930년대 카툰 악당, 거만하지만 우스꽝스럽게."]),
    19: dict(
        title="두꺼비집 문지기 (중간 보스)", act="4막", dep=[],
        refs=["assets/refs/style_anchor.png", "assets/refs/ref_02_character.jpg"],
        blocks=["STYLE BLOCK", "SPRITE RULES", "SIDE-SCROLL RULES", "TOAD GATEKEEPER"],
        sheets=[("a", ["boss_toad_idle", "boss_toad_croak", "boss_toad_tongue", "boss_toad_overheat_top"], "자세 4개 한 줄 (모두 왼쪽 보기)"),
                ("b", ["boss_toad_overheat_mouth", "boss_toad_hurt", "boss_toad_down", "portrait_toad"], "자세 3개 + 초상화")],
        rules=["모든 자세가 **왼쪽**을 본다(아레나 오른쪽에 섬).",
               "머리 위 **차단기 레버**는 모든 자세에서 같은 자리. `overheat_top`에서 특히 분명하게.",
               "`overheat_mouth`는 입이 화면을 크게 차지하고 **입 안에 레버**가 보여야 한다(플레이어가 뛰어드는 곳).",
               "우렁차지만 조금 멍청한 문지기. 징그럽지 않게, 둥글고 만화적으로."]),
    20: dict(
        title="라디오 씨 — 잡음 방송 / 변신 후 모습", act="5막", dep=[],
        refs=["assets/refs/style_anchor.png", "assets/refs/ref_02_character.jpg", "assets/npc/npc_radio_idle.png (변신 전 기준)", "assets/npc/npc_gramo_awake.png (나팔 모양 참고)"],
        blocks=["STYLE BLOCK", "SPRITE RULES", "RADIO (npc_radio_jam만)", "RADIO REBORN (나머지)"],
        sheets=[("a", ["npc_radio_jam"], "변신 전 잡음 방송 1개"),
                ("b", ["npc_radio_reborn_idle", "npc_radio_reborn_talk", "npc_radio_reborn_dance", "npc_radio_reborn_broadcast", "portrait_radio_reborn"], "변신 후 4자세 + 초상화")],
        rules=["**변신 전과 후의 실루엣이 확 달라야 한다.** 뻣뻣한 회색 상자 → 머리 위로 피어난 나팔, 출렁이는 팔다리, 등의 황동 열쇠, 금 테두리.",
               "변신 후 눈은 파이 눈. 다이얼 자리는 볼처럼 남겨도 좋다.",
               "`npc_radio_reborn_broadcast`와 `npc_radio_jam`은 오른쪽을 본다(아레나 왼쪽에 섬)."]),
    21: dict(
        title="보스 아레나 배경 + 공격 이펙트 + 건전지 모달", act="4·5막", dep=[],
        refs=["assets/refs/style_anchor.png", "assets/refs/ref_03_stage_layers.jpg", "assets/road/bg_road3_far.png (도시 색 기준)", "assets/props/prop_battery.png"],
        blocks=["STYLE BLOCK", "BACKGROUND RULES (배경 2장)", "SPRITE RULES (나머지)", "SIDE-SCROLL RULES", "BOGLE (wind_bogle_back)"],
        singles=["bg_gate_arena", "bg_volt_arena"],
        sheets=[("a", ["road_platform_metal", "prop_battery_bomb", "prop_plug", "prop_breaker"], "소품 4개 한 줄"),
                ("b", ["fx_lightning", "fx_spark_floor", "fx_magnet_wave", "fx_coolant", "fx_recall_thread"], "이펙트 5개 (2줄 격자 가능)"),
                ("c", ["wind_bogle_back"], "건전지 모달 배경 1개")],
        rules=["아레나 배경 2장은 **한 화면 고정**(반복 아님). 아래 120px 바닥 띠는 비워 둔다(게임이 바닥을 그림). 공중 발판은 그려 넣지 않는다(게임이 `road_platform_metal`로 놓음).",
               "`bg_volt_arena`는 오른쪽 가운데로 빛나는 실들이 빨려 드는 소켓이 있어야 한다(보스 자리).",
               "`wind_bogle_back`은 보글 등 클로즈업, 가운데 **빈 건전지 칸**(덮개 열림). 건전지는 그리지 않는다(게임이 끼움)."]),
    22: dict(
        title="3~5막 컷신 13장", act="3·4·5막", dep=[18, 19, 20],
        refs=["assets/refs/style_anchor.png", "assets/refs/ref_01_carnival.jpg", "assets/story/story_08_festival.png (축제 톤)", "JOB-18·19·20 결과 (보스·라디오 씨 모습 고정)"],
        blocks=["STYLE BLOCK", "BACKGROUND RULES", "등장하는 캐릭터 블록 전부"],
        singles=["story_30_gramo_unwind", "story_32_battery_montage", "story_33_recall_night", "story_34_radio_confess", "story_35_gramo_key", "story_36_departure", "story_37_toad_gate", "story_38_volt_reveal", "story_39_radio_collapse", "story_40_key_insert", "story_41_radio_reborn", "story_42_volt_small", "story_43_home"],
        rules=["화면 아래 30%는 자막 카드가 덮는다. 중요한 얼굴은 위쪽 70%에.",
               "건전지를 넣은 것은 **회색 + 불빛 점 눈**, 태엽인 것은 원래 색 + 파이 눈. 이 대비가 컷신 전체의 규칙.",
               "그라모는 3막 5(`story_35`)부터 **등의 열쇠가 2개**다.",
               "`story_41_radio_reborn`은 이 게임의 하이라이트. 금빛, 음표, 변신 전후가 한 장에 보이도록 빛 속에서 피어나는 순간으로."]),

    23: dict(
        title="흑막 암시 컷신 2장 (볼트 남작·문지기 실루엣)", act="3막", dep=[18, 19],
        refs=["assets/refs/style_anchor.png", "assets/story/story_02_thief.png (1막 째깍 그림자 — 실루엣 연출 기준)", "JOB-18 결과 boss_volt_idle (실루엣 윤곽)", "JOB-19 결과 boss_toad_idle (실루엣 윤곽)", "assets/road/bg_volt_arena.png (발전소 홀)"],
        blocks=["STYLE BLOCK", "BACKGROUND RULES"],
        singles=["story_44_shadow_hall", "story_45_shadow_plan"],
        rules=["**정체를 보여 주지 않는다.** 볼트 남작과 두꺼비집 문지기는 **검은 실루엣 + 빛나는 노란 눈**만. 얼굴·색·디테일 금지. 5막에서 정체가 드러난다.",
               "실루엣 윤곽은 JOB-18·19 결과와 같아야 한다(코일 머리, 플러그 팔, 콧수염 / 머리 위 레버, 넓적한 몸). 나중에 \"아, 그 그림자가 이 녀석이었구나\"가 되게.",
               "남작 그림자는 크게, 문지기 그림자는 그 앞에 작게. 흑막이 둘이라는 게 한눈에 보이게.",
               "`story_44`: 빛나는 실(태엽 힘)이 그림자 가슴으로 빨려 드는 장면이 중심. `story_45`: 그림자가 건전지를 들어 보이고, 건전지에서 실이 빨려 나가는 모습 + 마을 지도의 건전지 표시.",
               "화면 아래 30%는 자막 카드가 덮는다. 글자·숫자 금지(지도에도)."]),
}

ACT = {"3막": "제3막 (GAME_DESIGN.md 18절)", "4막": "제4막 (GAME_DESIGN.md 19절)", "5막": "제5막 「볼트 남작」 (GAME_DESIGN.md 20절)",
       "4·5막": "제4·5막 보스 아레나 (GAME_DESIGN.md 19·20절)", "3·4·5막": "제3~5막 (GAME_DESIGN.md 18~20절)"}
NEW_FROM = 18   # 이 번호부터가 새 이야기 작업. 이전 JOB 지시서(9~17)는 다시 만들지 않는다.


def size(a):
    return f"{a['w']}×{a['h']}" if a["fit"] in ("full", "stretch") and a.get("w") else f"높이 {a['h']}px"


os.makedirs(os.path.join(ROOT, "jobs"), exist_ok=True)
for n, J in JOBS.items():
    if n < NEW_FROM:
        continue
    items = {a["id"]: a for a in by_job[f"JOB-{n}"]}
    listed = [i for s in J.get("sheets", []) for i in s[1]] + J.get("singles", [])
    assert sorted(listed) == sorted(items), (n, set(items) ^ set(listed))
    L = [f"# JOB-{n} — {J['title']}", "",
         f"> 사람이 **\"JOB{n} 진행해\"**라고 하면 이 파일을 처음부터 끝까지 따라 한다. 다른 JOB은 건드리지 않는다.", "",
         f"- 소속: {ACT[J['act']]}",
         f"- 만들 파일: **{len(items)}개**",
         f"- 먼저 끝나 있어야 하는 JOB: " + (", ".join(f"JOB-{d}" for d in J["dep"]) + " (결과 이미지를 레퍼런스로 씀. 없으면 사람에게 알리고 기다린다)" if J["dep"] else "없음 (바로 시작 가능)"), "",
         "## 1. 시작 전", "",
         "1. `AGENTS.md`, `ASSET_GUIDE.md` 0~5절을 읽는다. 0절 절대 규칙은 이 JOB에도 그대로 적용된다.",
         "2. 아래 레퍼런스 이미지를 열어 보고, 생성할 때마다 첨부한다.", ""]
    L += [f"   - `{r}`" if not r.startswith("JOB") else f"   - {r}" for r in J["refs"]]
    L += ["", "## 2. 프롬프트 조립 순서", "",
          "ASSET_GUIDE 1-2절 방식. 고정 블록은 **한 글자도 바꾸지 않고** 복사한다.", ""]
    L += [f"{i + 1}. {b}" for i, b in enumerate(J["blocks"])]
    L += [f"{len(J['blocks']) + 1}. 시트 구성 설명 (아래 3절)", f"{len(J['blocks']) + 2}. 각 ID의 개별 프롬프트 (아래 4절 표의 prompt 값 그대로)", "",
          "## 3. 만드는 방법", ""]
    for name, ids, desc in J.get("sheets", []):
        sheet = f"assets/sheets/JOB-{n}_{name}.png"
        L += [f"### 시트 `{name}` — {desc}", "",
              f"- 마젠타 `#FF00FF` 배경 한 장, 그림 사이 간격 넉넉하게. 읽는 순서(위 줄 왼→오, 다음 줄) = 아래 순서",
              "- 순서: " + " → ".join(f"`{i}`" for i in ids),
              f"- 원본 저장: `{sheet}`", "- 자르기:", "```",
              f"python tools/slice_sheet.py {sheet} --names {','.join(ids)}", "```",
              f"- 잘린 개수가 {len(ids)}개가 아니면 `--dry`로 미리 보고 `--merge`·`--min-area`를 조정하거나 시트를 다시 만든다.", ""]
    if J.get("singles"):
        L += ["### 한 장씩 따로 만드는 것", "", "16:9 한 장씩 생성해서 아래 경로에 **PNG로 바로 저장**한다(자르기 없음).", ""]
        L += [f"- `{i}` → `assets/{items[i]['file']}`" for i in J["singles"]]
        L += [""]
    L += ["## 4. 파일 목록", "", "| ID | 저장 경로 | 게임 안 크기 | 필수 | 설명 | prompt (⑤에 그대로) |", "|---|---|---|---|---|---|"]
    for i in listed:
        a = items[i]
        L.append(f"| `{i}` | `assets/{a['file']}` | {size(a)} | {'●' if a['req'] else ''} | {a['desc']} | {a['prompt']} |")
    L += ["", "## 5. 이 JOB만의 규칙", ""] + [f"- {r}" for r in J["rules"]]
    L += ["", "## 6. 끝나면", "",
          "```", "python tools/check_assets.py      # assets/STATUS.md 갱신", "python tools/contact_sheet.py     # assets/sheets/_contact.png", "```",
          "1. ASSET_GUIDE 6절 체크리스트로 한 장씩 확인한다. 어긋난 파일만 다시 만든다.",
          f"2. `assets/PROMPT_LOG.md`에 한 줄씩: `날짜 | JOB-{n} | 결과 파일 | 프롬프트 요약 | 합격/재생성`",
          "3. 사람에게 보고: 만든 파일 수 / 다시 만든 파일과 이유 / STATUS.md에 남은 문제",
          "4. `src/`, `index.html`, `GAME_DESIGN.md`, `assets/manifest.js`는 수정하지 않는다. 이름이나 크기를 바꿔야 할 것 같으면 사람에게 묻는다.", ""]
    open(os.path.join(ROOT, "jobs", f"JOB-{n:02d}.md"), "w", encoding="utf-8", newline="\n").write("\n".join(L))

# README
R = ["# 이미지 작업 (Codex)", "",
     "Codex 창마다 **\"JOB18 진행해\"** 처럼 번호만 말하면 된다. Codex는 `jobs/JOB-NN.md`를 읽고 그 JOB만 한다.", "",
     "## 지금 할 작업 — 새 이야기(볼트 남작, GAME_DESIGN.md 17~21절)", "",
     "| JOB | 막 | 내용 | 파일 수 | 먼저 끝나야 하는 JOB | 지시서 |", "|---|---|---|---|---|---|"]
for n, J in JOBS.items():
    if n >= NEW_FROM:
        R.append(f"| JOB-{n} | {J['act']} | {J['title']} | {len(by_job[f'JOB-{n}'])} | {', '.join(f'JOB-{d}' for d in J['dep']) or '없음'} | [JOB-{n:02d}.md](JOB-{n:02d}.md) |")
R += ["", "순서: **1차(동시에)** JOB-18, JOB-19, JOB-20, JOB-21 → **2차** JOB-22(컷신, 18·19·20 뒤), JOB-23(흑막 실루엣 컷신, 18·19 뒤).", "",
      "## 끝난 작업 (이전 이야기, JOB-9~17)", "",
      "모두 완료. 그중 새 이야기에서도 쓰는 것: 라디오 씨 변신 전 모습(JOB-9), 건전지·축제 소품(JOB-10), 축제·라디오 등장 컷신 story_08·09(JOB-11), 보글 횡스크롤 포즈(JOB-14), 길 배경·장애물(JOB-15·16), HUD 아이콘(JOB-17). 측량기(JOB-12·13)와 나머지 이전 컷신은 쓰지 않는다.", "",
      "## 공통", "",
      "- 기준: `ASSET_GUIDE.md`(스타일·블록), `assets/manifest.js`(ID·경로·크기·prompt, `job` 필드로 소속 JOB 표시)",
      "- 새 캐릭터 블록: ASSET_GUIDE 5절 **BARON VOLT**, **TOAD GATEKEEPER**, **RADIO REBORN**",
      "- 소리는 Codex 작업이 아니다. `jobs/AUDIO2.md` 참고(소리 담당 Claude 창).", ""]
open(os.path.join(ROOT, "jobs", "README.md"), "w", encoding="utf-8", newline="\n").write("\n".join(R))
print("ok")
