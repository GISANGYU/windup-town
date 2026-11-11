// 제4막 「도시에서 온 방송」 — 측량기 3대, 말뚝과 회색 번짐, 동료 라디오 씨의 잡음 방송, 건전지 추격
// 기획: GAME_DESIGN.md 18절. 상태는 state.act4.
(function () {
  const G = WT.Game, W = WT.WORLD, C = WT.C, PH = WT.PH;
  const D = () => WT.DIALOGUE.act4;
  const A4 = WT.Act4 = {};
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const FOLLOW = ['stakes', 'chase', 'map'];
  const GREY_R = 105, GREY_GROW = 7;      // 회색 원 최대 반지름, 다 퍼지는 시간(초)
  const JAM_RANGE = 130, JAM_CD = 6, STUN = 3.2;
  const HAMMER_EVERY = 8, MAX_STAKES = 3;
  const PULL_TIME = 1.0;
  const CHASE_TIME = 30;
  const SV_SPEED = 55;

  // 측량기 순찰 경로
  const PATHS = [
    [{ x: 480, y: 245 }, { x: 700, y: 245 }, { x: 700, y: 290 }, { x: 480, y: 290 }],
    [{ x: 770, y: 600 }, { x: 860, y: 600 }, { x: 860, y: 655 }, { x: 770, y: 655 }],
    [{ x: 150, y: 615 }, { x: 380, y: 615 }, { x: 380, y: 660 }, { x: 150, y: 660 }]
  ];
  // 추격 때 달아나는 길(왕복)
  const FLEE = [{ x: 200, y: 625 }, { x: 410, y: 690 }, { x: 780, y: 690 }, { x: 1000, y: 625 }, { x: 1235, y: 640 }, { x: 1235, y: 380 }, { x: 900, y: 360 }, { x: 560, y: 470 }];
  const START_STAKES = [{ x: 560, y: 300 }, { x: 830, y: 560 }];

  A4.initState = function (s) {
    s.act4 = { stage: 'none', surveyors: [], stakes: [], jamCd: 0, hold: null, chaseT: 0, map: null, follow: { x: 0, y: 0, t: 0 }, after: [] };
    s.inventory.batteryEmpty = false;
  };
  const st = () => G.state.act4;
  const is = (n) => G.state.act4 && G.state.act4.stage === n;
  A4.following = () => !!(G.state.act4 && FOLLOW.includes(G.state.act4.stage));
  function after(t, fn) { st().after.push({ t, fn }); }
  function say(who, lines, o) {
    o = o || {};
    WT.UI.dialog(Object.assign({ who, name: o.name || (who === 'bogle' ? '보글' : WT.npcName(who)), mood: o.mood || 'awake', lines }, o));
  }
  A4.busy = () => false;

  // ───────── 시작 ─────────
  function start() {
    const s = G.state, p = s.player, a = st();
    if (!WT.Act3.is('done') || a.stage !== 'none') return;
    G.irisThen(p.x, p.y - 50, () => WT.Story.play(WT.DIALOGUE.act4open, () => {
      a.stage = 'stakes';
      a.surveyors = PATHS.map((path, i) => ({ id: i, x: path[0].x, y: path[0].y, path, wi: 1, state: 'walk', t: 0, hammerT: 3 + i * 2.5, made: 0, face: 1 }));
      a.stakes = START_STAKES.map((q) => ({ x: q.x, y: q.y, r: GREY_R * 0.6, pulled: false, by: -1 }));
      const r = W.npcs.radio; a.follow = { x: r.x, y: r.y, t: 0 };
      p.x = r.x - 80; p.y = r.y + 30;
      WT.Act3.refresh();
      after(0.9, () => say('radio', D().radio.follow, { onClose: () => G.toast(D().toast.start) }));
    }));
  }
  // 점검용: 바로 말뚝 단계로 (?act4&shot=stakes)
  A4.debugStakes = function () {
    const s = G.state, a = st();
    a.stage = 'stakes';
    a.surveyors = PATHS.map((path, i) => ({ id: i, x: path[0].x, y: path[0].y, path, wi: 1, state: 'walk', t: 0, hammerT: 1 + i, made: 0, face: 1 }));
    a.stakes = START_STAKES.map((q) => ({ x: q.x, y: q.y, r: GREY_R, pulled: false, by: -1 }));
    s.player.x = 600; s.player.y = 330; a.follow = { x: 530, y: 340, t: 0 };
    WT.Act3.refresh();
  };
  A4.skipToEnd = function () {
    const s = G.state, a = st();
    a.stage = 'done'; s.inventory.battery = 1; s.inventory.batteryEmpty = true; s.inventory.map = true;
  };

  // ───────── 측량기 ─────────
  function jam(sv) {
    const a = st();
    if (a.jamCd > 0) { G.toast(D().toast.cool); return; }
    sv.state = 'stun'; sv.t = STUN; a.jamCd = JAM_CD;
    WT.Audio.play('sfx_radio_jam'); WT.Audio.play('sfx_surveyor_stun', { delay: 0.15 });
    WT.UI.shake(0.15);
    for (let i = 0; i < 6; i++) G.particles.push({ type: 'static', x: sv.x + (Math.random() - 0.5) * 60, y: sv.y - 60 - Math.random() * 70, vx: (Math.random() - 0.5) * 60, vy: -40, life: 0, max: 0.6, rot: Math.random(), size: 1 });
    G.toast(D().toast.jam);
  }
  function stop(sv) {
    sv.state = 'stopped';
    WT.Audio.play('sfx_surveyor_stop');
    G.burst('sparkle', sv.x, sv.y - 60, 6);
    G.state.player.action = 'happy'; G.state.player.actionT = 0.8;
    G.toast(`${D().toast.stop} ${st().surveyors.filter((q) => q.state === 'stopped').length} / 2`);
    checkFlee();
  }
  function pull(i) {
    const a = st(), k = a.stakes[i];
    if (!k || k.pulled) return;
    k.pulled = true; a.hold = null;
    WT.Audio.stop('sfx_stake_pull'); WT.Audio.play('sfx_stake_out'); WT.Audio.play('sfx_grey_recede', { delay: 0.1 });
    G.burst('dust', k.x, k.y, 1); G.burst('sparkle', k.x, k.y - 30, 6);
    G.toast(D().toast.pull);
    checkFlee();
  }
  function checkFlee() {
    const a = st();
    const stopped = a.surveyors.filter((q) => q.state === 'stopped').length;
    if (is('stakes') && stopped >= 2 && a.stakes.every((k) => k.pulled)) after(0.8, chase);
  }

  // ───────── 추격 (강제 건전지) ─────────
  function chase() {
    const s = G.state, p = s.player, a = st();
    if (!is('stakes')) return;
    const sv = a.surveyors.find((q) => q.state !== 'stopped');
    G.irisThen(p.x, p.y - 50, () => WT.Story.play(WT.DIALOGUE.act4chase, () => {
      a.stage = 'chase'; a.chaseT = 0;
      sv.state = 'flee'; sv.x = FLEE[0].x; sv.y = FLEE[0].y; sv.wi = 1; sv.dir = 1;
      p.x = 120; p.y = 560; p.power = 'battery';
      WT.Audio.play('sfx_battery_in');
      after(0.6, () => G.toast(D().toast.flee));
    }));
  }
  function caught(sv) {
    const s = G.state, a = st();
    sv.state = 'stopped';
    a.map = { x: sv.x + 40, y: sv.y + 10 };
    a.stage = 'map';
    s.player.power = 'wind'; s.inventory.batteryEmpty = true;
    WT.Audio.play('sfx_battery_empty');
    WT.UI.shake(0.2); G.burst('dust', s.player.x, s.player.y, 2);
    G.toast(D().toast.caught);
  }
  function pickMap() {
    const s = G.state, a = st();
    a.map = null; s.inventory.map = true;
    WT.Audio.jingle('jingle_map_get');
    s.player.action = 'happy'; s.player.actionT = 1;
    G.toast(D().toast.map);
    after(1.2, () => WT.Story.play(WT.DIALOGUE.act4past, () => after(0.9, () =>
      say('radio', D().radio.past, { onClose: () => say('gramo', D().gramo.bye, { onClose: endAct }) }))));
  }
  function endAct() {
    const s = G.state, p = s.player, a = st();
    G.irisThen(p.x, p.y - 50, () => WT.Story.play(WT.DIALOGUE.act4end, () => {
      a.stage = 'done';
      WT.Act3.refresh();
      p.x = W.npcs.radio.x - 80; p.y = W.npcs.radio.y + 40;
      after(0.9, () => say('radio', D().radio.ready, { onClose: () => WT.Road && WT.Road.start() })); // 끝나면 바로 5막으로
    }));
  }

  // ───────── 대화 · 상호작용 ─────────
  A4.talk = function (id) {
    const a = st();
    if (!a) return false;
    if (id === 'radio' && WT.Act3.is('done') && a.stage === 'none') { say('radio', D().radio.ask, { onClose: start }); return true; }
    if (id === 'radio' && a.stage === 'done') { say('radio', D().radio.ready, { onClose: () => WT.Road && WT.Road.start() }); return true; }
    if (id === 'gramo' && (a.stage === 'stakes' || a.stage === 'chase')) { say('gramo', D().gramo.stakes); return true; }
    if (id === 'gramo' && a.stage === 'done') { say('gramo', D().gramo.bye); return true; }
    return false;
  };
  A4.targets = function (consider, p) {
    const a = st();
    if (!a) return;
    if (is('stakes')) {
      a.surveyors.forEach((sv) => {
        if (sv.state === 'stopped') return;
        const label = sv.state === 'stun' ? '건전지 빼기' : a.jamCd > 0 ? '잡음 충전 중' : '잡음 방송';
        consider({ type: 'surveyor', id: sv.id, x: sv.x, y: sv.y, h: 130, label }, dist(p, sv), JAM_RANGE);
      });
      a.stakes.forEach((k, i) => !k.pulled && consider({ type: 'stake', id: i, x: k.x, y: k.y, h: 60 }, dist(p, k), WT.CFG.pickRange + 10));
    }
    if (is('map') && a.map) consider({ type: 'map', x: a.map.x, y: a.map.y, h: 40 }, dist(p, a.map), WT.CFG.pickRange + 10);
  };
  A4.interact = function (t) {
    const a = st();
    if (t.type === 'surveyor') { const sv = a.surveyors[t.id]; if (sv.state === 'stun') stop(sv); else jam(sv); return true; }
    if (t.type === 'stake') { G.toast('E를 길게 누르세요'); return true; }
    if (t.type === 'map') { pickMap(); return true; }
    return false;
  };
  // E 길게: 말뚝 뽑기
  A4.key = function (code, down) {
    const a = st();
    if (!a || !is('stakes') || !WT.KEY.act.includes(code)) return false;
    if (!down) { if (a.hold) { a.hold = null; WT.Audio.stop('sfx_stake_pull'); } return false; }
    if (G.locked()) return false;
    const t = G.nearestTarget();
    if (!t || t.type !== 'stake') return false;
    a.hold = { i: t.id, t: 0 };
    G.state.player.action = 'interact'; G.state.player.actionT = PULL_TIME;
    return true;
  };

  // ───────── 갱신 ─────────
  function walk(sv, speed, dt, path, loop) {
    const tg = path[sv.wi];
    const dx = tg.x - sv.x, dy = tg.y - sv.y, d = Math.hypot(dx, dy);
    if (d < speed * dt + 1) {
      sv.x = tg.x; sv.y = tg.y;
      if (loop) sv.wi = (sv.wi + 1) % path.length;
      else { if (sv.wi === path.length - 1) sv.dir = -1; else if (sv.wi === 0) sv.dir = 1; sv.wi += sv.dir; }
    } else { sv.x += dx / d * speed * dt; sv.y += dy / d * speed * dt; if (Math.abs(dx) > 2) sv.face = dx > 0 ? 1 : -1; }
    sv.step = (sv.step || 0) + dt;
    if (sv.step > 0.42) { sv.step = 0; if (dist(sv, G.state.player) < 420) WT.Audio.play('sfx_surveyor_step', { vol: 0.2 }); }
  }
  A4.update = function (dt) {
    const s = G.state, a = s.act4;
    if (!a) return;
    if (a.after.length && !s.ui.transition && !s.ui.story && !s.ui.dialog) { const q = a.after[0]; q.t -= dt; if (q.t <= 0) { a.after.shift(); q.fn(); } }
    if (!FOLLOW.includes(a.stage)) return;
    const p = s.player;
    // 라디오 씨 따라오기
    const f = a.follow, back = { x: p.x - (p.facing || 1) * 70, y: p.y + 10 };
    const fd = dist(f, back);
    if (fd > 8) { const k = Math.min(1, dt * (fd > 200 ? 6 : 3)); f.x += (back.x - f.x) * k; f.y += (back.y - f.y) * k; }
    f.t += dt;
    if (G.locked()) return;
    a.jamCd = Math.max(0, a.jamCd - dt);
    a.stakes.forEach((k) => { if (!k.pulled && k.r < GREY_R) k.r = Math.min(GREY_R, k.r + GREY_R / GREY_GROW * dt); });
    if (a.stage === 'stakes') {
      const stopped = a.surveyors.filter((q) => q.state === 'stopped').length;
      a.surveyors.forEach((sv) => {
        if (sv.state === 'stopped') return;
        if (sv.state === 'stun') { sv.t -= dt; if (sv.t <= 0) { sv.state = 'walk'; WT.Audio.play('sfx_surveyor_scan'); } return; }
        if (sv.state === 'hammer') { sv.t -= dt; if (sv.t <= 0) { sv.state = 'walk'; } return; }
        walk(sv, SV_SPEED, dt, sv.path, true);
        sv.hammerT -= dt;
        const lastOne = stopped >= 2;
        const mine = a.stakes.filter((k) => k.by === sv.id && !k.pulled).length;
        if (sv.hammerT <= 0 && !lastOne && mine < MAX_STAKES && sv.made < 4) {
          sv.hammerT = HAMMER_EVERY; sv.state = 'hammer'; sv.t = 0.9; sv.made++;
          a.stakes.push({ x: sv.x + 18 * sv.face, y: sv.y + 6, r: 0, pulled: false, by: sv.id });
          WT.Audio.play('sfx_stake_hammer'); WT.Audio.play('sfx_grey_spread', { delay: 0.3 });
          if (dist(sv, p) < 500) WT.UI.shake(0.06);
        }
      });
      // 말뚝 뽑기 (길게)
      if (a.hold) {
        const k = a.stakes[a.hold.i];
        if (!k || k.pulled || dist(p, k) > WT.CFG.pickRange + 30) { a.hold = null; WT.Audio.stop('sfx_stake_pull'); }
        else { a.hold.t += dt; p.action = 'interact'; p.actionT = 0.2; if (a.hold.t >= PULL_TIME) pull(a.hold.i); }
      }
    }
    if (a.stage === 'chase') {
      a.chaseT += dt;
      const sv = a.surveyors.find((q) => q.state === 'flee');
      if (sv) {
        const sp = 300 * Math.max(0.45, 1 - a.chaseT / 40); // 측량기 건전지도 닳아 점점 느려짐
        walk(sv, sp, dt, FLEE, false);
        if (Math.random() < dt * 6) G.particles.push({ type: 'dust', x: sv.x, y: sv.y, vx: 0, vy: 0, life: 0, max: 0.4, rot: 0, size: 1 });
        if (dist(sv, p) < 70 || a.chaseT > CHASE_TIME) caught(sv);
      }
    }
  };

  // ───────── 목표 · 안내 · 소리 ─────────
  A4.objective = function () {
    const a = st();
    if (!a || a.stage === 'none') return null;
    if (a.stage === 'stakes') {
      const stopped = a.surveyors.filter((q) => q.state === 'stopped').length, left = a.stakes.filter((k) => !k.pulled).length;
      return `측량기 멈추기 ${stopped} / 2 · 남은 말뚝 ${left}개`;
    }
    if (a.stage === 'chase') return '달아나는 측량기를 잡아라!';
    if (a.stage === 'map') return a.map ? '떨어진 지도를 줍자' : '라디오 씨의 이야기';
    if (a.stage === 'done') return '라디오 씨에게 말을 걸면 도시로 출발';
    return null;
  };
  A4.tip = function () {
    const a = st();
    if (!a || G.locked()) return null;
    if (a.stage === 'stakes') {
      if (a.hold) return '그대로 누르고 있기…';
      const t = G.nearestTarget();
      if (t && t.type === 'surveyor') return t.label === '건전지 빼기' ? 'E : 멈춘 동안 건전지 빼기' : a.jamCd > 0 ? '라디오 씨가 숨 고르는 중…' : 'E : 라디오 씨 잡음 방송으로 멈추기';
      if (t && t.type === 'stake') return 'E 길게 : 말뚝 뽑기';
      return null;
    }
    if (a.stage === 'chase') return a.chaseT < 4 ? '건전지라 빠르다 · 덤불은 못 넘으니 돌아가자' : null;
    return null;
  };
  A4.mech = function () {
    const s = G.state, a = st();
    if (!a || !FOLLOW.includes(a.stage)) return 0;
    const inGrey = A4.greyAt(s.player.x, s.player.y) > 0.3;
    const zones = a.stakes.filter((k) => !k.pulled && k.r > 40).length;
    return (inGrey ? 1 : 0) + (zones >= 3 ? 1 : 0);
  };
  // 그 자리의 회색 정도 0~1
  A4.greyAt = function (x, y) {
    const a = G.state.act4;
    if (!a || !FOLLOW.includes(a.stage)) return 0;
    let g = 0;
    a.stakes.forEach((k) => { if (k.pulled || k.r < 1) return; const d = Math.hypot(x - k.x, (y - k.y) * 1.6); if (d < k.r) g = Math.max(g, 1 - d / k.r * 0.6); });
    return g;
  };
  A4.music = function (s) {
    const a = s.act4;
    if (!a || s.scene !== 'town' || !FOLLOW.includes(a.stage)) return null;
    const zones = a.stakes.filter((k) => !k.pulled).length;
    if (a.stage === 'chase') return { want: 'bgm_chase', fallback: 'bgm_boss', thin: 0.35, loops: { sfx_battery_hum: 0.8 } };
    const holding = a.hold ? 1 : 0;
    return { want: 'bgm_act4_tension', fallback: 'bgm_town_awake', thin: Math.min(0.6, zones * 0.12 + A4.greyAt(s.player.x, s.player.y) * 0.3), loops: { sfx_stake_pull: holding } };
  };

  // ───────── 그리기 ─────────
  A4.drawList = function (list, t, ctx, R) {
    const s = G.state, a = st();
    if (!a || !FOLLOW.includes(a.stage)) return;
    a.stakes.forEach((k, i) => {
      if (k.pulled) { list.push({ y: k.y, f: () => WT.drawThing(ctx, 'prop_stake_pulled', PH.stakePulled, k.x, k.y, { h: 30 }) }); return; }
      list.push({ y: k.y, f: () => {
        R.shadow(k.x, k.y, 24, 0.25);
        const shake = a.hold && a.hold.i === i ? Math.sin(t * 50) * 0.08 * a.hold.t : 0;
        WT.drawThing(ctx, 'prop_stake', PH.stake, k.x, k.y - (a.hold && a.hold.i === i ? a.hold.t * 14 : 0), { h: 60, rot: shake, t });
        if (a.hold && a.hold.i === i) { ctx.save(); ctx.strokeStyle = C.yellow; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(k.x, k.y - 80, 18, -Math.PI / 2, -Math.PI / 2 + a.hold.t / PULL_TIME * Math.PI * 2); ctx.stroke(); ctx.restore(); }
      } });
    });
    a.surveyors.forEach((sv) => list.push({ y: sv.y, f: () => {
      const stopped = sv.state === 'stopped', stun = sv.state === 'stun';
      const moving = sv.state === 'walk' || sv.state === 'flee';
      const frame = moving ? (Math.floor(t * (sv.state === 'flee' ? 10 : 4)) % 2 ? 'npc_surveyor_walk_02' : 'npc_surveyor_walk_01') : null;
      const ids = stopped || stun ? ['npc_surveyor_stun', 'npc_surveyor_idle'] : sv.state === 'hammer' ? ['npc_surveyor_hammer', 'npc_surveyor_idle'] : frame ? [frame, 'npc_surveyor_idle'] : ['npc_surveyor_idle'];
      R.shadow(sv.x, sv.y, 70, 0.28);
      WT.drawThing(ctx, ids, PH.surveyor, sv.x, sv.y, { h: 130, flip: moving && sv.face < 0 && !!frame, rot: stopped ? 0.35 : stun ? Math.sin(t * 20) * 0.06 : 0, state: sv.state, t, alpha: stopped ? 0.8 : 1 });
      if (stun) { ctx.save(); ctx.strokeStyle = C.cream; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(sv.x, sv.y - 150, 16, -Math.PI / 2, -Math.PI / 2 + sv.t / STUN * Math.PI * 2); ctx.stroke(); ctx.restore(); }
    } }));
    if (a.map) list.push({ y: a.map.y, f: () => { R.shadow(a.map.x, a.map.y, 30, 0.2); WT.drawThing(ctx, 'prop_city_map', PH.cityMap, a.map.x, a.map.y - Math.abs(Math.sin(t * 3)) * 6, { h: 40 }); } });
    // 따라오는 라디오 씨
    const f = a.follow, b = s.world.musicOn ? Math.abs(Math.sin(t * WT.CFG.bpm / 60 * Math.PI)) : 0;
    list.push({ y: f.y, f: () => { R.shadow(f.x, f.y, 60, 0.25); WT.drawThing(ctx, ['npc_radio_crank', 'npc_radio_idle'], PH.radio, f.x, f.y - b * 6, { h: 110, power: 'wind', crank: true, t, sy: 1 + b * 0.04, flip: (s.player.facing || 1) < 0 }); } });
  };
  A4.drawOverlay = function (ctx, t) {
    const s = G.state, a = st();
    if (!a || !FOLLOW.includes(a.stage) || s.scene !== 'town') return;
    // 회색 번짐: 그 영역의 채도를 0으로
    ctx.save();
    ctx.globalCompositeOperation = 'saturation';
    a.stakes.forEach((k) => {
      if (k.pulled || k.r < 2) return;
      const g = ctx.createRadialGradient(k.x, k.y, 0, k.x, k.y, k.r);
      g.addColorStop(0, 'rgba(128,128,128,1)'); g.addColorStop(0.75, 'rgba(128,128,128,.9)'); g.addColorStop(1, 'rgba(128,128,128,0)');
      ctx.fillStyle = g; ctx.save(); ctx.translate(k.x, k.y); ctx.scale(1, 1 / 1.6); ctx.translate(-k.x, -k.y);
      ctx.beginPath(); ctx.arc(k.x, k.y, k.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    });
    ctx.restore();
    // 직선 격자(측량 선)
    ctx.save(); ctx.strokeStyle = 'rgba(232,237,242,.35)'; ctx.lineWidth = 1.5;
    a.stakes.forEach((k) => { if (k.pulled || k.r < 20) return; ctx.beginPath(); ctx.moveTo(k.x - k.r * 0.8, k.y); ctx.lineTo(k.x + k.r * 0.8, k.y); ctx.moveTo(k.x, k.y - k.r * 0.5); ctx.lineTo(k.x, k.y + k.r * 0.5); ctx.stroke(); });
    ctx.restore();
    // 잡음 방송 쿨다운 / 추격 건전지
    const x = 20, y = 80;
    ctx.save(); ctx.font = '18px "Do Hyeon", sans-serif'; ctx.textBaseline = 'middle';
    if (a.stage === 'stakes') {
      ctx.fillStyle = 'rgba(244,230,200,.92)'; ctx.strokeStyle = C.outline; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.roundRect(x, y, 230, 40, 12); ctx.fill(); ctx.stroke();
      WT.drawThing(ctx, ['npc_radio_crank', 'npc_radio_idle'], PH.radio, x + 22, y + 36, { h: 32, power: 'wind' });
      ctx.fillStyle = C.outline; ctx.fillText(a.jamCd > 0 ? `잡음 충전 ${a.jamCd.toFixed(1)}초` : '잡음 방송 준비 · E', x + 46, y + 21);
    }
    if (a.stage === 'chase') {
      const k = Math.max(0, 1 - a.chaseT / CHASE_TIME);
      ctx.fillStyle = 'rgba(155,163,174,.92)'; ctx.strokeStyle = C.outline; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.roundRect(x, y, 240, 40, 12); ctx.fill(); ctx.stroke();
      WT.drawThing(ctx, 'prop_battery', PH.battery, x + 24, y + 34, { h: 28 });
      ctx.fillStyle = '#5c6470'; ctx.beginPath(); ctx.roundRect(x + 46, y + 13, 180, 14, 7); ctx.fill();
      ctx.fillStyle = k < 0.25 ? '#e07a3a' : '#e8edf2'; ctx.beginPath(); ctx.roundRect(x + 46, y + 13, 180 * k, 14, 7); ctx.fill();
    }
    ctx.restore();
  };
})();
