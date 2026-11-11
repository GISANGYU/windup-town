"""생성된 시트 한 장을 개별 PNG로 자른다.

사용법
  python tools/slice_sheet.py assets/sheets/JOB-1_a.png --names player_idle_down,player_idle_up,player_idle_side
  python tools/slice_sheet.py SHEET --names a,b,c --dry      # 저장하지 않고 찾은 조각만 미리보기(_preview.png)

동작
  1. 배경 판정: 투명이면 알파로, 아니면 테두리 색(보통 마젠타 #FF00FF)을 배경으로 본다.
  2. 테두리에서부터 배경색과 비슷한 픽셀을 지워 투명하게 만든다(안쪽 흰 장갑·눈은 보존).
  3. 남은 덩어리를 찾는다. 큰 그림끼리는 합치지 않고, 작은 조각만 --merge 거리 안의 큰 그림에 붙인다.
     작은 먼지는 버린다(--min-area). 이펙트 시트처럼 전부 작은 그림이면 크기가 비슷해서 각각 독립으로 잡힌다.
  4. 읽는 순서(위 줄 → 아래 줄, 왼쪽 → 오른쪽)로 정렬해 --names 순서대로 manifest 경로에 저장한다.
"""
import argparse
import os
import sys
from collections import deque

from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _manifest import ASSETS, MAGENTA, asset_path, assets_by_id  # noqa: E402

BIG_RATIO = 0.2  # 가장 큰 조각 면적의 20% 이상이면 독립된 그림으로 본다


def color_dist(a, b):
    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2) ** 0.5


def remove_background(im, tol):
    """테두리에서 시작하는 flood fill 로 배경을 투명하게 만든다."""
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    corners = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    if all(c[3] < 10 for c in corners):
        return im  # 이미 투명 배경
    # 테두리 색 중 가장 흔한 것을 배경으로
    border = [px[x, 0][:3] for x in range(0, w, 4)] + [px[x, h - 1][:3] for x in range(0, w, 4)]
    border += [px[0, y][:3] for y in range(0, h, 4)] + [px[w - 1, y][:3] for y in range(0, h, 4)]
    bg = max(set(border), key=border.count)
    if color_dist(bg, MAGENTA) < 90:
        bg = MAGENTA
    seen = bytearray(w * h)
    q = deque()
    for x in range(w):
        q.append((x, 0)); q.append((x, h - 1))
    for y in range(h):
        q.append((0, y)); q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        c = px[x, y]
        if c[3] < 10 or color_dist(c[:3], bg) <= tol:
            px[x, y] = (0, 0, 0, 0)
            if x > 0: q.append((x - 1, y))
            if x < w - 1: q.append((x + 1, y))
            if y > 0: q.append((x, y - 1))
            if y < h - 1: q.append((x, y + 1))
    # 마젠타 번짐(가장자리 분홍 테두리) 정리
    if bg == MAGENTA:
        for y in range(h):
            for x in range(w):
                r, g, b, a = px[x, y]
                if a and r > 150 and b > 150 and g < 110:
                    px[x, y] = (0, 0, 0, 0)
    return im


def find_blobs(im, merge, min_area):
    """알파가 있는 덩어리의 박스를 찾는다. 4배 축소해서 계산."""
    s = 4
    small = im.split()[3].resize((max(1, im.width // s), max(1, im.height // s)))
    w, h = small.size
    a = small.load()
    seen = bytearray(w * h)
    boxes = []
    for y0 in range(h):
        for x0 in range(w):
            if seen[y0 * w + x0] or a[x0, y0] < 40:
                continue
            q = deque([(x0, y0)]); seen[y0 * w + x0] = 1
            x1 = x2 = x0; y1 = y2 = y0; n = 0
            while q:
                x, y = q.popleft(); n += 1
                x1, x2, y1, y2 = min(x1, x), max(x2, x), min(y1, y), max(y2, y)
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and a[nx, ny] >= 40:
                        seen[ny * w + nx] = 1; q.append((nx, ny))
            boxes.append([x1 * s, y1 * s, (x2 + 1) * s, (y2 + 1) * s, n * s * s])
    # 큰 그림끼리는 합치지 않는다. 작은 조각(반짝임, 떨어진 손 등)만 가장 가까운 큰 그림에 붙인다.
    def gap(A, B):
        dx = max(0, max(A[0], B[0]) - min(A[2], B[2]))
        dy = max(0, max(A[1], B[1]) - min(A[3], B[3]))
        return max(dx, dy)
    if boxes:
        big_min = max(b[4] for b in boxes) * BIG_RATIO
        big = [b for b in boxes if b[4] >= big_min]
        small = [b for b in boxes if b[4] < big_min]
        rest = []
        for s in sorted(small, key=lambda b: -b[4]):
            near = min(big, key=lambda B: gap(s, B))
            if gap(s, near) <= merge:
                near[0], near[1], near[2], near[3] = min(near[0], s[0]), min(near[1], s[1]), max(near[2], s[2]), max(near[3], s[3])
                near[4] += s[4]
            else:
                rest.append(s)
        boxes = big + rest
    boxes = [b for b in boxes if b[4] >= min_area]
    # 읽는 순서 정렬: 세로 중심이 겹치는 것끼리 같은 줄
    boxes.sort(key=lambda b: (b[1] + b[3]) / 2)
    rows = []
    for b in boxes:
        cy = (b[1] + b[3]) / 2
        for r in rows:
            if r["y1"] <= cy <= r["y2"]:
                r["items"].append(b); r["y1"] = min(r["y1"], b[1]); r["y2"] = max(r["y2"], b[3]); break
        else:
            rows.append({"y1": b[1], "y2": b[3], "items": [b]})
    out = []
    for r in rows:
        out += sorted(r["items"], key=lambda b: b[0])
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("sheet")
    ap.add_argument("--names", required=True, help="manifest ID를 읽는 순서대로 쉼표로")
    ap.add_argument("--tol", type=float, default=70, help="배경색 허용 거리")
    ap.add_argument("--merge", type=int, default=40, help="작은 조각을 큰 그림에 붙이는 최대 거리(px)")
    ap.add_argument("--min-area", type=int, default=600, help="이보다 작은 조각은 버림(px²)")
    ap.add_argument("--pad", type=int, default=12)
    ap.add_argument("--dry", action="store_true")
    args = ap.parse_args()

    names = [n.strip() for n in args.names.split(",") if n.strip()]
    table = assets_by_id()
    bad = [n for n in names if n not in table]
    if bad:
        sys.exit(f"manifest에 없는 ID: {bad}")

    im = remove_background(Image.open(args.sheet), args.tol)
    boxes = find_blobs(im, args.merge, args.min_area)
    print(f"찾은 조각 {len(boxes)}개 / 이름 {len(names)}개")

    prev = im.copy(); d = ImageDraw.Draw(prev)
    for i, b in enumerate(boxes):
        d.rectangle(b[:4], outline=(255, 0, 0, 255), width=4)
        d.text((b[0] + 6, b[1] + 6), str(i + 1), fill=(255, 0, 0, 255))
    pv = os.path.splitext(args.sheet)[0] + "_preview.png"
    prev.save(pv)
    print(f"미리보기: {pv}")

    if len(boxes) != len(names):
        sys.exit("개수가 다릅니다. --merge / --min-area 를 조정하거나 시트를 다시 만드세요. (저장 안 함)")
    if args.dry:
        return
    for name, b in zip(names, boxes):
        x1, y1, x2, y2 = b[:4]
        crop = im.crop((max(0, x1 - args.pad), max(0, y1 - args.pad), min(im.width, x2 + args.pad), min(im.height, y2 + args.pad)))
        bbox = crop.getbbox()
        if bbox:
            crop = crop.crop(bbox)
        out = asset_path(table[name])
        os.makedirs(os.path.dirname(out), exist_ok=True)
        crop.save(out)
        print(f"  저장 {name:28s} {crop.width}x{crop.height}  -> {os.path.relpath(out, ASSETS)}")


if __name__ == "__main__":
    main()
