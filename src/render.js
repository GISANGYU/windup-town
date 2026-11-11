// 그리기. state 를 읽기만 한다.
(function () {
  const C = WT.C, CFG = WT.CFG, W = WT.WORLD, PH = WT.PH, A = WT.Assets;
  const R = WT.Render = {};
  let ctx, groundCache = null, roomCache = null, vignette = null, noise = [];

  R.init = function (canvas) {
    ctx = canvas.getContext('2d');
    // 필름 그레인 4장
    for (let n = 0; n < 4; n++) {
      const c = document.createElement('canvas'); c.width = c.height = 256;
      const x = c.getContext('2d'), d = x.createImageData(256, 256);
      for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
      x.putImageData(d, 0, 0); noise.push(c);
    }
    vignette = document.createElement('canvas'); vignette.width = WT.W; vignette.height = WT.H;
    const v = vignette.getContext('2d');
    const g = v.createRadialGradient(WT.W / 2, WT.H / 2, WT.H * 0.35, WT.W / 2, WT.H / 2, WT.H * 0.95);
    g.addColorStop(0, 'rgba(30,20,25,0)'); g.addColorStop(1, 'rgba(30,20,25,.62)');
    v.fillStyle = g; v.fillRect(0, 0, WT.W, WT.H);
  };

  // 박자 (0~1, 박마다 튐)
  const beat = (t, off) => Math.abs(Math.sin((t * CFG.bpm / 60 + (off || 0)) * Math.PI));

  // ───────── 임시 배경 ─────────
  function blotches(c, colors, n, rmin, rmax, alpha) {
    for (let i = 0; i < n; i++) {
      c.fillStyle = colors[i % colors.length]; c.globalAlpha = alpha;
      c.beginPath(); c.ellipse(Math.random() * WT.W, Math.random() * WT.H, rmin + Math.random() * (rmax - rmin), (rmin + Math.random() * (rmax - rmin)) * 0.5, Math.random() * 3, 0, 7); c.fill();
    }
    c.globalAlpha = 1;
  }
  function phGround() {
    if (groundCache) return groundCache;
    const cv = document.createElement('canvas'); cv.width = WT.W; cv.height = WT.H;
    const c = cv.getContext('2d');
    c.fillStyle = '#a3a578'; c.fillRect(0, 0, WT.W, WT.H);
    blotches(c, ['#97a06e', '#b2ae80', '#8a9a6b', '#c2b48a'], 160, 30, 120, 0.25);
    blotches(c, [C.sand, C.beige], 26, 30, 80, 0.35);
    // 길 (집 → 광장 → 피프)
    c.strokeStyle = 'rgba(215,190,151,.75)'; c.lineCap = 'round'; c.lineWidth = 46;
    c.beginPath(); c.moveTo(230, 360); c.quadraticCurveTo(400, 420, 560, 380); c.lineTo(760, 380); c.quadraticCurveTo(900, 380, 1000, 470); c.stroke();
    c.beginPath(); c.moveTo(420, 400); c.lineTo(420, 480); c.stroke();
    return (groundCache = cv);
  }
  function phBackdrop(c) {
    c.fillStyle = '#6f7186'; c.fillRect(0, 0, WT.W, 150);
    c.fillStyle = '#585b72';
    for (let x = -40; x < WT.W + 80; x += 90) { c.beginPath(); c.ellipse(x, 140, 70, 60 + (x * 7) % 30, 0, Math.PI, 0); c.fill(); }
    c.fillStyle = '#4e546e';
    for (let x = 0; x < WT.W + 80; x += 140) { c.beginPath(); c.ellipse(x + 30, 150, 60, 34, 0, Math.PI, 0); c.fill(); }
    c.strokeStyle = C.outline; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 150); c.lineTo(WT.W, 150); c.stroke();
  }
  function phRoom() {
    if (roomCache) return roomCache;
    const cv = document.createElement('canvas'); cv.width = WT.W; cv.height = WT.H;
    const c = cv.getContext('2d');
    c.fillStyle = '#d9c3a0'; c.fillRect(0, 0, WT.W, 300);
    for (let x = 0; x < WT.W; x += 64) { c.fillStyle = x / 64 % 2 ? 'rgba(210,70,60,.08)' : 'rgba(62,109,181,.06)'; c.fillRect(x, 0, 32, 300); }
    c.fillStyle = '#b78a5a'; c.fillRect(0, 300, WT.W, 420);
    c.strokeStyle = 'rgba(61,51,70,.35)'; c.lineWidth = 3;
    for (let y = 330; y < WT.H; y += 46) { c.beginPath(); c.moveTo(0, y); c.lineTo(WT.W, y); c.stroke(); }
    c.strokeStyle = C.outline; c.lineWidth = 5; c.beginPath(); c.moveTo(0, 300); c.lineTo(WT.W, 300); c.stroke();
    // 창문 / 액자
    c.fillStyle = '#a9c4c8'; c.strokeStyle = C.outline; c.lineWidth = 5;
    c.beginPath(); c.arc(330, 150, 70, 0, 7); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(260, 150); c.lineTo(400, 150); c.moveTo(330, 80); c.lineTo(330, 220); c.stroke();
    c.fillStyle = C.cream; c.fillRect(820, 90, 150, 110); c.strokeRect(820, 90, 150, 110);
    blotches(c, ['#c9a477', '#a87c50'], 40, 20, 70, 0.12);
    return (roomCache = cv);
  }

  // ───────── 그림자 ─────────
  function shadow(x, y, w, a) {
    ctx.fillStyle = `rgba(40,28,36,${a || 0.28})`;
    ctx.beginPath(); ctx.ellipse(x, y, w / 2, w / 7, 0, 0, Math.PI * 2); ctx.fill();
  }

  // ───────── 개체별 그리기 ─────────
  function drawPlayer(t) {
    const s = WT.Game.state, p = s.player;
    const air = p.z > 0;
    const dir = p.dir, side = dir === 'side';
    let pose = 'idle';
    if (air) pose = 'jump'; else if (p.action) pose = p.action; else if (p.moving) pose = 'walk';
    const ids = [];
    if (pose === 'jump') ids.push(side ? 'player_jump_side' : 'player_jump', 'player_jump');
    if (pose === 'interact') ids.push('player_interact');
    if (pose === 'happy') ids.push('player_happy');
    if (pose === 'walk') {
      const frames = ['01', '02'].map((n) => `player_walk_${dir}_${n}`).filter((id) => A.has(id));
      if (frames.length) ids.push(frames[Math.floor(t * (p.run ? 10 : 7)) % frames.length]);
    }
    ids.push(`player_idle_${dir}`, 'player_idle_down');
    // 코드 애니메이션: 튐·눌림·기울기
    const sp = p.run ? 16 : 12;
    let bob = 0, sx = 1, sy = 1, rot = 0;
    if (pose === 'walk') { bob = Math.abs(Math.sin(t * sp)) * 7; rot = Math.sin(t * sp) * 0.07; sy = 1 + Math.abs(Math.sin(t * sp)) * 0.05; sx = 2 - sy; }
    else if (!air) { const b = s.world.musicOn ? beat(t) : (Math.sin(t * 3) + 1) / 2; sy = 1 + b * 0.04; sx = 1 - b * 0.03; bob = s.world.musicOn ? b * 5 : 0; }
    if (air) { sy = 1.08; sx = 0.93; }
    if (p.landT > 0) { const k = p.landT / 0.18; sy = 1 - 0.18 * k; sx = 1 + 0.18 * k; }
    if (pose === 'happy') { bob += Math.abs(Math.sin(t * 14)) * 10; }
    shadow(p.x, p.y, 54 * (1 - Math.min(0.5, p.z / 200)), 0.3 - Math.min(0.15, p.z / 600));
    WT.drawThing(ctx, ids, PH.bogle, p.x, p.y - p.z - bob, { h: 110, flip: side && p.facing < 0, sx, sy, rot, pose, dir, t });
  }

  function drawNpc(id, t) {
    const s = WT.Game.state, n = W.npcs[id], st = s.npcs[id];
    const awake = st.mood === 'awake';
    let ids, ph;
    if (id === 'gramo') { ph = PH.gramo; ids = awake ? (A.has('npc_gramo_awake_02') && beat(t / 2 + 0.25) > 0.5 && Math.floor(t * CFG.bpm / 60) % 2 ? ['npc_gramo_awake_02', 'npc_gramo_awake'] : ['npc_gramo_awake']) : ['npc_gramo_sleepy']; }
    else if (id === 'pip') { ph = PH.pip; ids = awake ? (A.has('npc_pip_awake_02') && Math.floor(t * CFG.bpm / 60) % 2 ? ['npc_pip_awake_02', 'npc_pip_awake'] : ['npc_pip_awake']) : ['npc_pip_sleepy']; }
    else { ph = PH.lamp; ids = [awake ? 'npc_lamp_on' : 'npc_lamp_off']; }
    let sx = 1, sy = 1, rot = 0, bob = 0;
    const c = s.ui.cutscene;
    const party = c && c.type === 'party' ? 1 + 1.5 * Math.min(1, c.t / 0.3) : 1; // 깨어난 직후 2초: 동작을 크게
    if (awake) { const b = beat(t, id === 'pip' ? 0.5 : 0); sy = 1 + b * 0.06 * party; sx = 1 - b * 0.04 * party; bob = b * 8 * party; rot = Math.sin(t * CFG.bpm / 60 * Math.PI) * 0.05 * party; }
    else { rot = 0.06 + Math.sin(t * 1.2 + n.x) * 0.03; sy = 0.97 + Math.sin(t * 1.6) * 0.015; }
    if (id === 'gramo' && c && c.type === 'wind') { rot = Math.sin(c.t * 40) * 0.05; sy = 1 + Math.sin(c.t * 20) * 0.04; }
    shadow(n.x, n.y, n.foot[0] * 1.15);
    WT.drawThing(ctx, ids, ph, n.x, n.y - bob, { h: n.h, sx, sy, rot, mood: st.mood, t, wind: st.wind });
  }

  function drawProp(p, t) {
    const s = WT.Game.state;
    let sx = 1, sy = 1, bob = 0;
    if (s.world.musicOn && (p.kind === 'tree' || p.kind === 'bush' || p.kind === 'house')) {
      const b = beat(t, (p.x + p.y) * 0.002);
      sy = 1 + b * (p.kind === 'house' ? 0.025 : 0.05); sx = 1 - b * 0.02;
    } else if (p.kind === 'tree') { sx = 1 + Math.sin(t * 0.8 + p.x) * 0.01; }
    if (p.kind !== 'fence') shadow(p.x, p.y, p.foot[0] * 1.2, 0.22);
    WT.drawThing(ctx, p.asset, PH[p.kind === 'house' ? 'house' : p.kind], p.x, p.y - bob, { h: p.h, sx, sy, type: p.type });
  }

  function drawKey(k, t) {
    const y = k.y - 6 - Math.abs(Math.sin(t * 3 + k.id)) * 8;
    shadow(k.x, k.y, 30, 0.2);
    WT.drawThing(ctx, 'prop_key', PH.key, k.x, y, { h: 44, rot: Math.sin(t * 2 + k.id) * 0.15 });
    if (Math.sin(t * 4 + k.id * 2) > 0.7) WT.drawThing(ctx, 'fx_sparkle', PH.sparkle, k.x + 16, y - 40, { h: 22, anchor: 'center' });
  }

  function drawParticles() {
    WT.Game.particles.forEach((q) => {
      const k = q.life / q.max, a = k < 0.15 ? k / 0.15 : 1 - Math.max(0, (k - 0.6) / 0.4);
      const map = { note: [['fx_note_01', 'fx_note_02'][(q.x | 0) % 2 ? 1 : 0], PH.note, 34, 'center'], sparkle: ['fx_sparkle', PH.sparkle, 30, 'center'],
        spring: ['fx_spring', PH.spring, 60, 'center'], steam: ['fx_steam', PH.steam, 40 + k * 30, 'center'],
        dust: ['fx_dust', PH.dust, 30, 'bottom'], zzz: ['fx_zzz', PH.zzz, 26 + k * 14, 'center'] }[q.type];
      if (!map) return;
      const ids = q.type === 'note' ? [map[0], 'fx_note_01', 'fx_note_02'] : [map[0]];
      WT.drawThing(ctx, ids, map[1], q.x, q.y, { h: map[2] * (q.type === 'dust' ? 1 + k : 1), anchor: map[3], alpha: a, rot: q.rot + (q.type === 'note' ? Math.sin(q.life * 6) * 0.3 : 0) });
    });
  }

  function drawPrompt(target, t) {
    if (!target) return;
    const label = { npc: '대화하기', key: '줍기', door: '들어가기', boss: '과감기!' }[target.type];
    const x = target.x, y = target.y - target.h - 26 - Math.abs(Math.sin(t * 4)) * 5;
    ctx.save();
    ctx.font = '22px "Do Hyeon", sans-serif';
    const tw = ctx.measureText(label).width;
    const w = tw + 62;
    ctx.fillStyle = C.cream; ctx.strokeStyle = C.outline; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(x - w / 2, y - 22, w, 40, 20); ctx.fill(); ctx.stroke();
    WT.drawThing(ctx, 'ui_key_e', PH.keycap, x - w / 2 + 22, y - 2, { h: 28, anchor: 'center' });
    ctx.fillStyle = C.outline; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillText(label, x - w / 2 + 42, y);
    ctx.restore();
  }

  function drawHud(t, onlyToast) {
    const s = WT.Game.state;
    ctx.save();
    ctx.font = '24px "Do Hyeon", sans-serif';
    if (!onlyToast) {
    const text = WT.Game.objective();
    const w = ctx.measureText(text).width + 40 + (s.quest.stage === 'started' ? 120 : 0);
    ctx.fillStyle = 'rgba(244,230,200,.94)'; ctx.strokeStyle = C.outline; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.roundRect(20, 18, w, 50, 14); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.outline; ctx.textBaseline = 'middle'; ctx.fillText(text, 40, 44);
    if (s.quest.stage === 'started') {
      for (let i = 0; i < 3; i++) {
        const x = 40 + ctx.measureText(text).width + 24 + i * 34, have = i < s.inventory.keys;
        ctx.globalAlpha = have ? 1 : 0.25;
        WT.drawThing(ctx, 'prop_key', PH.key, x, 60, { h: 34 });
        ctx.globalAlpha = 1;
      }
    }
    }
    if (s.ui.toast) {
      const k = s.ui.toast.t, a = Math.min(1, k * 3);
      ctx.globalAlpha = a; ctx.font = '26px "Do Hyeon", sans-serif';
      const tw = ctx.measureText(s.ui.toast.text).width + 50;
      const y = 104 - (1 - Math.min(1, (2.2 - k) * 5)) * 20;
      ctx.fillStyle = C.outline; ctx.beginPath(); ctx.roundRect(WT.W / 2 - tw / 2, y - 26, tw, 52, 26); ctx.fill();
      ctx.fillStyle = C.cream; ctx.textAlign = 'center'; ctx.fillText(s.ui.toast.text, WT.W / 2, y + 1);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  function drawFilm(t) {
    const s = WT.Game.state;
    ctx.save();
    ctx.globalAlpha = s.world.musicOn ? 0.06 : 0.1;
    ctx.globalCompositeOperation = 'overlay';
    const n = noise[Math.floor(t * 24) % 4];
    const ox = Math.random() * 256, oy = Math.random() * 256;
    ctx.translate(-ox, -oy);
    ctx.fillStyle = ctx.createPattern(n, 'repeat'); ctx.fillRect(0, 0, WT.W + 256, WT.H + 256);
    ctx.restore();
    // 세로 스크래치
    if (Math.random() < 0.08) {
      ctx.strokeStyle = 'rgba(251,246,234,.35)'; ctx.lineWidth = 1 + Math.random();
      const x = Math.random() * WT.W; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + (Math.random() - 0.5) * 20, WT.H); ctx.stroke();
    }
    ctx.drawImage(vignette, 0, 0);
    ctx.fillStyle = `rgba(255,236,210,${Math.random() * 0.035})`; ctx.fillRect(0, 0, WT.W, WT.H);
  }

  function drawIris() {
    const tr = WT.Game.state.ui.transition;
    if (!tr) return;
    const half = tr.dur / 2, k = tr.t < half ? 1 - tr.t / half : (tr.t - half) / half;
    const ease = k * k * (3 - 2 * k);
    const maxR = Math.hypot(WT.W, WT.H);
    const r = Math.max(0, ease * maxR);
    ctx.save();
    ctx.fillStyle = '#1a1418';
    ctx.beginPath(); ctx.rect(0, 0, WT.W, WT.H); ctx.arc(tr.cx, tr.cy, r, 0, Math.PI * 2, true); ctx.fill('evenodd');
    ctx.strokeStyle = C.outline; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(tr.cx, tr.cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  function drawTip(t) {
    const tip = WT.Game.tip();
    if (!tip) return;
    ctx.save();
    ctx.font = '26px "Do Hyeon", sans-serif';
    const w = ctx.measureText(tip).width + 120, x = WT.W / 2 - w / 2, y = WT.H - 92 - Math.abs(Math.sin(t * 2.5)) * 4;
    ctx.fillStyle = 'rgba(43,34,48,.9)'; ctx.strokeStyle = C.cream; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(x, y, w, 52, 26); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.roundRect(x + 10, y + 10, 78, 32, 16); ctx.fill();
    ctx.fillStyle = C.outline; ctx.font = '18px "Do Hyeon", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('튜토리얼', x + 49, y + 27);
    ctx.fillStyle = C.cream; ctx.font = '26px "Do Hyeon", sans-serif'; ctx.textAlign = 'left'; ctx.fillText(tip, x + 102, y + 27);
    ctx.restore();
  }

  function drawDebug(target) {
    const s = WT.Game.state;
    if (!s.ui.debug) return;
    ctx.save(); ctx.lineWidth = 2;
    if (s.scene === 'town') {
      WT.Game.solids.forEach((q) => { ctx.strokeStyle = q.low ? '#2fa' : '#f33'; ctx.strokeRect(q.x, q.y, q.w, q.h); });
      const p = s.player, r = WT.footRect(p.x, p.y, 36, 14);
      ctx.strokeStyle = '#ff0'; ctx.strokeRect(r.x, r.y, r.w, r.h);
      ctx.strokeStyle = 'rgba(255,255,0,.35)'; ctx.beginPath(); ctx.arc(p.x, p.y, CFG.talkRange, 0, 7); ctx.stroke();
      const b = W.bounds; ctx.strokeStyle = '#0ff'; ctx.strokeRect(b.x1, b.y1, b.x2 - b.x1, b.y2 - b.y1);
      ctx.fillStyle = '#fff'; ctx.font = '14px monospace'; ctx.fillText(`player ${p.x | 0},${p.y | 0} z${p.z | 0} ${p.dir} target:${target ? target.type + ':' + (target.id || '') : '-'}`, 20, WT.H - 16);
    } else {
      const R = WT.ROOM; ctx.strokeStyle = '#0ff'; ctx.strokeRect(R.x1, R.y1, R.x2 - R.x1, R.y2 - R.y1);
      s.house.furniture.forEach((f) => { const b = WT.Game.furnBox(f); ctx.strokeStyle = '#f0f'; ctx.strokeRect(b.x, b.y, b.w, b.h); });
    }
    ctx.restore();
  }

  R.shadow = (x, y, w, a) => shadow(x, y, w, a);
  R.drawPlayer = (t) => drawPlayer(t);
  R.drawParticles = () => drawParticles();
  R.drawPrompt = (tg, t) => drawPrompt(tg, t);

  // ───────── 장면 ─────────
  function town(t) {
    const s = WT.Game.state;
    if (!A.has('bg_town_ground')) ctx.drawImage(phGround(), 0, 0);
    else WT.drawThing(ctx, 'bg_town_ground', null, WT.W / 2, WT.H, { h: WT.H, sx: WT.W / (WT.H * A.aspect('bg_town_ground')) });
    if (A.has('bg_town_backdrop')) WT.drawThing(ctx, 'bg_town_backdrop', null, WT.W / 2, 200, { h: 200, sx: WT.W / (200 * A.aspect('bg_town_backdrop')) });
    else phBackdrop(ctx);
    W.ground.forEach((g) => {
      const b = s.world.musicOn && g.kind === 'stage' ? beat(t) * 0.02 : 0;
      WT.drawThing(ctx, g.asset, PH[g.kind], g.x, g.y, { h: g.h, anchor: 'center', sy: 1 + b, sx: 1 + b });
    });
    const list = [];
    W.props.forEach((p) => list.push({ y: p.y, f: () => drawProp(p, t) }));
    Object.keys(W.npcs).forEach((id) => list.push({ y: W.npcs[id].y, f: () => drawNpc(id, t) }));
    if (s.quest.stage === 'started') s.world.keys.forEach((k) => !k.taken && list.push({ y: k.y, f: () => drawKey(k, t) }));
    list.push({ y: s.player.y, f: () => drawPlayer(t) });
    list.sort((a, b) => a.y - b.y).forEach((d) => d.f());
    drawParticles();
    const target = WT.Game.locked() ? null : WT.Game.nearestTarget();
    drawPrompt(target, t);
    drawDebug(target);
    drawHud(t);
    drawTip(t);
  }

  function house(t) {
    const s = WT.Game.state, h = s.house, Rm = WT.ROOM;
    if (A.has('bg_house_room')) WT.drawThing(ctx, 'bg_house_room', null, WT.W / 2, WT.H, { h: WT.H, sx: WT.W / (WT.H * A.aspect('bg_house_room')) });
    else ctx.drawImage(phRoom(), 0, 0);
    // 격자
    if (h.placing || h.drag) {
      ctx.save(); ctx.strokeStyle = 'rgba(61,51,70,.18)'; ctx.lineWidth = 1;
      if (h.snap) for (let x = Rm.x1; x <= Rm.x2; x += Rm.grid * 2) { ctx.beginPath(); ctx.moveTo(x, Rm.y1); ctx.lineTo(x, Rm.y2); ctx.stroke(); }
      ctx.setLineDash([10, 8]); ctx.strokeStyle = 'rgba(61,51,70,.5)'; ctx.lineWidth = 3;
      ctx.strokeRect(Rm.x1, Rm.y1, Rm.x2 - Rm.x1, Rm.y2 - Rm.y1); ctx.restore();
    }
    const items = h.furniture.slice().sort((a, b) => a.y - b.y);
    items.forEach((f) => {
      const def = WT.FURN[f.type], sel = h.selected === f.id;
      const age = WT.Game.time - f.born;
      let sy = 1, sx = 1;
      if (age < 0.35) { const k = age / 0.35; sy = 1 + Math.sin(k * Math.PI * 2) * 0.2 * (1 - k); sx = 2 - sy; }
      if (s.world.musicOn) { const b = beat(t, f.x * 0.003); sy *= 1 + b * 0.05; sx *= 1 - b * 0.03; }
      if (sel) { sy *= 1 + Math.sin(t * 8) * 0.02; }
      shadow(f.x, f.y, def.foot * 1.25, 0.3);
      if (sel) { ctx.save(); ctx.setLineDash([8, 6]); ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(f.x, f.y, def.foot * 0.85, def.foot * 0.28, 0, 0, 7); ctx.stroke(); ctx.restore(); }
      WT.drawThing(ctx, def.asset, PH[f.type === 'gramophone' ? 'gramophone' : f.type], f.x, f.y, { h: def.h, flip: f.flip, sx, sy });
    });
    // 배치 미리보기
    if (h.placing && h.mouse) {
      const def = WT.FURN[h.placing];
      const x = Math.max(Rm.x1, Math.min(Rm.x2, h.snap ? Math.round(h.mouse.x / Rm.grid) * Rm.grid : h.mouse.x));
      const y = Math.max(Rm.y1, Math.min(Rm.y2, h.snap ? Math.round(h.mouse.y / Rm.grid) * Rm.grid : h.mouse.y));
      ctx.save(); ctx.globalAlpha = 0.5;
      WT.drawThing(ctx, def.asset, PH[h.placing], x, y, { h: def.h });
      ctx.restore();
    }
    drawParticles();
    drawDebug(null);
    if (s.ui.toast) drawHud(t, true);
  }

  R.shakeT = 0;
  R.frame = function (t) {
    const s = WT.Game.state;
    ctx.clearRect(0, 0, WT.W, WT.H);
    ctx.save();
    if (R.shakeT > 0) { R.shakeT -= 1 / 60; const k = R.shakeT * 30; ctx.translate((Math.random() - 0.5) * k, (Math.random() - 0.5) * k); }
    if (s.scene === 'intro') WT.Intro.draw(ctx, t); else if (s.scene === 'town') town(t); else if (s.scene === 'arena') { WT.Boss.draw(ctx, t, R); drawTip(t); } else house(t);
    ctx.restore();
    WT.Story.draw(ctx, t);
    drawFilm(t);
    drawIris();
  };
})();
