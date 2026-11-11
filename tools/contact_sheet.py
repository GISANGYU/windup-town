"""있는 이미지를 전부 한 장에 모아 스타일을 비교한다 -> assets/sheets/_contact.png
맨 앞 칸에는 assets/refs/style_anchor.png 를 놓는다(있으면).
"""
import os
import sys

from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _manifest import ASSETS, asset_path, load_manifest  # noqa: E402

CELL, COLS, LABEL = 220, 8, 22


def main():
    items = []
    anchor = os.path.join(ASSETS, "refs", "style_anchor.png")
    if os.path.exists(anchor):
        items.append(("STYLE ANCHOR", anchor))
    for a in load_manifest()["assets"]:
        p = asset_path(a)
        if os.path.exists(p):
            items.append((a["id"], p))
    if not items:
        sys.exit("모을 이미지가 없습니다.")
    rows = (len(items) + COLS - 1) // COLS
    sheet = Image.new("RGB", (COLS * CELL, rows * (CELL + LABEL)), (238, 230, 214))
    d = ImageDraw.Draw(sheet)
    for i, (name, p) in enumerate(items):
        x, y = (i % COLS) * CELL, (i // COLS) * (CELL + LABEL)
        im = Image.open(p).convert("RGBA")
        im.thumbnail((CELL - 16, CELL - 16))
        # 투명 확인용 체크무늬
        for cy in range(0, CELL, 16):
            for cx in range(0, CELL, 16):
                if (cx // 16 + cy // 16) % 2:
                    d.rectangle([x + cx, y + cy, x + cx + 15, y + cy + 15], fill=(226, 216, 198))
        sheet.paste(im, (x + (CELL - im.width) // 2, y + (CELL - im.height) // 2), im)
        d.text((x + 6, y + CELL + 4), name[:30], fill=(61, 51, 70))
    out = os.path.join(ASSETS, "sheets", "_contact.png")
    sheet.save(out)
    print(f"{len(items)}개 -> {out}")


if __name__ == "__main__":
    main()
