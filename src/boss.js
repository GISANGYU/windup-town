// 제2막 보스전 — 째깍 백작
// 점프 = 회피, 태엽 감기 = 공격. 패턴을 버티면 백작이 과열돼 주저앉고, 등의 열쇠를 과감기하면 스프링이 하나씩 튕겨 나간다.
(function () {
  const C = WT.C, CFG = WT.CFG, PH = WT.PH;
  const B = WT.Boss = {};
  const A = {
    bounds: { x1: 90, x2: 1190, y1: 300, y2: 690 },
    boss: { x: 640, y: 345, h: 240, foot: [170, 44] },
    gramo: { x: 170, y: 560, h: 150, foot: [84, 26] },
    safe: { x: 170, y: 575, rx: 135, ry: 80 },
    start: { x: 640, y: 620 }
  };
  B.A = A;
  const ROUNDS = {
    1: { seq: ['shock', 'gears', 'shock'], k: 1, rings: 1, gears: 3, big: 0 },
    2: { seq: ['gears', 'bell', 'shock', 'gears'], k: 1.15, rings: 2, gears: 4, big: 0.35 },
    3: { seq: ['shock', 'bell', 'gears', 'shock', 'gears'], k: 1.3, rings: 3, gears: 5, big: 0.5 }
  };
  const TIRED = 4.2, RING_W = 26;
  const rnd = (a, b) => a + Math.random() * (b - a);

  // ───────── 시작 / 상태 ─────────
  B.solids = () => [
    Object.assign(WT.footRect(A.boss.x, A.boss.y, A.boss.foot[0], A.boss.foot[1]), { low: false, src: 'boss' }),
    Object.assign(WT.footRect(A.gramo.x, A.gramo.y, A.gramo.foot[0], A.gramo.foot[1]), { low: false, src: 'gramo' })
  ];
  B.enter = function () {
    const s = WT.Game.state;
    s.scene = 'arena';
    s.player.x = A.start.x; s.player.y = A.start.y; s.player.z = 0; s.player.vz = 0; s.player.dir = 'up';
    s.boss = { round: 1, springs: 3, state: 'intro', t: 0, si: 0, atk: null, pose: 'idle', card: null, hitFlash: 0 };
    s.arena = { hp: 3, inv: 0, drowsy: 0, rings: [], gears: [], fog: 0, sleepT: 0, tipSeen: {} };
    WT.Game.setScene('arena');
    WT.UI.setScene('arena');
  };
  B.startFight = function () { startRound(1); };

  function startRound(n) {
    const b = WT.Game.state.boss;
    b.round = n; b.si = 0; b.atk = null; b.state = 'card'; b.t = 0;
    WT.Audio.play('sfx_round_card');
    b.card = { title: `제${n}라운드`, sub: ['째깍 충격파를 조심하라', '종소리가 울리면 음표 곁으로', '마지막 스프링'][n - 1] };
  }
  function nextAttack() {
    const b = WT.Game.state.boss, R = ROUNDS[b.round];
    if (b.si >= R.seq.length) { b.state = 'tired'; b.t = 0; b.pose = 'tired'; b.atk = null; WT.Audio.play('sfx_boss_tired'); return; }
    const type = R.seq[b.si++];
    b.state = 'attack'; b.t = 0;
    b.atk = { type, t: 0, phase: 'tele', n: 0, next: 0 };
    b.pose = { shock: 'slam', gears: 'throw', bell: 'bell' }[type];
    WT.Audio.play('sfx_boss_tele');
  }

  // ───────── 피격 ─────────
  function hurtPlayer(fromX, fromY, why) {
    const s = WT.Game.state, ar = s.arena, p = s.player;
    if (ar.inv > 0 || ar.sleepT > 0) return;
    ar.hp--; ar.inv = 1.3;
    WT.Audio.play(ar.hp <= 0 ? 'sfx_player_faint' : 'sfx_player_hit');
    const dx = p.x - fromX, dy = p.y - fromY, d = Math.hypot(dx, dy) || 1;
    tryMove(p, dx / d * 50, dy / d * 30);
    WT.Game.burst('sparkle', p.x, p.y - 60, 6);
    WT.UI.shake && WT.UI.shake(0.3);
    if (ar.hp <= 0) {
      ar.sleepT = 2.2;
      WT.Game.toast('보글의 태엽이 다 풀렸다… 다시 감고 재도전!');
    } else WT.Game.toast(why);
  }
  function tryMove(p, dx, dy) {
    const b = A.bounds;
    p.x = Math.max(b.x1, Math.min(b.x2, p.x + dx));
    p.y = Math.max(b.y1, Math.min(b.y2, p.y + dy));
  }
  function inSafe(p) { const z = A.safe; return ((p.x - z.x) / z.rx) ** 2 + ((p.y - z.y) / z.ry) ** 2 <= 1; }

  // ───────── 과감기 ─────────
  B.target = function () {
    const s = WT.Game.state, b = s.boss, p = s.player;
    if (!b || b.state !== 'tired' || p.z > 4) return null;
    const kx = A.boss.x + 70, ky = A.boss.y + 10;
    return Math.hypot(p.x - kx, p.y - ky) < 140 ? { type: 'boss', x: kx, y: A.boss.y, h: 150 } : null;
  };
  B.overwind = function () {
    const s = WT.Game.state, b = s.boss;
    if (!b || b.state !== 'tired') return;
    b.state = 'winding';
    const r = b.round;
    WT.Wind.open(() => {
      b.springs--; b.state = 'hurt'; b.t = 0; b.pose = 'hurt'; b.hitFlash = 0.5;
      WT.Audio.play('sfx_spring_pop');
      WT.Game.burst('spring', A.boss.x + 60, A.boss.y - 120, 1);
      WT.Game.burst('sparkle', A.boss.x, A.boss.y - 120, 12);
      WT.UI.flash();
      WT.Game.toast(b.springs > 0 ? `스프링이 튕겨 나갔다! 남은 스프링 ${b.springs}` : '마지막 스프링!');
    }, {
      title: '과감기!', guide: '백작이 버티기 전에 끝까지 감아라! (원 그리기 / A·D 번갈아)',
      timeLimit: 8 - r * 0.6, resist: 0.04 + r * 0.035, back: 'wind_boss_back', variant: 'boss',
      onFail: () => { b.state = 'recover'; b.t = 0; b.pose = 'idle'; WT.Audio.play('sfx_overwind_fail'); WT.Audio.play('sfx_boss_recover', { delay: 0.5 }); WT.Game.toast('백작이 버텨 냈다! 다시 지치게 만들자'); }
    });
  };

  // ───────── 업데이트 ─────────
  B.update = function (dt) {
    const s = WT.Game.state, b = s.boss, ar = s.arena, p = s.player;
    if (!b) return;
    b.t += dt;
    if (b.hitFlash > 0) b.hitFlash -= dt;
    if (ar.inv > 0) ar.inv -= dt;
    // 그라모 음표
    if (Math.random() < dt * 2) WT.Game.particles.push({ type: 'note', x: A.gramo.x + rnd(-20, 20), y: A.gramo.y - 150, vx: rnd(-20, 40), vy: -50, life: 0, max: 2, rot: rnd(-0.3, 0.3), size: 1 });

    // 잠듦 → 라운드 재시작
    if (ar.sleepT > 0) {
      ar.sleepT -= dt;
      if (ar.sleepT <= 0) {
        WT.Game.irisThen(p.x, p.y - 50, () => {
          ar.hp = 3; ar.inv = 1.5; ar.drowsy = 0; ar.rings = []; ar.gears = []; ar.fog = 0;
          p.x = A.start.x; p.y = A.start.y; p.z = 0; p.vz = 0;
          startRound(b.round);
        });
      }
      return;
    }

    if (b.state === 'intro') return;
    if (b.state === 'card') { if (b.t > 1.6) { b.card = null; b.state = 'gap'; b.t = 0; } return; }
    if (b.state === 'gap') { b.pose = 'idle'; if (b.t > 0.7) nextAttack(); }
    if (b.state === 'tired') {
      if (Math.random() < dt * 6) WT.Game.burst('steam', A.boss.x + rnd(-40, 40), A.boss.y - 200, 1);
      if (b.t > TIRED) { b.state = 'recover'; b.t = 0; b.pose = 'idle'; WT.Audio.play('sfx_boss_recover'); WT.Game.toast('백작이 다시 일어났다!'); }
    }
    if (b.state === 'recover' && b.t > 1) { b.si = 0; b.state = 'gap'; b.t = 0; }
    if (b.state === 'hurt' && b.t > 1.8) {
      if (b.springs <= 0) { b.state = 'defeated'; b.t = 0; b.pose = 'cuckoo'; WT.Game.burst('sparkle', A.boss.x, A.boss.y - 60, 20); WT.Audio.play('sfx_boss_cuckoo'); WT.Audio.jingle('jingle_boss_clear'); }
      else startRound(b.round + 1);
    }
    if (b.state === 'defeated' && b.t > 2.2 && !b.ended) { b.ended = true; WT.Game.endAct2(); }

    if (b.state === 'attack') runAttack(dt);

    // 충격파 링
    ar.rings.forEach((r) => {
      r.r += r.speed * dt;
      const dx = p.x - A.boss.x, dy = (p.y - A.boss.y) / 0.55;
      const d = Math.hypot(dx, dy);
      if (!r.hit && p.z < CFG.lowClear && Math.abs(d - r.r) < RING_W / 2 + 8) { r.hit = true; hurtPlayer(A.boss.x, A.boss.y, '충격파에 맞았다! 링이 올 때 Space'); }
    });
    ar.rings = ar.rings.filter((r) => r.r < 1400);
    // 톱니
    ar.gears.forEach((g) => {
      if (g.warn > 0) { g.warn -= dt; return; }
      g.x += g.vx * dt; g.rot += g.vx * dt / g.r;
      const hitY = Math.abs(p.y - g.y) < 18, hitX = Math.abs(p.x - g.x) < g.r + 14;
      if (hitX && hitY && (g.big || p.z < CFG.lowClear)) hurtPlayer(g.x, g.y, g.big ? '큰 톱니는 옆으로 피하자!' : '작은 톱니는 점프로 넘을 수 있다');
    });
    ar.gears = ar.gears.filter((g) => g.warn > 0 || (g.x > -80 && g.x < WT.W + 80));
    // 졸음 안개
    if (ar.fog > 0) {
      ar.fog -= dt;
      if (inSafe(p)) ar.drowsy = Math.max(0, ar.drowsy - 0.7 * dt);
      else { ar.drowsy += 0.34 * dt; if (ar.drowsy >= 1) { ar.drowsy = 0.35; hurtPlayer(p.x, p.y - 1, '졸음이 쏟아진다… 음표 곁으로!'); } }
    } else ar.drowsy = Math.max(0, ar.drowsy - 0.5 * dt);
  };

  function runAttack(dt) {
    const s = WT.Game.state, b = s.boss, ar = s.arena, p = s.player, R = ROUNDS[b.round], a = b.atk;
    a.t += dt;
    if (a.type === 'shock') {
      const tele = 0.95 / R.k;
      if (a.phase === 'tele' && a.t > tele) { a.phase = 'go'; a.t = 0; a.next = 0; }
      if (a.phase === 'go') {
        if (a.n < R.rings && a.t >= a.next) {
          ar.rings.push({ r: 70, speed: 290 * R.k, hit: false });
          WT.Audio.play('sfx_boss_slam');
          a.n++; a.next = a.t + 0.6 / R.k;
          WT.Game.burst('dust', A.boss.x - 70, A.boss.y, 1); WT.Game.burst('dust', A.boss.x + 70, A.boss.y, 1);
          WT.UI.shake && WT.UI.shake(0.18);
        }
        if (a.n >= R.rings && a.t > a.next + 1.4) end();
      }
    } else if (a.type === 'gears') {
      if (a.phase === 'tele' && a.t > 0.5) { a.phase = 'go'; a.t = 0; a.next = 0; }
      if (a.phase === 'go') {
        if (a.n < R.gears && a.t >= a.next) {
          const fromLeft = Math.random() < 0.5;
          const y = a.n % 2 === 0 ? Math.max(A.bounds.y1 + 40, Math.min(A.bounds.y2, p.y)) : rnd(A.bounds.y1 + 60, A.bounds.y2);
          const big = Math.random() < R.big;
          ar.gears.push({ x: fromLeft ? -40 : WT.W + 40, y, vx: (fromLeft ? 1 : -1) * rnd(320, 400) * R.k, r: big ? 40 : 22, big, rot: 0, warn: 0.65 });
          WT.Audio.play('sfx_gear_warn');
          a.n++; a.next = a.t + 0.75 / R.k;
        }
        if (a.n >= R.gears && ar.gears.length === 0) end();
      }
    } else if (a.type === 'bell') {
      if (a.phase === 'tele' && a.t > 1.0) { a.phase = 'go'; a.t = 0; ar.fog = 4.6; WT.UI.flash(); WT.Audio.play('sfx_boss_bell'); }
      if (a.phase === 'go' && ar.fog <= 0) end();
    }
    function end() { b.state = 'gap'; b.t = 0; b.atk = null; }
  }

  // 튜토리얼 안내 (보스전)
  B.tip = function () {
    const s = WT.Game.state, b = s.boss;
    if (!b || s.scene !== 'arena') return null;
    if (b.state === 'tired') return '지금이야! 백작 등의 열쇠로 가서 E : 과감기';
    if (b.state !== 'attack' || !b.atk) return null;
    return { shock: '바닥 링이 발밑을 지날 때 Space로 점프!', gears: '톱니를 피하자 · 작은 톱니는 점프로 넘을 수 있다', bell: '종소리! 그라모 곁 음표 구역으로 피하자' }[b.atk.type];
  };

  // ───────── 그리기 ─────────
  let bgCache = null;
  function phArena() {
    if (bgCache) return bgCache;
    const cv = document.createElement('canvas'); cv.width = WT.W; cv.height = WT.H;
    const c = cv.getContext('2d');
    const g = c.createLinearGradient(0, 0, 0, 300); g.addColorStop(0, '#1d1d33'); g.addColorStop(1, '#3a3a58');
    c.fillStyle = g; c.fillRect(0, 0, WT.W, WT.H);
    c.fillStyle = '#f4e6c8'; for (let i = 0; i < 60; i++) { c.globalAlpha = Math.random() * 0.7; c.fillRect(Math.random() * WT.W, Math.random() * 220, 2, 2); } c.globalAlpha = 1;
    c.fillStyle = '#16131f'; c.fillRect(560, 40, 160, 240); c.beginPath(); c.moveTo(540, 50); c.lineTo(640, -40); c.lineTo(740, 50); c.fill();
    c.fillStyle = '#f4e6c8'; c.beginPath(); c.arc(640, 120, 46, 0, 7); c.fill();
    c.strokeStyle = '#16131f'; c.lineWidth = 6; c.beginPath(); c.moveTo(640, 120); c.lineTo(640, 88); c.moveTo(640, 120); c.lineTo(664, 128); c.stroke();
    c.fillStyle = '#2a2638'; c.fillRect(0, 230, WT.W, 60);
    // 무대 바닥
    c.fillStyle = '#b07d4f'; c.strokeStyle = C.outline; c.lineWidth = 6;
    c.beginPath(); c.ellipse(640, 480, 620, 250, 0, 0, 7); c.fill(); c.stroke();
    c.save(); c.clip(); c.strokeStyle = 'rgba(61,51,70,.3)'; c.lineWidth = 3;
    for (let y = 250; y < 740; y += 42) { c.beginPath(); c.moveTo(0, y); c.lineTo(WT.W, y); c.stroke(); }
    c.restore();
    for (let a = 0; a < 40; a++) { const r = a / 40 * Math.PI * 2; c.fillStyle = C.yellow; c.strokeStyle = C.outline; c.lineWidth = 2; c.beginPath(); c.arc(640 + Math.cos(r) * 606, 480 + Math.sin(r) * 240, 6, 0, 7); c.fill(); c.stroke(); }
    return (bgCache = cv);
  }

  B.draw = function (ctx, t, R) {
    const s = WT.Game.state, b = s.boss, ar = s.arena, p = s.player;
    if (WT.Assets.has('bg_arena')) WT.drawThing(ctx, 'bg_arena', null, WT.W / 2, WT.H, { h: WT.H, sx: WT.W / (WT.H * WT.Assets.aspect('bg_arena')) });
    else ctx.drawImage(phArena(), 0, 0);
    // 안전지대
    const z = A.safe, fogOn = ar.fog > 0;
    ctx.save(); ctx.setLineDash([12, 10]); ctx.lineDashOffset = -t * 30;
    ctx.strokeStyle = fogOn ? C.yellow : 'rgba(244,230,200,.35)'; ctx.lineWidth = fogOn ? 5 : 3;
    ctx.beginPath(); ctx.ellipse(z.x, z.y, z.rx, z.ry, 0, 0, 7); ctx.stroke(); ctx.restore();
    // 충격파 예고
    if (b.atk && b.atk.type === 'shock' && b.atk.phase === 'tele') {
      const k = b.atk.t * 6;
      ctx.save(); ctx.strokeStyle = `rgba(210,70,60,${0.4 + Math.sin(k) * 0.3})`; ctx.lineWidth = 6; ctx.setLineDash([16, 12]);
      ctx.beginPath(); ctx.ellipse(A.boss.x, A.boss.y, 130, 130 * 0.55, 0, 0, 7); ctx.stroke(); ctx.restore();
    }
    // 링
    ar.rings.forEach((r) => {
      ctx.save();
      ctx.strokeStyle = C.outline; ctx.lineWidth = RING_W + 8; ctx.globalAlpha = Math.max(0, 1 - r.r / 1300);
      ctx.beginPath(); ctx.ellipse(A.boss.x, A.boss.y, r.r, r.r * 0.55, 0, 0, 7); ctx.stroke();
      ctx.strokeStyle = C.cream; ctx.lineWidth = RING_W; ctx.stroke();
      ctx.strokeStyle = C.yellow; ctx.lineWidth = 6; ctx.stroke();
      ctx.restore();
    });
    // 깊이 정렬
    const list = [];
    list.push({ y: A.gramo.y, f: () => { R.shadow(A.gramo.x, A.gramo.y, 100); const bb = Math.abs(Math.sin(t * CFG.bpm / 60 * Math.PI)); WT.drawThing(ctx, 'npc_gramo_awake', PH.gramo, A.gramo.x, A.gramo.y - bb * 6, { h: A.gramo.h, mood: 'awake', t, sy: 1 + bb * 0.05 }); } });
    list.push({ y: A.boss.y, f: () => drawBoss(ctx, t, R) });
    ar.gears.forEach((g) => list.push({ y: g.y, f: () => drawGear(ctx, g, t, R) }));
    list.push({ y: p.y, f: () => { if (ar.inv > 0 && Math.floor(t * 16) % 2) return; R.drawPlayer(t); } });
    list.sort((a, c) => a.y - c.y).forEach((d) => d.f());
    // 졸음 안개
    if (fogOn || ar.drowsy > 0.05) {
      ctx.save(); ctx.fillStyle = `rgba(150,145,160,${fogOn ? 0.45 : ar.drowsy * 0.4})`;
      ctx.beginPath(); ctx.rect(0, 0, WT.W, WT.H); ctx.ellipse(z.x, z.y - 40, z.rx + 20, z.ry + 70, 0, 0, Math.PI * 2, true); ctx.fill('evenodd'); ctx.restore();
      if (fogOn) for (let i = 0; i < 3; i++) WT.drawThing(ctx, 'fx_bell_wave', PH.bellwave, A.boss.x, A.boss.y - 230, { h: 60 + ((t * 120 + i * 60) % 180), anchor: 'center', alpha: 1 - ((t * 120 + i * 60) % 180) / 180 });
    }
    if (ar.sleepT > 0) WT.drawThing(ctx, 'fx_zzz', PH.zzz, p.x + 30, p.y - 120 - (2.2 - ar.sleepT) * 20, { h: 44, anchor: 'center' });
    R.drawParticles();
    const tg = B.target(); if (tg && !WT.Game.locked()) R.drawPrompt(Object.assign({}, tg, { type: 'boss' }), t);
    drawHud(ctx, t);
    if (b.card) drawCard(ctx, b.card, b.t);
  };

  function drawBoss(ctx, t, R) {
    const b = WT.Game.state.boss;
    const pose = b.pose;
    const ids = { idle: ['boss_idle'], slam: ['boss_slam', 'boss_idle'], throw: ['boss_throw', 'boss_idle'], bell: ['boss_bell', 'boss_idle'], tired: ['boss_tired', 'boss_idle'], hurt: ['boss_hurt', 'boss_tired', 'boss_idle'], cuckoo: ['boss_cuckoo'] }[pose] || ['boss_idle'];
    let sx = 1, sy = 1, rot = 0, bob = 0, h = A.boss.h;
    const a = b.atk;
    if (pose === 'idle') { bob = Math.abs(Math.sin(t * 2.2)) * 6; sy = 1 + Math.sin(t * 2.2) * 0.02; }
    if (pose === 'slam' && a) { const k = a.phase === 'tele' ? Math.min(1, a.t * 1.4) : 0; sy = 1 + k * 0.12 - (a.phase === 'go' && a.t - a.next + 0.6 < 0.15 ? 0.15 : 0); sx = 2 - sy; bob = k * 20; }
    if (pose === 'bell') rot = Math.sin(t * 40) * 0.03;
    if (pose === 'tired') { rot = 0.12; sy = 0.9; sx = 1.06; }
    if (pose === 'hurt') { rot = Math.sin(b.t * 30) * 0.08; sx = 1 + Math.sin(b.t * 20) * 0.08; }
    if (pose === 'cuckoo') { h = 150 * Math.max(0.6, 1 - b.t * 0.5) + 30; bob = Math.abs(Math.sin(t * 3)) * 8; }
    R.shadow(A.boss.x, A.boss.y, pose === 'cuckoo' ? 120 : 210, 0.35);
    WT.drawThing(ctx, ids, PH.boss, A.boss.x, A.boss.y - bob, { h, sx, sy, rot, pose, t, flash: b.hitFlash > 0 });
    if (pose === 'tired' && Math.sin(t * 6) > 0.3) WT.drawThing(ctx, 'fx_sparkle', PH.sparkle, A.boss.x + 92, A.boss.y - 150, { h: 30, anchor: 'center' });
  }
  function drawGear(ctx, g, t, R) {
    if (g.warn > 0) {
      const x = g.vx > 0 ? 40 : WT.W - 40;
      ctx.save(); ctx.globalAlpha = 0.5 + Math.sin(t * 20) * 0.4; ctx.fillStyle = C.red; ctx.strokeStyle = C.outline; ctx.lineWidth = 3;
      ctx.beginPath(); const d = g.vx > 0 ? 1 : -1; ctx.moveTo(x - d * 16, g.y - 22); ctx.lineTo(x + d * 18, g.y - 6); ctx.lineTo(x - d * 16, g.y + 10); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
      return;
    }
    R.shadow(g.x, g.y, g.r * 2, 0.3);
    WT.drawThing(ctx, 'fx_gear', PH.gear, g.x, g.y - g.r, { h: g.r * 2, anchor: 'center', rot: g.rot, big: g.big });
  }
  function drawHud(ctx, t) {
    const s = WT.Game.state, b = s.boss, ar = s.arena;
    ctx.save();
    // 보글 태엽 체력
    ctx.fillStyle = 'rgba(244,230,200,.94)'; ctx.strokeStyle = C.outline; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.roundRect(20, 18, 230, 58, 14); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.outline; ctx.font = '22px "Do Hyeon", sans-serif'; ctx.textBaseline = 'middle'; ctx.fillText('보글', 36, 47);
    for (let i = 0; i < 3; i++) { ctx.globalAlpha = i < ar.hp ? 1 : 0.22; WT.drawThing(ctx, 'prop_key', PH.key, 108 + i * 44, 68, { h: 40 }); }
    ctx.globalAlpha = 1;
    if (ar.drowsy > 0.02) {
      ctx.fillStyle = 'rgba(43,34,48,.9)'; ctx.beginPath(); ctx.roundRect(20, 84, 230, 22, 11); ctx.fill();
      ctx.fillStyle = '#a49fc0'; ctx.beginPath(); ctx.roundRect(22, 86, 226 * Math.min(1, ar.drowsy), 18, 9); ctx.fill();
      ctx.fillStyle = C.cream; ctx.font = '15px "Do Hyeon", sans-serif'; ctx.fillText('졸음', 30, 96);
    }
    // 백작 이름표
    const w = 340, x = WT.W - w - 20;
    ctx.fillStyle = 'rgba(43,34,48,.94)'; ctx.strokeStyle = C.cream; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(x, 16, w, 54, 14); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.yellow; ctx.font = '24px "Do Hyeon", sans-serif'; ctx.textAlign = 'left'; ctx.fillText('째깍 백작', x + 18, 43);
    for (let i = 0; i < 3; i++) { ctx.globalAlpha = i < b.springs ? 1 : 0.2; WT.drawThing(ctx, 'fx_spring', PH.spring, x + 190 + i * 46, 43, { h: 38, anchor: 'center', rot: i < b.springs ? Math.sin(t * 4 + i) * 0.1 : 0 }); }
    ctx.restore();
  }
  function drawCard(ctx, card, t) {
    const a = Math.min(1, t * 4) * Math.min(1, (1.6 - t) * 4);
    ctx.save(); ctx.globalAlpha = Math.max(0, a);
    ctx.fillStyle = 'rgba(26,20,24,.82)'; ctx.fillRect(0, 0, WT.W, WT.H);
    ctx.strokeStyle = C.cream; ctx.lineWidth = 4; ctx.strokeRect(330, 250, 620, 220); ctx.lineWidth = 2; ctx.strokeRect(344, 264, 592, 192);
    ctx.fillStyle = C.cream; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '72px "Do Hyeon", sans-serif'; ctx.fillText(card.title, WT.W / 2, 340);
    ctx.font = '26px "Gowun Dodum", sans-serif'; ctx.fillText(card.sub, WT.W / 2, 410);
    ctx.restore();
  }

  // ───────── 임시 도형: 백작, 톱니, 스프링, 종소리 ─────────
  const ell = (c, x, y, rx, ry, f, lw) => { c.fillStyle = f; c.strokeStyle = C.outline; c.lineWidth = lw || 4; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 7); c.fill(); c.stroke(); };
  const hose = (c, x1, y1, x2, y2, bend, w, col) => { c.lineCap = 'round'; c.strokeStyle = C.outline; c.lineWidth = w + 5; c.beginPath(); c.moveTo(x1, y1); c.quadraticCurveTo((x1 + x2) / 2 + bend, (y1 + y2) / 2, x2, y2); c.stroke(); c.strokeStyle = col || C.black; c.lineWidth = w; c.stroke(); };
  PH.boss = function (c, h, o) {
    const k = h / 240, pose = o.pose || 'idle', t = o.t || 0;
    c.scale(k, k);
    if (pose === 'cuckoo') { // 작은 뻐꾸기시계
      c.fillStyle = C.wood; c.strokeStyle = C.outline; c.lineWidth = 5;
      c.beginPath(); c.moveTo(-70, -60); c.lineTo(0, -140); c.lineTo(70, -60); c.lineTo(60, 0); c.lineTo(-60, 0); c.closePath(); c.fill(); c.stroke();
      ell(c, 0, -60, 34, 34, C.cream);
      WT.pieEye(c, -12, -64, 8, 1); WT.pieEye(c, 12, -64, 8, 1);
      c.strokeStyle = C.outline; c.lineWidth = 3; c.beginPath(); c.arc(0, -52, 10, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke();
      ell(c, 0, -118 - Math.abs(Math.sin(t * 3)) * 16, 12, 10, C.yellow, 3);
      return;
    }
    const up = pose === 'slam' || pose === 'bell';
    const tired = pose === 'tired' || pose === 'hurt';
    // 다리 (흰 각반 + 검은 구두)
    hose(c, -30, -70, -44, -8, -10, 9); hose(c, 30, -70, 44, -8, 10, 9);
    ell(c, -50, -8, 24, 12, C.black); ell(c, 50, -8, 24, 12, C.black);
    // 팔
    if (up) { hose(c, -82, -150, -150, -250, -20, 8); hose(c, 82, -150, 150, -250, 20, 8); ell(c, -150, -250, 18, 16, C.white); ell(c, 150, -250, 18, 16, C.white); }
    else if (pose === 'throw') { hose(c, -82, -150, -170, -120, -10, 8); hose(c, 82, -150, 120, -90, 10, 8); ell(c, -170, -120, 18, 16, C.white); ell(c, 120, -90, 18, 16, C.white); }
    else { hose(c, -82, -140, -120, tired ? -40 : -70, -14, 8); hose(c, 82, -140, 120, tired ? -40 : -70, 14, 8); ell(c, -120, tired ? -40 : -70, 18, 16, C.white); ell(c, 120, tired ? -40 : -70, 18, 16, C.white); }
    // 종 두 개
    const ring = pose === 'bell' ? Math.sin(t * 50) * 0.25 : 0;
    [[-62, -236, -0.4], [62, -236, 0.4]].forEach(([x, y, r]) => { c.save(); c.translate(x, y); c.rotate(r + ring); c.fillStyle = '#c99a3a'; c.strokeStyle = C.outline; c.lineWidth = 4; c.beginPath(); c.arc(0, 0, 32, Math.PI, 0); c.lineTo(32, 6); c.lineTo(-32, 6); c.closePath(); c.fill(); c.stroke(); c.restore(); });
    // 몸통 (자명종)
    ell(c, 0, -150, 96, 96, '#3b4a6b', 5);
    ell(c, 0, -150, 80, 80, o.flash ? '#fff' : C.cream, 4);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.fillStyle = C.outline; c.beginPath(); c.arc(Math.cos(a) * 68, -150 + Math.sin(a) * 68, 3.5, 0, 7); c.fill(); }
    // 눈과 눈썹(시곗바늘)
    WT.pieEye(c, -26, -160, 15, tired ? 0.3 : 1);
    WT.pieEye(c, 26, -160, 15, tired ? 0.3 : 1);
    ell(c, 26, -160, 22, 22, 'rgba(0,0,0,0)', 3); // 외알 안경
    c.strokeStyle = C.outline; c.lineWidth = 7; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-50, tired ? -186 : -194); c.lineTo(-8, -180); c.moveTo(50, tired ? -186 : -194); c.lineTo(8, -180); c.stroke();
    // 입
    c.lineWidth = 4;
    if (tired) { c.beginPath(); c.moveTo(-20, -112); c.quadraticCurveTo(0, -122, 20, -112); c.stroke(); }
    else { c.fillStyle = C.black; c.beginPath(); c.moveTo(-30, -118); c.quadraticCurveTo(0, -96, 30, -118); c.quadraticCurveTo(0, -108, -30, -118); c.fill(); c.stroke(); }
    // 지쳤을 때: 등의 태엽 열쇠가 옆으로 드러남
    if (tired) { c.save(); c.translate(98, -150); c.rotate(Math.PI / 2 + Math.sin(t * 2) * 0.1); PH.key(c, 60, {}); c.restore(); }
  };
  PH.gear = function (c, h, o) {
    const r = h / 2;
    c.fillStyle = o.big ? '#8b8f9e' : '#c99a3a'; c.strokeStyle = C.outline; c.lineWidth = 4;
    c.beginPath();
    for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2, rr = i % 2 ? r * 0.78 : r; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    c.closePath(); c.fill(); c.stroke();
    ell(c, 0, 0, r * 0.32, r * 0.32, C.cream, 3);
    if (o.big) { WT.pieEye(c, -r * 0.3, -r * 0.35, r * 0.18, 1); WT.pieEye(c, r * 0.3, -r * 0.35, r * 0.18, 1); }
  };
  PH.spring = function (c, h) {
    const k = h / 40; c.scale(k, k);
    c.strokeStyle = C.outline; c.lineWidth = 7; c.lineCap = 'round';
    c.beginPath(); for (let i = 0; i <= 40; i++) { const y = -16 + i * 0.8, x = Math.sin(i / 40 * Math.PI * 8) * 10; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
    c.strokeStyle = C.yellow; c.lineWidth = 4; c.stroke();
  };
  PH.bellwave = function (c, h) {
    c.strokeStyle = 'rgba(244,230,200,.8)'; c.lineWidth = 4;
    c.beginPath(); c.arc(0, 0, h / 2, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
  };
  PH.steam = function (c, h) { ell(c, 0, 0, h * 0.4, h * 0.32, 'rgba(244,230,200,.85)', 3); ell(c, h * 0.3, -h * 0.2, h * 0.28, h * 0.24, 'rgba(244,230,200,.85)', 3); };
})();
