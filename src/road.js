// 제5막 「갈아끼우는 길」 — 횡스크롤. 태엽(느림·점프·태엽 장치) ↔ 건전지(빠름·점프 봉인·전기 장치) 갈아끼우기.
// 기획: GAME_DESIGN.md 19절. 구간 데이터: src/road_levels.js. 상태: state.road (scene = 'road')
(function () {
  const G = WT.Game, C = WT.C, PH = WT.PH, GY = WT.ROAD_GY;
  const D = () => WT.DIALOGUE.act5;
  const RD = WT.Road = {};
  const P = {
    walk: 230, batteryMul: 1.6, gravity: 2000, jumpV: 700, chargeMul: 1.36, chargeT: 0.55,
    swapT: 0.6, windDrainMove: 3, windDrainIdle: 0.5, batteryDrain: 7,
    gateT: 1.05, shortT: 1.5, invT: 1.2, chargeTime: 1.4, elevatorV: 130, liftV: 110,
    pw: 36, ph: 88
  };
  RD.P = P;

  RD.initState = function (s) { s.road = null; };
  const R = () => G.state.road;

  // ───────── 입장 · 구간 ─────────
  RD.start = function () {
    const s = G.state, p = s.player;
    G.irisThen(p.x, p.y - 50, () => WT.Story.play(WT.DIALOGUE.act5open, () => RD.enter(1)));
  };
  RD.enter = function (zone) {
    const s = G.state, prev = s.road;
    const L = WT.ROAD_LEVELS[zone - 1];
    s.scene = 'road';
    G.setScene('road');
    WT.UI.setScene('road');
    s.road = {
      zone, L, camX: 0, t: 0,
      battery: prev ? prev.battery : (s.inventory.batteryEmpty ? 0 : 100), wind: 100, hp: 3,
      checkpoint: L.items.find((i) => i.type === 'checkpoint').x,
      items: L.items.map((i) => Object.assign({}, i, { state: 0, t: 0, y: 0 })),
      p: null, follow: { x: 40, y: GY }, cleared: false, after: []
    };
    spawn(s.road.checkpoint);
    const r = s.road;
    r.p.power = prev && prev.p ? 'wind' : 'wind';
    WT.Audio.play('sfx_wind_self');
    after(0.9, () => WT.UI.dialog({ who: 'radio', name: '라디오 씨', mood: 'awake', lines: D().radio['zone' + zone] }));
  };
  function after(t, fn) { R().after.push({ t, fn }); }
  function spawn(x) {
    const r = R();
    r.p = { x, y: GY, vx: 0, vy: 0, onGround: true, facing: 1, power: r.p ? r.p.power : 'wind', swapT: 0, shortT: 0, inv: 0, sleepT: 0,
      charge: null, chargingT: 0, hurtT: 0, landT: 0, moving: false };
    if (r.p.power === 'battery' && r.battery <= 0) r.p.power = 'wind';
    r.camX = Math.max(0, x - 420);
    r.follow = { x: x - 70, y: GY };
    // 장치 되돌리기 (셔터 열림, 승강기 내림)
    r.items.forEach((it) => { if (it.type === 'gate') { it.state = 0; it.t = 0; } if (it.type === 'elevator') it.y = 0; });
  }
  function respawn(why) {
    const s = G.state, r = R();
    if (r.dying) return;
    r.dying = true;
    G.irisThen(r.p.x - r.camX, r.p.y - 50, () => { r.dying = false; r.wind = 100; r.hp = 3; spawn(r.checkpoint); s.ui.transition.cx = r.p.x - r.camX; s.ui.transition.cy = GY - 50; });
    if (why === 'sleep') after(0.5, () => WT.UI.dialog({ who: 'radio', name: '라디오 씨', mood: 'awake', lines: D().radio.sleep }));
  }

  // ───────── 충돌 ─────────
  // 지금 단단한 사각형 목록 { x, y, w, h, top: true(위에서만) }
  function solids() {
    const r = R(), out = [];
    r.L.ground.forEach(([a, b]) => out.push({ x: a, y: GY, w: b - a, h: 400 }));
    r.items.forEach((it) => {
      switch (it.type) {
        case 'bush': { const h = it.tall ? 150 : 90; out.push({ x: it.x - 45, y: GY - h, w: 90, h }); break; }
        case 'ledge': out.push({ x: it.x, y: GY - it.h, w: it.w, h: it.h }); break;
        case 'gate': // 터널 지붕(충전 점프로 넘지 못하게) + 닫힌 셔터
          out.push({ x: it.x, y: -400, w: it.w + 24, h: GY - 150 + 400 });
          if (it.state === 2 || (it.state === 1 && it.t > P.gateT)) out.push({ x: it.x + it.w, y: GY - 150, w: 24, h: 150 });
          break;
        case 'door': if (!it.open) { out.push({ x: it.x - 12, y: -400, w: 24, h: GY + 400 }); } else out.push({ x: it.x - 12, y: -400, w: 24, h: GY - 180 + 400 }); break;
        case 'elevator': out.push({ x: it.x, y: GY - it.y, w: it.w, h: 20, top: true, mover: it }); break;
        case 'lift': out.push({ x: it.x, y: GY - it.y, w: it.w, h: 20, top: true, mover: it }); break;
        case 'bridge': if (it.state === 2) out.push({ x: it.x, y: GY, w: it.w, h: 24, top: true }); break;
      }
    });
    return out;
  }
  const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const box = (p) => ({ x: p.x - P.pw / 2, y: p.y - P.ph, w: P.pw, h: P.ph });

  // ───────── 입력 ─────────
  RD.key = function (code, down) {
    const s = G.state, r = R();
    if (!r || s.scene !== 'road') return;
    const K = WT.KEY, p = r.p;
    const busy = G.locked() || r.dying || p.swapT > 0 || p.shortT > 0 || p.sleepT > 0 || p.chargingT > 0;
    if (K.jump.includes(code)) {
      if (down) {
        if (busy) return;
        if (p.power === 'battery') { WT.Audio.play('sfx_jump_blocked'); p.landT = 0.12; return; }
        if (p.onGround) p.charge = { t: 0 };
      } else if (p.charge) {
        const k = Math.min(1, p.charge.t / P.chargeT);
        p.charge = null;
        if (!p.onGround || busy) return;
        p.vy = -P.jumpV * (1 + (P.chargeMul - 1) * k); p.onGround = false;
        WT.Audio.play(k > 0.6 ? (WT.Audio.defs.sfx_jump_big ? 'sfx_jump_big' : 'sfx_jump') : 'sfx_jump', { rate: k > 0.6 ? 0.9 : 1 });
      }
      return;
    }
    if (!down || busy) return;
    if (code === 'KeyQ') return swap();
    if (K.act.includes(code)) return act();
  };
  function swap(forced) {
    const r = R(), p = r.p;
    const to = p.power === 'wind' ? 'battery' : 'wind';
    if (to === 'battery' && r.battery <= 0) { G.toast(D().toast.noBattery); WT.Audio.play('sfx_jump_blocked'); return; }
    p.swapT = P.swapT; p.swapTo = to; p.charge = null; p.vx = 0;
    WT.Audio.play(forced ? (WT.Audio.defs.sfx_auto_swap ? 'sfx_auto_swap' : 'sfx_swap') : 'sfx_swap');
    if (!WT.Audio.defs.sfx_swap) WT.Audio.play(to === 'battery' ? 'sfx_battery_in' : 'sfx_battery_out');
  }
  function near(type, range) {
    const r = R(), p = r.p;
    return r.items.find((it) => it.type === type && Math.abs((it.type === 'bridge' ? it.post : it.x + (it.w ? it.w / 2 : 0)) - p.x) < (range || 80));
  }
  function act() {
    const r = R(), p = r.p, T = D().toast;
    const ch = near('charger', 70);
    if (ch) { p.chargingT = P.chargeTime; p.vx = 0; return; }
    const lift = r.items.find((it) => it.type === 'lift' && p.x > it.x - 30 && p.x < it.x + it.w + 30 && it.state === 0);
    const br = r.items.find((it) => it.type === 'bridge' && Math.abs(it.post - p.x) < 80 && it.state === 0);
    const dev = lift || br;
    if (!dev) return;
    if (p.power !== 'wind') { G.toast(T.onlyWind); return; }
    WT.Wind.open(() => {
      dev.state = 1;
      WT.Audio.play(dev.type === 'lift' ? (WT.Audio.defs.sfx_lift_wind ? 'sfx_lift_wind' : 'sfx_wind_complete') : (WT.Audio.defs.sfx_drawbridge ? 'sfx_drawbridge' : 'sfx_wind_complete'));
      G.toast(dev.type === 'lift' ? T.lift : T.bridge);
    }, { title: dev.type === 'lift' ? '태엽 발판 감기' : '도개교 감기', guide: '원 그리기 또는 A · D 번갈아', variant: 'self', speed: 2.6 });
  }

  // ───────── 갱신 ─────────
  function hurt(dmg) {
    const r = R(), p = r.p;
    if (p.inv > 0 || r.dying) return;
    r.hp -= dmg || 1; p.inv = P.invT; p.hurtT = 0.35;
    p.vx = -p.facing * 220; p.vy = Math.min(p.vy, -260); p.onGround = false;
    WT.Audio.play(WT.Audio.defs.sfx_spark_hit ? 'sfx_spark_hit' : 'sfx_player_hit');
    WT.UI.shake(0.2);
    if (r.hp <= 0) { WT.Audio.play('sfx_player_faint'); respawn('hp'); }
  }
  RD.update = function (dt, input) {
    const s = G.state, r = R();
    if (!r || s.scene !== 'road') return;
    const p = r.p, T = D().toast;
    r.t += dt;
    if (r.after.length && !s.ui.transition && !s.ui.story && !s.ui.dialog) { const q = r.after[0]; q.t -= dt; if (q.t <= 0) { r.after.shift(); q.fn(); if (s.road !== r) return; } }
    const locked = G.locked() || r.dying;
    // 장치
    r.items.forEach((it) => {
      if (it.type === 'gate') {
        if (it.state === 0 && p.x > it.x + 10 && p.x < it.x + it.w) { it.state = 1; it.t = 0; }
        if (it.state === 1) { it.t += dt; if (it.t > P.gateT && !it.snd) { it.snd = 1; WT.Audio.play(WT.Audio.defs.sfx_shutter_close ? 'sfx_shutter_close' : 'sfx_boss_slam', { vol: 0.4 }); } if (p.x > it.x + it.w + 30) it.state = 3; }
        if (it.state === 1 && it.t > P.gateT && p.x < it.x - 40) { it.state = 0; it.snd = 0; WT.Audio.play(WT.Audio.defs.sfx_shutter_open ? 'sfx_shutter_open' : 'sfx_door', { vol: 0.4 }); }
      }
      if (it.type === 'door') {
        const want = p.power === 'battery' && p.swapT <= 0 && Math.abs(p.x - it.x) < 150;
        if (want && !it.open) WT.Audio.play(WT.Audio.defs.sfx_door_auto ? 'sfx_door_auto' : 'sfx_door', { vol: 0.4 });
        it.open = want || (it.open && Math.abs(p.x - it.x) < 30);
        it.k = Math.max(0, Math.min(1, (it.k || 0) + (it.open ? dt : -dt) * 5));
      }
      if (it.type === 'elevator') {
        const on = p.onGround && p.x > it.x - 6 && p.x < it.x + it.w + 6 && Math.abs(p.y - (GY - it.y)) < 4;
        const up = on && p.power === 'battery' && p.swapT <= 0;
        const ny = up ? Math.min(it.h, it.y + P.elevatorV * dt) : on ? it.y : Math.max(0, it.y - P.elevatorV * dt);
        if (on) p.y -= ny - it.y;
        it.moving = ny !== it.y; it.y = ny;
      }
      if (it.type === 'lift' && it.state === 1) {
        const on = p.onGround && p.x > it.x - 6 && p.x < it.x + it.w + 6 && Math.abs(p.y - (GY - it.y)) < 4;
        const ny = Math.min(it.h, it.y + P.liftV * dt);
        if (on) p.y -= ny - it.y;
        it.y = ny; if (it.y >= it.h) it.state = 2;
      }
      if (it.type === 'bridge' && it.state === 1) { it.t += dt; if (it.t > 0.8) it.state = 2; }
    });
    if (locked) { camera(dt); return; }

    // 타이머
    if (p.inv > 0) p.inv -= dt;
    if (p.hurtT > 0) p.hurtT -= dt;
    if (p.landT > 0) p.landT -= dt;
    if (p.swapT > 0) { p.swapT -= dt; p.vx = 0; if (p.swapT <= 0) { p.power = p.swapTo; G.toast(p.power === 'battery' ? T.swapB : T.swapW); WT.Audio.play(p.power === 'battery' ? 'sfx_battery_in' : 'sfx_wind_notch', { vol: 0.4 }); } }
    if (p.shortT > 0) { p.shortT -= dt; p.vx = 0; }
    if (p.chargingT > 0) { p.chargingT -= dt; p.vx = 0; r.battery = Math.min(100, r.battery + 100 / P.chargeTime * dt); if (p.chargingT <= 0) { r.battery = 100; WT.Audio.play(WT.Audio.defs.sfx_charge_full ? 'sfx_charge_full' : 'sfx_reward_unlock'); G.toast(T.charged); } }
    if (p.sleepT > 0) { p.sleepT -= dt; if (p.sleepT <= 0) respawn('sleep'); camera(dt); return; }
    if (p.charge) p.charge.t += dt;

    // 이동
    const frozen = p.swapT > 0 || p.shortT > 0 || p.chargingT > 0;
    let dir = 0;
    if (!frozen) { if (input.held('left')) dir -= 1; if (input.held('right')) dir += 1; }
    if (p.charge && p.onGround) dir *= 0.3; // 모으는 동안은 천천히
    const speed = P.walk * (p.power === 'battery' ? P.batteryMul : 1);
    if (p.hurtT <= 0 && !frozen) p.vx = dir * speed;
    if (dir) p.facing = dir > 0 ? 1 : -1;
    p.moving = !!dir && !frozen;
    // 컨베이어
    const conv = p.onGround && r.items.find((it) => it.type === 'conveyor' && p.x > it.x && p.x < it.x + it.w);
    const extra = conv ? conv.v : 0;
    // 자원
    // 부족 경고음: 건전지 20% 아래 1초마다, 태엽 20% 아래 2초마다
    p.warnT = (p.warnT || 0) - dt;
    if (p.warnT <= 0) {
      if (p.power === 'battery' && r.battery < 20) { WT.Audio.play('sfx_battery_low'); p.warnT = 1; }
      else if (p.power === 'wind' && r.wind < 20) { WT.Audio.play('sfx_wind_low'); p.warnT = 2; }
    }
    if (p.power === 'battery') {
      r.battery = Math.max(0, r.battery - P.batteryDrain * dt * (p.moving || conv ? 1 : 0.4));
      if (r.battery <= 0 && p.swapT <= 0) { swap(true); WT.UI.dialog({ who: 'radio', name: '라디오 씨', mood: 'awake', lines: D().radio.empty }); }
    } else {
      r.wind = Math.max(0, r.wind - (p.moving ? P.windDrainMove : P.windDrainIdle) * dt);
      if (r.wind <= 0) { p.sleepT = 1.6; p.vx = 0; WT.Audio.play('sfx_player_faint'); return; }
    }
    // 가로 이동 + 충돌 (발밑 3px 이내 겹침은 바닥으로 보고 옆으로 밀지 않음)
    const S = solids();
    p.x += (p.vx + extra) * dt;
    p.x = Math.max(20, Math.min(r.L.len - 20, p.x));
    let b = box(p);
    S.forEach((q) => { if (q.top || b.y + b.h <= q.y + 3) return; if (hit(b, q)) { if (p.vx + extra > 0 || (p.x < q.x + q.w / 2)) p.x = q.x - P.pw / 2 - 0.01; else p.x = q.x + q.w + P.pw / 2 + 0.01; b = box(p); } });
    // 세로 이동 + 충돌
    const prevY = p.y;
    p.vy += P.gravity * dt; p.y += p.vy * dt;
    const wasGround = p.onGround; p.onGround = false;
    b = box(p);
    S.forEach((q) => {
      if (!hit(b, q)) return;
      if (p.vy >= 0 && prevY <= q.y + 1) { p.y = q.y; p.vy = 0; p.onGround = true; b = box(p); }
      else if (!q.top && p.vy < 0 && prevY - P.ph >= q.y + q.h - 1) { p.y = q.y + q.h + P.ph; p.vy = 0; b = box(p); }
    });
    if (p.onGround && !wasGround) { p.landT = 0.16; WT.Audio.play('sfx_land', { vol: 0.35 }); }
    // 발소리
    if (p.onGround && p.moving) { p.stepT = (p.stepT || 0) - dt; if (p.stepT <= 0) { p.stepT = p.power === 'battery' ? 0.18 : 0.28; WT.Audio.play(p.power === 'battery' ? (WT.Audio.defs.sfx_dash_step ? 'sfx_dash_step' : 'sfx_step_01') : (p.stepAlt = !p.stepAlt) ? 'sfx_step_01' : 'sfx_step_02', { vol: 0.25 }); } }
    // 위험 · 장소
    if (p.y > GY + 260) { WT.Audio.play(WT.Audio.defs.sfx_fall ? 'sfx_fall' : 'sfx_player_faint'); respawn('fall'); return; }
    r.items.forEach((it) => {
      if (it.type === 'checkpoint' && p.x > it.x - 20 && it.x !== r.checkpoint && it.x > r.checkpoint) {
        r.checkpoint = it.x; r.wind = 100; WT.Audio.play(WT.Audio.defs.sfx_wind_self ? 'sfx_wind_self' : 'sfx_wind_complete'); WT.Audio.jingle('jingle_checkpoint');
        G.toast(T.checkpoint); G.burst('note', it.x - r.camX, GY - 120, 4);
      }
      if (it.type === 'puddle' && p.onGround && p.x > it.x && p.x < it.x + it.w) {
        if (p.power === 'battery' && p.shortT <= 0 && p.inv <= 0) { p.shortT = P.shortT; WT.Audio.play(WT.Audio.defs.sfx_short_circuit ? 'sfx_short_circuit' : 'sfx_player_hit'); G.toast(T.short); hurt(1); p.vx = 0; }
        else if (p.power === 'wind' && p.moving && Math.random() < dt * 4) WT.Audio.play(WT.Audio.defs.sfx_splash ? 'sfx_splash' : 'sfx_step_02', { vol: 0.3 });
      }
      if (it.type === 'wire' && Math.abs(p.x - it.x) < 34 && p.y > GY - 30) hurt(1);
      if (it.type === 'end' && p.x > it.x && !r.cleared) clear();
    });
    camera(dt);
  };
  function camera(dt) {
    const r = R(), p = r.p;
    const want = Math.max(0, Math.min(r.L.len - WT.W, p.x - 420 + p.facing * 60));
    r.camX += (want - r.camX) * Math.min(1, dt * 5);
    const f = r.follow, back = p.x - p.facing * 80;
    f.x += (back - f.x) * Math.min(1, dt * 3); f.y = groundAt(f.x);
  }
  function groundAt(x) { const r = R(); const seg = r.L.ground.find(([a, b]) => x >= a && x <= b); return seg ? GY : GY + 60; }

  function clear() {
    const s = G.state, r = R();
    r.cleared = true;
    WT.Audio.jingle('jingle_zone_clear');
    G.toast(D().toast.clear);
    const next = r.zone + 1;
    after(1.4, () => G.irisThen(r.p.x - r.camX, r.p.y - 50, () => {
      if (next <= WT.ROAD_LEVELS.length) WT.Story.play(next === 2 ? WT.DIALOGUE.act5zone2 : WT.DIALOGUE.act5zone3, () => RD.enter(next));
      else WT.Story.play(WT.DIALOGUE.act5end, finish);
    }));
  }
  function finish() {
    const s = G.state, p = s.player;
    s.road = null; s.scene = 'town'; s.episode = 4;
    G.setScene('town'); WT.UI.setScene('town');
    p.x = WT.WORLD.npcs.radio.x - 80; p.y = WT.WORLD.npcs.radio.y + 40; p.dir = 'down'; p.power = 'wind';
    s.inventory.batteryEmpty = false;
    if (!s.house.unlocked.includes('gramophone')) s.house.unlocked.push('gramophone');
    G.toast('끝 · 마을로 돌아왔다');
  }
  RD.finish = finish;
  RD.clearNow = function () { const r = R(); if (r) { r.p.x = r.L.items.find((i) => i.type === 'end').x + 10; } };

  // ───────── 소리 ─────────
  RD.music = function (s) {
    const r = s.road;
    if (!r || s.scene !== 'road') return null;
    const p = r.p;
    const loops = {
      sfx_battery_hum: p.power === 'battery' ? 0.6 : 0,
      sfx_jump_charge: p.charge && p.charge.t > 0.12 ? 1 : 0,
      sfx_charge: p.chargingT > 0 ? 1 : 0,
      sfx_conveyor: r.items.some((it) => it.type === 'conveyor' && Math.abs(p.x - (it.x + it.w / 2)) < it.w / 2 + 200) ? 0.8 : 0,
      sfx_elevator: r.items.some((it) => it.type === 'elevator' && it.moving) ? 1 : 0
    };
    return { want: r.L.bgm, fallback: 'bgm_town_awake', thin: p.power === 'battery' ? 0.55 : 0, loops };
  };

  // ───────── 안내 · 목표 ─────────
  RD.tip = function () {
    const r = R();
    if (!r || G.locked()) return null;
    const p = r.p, T = D().tip;
    if (p.swapT > 0) return '갈아끼우는 중…';
    if (p.power === 'wind' && r.wind < 20) return '태엽이 풀려 간다 · 나팔 기둥까지 서두르자';
    if (p.power === 'battery' && r.battery < 20) return '건전지가 거의 다 됐다 · 충전소를 찾자';
    const it = r.items.find((q) => q.tip && (q.type === 'bridge' ? q.post : q.x) - p.x < 340 && (q.type === 'bridge' ? q.post : q.x) + (q.w || 0) - p.x > -30);
    return it ? T[it.tip][p.power] : null;
  };

  // ───────── 그리기 ─────────
  function tileFill(ctx, id, x, y, w, h, col, top) {
    if (WT.Assets.has(id)) {
      const tex = WT.Assets.tex(id), s = 128;
      for (let tx = x; tx < x + w; tx += s) ctx.drawImage(tex, 0, 0, tex.width || tex.naturalWidth, tex.height || tex.naturalHeight, tx, y, Math.min(s, x + w - tx), s);
      ctx.fillStyle = col; ctx.fillRect(x, y + s, w, h - s);
      return;
    }
    ctx.fillStyle = col; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = top; ctx.fillRect(x, y, w, 18);
    ctx.strokeStyle = C.outline; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.stroke();
  }
  function parallax(ctx, id, k, y, h, fallback) {
    const r = R();
    if (WT.Assets.has(id)) {
      const tex = WT.Assets.tex(id), tw = (tex.width || tex.naturalWidth) * (h / (tex.height || tex.naturalHeight));
      const off = -((r.camX * k) % tw);
      for (let x = off; x < WT.W; x += tw) ctx.drawImage(tex, x, y, tw + 1, h);
      return;
    }
    fallback(ctx, -r.camX * k);
  }
  const ZONE_COL = [
    { sky: ['#f2d3a0', '#e6c18c'], far: '#a7a77a', mid: '#8a9a6b', ground: '#9a7650', top: '#8a9a6b' },
    { sky: ['#cbb9a2', '#9d978e'], far: '#7c7a78', mid: '#6e7884', ground: '#6a6e76', top: '#8b9097' },
    { sky: ['#9ea3aa', '#7d8189'], far: '#5f636c', mid: '#4f535b', ground: '#585c64', top: '#9ba3ae' }
  ];
  RD.draw = function (ctx, t, Rn) {
    const s = G.state, r = R();
    if (!r) return;
    const Z = ZONE_COL[r.zone - 1], cam = r.camX, p = r.p;
    // 하늘 · 먼 배경 · 중간
    const g = ctx.createLinearGradient(0, 0, 0, WT.H); g.addColorStop(0, Z.sky[0]); g.addColorStop(1, Z.sky[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, WT.W, WT.H);
    parallax(ctx, r.L.bg + '_far', 0.15, 0, WT.H, (c, off) => {
      c.fillStyle = Z.far;
      for (let i = -1; i < 9; i++) { const x = ((off % 320) + 320) % 320 - 320 + i * 320; c.beginPath(); if (r.zone === 1) c.ellipse(x + 160, 470, 220, 140, 0, Math.PI, 0); else c.rect(x + 40, 260 + (i * 53 % 120), 160, 400); c.fill(); }
      if (r.zone === 3) { c.fillStyle = Z.far; c.fillRect(off * 0.3 + 2200 % 1280, 80, 18, 400); c.fillStyle = Math.sin(t * 4) > 0 ? '#e0473c' : '#7a2a25'; c.beginPath(); c.arc(off * 0.3 + 2209 % 1280, 76, 9, 0, 7); c.fill(); }
    });
    parallax(ctx, r.L.bg + '_mid', 0.45, GY - 240, 360, (c, off) => {
      c.fillStyle = Z.mid; c.strokeStyle = C.outline; c.lineWidth = 3;
      for (let i = -1; i < 12; i++) { const x = ((off % 200) + 200) % 200 - 200 + i * 200; c.beginPath(); if (r.zone === 1) c.ellipse(x + 100, GY - 20, 70, 60, 0, Math.PI, 0); else c.rect(x + 60, GY - 180 + (i % 3) * 30, 40, 200); c.fill(); c.stroke(); }
    });
    ctx.save(); ctx.translate(-Math.round(cam), 0);
    // 땅
    r.L.ground.forEach(([a, b]) => { if (b < cam - 50 || a > cam + WT.W + 50) return; tileFill(ctx, r.L.kind === 'grass' ? 'road_ground_grass' : 'road_ground_metal', a, GY, b - a, WT.H - GY, Z.ground, Z.top); ctx.strokeStyle = C.outline; ctx.lineWidth = 4; ctx.strokeRect(a, GY, b - a, WT.H - GY + 10); });
    // 장치 · 장애물
    r.items.forEach((it) => { if (it.x + (it.w || 0) < cam - 200 || it.x > cam + WT.W + 200) return; drawItem(ctx, it, t, r); });
    // 라디오 씨 (뒤따라옴)
    const f = r.follow, bb = Math.abs(Math.sin(t * 6));
    WT.drawThing(ctx, ['npc_radio_crank', 'npc_radio_idle'], PH.radio, f.x, f.y - bb * 4, { h: 100, power: 'wind', crank: true, t, flip: p.facing < 0 });
    drawBogle(ctx, t, r);
    ctx.restore();
    Rn.drawParticles();
    drawHud(ctx, t, r);
    if (p.sleepT > 0) { ctx.fillStyle = `rgba(20,14,18,${Math.min(0.6, (1.6 - p.sleepT) * 0.6)})`; ctx.fillRect(0, 0, WT.W, WT.H); }
  };
  function drawItem(ctx, it, t, r) {
    const A = WT.Assets;
    const blk = (x, y, w, h, col) => { ctx.fillStyle = col; ctx.strokeStyle = C.outline; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(x, y, w, h, 6); ctx.fill(); ctx.stroke(); };
    switch (it.type) {
      case 'checkpoint': {
        const on = r.checkpoint >= it.x;
        WT.drawThing(ctx, 'road_wind_post', (c) => { c.fillStyle = C.wood; c.strokeStyle = C.outline; c.lineWidth = 4; c.fillRect(-6, -100, 12, 100); c.strokeRect(-6, -100, 12, 100); c.fillStyle = on ? C.yellow : '#b8a888'; c.beginPath(); c.moveTo(-4, -96); c.lineTo(-28, -140); c.quadraticCurveTo(0, -150, 28, -140); c.lineTo(4, -96); c.closePath(); c.fill(); c.stroke(); }, it.x, GY, { h: 110 });
        if (on && Math.sin(t * 3 + it.x) > 0.6) WT.drawThing(ctx, ['fx_note_01', 'fx_note_02'], PH.note, it.x + 14, GY - 150 - (t * 30 % 30), { h: 28, anchor: 'center' });
        break;
      }
      case 'charger': WT.drawThing(ctx, 'road_charger', (c) => { blk(-20, -120, 40, 120, '#9ba3ae'); c.fillStyle = Math.sin(t * 5) > 0 ? '#e07a3a' : '#a0522d'; c.beginPath(); c.arc(0, -132, 9, 0, 7); c.fill(); c.stroke(); c.strokeStyle = '#3a3f48'; c.lineWidth = 4; c.beginPath(); c.moveTo(16, -70); c.quadraticCurveTo(40, -40, 24, -20); c.stroke(); }, it.x, GY, { h: 130 }); break;
      case 'bush': { const h = it.tall ? 150 : 90; WT.drawThing(ctx, 'road_bush_tall', PH.bush, it.x, GY, { h, sx: it.tall ? 0.9 : 1.1 }); break; }
      case 'ledge': blk(it.x, GY - it.h, it.w, it.h + 10, r.L.kind === 'grass' ? '#a38057' : '#7a7f88'); ctx.fillStyle = r.L.kind === 'grass' ? '#8a9a6b' : '#9ba3ae'; ctx.fillRect(it.x + 2, GY - it.h + 2, it.w - 4, 14); break;
      case 'gate': {
        // 셔터 터널: 철골 건물 + 안쪽 그늘
        ctx.fillStyle = 'rgba(40,40,48,.45)'; ctx.fillRect(it.x, GY - 150, it.w + 24, 150);
        blk(it.x - 4, 120, it.w + 32, GY - 150 - 120, '#7a7f88');
        ctx.fillStyle = '#5c6470'; ctx.fillRect(it.x - 2, GY - 168, it.w + 28, 16);
        ctx.fillStyle = '#e07a3a'; for (let x = it.x + 6; x < it.x + it.w + 20; x += 36) { ctx.beginPath(); ctx.moveTo(x, GY - 168); ctx.lineTo(x + 16, GY - 168); ctx.lineTo(x + 4, GY - 152); ctx.lineTo(x - 12, GY - 152); ctx.closePath(); ctx.fill(); }
        for (let y = 150; y < GY - 200; y += 70) for (let x = it.x + 24; x < it.x + it.w; x += 80) { ctx.fillStyle = '#4a505a'; ctx.strokeStyle = C.outline; ctx.lineWidth = 3; ctx.fillRect(x, y, 40, 34); ctx.strokeRect(x, y, 40, 34); }
        ctx.fillStyle = '#5c6470'; ctx.strokeStyle = C.outline; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(it.x - 14, 124); ctx.lineTo(it.x + it.w / 2 + 12, 70); ctx.lineTo(it.x + it.w + 38, 124); ctx.closePath(); ctx.fill(); ctx.stroke();
        const k = it.state === 1 ? Math.min(1, Math.max(0, (it.t - P.gateT + 0.25) / 0.25)) : it.state === 2 ? 1 : 0;
        if (A.has('road_shutter_closed') && k > 0.98) WT.drawThing(ctx, 'road_shutter_closed', null, it.x + it.w + 12, GY, { h: 150 });
        else { blk(it.x + it.w, GY - 150, 24, 150 * k + 4, '#9ba3ae'); }
        if (it.state === 1 && k < 1) { const left = Math.max(0, P.gateT - it.t); ctx.fillStyle = '#e07a3a'; ctx.fillRect(it.x, GY - 160, it.w * (left / P.gateT), 6); }
        break;
      }
      case 'conveyor': {
        if (A.has('road_conveyor')) { for (let x = it.x; x < it.x + it.w; x += 80) WT.drawThing(ctx, 'road_conveyor', null, x + 40, GY + 6, { h: 40 }); }
        else { blk(it.x, GY - 4, it.w, 22, '#4a505a'); ctx.strokeStyle = '#9ba3ae'; ctx.lineWidth = 3; const o = (t * 270) % 30; for (let x = it.x + 30 - o; x < it.x + it.w; x += 30) { ctx.beginPath(); ctx.moveTo(x, GY); ctx.lineTo(x - 10, GY + 14); ctx.stroke(); } }
        break;
      }
      case 'puddle': WT.drawThing(ctx, 'road_puddle', (c) => { c.fillStyle = '#7fa6c8'; c.strokeStyle = C.outline; c.lineWidth = 3; c.beginPath(); c.ellipse(0, -4, it.w / 2, 9, 0, 0, 7); c.fill(); c.stroke(); c.strokeStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.ellipse(-it.w / 6, -6, 14 + Math.sin(t * 3) * 4, 3, 0, 0, 7); c.stroke(); }, it.x + it.w / 2, GY + 6, { h: 24, sx: it.w / 170 }); break;
      case 'door': {
        const k = it.k || 0;
        blk(it.x - 14, -10, 28, GY - 180 + 10, '#6e7884');
        blk(it.x - 12, GY - 180, 24 * (1 - k) + 2, 180, '#9ba3ae');
        ctx.fillStyle = it.open ? '#e07a3a' : '#a0522d'; ctx.beginPath(); ctx.arc(it.x, GY - 190, 7, 0, 7); ctx.fill(); ctx.stroke();
        break;
      }
      case 'elevator': case 'lift': {
        const y = GY - it.y, isLift = it.type === 'lift';
        ctx.strokeStyle = isLift ? '#c99a3a' : '#6e7884'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(it.x + 6, GY); ctx.lineTo(it.x + 6, GY - it.h - 20); ctx.moveTo(it.x + it.w - 6, GY); ctx.lineTo(it.x + it.w - 6, GY - it.h - 20); ctx.stroke();
        blk(it.x, y, it.w, 18, isLift ? C.wood : '#9ba3ae');
        if (isLift) { ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(it.x + it.w / 2, y + 30, 12, 0, 7); ctx.fill(); ctx.stroke(); if (it.state === 0 && Math.sin(t * 4) > 0) WT.drawThing(ctx, 'fx_sparkle', PH.sparkle, it.x + it.w / 2 + 18, y + 10, { h: 22, anchor: 'center' }); }
        else { ctx.fillStyle = it.moving ? '#e07a3a' : '#a0522d'; ctx.beginPath(); ctx.arc(it.x + it.w - 14, y + 9, 5, 0, 7); ctx.fill(); }
        break;
      }
      case 'bridge': {
        // 기둥(감는 곳)
        blk(it.post - 8, GY - 90, 16, 90, C.wood); ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(it.post, GY - 60, 10, 0, 7); ctx.fill(); ctx.stroke();
        const ang = it.state === 2 ? 0 : it.state === 1 ? (1 - Math.min(1, it.t / 0.8)) * 1.3 : 1.3;
        ctx.save(); ctx.translate(it.x + it.w, GY); ctx.rotate(ang);
        if (!WT.drawThing(ctx, 'road_drawbridge', null, -it.w / 2, 24, { h: 36, sx: it.w / 300 })) blk(-it.w, 0, it.w, 22, C.wood);
        ctx.restore();
        ctx.strokeStyle = '#555'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(it.x + it.w, GY - 200); ctx.lineTo(it.x + it.w - Math.cos(ang) * it.w, GY - Math.sin(ang) * it.w); ctx.stroke();
        break;
      }
      case 'wire': {
        WT.drawThing(ctx, 'road_spark_wire', (c) => { c.strokeStyle = '#3a3f48'; c.lineWidth = 7; c.beginPath(); c.moveTo(-40, 0); c.quadraticCurveTo(-10, -18, 20, -10); c.stroke(); }, it.x, GY, { h: 40 });
        if (Math.random() < 0.5) WT.drawThing(ctx, 'fx_static', PH.static, it.x + 18 + (Math.random() - 0.5) * 20, GY - 20 - Math.random() * 20, { h: 34, anchor: 'center' });
        break;
      }
      case 'end': {
        ctx.fillStyle = C.cream; ctx.strokeStyle = C.outline; ctx.lineWidth = 4; ctx.fillRect(it.x, GY - 170, 10, 170); ctx.strokeRect(it.x, GY - 170, 10, 170);
        ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(it.x + 10, GY - 168); ctx.lineTo(it.x + 70, GY - 150 + Math.sin(t * 4) * 4); ctx.lineTo(it.x + 10, GY - 130); ctx.closePath(); ctx.fill(); ctx.stroke();
        break;
      }
    }
  }
  function drawBogle(ctx, t, r) {
    const p = r.p, bat = p.power === 'battery';
    let ids, pose = 'idle';
    if (p.sleepT > 0) { ids = ['player_hurt_side', 'player_idle_side']; pose = 'idle'; }
    else if (p.swapT > 0) { ids = ['player_swap', 'player_interact', 'player_idle_side']; pose = 'interact'; }
    else if (p.shortT > 0) { ids = ['player_short', 'player_idle_side']; }
    else if (p.chargingT > 0) { ids = ['player_charge', 'player_idle_side']; }
    else if (p.hurtT > 0) { ids = ['player_hurt_side', 'player_jump_side', 'player_idle_side']; pose = 'jump'; }
    else if (!p.onGround) { ids = ['player_jump_side', 'player_jump']; pose = 'jump'; }
    else if (p.moving) {
      pose = 'walk';
      ids = bat ? [Math.floor(t * 10) % 2 ? 'player_dash_side_02' : 'player_dash_side_01', 'player_dash_side_01', 'player_walk_side_01', 'player_idle_side']
        : [`player_run_side_0${Math.floor(t * 10) % 4 + 1}`, 'player_run_side_01', Math.floor(t * 8) % 2 ? 'player_walk_side_02' : 'player_walk_side_01', 'player_idle_side'];
    } else ids = ['player_idle_side'];
    let sx = 1, sy = 1, bob = 0, rot = 0;
    if (!bat) {
      if (p.moving && p.onGround) { bob = Math.abs(Math.sin(t * 13)) * 7; sy = 1 + Math.abs(Math.sin(t * 13)) * 0.05; sx = 2 - sy; rot = Math.sin(t * 13) * 0.06; }
      if (p.charge) { const k = Math.min(1, p.charge.t / P.chargeT); sy = 1 - k * 0.22; sx = 1 + k * 0.16; }
      if (!p.onGround) { sy = 1.08; sx = 0.94; }
    } else if (p.moving) rot = 0.08 * p.facing;
    if (p.landT > 0) { sy *= 0.88; sx *= 1.1; }
    if (p.inv > 0 && Math.floor(t * 20) % 2) return;
    WT.Render.shadow(p.x, groundAt(p.x), 50, p.onGround ? 0.3 : 0.15);
    if (bat || p.sleepT > 0) { ctx.save(); ctx.filter = bat ? 'grayscale(1) contrast(1.05) brightness(1.04)' : 'grayscale(.6) brightness(.85)'; }
    WT.drawThing(ctx, ids, PH.bogle, p.x, p.y - bob, { h: 110, flip: p.facing < 0, sx, sy, rot, pose, dir: 'side', t });
    if (bat && !WT.Assets.has('player_dash_side_01')) WT.drawThing(ctx, 'prop_battery_pack', PH.batteryPack, p.x - p.facing * 38, p.y - 60, { h: 38, anchor: 'center' });
    if (bat || p.sleepT > 0) ctx.restore();
    if (p.swapT > 0) { const k = 1 - p.swapT / P.swapT; ctx.save(); ctx.strokeStyle = C.yellow; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(p.x, p.y - 140, 18, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); ctx.stroke(); ctx.restore(); }
    if (p.shortT > 0 && Math.random() < 0.6) WT.drawThing(ctx, 'fx_static', PH.static, p.x + (Math.random() - 0.5) * 50, p.y - 50 - Math.random() * 50, { h: 30, anchor: 'center' });
    if (p.charge && p.charge.t > 0.1) { const k = Math.min(1, p.charge.t / P.chargeT); ctx.save(); ctx.fillStyle = k >= 1 ? C.yellow : C.cream; ctx.fillRect(p.x - 30, p.y + 10, 60 * k, 6); ctx.restore(); }
  }
  function gauge(ctx, x, y, w, k, col, label, icon, ph, active) {
    ctx.save();
    ctx.globalAlpha = active ? 1 : 0.6;
    ctx.fillStyle = 'rgba(43,34,48,.88)'; ctx.strokeStyle = active ? C.yellow : C.cream; ctx.lineWidth = active ? 4 : 2;
    ctx.beginPath(); ctx.roundRect(x, y, w, 50, 14); ctx.fill(); ctx.stroke();
    WT.drawThing(ctx, icon, ph, x + 25, y + 25, { h: 34, anchor: 'center' });
    ctx.font = '16px "Do Hyeon", sans-serif'; ctx.fillStyle = C.cream; ctx.textBaseline = 'middle'; ctx.fillText(label, x + 48, y + 15);
    ctx.fillStyle = '#3a2d36'; ctx.beginPath(); ctx.roundRect(x + 48, y + 27, w - 62, 12, 6); ctx.fill();
    ctx.fillStyle = k < 0.2 ? '#e07a3a' : col; ctx.beginPath(); ctx.roundRect(x + 48, y + 27, (w - 62) * Math.max(0, k), 12, 6); ctx.fill();
    ctx.restore();
  }
  function drawHud(ctx, t, r) {
    const p = r.p;
    ctx.save();
    ctx.font = '24px "Do Hyeon", sans-serif'; ctx.textBaseline = 'middle';
    const name = D().zoneName[r.zone - 1], w = ctx.measureText(name).width + 40;
    ctx.fillStyle = 'rgba(244,230,200,.94)'; ctx.strokeStyle = C.outline; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.roundRect(20, 18, w, 48, 14); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.outline; ctx.fillText(name, 40, 43);
    // 진행 막대
    ctx.fillStyle = 'rgba(43,34,48,.6)'; ctx.fillRect(40 + w, 38, 200, 8);
    ctx.fillStyle = C.yellow; ctx.fillRect(40 + w, 38, 200 * Math.min(1, p.x / r.L.len), 8);
    ctx.restore();
    const icW = (c) => PH.key(c, 30, {}), icB = (c, h) => PH.battery(c, h);
    gauge(ctx, 20, 76, 220, r.wind / 100, C.yellow, '태엽', 'ui_icon_wind', (c) => { c.translate(0, 14); icW(c); }, p.power === 'wind');
    gauge(ctx, 250, 76, 220, r.battery / 100, '#e8edf2', '건전지', 'ui_icon_battery', (c) => { c.translate(0, 16); icB(c, 30); }, p.power === 'battery');
    // 체력(태엽 3칸)
    for (let i = 0; i < 3; i++) { ctx.save(); ctx.globalAlpha = i < r.hp ? 1 : 0.25; WT.drawThing(ctx, 'prop_key', PH.key, 500 + i * 30, 116, { h: 32 }); ctx.restore(); }
    // 모드 표시 + Q
    ctx.save(); ctx.font = '20px "Do Hyeon", sans-serif'; ctx.textBaseline = 'middle';
    const label = p.power === 'battery' ? '건전지 모드 · Q 태엽으로' : '태엽 모드 · Q 건전지로';
    const lw = ctx.measureText(label).width + 30;
    ctx.fillStyle = p.power === 'battery' ? 'rgba(155,163,174,.95)' : 'rgba(242,193,78,.95)'; ctx.strokeStyle = C.outline; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(WT.W - lw - 20, 60, lw, 36, 18); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.outline; ctx.fillText(label, WT.W - lw - 5, 79);
    ctx.restore();
  }
})();
