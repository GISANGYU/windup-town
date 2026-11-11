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
}

ACT = {"3막": "제3막 「태엽 없는 손님」 (GAME_DESIGN.md 17절)", "4막": "제4막 「도시에서 온 방송」 (GAME_DESIGN.md 18절)", "5막": "제5막 「갈아끼우는 길」 (GAME_DESIGN.md 19절)"}


def size(a):
    return f"{a['w']}×{a['h']}" if a["fit"] in ("full", "stretch") and a.get("w") else f"높이 {a['h']}px"


os.makedirs(os.path.join(ROOT, "jobs"), exist_ok=True)
for n, J in JOBS.items():
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
R = ["# 제3~5막 이미지 작업 (Codex)", "",
     "Codex 창마다 **\"JOB9 진행해\"**, **\"JOB10 진행해\"** 처럼 번호만 말하면 된다. Codex는 `jobs/JOB-NN.md`를 읽고 그 JOB만 한다.", "",
     "| JOB | 막 | 내용 | 파일 수 | 먼저 끝나야 하는 JOB | 지시서 |", "|---|---|---|---|---|---|"]
for n, J in JOBS.items():
    R.append(f"| JOB-{n} | {J['act']} | {J['title']} | {len(by_job[f'JOB-{n}'])} | {', '.join(f'JOB-{d}' for d in J['dep']) or '없음'} | [JOB-{n:02d}.md](JOB-{n:02d}.md) |")
R += ["", f"합계 {sum(len(v) for k, v in by_job.items())}개.", "",
      "## 동시에 돌리는 순서", "",
      "1. **1차 (바로 동시에)**: JOB-9, JOB-10, JOB-12, JOB-14, JOB-15",
      "2. **2차**: JOB-11 (9·10 뒤), JOB-13 (9·12 뒤), JOB-16 (15 뒤)",
      "3. **3차**: JOB-17 (9·14·15 뒤)", "",
      "게임 개발 순서가 3막 → 4막 → 5막이라 **3막용(JOB-9·10·11)을 먼저** 끝내면 바로 화면에 반영된다. 이미지가 없어도 게임은 임시 도형으로 돌아간다.", "",
      "## 공통", "",
      "- 기준: `ASSET_GUIDE.md`(스타일·블록), `assets/manifest.js`(ID·경로·크기·prompt, `job` 필드로 소속 JOB 표시)",
      "- 새 캐릭터 블록: ASSET_GUIDE 5절 **RADIO**, **SURVEYOR**, 눈 규칙 예외(건전지 = 불빛 점 눈), **SIDE-SCROLL RULES**",
      "- 소리는 Codex 작업이 아니다. `jobs/AUDIO.md` 참고(다른 Claude 창).", ""]
open(os.path.join(ROOT, "jobs", "README.md"), "w", encoding="utf-8", newline="\n").write("\n".join(R))
print("ok", len(JOBS))
