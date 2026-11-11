"""manifest 기준으로 assets 폴더를 검사하고 assets/STATUS.md 를 만든다.

사용법
  python tools/check_assets.py                 # 검사 + STATUS.md
  python tools/check_assets.py --guide         # ASSET_GUIDE.md 의 전체 목록 표도 다시 생성

검사 항목: 파일 존재, PNG 여부, 투명 배경 여부(스프라이트), 배경 비율, 최소 크기, manifest에 없는 파일
"""
import argparse
import os
import sys

from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _manifest import ASSETS, ROOT, asset_path, load_manifest  # noqa: E402

GROUP_KO = {"bg": "배경", "player": "주인공", "npc": "NPC", "portrait": "초상화", "props": "소품",
            "furniture": "가구", "fx": "이펙트", "ui": "UI", "story": "컷신", "wind": "감기 모달", "boss": "보스", "road": "길(5막)"}


def check(a):
    p = asset_path(a)
    if not os.path.exists(p):
        return "없음", []
    issues = []
    try:
        im = Image.open(p)
    except Exception as e:  # noqa: BLE001
        return "오류", [f"열 수 없음: {e}"]
    if im.format != "PNG":
        issues.append(f"PNG 아님({im.format})")
    w, h = im.size
    if a["fit"] == "full":
        ratio, want = w / h, a["w"] / a["h"]
        if abs(ratio - want) / want > 0.04:
            issues.append(f"비율 {w}x{h} (기대 {a['w']}:{a['h']})")
    elif a["fit"] in ("bottom", "center"):
        rgba = im.convert("RGBA")
        corners = [rgba.getpixel(c) for c in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1))]
        if not all(c[3] < 10 for c in corners):
            mag = all(c[0] > 200 and c[2] > 200 and c[1] < 80 for c in corners)
            issues.append("마젠타 배경(게임이 자동 제거, slice_sheet로 정리 권장)" if mag else "배경이 투명하지 않음")
        if max(w, h) < 160:
            issues.append(f"너무 작음 {w}x{h}")
    return ("확인 필요" if issues else "OK"), issues


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--guide", action="store_true")
    args = ap.parse_args()
    m = load_manifest()
    rows, counts = [], {"OK": 0, "없음": 0, "확인 필요": 0, "오류": 0}
    req_missing = []
    for a in m["assets"]:
        st, issues = check(a)
        counts[st] += 1
        if st == "없음" and a["req"]:
            req_missing.append(a["id"])
        rows.append((a, st, issues))

    known = {os.path.normcase(asset_path(a)) for a in m["assets"]}
    extra = []
    for g in GROUP_KO:
        d = os.path.join(ASSETS, g)
        if os.path.isdir(d):
            for f in os.listdir(d):
                p = os.path.join(d, f)
                if os.path.isfile(p) and os.path.normcase(p) not in known:
                    extra.append(f"{g}/{f}")

    lines = ["# 리소스 현황", "", f"OK {counts['OK']} · 확인 필요 {counts['확인 필요']} · 없음 {counts['없음']} · 오류 {counts['오류']} / 전체 {len(m['assets'])}", ""]
    if req_missing:
        lines += [f"**필수인데 없는 것 ({len(req_missing)})**: " + ", ".join(f"`{i}`" for i in req_missing), ""]
    if extra:
        lines += ["**manifest에 없는 파일(이름 확인)**: " + ", ".join(f"`{e}`" for e in extra), ""]
    lines += ["| 상태 | ID | 필수 | 파일 | 메모 |", "|---|---|---|---|---|"]
    for a, st, issues in rows:
        lines.append(f"| {st} | `{a['id']}` | {'●' if a['req'] else ''} | {a['file']} | {'; '.join(issues)} |")
    open(os.path.join(ASSETS, "STATUS.md"), "w", encoding="utf-8", newline="\n").write("\n".join(lines) + "\n")
    print("\n".join(lines[:6]))
    print("-> assets/STATUS.md")

    if args.guide:
        t = ["| 그룹 | ID (파일명) | 필수 | 게임 안 크기 | 시점 | 설명 |", "|---|---|---|---|---|---|"]
        for a in m["assets"]:
            size = f"{a['w']}×{a['h']}" if a["fit"] in ("full", "stretch") else f"높이 {a['h']}px"
            t.append(f"| {GROUP_KO[a['group']]} | `{a['file']}` | {'필수' if a['req'] else '선택'} | {size} | {a['view']} | {a['desc']} |")
        gp = os.path.join(ROOT, "ASSET_GUIDE.md")
        g = open(gp, encoding="utf-8").read()
        mark = "<!--ASSET_TABLE-->"
        head = g[:g.index(mark) + len(mark)]
        open(gp, "w", encoding="utf-8", newline="\n").write(head + "\n" + "\n".join(t) + "\n\n각 ID의 개별 프롬프트(⑤)는 `assets/manifest.js`의 `prompt` 값을 그대로 쓴다.\n")
        print("-> ASSET_GUIDE.md 목록 갱신")


if __name__ == "__main__":
    main()
