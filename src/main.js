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
  window.addEventListener('keyup', (e) => held.delete(e.code));
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
  function audioTick(t) {
    const A = WT.Audio, s = WT.Game.state, st = s.ui.story;
    // 불러오기: 로컬은 바로, 배포 사이트는 이미지가 80% 들어오거나 6초가 지나면 (이미지 먼저)
    if (!A.started) { const as = WT.Assets.status(); if (!WT.Assets.useWeb || as.ok / as.all > 0.8 || t > 6) A.load(); }
    let want = null, rate = 1;
    if (st) {
      const p = st.panels[st.i];
      const key = p ? [D.opening, D.ending, D.act2open, D.act2end].indexOf(st.panels) + ':' + st.i : null;
      if (p && key !== lastPanel) {
        lastPanel = key;
        if (p.art === 'curtain') A.jingle('jingle_act_end');
        if (st.panels === D.act2open && st.i === 1) A.play('sfx_clock_midnight'); // 자정 종 12번
        else if (p.art === 'teaser') A.jingle('jingle_tease');
      }
      want = (st.panels === D.opening || st.panels === D.act2open) ? 'bgm_story' : null;
      if (st.panels === D.act2open) rate = 0.9;
    } else {
      lastPanel = null;
      if (s.scene === 'intro') want = 'bgm_house';
      else if (s.scene === 'arena') want = s.boss && s.boss.state !== 'intro' && s.boss.state !== 'defeated' ? 'bgm_boss' : null;
      else if (s.scene === 'house') { want = 'bgm_house'; rate = s.world.musicOn ? 1 : 0.92; }
      else want = s.world.musicOn ? 'bgm_town_awake' : 'bgm_town_sleepy';
    }
    if (s.ui.cutscene || A.held()) want = null; // 그라모 깨어남·징글 동안은 BGM 비움
    A.bgm(want, { rate });
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
  } else if (!/[?&](nointro|selftest)/.test(location.search)) WT.Intro.show();

  let last = performance.now(), seenVersion = -1, wasMusic = false;
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    WT.Game.update(dt, input);
    WT.Render.frame(now / 1000);
    const s = WT.Game.state;
    if (WT.Assets.version !== seenVersion) { seenVersion = WT.Assets.version; if (s.scene === 'house') WT.UI.refreshToolbar(); }
    if (s.world.musicOn !== wasMusic) { wasMusic = s.world.musicOn; document.body.classList.toggle('music', wasMusic); }
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
