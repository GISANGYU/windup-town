// 제3막 「건전지가 온 날」 — 축제, 그라모의 태엽이 풀림, 라디오 씨와 건전지, 첫 건전지(갈아끼우기 연습),
// 회수 신호, 라디오 씨의 고백, 그라모의 열쇠, 출발. 기획: GAME_DESIGN.md 18절. 상태: state.act3
(function () {
  const G = WT.Game, W = WT.WORLD, C = WT.C;
  const D = () => WT.DIALOGUE.act3;
  const A3 = WT.Act3 = {};
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const ORDER = ['none', 'arrived', 'gift', 'tutorial', 'night', 'gone', 'done'];
  const BATTERY_SPEED = 1.6;
  const SWAP_T = 0.6;

  W.npcs.radio = { x: 772, y: 480, h: 130, foot: [60, 22], name: '라디오 씨' };
  W.npcs.cuckoo = { x: 292, y: 562, h: 110, foot: [50, 20], name: '뻐꾸기 백작' };
  W.act3 = { fence: { x: 1080, y: 486 } };

  A3.initState = function (s) {
    s.act3 = { stage: 'none', tut: 0, moved0: 0, swapT: 0, swapTo: null, after: [], blocked: 0 };
    s.npcs.pip.power = 'wind'; s.npcs.lamp.power = 'wind';
    s.npcs.pip.frozen = false; s.npcs.lamp.frozen = false;
    s.npcs.radio = { mood: 'awake', power: 'battery', off: false, reborn: false };
    s.npcs.cuckoo = { mood: 'cuckoo' };
    s.player.power = 'wind';
    s.inventory.battery = 0; s.inventory.gramoKey = false;
  };
  const st = () => G.state.act3;
  A3.at = (name) => ORDER.indexOf(st().stage) >= ORDER.indexOf(name);
  A3.is = (name) => st().stage === name;

  WT.npcVisible = function (id) {
    const s = G.state;
    if (!s || !s.act3) return id !== 'radio' && id !== 'cuckoo';
    if (id === 'radio') return A3.at('arrived') && !A3.is('gone');
    if (id === 'cuckoo') return s.episode >= 3;
    if (id === 'melody') return s.episode >= 5;
    return true;
  };
  WT.npcName = (id) => W.npcs[id].name;
  function refresh() { if (G.state.scene === 'town') G.solids = WT.buildSolids(); }
  A3.refresh = refresh;
  function after(t, fn) { st().after.push({ t, fn }); }
  function say(who, lines, o) {
    o = o || {};
    const name = o.name || (who === 'bogle' ? '보글' : WT.npcName(who));
    WT.UI.dialog(Object.assign({ who, name, mood: o.mood || 'awake', lines }, o));
  }
  const flat = (who, lines, onClose) => { say(who, lines, { mood: 'battery', flat: true, onClose }); };
  A3.busy = () => !!(G.state.act3 && G.state.act3.swapT > 0);

  // ───────── ① 축제 → 그라모의 태엽이 풀림 → 라디오 씨 ─────────
  A3.start = function () {
    const s = G.state, p = s.player;
    if (s.episode < 3 || !A3.is('none')) return;
    WT.Audio.play('sfx_quest_start');
    G.irisThen(p.x, p.y - 50, () => WT.Story.play(WT.DIALOGUE.act3open, () => {
      st().stage = 'arrived';
      s.npcs.gramo.mood = 'sleepy'; // 태엽이 풀려 쉬는 중
      p.x = 690; p.y = 545; p.dir = 'side'; p.facing = 1;
      refresh();
      WT.Audio.play('sfx_radio_on');
      after(0.8, () => say('radio', D().radio.arrive, { mood: 'battery', onClose: montage }));
    }));
  };
  // ② 건전지가 마을에 퍼짐
  function montage() {
    const s = G.state;
    WT.Story.play(WT.DIALOGUE.act3montage, () => {
      s.npcs.pip.power = 'battery'; s.npcs.lamp.power = 'battery';
      st().stage = 'gift';
      after(0.6, () => say('radio', D().radio.gift, { mood: 'battery', onClose: insert }));
    });
  }
  // ③ 보글의 첫 건전지 — 끼우기 모달
  function insert() {
    WT.BatteryModal.open('insert', () => {
      const s = G.state;
      s.player.power = 'battery';
      st().stage = 'tutorial'; st().tut = 0; st().moved0 = s.tut.moved;
      G.burst('sparkle', s.player.x, s.player.y - 60, 6);
      G.toast(D().tut.run);
    });
  }
  A3.jumpBlocked = function () {
    const a = st(), p = G.state.player;
    WT.Audio.play('sfx_jump_blocked');
    p.landT = 0.12;
    a.blocked++;
    if (A3.is('tutorial') && a.tut <= 1) { a.tut = 2; say('bogle', D().bogle.stiff, { mood: 'battery' }); }
  };
  // Q: 처음 빼기는 모달, 그다음부터는 0.6초 갈아끼우기
  A3.swapKey = function () {
    const s = G.state, a = st(), p = s.player;
    if (!A3.is('tutorial') || G.locked() || a.tut < 2) return false;
    if (a.tut === 2) {
      WT.BatteryModal.open('remove', () => {
        p.power = 'wind'; s.inventory.battery = 1; a.tut = 3;
        say('bogle', D().bogle.back, { onClose: () => G.toast(D().tut.swapIn) });
      });
      return true;
    }
    if (a.tut >= 5) return false;
    a.swapT = SWAP_T; a.swapTo = p.power === 'wind' ? 'battery' : 'wind';
    if (WT.Road && WT.Road.swapSound) WT.Road.swapSound(a.swapTo); else WT.Audio.play('sfx_swap');
    return true;
  };
  function swapDone() {
    const s = G.state, a = st(), p = s.player;
    p.power = a.swapTo;
    if (a.tut === 3 && p.power === 'battery') { a.tut = 4; G.toast(D().tut.swapBack); }
    else if (a.tut === 4 && p.power === 'wind') { a.tut = 5; G.toast(D().tut.done); after(1.2, night); }
  }

  // ───────── ④ 회수 신호 → ⑤ 고백 → ⑥ 그라모의 열쇠 → ⑦ 출발 ─────────
  function night() {
    const s = G.state, p = s.player;
    if (!A3.is('tutorial')) return;
    p.power = 'wind';
    G.irisThen(p.x, p.y - 50, () => {
      st().stage = 'night';
      s.npcs.pip.frozen = true; s.npcs.lamp.frozen = true;
      WT.Audio.play('sfx_recall_signal');
      WT.Story.play(WT.DIALOGUE.act3recall, () => {
        const r = W.npcs.radio; p.x = r.x - 90; p.y = r.y + 30; p.dir = 'side'; p.facing = 1;
        after(0.8, () => say('radio', D().radio.confess, { mood: 'battery', onClose: () =>
          say('gramo', D().gramo.night, { mood: 'sleepy', onClose: () =>
            say('gramo', D().gramo.key, { mood: 'sleepy', onClose: () =>
              say('bogle', D().gramo.keyReply, { onClose: () =>
                say('gramo', D().gramo.keyLast, { mood: 'sleepy', onClose: gift }) }) }) }) }));
      });
    });
  }
  function gift() {
    const s = G.state;
    WT.Story.play(WT.DIALOGUE.act3key, () => {
      s.inventory.gramoKey = true; s.npcs.gramo.keys = 2; s.npcs.gramo.mood = 'awake';
      WT.Audio.play('sfx_key_give');
      st().stage = 'gone';
      if (WT.Road) WT.Road.start();
    });
  }

  // ───────── 대화 ─────────
  A3.talk = function (id) {
    const s = G.state, a = st(), T = D(), stage = a.stage;
    if (s.episode < 3) return false;
    if (s.episode >= 4) { // 결말 뒤 마을 (4 = 5막 뒤, 5 = 7막 뒤)
      if (WT.Act6 && WT.Act6.talk(id)) return true;
      const L = s.episode >= 5 ? WT.DIALOGUE.town5 : WT.DIALOGUE.town4;
      if (id === 'melody') { say('melody', L.melody, { mood: 'calm' }); return true; }
      if (L[id]) { say(id, L[id]); return true; }
      if (id === 'cuckoo') { say('cuckoo', ['째깍. 음악이 둘이 되니 박자 맞추기가 바쁘군. 뻐꾹.'], { who: 'boss', mood: 'cuckoo' }); return true; }
      return false;
    }
    if (id === 'gramo') {
      if (stage === 'none') { say('gramo', T.gramo.ask, { onClose: A3.start }); return true; }
      if (stage === 'night') { say('gramo', T.gramo.night, { mood: 'sleepy' }); return true; }
      say('gramo', T.gramo.tired, { mood: 'sleepy' }); return true;
    }
    if (id === 'radio') { say('radio', T.radio.during, { mood: 'battery' }); return true; }
    if ((id === 'pip' || id === 'lamp') && s.npcs[id].power === 'battery') {
      flat(id, s.npcs[id].frozen ? ['……'] : id === 'pip' ? ['배달 완료. 다음.'] : ['……']);
      return true;
    }
    if (id === 'cuckoo') { say('cuckoo', ['째깍. 축제는 좋은데… 저 상자, 박자가 너무 딱딱하군.'], { who: 'boss', mood: 'cuckoo' }); return true; }
    return false;
  };
  A3.targets = function () {};
  A3.interact = function () { return false; };

  A3.update = function (dt) {
    const s = G.state, a = s.act3;
    if (!a) return;
    if (a.after.length && !s.ui.transition && !s.ui.story && !s.ui.dialog && !(WT.BatteryModal && WT.BatteryModal.active)) {
      const q = a.after[0]; q.t -= dt;
      if (q.t <= 0) { a.after.shift(); q.fn(); }
    }
    if (a.swapT > 0) { a.swapT -= dt; if (a.swapT <= 0) swapDone(); }
    if (a.stage === 'tutorial' && a.tut === 0 && s.tut.moved - a.moved0 > 260 && !s.ui.dialog) { a.tut = 1; say('bogle', D().bogle.fast, { mood: 'battery', onClose: () => G.toast(D().tut.jump) }); }
    // 건전지 사물 둘레의 잡음 불꽃 (굳은 것은 조용)
    if (s.scene === 'town') ['pip', 'lamp', 'radio'].forEach((id) => {
      const n = s.npcs[id];
      if (!WT.npcVisible(id) || n.power !== 'battery' || n.off || n.frozen) return;
      const w = W.npcs[id];
      if (Math.random() < dt * 0.7) G.particles.push({ type: 'static', x: w.x + (Math.random() - 0.5) * 40, y: w.y - w.h * (0.5 + Math.random() * 0.4), vx: 0, vy: -10, life: 0, max: 0.35, rot: Math.random(), size: 1 });
    });
  };
  A3.speedMul = () => (G.state.player.power === 'battery' ? BATTERY_SPEED : null);

  A3.objective = function () {
    const s = G.state, a = st();
    if (s.episode !== 3) return null;
    switch (a.stage) {
      case 'none': return '그라모 영감에게 말을 걸어 보자';
      case 'arrived': case 'gift': return '낯선 손님, 라디오 씨';
      case 'tutorial': return ['건전지로 마을을 달려 보자', 'Space를 눌러 보자', 'Q : 건전지 빼기', 'Q : 다시 건전지로', 'Q : 태엽으로', '갈아끼우기를 익혔다'][a.tut];
      case 'night': return '그날 밤';
      default: return null;
    }
  };
  A3.tip = function () {
    const a = st();
    if (G.locked() || !A3.is('tutorial')) return null;
    return [null, 'Space : 점프해 보자', 'Q : 건전지 빼기', 'Q : 다시 건전지로 갈아끼우기', 'Q : 태엽으로 갈아끼우기', null][a.tut];
  };
  A3.drawList = function () {};
  A3.drawOverlay = function (ctx) {
    const a = st();
    if (!a || a.swapT <= 0) return;
    const p = G.state.player, k = 1 - a.swapT / SWAP_T;
    ctx.save(); ctx.strokeStyle = C.yellow; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(p.x, p.y - 140, 18, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); ctx.stroke(); ctx.restore();
  };
  A3.blinkActive = () => false;
  A3.blinkDown = A3.blinkUp = A3.blinkCancel = () => {};
  A3.lampLit = () => null;

  // ───────── 소리 ─────────
  A3.music = function (s) {
    const a = s.act3;
    if (!a || s.scene !== 'town' || s.episode < 3) return null;
    const bat = ['pip', 'lamp'].filter((k) => s.npcs[k].power === 'battery' && !s.npcs[k].frozen).length;
    const radioNear = WT.npcVisible('radio') && s.npcs.radio.power === 'battery' ? Math.max(0, 1 - dist(s.player, W.npcs.radio) / 320) : 0;
    const loops = { sfx_battery_hum: (bat ? 0.3 + bat * 0.15 : 0) + (s.player.power === 'battery' ? 0.5 : 0), amb_radio_static: radioNear };
    if (s.episode >= 4) return { want: 'bgm_ending', fallback: 'bgm_town_awake', loops: {} };
    if (['arrived', 'gift', 'tutorial'].includes(a.stage)) return { want: 'bgm_radio_theme', fallback: 'bgm_town_awake', thin: s.player.power === 'battery' ? 0.6 : 0.15, loops };
    if (a.stage === 'night') return { want: 'bgm_recall_night', fallback: 'bgm_town_sleepy', thin: 0.2, loops: {} };
    return { loops };
  };
})();
