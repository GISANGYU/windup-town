// 태엽 감기 모달 (MUST HAVE 1의 핵심 연출, 튜토리얼에서 처음 배우는 동작)
// 조작: 마우스로 열쇠 둘레에 시계 방향 원 그리기 / A·D(←·→) 번갈아 누르기
// 진행도 0→1. 1/3, 2/3에서 "딸깍" 고정(뒤로 풀리지 않음). 손을 떼면 다음 딸깍 전까지 천천히 풀린다.
(function () {
  const C = WT.C, PH = WT.PH, D = WT.DIALOGUE.wind;
  const TURNS = 4;            // 끝까지 감는 데 필요한 바퀴 수 (마우스)
  const PER_TAP = 1 / 30;     // 번갈아 누르기 1번
  const DECAY = 0.08;         // 손 뗐을 때 초당 풀리는 양
  const W = WT.Wind = { active: false };
  let cv, ctx, el, st;

  W.init = function () {
    el = document.getElementById('wind');
    cv = document.getElementById('windCanvas');
    ctx = cv.getContext('2d');
    document.getElementById('windGuide').textContent = D.guide;
    document.getElementById('windTitle').textContent = D.title;
    const toLocal = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * cv.width, (e.clientY - r.top) / r.height * cv.height]; };
    cv.addEventListener('pointerdown', (e) => { if (!st) return; st.drag = true; st.lastAng = angle(...toLocal(e)); cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', (e) => {
      if (!st || !st.drag) return;
      const a = angle(...toLocal(e));
      let d = a - st.lastAng;
      if (d > Math.PI) d -= Math.PI * 2;
      if (d < -Math.PI) d += Math.PI * 2;
      st.lastAng = a;
      W.add(d / (Math.PI * 2) / TURNS);
    });
    cv.addEventListener('pointerup', () => { if (st) st.drag = false; });
  };
  const center = () => [cv.width / 2, cv.height * 0.52];
  function angle(x, y) { const [cx, cy] = center(); return Math.atan2(y - cy, x - cx); }

  // opts: { title, guide, timeLimit(초), resist(초당 되감김), back(배경 이미지 ID), variant('gramo'|'boss'), onFail }
  W.open = function (onDone, opts) {
    opts = opts || {};
    st = { p: 0, lock: 0, idle: 0, lastKey: null, onDone, done: 0, shake: 0, pops: [], drag: false, lastAng: 0, hand: 0, opts, left: opts.timeLimit || 0 };
    document.getElementById('windTitle').textContent = opts.title || D.title;
    document.getElementById('windGuide').textContent = opts.guide || D.guide;
    el.dataset.variant = opts.variant || 'gramo';
    W.active = true;
    el.classList.add('open');
    setMsg('');
  };
  W.close = function () { W.active = false; st = null; el.classList.remove('open'); };

  // 감기 입력 (양수만 진행, 반대로 돌리면 조금 풀림)
  W.add = function (v) {
    if (!st || st.done) return;
    if (v > 0) { st.p = Math.min(1, st.p + v); st.idle = 0; }
    else st.p = Math.max(st.lock, st.p + v * 0.5);
    const notch = Math.floor(st.p * 3 + 1e-6);
    if (notch > Math.round(st.lock * 3) && notch < 3) {
      st.lock = notch / 3; st.shake = 0.35; pop(D.notch[notch - 1]);
    }
    if (st.p >= 1) {
      st.p = 1; st.lock = 1; st.done = 0.01; st.shake = 0.6; pop(D.notch[2]); setMsg(D.done);
    }
  };
  W.key = function (code) {
    if (!st) return false;
    const side = ['KeyA', 'ArrowLeft'].includes(code) ? 'L' : ['KeyD', 'ArrowRight'].includes(code) ? 'R' : null;
    if (!side) return false;
    if (st.lastKey && st.lastKey !== side) W.add(PER_TAP);
    st.lastKey = side;
    st.hand = side === 'L' ? -1 : 1;
    return true;
  };
  W.finishNow = function () { if (st) { W.add(1); st.done = 2; } };

  function pop(text) { st.pops.push({ text, t: 0 }); }
  function setMsg(t) { document.getElementById('windMsg').textContent = t; }

  W.update = function (dt) {
    if (!st) return;
    st.idle += dt;
    if (st.shake > 0) st.shake -= dt;
    st.pops.forEach((q) => { q.t += dt; });
    st.pops = st.pops.filter((q) => q.t < 1.2);
    if (!st.done && !st.drag && st.idle > 0.5) st.p = Math.max(st.lock, st.p - DECAY * dt);
    if (!st.done && st.opts.resist) st.p = Math.max(st.lock, st.p - st.opts.resist * dt);
    if (!st.done && st.opts.timeLimit) {
      st.left -= dt;
      setMsg(`남은 시간 ${Math.max(0, st.left).toFixed(1)}초`);
      if (st.left <= 0) { const f = st.opts.onFail; W.close(); f && f(); return; }
    }
    document.getElementById('windBar').style.width = (st.p * 100).toFixed(1) + '%';
    [1, 2, 3].forEach((i) => document.getElementById('windN' + i).classList.toggle('on', st.p >= i / 3 - 1e-6));
    if (st.done) {
      st.done += dt;
      if (st.done > 1.3) { const cb = st.onDone; W.close(); cb && cb(); return; }
    }
    draw();
  };

  // ───────── 그리기 ─────────
  function draw() {
    const w = cv.width, h = cv.height, [cx, cy] = center(), p = st.p, t = performance.now() / 1000;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    if (st.shake > 0) ctx.translate((Math.random() - 0.5) * 10 * st.shake, (Math.random() - 0.5) * 10 * st.shake);
    const back = st.opts.back || 'wind_gramo_back';
    if (WT.Assets.has(back)) {
      WT.drawThing(ctx, back, null, cx, h, { h: h * 0.98 });
    } else if (st.opts.variant === 'boss') {
      // 백작의 등: 남색 자명종 뒷면, 종 두 개, 버둥거림
      const wob = Math.sin(t * 9) * 0.04 * (1 - p);
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(wob);
      [[-90, -150], [90, -150]].forEach(([x, y]) => { ctx.fillStyle = '#c99a3a'; ctx.strokeStyle = C.outline; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y, 46, Math.PI, 0); ctx.lineTo(x + 46, y + 8); ctx.lineTo(x - 46, y + 8); ctx.closePath(); ctx.fill(); ctx.stroke(); });
      ctx.fillStyle = '#3b4a6b'; ctx.strokeStyle = C.outline; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 180, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(244,230,200,.25)'; ctx.lineWidth = 4; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, 0, 150 - i * 30, 0, Math.PI * 2); ctx.stroke(); }
      ctx.fillStyle = '#c99a3a'; ctx.strokeStyle = C.outline; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.restore();
      if (p > 0.66) for (let i = 0; i < 2; i++) WT.drawThing(ctx, 'fx_steam', PH.steam, cx + (i ? 150 : -150), cy - 170 - Math.sin(t * 8 + i) * 10, { h: 50, anchor: 'center' });
    } else {
      // 나팔: 처져 있다가 진행도에 따라 일어섬
      ctx.save(); ctx.translate(cx, cy - 130); ctx.rotate(1.2 * (1 - p) + Math.sin(t * 6) * 0.03 * p);
      ctx.fillStyle = C.yellow; ctx.strokeStyle = C.outline; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-60, -120); ctx.quadraticCurveTo(0, -150, 60, -120); ctx.lineTo(10, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
      // 상자 등
      ctx.fillStyle = C.wood; ctx.strokeStyle = C.outline; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.roundRect(cx - 170, cy - 140, 340, 260, 24); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = C.cream; ctx.lineWidth = 4; ctx.strokeRect(cx - 150, cy - 120, 300, 220);
      // 열쇠 구멍 판
      ctx.fillStyle = '#c99a3a'; ctx.strokeStyle = C.outline; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(cx, cy, 40, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // 딸깍 표시 3칸
      for (let i = 0; i < 3; i++) {
        const on = p >= (i + 1) / 3 - 1e-6;
        ctx.fillStyle = on ? C.yellow : '#5a3a2a'; ctx.beginPath(); ctx.arc(cx - 50 + i * 50, cy + 92, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
    }
    // 진행 링
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(244,230,200,.25)'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(cx, cy, 118, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = C.yellow; ctx.beginPath(); ctx.arc(cx, cy, 118, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); ctx.stroke();
    // 열쇠 (진행도만큼 회전)
    const rot = p * TURNS * Math.PI * 2 + (st.hand ? st.hand * 0.05 : 0);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
    if (!WT.drawThing(ctx, 'wind_key', null, 0, 0, { h: 200, anchor: 'center' })) {
      ctx.translate(0, 90);
      PH.key(ctx, 190, {});
    }
    ctx.restore();
    // 처음 안내: 원을 그리는 화살표
    if (p < 0.05) {
      ctx.save(); ctx.translate(cx, cy);
      ctx.strokeStyle = 'rgba(244,230,200,.85)'; ctx.lineWidth = 5; ctx.setLineDash([12, 10]); ctx.lineDashOffset = -t * 40;
      ctx.beginPath(); ctx.arc(0, 0, 150, -Math.PI * 0.4, Math.PI * 1.2); ctx.stroke(); ctx.setLineDash([]);
      const a = Math.PI * 1.2; ctx.fillStyle = 'rgba(244,230,200,.85)';
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * 150 - 14, Math.sin(a) * 150); ctx.lineTo(Math.cos(a) * 150 + 14, Math.sin(a) * 150 - 6); ctx.lineTo(Math.cos(a) * 150 + 2, Math.sin(a) * 150 + 16); ctx.fill();
      // 손 아이콘(흰 장갑)
      const ha = t * 2.4; WT.drawThing(ctx, null, (c) => { c.fillStyle = C.white; c.strokeStyle = C.outline; c.lineWidth = 4; c.beginPath(); c.ellipse(0, 0, 18, 15, 0, 0, 7); c.fill(); c.stroke(); }, Math.cos(ha) * 150, Math.sin(ha) * 150, { h: 30 });
      ctx.restore();
    }
    // 딸깍 글자
    st.pops.forEach((q) => {
      ctx.save(); ctx.globalAlpha = 1 - q.t / 1.2; ctx.fillStyle = C.cream; ctx.strokeStyle = C.outline; ctx.lineWidth = 6;
      ctx.font = `${34 + q.t * 10}px "Do Hyeon", sans-serif`; ctx.textAlign = 'center';
      ctx.strokeText(q.text, cx, cy - 150 - q.t * 40); ctx.fillText(q.text, cx, cy - 150 - q.t * 40); ctx.restore();
    });
    ctx.restore();
  }
})();
