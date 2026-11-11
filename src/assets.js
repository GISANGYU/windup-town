// 이미지 불러오기 · 자동 정리(배경 제거, 여백 자르기) · 핫 리로드 · 임시 도형
(function () {
  const C = WT.C;
  const list = (window.ASSET_MANIFEST && window.ASSET_MANIFEST.assets) || [];
  const byId = {};
  list.forEach((a) => { byId[a.id] = { def: a, ok: false, tex: null, tries: 0, processed: false, loading: false }; });

  // 배경 지우기 + 여백 자르기. file:// 처럼 픽셀을 읽을 수 없으면 원본을 그대로 쓴다.
  function processImage(img, def) {
    if (def.fit === 'full' || def.fit === 'stretch') return { tex: img, processed: false };
    const maxH = Math.max(256, Math.round(def.h * 2.5));
    const s = Math.min(1, maxH / img.naturalHeight);
    const w = Math.max(1, Math.round(img.naturalWidth * s)), h = Math.max(1, Math.round(img.naturalHeight * s));
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const cx = cv.getContext('2d');
    cx.drawImage(img, 0, 0, w, h);
    let data;
    try { data = cx.getImageData(0, 0, w, h); } catch (e) { return { tex: img, processed: false }; }
    const d = data.data;
    const at = (x, y) => (y * w + x) * 4;
    const corner = [at(0, 0), at(w - 1, 0), at(0, h - 1), at(w - 1, h - 1)];
    if (!corner.every((i) => d[i + 3] < 10)) {
      // 테두리에서 가장 흔한 색을 배경으로 보고 flood fill
      const counts = {};
      const sample = (x, y) => { const i = at(x, y); const k = (d[i] >> 4) + ',' + (d[i + 1] >> 4) + ',' + (d[i + 2] >> 4); counts[k] = (counts[k] || 0) + 1; };
      for (let x = 0; x < w; x += 3) { sample(x, 0); sample(x, h - 1); }
      for (let y = 0; y < h; y += 3) { sample(0, y); sample(w - 1, y); }
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0].split(',').map((v) => v * 16 + 8);
      const isMag = top[0] > 200 && top[2] > 200 && top[1] < 90;
      const bg = isMag ? [255, 0, 255] : top;
      const tol2 = 70 * 70;
      const seen = new Uint8Array(w * h);
      const stack = [];
      for (let x = 0; x < w; x++) { stack.push(x, 0, x, h - 1); }
      for (let y = 0; y < h; y++) { stack.push(0, y, w - 1, y); }
      while (stack.length) {
        const y = stack.pop(), x = stack.pop();
        const p = y * w + x;
        if (seen[p]) continue;
        seen[p] = 1;
        const i = p * 4;
        const dr = d[i] - bg[0], dg = d[i + 1] - bg[1], db = d[i + 2] - bg[2];
        if (d[i + 3] < 10 || dr * dr + dg * dg + db * db <= tol2) {
          d[i + 3] = 0;
          if (x > 0) stack.push(x - 1, y);
          if (x < w - 1) stack.push(x + 1, y);
          if (y > 0) stack.push(x, y - 1);
          if (y < h - 1) stack.push(x, y + 1);
        }
      }
      if (isMag) for (let i = 0; i < d.length; i += 4) if (d[i + 3] && d[i] > 150 && d[i + 2] > 150 && d[i + 1] < 110) d[i + 3] = 0;
    }
    let x1 = w, y1 = h, x2 = -1, y2 = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[at(x, y) + 3] > 20) {
      if (x < x1) x1 = x; if (x > x2) x2 = x; if (y < y1) y1 = y; if (y > y2) y2 = y;
    }
    cx.putImageData(data, 0, 0);
    if (x2 < 0) return { tex: cv, processed: true };
    const out = document.createElement('canvas');
    out.width = x2 - x1 + 1; out.height = y2 - y1 + 1;
    out.getContext('2d').drawImage(cv, x1, y1, out.width, out.height, 0, 0, out.width, out.height);
    return { tex: out, processed: true };
  }

  // 배포 사이트에서는 압축본(assets_web/*.webp, tools/build_web_assets.py)을 먼저 쓴다.
  // 로컬에서는 Codex가 바꾼 원본 PNG가 바로 보이도록 원본만 쓴다. (?web 으로 로컬에서도 압축본 시험 가능)
  const LOCAL = location.protocol === 'file:' || ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  const USE_WEB = !LOCAL || /[?&]web/.test(location.search);
  const webPath = (file) => 'assets_web/' + file.replace(/\.png$/i, '.webp');

  function load(id, bust, tryWeb) {
    const e = byId[id];
    if (!e || e.loading) return;
    e.loading = true;
    const img = new Image();
    img.onload = () => {
      const r = processImage(img, e.def);
      e.tex = r.tex; e.processed = r.processed; e.ok = true; e.loading = false;
      WT.Assets.version++;
    };
    img.onerror = () => {
      e.loading = false;
      if (tryWeb) return load(id, bust, false); // 압축본이 없으면 원본으로
      e.tries++; if (bust) { e.ok = false; e.tex = null; }
    };
    img.src = (tryWeb ? webPath(e.def.file) : 'assets/' + e.def.file) + (bust ? '?v=' + Date.now() : '');
  }

  // 먼저 보이는 것부터: 오프닝 컷신 → 마을 → 캐릭터 → 나머지 → 보스·후반 컷신
  const PRIORITY = { story: 0, bg: 1, player: 2, npc: 2, props: 2, ui: 3, fx: 3, portrait: 4, furniture: 4, wind: 4, boss: 5 };
  const rank = (a) => (a.group === 'story' && /0[5-9]/.test(a.id) ? 6 : PRIORITY[a.group] ?? 5);

  WT.Assets = {
    version: 0,
    useWeb: USE_WEB,
    init() {
      list.slice().sort((a, b) => rank(a) - rank(b)).forEach((a) => load(a.id, false, USE_WEB));
      // 없는 파일 다시 시도(로컬: Codex가 새로 넣는 파일을 2초 안에 반영). 배포 사이트는 바뀔 일이 없어 더 드물게.
      setInterval(() => { list.forEach((a) => { const e = byId[a.id]; if (!e.ok && (LOCAL || e.tries < 3)) load(a.id, true, false); }); }, LOCAL ? WT.CFG.assetRetryMs : 15000);
    },
    reloadAll() { list.forEach((a) => { byId[a.id].loading = false; load(a.id, true); }); },
    has(id) { return !!(byId[id] && byId[id].ok); },
    tex(id) { return byId[id] && byId[id].ok ? byId[id].tex : null; },
    def(id) { return byId[id] && byId[id].def; },
    first(ids) { for (const id of ids) if (this.has(id)) return id; return null; },
    status() {
      const all = list.length, ok = list.filter((a) => byId[a.id].ok).length;
      const missReq = list.filter((a) => a.req && !byId[a.id].ok).map((a) => a.id);
      const raw = list.filter((a) => byId[a.id].ok && !byId[a.id].processed && (a.fit === 'bottom' || a.fit === 'center')).length;
      return { all, ok, missReq, raw };
    },
    // 비율(가로/세로). 이미지가 없으면 임시 도형 기준값.
    aspect(id, fallback) { const t = this.tex(id); return t ? (t.width || t.naturalWidth) / (t.height || t.naturalHeight) : (fallback || 1); }
  };

  // ───────── 그리기 공통 ─────────
  // ids: 우선순위 순서의 이미지 ID 배열 / ph: 임시 도형 함수 (ctx, h, o) — 원점은 발끝(또는 중심)
  // o: { h, flip, sx, sy, rot, alpha, anchor: 'bottom'|'center', ...임시도형 옵션 }
  WT.drawThing = function (ctx, ids, ph, x, y, o) {
    o = o || {};
    const id = WT.Assets.first(Array.isArray(ids) ? ids : [ids]);
    const h = o.h;
    ctx.save();
    ctx.translate(x, y);
    if (o.rot) ctx.rotate(o.rot);
    ctx.scale((o.flip ? -1 : 1) * (o.sx || 1), o.sy || 1);
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    if (id) {
      const t = WT.Assets.tex(id);
      const tw = t.width || t.naturalWidth, th = t.height || t.naturalHeight;
      const dh = h, dw = tw * (h / th);
      ctx.drawImage(t, -dw / 2, o.anchor === 'center' ? -dh / 2 : -dh, dw, dh);
    } else if (ph) {
      ph(ctx, h, o);
    }
    ctx.restore();
    return !!id;
  };

  // ───────── 임시 도형 (외곽선 #3d3346, 파이 눈) ─────────
  const PH = {};
  function style(ctx, fill, lw) { ctx.fillStyle = fill; ctx.strokeStyle = C.outline; ctx.lineWidth = lw || WT.CFG.lineW; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; }
  function ell(ctx, x, y, rx, ry, fill, lw) { style(ctx, fill, lw); ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  function rr(ctx, x, y, w, h, r, fill, lw) { style(ctx, fill, lw); ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); ctx.stroke(); }
  // 파이 눈: 흰자 + 검은 타원에서 한 조각 잘라냄. open 0~1 (감김 정도)
  function pieEye(ctx, x, y, s, open, look) {
    open = open == null ? 1 : open;
    ell(ctx, x, y, s * 0.62, s, C.white, 2.5);
    if (open < 0.35) { style(ctx, C.outline, 3); ctx.beginPath(); ctx.moveTo(x - s * 0.5, y); ctx.quadraticCurveTo(x, y + s * 0.35, x + s * 0.5, y); ctx.stroke(); return; }
    const px = x + (look || 0) * s * 0.2, py = y + s * 0.15;
    ctx.fillStyle = C.black;
    ctx.beginPath();
    ctx.ellipse(px, py, s * 0.36, s * 0.6 * open, 0, -Math.PI * 0.32, Math.PI * 1.68 - Math.PI * 0.36);
    ctx.lineTo(px, py);
    ctx.closePath(); ctx.fill();
    if (open < 0.8) { // 처진 눈꺼풀
      ctx.fillStyle = C.cream; ctx.strokeStyle = C.outline; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(x, y, s * 0.62, s, 0, Math.PI, 0); ctx.closePath();
      ctx.save(); ctx.clip(); ctx.fillRect(x - s, y - s * 1.2, s * 2, s * (1.2 - (open - 0.35) * 1.4)); ctx.restore();
      ctx.beginPath(); ctx.ellipse(x, y, s * 0.62, s, 0, 0, Math.PI * 2); ctx.stroke();
    }
  }
  // 러버호스 팔다리 (곡선)
  function hose(ctx, x1, y1, x2, y2, bend, w, color) {
    ctx.strokeStyle = C.outline; ctx.lineWidth = w + 5; ctx.lineCap = 'round';
    const mx = (x1 + x2) / 2 + bend, my = (y1 + y2) / 2;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(mx, my, x2, y2); ctx.stroke();
    ctx.strokeStyle = color || C.white; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(mx, my, x2, y2); ctx.stroke();
  }
  function shoe(ctx, x, y, s, color) { ell(ctx, x, y - s * 0.45, s, s * 0.55, color || C.red); }
  function glove(ctx, x, y, s) { ell(ctx, x, y, s, s * 0.85, C.white, 3); }

  // 보글: 주전자 몸 전체가 캐릭터. o.pose: idle|walk|jump|interact|happy, o.dir: down|up|side, o.t: 시간
  PH.bogle = function (ctx, h, o) {
    const k = h / 110, t = o.t || 0, pose = o.pose || 'idle', dir = o.dir || 'down';
    ctx.scale(k, k);
    const step = pose === 'walk' ? Math.sin(t * 12) : 0;
    const air = pose === 'jump';
    // 다리
    const ly = -34;
    hose(ctx, -12, ly, air ? -16 : -14 + step * 8, air ? -14 : -6, -6, 6);
    hose(ctx, 12, ly, air ? 16 : 14 - step * 8, air ? -14 : -6, 6, 6);
    shoe(ctx, air ? -18 : -16 + step * 8, air ? -8 : 0, 11);
    shoe(ctx, air ? 18 : 16 - step * 8, air ? -8 : 0, 11);
    // 팔
    const armUp = pose === 'happy' || air;
    const reach = pose === 'interact';
    hose(ctx, -30, -64, armUp ? -44 : -40, armUp ? -96 : -46 - step * 4, -8, 5);
    hose(ctx, 30, -64, reach ? 56 : armUp ? 44 : 40, reach ? -66 : armUp ? -96 : -46 + step * 4, 8, 5);
    glove(ctx, armUp ? -44 : -40, armUp ? -96 : -46 - step * 4, 7);
    glove(ctx, reach ? 56 : armUp ? 44 : 40, reach ? -66 : armUp ? -96 : -46 + step * 4, 7);
    // 손잡이(뒤) / 주둥이
    if (dir !== 'up') { style(ctx, C.white); ctx.beginPath(); ctx.moveTo(28, -62); ctx.quadraticCurveTo(52, -72, 50, -92); ctx.lineTo(42, -90); ctx.quadraticCurveTo(42, -74, 26, -70); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    if (dir === 'up' || dir === 'side') { style(ctx, 'transparent', 6); ctx.beginPath(); ctx.arc(dir === 'side' ? -34 : 0, -66, 12, Math.PI * 0.5, Math.PI * 1.5, dir === 'side'); ctx.stroke(); }
    // 몸통
    ell(ctx, 0, -66, 36, 32, C.white);
    style(ctx, C.blue, 3); ctx.beginPath(); ctx.ellipse(0, -60, 35, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.white; for (let i = -24; i <= 24; i += 12) { ctx.beginPath(); ctx.arc(i, -60, 2.2, 0, 7); ctx.fill(); }
    // 뚜껑
    ell(ctx, 0, -96, 22, 6, C.white, 3);
    ell(ctx, 0, -104, 7, 6, C.red, 3);
    // 얼굴
    if (dir !== 'up') {
      const fx = dir === 'side' ? 10 : 0;
      const happy = pose === 'happy';
      pieEye(ctx, fx - 11, -76, 9, happy ? 0.2 : 1, dir === 'side' ? 1 : 0);
      pieEye(ctx, fx + 11, -76, 9, happy ? 0.2 : 1, dir === 'side' ? 1 : 0);
      ctx.fillStyle = 'rgba(210,70,60,.35)'; ctx.beginPath(); ctx.arc(fx - 22, -64, 5, 0, 7); ctx.arc(fx + 22, -64, 5, 0, 7); ctx.fill();
      style(ctx, C.outline, 3); ctx.beginPath(); ctx.arc(fx, -66, happy ? 10 : 8, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    }
  };

  // 그라모: 나무 상자 몸 + 황동 나팔. o.mood: sleepy|awake, o.t, o.wind(0~1 감기 진행)
  PH.gramo = function (ctx, h, o) {
    const k = h / 160, t = o.t || 0, awake = o.mood === 'awake';
    ctx.scale(k, k);
    const sw = awake ? Math.sin(t * WT.CFG.bpm / 60 * Math.PI) : 0;
    hose(ctx, -16, -30, -20 + (awake ? sw * 8 : 0), -6, -5, 7, C.black);
    hose(ctx, 16, -30, 20 - (awake ? sw * 8 : 0), -6, 5, 7, C.black);
    shoe(ctx, -22 + (awake ? sw * 8 : 0), 0, 12, C.black); shoe(ctx, 22 - (awake ? sw * 8 : 0), 0, 12, C.black);
    // 팔
    if (awake) { hose(ctx, -38, -66, -58, -104 + sw * 6, -8, 6); glove(ctx, -58, -104 + sw * 6, 8); }
    else { hose(ctx, -38, -60, -44, -34, -4, 6); glove(ctx, -44, -34, 8); }
    hose(ctx, 38, -60, 46, awake ? -44 : -34, 4, 6); glove(ctx, 46, awake ? -44 : -34, 8);
    // 크랭크
    ctx.save(); ctx.translate(40, -70); ctx.rotate((o.wind || 0) * Math.PI * 6);
    style(ctx, C.yellow, 3); ctx.fillRect(0, -3, 22, 6); ctx.strokeRect(0, -3, 22, 6); ell(ctx, 22, 0, 6, 6, C.yellow, 3); ctx.restore();
    // 몸통 상자
    rr(ctx, -40, -100, 80, 72, 10, C.wood);
    style(ctx, C.cream, 3); ctx.strokeStyle = C.cream; ctx.lineWidth = 3; ctx.strokeRect(-32, -92, 64, 56);
    // 얼굴
    const open = awake ? 1 : 0.45 + Math.sin(t * 1.3) * 0.05;
    pieEye(ctx, -14, -74, 10, open); pieEye(ctx, 14, -74, 10, open);
    style(ctx, C.white, 3); ctx.beginPath(); ctx.ellipse(-12, -54, 14, 6, 0.3, 0, 7); ctx.ellipse(12, -54, 14, 6, -0.3, 0, 7); ctx.fill(); ctx.stroke();
    if (awake) { style(ctx, C.black, 3); ctx.beginPath(); ctx.arc(0, -46, 9, 0, Math.PI); ctx.fill(); }
    // 나팔
    ctx.save(); ctx.translate(0, -100);
    ctx.rotate(awake ? -0.15 + sw * 0.08 : 1.1 + Math.sin(t * 1.3) * 0.04);
    style(ctx, C.yellow); ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(-30, -62); ctx.quadraticCurveTo(0, -78, 30, -62); ctx.lineTo(6, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ell(ctx, 0, -66, 30, 10, '#e0a93a', 3);
    ctx.restore();
  };

  // 피프: 빨간 우체통
  PH.pip = function (ctx, h, o) {
    const k = h / 120, t = o.t || 0, awake = o.mood === 'awake';
    ctx.scale(k, k);
    const sw = awake ? Math.sin(t * WT.CFG.bpm / 60 * Math.PI) : 0;
    hose(ctx, -8, -26, -14 + sw * 6, -6, -4, 6); hose(ctx, 8, -26, 14 - sw * 6, -6, 4, 6);
    shoe(ctx, -16 + sw * 6, 0, 10, C.blue); shoe(ctx, 16 - sw * 6, 0, 10, C.blue);
    style(ctx, C.red); ctx.beginPath(); ctx.moveTo(-30, -26); ctx.lineTo(-30, -84); ctx.arc(0, -84, 30, Math.PI, 0); ctx.lineTo(30, -26); ctx.closePath(); ctx.fill(); ctx.stroke();
    // 깃발
    ctx.save(); ctx.translate(30, -70); ctx.rotate(awake ? -1.4 + sw * 0.2 : 0.2);
    style(ctx, C.outline, 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -26); ctx.stroke();
    rr(ctx, 0, -28, 16, 11, 2, C.blue, 3); ctx.restore();
    // 팔
    hose(ctx, -30, -56, awake ? -46 : -40, awake ? -86 + sw * 6 : -36, -6, 5); glove(ctx, awake ? -46 : -40, awake ? -86 + sw * 6 : -36, 7);
    const open = awake ? 1 : 0.4;
    pieEye(ctx, -11, -86, 8, open); pieEye(ctx, 11, -86, 8, open);
    rr(ctx, -16, -66, 32, awake ? 12 : 6, 4, C.black, 3);
  };

  PH.lamp = function (ctx, h, o) {
    const k = h / 200, on = o.mood === 'awake';
    ctx.scale(k, k);
    style(ctx, C.outline, 8); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -150); ctx.quadraticCurveTo(0, -180, 26, -176); ctx.stroke();
    rr(ctx, -14, -10, 28, 10, 3, C.outline, 2);
    if (on) { ctx.fillStyle = 'rgba(242,193,78,.25)'; ctx.beginPath(); ctx.arc(30, -150, 46, 0, 7); ctx.fill(); }
    rr(ctx, 14, -170, 32, 40, 8, on ? C.yellow : '#b8b0a0');
    pieEye(ctx, 24, -150, 6, on ? 1 : 0.3); pieEye(ctx, 37, -150, 6, on ? 1 : 0.3);
  };

  PH.house = function (ctx, h) {
    const k = h / 260; ctx.scale(k, k);
    rr(ctx, -110, -150, 220, 150, 18, C.cream);
    style(ctx, C.red); ctx.beginPath(); ctx.moveTo(-132, -140); ctx.quadraticCurveTo(0, -300, 132, -140); ctx.closePath(); ctx.fill(); ctx.stroke();
    rr(ctx, 50, -250, 26, 60, 4, C.grey);
    pieEye(ctx, -58, -96, 20, 1); pieEye(ctx, 58, -96, 20, 1);
    rr(ctx, -26, -76, 52, 76, [26, 26, 0, 0], C.wood);
    ell(ctx, 14, -38, 4, 4, C.yellow, 2);
  };
  PH.tree = function (ctx, h, o) {
    const k = h / 200; ctx.scale(k, k);
    const tall = o.type === 'tall';
    style(ctx, C.wood); ctx.beginPath(); ctx.moveTo(-12, 0); ctx.quadraticCurveTo(-4, -50, -10, -90); ctx.lineTo(10, -90); ctx.quadraticCurveTo(4, -50, 14, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    if (tall) { ell(ctx, 0, -112, 34, 30, C.olive); ell(ctx, 0, -150, 30, 28, C.olive); ell(ctx, 0, -182, 22, 20, C.olive); }
    else { ell(ctx, -26, -110, 34, 30, C.olive); ell(ctx, 26, -110, 34, 30, C.olive); ell(ctx, 0, -140, 44, 40, C.olive); }
  };
  PH.bush = function (ctx, h) { const k = h / 56; ctx.scale(k, k); ell(ctx, -26, -22, 24, 20, '#7d8d5c'); ell(ctx, 26, -22, 24, 20, '#7d8d5c'); ell(ctx, 0, -32, 28, 24, '#8a9a6b'); };
  PH.rock = function (ctx, h) { const k = h / 44; ctx.scale(k, k); ell(ctx, 0, -20, 30, 20, C.grey); ell(ctx, -8, -28, 8, 4, '#a89a90', 0); };
  PH.fence = function (ctx, h) {
    const k = h / 70; ctx.scale(k, k);
    rr(ctx, -60, -46, 120, 10, 3, C.sand, 3); rr(ctx, -60, -24, 120, 10, 3, C.sand, 3);
    for (let i = 0; i < 4; i++) { const x = -48 + i * 32; style(ctx, C.cream, 3); ctx.beginPath(); ctx.moveTo(x - 8, 0); ctx.lineTo(x - 8, -58); ctx.lineTo(x, -68); ctx.lineTo(x + 8, -58); ctx.lineTo(x + 8, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  };
  PH.pond = function (ctx, h) {
    const k = h / 170; ctx.scale(k, k);
    ell(ctx, 0, 0, 170, 80, C.teal);
    style(ctx, 'transparent', 3); ctx.strokeStyle = 'rgba(251,246,234,.7)';
    [[-60, -10, 30], [40, 20, 40], [80, -30, 22]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.3, 0, 0, Math.PI); ctx.stroke(); });
    ell(ctx, -100, 20, 18, 8, '#8fae6a', 3); ell(ctx, 110, -10, 16, 7, '#8fae6a', 3);
  };
  PH.stage = function (ctx, h) {
    const k = h / 150; ctx.scale(k, k);
    ell(ctx, 0, 12, 150, 62, C.red);
    for (let i = -5; i <= 5; i++) { ctx.fillStyle = C.cream; ctx.fillRect(i * 26 - 6, 14, 12, 34 - Math.abs(i) * 3); }
    ell(ctx, 0, 0, 150, 62, '#c9a477');
    for (let a = 0; a < 16; a++) { const r = a / 16 * Math.PI * 2; ell(ctx, Math.cos(r) * 142, Math.sin(r) * 56, 4, 4, C.yellow, 2); }
  };
  PH.key = function (ctx, h) {
    const k = h / 44; ctx.scale(k, k);
    ell(ctx, -10, -32, 9, 10, C.yellow, 3); ell(ctx, 10, -32, 9, 10, C.yellow, 3);
    rr(ctx, -4, -26, 8, 26, 3, C.yellow, 3); rr(ctx, -9, -6, 18, 6, 2, C.yellow, 3);
  };
  PH.chair = function (ctx, h) {
    const k = h / 110; ctx.scale(k, k);
    hose(ctx, -20, -40, -24, 0, -4, 5, C.wood); hose(ctx, 20, -40, 24, 0, 4, 5, C.wood);
    rr(ctx, -26, -108, 52, 64, 14, C.wood); ell(ctx, 0, -42, 32, 10, C.red);
  };
  PH.table = function (ctx, h) {
    const k = h / 95; ctx.scale(k, k);
    hose(ctx, -30, -56, -36, 0, -6, 6, C.wood); hose(ctx, 30, -56, 36, 0, 6, 6, C.wood); hose(ctx, 0, -56, 0, 0, 0, 6, C.wood);
    ell(ctx, 0, -64, 56, 18, C.cream); style(ctx, C.cream); ctx.beginPath(); ctx.moveTo(-56, -64); ctx.lineTo(-50, -44); ctx.quadraticCurveTo(0, -36, 50, -44); ctx.lineTo(56, -64); ctx.fill(); ctx.stroke();
  };
  PH.plant = function (ctx, h) {
    const k = h / 115; ctx.scale(k, k);
    ell(ctx, -18, -70, 16, 22, '#7d9a5c'); ell(ctx, 18, -76, 16, 22, '#7d9a5c'); ell(ctx, 0, -92, 16, 22, '#8aa86a');
    style(ctx, C.red); ctx.beginPath(); ctx.moveTo(-26, -50); ctx.lineTo(26, -50); ctx.lineTo(18, 0); ctx.lineTo(-18, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  };
  PH.gramophone = function (ctx, h) {
    const k = h / 120; ctx.scale(k, k);
    rr(ctx, -34, -44, 68, 44, 8, C.wood);
    style(ctx, C.yellow); ctx.beginPath(); ctx.moveTo(-4, -44); ctx.lineTo(-30, -108); ctx.quadraticCurveTo(0, -122, 30, -108); ctx.lineTo(4, -44); ctx.closePath(); ctx.fill(); ctx.stroke();
  };
  PH.note = function (ctx, h) { const k = h / 40; ctx.scale(k, k); ell(ctx, -6, 8, 9, 7, C.outline, 2); style(ctx, C.outline, 4); ctx.beginPath(); ctx.moveTo(2, 8); ctx.lineTo(2, -16); ctx.quadraticCurveTo(10, -10, 14, -4); ctx.stroke(); };
  PH.zzz = function (ctx, h) { const k = h / 40; ctx.scale(k, k); style(ctx, 'transparent', 3); ctx.beginPath(); ctx.moveTo(-8, -8); ctx.lineTo(8, -8); ctx.lineTo(-8, 8); ctx.lineTo(8, 8); ctx.stroke(); };
  PH.sparkle = function (ctx, h) {
    const k = h / 48; ctx.scale(k, k); style(ctx, C.white, 3);
    ctx.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 6 : 20, a = i / 8 * Math.PI * 2 - Math.PI / 2; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.stroke();
  };
  PH.dust = function (ctx, h) { const k = h / 36; ctx.scale(k, k); ell(ctx, -16, -8, 10, 8, C.cream, 3); ell(ctx, 16, -8, 10, 8, C.cream, 3); ell(ctx, 0, -14, 12, 10, C.cream, 3); };
  PH.keycap = function (ctx, h) {
    const k = h / 48; ctx.scale(k, k); rr(ctx, -22, -22, 44, 44, 9, C.cream, 3);
    ctx.fillStyle = C.outline; ctx.font = 'bold 26px "Do Hyeon", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('E', 0, 1);
  };
  PH.portrait = function (ctx, h, o) { // 대화 카드용: 해당 캐릭터 임시 도형을 크게
    const fn = PH[o.who] || PH.bogle; ctx.translate(0, h * 0.42); fn(ctx, h * 0.95, o);
  };

  PH.cuckoo = function (ctx, h, o) { PH.boss(ctx, h * 1.75, Object.assign({}, o, { pose: 'cuckoo' })); };
  WT.PH = PH;
  WT.pieEye = pieEye;
})();
