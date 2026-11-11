// 아레나 보스 (횡스크롤 엔진 위). 4막 중간 보스 두꺼비집 문지기, 5막 최종 보스 볼트 남작.
// 규칙: 공격마다 맞는 모드가 정해져 있다(태엽=점프, 건전지=속도). 과열 때 약점(레버·플러그)을 E로.
// 기획: GAME_DESIGN.md 19-2, 20절.
(function () {
  const G = WT.Game, C = WT.C, PH = WT.PH, GY = WT.ROAD_GY;
  const RB = WT.RoadBoss = {};
  const D = () => WT.DIALOGUE;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const say = (who, name, lines, onClose, mood) => WT.UI.dialog({ who, name, mood: mood || 'awake', lines, onClose });

  // 돌진 라운드: 과열 폭발로 약점에서 정확히 RUSH_DIST만큼 떨어진 자리로 밀려나고(경직 RUSH_STUN),
  // 경직이 풀린 뒤 RUSH_WINDOW초 안에 약점까지 가야 한다.
  // 거리 540px → 건전지(368px/초) 1.47초 ✓ 여유 0.6초 / 태엽(230px/초) 2.35초 ✗ → Q로 바꾸면 시간이 멈추니 손해 없음.
  const RUSH_DIST = 540, RUSH_STUN = 0.35, RUSH_WINDOW = 2.05;
  // 보스 정의
  const DEF = {
    toad: {
      name: '두꺼비집 문지기', x: 1060, wall: 930, h: 230, bgm: 'bgm_toad_boss',
      rounds: [
        { queue: ['tongue', 'floor', 'tongue'], weak: 'high' },
        { queue: ['floor', 'tongue', 'floor', 'tongue'], weak: 'rush' }
      ],
      weakPos: { high: { x: 990, y: GY - 210 }, rush: { x: 970, y: GY - 40 } },
      overT: { high: 5, rush: RUSH_STUN + RUSH_WINDOW }
    },
    volt: {
      name: '볼트 남작', x: 1090, wall: 950, h: 300, bgm: 'bgm_volt_boss',
      rounds: [
        { queue: ['floor', 'bombs', 'floorSeq'], weak: 'high', jam: true },
        { queue: ['magnet', 'strike', 'coolant', 'magnet'], weak: 'rush', jam: true },
        { queue: ['floor', 'magnet', 'strike', 'coolant', 'bombs'], weak: 'final', final: true }
      ],
      weakPos: { high: { x: 930, y: GY - 285 }, rush: { x: 925, y: GY - 45 }, final: { x: 925, y: GY - 150 } },
      overT: { high: 6, rush: RUSH_STUN + RUSH_WINDOW, final: 7 }
    }
  };
  const ATK_T = { floor: 1.9, floorSeq: 2.8, magnet: 3.6, bombs: 3.4, strike: 3.4, coolant: 4.4, tongue: 3.6 };

  RB.init = function (r) {
    const k = r.L.boss, d = DEF[k];
    r.boss = { kind: k, d, x: d.x, state: 'intro', round: 0, queue: [], atk: null, t: 0, gap: 0, hits: 0,
      reborn: false, collapsed: false, jamT: 0, shake: 0, haz: { floor: null, seq: null, bombs: [], strikes: [], puddles: [], magnet: 0 } };
    const T = d === DEF.toad ? D().act4 : D().act5;
    WT.Road.after(0.8, () => {
      if (k === 'toad') {
        say('radio', '라디오 씨', D().act4.radio.toad, () => say('toad', d.name, T.toad.intro, () => start(r), 'angry'), 'battery');
      } else {
        WT.Audio.play('sfx_volt_laugh');
        say('volt', d.name, T.volt.intro, () => say('radio', '라디오 씨', T.radio.intro, () => start(r), 'battery'), 'angry');
      }
    });
  };
  function start(r) { const b = r.boss; b.state = 'attack'; b.queue = b.d.rounds[b.round].queue.slice(); b.gap = 0.6; }
  RB.startNow = function (r) { r.after = []; start(r); }; // 점검용: 소개 대사 없이 바로 전투
  RB.onRespawn = function (r) {
    const b = r.boss;
    if (!b || b.state === 'intro' || b.state === 'collapse' || b.state === 'small') return;
    clearHaz(b); b.state = 'attack'; b.queue = b.d.rounds[b.round].queue.slice(); b.atk = null; b.gap = 1.2;
  };
  function clearHaz(b) { b.haz = { floor: null, seq: null, bombs: [], strikes: [], puddles: [], magnet: 0 }; }

  // ───────── 공격 ─────────
  function begin(r, type) {
    const b = r.boss, p = r.p, H = b.haz, A = WT.Audio;
    b.atk = { type, t: 0, dur: ATK_T[type] };
    switch (type) {
      case 'floor': H.floor = { t: 0 }; A.play(b.kind === 'toad' ? 'sfx_toad_croak' : 'sfx_floor_charge'); break;
      case 'floorSeq': H.seq = { t: 0 }; A.play('sfx_floor_charge'); break;
      case 'magnet': case 'tongue': H.magnet = 0.001; A.play(type === 'tongue' ? 'sfx_toad_tongue' : 'sfx_magnet_loop'); break;
      case 'bombs': H.bombs = [0, 1.1].map((d) => ({ x: b.d.wall - 40, d, live: false, rot: 0 })); break;
      case 'strike': H.strikes = [0, 0.75, 1.5, 2.25].map((d) => ({ d, sx: null, warn: 0, done: false })); break;
      case 'coolant': H.puddles = [0, 1, 2].map((i) => ({ x: 150 + i * 260 + rnd(-40, 40), w: 140, t: 0 })); A.play('sfx_coolant_spray'); break;
    }
    void p;
  }
  function inNotes(r, x) { return r.boss.reborn && x < 260; }
  function onFloor(p) { return p.onGround && p.y >= GY - 2; }
  function hazards(dt, r) {
    const b = r.boss, H = b.haz, p = r.p, A = WT.Audio, hurt = WT.Road.hurt;
    if (H.floor) {
      H.floor.t += dt;
      if (H.floor.t > 1.0 && !H.floor.z) { H.floor.z = 1; A.play('sfx_floor_zap'); WT.UI.shake(0.12); }
      if (H.floor.t > 1.0 && H.floor.t < 1.5 && onFloor(p) && p.x < b.d.wall) hurt(1);
      if (H.floor.t > 1.6) H.floor = null;
    }
    if (H.seq) {
      H.seq.t += dt;
      for (let i = 0; i < 4; i++) {
        const t0 = i * 0.5 + 0.8, x0 = i * 237;
        if (H.seq.t > t0 && H.seq.t < t0 + 0.4) { if (!H.seq['z' + i]) { H.seq['z' + i] = 1; A.play('sfx_floor_zap', { vol: 0.35 }); } if (onFloor(p) && p.x >= x0 && p.x < x0 + 237) hurt(1); }
      }
      if (H.seq.t > 3.0) H.seq = null;
    }
    if (H.magnet) {
      H.magnet += dt;
      if (H.magnet > 3.4) H.magnet = 0;
      else if (H.magnet > 0.4 && p.x + 22 >= b.d.wall - 4) { hurt(1); }
    }
    H.bombs.forEach((q) => {
      if (q.dead) return;
      q.d -= dt;
      if (q.d > 0) return;
      if (!q.live) { q.live = true; A.play('sfx_bomb_roll'); }
      q.x -= 330 * dt; q.rot -= dt * 9;
      if (Math.abs(p.x - q.x) < 32 && p.y > GY - 48) { hurt(1); q.dead = true; A.play('sfx_bomb_boom'); G.burst('dust', q.x - r.camX, GY, 2); }
      if (q.x < 30) { q.dead = true; A.play('sfx_bomb_boom', { vol: 0.3 }); }
    });
    H.strikes.forEach((q) => {
      if (q.done) return;
      q.d -= dt;
      if (q.d > 0) return;
      if (q.sx == null) { q.sx = p.x; A.play('sfx_lightning_warn'); }
      q.warn += dt;
      if (q.warn > 0.45 && !q.hit) { q.hit = true; A.play('sfx_lightning_strike'); WT.UI.shake(0.1); if (Math.abs(p.x - q.sx) < 50 && !inNotes(r, q.sx)) hurt(1); }
      if (q.warn > 0.65) q.done = true;
    });
    H.puddles.forEach((q) => {
      q.t += dt;
      if (q.t > 0.4 && q.t < 4.2 && p.power === 'battery' && onFloor(p) && p.x > q.x && p.x < q.x + q.w && p.shortT <= 0 && p.inv <= 0) {
        p.shortT = WT.Road.P.shortT; A.play('sfx_short_circuit'); G.toast(D().act5.toast.short); hurt(1);
      }
    });
    H.puddles = H.puddles.filter((q) => q.t < 4.4);
  }
  RB.force = function (r) { const b = r.boss; return b && b.haz.magnet > 0.4 && b.haz.magnet < 3.4 ? 300 : 0; };

  // ───────── 약점 ─────────
  function overheat(r) {
    const b = r.boss, rd = b.d.rounds[b.round], p = r.p, A = WT.Audio;
    b.state = 'over'; b.t = 0; b.weak = rd.weak; b.atk = null; clearHaz(b);
    A.play(b.kind === 'toad' ? 'sfx_boss_tired' : 'sfx_volt_overheat');
    G.toast(D().act5.toast.overheat);
    if (b.weak === 'rush') { // 과열 폭발로 밀려남: 어디 있었든 항상 같은 자리(약점에서 RUSH_DIST)로
      const reachX = b.d.weakPos.rush.x - 25;
      G.burst('dust', p.x - r.camX, p.y, 2);
      p.x = reachX - RUSH_DIST; p.vx = 0; p.vy = -260; p.onGround = false; p.hurtT = RUSH_STUN; p.charge = null;
      WT.UI.shake(0.2);
    }
    if (rd.jam && !b.reborn) { // 라디오 씨가 잡음으로 회로를 붙잡음 — 건전지가 준다
      b.jamT = 1.5; r.radioBat = Math.max(0, r.radioBat - 20);
      A.play('sfx_radio_jam_beam');
      WT.Road.after(0.1, () => G.toast(D().act5.radio.jam[0]));
    }
  }
  function weakReach(r) {
    const b = r.boss, p = r.p, w = b.d.weakPos[b.weak];
    if (!w || b.state !== 'over') return false;
    if (b.weak === 'high') return Math.abs(p.x - w.x) < 120 && p.y < GY - (b.kind === 'toad' ? 150 : 220);
    if (b.weak === 'rush') return p.x > w.x - 25 && onFloor(p); // 밀려난 자리에서 2초 남짓 안에 달려와야 닿는 거리
    return Math.abs(p.x - w.x) < 90;
  }
  RB.act = function (r) {
    const b = r.boss;
    if (!b || b.state !== 'over') return false;
    if (!weakReach(r)) { G.toast(b.weak === 'high' ? '더 높이! 발판에서 E' : '더 가까이!'); return true; }
    if (b.kind === 'volt' && b.weak === 'final' && b.plugged === false) { crank(r); return true; }
    hitWeak(r);
    return true;
  };
  function hitWeak(r) {
    const b = r.boss, A = WT.Audio, w = b.d.weakPos[b.weak];
    b.state = 'hurt'; b.t = 0; b.hits++;
    A.play(b.kind === 'toad' ? 'sfx_breaker' : 'sfx_plug_pull');
    WT.UI.flash(); WT.UI.shake(0.25);
    G.burst('spring', w.x - r.camX, w.y, 1); G.burst('sparkle', w.x - r.camX, w.y, 8);
    G.toast(b.kind === 'toad' ? D().act5.toast.lever : D().act5.toast.plug);
  }
  function crank(r) {
    const b = r.boss;
    WT.Wind.open(() => smallVolt(r), {
      title: '녹슨 크랭크 과감기', guide: '남작 몸속의 크랭크를 감자! 원 그리기 또는 A · D 번갈아',
      timeLimit: 8, resist: 0.07, variant: 'volt', keyImg: 'wind_crank', ratchet: 'sfx_crank_rusty',
      notch: ['끼익…', '끼이익!', '돌아간다!'],
      onFail: () => { b.state = 'recover'; b.t = 0; G.toast(D().act5.toast.missed); }
    });
  }
  function smallVolt(r) {
    const b = r.boss;
    b.state = 'small'; b.t = 0;
    WT.Audio.jingle('jingle_volt_defeat'); WT.Audio.play('sfx_volt_shrink');
    WT.UI.flash();
    WT.Road.after(1.4, () => say('voltSmall', '작은 발전기', D().act5.volt.small, () => WT.Road.bossDone('volt')));
  }
  // 라디오 씨가 쓰러지고 그라모의 열쇠로 다시 태어난다
  function collapse(r) {
    const b = r.boss, T = D().act5;
    b.state = 'collapse'; b.collapsed = true; clearHaz(b);
    WT.Audio.play('sfx_radio_collapse');
    const afterStory = () => WT.Road.after(0.4, () => {
      WT.Audio.play('sfx_volt_laugh');
      say('volt', b.d.name, T.volt.collapse, () => say('bogle', '보글', T.bogle.key, () => insertKey(r)), 'angry');
    });
    WT.Road.after(0.6, () => say('radio', '라디오 씨', T.radio.last, () => WT.Story.play(D().act5collapse, afterStory), 'battery'));
  }
  function insertKey(r) {
    const b = r.boss, T = D().act5;
    WT.Wind.open(() => {
      b.reborn = true; G.state.inventory.gramoKey = false;
      WT.Audio.jingle('jingle_radio_reborn'); WT.Audio.play('sfx_reborn_horn');
      WT.Story.play(D().act5reborn, () => WT.Road.after(0.4, () =>
        say('radio', '라디오 씨', T.radio.reborn, () => say('volt', b.d.name, T.volt.reborn, () => {
          b.round = 2; b.plugged = true; r.wind = 100; start(r);
        }, 'angry'))));
    }, { title: '그라모의 열쇠', guide: '라디오 씨 등에 열쇠를 꽂고 감자 · 원 그리기 또는 A · D 번갈아', variant: 'radio', back: 'wind_radio_back', notch: ['딸깍…', '지지… 직…', '♪'] });
  }

  RB.update = function (dt, r) {
    const b = r.boss;
    if (!b) return;
    b.t += dt;
    if (b.jamT > 0) b.jamT -= dt;
    if (b.reborn && r.p.x < 260) r.wind = Math.min(100, r.wind + 25 * dt); // 음표 안전지대: 태엽이 찬다
    if (b.state === 'attack') {
      hazards(dt, r);
      if (b.atk) { b.atk.t += dt; if (b.atk.t >= b.atk.dur) { b.atk = null; b.gap = 0.8; } }
      else if ((b.gap -= dt) <= 0) {
        if (b.queue.length) begin(r, b.queue.shift());
        else overheat(r);
      }
    } else if (b.state === 'over') {
      if (b.t > b.d.overT[b.weak]) { b.state = 'recover'; b.t = 0; G.toast(D().act5.toast.missed); }
    } else if (b.state === 'recover') {
      if (b.t > 1.0) start(r);
    } else if (b.state === 'hurt') {
      if (b.t > 1.3) {
        const last = b.round >= b.d.rounds.length - 1;
        if (b.kind === 'volt' && b.weak === 'final') { b.plugged = false; b.state = 'over'; b.t = -4; G.toast(D().act5.radio.final[0]); return; } // 크랭크가 드러남 → E
        if (b.kind === 'volt' && b.round === 1 && !b.reborn) { collapse(r); return; }
        if (last) {
          b.state = 'down'; b.t = 0;
          WT.Audio.jingle('jingle_toad_defeat');
          WT.Road.after(1.2, () => say('toad', b.d.name, D().act4.toad.down, () => WT.Road.bossDone('toad'), 'angry'));
          return;
        }
        b.round++; start(r);
      }
    }
  };
  // 남작 몸·문지기 몸은 벽. 셔터는 돌진 라운드 과열 때만 열림. 문지기 입은 돌진 라운드에 열림.
  RB.solids = function (r, out) {
    const b = r.boss;
    const wall = b.kind === 'toad' && b.state === 'over' && b.weak === 'rush' ? b.d.wall + 80 : b.d.wall;
    out.push({ x: wall, y: -400, w: 1400 - wall, h: GY + 400 }); // 보스 몸
  };
  RB.music = function (r) {
    const b = r.boss;
    const want = b.kind === 'toad' ? 'bgm_toad_boss' : b.reborn ? 'bgm_volt_final' : 'bgm_volt_boss';
    return { want: b.state === 'intro' || b.state === 'small' || b.state === 'down' || b.state === 'collapse' ? null : want, fallback: 'bgm_boss',
      loops: { sfx_magnet_loop: b.haz.magnet > 0.3 ? 1 : 0, sfx_bomb_roll: b.haz.bombs.some((q) => q.live && !q.dead) ? 1 : 0 } };
  };
  RB.tip = function (r) {
    const b = r.boss, p = r.p, T = D().act5.atk;
    if (!b) return null;
    const needB = (b.atk && (b.atk.type === 'magnet' || b.atk.type === 'tongue')) || (b.state === 'over' && b.weak === 'rush');
    if (r.battery < 15 && (needB || b.state === 'attack')) return '건전지가 거의 없다 · 왼쪽 충전소에서 E';
    if (b.state === 'over') { if (b.kind === 'volt' && b.plugged === false) return 'E : 녹슨 크랭크 과감기!'; return T[b.weak][p.power]; }
    if (b.state === 'attack' && b.atk) return T[b.atk.type === 'tongue' ? 'magnet' : b.atk.type][p.power];
    return null;
  };

  // ───────── 그리기 ─────────
  RB.draw = function (ctx, t, r) {
    const b = r.boss, H = b.haz, p = r.p;
    // 바닥 방전
    const glow = (x0, x1, k, zap) => { ctx.save(); ctx.globalAlpha = zap ? 0.9 : 0.25 + 0.35 * Math.abs(Math.sin(t * 18)) * k; ctx.fillStyle = zap ? '#fff3a8' : C.yellow; ctx.fillRect(x0, GY - 8, x1 - x0, 14); if (zap) for (let x = x0 + 10; x < x1; x += 60) WT.drawThing(ctx, 'fx_spark_floor', PH.static, x + 30, GY - 10, { h: 40, anchor: 'center' }); ctx.restore(); };
    if (H.floor) glow(0, b.d.wall, Math.min(1, H.floor.t), H.floor.t > 1.0 && H.floor.t < 1.5);
    if (H.seq) for (let i = 0; i < 4; i++) { const t0 = i * 0.5 + 0.8, k = H.seq.t - (t0 - 0.8); if (k > 0 && H.seq.t < t0 + 0.4) glow(i * 237, i * 237 + 237, Math.min(1, k), H.seq.t > t0); }
    // 물웅덩이
    H.puddles.forEach((q) => WT.drawThing(ctx, 'fx_coolant', (c) => { c.fillStyle = '#8fc1e0'; c.strokeStyle = C.outline; c.lineWidth = 3; c.beginPath(); c.ellipse(0, -4, 70, 9, 0, 0, 7); c.fill(); c.stroke(); }, q.x + q.w / 2, GY + 6, { h: 24, sx: q.w / 140, alpha: Math.min(1, q.t * 3) * (q.t > 3.8 ? (4.4 - q.t) / 0.6 : 1) }));
    // 돌진 라운드: 약점이 닫히기까지 남은 시간
    if (b.state === 'over' && b.weak === 'rush') {
      const left = Math.min(1, Math.max(0, b.d.overT.rush - b.t) / RUSH_WINDOW);
      ctx.save(); ctx.fillStyle = 'rgba(43,34,48,.8)'; ctx.fillRect(b.d.wall - 200, GY - 250, 200, 12); ctx.fillStyle = '#e07a3a'; ctx.fillRect(b.d.wall - 200, GY - 250, 200 * left, 12); ctx.restore();
    }
    // 보스
    const ids = bossIds(b);
    const shake = b.state === 'hurt' ? Math.sin(t * 50) * 6 : 0, bob = b.state === 'attack' ? Math.abs(Math.sin(t * 3)) * 4 : 0;
    const ph = b.kind === 'toad' ? PH.toad : PH.volt;
    WT.Render.shadow(b.x, GY, b.kind === 'toad' ? 260 : 300, 0.3);
    WT.drawThing(ctx, ids, ph, b.x + shake, GY - bob, { h: b.state === 'small' ? 120 : b.d.h, t, state: b.state, atk: b.atk && b.atk.type, weak: b.weak, plugged: b.plugged });
    // 자석 끌림
    if (H.magnet > 0.3) for (let i = 0; i < 3; i++) { const k = ((t * 1.6 + i / 3) % 1); WT.drawThing(ctx, 'fx_magnet_wave', (c) => { c.strokeStyle = '#d2463c'; c.lineWidth = 5; c.beginPath(); c.arc(0, 0, 40, -1.1, 1.1); c.stroke(); }, b.d.wall - 60 - k * 600, GY - 70, { h: 120, anchor: 'center', alpha: 1 - k, flip: true }); }
    if (H.magnet > 0.3 && b.kind === 'toad' && !WT.Assets.has('boss_toad_tongue')) { ctx.save(); ctx.strokeStyle = '#c0504a'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(b.d.wall + 10, GY - 120); ctx.lineTo(b.d.wall - 220, GY - 70); ctx.stroke(); ctx.restore(); }
    // 폭탄
    H.bombs.forEach((q) => { if (q.live && !q.dead) WT.drawThing(ctx, 'prop_battery_bomb', (c) => { PH.battery(c, 60); }, q.x, GY - 30, { h: 60, anchor: 'center', rot: q.rot }); });
    // 낙뢰
    H.strikes.forEach((q) => {
      if (q.sx == null || q.done) return;
      if (!q.hit) { ctx.save(); ctx.globalAlpha = 0.35 + 0.4 * Math.abs(Math.sin(t * 30)); ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.ellipse(q.sx, GY, 50, 10, 0, 0, 7); ctx.fill(); ctx.restore(); }
      else WT.drawThing(ctx, 'fx_lightning', (c) => { c.strokeStyle = '#fff3a8'; c.lineWidth = 10; c.beginPath(); c.moveTo(0, -300); c.lineTo(-20, -200); c.lineTo(15, -120); c.lineTo(-10, 0); c.stroke(); }, q.sx, GY, { h: 320 });
    });
    // 약점 표시
    if (b.state === 'over') {
      const w = b.d.weakPos[b.weak], pulse = 1 + Math.sin(t * 8) * 0.12;
      const id = b.kind === 'toad' ? 'prop_breaker' : 'prop_plug';
      if (!(b.kind === 'volt' && b.plugged === false)) WT.drawThing(ctx, id, (c) => { c.fillStyle = b.kind === 'toad' ? C.red : '#c99a3a'; c.strokeStyle = C.outline; c.lineWidth = 4; c.fillRect(-14, -50, 28, 50); c.strokeRect(-14, -50, 28, 50); }, w.x, w.y + 30, { h: 60 * pulse });
      ctx.save(); ctx.strokeStyle = C.yellow; ctx.lineWidth = 4; ctx.setLineDash([8, 6]); ctx.lineDashOffset = -t * 30; ctx.beginPath(); ctx.arc(w.x, w.y, 44 * pulse, 0, 7); ctx.stroke(); ctx.restore();
    }
    // 라디오 씨 (왼쪽 송신 자리)
    const rx = 115;
    if (b.reborn) {
      ctx.save(); ctx.globalAlpha = 0.18 + Math.sin(t * 3) * 0.05; ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.ellipse(130, GY - 10, 140, 34, 0, 0, 7); ctx.fill(); ctx.restore();
      for (let i = 0; i < 3; i++) { const k = (t * 0.5 + i / 3) % 1; WT.drawThing(ctx, ['fx_note_01', 'fx_note_02'], PH.note, 60 + i * 70, GY - 60 - k * 140, { h: 30, anchor: 'center', alpha: 1 - k }); }
      const b2 = Math.abs(Math.sin(t * 5));
      WT.drawThing(ctx, ['npc_radio_reborn_broadcast', 'npc_radio_reborn_idle'], PH.radio, rx, GY - b2 * 6, { h: 140, reborn: true, t, sy: 1 + b2 * 0.05 });
    } else if (b.collapsed) {
      ctx.save(); ctx.filter = 'grayscale(1) brightness(.8)'; WT.drawThing(ctx, 'npc_radio_off', PH.radio, rx, GY, { h: 120, power: 'battery', off: true, rot: 0.25 }); ctx.restore();
    } else {
      const jam = b.jamT > 0;
      WT.drawThing(ctx, jam ? ['npc_radio_jam', 'npc_radio_idle'] : 'npc_radio_idle', PH.radio, rx, GY, { h: 120, power: 'battery', t, rot: jam ? Math.sin(t * 40) * 0.03 : 0 });
      if (jam) { ctx.save(); ctx.strokeStyle = 'rgba(232,237,242,.85)'; ctx.lineWidth = 5; ctx.beginPath(); for (let x = rx + 40; x < b.d.wall; x += 26) ctx.lineTo(x, GY - 110 + ((x / 26) % 2 ? -14 : 14)); ctx.stroke(); ctx.restore(); }
    }
  };
  function bossIds(b) {
    const v = b.kind === 'volt';
    if (b.state === 'small') return ['boss_volt_small'];
    if (b.state === 'down') return ['boss_toad_down', 'boss_toad_hurt', 'boss_toad_idle'];
    if (b.state === 'hurt') return [v ? 'boss_volt_hurt' : 'boss_toad_hurt', v ? 'boss_volt_idle' : 'boss_toad_idle'];
    if (b.state === 'over') {
      if (v) return b.plugged === false ? ['boss_volt_crank', 'boss_volt_overheat'] : ['boss_volt_overheat', 'boss_volt_idle'];
      return [b.weak === 'rush' ? 'boss_toad_overheat_mouth' : 'boss_toad_overheat_top', 'boss_toad_idle'];
    }
    if (b.atk) {
      const m = v ? { floor: 'boss_volt_spark', floorSeq: 'boss_volt_spark', magnet: 'boss_volt_magnet', coolant: 'boss_volt_spray', bombs: 'boss_volt_throw', strike: 'boss_volt_strike' }
        : { floor: 'boss_toad_croak', tongue: 'boss_toad_tongue' };
      return [m[b.atk.type], v ? 'boss_volt_idle' : 'boss_toad_idle'];
    }
    return [v ? 'boss_volt_idle' : 'boss_toad_idle'];
  }
  RB.hud = function (ctx, t, r) {
    const b = r.boss;
    const total = b.d.rounds.length + (b.kind === 'volt' ? 1 : 0), done = b.kind === 'volt' && b.plugged === false ? b.hits + 0 : b.hits;
    ctx.save();
    ctx.font = '22px "Do Hyeon", sans-serif'; ctx.textBaseline = 'middle';
    const w = ctx.measureText(b.d.name).width + 50 + total * 34;
    const x = WT.W - w - 20, y = 108;
    ctx.fillStyle = 'rgba(43,34,48,.9)'; ctx.strokeStyle = C.red; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(x, y, w, 44, 14); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.cream; ctx.fillText(b.d.name, x + 18, y + 22);
    for (let i = 0; i < total; i++) {
      const cx = x + w - 24 - (total - 1 - i) * 34, gone = i < done;
      ctx.globalAlpha = gone ? 0.25 : 1;
      WT.drawThing(ctx, b.kind === 'toad' ? 'prop_breaker' : 'prop_plug', (c) => { c.fillStyle = b.kind === 'toad' ? C.red : '#c99a3a'; c.strokeStyle = C.outline; c.lineWidth = 2; c.fillRect(-7, -24, 14, 24); c.strokeRect(-7, -24, 14, 24); }, cx, y + 36, { h: 28 });
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  };
  RB.debugWin = function (r) { // 점검용: 현재 라운드 약점 바로 성공
    const b = r.boss; if (!b || b.state !== 'over') return false;
    if (b.kind === 'volt' && b.weak === 'final' && b.plugged === false) { smallVolt(r); return true; }
    hitWeak(r); return true;
  };
})();
