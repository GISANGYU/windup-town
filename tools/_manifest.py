"""assets/manifest.js 를 읽는 공용 함수. 다른 tools/*.py 가 import 한다."""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets")
MAGENTA = (255, 0, 255)


def load_manifest():
    path = os.path.join(ASSETS, "manifest.js")
    text = open(path, encoding="utf-8").read()
    match = re.search(r"^window\.ASSET_MANIFEST\s*=", text, re.M)
    body = text[match.end():].strip()
    if body.endswith(";"):
        body = body[:-1]
    return json.loads(body)


def assets_by_id():
    return {a["id"]: a for a in load_manifest()["assets"]}


def asset_path(a):
    return os.path.join(ASSETS, a["file"].replace("/", os.sep))
