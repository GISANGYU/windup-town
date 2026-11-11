// 게임 상태와 규칙. 상태 변경은 이 파일의 함수로만 한다.
(function () {
  const CFG = WT.CFG, W = WT.WORLD, D = WT.DIALOGUE;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  const G = WT.Game = {
    solids: [],
    state: null,
    particles: [],
    time: 0
  };

  G.setScene = function (scene) {
    if (scene === 'arena') { G.solids = WT.Boss.solids(); G.bounds = WT.Boss.A.bounds; }
    else { G.solids = WT.buildSolids(); G.bounds = W.bounds; }
  };
  // 원형으로 닫고 → fn 실행 → 다시 열기 (1930년대 아이리스)
  G.irisThen = function (cx, cy, fn) { G.state.ui.transition = { t: 0, dur: 1.1, cx, cy, mid: fn, done: false }; };
  // 이미 닫힌 상태에서 열기만
  G.irisOpen = function (cx, cy) { G.state.ui.transition = { t: 0.55, dur: 1.1, cx: cx == null ? WT.W / 2 : cx, cy: cy == null ? WT.H / 2 : cy, done: true }; };

  G.reset = function () {
    G.solids = WT.buildSolids(); G.bounds = W.bounds;
    G.particles = [];
    G.state = {
      scene: 'town',
      player: { x: W.start.x, y: W.start.y, z: 0, vz: 0, dir: 'down', facing: 1, moving: false, run: false,
                action: null, actionT: 0, landT: 0 },
      quest: { stage: 'none' },
      inventory: { keys: 0 },
      world: { musicOn: false, musicT: 0, keys: W.keys.map((k) => ({ id: k.id, x: k.x, y: k.y, taken: false })) },
      npcs: { gramo: { mood: 'sleepy', wind: 0 }, pip: { mood: 'sleepy', delivered: false }, lamp: { mood: 'sleepy' } },
      house: { unlocked: ['chair', 'table', 'plant'], furniture: [], placing: null, selected: null, snap: true, drag: null, nextId: 1 },
      ui: { dialog: null, transition: null, cutscene: null, toast: null, story: null, debug: /[?&]debug/.test(location.search) },
      tut: { moved: 0, done: {}, jumped: false, ranT: 0 },
      episode: 1, act1Done: false, boss: null, arena: null
    };
    if (WT.Act3) WT.Act3.initState(G.state);
    if (WT.Act4) WT.Act4.initState(G.state);
    if (WT.Road) WT.Road.initState(G.state);
  };

  G.locked = function () {
    const u = G.state.ui;
    return !!(u.dialog || u.transition || u.cutscene || u.story || (WT.Wind && WT.Wind.active) || (WT.Act3 && WT.Act3.busy()) || (WT.Act4 && WT.Act4.busy()));
  };

  // ───────── 목표 문구 (HUD) ─────────
  G.objective = function () {
    const s = G.state, st = s.quest.stage;
    if (s.episode >= 3) { const o = (WT.Act4 && WT.Act4.objective()) || (WT.Act3 && WT.Act3.objective()); if (o) return o; }
    if (st === 'none') return '광장의 축음기에게 말을 걸어 보자';
    if (st === 'started') return `태엽 열쇠를 모으자  ${s.inventory.keys} / 3`;
    if (st === 'ready') return '그라모 영감에게 열쇠를 가져가자';
    if (!s.npcs.pip.delivered) return '피프가 뭔가 할 말이 있는 것 같다';
    return '새집을 꾸며 보자 (문 앞에서 E)';
  };

  // ───────── 상호작용 대상 찾기 ─────────
  G.nearestTarget = function () {
    const s = G.state, p = s.player;
    if (s.scene === 'arena') return WT.Boss.target();
    if (s.scene !== 'town' || p.z > 4) return null;
    let best = null, bd = 1e9;
    const consider = (t, d, range) => { if (d <= range && d < bd) { best = t; bd = d; } };
    Object.entries(W.npcs).forEach(([id, n]) => WT.npcVisible(id) && consider({ type: 'npc', id, x: n.x, y: n.y, h: n.h }, dist(p, n), CFG.talkRange));
    if (WT.Act3) WT.Act3.targets(consider, p);
    if (WT.Act4) WT.Act4.targets(consider, p);
    if (s.quest.stage === 'started') s.world.keys.forEach((k) => !k.taken && consider({ type: 'key', id: k.id, x: k.x, y: k.y, h: 44 }, dist(p, k), CFG.pickRange));
    consider({ type: 'door', x: W.door.x, y: W.door.y - 30, h: 80 }, dist(p, W.door), CFG.doorRange);
    return best;
  };

  G.interact = function () {
    const s = G.state;
    if (G.locked()) return;
    const t = G.nearestTarget();
    if (!t) return;
    const p = s.player;
    p.action = 'interact'; p.actionT = 0.3;
    if (t.type === 'boss') return WT.Boss.overwind();
    if (t.type === 'key') return G.pickKey(t.id);
    if (t.type === 'door') return G.enterHouse();
    if (WT.Act3 && WT.Act3.interact(t)) return;
    if (WT.Act4 && WT.Act4.interact(t)) return;
    if (t.type === 'npc') {
      p.dir = Math.abs(t.x - p.x) > Math.abs(t.y - p.y) ? 'side' : (t.y < p.y ? 'up' : 'down');
      if (p.dir === 'side') p.facing = t.x > p.x ? 1 : -1;
      return G.talk(t.id);
    }
  };

  // ───────── 대화와 퀘스트 ─────────
  G.talk = function (id) {
    const s = G.state, st = s.quest.stage, n = W.npcs[id];
    if (WT.Act3 && WT.Act3.talk(id)) return;
    if (id === 'gramo') {
      if (st === 'none') return WT.UI.dialog({ who: 'gramo', name: n.name, mood: 'sleepy', lines: D.gramo.none, onClose: G.startQuest });
      if (st === 'started') return WT.UI.dialog({ who: 'gramo', name: n.name, mood: 'sleepy', lines: D.gramo.started });
      if (st === 'ready') return WT.UI.dialog({ who: 'gramo', name: n.name, mood: 'sleepy', lines: D.gramo.ready, onClose: G.windGramo });
      if (s.episode >= 3) return WT.UI.dialog({ who: 'gramo', name: n.name, mood: 'awake', lines: D.gramo.final });
      if (s.act1Done) return WT.UI.dialog({ who: 'gramo', name: n.name, mood: 'awake', lines: D.gramo.act2Ask, onClose: G.startAct2 });
      return WT.UI.dialog({ who: 'gramo', name: n.name, mood: 'awake', lines: D.gramo.after });
    }
    if (id === 'pip') {
      const mood = s.npcs.pip.mood;
      if (st === 'none') return WT.UI.dialog({ who: 'pip', name: n.name, mood, lines: D.pip.none });
      if (st === 'started') {
        const left = s.world.keys.filter((k) => !k.taken).map((k) => D.pip.hint[k.id]);
        return WT.UI.dialog({ who: 'pip', name: n.name, mood, lines: left.length ? [left[0]] : D.pip.hintDone });
      }
      if (st === 'ready') return WT.UI.dialog({ who: 'pip', name: n.name, mood, lines: D.pip.ready });
      if (!s.npcs.pip.delivered) return WT.UI.dialog({ who: 'pip', name: n.name, mood, lines: D.pip.deliver, onClose: G.deliverReward });
      return WT.UI.dialog({ who: 'pip', name: n.name, mood, lines: D.pip.completed });
    }
    if (id === 'lamp') {
      const mood = s.npcs.lamp.mood;
      return WT.UI.dialog({ who: 'lamp', name: WT.npcName('lamp'), mood, lines: D.lamp[mood] });
    }
  };

  G.startQuest = function () {
    const s = G.state;
    if (s.quest.stage !== 'none') return;
    s.quest.stage = 'started';
    WT.Audio.play('sfx_quest_start'); WT.Audio.play('sfx_key_appear', { delay: 0.4 });
    s.world.keys.forEach((k) => G.burst('sparkle', k.x, k.y - 30, 5));
    G.toast('퀘스트 시작 · 멈춘 음악');
  };

  G.pickKey = function (id) {
    const s = G.state, k = s.world.keys.find((q) => q.id === id);
    if (!k || k.taken || s.quest.stage !== 'started') return;
    k.taken = true;
    s.inventory.keys++;
    WT.Audio.play('sfx_key_pickup');
    s.player.action = 'happy'; s.player.actionT = 0.9;
    G.burst('sparkle', k.x, k.y - 30, 8);
    G.toast(`태엽 열쇠 ${s.inventory.keys} / 3`);
    if (s.inventory.keys >= 3) { s.quest.stage = 'ready'; G.toast('열쇠를 다 모았다! 그라모 영감에게 가자'); WT.Audio.play('sfx_keys_complete', { delay: 0.5 }); }
  };

  // 열쇠를 꽂고 → 태엽 감기 모달(사용자가 직접 감음) → 끝나면 짧은 진동 연출 → 완료
  G.windGramo = function () {
    const s = G.state;
    if (s.quest.stage !== 'ready') return;
    const p = s.player, g = W.npcs.gramo;
    p.x = g.x + 70; p.y = g.y + 18; p.dir = 'side'; p.facing = -1;
    WT.Wind.open(() => { s.ui.cutscene = { type: 'wind', t: 0, dur: 0.9 }; WT.Audio.play('sfx_gramo_wake'); });
  };

  function finishWind() {
    const s = G.state;
    s.quest.stage = 'completed';
    s.world.musicOn = true;
    WT.Audio.jingle('jingle_quest_clear'); // 끝나면 BGM 규칙에 따라 bgm_town_awake
    s.npcs.gramo.mood = 'awake';
    s.npcs.pip.mood = 'awake';
    s.npcs.lamp.mood = 'awake';
    WT.Audio.play('sfx_lamp_on', { delay: 0.6 });
    s.player.action = 'happy'; s.player.actionT = PARTY;
    const g = W.npcs.gramo;
    G.burst('note', g.x, g.y - 170, 10);
    G.burst('sparkle', g.x, g.y - 90, 10);
    WT.UI.flash();
    // 말풍선 전에 다 같이 신나게 움직이는 장면을 잠깐 보여 준다
    s.ui.cutscene = { type: 'party', t: 0, dur: PARTY, then: gramoThanks };
  }
  const PARTY = 2.2;
  function gramoThanks() {
    const s = G.state, g = W.npcs.gramo;
    WT.UI.dialog({ who: 'gramo', name: g.name, mood: 'awake', lines: D.gramo.completed,
      onClose: () => { const p = s.player; G.irisThen(p.x, p.y - 50, () => WT.Story.play(D.ending, () => { s.act1Done = true; G.toast('피프가 할 말이 있는 것 같다'); })); } });
  }

  G.deliverReward = function () {
    const s = G.state;
    if (s.quest.stage !== 'completed' || s.npcs.pip.delivered) return;
    s.npcs.pip.delivered = true;
    WT.Audio.play('sfx_reward_unlock');
    if (!s.house.unlocked.includes('gramophone')) s.house.unlocked.push('gramophone');
    G.toast('새 가구 · 미니 축음기');
    WT.UI.refreshToolbar();
  };

  // ───────── 제2막 ─────────
  G.startAct2 = function () {
    const s = G.state;
    if (!s.act1Done || s.episode !== 1) return;
    const p = s.player;
    G.irisThen(p.x, p.y - 50, () => {
      WT.Story.play(D.act2open, () => {
        s.episode = 2;
        WT.Boss.enter();
        G.irisOpen(WT.W / 2, 300);
        setTimeout(() => WT.UI.dialog({ who: 'boss', name: '째깍 백작', mood: 'angry', lines: D.boss.intro, onClose: WT.Boss.startFight }), 900);
      });
    });
  };
  G.endAct2 = function () {
    const s = G.state;
    WT.UI.dialog({ who: 'boss', name: '째깍 백작', mood: 'cuckoo', lines: D.boss.defeat, onClose: () => {
      G.irisThen(WT.W / 2, 300, () => WT.Story.play(D.act2end, () => {
        s.episode = 3; s.scene = 'town'; s.boss = null; s.arena = null;
        G.setScene('town'); WT.UI.setScene('town');
        s.player.x = W.npcs.gramo.x; s.player.y = W.npcs.gramo.y + 70; s.player.dir = 'down';
        if (!s.house.unlocked.includes('cuckoo')) { s.house.unlocked.push('cuckoo'); WT.Audio.play('sfx_reward_unlock', { delay: 0.6 }); }
        G.toast('새 가구 · 뻐꾸기시계');
      }));
    } });
  };

  // ───────── 장면 전환 (원형) ─────────
  function iris(cx, cy, mid) {
    G.state.ui.transition = { t: 0, dur: 0.95, cx, cy, mid, done: false };
  }
  G.enterHouse = function () {
    const s = G.state;
    s.tut.done.house = true;
    WT.Audio.play('sfx_door');
    iris(s.player.x, s.player.y - 50, () => {
      s.scene = 'house'; s.house.placing = null; s.house.selected = null;
      WT.UI.setScene('house');
      s.ui.transition.cx = WT.W / 2; s.ui.transition.cy = WT.H / 2;
    });
  };
  G.exitHouse = function () {
    const s = G.state;
    if (s.ui.transition) return;
    iris(WT.W / 2, WT.H / 2, () => {
      s.scene = 'town'; G.setScene('town'); s.player.x = W.door.x; s.player.y = W.door.y + 50; s.player.dir = 'down';
      WT.UI.setScene('town');
      s.ui.transition.cx = s.player.x; s.ui.transition.cy = s.player.y - 50;
    });
  };

  // ───────── 집 꾸미기 ─────────
  const R = WT.ROOM;
  const clampRoom = (x, y) => [Math.max(R.x1, Math.min(R.x2, x)), Math.max(R.y1, Math.min(R.y2, y))];
  const snap = (v) => (G.state.house.snap ? Math.round(v / R.grid) * R.grid : v);
  G.furnBox = function (f) {
    const def = WT.FURN[f.type], h = def.h * f.scale;
    const w = h * WT.Assets.aspect(def.asset, def.foot / def.h * 1.25 + 0.2);
    return { x: f.x - w / 2, y: f.y - h, w, h };
  };
  G.furnAt = function (x, y) {
    const list = G.state.house.furniture.slice().sort((a, b) => b.y - a.y);
    return list.find((f) => { const b = G.furnBox(f); return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h; });
  };
  G.selectPlacing = function (type) {
    const h = G.state.house;
    if (!h.unlocked.includes(type)) return;
    h.placing = h.placing === type ? null : type; h.selected = null;
    WT.Audio.play('sfx_furn_select');
    WT.UI.refreshToolbar();
  };
  G.placeAt = function (x, y) {
    const h = G.state.house;
    if (!h.placing) return null;
    const [cx, cy] = clampRoom(snap(x), snap(y));
    const f = { id: h.nextId++, type: h.placing, x: cx, y: cy, flip: false, scale: 1, born: G.time };
    h.furniture.push(f);
    h.selected = f.id; h.placing = null;
    G.burst('dust', cx, cy, 1);
    WT.Audio.play('sfx_furn_place');
    if (f.type === 'cuckoo') WT.Audio.play('sfx_boss_cuckoo', { vol: 0.3, delay: 0.15 }); // reuse: 뻐꾸기시계 놓을 때
    WT.UI.refreshToolbar();
    return f;
  };
  G.pointerDown = function (x, y) {
    const h = G.state.house;
    if (G.state.scene !== 'house' || G.state.ui.transition) return;
    if (h.placing) {
      if (x >= R.x1 - 40 && x <= R.x2 + 40 && y >= R.y1 - 40 && y <= R.y2 + 30) G.placeAt(x, y);
      return;
    }
    const f = G.furnAt(x, y);
    h.selected = f ? f.id : null;
    if (f) WT.Audio.play('sfx_furn_select');
    if (f) h.drag = { id: f.id, dx: f.x - x, dy: f.y - y, moved: false };
    WT.UI.refreshToolbar();
  };
  G.pointerMove = function (x, y) {
    const h = G.state.house;
    h.mouse = { x, y };
    if (!h.drag) return;
    const f = h.furniture.find((q) => q.id === h.drag.id);
    if (!f) return;
    [f.x, f.y] = clampRoom(snap(x + h.drag.dx), snap(y + h.drag.dy));
    h.drag.moved = true;
  };
  G.pointerUp = function () { const d = G.state.house.drag; if (d && d.moved) WT.Audio.play('sfx_furn_place'); G.state.house.drag = null; };
  G.deleteSelected = function () {
    const h = G.state.house;
    if (h.selected == null) return;
    const f = h.furniture.find((q) => q.id === h.selected);
    if (f) { G.burst('dust', f.x, f.y, 1); WT.Audio.play('sfx_furn_delete'); }
    h.furniture = h.furniture.filter((q) => q.id !== h.selected);
    h.selected = null;
    WT.UI.refreshToolbar();
  };
  G.flipSelected = function () {
    const h = G.state.house, f = h.furniture.find((q) => q.id === h.selected);
    if (f) { f.flip = !f.flip; WT.Audio.play('sfx_furn_flip'); }
  };
  G.toggleSnap = function () { G.state.house.snap = !G.state.house.snap; WT.Audio.play('sfx_ui_toggle'); G.toast(G.state.house.snap ? '격자 맞춤 켬' : '격자 맞춤 끔'); };
  G.cancel = function () {
    const s = G.state;
    if (s.ui.dialog) return WT.UI.closeDialog();
    if (s.scene === 'house') {
      if (s.house.placing || s.house.selected != null) { s.house.placing = null; s.house.selected = null; WT.UI.refreshToolbar(); }
      else G.exitHouse();
    }
  };

  // ───────── 연출 도우미 ─────────
  G.toast = function (text) { G.state.ui.toast = { text, t: 2.2 }; WT.Audio.play('sfx_toast'); };
  G.burst = function (type, x, y, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = type === 'dust' ? 40 : 60 + Math.random() * 80;
      G.particles.push({ type, x, y, vx: Math.cos(a) * sp, vy: type === 'note' ? -60 - Math.random() * 60 : Math.sin(a) * sp - 40,
        life: 0, max: type === 'dust' ? 0.45 : type === 'spring' ? 1.6 : 1 + Math.random() * 0.6, rot: (Math.random() - 0.5) * 0.6, size: 1 });
      if (type === 'spring') { const q = G.particles[G.particles.length - 1]; q.vx = 260; q.vy = -620; }
    }
  };

  // ───────── 이동과 충돌 ─────────
  function playerRect(x, y) { return WT.footRect(x, y, 36, 14); }
  function blocked(x, y, z) {
    const b = G.bounds;
    if (x < b.x1 || x > b.x2 || y < b.y1 || y > b.y2) return true;
    const r = playerRect(x, y);
    return G.solids.some((s) => !(s.low && z > CFG.lowClear) && overlap(r, s));
  }
  function pushOut(p) { // 착지했는데 낮은 장애물 위면 가장 가까운 바깥으로
    const r = playerRect(p.x, p.y);
    const s = G.solids.find((q) => q.low && overlap(r, q));
    if (!s) return;
    const opts = [
      [s.x - r.w / 2 - 1 - p.x, 0], [s.x + s.w + r.w / 2 + 1 - p.x, 0],
      [0, s.y - 1 - p.y], [0, s.y + s.h + r.h + 1 - p.y]
    ].sort((a, b) => Math.hypot(...a) - Math.hypot(...b));
    for (const [dx, dy] of opts) if (!blocked(p.x + dx, p.y + dy, 0)) { p.x += dx; p.y += dy; return; }
  }

  G.update = function (dt, input) {
    const s = G.state, p = s.player;
    G.time += dt;
    const u = s.ui;
    WT.Story.update(dt);
    WT.Wind.update(dt);
    if (u.toast) { u.toast.t -= dt; if (u.toast.t <= 0) u.toast = null; }
    if (p.actionT > 0) { p.actionT -= dt; if (p.actionT <= 0) p.action = null; }
    if (p.landT > 0) p.landT -= dt;
    if (s.world.musicOn) s.world.musicT += dt;

    // 원형 전환
    if (u.transition) {
      const tr = u.transition;
      tr.t += dt;
      if (!tr.snd) { tr.snd = 1; WT.Audio.play(tr.done ? 'sfx_iris_open' : 'sfx_iris_close'); }
      if (!tr.done && tr.t >= tr.dur / 2) { tr.done = true; tr.mid && tr.mid(); WT.Audio.play('sfx_iris_open'); }
      if (tr.t >= tr.dur) u.transition = null;
    }

    // 태엽 감기 연출
    if (u.cutscene) {
      const c = u.cutscene;
      c.t += dt;
      if (c.type === 'party') {
        // 깨어난 셋에게서 음표·반짝이가 계속 튀어 오름
        Object.entries(W.npcs).filter(([id]) => WT.npcVisible(id)).forEach(([, n]) => {
          if (Math.random() < dt * 5) G.burst('note', n.x + (Math.random() - 0.5) * 60, n.y - n.h, 1);
          if (Math.random() < dt * 4) G.burst('sparkle', n.x + (Math.random() - 0.5) * 80, n.y - n.h * 0.6, 1);
        });
        if (c.t >= c.dur) { u.cutscene = null; c.then(); }
      } else {
        s.npcs.gramo.wind = 1 + c.t * 3;
        if (Math.random() < dt * 10) G.burst('sparkle', W.npcs.gramo.x + 40, W.npcs.gramo.y - 70, 1);
        if (c.t >= c.dur) { u.cutscene = null; finishWind(); }
      }
    }

    if (s.scene === 'town' || s.scene === 'arena') {
      // 이동
      let mx = 0, my = 0;
      if (!G.locked()) {
        if (input.held('left')) mx -= 1; if (input.held('right')) mx += 1;
        if (input.held('up')) my -= 1; if (input.held('down')) my += 1;
      }
      p.moving = !!(mx || my);
      if (!p.moving) p.stepT = 0;
      p.run = input.held('run');
      if (p.moving) {
        const bm = p.power === 'battery' ? (WT.Act3 ? WT.Act3.speedMul() : 1.6) : null;
        const len = Math.hypot(mx, my), sp = CFG.speed * (bm || (p.run ? CFG.runMul : 1)) * dt;
        const nx = p.x + mx / len * sp, ny = p.y + my / len * sp;
        const ox = p.x, oy = p.y;
        if (!blocked(nx, p.y, p.z)) p.x = nx;
        if (!blocked(p.x, ny, p.z)) p.y = ny;
        const moved = Math.hypot(p.x - ox, p.y - oy);
        s.tut.moved += moved;
        if (p.z === 0 && moved > 0.1) {
          p.stepT = (p.stepT || 0) - dt;
          if (p.stepT <= 0) {
            p.stepAlt = !p.stepAlt;
            if (p.power === 'battery') { WT.Audio.play('sfx_dash_step', { rate: 1 }); p.stepT = 0.2; } // 건전지: 매번 같은 소리, 같은 간격
            else { WT.Audio.play(p.stepAlt ? 'sfx_step_01' : 'sfx_step_02', { rate: 0.95 + Math.random() * 0.1 }); p.stepT = p.run ? 0.22 : 0.32; }
          }
        }
        p.bumpCd = Math.max(0, (p.bumpCd || 0) - dt);
        if (moved <= 0.01 && p.z === 0 && !p.bumpCd) { WT.Audio.play('sfx_bump'); p.bumpCd = 0.5; }
        if (p.run) s.tut.ranT += dt;
        if (Math.abs(mx) >= Math.abs(my) && mx) { p.dir = 'side'; p.facing = mx > 0 ? 1 : -1; }
        else if (my) p.dir = my < 0 ? 'up' : 'down';
      }
      // 점프
      if (p.z > 0 || p.vz > 0) {
        p.vz -= CFG.gravity * dt; p.z += p.vz * dt;
        if (p.z <= 0) { p.z = 0; p.vz = 0; p.landT = 0.18; G.burst('dust', p.x, p.y, 1); pushOut(p); WT.Audio.play('sfx_land'); p.stepT = 0.15; }
      }
      if (s.scene === 'arena') WT.Boss.update(dt);
      // 졸음 / 음표
      if (s.scene === 'town') Object.entries(W.npcs).filter(([id]) => WT.npcVisible(id)).forEach(([id, n]) => {
        const mood = s.npcs[id].mood;
        if (mood === 'sleepy' && Math.random() < dt * 0.5) G.particles.push({ type: 'zzz', x: n.x + 20, y: n.y - n.h, vx: 14, vy: -26, life: 0, max: 1.8, rot: 0, size: 1 });
      });
      if (s.scene === 'town' && s.world.musicOn && Math.random() < dt * 2.2) {
        const g = W.npcs.gramo;
        G.particles.push({ type: 'note', x: g.x + (Math.random() - 0.5) * 40, y: g.y - 160, vx: (Math.random() - 0.5) * 50, vy: -50, life: 0, max: 2.2, rot: (Math.random() - 0.5) * 0.5, size: 1 });
      }
    }

    if (WT.Act3) WT.Act3.update(dt);
    if (WT.Act4) WT.Act4.update(dt);
    if (s.scene === 'road' && WT.Road) WT.Road.update(dt, input);
    // 입자
    G.particles.forEach((q) => { q.life += dt; q.x += q.vx * dt; q.y += q.vy * dt; if (q.type === 'sparkle') q.vy += 80 * dt; if (q.type === 'spring') { q.vy += 900 * dt; q.rot += dt * 12; } if (q.type === 'steam') { q.vy = -60; q.vx *= 0.95; } });
    G.particles = G.particles.filter((q) => q.life < q.max);
  };

  G.jump = function () {
    const p = G.state.player;
    if (G.locked() || (G.state.scene !== 'town' && G.state.scene !== 'arena') || p.z > 0) return;
    if (G.state.arena && G.state.arena.sleepT > 0) return;
    if (p.power === 'battery') { if (WT.Act3) WT.Act3.jumpBlocked(); return; } // 건전지: 점프 봉인
    p.vz = CFG.jumpV; p.z = 0.01;
    G.state.tut.jumped = true;
    WT.Audio.play('sfx_jump');
  };

  // ───────── 튜토리얼 안내 (제1막) ─────────
  // 조건에 맞는 첫 안내 하나를 돌려준다. 할 일을 하면 사라진다.
  G.tip = function () {
    const s = G.state, T = D.tips, tut = s.tut, st = s.quest.stage, p = s.player;
    if (s.scene === 'arena') return G.locked() ? null : WT.Boss.tip();
    if (s.scene === 'road') return WT.Road ? WT.Road.tip() : null;
    if (s.episode >= 3 && s.scene === 'town') return (WT.Act4 && WT.Act4.tip()) || (WT.Act3 ? WT.Act3.tip() : null);
    if (s.episode !== 1 || s.scene !== 'town' || G.locked()) return null;
    if (tut.moved < 120) return T.move;
    const t = G.nearestTarget();
    if (st === 'none') return t && t.type === 'npc' ? T.talk : null;
    if (st === 'started') {
      if (t && t.type === 'key') return T.key;
      if (!tut.jumped && Math.hypot(p.x - 1080, p.y - 486) < 230) return T.jump;
      if (s.inventory.keys >= 1 && tut.ranT < 0.6) return T.run;
      return null;
    }
    if (st === 'ready') return T.wind;
    if (s.npcs.pip.delivered && !tut.done.house) return T.door;
    if (s.act1Done) return T.act2;
    return null;
  };
})();
