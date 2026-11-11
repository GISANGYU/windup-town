// 제3막 「태엽 없는 손님」 — 축제, 라디오 씨, 건전지(기계화), 피프·가로등 되돌리기, 크랭크 라디오
// 기획: GAME_DESIGN.md 17절. 상태는 state.act3, 바꾸는 함수는 이 파일 안에서만.
(function () {
  const G = WT.Game, W = WT.WORLD, C = WT.C, PH = WT.PH;
  const D = () => WT.DIALOGUE.act3;
  const A3 = WT.Act3 = {};
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const ORDER = ['none', 'festival', 'arrived', 'morning', 'trial', 'persuade', 'radioDown', 'done'];
  const TRIAL_MAX = 45;          // 건전지 체험 최대 시간(초)
  const BATTERY_SPEED = 1.6;     // 17-7
  const SEQ = ['S', 'L', 'S'];   // 가로등 깜빡임 (1·2막 대사에 미리 심음)
  const LONG = 0.38;             // 이보다 오래 누르면 '길게'

  // ───────── 배치 ─────────
  const L = W.act3 = {
    deco: [
      { type: 'bunting', x: 500, y: 300 },
      { type: 'lantern', x: 768, y: 290 },
      { type: 'banner', x: 640, y: 482 }
    ],
    sheets: [{ x: 560, y: 248 }, { x: 985, y: 656 }, { x: 1050, y: 505 }],
    ribbon: { x: 1128, y: 494 },
    fence: { x: 1080, y: 486 }
  };
  W.npcs.radio = { x: 772, y: 480, h: 130, foot: [60, 22], name: '라디오 씨' };
  W.npcs.cuckoo = { x: 292, y: 562, h: 110, foot: [50, 20], name: '뻐꾸기 백작' };

  A3.initState = function (s) {
    s.act3 = { stage: 'none', deco: [false, false, false], sheets: [false, false, false], ribbon: false,
      trialT: 0, blocked: 0, pipDone: false, lampDone: false, hint: false, named: false, blink: null, after: [] };
    s.npcs.pip.power = 'wind'; s.npcs.lamp.power = 'wind';
    s.npcs.radio = { mood: 'awake', power: 'battery', off: false };
    s.npcs.cuckoo = { mood: 'cuckoo' };
    s.player.power = 'wind';
    s.inventory.battery = 0;
  };
  const st = () => G.state.act3;
  A3.at = (name) => ORDER.indexOf(st().stage) >= ORDER.indexOf(name);
  A3.is = (name) => st().stage === name;

  // NPC가 지금 마을에 있는가
  WT.npcVisible = function (id) {
    const s = G.state;
    if (!s || !s.act3) return id !== 'radio' && id !== 'cuckoo';
    if (id === 'radio') return A3.at('arrived') && !(WT.Act4 && WT.Act4.following()); // 4막에선 보글을 따라다님(따로 그림)
    if (id === 'cuckoo') return s.episode >= 3;
    return true;
  };
  WT.npcName = function (id) {
    if (id === 'lamp' && G.state.act3 && G.state.act3.named) return '반디';
    return W.npcs[id].name;
  };
  function refresh() { if (G.state.scene === 'town') G.solids = WT.buildSolids(); }
  A3.refresh = refresh;
  // 잠깐 뒤에 실행 (컷신이 열리는 동안 기다림)
  function after(t, fn, tag) { st().after.push({ t, fn, tag }); }
  const pending = (tag) => st().after.some((q) => q.tag === tag);
  function say(who, lines, o) {
    o = o || {};
    const name = o.name || (who === 'bogle' ? '보글' : WT.npcName(who));
    WT.UI.dialog(Object.assign({ who, name, mood: o.mood || 'awake', lines }, o));
  }
  const flat = (who, lines, onClose) => { say(who, lines, { mood: 'battery', flat: true, onClose }); WT.Audio.play(who === 'pip' ? 'sfx_pip_flat' : 'sfx_battery_hum', { vol: 0.3 }); };
  A3.busy = () => !!(G.state.act3 && G.state.act3.blink);

  // ───────── ① 축제 준비 ─────────
  A3.start = function () {
    const s = G.state;
    if (s.episode < 3 || !A3.is('none')) return;
    st().stage = 'festival';
    WT.Audio.play('sfx_quest_start');
    L.deco.forEach((d) => G.burst('sparkle', d.x, d.y - 30, 4));
    G.toast(D().toast.start);
  };
  function placeDeco(i) {
    const a = st();
    if (!A3.is('festival') || a.deco[i]) return;
    a.deco[i] = true;
    const d = L.deco[i];
    G.burst('sparkle', d.x, d.y - 40, 8); G.burst('dust', d.x, d.y, 1);
    WT.Audio.play('sfx_furn_place');
    G.state.player.action = 'happy'; G.state.player.actionT = 0.8;
    const n = a.deco.filter(Boolean).length;
    G.toast(`축제 장식 ${n} / 3`);
    if (n === 3) { WT.Audio.play('sfx_festival_cheer', { delay: 0.3 }); after(1.1, festivalDone); }
  }

  // ───────── ② 손님 도착 ─────────
  function festivalDone() {
    const s = G.state, p = s.player;
    G.irisThen(p.x, p.y - 50, () => WT.Story.play(WT.DIALOGUE.act3open, () => {
      st().stage = 'arrived';
      p.x = 700; p.y = 545; p.dir = 'side'; p.facing = 1;
      refresh();
      WT.Audio.play('sfx_radio_on');
      after(0.9, () => say('radio', D().radio.arrive, { mood: 'battery', onClose: morning }));
    }));
  }
  // ③ 다음 날 아침: 피프와 가로등이 건전지 상태
  function morning() {
    const s = G.state, p = s.player;
    G.irisThen(p.x, p.y - 50, () => {
      st().stage = 'morning';
      s.npcs.pip.power = 'battery'; s.npcs.lamp.power = 'battery';
      p.x = W.door.x; p.y = W.door.y + 50; p.dir = 'down';
      WT.Audio.play('sfx_battery_in', { delay: 0.6 });
      after(0.7, () => G.toast(D().toast.morning));
    });
  }

  // ───────── ④ 보글의 건전지 체험 (강제) ─────────
  function startTrial() {
    const s = G.state;
    if (!A3.is('morning')) return;
    st().stage = 'trial'; st().trialT = 0; st().blocked = 0;
    s.player.power = 'battery';
    WT.Audio.play('sfx_battery_in');
    G.burst('sparkle', s.player.x, s.player.y - 60, 6);
    G.toast(D().toast.trial);
  }
  A3.jumpBlocked = function () {
    const a = st(), p = G.state.player;
    WT.Audio.play('sfx_jump_blocked');
    p.landT = 0.12;
    if (!a.blocked) G.toast(D().toast.blocked);
    a.blocked++;
    if (A3.is('trial') && dist(p, L.fence) < 290 && !pending('trialEnd')) after(0.9, endTrial, 'trialEnd');
  };
  function endTrial() {
    if (!A3.is('trial')) return;
    const s = G.state;
    say('bogle', D().bogle.trialEnd, { mood: 'battery', onClose: () => {
      s.player.power = 'wind'; s.inventory.battery = 1;
      WT.Audio.play('sfx_battery_out');
      G.burst('note', s.player.x, s.player.y - 100, 4);
      say('radio', D().radio.keep, { mood: 'battery', onClose: () => {
        st().stage = 'persuade';
        L.sheets.forEach((q) => G.burst('sparkle', q.x, q.y - 20, 4));
        G.toast(D().toast.persuade);
      } });
    } });
  }

  // ───────── ⑤ 설득 · 피프 ─────────
  function pickSheet(i) {
    const a = st();
    if (!A3.is('persuade') || a.sheets[i]) return;
    a.sheets[i] = true;
    const q = L.sheets[i];
    WT.Audio.play('sfx_sheet_pickup');
    G.burst('note', q.x, q.y - 30, 3);
    G.state.player.action = 'happy'; G.state.player.actionT = 0.8;
    G.toast(`악보 조각 ${a.sheets.filter(Boolean).length} / 3`);
  }
  function restorePip() {
    const s = G.state;
    WT.Wind.open(() => {
      s.npcs.pip.power = 'wind'; st().pipDone = true;
      WT.Audio.play('sfx_battery_out'); WT.Audio.play('sfx_pip_song', { delay: 0.3 });
      const n = W.npcs.pip; G.burst('note', n.x, n.y - 130, 8); G.burst('sparkle', n.x, n.y - 70, 6); WT.UI.flash();
      say('pip', D().pip.restored, { onClose: checkBoth });
    }, { title: '피프 태엽 다시 감기', guide: '건전지를 빼고 태엽을 감자 · 원 그리기 또는 A · D 번갈아', variant: 'pip', speed: 2.2 });
  }

  // ───────── ⑥ 설득 · 가로등 (깜빡임 따라 하기) ─────────
  function startBlink() {
    st().blink = { phase: 'show', t: -0.4, step: 0, input: [], press: null, msg: D().blink.show, tries: 0 };
  }
  // 보여 주기 일정: 켜짐(짧게 0.28 / 길게 0.8) → 꺼짐 0.42
  function schedule() { const out = []; SEQ.forEach((k) => { out.push({ on: true, dur: k === 'S' ? 0.28 : 0.8, k }); out.push({ on: false, dur: 0.42 }); }); return out; }
  A3.blinkActive = () => !!(G.state.act3 && G.state.act3.blink);
  A3.blinkDown = function () { const b = st().blink; if (b && b.phase === 'input' && !b.press) b.press = G.time; };
  A3.blinkUp = function () {
    const b = st().blink;
    if (!b || b.phase !== 'input' || b.press == null) return;
    const k = G.time - b.press >= LONG ? 'L' : 'S';
    b.press = null;
    WT.Audio.play(k === 'S' ? 'sfx_lamp_blink_short' : 'sfx_lamp_blink_long');
    if (k !== SEQ[b.input.length]) {
      WT.Audio.play('sfx_blink_wrong', { delay: 0.1 });
      b.input = []; b.phase = 'show'; b.t = -0.9; b.step = 0; b.tries++; b.msg = D().blink.wrong; b.flashWrong = 0.6;
      return;
    }
    b.input.push(k);
    WT.Audio.play('sfx_blink_right', { rate: 1 + b.input.length * 0.12, delay: 0.05 });
    if (b.input.length === SEQ.length) { b.phase = 'done'; b.t = 0; }
  };
  A3.blinkCancel = function () { st().blink = null; };
  function blinkUpdate(dt) {
    const b = st().blink;
    if (!b) return;
    b.t += dt;
    if (b.flashWrong > 0) b.flashWrong -= dt;
    if (b.phase === 'show') {
      const sc = schedule();
      if (b.t < 0) { b.lit = false; return; }
      let acc = 0, i = 0;
      for (; i < sc.length; i++) { if (b.t < acc + sc[i].dur) break; acc += sc[i].dur; }
      if (i >= sc.length) { b.phase = 'input'; b.t = 0; b.lit = false; b.msg = D().blink.input; return; }
      const on = sc[i].on;
      if (on && !b.lit) WT.Audio.play(sc[i].k === 'S' ? 'sfx_lamp_blink_short' : 'sfx_lamp_blink_long');
      b.lit = on;
    } else if (b.phase === 'input') {
      b.lit = b.press != null;
    } else if (b.phase === 'done' && b.t > 0.7) {
      st().blink = null;
      restoreLamp();
    }
  }
  function restoreLamp() {
    const s = G.state;
    WT.Wind.open(() => {
      s.npcs.lamp.power = 'wind'; st().lampDone = true;
      WT.Audio.play('sfx_battery_out'); WT.Audio.play('sfx_lamp_on', { delay: 0.3 });
      const n = W.npcs.lamp; G.burst('sparkle', n.x + 30, n.y - 170, 10); WT.UI.flash();
      say('lamp', D().lamp.restored, { mood: 'shy', onClose: () =>
        say('bogle', D().lamp.naming, { onClose: () => {
          st().named = true;
          WT.Audio.jingle('jingle_name_given');
          G.burst('sparkle', n.x + 30, n.y - 170, 12);
          say('lamp', D().lamp.named, { onClose: checkBoth });
        } }) });
    }, { title: '가로등 태엽 다시 감기', guide: '건전지를 빼고 태엽을 감자 · 원 그리기 또는 A · D 번갈아', variant: 'lamp', speed: 2.2 });
  }

  // ───────── ⑦ 라디오 씨가 멈춘다 → ⑧ 크랭크 ─────────
  function checkBoth() { const a = st(); if (a.pipDone && a.lampDone && A3.is('persuade')) after(1.0, radioDown); }
  function radioDown() {
    const s = G.state, p = s.player;
    st().stage = 'radioDown';
    G.irisThen(p.x, p.y - 50, () => {
      s.npcs.radio.off = true;
      WT.Audio.play('sfx_radio_off');
      WT.Story.play(WT.DIALOGUE.radioDown, () => {
        const r = W.npcs.radio; p.x = r.x - 90; p.y = r.y + 20; p.dir = 'side'; p.facing = 1;
        after(0.9, () => say('gramo', D().gramo.crank, { onClose: crank }));
      });
    });
  }
  function crank() {
    WT.Wind.open(crankDone, {
      title: '라디오 씨 크랭크 감기', guide: '다 같이 돌리자! 마우스로 원 그리기 또는 A · D 번갈아',
      variant: 'radio', back: 'wind_radio_back', keyImg: 'wind_crank', ratchet: 'sfx_crank',
      notch: ['그라모 영감이 한 바퀴!', '피프와 반디가 한 바퀴!', '보글이 마지막 한 바퀴!'], speed: 1.4
    });
  }
  function crankDone() {
    const s = G.state, r = W.npcs.radio;
    s.npcs.radio.power = 'wind'; s.npcs.radio.off = false;
    WT.Audio.jingle('jingle_radio_crank');
    WT.UI.flash();
    G.burst('note', r.x, r.y - 150, 12); G.burst('sparkle', r.x, r.y - 80, 10);
    s.player.action = 'happy'; s.player.actionT = 2;
    s.ui.cutscene = { type: 'party', t: 0, dur: 2.0, then: () => say('radio', D().radio.crank, { onClose: act3End }) };
  }
  function act3End() {
    const s = G.state, p = s.player;
    G.irisThen(p.x, p.y - 50, () => WT.Story.play(WT.DIALOGUE.act3end, () => {
      st().stage = 'done';
      ['bunting', 'lantern', 'banner'].forEach((k) => { if (!s.house.unlocked.includes(k)) s.house.unlocked.push(k); });
      WT.UI.refreshToolbar();
      after(0.9, () => say('radio', D().radio.last, { onClose: () => { WT.Audio.play('sfx_reward_unlock'); G.toast(D().toast.done); } }));
    }));
  }

  // ───────── 대화 ─────────
  // 처리했으면 true. 제3막이 아닐 때는 false (기존 대사).
  A3.talk = function (id) {
    const s = G.state, a = st(), T = D();
    if (s.episode < 3) return false;
    if (WT.Act4 && WT.Act4.talk(id)) return true;
    const stage = a.stage;
    if (id === 'gramo') {
      if (stage === 'none') { say('gramo', T.gramo.ask, { onClose: A3.start }); return true; }
      if (stage === 'festival') { say('gramo', T.gramo.festival); return true; }
      if (stage === 'morning' || stage === 'trial') { say('gramo', T.gramo.morning); return true; }
      if (stage === 'persuade') { say('gramo', a.pipDone ? T.gramo.morning.slice(0, 1) : T.gramo.persuade); return true; }
      if (stage === 'done') { say('gramo', T.gramo.done); return true; }
      return false;
    }
    if (id === 'cuckoo') {
      const lines = stage === 'morning' || stage === 'trial' ? T.cuckoo.morning
        : stage === 'persuade' && !a.lampDone ? T.cuckoo.hint : T.cuckoo.idle;
      say('cuckoo', lines, { who: 'boss', mood: 'cuckoo', onClose: () => { if (lines === T.cuckoo.hint) a.hint = true; } });
      return true;
    }
    if (id === 'radio') {
      if (s.npcs.radio.off) return true;
      const mood = s.npcs.radio.power === 'battery' ? 'battery' : 'awake';
      if (stage === 'morning') { say('radio', T.radio.trial, { mood, onClose: startTrial }); return true; }
      if (stage === 'trial') { say('radio', T.radio.during, { mood }); return true; }
      if (stage === 'persuade') { say('radio', T.radio.persuade, { mood }); return true; }
      say('radio', T.radio.done, { mood }); return true;
    }
    if (id === 'pip') {
      if (s.npcs.pip.power === 'battery') {
        if (stage === 'persuade' && a.sheets.every(Boolean)) say('bogle', T.pip.sing, { onClose: restorePip });
        else flat('pip', T.pip.battery);
        return true;
      }
      if (a.pipDone) { say('pip', T.pip.after); return true; }
      return false;
    }
    if (id === 'lamp') {
      if (s.npcs.lamp.power === 'battery') {
        if (stage === 'persuade' && a.hint) say('bogle', T.lamp.ask, { onClose: startBlink });
        else flat('lamp', T.lamp.battery, () => { if (stage === 'persuade') G.toast(T.toast.lampHint); });
        return true;
      }
      if (a.lampDone) { say('lamp', T.lamp.after); return true; }
      return false;
    }
    return false;
  };

  // ───────── 상호작용 대상 ─────────
  A3.targets = function (consider, p) {
    const s = G.state, a = st(), R = WT.CFG.pickRange;
    if (s.episode < 3) return;
    if (A3.is('festival')) L.deco.forEach((d, i) => !a.deco[i] && consider({ type: 'deco', id: i, x: d.x, y: d.y, h: 60 }, dist(p, d), R + 10));
    if (A3.is('persuade')) L.sheets.forEach((q, i) => !a.sheets[i] && consider({ type: 'sheet', id: i, x: q.x, y: q.y, h: 44 }, dist(p, q), R));
    if (A3.at('persuade') && !a.ribbon) consider({ type: 'ribbon', x: L.ribbon.x, y: L.ribbon.y, h: 36 }, dist(p, L.ribbon), R);
  };
  A3.interact = function (t) {
    if (t.type === 'deco') { placeDeco(t.id); return true; }
    if (t.type === 'sheet') { pickSheet(t.id); return true; }
    if (t.type === 'ribbon') {
      st().ribbon = true; WT.Audio.play('sfx_key_pickup');
      G.state.player.action = 'happy'; G.state.player.actionT = 0.9;
      G.burst('sparkle', L.ribbon.x, L.ribbon.y - 20, 8); G.toast(D().toast.ribbon); return true;
    }
    return false;
  };

  A3.update = function (dt) {
    const s = G.state, a = s.act3;
    if (!a) return;
    if (a.after.length && !s.ui.transition && !s.ui.story && !s.ui.dialog) {
      const q = a.after[0]; q.t -= dt;
      if (q.t <= 0) { a.after.shift(); q.fn(); }
    }
    if (a.stage === 'trial' && !G.locked()) { a.trialT += dt; if (a.trialT >= TRIAL_MAX && !pending('trialEnd')) endTrial(); }
    blinkUpdate(dt);
    // 건전지 사물 둘레의 잡음 불꽃
    if (s.scene === 'town') ['pip', 'lamp', 'radio'].forEach((id) => {
      if (!WT.npcVisible(id) || s.npcs[id].power !== 'battery' || s.npcs[id].off) return;
      const n = W.npcs[id];
      if (Math.random() < dt * 0.7) G.particles.push({ type: 'static', x: n.x + (Math.random() - 0.5) * 40, y: n.y - n.h * (0.5 + Math.random() * 0.4), vx: 0, vy: -10, life: 0, max: 0.35, rot: Math.random(), size: 1 });
    });
  };
  A3.speedMul = () => (G.state.player.power === 'battery' ? BATTERY_SPEED : null);

  // ───────── 목표 · 안내 ─────────
  A3.objective = function () {
    const s = G.state, a = st();
    if (s.episode < 3) return null;
    switch (a.stage) {
      case 'none': return '그라모 영감에게 말을 걸어 보자';
      case 'festival': return `축제 장식을 놓자  ${a.deco.filter(Boolean).length} / 3`;
      case 'arrived': return '낯선 손님이 왔다';
      case 'morning': return '라디오 씨에게 말을 걸어 보자';
      case 'trial': return '건전지로 마을을 한 바퀴 돌아보자';
      case 'persuade': {
        const n = a.sheets.filter(Boolean).length;
        const pip = a.pipDone ? '피프 ✓' : n < 3 ? `피프 악보 ${n}/3` : '피프에게 악보 들려주기';
        const lamp = a.lampDone ? '가로등 ✓' : a.hint ? '가로등에게 깜빡임 따라 하기' : '가로등의 깜빡임을 되찾자';
        return `${pip} · ${lamp}`;
      }
      case 'radioDown': return '라디오 씨에게 크랭크를 달아 주자';
      default: return null;
    }
  };
  A3.tip = function () {
    const s = G.state, a = st(), p = s.player;
    if (G.locked()) return null;
    if (a.stage === 'festival') { const t = G.nearestTarget(); return t && t.type === 'deco' ? 'E : 장식 놓기' : null; }
    if (a.stage === 'trial') {
      if (dist(p, L.fence) < 300) return '덤불 너머에 빨간 리본이 보인다 · Space';
      return a.trialT > 6 ? '빠르다… 그런데 뭔가 조용하다' : null;
    }
    if (a.stage === 'persuade' && !a.hint && !a.lampDone && a.pipDone) return '뻐꾸기 백작에게 가로등 이야기를 물어보자';
    return null;
  };

  // ───────── 그리기 ─────────
  A3.drawList = function (list, t, ctx, R) {
    const s = G.state, a = s.act3;
    if (!a || s.episode < 3) return;
    L.deco.forEach((d, i) => {
      const def = WT.FURN[d.type];
      if (a.deco[i]) list.push({ y: d.y, f: () => { const b = s.world.musicOn ? Math.abs(Math.sin(t * WT.CFG.bpm / 60 * Math.PI + i)) : 0; R.shadow(d.x, d.y, def.foot * 1.2, 0.22); WT.drawThing(ctx, def.asset, PH[d.type], d.x, d.y - b * 4, { h: def.h, sy: 1 + b * 0.04 }); } });
      else if (a.stage === 'festival') list.push({ y: d.y - 1, f: () => {
        ctx.save(); ctx.setLineDash([10, 8]); ctx.lineDashOffset = -t * 30; ctx.strokeStyle = C.cream; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.ellipse(d.x, d.y, 46, 16, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.35 + Math.sin(t * 3 + i) * 0.1; WT.drawThing(ctx, def.asset, PH[d.type], d.x, d.y, { h: def.h }); ctx.restore();
      } });
    });
    if (a.stage === 'persuade') L.sheets.forEach((q, i) => !a.sheets[i] && list.push({ y: q.y, f: () => {
      const y = q.y - 4 - Math.abs(Math.sin(t * 3 + i)) * 7; R.shadow(q.x, q.y, 28, 0.2);
      WT.drawThing(ctx, 'prop_sheet_music', PH.sheet, q.x, y, { h: 40, rot: Math.sin(t * 2 + i) * 0.2 });
    } }));
    if (A3.at('trial') && !a.ribbon) list.push({ y: L.ribbon.y, f: () => {
      R.shadow(L.ribbon.x, L.ribbon.y, 30, 0.2);
      WT.drawThing(ctx, 'prop_ribbon', PH.ribbon, L.ribbon.x, L.ribbon.y - Math.abs(Math.sin(t * 2.4)) * 3, { h: 36 });
    } });
  };
  // 화면 위에 덮는 것: 체험 남은 시간, 깜빡임 미니게임
  A3.drawOverlay = function (ctx, t) {
    const s = G.state, a = s.act3;
    if (!a || s.scene !== 'town') return;
    if (a.stage === 'trial') {
      const k = Math.max(0, 1 - a.trialT / TRIAL_MAX), x = 20, y = 80;
      ctx.save();
      ctx.fillStyle = 'rgba(155,163,174,.92)'; ctx.strokeStyle = C.outline; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.roundRect(x, y, 240, 40, 12); ctx.fill(); ctx.stroke();
      WT.drawThing(ctx, 'prop_battery', PH.battery, x + 24, y + 34, { h: 28 });
      ctx.fillStyle = '#5c6470'; ctx.beginPath(); ctx.roundRect(x + 46, y + 13, 180, 14, 7); ctx.fill();
      ctx.fillStyle = k < 0.2 ? '#e07a3a' : '#e8edf2'; ctx.beginPath(); ctx.roundRect(x + 46, y + 13, 180 * k, 14, 7); ctx.fill();
      ctx.restore();
    }
    const b = a.blink;
    if (b) {
      const n = W.npcs.lamp, cx = n.x + 30, cy = n.y - 260;
      ctx.save();
      ctx.font = '22px "Do Hyeon", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const w = Math.max(300, ctx.measureText(b.msg).width + 50);
      ctx.fillStyle = b.flashWrong > 0 ? 'rgba(160,50,45,.94)' : 'rgba(43,34,48,.92)'; ctx.strokeStyle = C.cream; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.roundRect(cx - w / 2, cy - 60, w, 96, 16); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.cream; ctx.fillText(b.msg, cx, cy - 36);
      SEQ.forEach((k, i) => {
        const x = cx - (SEQ.length - 1) * 40 + i * 80, got = b.input[i];
        ctx.fillStyle = got ? C.yellow : 'rgba(244,230,200,.18)'; ctx.strokeStyle = C.cream; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(x - (k === 'L' ? 30 : 14), cy - 2, k === 'L' ? 60 : 28, 20, 10); ctx.fill(); ctx.stroke();
      });
      if (b.phase === 'input' && b.press != null) {
        const held = Math.min(1, (G.time - b.press) / LONG);
        ctx.fillStyle = held >= 1 ? C.yellow : C.cream; ctx.fillRect(cx - 60, cy + 26, 120 * held, 5);
      }
      ctx.restore();
    }
  };
  // ───────── 소리 ─────────
  // 마을 BGM을 스템으로 받아 건전지 주민의 악기를 끈다. 스템이 없으면 원곡 + 얇아짐 필터.
  const STEMS = ['bgm_town_awake_base', 'bgm_town_awake_pip', 'bgm_town_awake_lamp'];
  A3.music = function (s) {
    const a = s.act3;
    if (!a || s.scene !== 'town' || s.episode < 3) return null;
    const pipB = s.npcs.pip.power === 'battery', lampB = s.npcs.lamp.power === 'battery';
    const nBat = (pipB ? 1 : 0) + (lampB ? 1 : 0);
    const radioNear = WT.npcVisible('radio') && s.npcs.radio.power === 'battery' && !s.npcs.radio.off ? Math.max(0, 1 - dist(s.player, W.npcs.radio) / 320) : 0;
    const loops = { sfx_battery_hum: (nBat ? 0.35 + nBat * 0.2 : 0) + (s.player.power === 'battery' ? 0.5 : 0), amb_radio_static: radioNear };
    if (a.stage === 'festival') return { want: 'bgm_festival', loops };
    if (a.stage === 'arrived') return { want: 'bgm_radio_theme', fallback: 'bgm_town_awake', thin: 0.2, loops };
    if (['morning', 'trial', 'persuade', 'radioDown'].includes(a.stage)) {
      let thin = s.player.power === 'battery' ? 0.85 : nBat * 0.22;
      if (s.npcs.radio.off) thin = Math.max(thin, 0.35);
      return { want: 'bgm_town_awake', layers: STEMS, gains: [1, pipB ? 0 : 1, lampB ? 0 : 1], thin: STEMS.every((id) => WT.Audio.defs[id]) ? (s.player.power === 'battery' ? 0.8 : 0) : thin, loops };
    }
    return { loops };
  };
  // 가로등 빛: 깜빡임 미니게임 중에는 미니게임이 정한다
  A3.lampLit = function () { const b = st() && st().blink; return b ? !!b.lit : null; };
})();
