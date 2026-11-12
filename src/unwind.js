// 풀어 주기 모달 (6·7막의 새 기술). 감기와 반대: 시계 반대 방향 원 또는 D → A 번갈아.
// 속도가 초록 띠 안이면 진행이 차고, 너무 빠르면 스프링이 튕겨(진행 −15%) 너무 느리면 다시 감긴다.
// 기획: GAME_DESIGN.md 22-4. 게임 캔버스 위에 그린다(battery_modal.js와 같은 방식).
(function () {
  const C = WT.C, PH = WT.PH;
  const U = WT.Unwind = { active: false };
  let st = null;
  // 속도 s(0~1.5): 키는 초당 번갈아 누른 횟수/8, 마우스는 초당 반대 방향 회전각/12
  const KEY_DIV = 8, MOUSE_DIV = 12;

  // opts: { title, guide, band:[lo,hi], rate(초당 진행), resist(초당 되감김), back(배경 ID), onSnap, tip }
  U.open = function (onDone, opts) {
    opts = opts || {};
    st = { p: 0, s: 0, raw: 0, onDone, opts, band: opts.band || [0.3, 0.8], t: 0, done: 0, snapCd: 0, overT: 0, shake: 0,
      lastKey: null, ang: null, drag: false, pops: [], snaps: 0, rot: 0, creepT: 0 };
    U.active = true;
    WT.Audio.play('sfx_dialog_open');
  };
  U.close = function () { U.active = false; st = null; WT.Audio.stop('sfx_unwind_good'); };
  U.state = () => st;
  // 입력 한 번이 들어올 때 속도 표본을 더한다
  function push(amount) { st.raw += amount; }
  U.key = function (code) {
    if (!st || st.done) return;
    const K = WT.KEY;
    const side = K.left.includes(code) ? 'L' : K.right.includes(code) ? 'R' : null;
    if (!side) return;
    // D → A 순서(R 다음 L)일 때만 '푸는' 입력. 순서가 반대면 무시.
    if (st.lastKey === 'R' && side === 'L') { push(1 / KEY_DIV); st.rot -= 0.5; WT.Audio.play(WT.Audio.defs.sfx_unwind_tick ? 'sfx_unwind_tick' : 'sfx_wind_ratchet', { rate: 1.1 - st.p * 0.4, vol: 0.35 }); }
    st.lastKey = side;
  };
  U.pointer = function (type, x, y) {
    if (!st || st.done) return;
    const cx = WT.W / 2, cy = WT.H / 2 - 20;
    const a = Math.atan2(y - cy, x - cx);
    if (type === 'down') { st.drag = true; st.ang = a; return; }
    if (type === 'up') { st.drag = false; return; }
    if (!st.drag || st.ang == null) return;
    let d = a - st.ang; if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2;
    st.ang = a;
    if (d < 0) { push(-d / MOUSE_DIV); st.rot += d; st.tickAcc = (st.tickAcc || 0) - d; if (st.tickAcc > 0.6) { st.tickAcc = 0; WT.Audio.play(WT.Audio.defs.sfx_unwind_tick ? 'sfx_unwind_tick' : 'sfx_wind_ratchet', { rate: 1.1 - st.p * 0.4, vol: 0.35 }); } }
  };
  U.finishNow = function () { if (st && !st.done) { st.p = 1; finish(); st.done = 2; } };
  // 점검용: 일정한 속도로 푸는 흉내 (s = 띠 안/밖 시험)
  U.simulate = function (speed, sec) { if (!st) return; const n = Math.round(sec * 60); for (let i = 0; i < n && st && !st.done; i++) { st.raw += speed / 60; U.update(1 / 60); } };
  function finish() {
    st.done = 0.01;
    WT.Audio.stop('sfx_unwind_good');
    WT.Audio.jingle('jingle_unwind_done');
  }
  function snap() {
    st.p = Math.max(0, st.p - 0.15); st.snapCd = 0.6; st.shake = 0.5; st.snaps++; st.overT = 0;
    st.pops.push({ text: '팅!', t: 0 });
    WT.Audio.play(WT.Audio.defs.sfx_unwind_snap ? 'sfx_unwind_snap' : 'sfx_spring_pop');
    WT.UI.shake(0.12);
    if (st.opts.onSnap) st.opts.onSnap();
  }
  U.update = function (dt) {
    if (!st) return;
    st.t += dt;
    if (st.done) { st.done += dt; if (st.done > 1.0) { const cb = st.onDone; U.close(); cb && cb(); } return; }
    // 최근 입력량으로 속도 계산 (부드럽게)
    const inst = st.raw / Math.max(dt, 1e-3); st.raw = 0;
    st.s += (inst - st.s) * Math.min(1, dt * 6);
    if (st.snapCd > 0) st.snapCd -= dt;
    if (st.shake > 0) st.shake -= dt;
    st.pops.forEach((q) => { q.t += dt; }); st.pops = st.pops.filter((q) => q.t < 1);
    const [lo, hi] = st.band;
    const inBand = st.s >= lo && st.s <= hi;
    if (st.s > hi) { st.overT += dt; if (st.overT > 0.25 && st.snapCd <= 0) snap(); } else st.overT = 0;
    if (inBand && st.snapCd <= 0) st.p = Math.min(1, st.p + (st.opts.rate || 0.32) * dt);
    else if (st.s < lo) { st.p = Math.max(0, st.p - 0.1 * dt); /* 너무 느리면 다시 감긴다 */ st.creepT += dt; if (st.creepT > 1.6 && st.p > 0.05) { st.creepT = 0; WT.Audio.play(WT.Audio.defs.sfx_unwind_creep ? 'sfx_unwind_creep' : 'sfx_wind_unwind', { vol: 0.3 }); } }
    if (st.opts.resist) st.p = Math.max(0, st.p - st.opts.resist * dt);
    WT.Audio.loopIf('sfx_unwind_good', inBand && st.snapCd <= 0, { vol: 0.3 });
    if (st.p >= 1) finish();
  };

  U.draw = function (ctx) {
    if (!st) return;
    const W = WT.W, H = WT.H, cx = W / 2, cy = H / 2 - 20, t = st.t, p = st.p, [lo, hi] = st.band;
    ctx.save();
    if (st.shake > 0) ctx.translate((Math.random() - 0.5) * 12 * st.shake, (Math.random() - 0.5) * 12 * st.shake);
    ctx.fillStyle = 'rgba(20,14,18,.72)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#2b2230'; ctx.strokeStyle = C.cream; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.roundRect(cx - 380, cy - 290, 760, 590, 14); ctx.fill(); ctx.stroke();
    ctx.font = '40px "Do Hyeon", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#e8a0a8';
    ctx.fillText(st.opts.title || '풀어 주기', cx, cy - 248);
    // 배경
    const back = st.opts.back || 'wind_orgel_back';
    if (!WT.drawThing(ctx, back, null, cx, cy + 190, { h: 380 })) {
      ctx.fillStyle = '#8a5a3a'; ctx.strokeStyle = C.outline; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.roundRect(cx - 200, cy - 150, 400, 300, 24); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#c9a477'; for (let i = 0; i < 12; i++) ctx.fillRect(cx - 150 + i * 25, cy + 90, 12, 40);
      ctx.fillStyle = '#c0c4cc'; ctx.beginPath(); ctx.arc(cx, cy, 40, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    // 열쇠 (반대로 돈다)
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(st.rot - p * Math.PI * 6 + (st.s > hi ? Math.sin(t * 60) * 0.06 : 0));
    if (!WT.drawThing(ctx, 'wind_key', null, 0, 0, { h: 190, anchor: 'center' })) { ctx.translate(0, 90); PH.key(ctx, 180, {}); }
    ctx.restore();
    // 진행 고리 (반시계)
    ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(244,230,200,.25)'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(cx, cy, 118, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#e8a0a8'; ctx.beginPath(); ctx.arc(cx, cy, 118, -Math.PI / 2, -Math.PI / 2 - p * Math.PI * 2, true); ctx.stroke();
    // 처음 안내: 반시계 화살표
    if (p < 0.05 && !st.snaps) {
      ctx.save(); ctx.translate(cx, cy); ctx.strokeStyle = 'rgba(244,230,200,.85)'; ctx.lineWidth = 5; ctx.setLineDash([12, 10]); ctx.lineDashOffset = t * 40;
      ctx.beginPath(); ctx.arc(0, 0, 150, Math.PI * 1.4, -Math.PI * 0.2, true); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    }
    // 속도 띠: 왼쪽 느림 · 가운데 초록 · 오른쪽 튕김
    const gx = cx - 300, gy = cy + 200, gw = 600, gh = 26, scale = 1.3;
    ctx.fillStyle = '#3a2d36'; ctx.strokeStyle = C.cream; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(gx, gy, gw, gh, 13); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(138,170,110,.85)'; ctx.fillRect(gx + gw * lo / scale, gy + 3, gw * (hi - lo) / scale, gh - 6);
    ctx.fillStyle = 'rgba(224,122,58,.5)'; ctx.fillRect(gx + gw * hi / scale, gy + 3, gw - gw * hi / scale - 3, gh - 6);
    const nx = gx + gw * Math.min(1, st.s / scale);
    ctx.fillStyle = st.s > hi ? '#e07a3a' : st.s >= lo ? C.yellow : C.cream; ctx.beginPath(); ctx.moveTo(nx, gy - 6); ctx.lineTo(nx - 9, gy - 20); ctx.lineTo(nx + 9, gy - 20); ctx.closePath(); ctx.fill();
    ctx.font = '16px "Gowun Dodum", sans-serif'; ctx.fillStyle = C.cream; ctx.textAlign = 'left'; ctx.fillText('느림', gx, gy + 44); ctx.textAlign = 'right'; ctx.fillText('튕김', gx + gw, gy + 44); ctx.textAlign = 'center'; ctx.fillText('알맞은 속도', gx + gw * (lo + hi) / 2 / scale, gy + 44);
    // 진행 막대
    ctx.fillStyle = '#3a2d36'; ctx.beginPath(); ctx.roundRect(cx - 300, cy + 258, 600, 12, 6); ctx.fill();
    ctx.fillStyle = '#e8a0a8'; ctx.beginPath(); ctx.roundRect(cx - 300, cy + 258, 600 * p, 12, 6); ctx.fill();
    // 안내
    ctx.font = '19px "Gowun Dodum", sans-serif'; ctx.fillStyle = C.cream; ctx.textAlign = 'center';
    const msg = st.done ? '스르르… 풀렸다' : st.s > hi ? '너무 빠르다! 천천히' : st.s < lo && st.t > 1 ? '조금 더 · 멈추면 다시 감긴다' : (st.opts.guide || '시계 반대 방향 원 · 또는 D → A 번갈아 · 천천히');
    ctx.fillText(msg, cx, cy - 205);
    st.pops.forEach((q) => { ctx.globalAlpha = 1 - q.t; ctx.font = `${40 + q.t * 20}px "Do Hyeon", sans-serif`; ctx.fillStyle = '#e07a3a'; ctx.strokeStyle = C.outline; ctx.lineWidth = 6; ctx.strokeText(q.text, cx + 150, cy - 120 - q.t * 40); ctx.fillText(q.text, cx + 150, cy - 120 - q.t * 40); ctx.globalAlpha = 1; });
    ctx.restore();
  };
})();
