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
    if (WT.Act4 && WT.Act4.key && WT.Act4.key(c, true)) return;
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
    if (WT.Act4 && WT.Act4.key) WT.Act4.key(e.code, false);
    if (s.scene === 'road') WT.Road.key(e.code, false);
  });
  window.addEventListener('blur', () => held.clear());

  window.addEventListener('pointerdown', () => WT.Audio.unlock());
  canvas.addEventListener('pointerdown', (e) => { const [x, y] = toGame(e); WT.Game.pointerDown(x, y); canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => { const [x, y] = toGame(e); WT.Game.pointerMove(x, y); });
  canvas.addEventListener('pointerup', () => WT.Game.pointerUp());

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
  const STORIES = () => [D.opening, D.ending, D.act2open, D.act2end, D.act3open, D.radioDown, D.act3end, D.act4open, D.act4chase, D.act4past, D.act4end, D.act5open, D.act5zone2, D.act5zone3, D.act5end].filter(Boolean);
  // 컷신별 BGM (제3막~)
  function storyBgm(panels) {
    if (panels === D.act3open) return 'bgm_festival';
    if (panels === D.act3end) return 'bgm_town_awake';
    if (panels === D.act4open) return 'bgm_act4_tension';
    if (panels === D.act4past) return 'bgm_flashback';
    if (panels === D.act4end || panels === D.act5open) return 'bgm_story';
    if (panels === D.act5end) return 'bgm_finale';
    return null;
  }
  // 막 스크립트가 켜고 끄는 반복음
  const LOOP_IDS = ['sfx_battery_hum', 'amb_radio_static', 'sfx_stake_pull', 'sfx_jump_charge', 'sfx_charge', 'sfx_elevator', 'sfx_conveyor'];
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
    if (!st) mus = (WT.Road && WT.Road.music && WT.Road.music(s)) || (WT.Act4 && WT.Act4.music && WT.Act4.music(s)) || (WT.Act3 && WT.Act3.music && WT.Act3.music(s));
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
  } else if (/[?&]act[345]/.test(location.search)) { // 바로 제3·4·5막 (점검용)
    const s = WT.Game.state, n = +location.search.match(/act([345])/)[1];
    s.quest.stage = 'completed'; s.world.musicOn = true; s.act1Done = true; s.npcs.pip.delivered = true; s.episode = 3;
    ['gramo', 'pip', 'lamp'].forEach((k) => { s.npcs[k].mood = 'awake'; }); s.house.unlocked.push('gramophone', 'cuckoo');
    if (n >= 4) { s.act3.stage = 'done'; s.act3.pipDone = s.act3.lampDone = s.act3.named = true; s.npcs.radio.power = 'wind'; s.inventory.battery = 1; s.house.unlocked.push('bunting', 'lantern', 'banner'); }
    if (n >= 5 && WT.Act4) WT.Act4.skipToEnd();
    s.player.x = 640; s.player.y = 470; WT.Game.setScene('town'); WT.UI.setScene('town');
    if (n === 5 && WT.Road) { // ?act5&zone=2&x=3000&power=battery (점검용)
      const q = (k) => (location.search.match(new RegExp(k + '=([a-z0-9]+)')) || [])[1];
      WT.Road.enter(+(q('zone') || 1));
      const r = s.road; if (q('x')) { r.p.x = +q('x'); r.camX = Math.max(0, r.p.x - 420); } if (q('power')) { r.p.power = q('power'); r.battery = 100; }
      r.after = [];
    }
    // 점검용: ?act3&shot=trial|persuade|radioDown — 그 단계 화면으로 바로
    const shot = (location.search.match(/shot=(\w+)/) || [])[1];
    if (n === 4 && shot === 'stakes') WT.Act4.debugStakes();
    if (n === 3 && shot) {
      const a = s.act3; a.stage = shot === 'festival' ? 'festival' : shot;
      if (['trial', 'persuade', 'radioDown'].includes(shot)) { s.npcs.pip.power = shot === 'trial' ? 'battery' : 'wind'; s.npcs.lamp.power = 'battery'; }
      if (shot === 'trial') { s.player.power = 'battery'; s.player.x = 1000; s.player.y = 600; }
      if (shot === 'radioDown') { s.npcs.radio.off = true; s.npcs.lamp.power = 'wind'; }
      WT.Act3.refresh();
    }
  } else if (!/[?&](nointro|selftest)/.test(location.search)) WT.Intro.show();

  let last = performance.now(), seenVersion = -1, wasMusic = false;
  function loop(now) {
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now; // 첫 프레임 rAF 시각이 앞설 수 있어 음수 방지
    WT.Game.update(dt, input);
    WT.Render.frame(now / 1000);
    const s = WT.Game.state;
    if (WT.Assets.version !== seenVersion) { seenVersion = WT.Assets.version; if (s.scene === 'house') WT.UI.refreshToolbar(); }
    if (s.world.musicOn !== wasMusic) { wasMusic = s.world.musicOn; document.body.classList.toggle('music', wasMusic); }
    const mech = s.scene === 'town' && s.act3 ? ['pip', 'lamp'].filter((k) => s.npcs[k].power === 'battery').length + (s.player.power === 'battery' ? 1 : 0) + (s.act4 && WT.Act4 ? WT.Act4.mech() : 0) : 0;
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
      // ───── 제3막 ─────
      { const A3 = WT.Act3, L3 = WT.WORLD.act3, D3 = WT.DIALOGUE;
        closeAll(); step(80);
        p.x = 640; p.y = 400; G.interact(); ok('3막: 그라모 축제 제안', !!s.ui.dialog && s.ui.dialog.who === 'gramo'); closeAll();
        ok('3막: 축제 준비 시작', s.act3.stage === 'festival');
        L3.deco.forEach((d) => { p.x = d.x; p.y = d.y + 30; p.z = 0; s.player.action = null; G.interact(); });
        ok('축제 장식 3개', s.act3.deco.every(Boolean));
        step(150); ok('3막 오프닝 컷신', !!s.ui.story && s.ui.story.panels === D3.act3open);
        WT.Story.skip(); step(130);
        ok('라디오 씨 등장', WT.npcVisible('radio') && !!s.ui.dialog && s.ui.dialog.who === 'radio');
        closeAll(); step(90);
        ok('다음 날: 피프·가로등 건전지', s.act3.stage === 'morning' && s.npcs.pip.power === 'battery' && s.npcs.lamp.power === 'battery');
        p.x = 420; p.y = 520; G.interact();
        ok('건전지 말투: 한 번에 출력', !!s.ui.dialog && s.ui.dialog.flat && document.getElementById('cardTyped').textContent === '배달 완료. 다음.'); closeAll();
        const R3 = WT.WORLD.npcs.radio; p.x = R3.x; p.y = R3.y + 50; G.interact(); closeAll();
        ok('보글 건전지 체험 시작', s.act3.stage === 'trial' && p.power === 'battery');
        p.x = 640; p.y = 520; { const x0 = p.x; G.update(1 / 60, { held: (k) => k === 'left' }); ok('건전지: 1.6배 빠름', Math.abs((x0 - p.x) - WT.CFG.speed * 1.6 / 60) < 0.3); }
        p.z = 0; p.vz = 0; G.jump(); ok('건전지: 점프 봉인', p.vz === 0 && p.z === 0);
        p.x = 1000; p.y = 600; G.jump(); step(70);
        ok('덤불 앞 점프 실패 → 체험 끝', !!s.ui.dialog && s.ui.dialog.who === 'bogle'); closeAll();
        ok('건전지를 빼고 1개 보관', s.act3.stage === 'persuade' && p.power === 'wind' && s.inventory.battery === 1);
        L3.sheets.forEach((q, i) => A3.interact({ type: 'sheet', id: i }));
        ok('악보 조각 3개', s.act3.sheets.every(Boolean));
        p.x = 420; p.y = 520; G.interact(); closeAll(); ok('피프 감기 모달', WT.Wind.active);
        WT.Wind.finishNow(); step(100); closeAll();
        ok('피프가 태엽으로', s.npcs.pip.power === 'wind' && s.act3.pipDone);
        p.x = 845; p.y = 350; G.interact(); closeAll(); ok('힌트 전 가로등은 반응 없음', !A3.blinkActive());
        p.x = 292; p.y = 600; G.interact(); closeAll(); ok('뻐꾸기 백작 힌트', s.act3.hint);
        p.x = 845; p.y = 350; G.interact(); closeAll(); ok('깜빡임 미니게임 시작', A3.blinkActive() && G.locked());
        step(220); ok('따라 하기 차례', s.act3.blink && s.act3.blink.phase === 'input');
        const press = (d) => { A3.blinkDown(); step(Math.round(d * 60)); A3.blinkUp(); step(4); };
        press(0.6); ok('틀리면 다시 보여 줌', s.act3.blink.phase === 'show');
        step(260); press(0.1); press(0.6); press(0.1); step(60);
        ok('깜빡임 성공 → 감기 모달', WT.Wind.active); WT.Wind.finishNow(); step(100); closeAll();
        ok('가로등 이름 「반디」', s.act3.named && WT.npcName('lamp') === '반디' && s.npcs.lamp.power === 'wind');
        step(160); ok('라디오 씨 멈춤 컷신', !!s.ui.story && s.ui.story.panels === D3.radioDown && s.npcs.radio.off);
        WT.Story.skip(); step(130); closeAll(); ok('크랭크 감기 모달', WT.Wind.active);
        WT.Wind.finishNow(); step(240); closeAll(); step(80);
        ok('3막 끝 컷신 · 태엽 라디오', !!s.ui.story && s.ui.story.panels === D3.act3end && s.npcs.radio.power === 'wind');
        WT.Story.skip(); step(130); closeAll();
        ok('3막 완료 · 축제 장식 해금', s.act3.stage === 'done' && s.house.unlocked.includes('banner'));
      }
      // ───── 제4막 ─────
      { const A4 = WT.Act4, D4 = WT.DIALOGUE, a = s.act4;
        const R4 = WT.WORLD.npcs.radio; p.x = R4.x; p.y = R4.y + 50; p.z = 0; G.interact(); closeAll(); step(80);
        ok('4막 오프닝 컷신', !!s.ui.story && s.ui.story.panels === D4.act4open);
        WT.Story.skip(); step(130); closeAll();
        ok('4막: 측량기 3대 · 라디오 씨 동행', a.stage === 'stakes' && a.surveyors.length === 3 && A4.following() && !WT.npcVisible('radio'));
        step(150); ok('말뚝 둘레가 회색으로 번짐', A4.greyAt(560, 300) > 0.3);
        const sv = a.surveyors;
        A4.interact({ type: 'surveyor', id: 0 }); ok('잡음 방송 → 측량기 멈춤', sv[0].state === 'stun');
        A4.interact({ type: 'surveyor', id: 1 }); ok('잡음 쿨다운 중엔 안 됨', sv[1].state !== 'stun');
        A4.interact({ type: 'surveyor', id: 0 }); ok('멈춘 동안 건전지 빼기 → 정지', sv[0].state === 'stopped');
        step(370); A4.interact({ type: 'surveyor', id: 1 }); A4.interact({ type: 'surveyor', id: 1 }); ok('두 번째 측량기 정지', sv[1].state === 'stopped');
        { const k = a.stakes[0]; p.x = k.x; p.y = k.y + 24; p.z = 0; ok('E 길게 누르기 시작', A4.key('KeyE', true) && !!a.hold); step(30); A4.key('KeyE', false); ok('중간에 떼면 안 뽑힘', !k.pulled && !a.hold); }
        for (let n = 0; n < 12 && a.stakes.some((k) => !k.pulled); n++) { const i = a.stakes.findIndex((k) => !k.pulled), k = a.stakes[i]; p.x = k.x; p.y = k.y + 24; a.hold = { i, t: 0 }; step(70); }
        ok('말뚝 모두 뽑음', a.stakes.every((k) => k.pulled));
        step(150); ok('추격 컷신', !!s.ui.story && s.ui.story.panels === D4.act4chase);
        WT.Story.skip(); step(130);
        ok('추격: 보글이 건전지로', a.stage === 'chase' && p.power === 'battery');
        { const f = sv.find((q) => q.state === 'flee'); p.x = f.x + 30; p.y = f.y; step(2); }
        ok('잡으면 건전지가 닳고 지도 떨어짐', a.stage === 'map' && p.power === 'wind' && s.inventory.batteryEmpty && !!a.map);
        p.x = a.map.x; p.y = a.map.y + 20; G.interact(); ok('도시 지도 획득', s.inventory.map === true);
        step(110); ok('라디오 씨 회상 컷신', !!s.ui.story && s.ui.story.panels === D4.act4past);
        WT.Story.skip(); step(130); closeAll(); step(80);
        ok('4막 끝 컷신', !!s.ui.story && s.ui.story.panels === D4.act4end);
        WT.Story.skip(); step(130);
        ok('4막 완료 · 라디오 씨 제자리', a.stage === 'done' && WT.npcVisible('radio'));
      }
      // ───── 제5막 (횡스크롤) ─────
      { const RD = WT.Road, P5 = RD.P, GY = WT.ROAD_GY, D5 = WT.DIALOGUE;
        const stepH = (n, keys) => { for (let i = 0; i < n; i++) G.update(1 / 60, { held: (k) => keys.includes(k) }); };
        const r = () => s.road, it = (type, n) => r().items.filter((q) => q.type === type)[n || 0];
        const place = (x, power) => { const q = r().p; q.x = x; q.y = GY; q.vy = 0; q.onGround = true; q.shortT = 0; q.hurtT = 0; q.swapT = 0; q.inv = 0; if (power) q.power = power; return q; };
        ok('4막 끝 → 라디오 씨 대사가 바로 나옴', !!s.ui.dialog && s.ui.dialog.who === 'radio'); closeAll(); step(80);
        ok('5막 오프닝 컷신', !!s.ui.story && s.ui.story.panels === D5.act5open);
        WT.Story.skip(); step(130); closeAll();
        ok('5막: 횡스크롤 구간 1 · 건전지는 빈 채로', s.scene === 'road' && r().zone === 1 && r().p.power === 'wind' && r().battery === 0);
        { const q = place(300), x0 = q.x; stepH(1, ['right']); ok('태엽: 기본 속도', Math.abs((q.x - x0) - P5.walk / 60) < 0.5); }
        key('KeyQ'); ok('빈 건전지로는 못 갈아끼움', r().p.swapT <= 0 && r().p.power === 'wind');
        place(it('charger').x); key('KeyE'); step(100); ok('충전소에서 E → 건전지 100', r().battery === 100);
        place(300); key('Space'); ok('태엽: Space 점프', r().p.vy < 0); step(60);
        { const q = place(300); key('KeyQ'); ok('갈아끼우는 동안 멈춤', q.swapT > 0); const x0 = q.x; stepH(30, ['right']); ok('0.6초 동안 못 움직임', q.x === x0); stepH(10, []); ok('건전지 모드로', q.power === 'battery'); }
        { const q = place(300), x0 = q.x; stepH(1, ['right']); ok('건전지: 1.6배 빠름', Math.abs((q.x - x0) - P5.walk * 1.6 / 60) < 0.5); key('Space'); ok('건전지: 점프 봉인', q.vy === 0); }
        { const g = it('gate'), q = place(g.x - 30, 'battery'); r().battery = 100; stepH(80, ['right']); ok('건전지 속도로 셔터 통과', q.x > g.x + g.w + 10);
          g.state = 0; g.t = 0; g.snd = 0; place(g.x - 30, 'wind'); stepH(150, ['right']); ok('태엽 속도면 셔터에 막힘', r().p.x < g.x + g.w); }
        { const l = it('lift'); place(l.x + 50, 'wind'); key('KeyE'); ok('태엽 발판: 감기 모달', WT.Wind.active); WT.Wind.finishNow(); step(100); step(200); ok('발판이 끝까지 올라감', l.state === 2); }
        { const q = place(1570); q.y = GY + 10; q.onGround = false; step(40); step(90); closeAll(); ok('구덩이에 빠지면 체크포인트에서 다시', Math.abs(r().p.x - r().checkpoint) < 2); }
        RD.clearNow(); step(5); ok('구간 1 통과', r().cleared); step(110); step(80);
        ok('구간 2 컷신', !!s.ui.story && s.ui.story.panels === D5.act5zone2); WT.Story.skip(); step(130); closeAll();
        ok('구간 2 공장 지대', r().zone === 2);
        { const c = it('conveyor'), q = place(c.x + 100, 'wind'), x0 = q.x; stepH(30, ['right']); ok('태엽: 컨베이어에 밀려남', q.x < x0);
          place(c.x + 100, 'battery'); r().battery = 100; const x1 = r().p.x; stepH(30, ['right']); ok('건전지: 컨베이어 통과', r().p.x > x1); }
        { const w = it('puddle'), q = place(w.x + 20, 'battery'); r().battery = 100; r().hp = 3; stepH(2, ['right']); ok('건전지로 물웅덩이 → 합선', q.shortT > 0 && r().hp === 2);
          const q2 = place(w.x + 20, 'wind'); stepH(2, ['right']); ok('태엽은 물웅덩이 괜찮음', q2.shortT <= 0 && r().hp === 2); }
        { const b = it('bridge'); place(b.post, 'wind'); key('KeyE'); WT.Wind.finishNow(); step(100); step(60); ok('도개교 감기 → 다리 내려옴', b.state === 2); }
        RD.clearNow(); step(5); step(110); step(80); WT.Story.skip(); step(130); closeAll();
        ok('구간 3 도시', r().zone === 3);
        { const d = it('door'); place(d.x - 60, 'wind'); stepH(40, ['right']); ok('태엽: 자동문 안 열림', r().p.x < d.x);
          r().p.power = 'battery'; r().battery = 100; stepH(40, ['right']); ok('건전지: 자동문 열림', r().p.x > d.x); }
        { const e = it('elevator'); place(e.x + 60, 'battery'); r().battery = 100; stepH(150, []); ok('건전지로 승강기 올라감', e.y > 200); }
        { const q = place(400, 'wind'); r().wind = 0.01; stepH(5, ['right']); ok('태엽이 다 풀리면 잠듦', q.sleepT > 0); step(220); closeAll(); ok('체크포인트에서 태엽 다시 가득', r().wind > 98); }
        RD.clearNow(); step(5); step(110); step(80);
        ok('5막 끝 컷신', !!s.ui.story && s.ui.story.panels === D5.act5end); WT.Story.skip(); step(80);
        ok('엔딩 → 마을로 돌아옴', s.scene === 'town' && s.episode === 4 && !s.road);
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
