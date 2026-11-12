// 제6막 「오르골이 도착한 날」 — 소포, 비명 지르는 오르골, 그라모의 회상, 풀어 주기 배우기, 숨은 목소리, 출발.
// 기획: GAME_DESIGN.md 23절. 상태: state.act6. 7막은 횡스크롤(road.js 구간 5~7).
(function () {
  const G = WT.Game, W = WT.WORLD, PH = WT.PH;
  const D = () => WT.DIALOGUE.act6;
  const A6 = WT.Act6 = {};
  const ORGEL = { x: 640, y: 470 };
  W.npcs.melody = { x: 545, y: 378, h: 140, foot: [50, 18], name: '멜로디 여왕' };

  A6.initState = function (s) { s.act6 = { stage: 'none', after: [], tries: 0 }; s.npcs.melody = { mood: 'awake' }; };
  const st = () => G.state.act6;
  function after(t, fn) { st().after.push({ t, fn }); }
  function say(who, lines, o) {
    o = o || {};
    WT.UI.dialog(Object.assign({ who, name: o.name || (who === 'bogle' ? '보글' : W.npcs[who].name), mood: o.mood || 'awake', lines }, o));
  }

  // ───────── 흐름 ─────────
  function parcel() {
    const s = G.state, p = s.player;
    st().stage = 'parcel';
    G.irisThen(p.x, p.y - 50, () => WT.Story.play(WT.DIALOGUE.act6open, () => {
      p.x = ORGEL.x - 90; p.y = ORGEL.y + 20; p.dir = 'side'; p.facing = 1;
      after(0.8, () => say('gramo', D().gramo.know, { onClose: () => WT.Story.play(WT.DIALOGUE.act6flash, () => after(0.6, teach)) }));
    }));
  }
  function teach() {
    st().stage = 'learn';
    say('gramo', D().gramo.teach, { onClose: () => unwind(1) });
  }
  function unwind(n) {
    const opts = n === 1
      ? { title: '오르골 풀어 주기', band: [0.18, 0.95], rate: 0.4, guide: D().tut.first, back: 'wind_orgel_back' }
      : { title: '오르골 풀어 주기 · 섬세하게', band: [0.3, 0.75], rate: 0.34, back: 'wind_orgel_back' };
    WT.Unwind.open(() => {
      if (n === 1) { st().half = true; say('gramo', D().gramo.again, { onClose: () => unwind(2) }); return; }
      st().stage = 'voice'; st().calm = true;
      WT.Audio.play(WT.Audio.defs.sfx_orgel_voice ? 'sfx_orgel_voice' : 'sfx_reward_unlock', { delay: 0.6 });
      say('gramo', D().gramo.done, { onClose: () => WT.Story.play(WT.DIALOGUE.act6voice, () => after(0.6, () =>
        say('radio', D().radio.signal, { onClose: () => say('gramo', D().gramo.send, { onClose: depart }) }))) });
    }, opts);
  }
  function depart() {
    st().stage = 'gone';
    WT.Story.play(WT.DIALOGUE.act6end, () => { if (WT.Road) WT.Road.startAct7(); });
  }
  A6.skipToRoad = function () { st().stage = 'gone'; st().calm = true; };

  // ───────── 대화 ─────────
  A6.talk = function (id) {
    const s = G.state, a = st();
    if (s.episode !== 4 || !a) return false;
    if (a.stage === 'none') {
      if (id === 'pip') { say('pip', D().pip.parcel, { onClose: parcel }); return true; }
      return false;
    }
    if (id === 'gramo' && a.stage === 'learn') { say('gramo', D().gramo.teach.slice(2), { onClose: () => unwind(a.half ? 2 : 1) }); return true; }
    return false;
  };
  A6.objective = function () {
    const s = G.state, a = st();
    if (!a || s.episode !== 4) return null;
    if (a.stage === 'none') return '피프가 뭔가 들고 뛰어온다 · 말을 걸어 보자';
    if (a.stage === 'learn') return '그라모 영감에게 풀어 주기 배우기';
    if (a.stage === 'parcel' || a.stage === 'voice') return '오르골 마을에서 온 소포';
    return null;
  };
  A6.update = function (dt) {
    const s = G.state, a = s.act6;
    if (!a) return;
    if (a.after.length && !s.ui.transition && !s.ui.story && !s.ui.dialog && !(WT.Unwind && WT.Unwind.active)) {
      const q = a.after[0]; q.t -= dt; if (q.t <= 0) { a.after.shift(); q.fn(); }
    }
  };
  // 광장 바닥의 오르골
  A6.drawList = function (list, t, ctx, R) {
    const s = G.state, a = st();
    if (!a || s.episode !== 4 || a.stage === 'none' || a.stage === 'gone') return;
    list.push({ y: ORGEL.y, f: () => {
      R.shadow(ORGEL.x, ORGEL.y, 60, 0.25);
      const wild = !a.calm;
      WT.drawThing(ctx, wild ? 'prop_orgel_wild' : 'prop_orgel_calm', PH.orgel, ORGEL.x + (wild ? (Math.random() - 0.5) * 4 : 0), ORGEL.y, { h: 70, t, wild, rot: wild ? Math.sin(t * 40) * 0.04 : 0 });
    } });
  };
  A6.music = function (s) {
    const a = s.act6;
    if (!a || s.scene !== 'town' || s.episode !== 4 || a.stage === 'none') return null;
    return { want: 'bgm_parcel', fallback: 'bgm_town_awake', thin: a.calm ? 0 : 0.25, loops: { amb_orgel_scream: a.calm ? 0 : 0.6 } };
  };
})();
