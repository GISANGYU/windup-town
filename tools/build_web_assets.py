"""웹 배포용 이미지 압축본 만들기 → assets_web/ (원본 assets/ 는 그대로 둔다)

각 이미지를 게임에서 실제로 쓰는 해상도(스프라이트는 게임 높이의 2.5배, 배경은 1280×720)로 줄이고
WebP로 저장한다. 게임은 assets_web/*.webp 를 먼저 시도하고, 없으면 assets/*.png 원본을 쓴다.

사용법:  python tools/build_web_assets.py
이미지를 새로 받거나 바꾼 뒤 배포(푸시) 전에 한 번 실행한다.
"""
import os
import sys

from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _manifest import ROOT, asset_path, load_manifest  # noqa: E402

OUT = os.path.join(ROOT, "assets_web")
Q_SPRITE, Q_BG = 86, 80


def main():
    total_in = total_out = n = 0
    keep = set()
    for a in load_manifest()["assets"]:
        src = asset_path(a)
        if not os.path.exists(src):
            continue
        im = Image.open(src)
        has_alpha = im.mode in ("RGBA", "LA", "PA") or (im.mode == "P" and "transparency" in im.info)
        # 배경이라도 투명 부분이 있으면(예: 아래가 사라지는 하늘 띠) 투명도를 유지한다
        im = im.convert("RGBA") if (a["fit"] != "full" or (has_alpha and im.convert("RGBA").getextrema()[3][0] < 255)) else im.convert("RGB")
        w, h = im.size
        if a["fit"] == "full":
            r = min(1.0, max(a["w"] / w, a["h"] / h))
        elif a["fit"] == "stretch":
            r = min(1.0, max(a["w"] / w, a["h"] / h))
        else:
            r = min(1.0, a["h"] * 2.5 / h)
        if r < 1:
            im = im.resize((max(1, round(w * r)), max(1, round(h * r))), Image.LANCZOS)
        rel = os.path.splitext(a["file"])[0] + ".webp"
        dst = os.path.join(OUT, rel.replace("/", os.sep))
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        im.save(dst, "WEBP", quality=Q_BG if a["fit"] == "full" else Q_SPRITE, method=6)
        keep.add(os.path.normcase(dst))
        total_in += os.path.getsize(src); total_out += os.path.getsize(dst); n += 1
    # manifest 에서 빠진 파일 정리
    for d, _, files in os.walk(OUT):
        for f in files:
            p = os.path.join(d, f)
            if os.path.normcase(p) not in keep:
                os.remove(p)
    print(f"{n}개  {total_in / 1e6:.1f}MB → {total_out / 1e6:.1f}MB  ({OUT})")
    stamp_index()


def stamp_index():
    """index.html 의 src/*.js, styles/*.css, manifest 주소에 ?v=시각 을 붙여 배포 후 브라우저 캐시를 피한다."""
    import re
    import time
    p = os.path.join(ROOT, "index.html")
    html = open(p, encoding="utf-8").read()
    v = time.strftime("%Y%m%d%H%M")
    html2 = re.sub(r'((?:src|href)="(?:src/[^"?]+\.js|styles/[^"?]+\.css|assets/manifest\.js|assets/audio/audio_manifest\.js))(?:\?v=\d+)?"', rf'\1?v={v}"', html)
    open(p, "w", encoding="utf-8", newline="\n").write(html2)
    print(f"index.html 버전 표시: v={v}")


if __name__ == "__main__":
    main()
