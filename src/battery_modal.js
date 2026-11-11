// 건전지 끼우기·빼기 모달 (3막 첫 건전지). 게임 화면 위에 캔버스로 그린다.
// insert: E(또는 Space)를 누르고 있으면 건전지가 칸으로 밀려 들어감 → 딸깍
// remove: A·D를 번갈아 눌러 흔들면 건전지가 조금씩 빠져나옴 → 뽁
(function () {
  const C = WT.C, PH = WT.PH;
  const BM = WT.BatteryModal = { active: false };
  let st = null;
  const INSERT_T = 0.9, SHAKES = 10;

  BM.open = function (mode, onDone) {
    st = { mode, p: 0, t: 0, done: 0, onDone, last: null, wob: 0, holding: false };
    BM.active = true;
    WT.Audio.play('sfx_dialog_open');
  };
  BM.close = function () { BM.active = false; st = null; };
  BM.key = function (code, down) {
    if (!st || st.done) return;
    const K = WT.KEY;
    if (st.mode === 'insert') {
      if (K.act.includes(code) || K.jump.includes(code)) st.holding = down;
      return;
    }
    if (!down) return;
    const side = K.left.includes(code) ? 'L' : K.right.includes(code) ? 'R' : null;
    if (!side) return;
    if (st.last && st.last !== side) {
      st.p = Math.min(1, st.p + 1 / SHAKES); st.wob = 0.25 * (side === 'L' ? -1 : 1);
      WT.Audio.play(WT.Audio.defs.sfx_battery_shake ? 'sfx_battery_shake' : 'sfx_wind_ratchet', { rate: 0.9 + st.p * 0.3 });
      if (st.p >= 1) finish();
    }
    st.last = side;
  };
  BM.finishNow = function () { if (st && !st.done) { st.p = 1; finish(); st.done = 2; } };
  function finish() {
    st.done = 0.01;
    if (st.mode === 'insert') WT.Audio.play(WT.Audio.defs.sfx_battery_insert ? 'sfx_battery_insert' : 'sfx_battery_in');
    else WT.Audio.play(WT.Audio.defs.sfx_battery_pop ? 'sfx_battery_pop' : 'sfx_battery_out');
    WT.UI.shake(0.12);
  }
  BM.update = function (dt) {
    if (!st) return;
    st.t += dt;
    st.wob *= Math.pow(0.02, dt);
    if (!st.done && st.mode === 'insert') {
      if (st.holding) { st.p = Math.min(1, st.p + dt / INSERT_T); if (st.p >= 1) finish(); }
      else st.p = Math.max(0, st.p - dt * 0.6);
    }
    if (st.done) { st.done += dt; if (st.done > 1.1) { const cb = st.onDone; BM.close(); cb && cb(); } }
  };

  BM.draw = function (ctx) {
    if (!st) return;
    const W = WT.W, H = WT.H, cx = W / 2, cy = H / 2 - 10, t = st.t, p = st.p;
    ctx.save();
    ctx.fillStyle = 'rgba(20,14,18,.72)'; ctx.fillRect(0, 0, W, H);
    // 판
    ctx.fillStyle = '#2b2230'; ctx.strokeStyle = C.cream; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.roundRect(cx - 380, cy - 270, 760, 540, 14); ctx.fill(); ctx.stroke();
    ctx.font = '40px "Do Hyeon", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.yellow;
    ctx.fillText(st.mode === 'insert' ? '건전지 끼우기' : '건전지 빼기', cx, cy - 225);
    // 보글 등
    const by = cy + 10;
    ctx.save();
    if (st.mode === 'remove' && st.wob) { ctx.translate(cx, by); ctx.rotate(st.wob * 0.2); ctx.translate(-cx, -by); }
    if (!WT.drawThing(ctx, 'wind_bogle_back', null, cx, by + 190, { h: 380 })) {
      ctx.fillStyle = C.white; ctx.strokeStyle = C.outline; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.ellipse(cx, by, 230, 170, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.blue; ctx.fillRect(cx - 228, by + 50, 456, 34); ctx.strokeRect(cx - 228, by + 50, 456, 34);
      ctx.fillStyle = C.white; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(cx - 180 + i * 45, by + 67, 6, 0, 7); ctx.fill(); }
      ctx.fillStyle = C.white; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(cx, by - 175, 70, 40, 0, Math.PI, 0); ctx.stroke(); // 손잡이
      // 칸(덮개 열림)
      ctx.fillStyle = '#3a3f48'; ctx.beginPath(); ctx.roundRect(cx - 70, by - 45, 140, 70, 12); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#c99a3a'; ctx.fillRect(cx - 62, by - 18, 8, 16); ctx.fillRect(cx + 54, by - 18, 8, 16);
      ctx.fillStyle = C.cream; ctx.beginPath(); ctx.ellipse(cx - 120, by - 10, 18, 40, -0.5, 0, 7); ctx.fill(); ctx.stroke(); // 열린 덮개
    }
    ctx.restore();
    // 건전지: insert는 오른쪽에서 칸으로, remove는 칸에서 위로
    const bx = st.mode === 'insert' ? cx + 260 * (1 - p) : cx + (st.wob || 0) * 40;
    const byy = st.mode === 'insert' ? by + 20 : by + 20 - p * 160;
    ctx.save(); ctx.translate(bx, byy); ctx.rotate(Math.PI / 2 + (st.mode === 'remove' ? st.wob : 0));
    if (st.mode === 'insert' && !st.done) ctx.globalAlpha = 0.95;
    WT.drawThing(ctx, 'prop_battery', PH.battery, 0, 22, { h: 110 });
    ctx.restore();
    if (st.done && st.mode === 'insert') { ctx.fillStyle = `rgba(255,255,255,${Math.max(0, 0.6 - st.done)})`; ctx.fillRect(cx - 380, cy - 270, 760, 540); }
    // 진행 · 안내
    ctx.fillStyle = '#3a2d36'; ctx.strokeStyle = C.cream; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(cx - 300, cy + 200, 600, 22, 11); ctx.fill(); ctx.stroke();
    ctx.fillStyle = st.mode === 'insert' ? '#e8edf2' : C.yellow; ctx.beginPath(); ctx.roundRect(cx - 300, cy + 200, 600 * p, 22, 11); ctx.fill();
    ctx.font = '20px "Gowun Dodum", sans-serif'; ctx.fillStyle = C.cream;
    const guide = st.done ? (st.mode === 'insert' ? '딸깍!' : '뽁!') : st.mode === 'insert' ? 'E를 누르고 있으면 건전지가 들어간다' : 'A · D를 번갈아 눌러 흔들어 빼자';
    ctx.fillText(guide, cx, cy + 246);
    if (!st.done && st.mode === 'remove' && p < 0.1) { ctx.font = '26px "Do Hyeon", sans-serif'; ctx.fillStyle = C.yellow; ctx.fillText(Math.floor(t * 4) % 2 ? '◀ A' : 'D ▶', cx, cy - 180); }
    ctx.restore();
  };
})();
