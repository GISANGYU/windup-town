// 입력, 화면 크기, 메인 루프
(function () {
  const K = WT.KEY;
  const held = new Set();
  const isKey = (code, name) => K[name].includes(code);
  const input = { held: (name) => K[name].some((c) => held.has(c)) };

  const canvas = document.getElementById('game');
  canvas.width = WT.W; canvas.height = WT.H;

  function fit() {
    const s = Math.min(window.innerWidth / WT.W, (window.innerHeight - 8) / WT.H);
    document.documentElement.style.setProperty('--scale', s);
  }
  window.addEventListener('resize', fit); fit();

  function toGame(e) {
    const r = canvas.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width * WT.W, (e.clientY - r.top) / r.height * WT.H];
  }

  window.addEventListener('keydown', (e) => {
    const s = WT.Game.state, c = e.code;
    WT.Audio.unlock();
    if (c === 'KeyM' && !e.repeat) { const m = WT.Audio.toggleMute(); WT.Game.toast(m ? '소리 끔 (M)' : '소리 켬 (M)'); return; }
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace', 'F8'].includes(c)) e.preventDefault();
    if (e.repeat) { held.add(c); return; }
    held.add(c);
    if (isKey(c, 'debug')) { s.ui.debug = !s.ui.debug; return; }
    if (s.scene === 'intro' && !s.ui.transition) { if (WT.Intro.key(e)) return; }
    if (isKey(c, 'reload')) { WT.Assets.reloadAll(); WT.Game.toast('이미지 다시 불러오기'); return; }
    if (s.ui.story) {
      if (isKey(c, 'act') || isKey(c, 'jump') || c === 'Enter') WT.Story.next();
      else if (isKey(c, 'cancel')) WT.Story.skip();
      return;
    }
    if (WT.Wind.active) { WT.Wind.key(c); return; }
    if (WT.Act3 && WT.Act3.blinkActive() && !s.ui.dialog) {
      if (isKey(c, 'act') || isKey(c, 'jump')) WT.Act3.blinkDown(); else if (isKey(c, 'cancel')) WT.Act3.blinkCancel();
      return;
    }
    if (WT.BatteryModal && WT.BatteryModal.active) { WT.BatteryModal.key(c, true); return; }
    if (WT.Unwind && WT.Unwind.active) { WT.Unwind.key(c); return; }
    if (s.scene === 'road' && !s.ui.dialog) { if (isKey(c, 'cancel')) return; WT.Road.key(c, true); return; }
    if (s.ui.dialog) {
      if (isKey(c, 'act') || isKey(c, 'jump') || c === 'Enter') WT.UI.advance();
      else if (isKey(c, 'cancel')) WT.UI.closeDialog();
      return;
    }
    if (isKey(c, 'cancel')) return WT.Game.cancel();
    if (s.scene === 'town' || s.scene === 'arena') {
      if (isKey(c, 'act')) WT.Game.interact();
      else if (isKey(c, 'jump')) WT.Game.jump();
      else if (c === 'KeyQ' && WT.Act3) WT.Act3.swapKey();
    } else if (s.scene === 'house') {
      const type = Object.keys(WT.FURN).find((t) => WT.FURN[t].key === e.key);
      if (type) WT.Game.selectPlacing(type);
      else if (isKey(c, 'del')) WT.Game.deleteSelected();
      else if (isKey(c, 'flip')) WT.Game.flipSelected();
      else if (isKey(c, 'snap')) { WT.Game.toggleSnap(); WT.UI.refreshToolbar(); }
    }
  });
  window.addEventListener('keyup', (e) => {
    held.delete(e.code);
    const s = WT.Game.state;
    if (WT.Act3 && WT.Act3.blinkActive() && (isKey(e.code, 'act') || isKey(e.code, 'jump'))) WT.Act3.blinkUp();
    if (WT.BatteryModal && WT.BatteryModal.active) WT.BatteryModal.key(e.code, false);
    if (s.scene === 'road') WT.Road.key(e.code, false);
  });
  window.addEventListener('blur', () => held.clear());

  window.addEventListener('pointerdown', () => WT.Audio.unlock());
  canvas.addEventListener('pointerdown', (e) => { const [x, y] = toGame(e); if (WT.Unwind && WT.Unwind.active) WT.Unwind.pointer('down', x, y); else WT.Game.pointerDown(x, y); canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => { const [x, y] = toGame(e); if (WT.Unwind && WT.Unwind.active) WT.Unwind.pointer('move', x, y); else WT.Game.pointerMove(x, y); });
  canvas.addEventListener('pointerup', (e) => { const [x, y] = toGame(e); if (WT.Unwind && WT.Unwind.active) WT.Unwind.pointer('up', x, y); WT.Game.pointerUp(); });

  // 시작
  WT.Game.reset();
  WT.Assets.init();
  WT.Render.init(canvas);
  WT.UI.init();
  WT.Wind.init();
  WT.Intro.init();
  // ───────── 소리 연출 (매 프레임) ─────────
  const D = WT.DIALOGUE;
  let lastPanel = null;
  const STORIES = () => [D.opening, D.ending, D.act2open, D.act2end, D.act3open, D.act3montage, D.act3recall, D.act3key, D.act4open, D.act4zone2, D.act4gate, D.act5open, D.act5collapse, D.act5reborn, D.act5end, D.act6open, D.act6flash, D.act6voice, D.act6end, D.act7open, D.act7stairs, D.act7ballroom, D.act7mem1, D.act7mem2, D.act7end].filter(Boolean);
  // 컷신별 BGM (제3막~)
  function storyBgm(panels) {
    const map = new Map([[D.act3open, 'bgm_festival'], [D.act3montage, 'bgm_radio_theme'], [D.act3recall, 'bgm_recall_night'], [D.act3key, 'bgm_departure'],
      [D.act4open, 'bgm_story'], [D.act5open, 'bgm_story'], [D.act5end, 'bgm_ending'],
      [D.act6open, 'bgm_parcel'], [D.act6flash, 'bgm_flashback_duet'], [D.act6end, 'bgm_story'], [D.act7open, 'bgm_orgel_town'], [D.act7stairs, 'bgm_ballroom'], [D.act7ballroom, 'bgm_ballroom'], [D.act7end, 'bgm_duet_ending']]);
    const id = map.get(panels);
    return id && WT.Audio.defs[id] ? id : id ? 'bgm_story' : null;
  }
  // 막 스크립트가 켜고 끄는 반복음
  const LOOP_IDS = ['sfx_battery_hum', 'amb_radio_static', 'sfx_jump_charge', 'sfx_charge', 'sfx_elevator', 'sfx_conveyor', 'sfx_magnet_loop', 'sfx_bomb_roll', 'amb_orgel_scream', 'sfx_note_tornado'];
  function audioTick(t) {
    const A = WT.Audio, s = WT.Game.state, st = s.ui.story;
    // 불러오기: 로컬은 바로, 배포 사이트는 이미지가 80% 들어오거나 6초가 지나면 (이미지 먼저)
    if (!A.started) { const as = WT.Assets.status(); if (!WT.Assets.useWeb || as.ok / as.all > 0.8 || t > 6) A.load(); }
    let want = null, rate = 1;
    if (st) {
      const p = st.panels[st.i];
      const key = p ? STORIES().indexOf(st.panels) + ':' + st.i : null;
      if (p && key !== lastPanel) {
        lastPanel = key;
        if (p.art === 'curtain') A.jingle('jingle_act_end');
        if (st.panels === D.act2open && st.i === 1) A.play('sfx_clock_midnight'); // 자정 종 12번
        else if (p.art === 'teaser') A.jingle('jingle_tease');
        else if (p.art === 'citySignal') { A.play('sfx_broadcast_chime'); A.jingle('jingle_city_signal'); }
        else if (p.art === 'radioDown') A.play('sfx_radio_off');
        else if (p.art === 'parcel') A.play('sfx_parcel_shake');
        else if (p.art === 'orgelScream') { A.play('sfx_parcel_open'); A.play('amb_orgel_scream', { delay: 0.3, vol: 0.4 }); }
      }
      want = (st.panels === D.opening || st.panels === D.act2open) ? 'bgm_story' : storyBgm(st.panels);
      if (st.panels === D.act2open) rate = 0.9;
    } else {
      lastPanel = null;
      if (s.scene === 'intro') want = 'bgm_house';
      else if (s.scene === 'arena') want = s.boss && s.boss.state !== 'intro' && s.boss.state !== 'defeated' ? 'bgm_boss' : null;
      else if (s.scene === 'house') { want = 'bgm_house'; rate = s.world.musicOn ? 1 : 0.92; }
      else want = s.world.musicOn ? 'bgm_town_awake' : 'bgm_town_sleepy';
    }
    // 제3막 이후: 막별 음악 결정(스템, 얇아짐)
    let mus = null;
    if (!st) mus = (WT.Road && WT.Road.music && WT.Road.music(s)) || (WT.Act6 && WT.Act6.music(s)) || (WT.Act3 && WT.Act3.music && WT.Act3.music(s));
    if (mus && mus.want !== undefined) want = mus.want;
    if (want && !A.defs[want]) want = mus && mus.fallback !== undefined ? mus.fallback : 'bgm_town_awake'; // 아직 없는 곡이면 대신
    if (s.ui.cutscene || A.held()) { want = null; A.layers(null); } // 그라모 깨어남·징글 동안은 BGM 비움
    else if (mus && mus.layers && A.layers(mus.layers, mus.gains)) want = null;
    else A.layers(null);
    A.bgm(want, { rate });
    A.thin(mus ? mus.thin || 0 : 0);
    (mus && mus.loops ? Object.entries(mus.loops) : []).forEach(([id, v]) => A.loopIf(id, v > 0.01, { vol: (A.defs[id] ? A.defs[id].vol : 0.3) * Math.min(1, v) }));
    LOOP_IDS.forEach((id) => { if (!mus || !mus.loops || !(id in mus.loops)) A.loopIf(id, false); });
    A.loopIf('amb_projector', !!st);
    A.loopIf('sfx_gear_roll', s.scene === 'arena' && !!s.arena && s.arena.gears.some((g) => g.warn <= 0));
    A.loopIf('sfx_wind_unwind', WT.Wind.unwinding());
    const dz = s.scene === 'arena' && s.arena ? s.arena.drowsy : 0;
    A.loopIf('sfx_drowsy_loop', dz > 0.01, { vol: (A.defs.sfx_drowsy_loop ? A.defs.sfx_drowsy_loop.vol : 0.4) * Math.min(1, dz) });
  }

  if (/[?&]act2/.test(location.search)) { // 바로 제2막 (점검용)
    const s = WT.Game.state; s.quest.stage = 'completed'; s.world.musicOn = true; s.act1Done = true; s.npcs.pip.delivered = true;
    ['gramo', 'pip', 'lamp'].forEach((k) => { s.npcs[k].mood = 'awake'; }); s.house.unlocked.push('gramophone');
    WT.Game.startAct2();
  } else if (/[?&]act[34567]/.test(location.search)) { // 점검용: ?act3 마을(3막 직전) · ?act4&zone=1~3 · ?act5 볼트 남작 · ?act6 6막 직전 마을 · ?act7&zone=5~7
    const s = WT.Game.state, n = +location.search.match(/act([34567])/)[1];
    const q = (k) => (location.search.match(new RegExp(k + '=([a-z0-9]+)')) || [])[1];
    s.quest.stage = 'completed'; s.world.musicOn = true; s.act1Done = true; s.npcs.pip.delivered = true; s.episode = 3;
    ['gramo', 'pip', 'lamp'].forEach((k) => { s.npcs[k].mood = 'awake'; }); s.house.unlocked.push('gramophone', 'cuckoo');
    s.player.x = 640; s.player.y = 470; WT.Game.setScene('town'); WT.UI.setScene('town');
    if (q('modal')) WT.BatteryModal.open(q('modal'), () => {}); // 점검용: &modal=insert|remove
    if (q('unwind')) setTimeout(() => WT.Unwind.open(() => {}, { band: [0.3, 0.75] }), 100); // 점검용: &unwind=1 풀기 모달
    if (n >= 6) { // 5막까지 끝난 마을
      s.episode = 4; Object.assign(s.act3, { stage: 'done' }); s.inventory.gramoKey = false; s.npcs.gramo.keys = 2;
      Object.assign(s.npcs.radio, { reborn: true, power: 'wind' }); WT.Act3.refresh();
      if (n === 7) { WT.Act6.skipToRoad(); WT.Road.enter(+(q('zone') || 5)); const r = s.road; if (q('x')) { r.p.x = +q('x'); r.camX = Math.max(0, r.p.x - 420); } if (q('power')) r.p.power = q('power'); if (q('fight') && r.boss) WT.RoadBoss.startNow(r); }
    } else if (n >= 4) {
      Object.assign(s.act3, { stage: 'gone' }); s.inventory.gramoKey = true; s.inventory.battery = 1;
      s.npcs.pip.power = s.npcs.lamp.power = 'battery'; s.npcs.pip.frozen = s.npcs.lamp.frozen = true; s.npcs.gramo.keys = 2;
      WT.Road.enter(n === 5 ? 4 : +(q('zone') || 1));
      const r = s.road; if (q('x')) { r.p.x = +q('x'); r.camX = Math.max(0, r.p.x - 420); } if (q('power')) r.p.power = q('power');
      if (q('swap')) { r.p.swapT = 0.6; r.p.swapTo = r.p.power === 'wind' ? 'battery' : 'wind'; r.freezeShot = true; } // 점검용: 갈아끼우기 연출
      if (q('fight') && r.boss) { WT.RoadBoss.startNow(r); if (q('reborn')) { r.boss.reborn = true; r.boss.round = 2; r.boss.plugged = true; WT.RoadBoss.startNow(r); } } // &fight=1(&reborn=1)
    }
  } else if (/[?&]story=/.test(location.search)) { // 점검용: ?story=act3recall&i=1 컷신 한 장 바로 보기
    const m = location.search.match(/story=([a-z0-9]+)/i), i = +((location.search.match(/[?&]i=(\d+)/) || [])[1] || 0);
    if (m && WT.DIALOGUE[m[1]]) { WT.Story.play(WT.DIALOGUE[m[1]]); WT.Game.state.ui.story.i = i; WT.Game.state.ui.story.tr = null; }
  } else if (!/[?&](nointro|selftest)/.test(location.search)) WT.Intro.show();

  let last = performance.now(), seenVersion = -1, wasMusic = false;
  function loop(now) {
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now; // 첫 프레임 rAF 시각이 앞설 수 있어 음수 방지
    WT.Game.update(dt, input);
    WT.Render.frame(now / 1000);
    const s = WT.Game.state;
    if (WT.Assets.version !== seenVersion) { seenVersion = WT.Assets.version; if (s.scene === 'house') WT.UI.refreshToolbar(); }
    if (s.world.musicOn !== wasMusic) { wasMusic = s.world.musicOn; document.body.classList.toggle('music', wasMusic); }
    const mech = s.scene === 'town' && s.act3 ? ['pip', 'lamp'].filter((k) => s.npcs[k].power === 'battery').length + (s.player.power === 'battery' ? 1 : 0) : 0;
    if (String(Math.min(3, mech)) !== document.body.dataset.mech) document.body.dataset.mech = String(Math.min(3, mech));
    WT.UI.debug();
    if (WT.Intro.active) WT.Intro.update();
    audioTick(now / 1000);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // ───────── 자동 점검: index.html?selftest ─────────
  if (/[?&]selftest/.test(location.search)) {
    const G = WT.Game, out = [];
    const ok = (name, cond) => out.push((cond ? 'PASS ' : 'FAIL ') + name);
    const step = (n) => { for (let i = 0; i < n; i++) G.update(1 / 60, { held: () => false }); };
    const closeAll = () => { let g = 0; while (G.state.ui.dialog && g++ < 20) WT.UI.closeDialog(); };
    try {
      const s = G.state; WT.Story.skip();
      const W = WT.WORLD;
      // 이동 충돌: 집으로 걸어 들어가기
      const p = s.player; p.x = 230; p.y = 380;
      G.update(0.5, { held: (k) => k === 'up' }); ok('집 벽을 통과하지 않음', p.y >= 330);
      // 연못
      p.x = 560; p.y = 700; for (let i = 0; i < 60; i++) G.update(1 / 30, { held: (k) => k === 'up' }); ok('연못을 통과하지 않음', p.y > 652);
      // 덤불: 걸어서는 못 들어감, 점프로는 넘음
      p.x = 1080; p.y = 600; for (let i = 0; i < 40; i++) G.update(1 / 30, { held: (k) => k === 'up' }); ok('덤불 앞에서 막힘', p.y > 545);
      G.jump(); for (let i = 0; i < 30; i++) G.update(1 / 60, { held: (k) => k === 'up' }); step(60); ok('점프로 덤불을 넘음', p.y < 545 && p.y > 430 && p.z === 0);
      // 퀘스트 전 피프
      p.x = 420; p.y = 520; G.interact(); ok('피프 대화 열림', s.ui.dialog && s.ui.dialog.who === 'pip'); closeAll();
      ok('열쇠는 퀘스트 전 줍기 불가', (G.pickKey(1), s.inventory.keys === 0));
      // 그라모 → 시작
      p.x = 640; p.y = 400; G.interact(); ok('그라모 대화(sleepy)', s.ui.dialog && s.ui.dialog.mood === 'sleepy'); closeAll();
      ok('퀘스트 started', s.quest.stage === 'started');
      // 열쇠 3개 (E 거리 판정 포함)
      W.keys.forEach((k) => { p.x = k.x; p.y = k.y + 30; p.z = 0; s.player.action = null; G.interact(); closeAll(); });
      ok('열쇠 3개', s.inventory.keys === 3);
      ok('퀘스트 ready', s.quest.stage === 'ready');
      // 감기
      p.x = 640; p.y = 400; G.interact(); closeAll();
      ok('감기 모달 열림', WT.Wind.active);
      ok('모달 중 이동 잠금', G.locked());
      WT.Wind.key('KeyA'); for (let i = 0; i < 12; i++) WT.Wind.key(i % 2 ? 'KeyA' : 'KeyD');
      step(1); ok('번갈아 누르기로 감김', parseFloat(document.getElementById('windBar').style.width) > 30);
      WT.Wind.add(0.4); step(1); ok('딸깍 2단계', document.getElementById('windN2').classList.contains('on'));
      WT.Wind.finishNow(); step(10);
      ok('모달 닫힘', !WT.Wind.active);
      step(70);
      ok('퀘스트 completed', s.quest.stage === 'completed');
      ok('음악 켜짐', s.world.musicOn);
      ok('그라모 awake', s.npcs.gramo.mood === 'awake');
      ok('깨어난 장면 동안 말풍선 없음', !s.ui.dialog && s.ui.cutscene && s.ui.cutscene.type === 'party');
      step(150); ok('2초 뒤 그라모 말풍선', !!s.ui.dialog && s.ui.dialog.who === 'gramo');
      closeAll();
      step(70); ok('제1막 끝 컷신(아이리스 후)', !!s.ui.story && s.ui.story.panels === WT.DIALOGUE.ending);
      WT.Story.skip(); step(70);
      // 피프 보상
      p.x = 420; p.y = 520; G.interact(); closeAll();
      ok('미니 축음기 해금', s.house.unlocked.includes('gramophone'));
      // 집
      p.x = 230; p.y = 380; G.interact(); step(70);
      ok('집 안으로 전환', s.scene === 'house');
      G.selectPlacing('chair'); G.pointerDown(400, 500); ok('의자 배치', s.house.furniture.length === 1);
      G.selectPlacing('gramophone'); G.pointerDown(700, 520); ok('축음기 배치', s.house.furniture.length === 2);
      G.pointerDown(400, 470); ok('클릭 선택', s.house.selected === s.house.furniture[0].id);
      G.pointerMove(600, 600); G.pointerUp(); ok('드래그 이동', s.house.furniture[0].x === 600);
      G.flipSelected(); ok('뒤집기', s.house.furniture[0].flip === true);
      G.deleteSelected(); ok('삭제', s.house.furniture.length === 1);
      G.cancel(); step(70); ok('밖으로 나옴', s.scene === 'town');
      // ───── 제2막 ─────
      ok('제1막 완료 표시', s.act1Done === true);
      p.x = 640; p.y = 400; G.interact(); closeAll(); step(80);
      ok('제2막 컷신', !!s.ui.story && s.ui.story.panels === WT.DIALOGUE.act2open);
      WT.Story.skip(); step(80);
      ok('보스 아레나 진입', s.scene === 'arena' && s.episode === 2);
      WT.Boss.startFight(); step(150);
      ok('라운드 1 공격 시작', s.boss.state === 'attack' && s.boss.atk.type === 'shock');
      // 실제 키 이벤트로 확인 (함수 직접 호출이 아닌 입력 경로 점검)
      const key = (code) => { window.dispatchEvent(new KeyboardEvent('keydown', { code })); window.dispatchEvent(new KeyboardEvent('keyup', { code })); };
      p.z = 0; p.vz = 0; key('Space'); ok('아레나: Space 키로 점프', p.vz > 0 || p.z > 0); step(60);
      { const bs = s.boss.state, ba = s.boss.atk; s.boss.state = 'tired'; s.boss.atk = null; p.x = WT.Boss.A.boss.x + 70; p.y = WT.Boss.A.boss.y + 60; p.z = 0;
        key('KeyE'); ok('아레나: E 키로 과감기', WT.Wind.active); WT.Wind.close(); s.boss.state = bs; s.boss.atk = ba; }
      // 충격파: 땅에 있으면 맞고, 점프 중이면 무사
      const A2 = WT.Boss.A; p.x = A2.boss.x; p.y = A2.boss.y + 150 * 0.55; p.z = 0; s.arena.inv = 0;
      s.arena.rings = [{ r: 148, speed: 0, hit: false }]; const hp0 = s.arena.hp; step(1);
      ok('충격파 피격', s.arena.hp === hp0 - 1);
      s.arena.inv = 0; s.arena.rings = [{ r: 148, speed: 0, hit: false }]; p.z = 60; p.vz = 0; const hp1 = s.arena.hp;
      WT.Boss.update(1 / 60); ok('점프로 충격파 회피', s.arena.hp === hp1);
      p.z = 0; s.arena.rings = []; s.arena.hp = 3; s.arena.inv = 0;
      // 작은 톱니: 점프로 넘기 / 큰 톱니: 점프해도 맞음
      p.x = 600; p.y = 500; p.z = 60; s.arena.gears = [{ x: 600, y: 500, vx: 0, r: 22, big: false, rot: 0, warn: 0 }]; WT.Boss.update(1 / 60);
      ok('작은 톱니 점프 회피', s.arena.hp === 3);
      s.arena.gears = [{ x: 600, y: 500, vx: 0, r: 40, big: true, rot: 0, warn: 0 }]; WT.Boss.update(1 / 60);
      ok('큰 톱니는 점프해도 피격', s.arena.hp === 2);
      s.arena.gears = []; p.z = 0; s.arena.inv = 0;
      // 졸음 안개: 안전지대 밖은 졸음 증가, 안은 감소
      s.arena.fog = 2; p.x = 900; p.y = 600; for (let i = 0; i < 30; i++) WT.Boss.update(1 / 60);
      ok('안개 밖 졸음 증가', s.arena.drowsy > 0.1);
      p.x = A2.safe.x; p.y = A2.safe.y; const dr = s.arena.drowsy; for (let i = 0; i < 30; i++) WT.Boss.update(1 / 60);
      ok('음표 구역 졸음 감소', s.arena.drowsy < dr);
      s.arena.fog = 0; s.arena.drowsy = 0; s.arena.hp = 3;
      // 과감기 3번
      for (let r = 1; r <= 3; r++) {
        s.boss.state = 'tired'; s.boss.t = 0; s.boss.atk = null; s.arena.rings = []; s.arena.gears = []; s.arena.fog = 0;
        p.x = A2.boss.x + 70; p.y = A2.boss.y + 60; p.z = 0; G.interact();
        if (r === 1) ok('과감기 모달 열림', WT.Wind.active);
        WT.Wind.finishNow(); step(100); if (r < 3) step(100);
      }
      ok('스프링 0', s.boss.springs === 0);
      step(160); ok('백작 퇴치', s.boss && s.boss.state === 'defeated');
      closeAll(); step(80);
      ok('제2막 끝 컷신', !!s.ui.story && s.ui.story.panels === WT.DIALOGUE.act2end);
      WT.Story.skip(); step(10);
      ok('마을 복귀 · 뻐꾸기시계 해금', s.scene === 'town' && s.house.unlocked.includes('cuckoo'));
      // ───── 제3막 「건전지가 온 날」 ─────
      { const D3 = WT.DIALOGUE, A3 = WT.Act3, BM = WT.BatteryModal;
        const stepH = (n, keys) => { for (let i = 0; i < n; i++) G.update(1 / 60, { held: (k) => keys.includes(k) }); };
        closeAll(); step(80);
        p.x = 640; p.y = 400; G.interact(); ok('3막: 그라모 축제 제안', !!s.ui.dialog && s.ui.dialog.who === 'gramo'); closeAll();
        step(80); ok('3막 오프닝 컷신(축제 → 그라모 태엽 풀림 → 라디오)', !!s.ui.story && s.ui.story.panels === D3.act3open && D3.act3open.length === 3);
        WT.Story.skip(); step(120);
        ok('라디오 씨 등장 대사', WT.npcVisible('radio') && !!s.ui.dialog && s.ui.dialog.who === 'radio' && s.npcs.gramo.mood === 'sleepy');
        closeAll(); ok('건전지가 퍼지는 컷신', !!s.ui.story && s.ui.story.panels === D3.act3montage);
        WT.Story.skip(); step(100); ok('피프·가로등 건전지', s.npcs.pip.power === 'battery' && s.npcs.lamp.power === 'battery');
        ok('라디오 씨가 보글에게도 건전지', !!s.ui.dialog && s.ui.dialog.lines === D3.act3.radio.gift); closeAll();
        ok('건전지 끼우기 모달', BM.active && G.locked());
        BM.finishNow(); step(80); ok('보글 건전지 상태 · 튜토리얼', !BM.active && p.power === 'battery' && s.act3.stage === 'tutorial');
        p.x = 300; p.y = 420; p.z = 0; stepH(80, ['right']); ok('달리면 보글의 혼잣말', !!s.ui.dialog && s.ui.dialog.who === 'bogle'); closeAll();
        p.vz = 0; G.jump(); ok('점프 막힘 → 깨달음', p.vz === 0 && !!s.ui.dialog && s.ui.dialog.lines === D3.act3.bogle.stiff); closeAll();
        key('KeyQ'); ok('Q → 건전지 빼기 모달', BM.active); BM.finishNow(); step(80);
        ok('태엽으로 돌아옴 · 건전지 보관', p.power === 'wind' && s.inventory.battery === 1); closeAll();
        key('KeyQ'); ok('Q 갈아끼우기: 0.6초 동안 잠금', G.locked()); step(45); ok('건전지로', p.power === 'battery');
        key('KeyQ'); step(45); ok('다시 태엽으로', p.power === 'wind' && s.act3.tut === 5);
        step(160); ok('회수 신호 컷신', !!s.ui.story && s.ui.story.panels === D3.act3recall && s.npcs.pip.frozen && s.npcs.lamp.frozen);
        WT.Story.skip(); step(80); ok('라디오 씨의 고백', !!s.ui.dialog && s.ui.dialog.lines === D3.act3.radio.confess);
        closeAll(); ok('그라모의 열쇠 · 출발 컷신', !!s.ui.story && s.ui.story.panels === D3.act3key);
        WT.Story.skip(); step(80); ok('열쇠를 받고 4막으로', s.inventory.gramoKey && s.npcs.gramo.keys === 2 && !!s.ui.story && s.ui.story.panels === D3.act4open);
        WT.Story.skip(); step(130); closeAll();
      }
      // ───── 제4막 「발전소로 가는 길」 · 중간 보스 ─────
      { const RD = WT.Road, P5 = RD.P, GY = WT.ROAD_GY, D5 = WT.DIALOGUE;
        const stepH = (n, keys) => { for (let i = 0; i < n; i++) G.update(1 / 60, { held: (k) => keys.includes(k) }); };
        const r = () => s.road, it = (type, n) => r().items.filter((q) => q.type === type)[n || 0];
        const place = (x, power, y) => { const q = r().p; q.x = x; q.y = y || GY; q.vy = 0; q.vx = 0; q.onGround = true; q.shortT = 0; q.hurtT = 0; q.swapT = 0; q.inv = 0; if (power) q.power = power; return q; };
        ok('4막 구간 1 · 라디오 씨 건전지 80', s.scene === 'road' && r().zone === 1 && r().radioBat === 80);
        { const q = place(200, 'wind'); r().battery = 100; key('KeyQ'); ok('갈아끼우는 동안 멈춤', q.swapT > 0.5); const x0 = q.x; stepH(30, ['right']); ok('0.6초 동안 못 움직임', q.x === x0); stepH(10, []); ok('건전지 모드로', q.power === 'battery'); }
        { const q = place(400, 'wind', GY - 120); q.onGround = false; q.vy = -200; r().battery = 100; key('KeyQ'); const y0 = q.y, vy0 = q.vy; stepH(20, ['right']);
          ok('공중에서도 Q · 갈아끼우는 동안 시간이 멈춤', q.y === y0 && q.vy === vy0 && q.swapT > 0); stepH(30, []); ok('멈춤이 풀리면 건전지 · 다시 떨어짐', q.power === 'battery' && q.y !== y0); stepH(40, []); }
        { const q = place(200, 'battery'), x0 = q.x; stepH(30, ['right']); ok('건전지: 1.6배 빠름', Math.abs((q.x - x0) - P5.walk * 1.6 / 2) < 3); key('Space'); ok('건전지: 점프 봉인', q.vy === 0); }
        place(it('charger').x, 'wind'); r().battery = 10; key('KeyE'); step(100); ok('충전소에서 E → 건전지 100', r().battery === 100);
        { const c = it('conveyor'), q = place(c.x + 100, 'wind'), x0 = q.x; stepH(30, ['right']); ok('태엽: 컨베이어에 밀려남', q.x < x0); }
        { const g = it('gate'), q = place(g.x - 30, 'battery'); r().battery = 100; stepH(70, ['right']); ok('건전지 속도로 셔터 통과', q.x > g.x + g.w + 10); }
        { const w = it('puddle'), q = place(w.x + 20, 'battery'); r().battery = 100; r().hp = 3; stepH(2, ['right']); ok('건전지로 물웅덩이 → 합선', q.shortT > 0 && r().hp === 2); }
        RD.clearNow(); step(5); step(110); step(80); ok('구간 2 컷신', !!s.ui.story && s.ui.story.panels === D5.act4zone2); WT.Story.skip(); step(130); closeAll();
        ok('구간 2 도시 · 라디오 씨 건전지 줄어듦', r().zone === 2 && r().radioBat < 80);
        { const d = it('door'); place(d.x - 60, 'wind'); stepH(40, ['right']); ok('태엽: 자동문 안 열림', r().p.x < d.x); r().p.power = 'battery'; r().battery = 100; stepH(40, ['right']); ok('건전지: 자동문 열림', r().p.x > d.x); }
        RD.clearNow(); step(5); step(110); step(80); ok('정문 컷신', !!s.ui.story && s.ui.story.panels === D5.act4gate); WT.Story.skip(); step(130);
        const b = () => r().boss;
        ok('중간 보스: 두꺼비집 문지기', r().zone === 3 && !!b() && b().kind === 'toad');
        closeAll(); ok('문지기 전투 시작', b().state === 'attack');
        step(40); ok('첫 공격: 자석 혀', !!b().atk && b().atk.type === 'tongue');
        { const t0 = b().atk.t; place(500, 'wind'); r().battery = 100; key('KeyQ'); step(20); ok('갈아끼우는 동안 보스 공격도 멈춤', b().atk.t === t0); step(30); }
        { place(500, 'wind'); stepH(50, []); ok('태엽은 혀에 끌려감', r().p.x > 520); place(500, 'battery'); r().battery = 100; stepH(50, ['left']); ok('건전지는 버팀', r().p.x <= 500); }
        { place(500, 'battery'); r().battery = 0.2; let err = null; try { stepH(60, ['left']); } catch (e) { err = e; }
          ok('보스전에서 건전지가 다 떨어지면 라디오 씨가 알려 줌', !err && !!s.ui.dialog && s.ui.dialog.lines === D5.act5.radio.empty); closeAll(); step(45);
          ok('자동으로 태엽으로 돌아와 계속 움직임', r().p.power === 'wind' && !G.locked());
          place(it('charger').x, 'wind'); key('KeyE'); step(100); ok('아레나 충전소에서 다시 충전', r().battery === 100); }
        const force = () => { b().queue = []; b().atk = null; b().gap = 0; Object.assign(b().haz, { floor: null, seq: null, bombs: [], strikes: [], puddles: [], magnet: 0, waves: [], tornados: [], combs: [] }); step(2); };
        force(); ok('과열 1: 머리 위 레버', b().state === 'over' && b().weak === 'high');
        place(990, 'wind'); key('KeyE'); ok('땅에서는 레버에 안 닿음', b().state === 'over');
        place(880, 'wind', GY - 170); key('KeyE'); ok('높은 발판에서 E → 차단기', b().state === 'hurt' && b().hits === 1);
        step(90); ok('2라운드', b().round === 1 && b().state === 'attack');
        r().p.x = 150; force(); ok('과열 2: 어디 있었든 같은 자리로 밀려남', b().state === 'over' && b().weak === 'rush' && r().p.x === 970 - 25 - 540);
        r().p.power = 'wind'; stepH(160, ['right']); ok('태엽 속도로는 입이 닫힘', b().state === 'recover' && b().hits === 1);
        step(70); r().p.x = 700; force(); r().p.power = 'wind'; r().battery = 100;
        key('KeyQ'); stepH(40, []); ok('밀려난 뒤 Q(시간 정지)로 건전지', r().p.power === 'battery');
        stepH(115, ['right']); key('KeyE'); ok('건전지로 달려 입 안 차단기(여유 있게)', b().state === 'hurt' && b().hits === 2 && b().t < 1.3);
        step(170); ok('문지기 쓰러짐', b().state === 'down' && !!s.ui.dialog); closeAll(); step(100);
        ok('5막 오프닝 컷신', !!s.ui.story && s.ui.story.panels === D5.act5open); WT.Story.skip(); step(130);
      }
      // ───── 제5막 「볼트 남작」 ─────
      { const GY = WT.ROAD_GY, D5 = WT.DIALOGUE;
        const stepH = (n, keys) => { for (let i = 0; i < n; i++) G.update(1 / 60, { held: (k) => keys.includes(k) }); };
        const r = () => s.road, b = () => r().boss;
        const place = (x, power, y) => { const q = r().p; q.x = x; q.y = y || GY; q.vy = 0; q.vx = 0; q.onGround = true; q.shortT = 0; q.hurtT = 0; q.swapT = 0; q.inv = 0; if (power) q.power = power; return q; };
        const force = () => { b().queue = []; b().atk = null; b().gap = 0; Object.assign(b().haz, { floor: null, seq: null, bombs: [], strikes: [], puddles: [], magnet: 0, waves: [], tornados: [], combs: [] }); step(2); };
        ok('최종 보스: 볼트 남작', r().zone === 4 && b().kind === 'volt' && r().radioBat === 40);
        closeAll(); ok('남작 전투 시작', b().state === 'attack');
        force(); ok('과열 1: 라디오 씨 잡음 방송(건전지 -20)', b().state === 'over' && b().weak === 'high' && r().radioBat === 20);
        place(860, 'wind', GY - 260); key('KeyE'); ok('높은 발판에서 플러그 뽑기', b().state === 'hurt' && b().hits === 1);
        step(90); force(); ok('과열 2: 밀려남 · 라디오 씨 건전지 0', b().weak === 'rush' && r().radioBat === 0);
        r().p.power = 'battery'; r().battery = 100; stepH(110, ['right']); key('KeyE'); ok('밀려난 자리에서 건전지로 달려 낮은 플러그', b().state === 'hurt' && b().hits === 2);
        step(130); ok('라디오 씨가 쓰러짐', b().state === 'collapse' && !!s.ui.dialog && s.ui.dialog.lines === D5.act5.radio.last);
        closeAll(); ok('쓰러짐 컷신', !!s.ui.story && s.ui.story.panels === D5.act5collapse); WT.Story.skip(); step(60);
        { let g = 0; while (s.ui.dialog && g++ < 6) WT.UI.closeDialog(); }
        ok('그라모의 열쇠를 꽂는 감기 모달', WT.Wind.active); WT.Wind.finishNow(); step(100);
        ok('변신 컷신', !!s.ui.story && s.ui.story.panels === D5.act5reborn && b().reborn && !s.inventory.gramoKey);
        WT.Story.skip(); step(60); closeAll(); ok('최종 라운드', b().round === 2 && b().state === 'attack');
        place(150, 'wind'); r().wind = 50; step(30); ok('라디오 씨 음표 안에서 태엽이 참', r().wind > 54);
        force(); ok('과열 3: 마지막 플러그', b().state === 'over' && b().weak === 'final');
        place(900, 'wind'); key('KeyE'); step(90); ok('플러그를 뽑으면 녹슨 크랭크', b().state === 'over' && b().plugged === false);
        key('KeyE'); ok('크랭크 과감기 모달', WT.Wind.active); WT.Wind.finishNow(); step(100);
        ok('남작이 작은 발전기로', b().state === 'small'); step(110); closeAll(); step(100);
        ok('결말 컷신', !!s.ui.story && s.ui.story.panels === D5.act5end); WT.Story.skip(); step(80);
        ok('마을로 · 친구들 깨어남 · 라디오 씨 남음', s.scene === 'town' && s.episode === 4 && !s.npcs.pip.frozen && s.npcs.radio.reborn && WT.npcVisible('radio'));
        p.x = WT.WORLD.npcs.radio.x; p.y = WT.WORLD.npcs.radio.y + 50; G.interact(); ok('결말 뒤 라디오 씨 대사', !!s.ui.dialog && s.ui.dialog.lines === D5.town4.radio); closeAll();
      }
      // ───── 제6막 「오르골이 도착한 날」 ─────
      { const D6 = WT.DIALOGUE, U = WT.Unwind;
        closeAll(); step(80);
        p.x = 420; p.y = 520; p.z = 0; G.interact(); ok('6막: 피프가 소포를 가져옴', !!s.ui.dialog && s.ui.dialog.lines === D6.act6.pip.parcel); closeAll();
        step(80); ok('6막 오프닝 컷신(소포 · 비명)', !!s.ui.story && s.ui.story.panels === D6.act6open);
        WT.Story.skip(); step(130); ok('그라모가 오르골을 알아봄', !!s.ui.dialog && s.ui.dialog.lines === D6.act6.gramo.know);
        closeAll(); ok('그라모의 회상 컷신', !!s.ui.story && s.ui.story.panels === D6.act6flash);
        WT.Story.skip(); step(100); ok('풀어 주기 가르침', !!s.ui.dialog && s.ui.dialog.lines === D6.act6.gramo.teach);
        closeAll(); ok('풀기 모달(띠 넓음)', U.active && U.state().band[0] < 0.25);
        U.simulate(0.6, 1.0); ok('알맞은 속도면 진행이 참', U.state().p > 0.25);
        { const p0 = U.state().p; U.simulate(1.4, 0.6); ok('너무 빠르면 튕김(진행 감소)', U.state().snaps >= 1 && U.state().p < p0); }
        { U.simulate(0.6, 0.5); const p1 = U.state().p; U.simulate(0.02, 2.5); ok('너무 느리면 다시 감김', U.state().p < p1); }
        U.finishNow(); step(80); ok('한 번 더 · 섬세하게', !!s.ui.dialog && s.ui.dialog.lines === D6.act6.gramo.again); closeAll();
        ok('두 번째 풀기(띠 좁음)', U.active && U.state().band[0] >= 0.3);
        U.simulate(0.5, 4); step(80); ok('알맞은 속도로 끝까지 풀림', !U.active && s.act6.calm);
        ok('오르골의 진짜 속도', !!s.ui.dialog && s.ui.dialog.lines === D6.act6.gramo.done); closeAll();
        ok('숨은 목소리 컷신', !!s.ui.story && s.ui.story.panels === D6.act6voice);
        WT.Story.skip(); step(100); ok('라디오 씨가 왈츠 주파수를 잡음', !!s.ui.dialog && s.ui.dialog.lines === D6.act6.radio.signal);
        closeAll(); ok('출발 컷신', !!s.ui.story && s.ui.story.panels === D6.act6end);
        WT.Story.skip(); step(80); ok('7막 오프닝 컷신', !!s.ui.story && s.ui.story.panels === D6.act7open);
        WT.Story.skip(); step(130); closeAll();
      }
      // ───── 제7막 「멈추지 않는 무도회」 ─────
      { const RD = WT.Road, GY = WT.ROAD_GY, D7 = WT.DIALOGUE, U = WT.Unwind;
        const stepH = (n, keys) => { for (let i = 0; i < n; i++) G.update(1 / 60, { held: (k) => keys.includes(k) }); };
        const r = () => s.road, it = (type, n) => r().items.filter((q) => q.type === type)[n || 0], b = () => r().boss;
        const place = (x, power, y) => { const q = r().p; q.x = x; q.y = y || GY; q.vy = 0; q.vx = 0; q.onGround = true; q.shortT = 0; q.hurtT = 0; q.swapT = 0; q.inv = 0; if (power) q.power = power; r().danceT = 0; return q; };
        const force = () => { b().queue = []; b().atk = null; b().gap = 0; Object.assign(b().haz, { floor: null, seq: null, bombs: [], strikes: [], puddles: [], magnet: 0, waves: [], tornados: [], combs: [] }); step(2); };
        ok('7막 구간 1 오르골 거리 · 라디오 씨 변신 모습', s.scene === 'road' && r().zone === 5 && r().radioReborn);
        { const sp = it('speaker'); place(sp.x, 'wind'); stepH(40, []); ok('음악 구역: 태엽은 춤 상태(저절로 깡충)', r().p.dancing && r().p.y < GY);
          place(sp.x, 'battery'); r().battery = 100; stepH(10, []); ok('건전지는 음악에 버팀', !r().p.dancing); }
        { const d = it('dancer'); place(d.x - 90, 'wind'); stepH(40, ['right']); ok('춤추는 주민이 길을 막음', r().p.x < d.x - 30);
          key('KeyE'); ok('주민 앞 E → 풀기 모달', U.active); U.finishNow(); step(70); ok('주민이 쉬고 길이 열림', d.state === 1);
          stepH(40, ['right']); ok('지나감', r().p.x > d.x + 20); }
        { const sp = it('speaker'); place(sp.x - 60, 'battery'); r().battery = 100; key('KeyE'); U.finishNow(); step(70); ok('스피커를 풀어 끔', sp.state === 1);
          place(sp.x, 'wind'); stepH(20, []); ok('꺼진 스피커 옆은 춤추지 않음', !r().p.dancing); }
        RD.clearNow(); step(5); step(110); step(80); ok('무도회장 계단 컷신', !!s.ui.story && s.ui.story.panels === D7.act7stairs); WT.Story.skip(); step(130); closeAll();
        { const c = it('comb'); place(c.x + 60, 'wind'); r().hp = 3; r().testClock = true; r().t = RD.COMB_T - (c.off || 0) + 0.01; stepH(2, []); ok('빗살이 솟을 때 바닥에 있으면 맞음', r().hp === 2); }
        RD.clearNow(); step(5); step(110); step(80); ok('무도회장 꼭대기 컷신', !!s.ui.story && s.ui.story.panels === D7.act7ballroom); WT.Story.skip(); step(130);
        ok('보스: 멜로디 여왕', r().zone === 7 && b().kind === 'melody'); closeAll(); ok('멜로디전 시작', b().state === 'attack');
        step(40); ok('첫 공격: 과감기 선율', !!b().atk && b().atk.type === 'wave');
        place(500, 'wind'); stepH(80, []); ok('선율이 지나가면 태엽은 춤', r().danceT > 0 || r().p.dancing);
        place(500, 'battery'); r().battery = 100; b().haz.waves.push({ r: 0, hit: false }); stepH(80, []); ok('건전지는 선율에 버팀', !(r().danceT > 0));
        force(); ok('삐걱: 너무 감겨 굳음', b().state === 'over' && b().weak === 'unwind');
        place(400, 'wind'); key('KeyE'); ok('멀리선 풀 수 없음', !U.active);
        place(850, 'wind'); key('KeyE'); ok('등 열쇠 풀기 모달', U.active && U.state().band[0] === 0.28);
        U.finishNow(); step(100); ok('기억 1 컷신', !!s.ui.story && s.ui.story.panels === D7.act7mem1); WT.Story.skip(); step(90); closeAll();
        ok('2라운드', b().round === 1 && b().state === 'attack');
        force(); place(850, 'wind'); key('KeyE'); ok('2라운드 풀기: 띠가 좁아지고 버팀', U.active && U.state().band[0] === 0.33 && U.state().opts.resist > 0);
        U.finishNow(); step(100); ok('기억 2 컷신', !!s.ui.story && s.ui.story.panels === D7.act7mem2); WT.Story.skip(); step(90);
        ok('라디오 씨가 느린 음악을 방송', !!s.ui.dialog && s.ui.dialog.lines === D7.act7.radio.final); closeAll();
        ok('최종 라운드 · 방송 중', b().round === 2 && b().broadcast);
        place(150, 'wind'); b().haz.waves.push({ r: 0, hit: false }); stepH(80, []); ok('라디오 씨 곁에선 선율에도 춤추지 않음', !(r().danceT > 0));
        force(); place(850, 'wind'); key('KeyE'); ok('마지막 풀기', U.active && U.state().band[0] === 0.38); U.finishNow(); step(100);
        ok('멜로디가 처음으로 멈춤', b().state === 'calm'); step(110); ok('…멈춰도 괜찮은 거구나', !!s.ui.dialog && s.ui.dialog.lines === D7.act7.melody.calm); closeAll(); step(100);
        ok('7막 결말 컷신', !!s.ui.story && s.ui.story.panels === D7.act7end); WT.Story.skip(); step(80);
        ok('마을로 · 멜로디가 남음 · 오르골 가구', s.scene === 'town' && s.episode === 5 && WT.npcVisible('melody') && s.house.unlocked.includes('orgel'));
        { const m = WT.WORLD.npcs.melody; p.x = m.x - 10; p.y = m.y + 50; G.interact(); ok('마을의 멜로디 대사', !!s.ui.dialog && s.ui.dialog.who === 'melody'); closeAll(); }
      }
      // 과감기 실패
      // 오디오: manifest 51개 불러오기 시도, 실패해도 에러 없음
      ok(`오디오 manifest ${Object.keys(WT.Audio.defs).length}개 로드 시도`, (() => { WT.Audio.load(); const n = Object.keys(WT.Audio.defs).length; return n >= 51 && WT.Audio.attempted() === (WT.Audio.ready ? n : 0); })());
      ok('오디오 실패해도 에러 없음', (() => { try { WT.Audio.play('없는_소리'); WT.Audio.play('sfx_jump'); WT.Audio.loop('sfx_gear_roll'); WT.Audio.stop('sfx_gear_roll'); WT.Audio.bgm('bgm_boss'); WT.Audio.bgm(null); WT.Audio.jingle('jingle_tease'); return true; } catch (e) { return false; } })());
      // 시작 화면
      step(80); WT.Intro.show(); step(2);
      ok('시작 화면 표시', s.scene === 'intro' && getComputedStyle(document.getElementById('intro')).display !== 'none');
      key('KeyD'); step(10); ok('시작 화면에서는 이동 안 함', s.scene === 'intro');
      document.getElementById('btnHelp').click(); ok('게임설명 모달 열림', WT.Intro.helpOpen && getComputedStyle(document.getElementById('help')).display !== 'none');
      key('Space'); ok('모달 열린 동안 시작 안 됨', s.scene === 'intro' && !WT.Intro.helpOpen);
      document.getElementById('btnHelp').click(); key('Escape'); ok('Esc로 모달 닫힘', !WT.Intro.helpOpen && document.activeElement === document.getElementById('btnHelp'));
      document.getElementById('btnStart').click(); step(40);
      ok('시작 → 오프닝 컷신', !!s.ui.story && s.ui.story.panels === WT.DIALOGUE.opening && s.scene === 'town' && !WT.Intro.active);
      WT.Story.skip(); step(70);
      ok('과감기 시간 초과 처리', (() => { let failed = false; WT.Wind.open(() => {}, { timeLimit: 0.2, onFail: () => { failed = true; } }); step(30); return failed && !WT.Wind.active; })());
    } catch (e) { out.push('ERROR ' + e.message + '\n' + e.stack); }
    const pre = document.createElement('pre'); pre.id = 'selftest'; pre.textContent = out.join('\n'); document.body.appendChild(pre);
    document.title = (out.some((l) => !l.startsWith('PASS')) ? 'SELFTEST FAIL' : 'SELFTEST PASS') + ` (${out.length})`;
  }
})();
