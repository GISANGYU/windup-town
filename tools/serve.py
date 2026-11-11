"""개발용 서버. 브라우저 캐시를 끄므로 코드·이미지를 바꾸면 새로고침만으로 반영된다.
사용법:  python tools/serve.py          (기본 포트 5500)
         python tools/serve.py 5600
"""
import http.server
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class NoCache(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, *a):
        pass


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5500
    print(f"태엽 마을: http://localhost:{port}")
    http.server.ThreadingHTTPServer(("", port), NoCache).serve_forever()
