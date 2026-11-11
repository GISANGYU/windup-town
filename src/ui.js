// DOM UI: 무성영화 자막 카드 대화창, 집 꾸미기 툴바, 조작 안내, 디버그 패널
(function () {
  const $ = (s) => document.querySelector(s);
  const UI = WT.UI = {};
  let typing = null;

  UI.init = function () {
    $('#card').addEventListener('click', UI.advance);
    $('#btnExit').addEventListener('click', () => { WT.Audio.play('sfx_ui_click'); WT.Game.exitHouse(); });
    $('#btnSnap').addEventListener('click', () => { WT.Game.toggleSnap(); UI.refreshToolbar(); });
    $('#btnDel').addEventListener('click', () => WT.Game.deleteSelected());
    $('#btnFlip').addEventListener('click', () => WT.Game.flipSelected());
    UI.setScene('town');
  };

  // ───────── 대화 ─────────
  // opt: { who, name, mood, lines[], onClose }
  UI.dialog = function (opt) {
    const s = WT.Game.state;
    if (!opt.lines || !opt.lines.length) { if (opt.onClose) opt.onClose(); return; } // 대사가 없으면 열지 않고 넘어감
    s.ui.dialog = Object.assign({ i: 0 }, opt);
    const card = $('#card');
    card.classList.remove('closing');
    card.classList.add('open');
    WT.Audio.play('sfx_dialog_open');
    if (opt.who === 'radio') WT.Audio.play('sfx_radio_static', { delay: 0.05 }); // 라디오 씨는 말 시작마다 지지직
    card.setAttribute('aria-hidden', 'false');
    card.dataset.mood = opt.mood || 'sleepy';
    $('#cardName').textContent = opt.name;
    drawPortrait(opt);
    showLine();
  };
  function drawPortrait(opt) {
    const cv = $('#cardPortrait'), c = cv.getContext('2d');
    c.clearRect(0, 0, cv.width, cv.height);
    const id = `portrait_${opt.who}_${opt.mood}`;
    if (opt.who === 'volt' || opt.who === 'voltSmall' || opt.who === 'toad') { // 3~5막 보스
      const pid = { volt: 'portrait_volt', voltSmall: 'portrait_volt_small', toad: 'portrait_toad' }[opt.who];
      if (WT.Assets.has(pid)) { WT.drawThing(c, pid, null, cv.width / 2, cv.height / 2, { h: cv.height * 0.9, anchor: 'center' }); return; }
      const sid = { volt: 'boss_volt_idle', voltSmall: 'boss_volt_small', toad: 'boss_toad_idle' }[opt.who];
      WT.drawThing(c, sid, opt.who === 'toad' ? WT.PH.toad : WT.PH.volt, cv.width / 2, cv.height * 0.98, { h: cv.height * (opt.who === 'voltSmall' ? 0.6 : 0.95), state: opt.who === 'voltSmall' ? 'small' : 'attack', t: 0 });
      return;
    }
    if (opt.who === 'boss') {
      const pid = opt.mood === 'cuckoo' ? 'portrait_boss_cuckoo' : 'portrait_boss_angry';
      if (WT.Assets.has(pid)) { WT.drawThing(c, pid, null, cv.width / 2, cv.height / 2, { h: cv.height * 0.9, anchor: 'center' }); return; }
      WT.drawThing(c, opt.mood === 'cuckoo' ? 'boss_cuckoo' : 'boss_idle', WT.PH.boss, cv.width / 2, cv.height * 0.98, { h: cv.height * 0.95, pose: opt.mood === 'cuckoo' ? 'cuckoo' : 'idle', t: 0 });
      return;
    }
    const S = WT.Game.state, bat = opt.mood === 'battery';
    const rp = S.npcs.radio || {};
    const pid = { bogle: ['portrait_bogle'], radio: [rp.power === 'wind' ? 'portrait_radio_crank' : 'portrait_radio'],
      lamp: opt.mood === 'shy' ? ['portrait_lamp_shy', 'portrait_lamp_awake'] : S.act3 && S.act3.named ? ['portrait_lamp_awake'] : [] }[opt.who] || [id];
    const mood = bat || opt.mood === 'shy' ? 'awake' : opt.mood;
    const npcId = { gramo: `npc_gramo_${mood}`, pip: `npc_pip_${mood}`, lamp: mood === 'awake' ? 'npc_lamp_on' : 'npc_lamp_off',
      radio: rp.power === 'wind' ? 'npc_radio_crank' : 'npc_radio_idle', bogle: 'player_idle_down', surveyor: 'npc_surveyor_idle' }[opt.who];
    const ph = (ctx, h, o) => WT.PH.portrait(ctx, h, Object.assign({ who: opt.who === 'surveyor' ? 'surveyor' : opt.who, power: opt.who === 'radio' ? rp.power : undefined, crank: opt.who === 'radio' && rp.power === 'wind' }, o));
    c.save();
    if (bat) c.filter = 'grayscale(1) contrast(1.05)';
    const have = pid.find((q) => WT.Assets.has(q));
    if (have) WT.drawThing(c, have, null, cv.width / 2, cv.height / 2, { h: cv.height * 0.9, anchor: 'center' });
    else WT.drawThing(c, npcId, ph, cv.width / 2, cv.height * 0.95, { h: cv.height * 0.85, mood, t: 0 });
    c.restore();
  }
  function showLine() {
    const d = WT.Game.state.ui.dialog;
    const text = d.lines[d.i] || '';
    const el = $('#cardTyped');
    $('#cardText').dataset.line = text;
    $('#card').dataset.typing = 'true';
    $('#cardAction').textContent = '바로 읽기';
    $('#cardProgress').textContent = String(d.i + 1).padStart(2, '0') + ' / ' + String(d.lines.length).padStart(2, '0');
    el.textContent = '';
    clearInterval(typing && typing.timer);
    const speed = d.mood === 'sleepy' ? WT.CFG.typeSleepy : WT.CFG.typeAwake;
    if (d.flat) { // 건전지 말투: 한 번에 다 나오고 글자 소리가 없다
      el.textContent = text; typing = { text, n: text.length, timer: null }; lineReady();
      $('#cardMore').textContent = d.i < d.lines.length - 1 ? '◆' : '■';
      return;
    }
    typing = { text, n: 0, timer: setInterval(() => {
      typing.n++;
      // 글자 출력음: 깨어 있으면 2글자, 졸리면 3글자마다. 공백은 건너뜀
      const sleepy = d.mood === 'sleepy', every = sleepy ? 3 : 2, ch = text[typing.n - 1];
      const blip = ['boss', 'volt', 'toad'].includes(d.who) ? 'sfx_text_blip_boss' : d.who === 'radio' ? (WT.Audio.defs.sfx_text_blip_radio ? 'sfx_text_blip_radio' : 'sfx_text_blip_awake') : sleepy ? 'sfx_text_blip_sleepy' : 'sfx_text_blip_awake';
      if (typing.n % every === 1 && ch && ch.trim()) WT.Audio.play(blip, { rate: 0.9 + Math.random() * 0.2 });
      el.textContent = text.slice(0, typing.n);
      if (typing.n >= text.length) { clearInterval(typing.timer); typing.timer = null; lineReady(); }
    }, speed) };
    $('#cardMore').textContent = d.i < d.lines.length - 1 ? '◆' : '■';
  }
  function lineReady() {
    const d = WT.Game.state.ui.dialog;
    $('#card').dataset.typing = 'false';
    $('#cardAction').textContent = d && d.i < d.lines.length - 1 ? '계속' : '대화 마치기';
  }
  UI.advance = function () {
    const d = WT.Game.state.ui.dialog;
    if (!d) return;
    if (typing && typing.timer) { clearInterval(typing.timer); typing.timer = null; $('#cardTyped').textContent = typing.text; lineReady(); return; }
    d.i++;
    if (d.i < d.lines.length) { WT.Audio.play('sfx_dialog_next'); showLine(); } else UI.closeDialog();
  };
  UI.closeDialog = function () {
    const s = WT.Game.state, d = s.ui.dialog;
    if (!d) return;
    if (typing) clearInterval(typing.timer);
    s.ui.dialog = null;
    const card = $('#card');
    card.classList.add('closing');
    card.setAttribute('aria-hidden', 'true');
    setTimeout(() => { if (!WT.Game.state.ui.dialog) card.classList.remove('open', 'closing'); }, 260);
    if (d.onClose) d.onClose();
  };
  UI.shake = function (k) { WT.Render.shakeT = Math.max(WT.Render.shakeT, k); };
  UI.flash = function () { const f = $('#flash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); };

  // ───────── 장면별 UI ─────────
  UI.setScene = function (scene) {
    document.body.dataset.scene = scene;
    $('#hint').innerHTML = scene === 'town'
      ? '<b>WASD</b> 이동 · <b>Shift</b> 빨리 · <b>Space</b> 점프 · <b>E</b> 상호작용 · <b>M</b> 소리'
      : scene === 'intro' ? ''
      : scene === 'arena' ? '<b>WASD</b> 이동 · <b>Space</b> 점프(링·작은 톱니 회피) · <b>E</b> 과감기'
      : scene === 'road' ? '<b>A D</b> 이동 · <b>Space</b> 점프(길게: 높이) · <b>Q</b> 태엽 ↔ 건전지 · <b>E</b> 장치 · <b>M</b> 소리'
      : '<b>클릭</b> 놓기·선택 · <b>드래그</b> 옮기기 · <b>R</b> 뒤집기 · <b>Delete</b> 삭제 · <b>G</b> 격자 · <b>Esc</b> 취소/나가기';
    UI.refreshToolbar();
  };
  UI.refreshToolbar = function () {
    const s = WT.Game.state;
    if (!s) return;
    const h = s.house, box = $('#furnBtns');
    box.innerHTML = '';
    Object.entries(WT.FURN).forEach(([type, def]) => {
      const b = document.createElement('button');
      const locked = !h.unlocked.includes(type);
      b.className = 'furn' + (h.placing === type ? ' on' : '') + (locked ? ' locked' : '');
      b.disabled = locked;
      b.title = locked ? '퀘스트 보상으로 열림' : `${def.label} (${def.key})`;
      const cv = document.createElement('canvas'); cv.width = 72; cv.height = 64;
      WT.drawThing(cv.getContext('2d'), def.asset, WT.PH[type], 36, 60, { h: 54 });
      b.appendChild(cv);
      const sp = document.createElement('span'); sp.textContent = locked ? '잠김' : `${def.key} ${def.label}`; b.appendChild(sp);
      b.addEventListener('click', () => WT.Game.selectPlacing(type));
      box.appendChild(b);
    });
    $('#btnSnap').classList.toggle('on', h.snap);
    $('#btnDel').disabled = h.selected == null;
    $('#btnFlip').disabled = h.selected == null;
    $('#houseMsg').textContent = h.placing ? `${WT.FURN[h.placing].label}: 바닥을 클릭해 놓기` : h.selected != null ? '선택됨: 드래그로 옮기기 · R 뒤집기 · Delete 삭제' : `놓은 가구 ${h.furniture.length}개`;
  };

  // ───────── 디버그 패널 ─────────
  UI.debug = function () {
    const s = WT.Game.state, el = $('#debug');
    el.hidden = !s.ui.debug;
    if (!s.ui.debug) return;
    const st = WT.Assets.status();
    el.innerHTML = `<b>리소스 ${st.ok}/${st.all}</b>${location.protocol === 'file:' ? '<br><span class="warn">file:// 실행 중 — 자동 자르기·배경 제거 꺼짐</span>' : ''}`
      + (st.raw ? `<br>정리 안 된 이미지 ${st.raw}` : '')
      + (st.missReq.length ? `<br>필수 없음 ${st.missReq.length}<br><small>${st.missReq.join('<br>')}</small>` : '<br>필수 리소스 완료')
      + `<br><small>F8 다시 불러오기 · \` 닫기</small>`;
  };
})();
